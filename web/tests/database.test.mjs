import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const tournament = '20260900-0000-4000-8000-000000000001';
const alice = '00000000-0000-4000-8000-000000000001';
const bob = '00000000-0000-4000-8000-000000000002';
const outsider = '00000000-0000-4000-8000-000000000003';

async function database() {
  const db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth;
    create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth, public to authenticated, anon;
    grant execute on function auth.uid() to authenticated, anon;
  `);
  for (const file of ['202609120001_initial_schema.sql', '202609200001_september_mvp.sql', '202609200002_score_entry.sql']) {
    await db.exec(await readFile(new URL(`../supabase/migrations/${file}`, import.meta.url), 'utf8'));
  }
  await db.exec(`grant select, insert, update, delete on all tables in schema public to authenticated, anon;`);
  await db.query(`insert into auth.users(id, email) values ($1,'alice@example.test'),($2,'bob@example.test'),($3,'outsider@example.test')`, [alice, bob, outsider]);
  await db.query('select private.provision_september($1)', [alice]);
  await db.query(`insert into public.tournament_participants(tournament_id,player_id,eligible_from)
    values ($1,$2,'2026-09-01'),($1,$3,'2026-09-01')`, [tournament, alice, bob]);
  await db.query('update public.tournaments set history_ready = true where id = $1', [tournament]);
  return db;
}
async function score(db, player, day, value) {
  await db.query(`insert into public.personal_scores(player_id,occurred_at,score,source)
    values ($1,($2::date + time '12:00') at time zone 'America/Sao_Paulo',$3,'manual_history')`, [player, day, value]);
}
async function login(db, id, role = 'authenticated') {
  await db.query(`select set_config('request.jwt.claim.sub',$1,false)`, [id]);
  await db.exec(`set role ${role}`);
}

test('provisionamento repetível e calendário de setembro sem feriado ou fins de semana', async () => {
  const db = await database();
  try {
    await db.query('select private.provision_september($1)', [alice]);
    assert.equal((await db.query('select count(*)::int n from public.tournaments')).rows[0].n, 1);
    assert.equal((await db.query('select count(*)::int n from public.tournament_excluded_dates')).rows[0].n, 1);
    const { rows } = await db.query('select distinct played_on::text from private.calculate_tournament($1,$2) order by 1', [tournament, '2026-10-02']);
    assert.equal(rows.length, 21);
    assert.equal(rows[0].played_on, '2026-09-01');
    assert.equal(rows.at(-1).played_on, '2026-09-30');
    for (const excluded of ['2026-08-31','2026-09-05','2026-09-06','2026-09-07','2026-10-01']) {
      assert.ok(!rows.some(r => r.played_on === excluded));
    }
  } finally { await db.close(); }
});

test('diferenças, empate no menor, ausência, dia aberto e ausência de positivos', async () => {
  const db = await database();
  try {
    await score(db, alice, '2026-09-01', 20002);
    await score(db, bob, '2026-09-01', 16668);
    await score(db, alice, '2026-09-02', 12000);
    await score(db, bob, '2026-09-02', 12000);
    await score(db, alice, '2026-09-03', 0);
    await score(db, bob, '2026-09-03', 15000);
    await score(db, alice, '2026-09-07', 25000);
    const { rows } = await db.query('select *, played_on::text as day from private.calculate_tournament($1,$2)', [tournament, '2026-09-08']);
    const result = (player, day) => rows.find(r => r.player_id === player && r.day === day);
    assert.equal(result(alice, '2026-09-01').applied_score, 3334);
    assert.equal(result(bob, '2026-09-01').applied_score, 0);
    assert.equal(result(alice, '2026-09-02').applied_score, 0);
    assert.equal(result(bob, '2026-09-02').applied_score, 0);
    assert.equal(result(alice, '2026-09-03').applied_score, -2500);
    assert.equal(result(bob, '2026-09-04').applied_score, -2500);
    assert.equal(result(bob, '2026-09-04').rule_snapshot.minimum_positive, null);
    assert.equal(result(bob, '2026-09-08').result_kind, 'pending');
    assert.equal(result(bob, '2026-09-08').applied_score, 0);
    assert.ok(rows.every(r => r.day <= '2026-09-08' && r.day !== '2026-09-07'));
  } finally { await db.close(); }
});

test('recálculo idempotente e alteração administrativa preservada no histórico', async () => {
  const db = await database();
  try {
    await db.query('select private.refresh_tournament($1,$2)', [tournament,'2026-09-03']);
    const count = async () => (await db.query('select count(*)::int n from private.result_changes')).rows[0].n;
    const before = await count();
    await db.query('select private.refresh_tournament($1,$2)', [tournament,'2026-09-03']);
    assert.equal(await count(), before);
    await score(db, alice, '2026-09-01', 20000);
    await db.query('select private.refresh_tournament($1,$2)', [tournament,'2026-09-03']);
    assert.ok(await count() > before);
    assert.equal((await db.query('select count(*)::int n from private.score_changes')).rows[0].n, 1);
    await assert.rejects(score(db, alice, '2026-09-01', 22000), /unique constraint/);
  } finally { await db.close(); }
});

test('RLS sem recursão, isolamento de resultados e bloqueio de escrita direta', async () => {
  const db = await database();
  try {
    const auditTables = await db.query("select relname, relrowsecurity from pg_class where relnamespace = 'private'::regnamespace and relname in ('score_changes', 'result_changes')");
    assert.equal(auditTables.rows.length, 2);
    assert.ok(auditTables.rows.every(table => table.relrowsecurity));
    await score(db, alice, '2026-09-01', 20000);
    await login(db, bob);
    await assert.rejects(db.query('select * from private.score_changes'), /permission denied/);
    await assert.rejects(db.query('select * from private.result_changes'), /permission denied/);
    assert.equal((await db.query('select * from public.tournaments')).rows.length, 1);
    assert.equal((await db.query('select * from public.tournament_participants')).rows.length, 2);
    assert.equal((await db.query('select * from public.personal_scores')).rows.length, 0);
    assert.equal((await db.query('select public.get_september_dashboard() as data')).rows[0].data.access, true);
    await assert.rejects(db.query('select private.provision_september($1)', [bob]), /permission denied/);
    await assert.rejects(score(db, alice, '2026-09-02', 10000), /row-level security/);
    assert.equal((await db.query("update public.tournaments set absence_penalty = 0 returning id")).rows.length, 0);
    await db.exec('reset role');
    await login(db, outsider);
    for (const table of ['tournaments','tournament_participants','tournament_excluded_dates','tournament_score_results']) {
      assert.equal((await db.query(`select * from public.${table}`)).rows.length, 0);
    }
    assert.equal((await db.query('select public.get_september_dashboard() as data')).rows[0].data.access, false);
    await db.exec('reset role');
    await login(db, '', 'anon');
    await assert.rejects(db.query('select public.get_september_dashboard()'), /permission denied/);
  } finally { await db.close(); }
});

test('lançamento autenticado: limites, data, identidade, duplicidade e correção', async () => {
  const db = await database();
  try {
    const today = (await db.query("select (now() at time zone 'America/Sao_Paulo')::date::text as day")).rows[0].day;
    await login(db, alice);
    await assert.rejects(db.query('select public.submit_personal_score($1,$2)', [today, -1]), /invalid_score/);
    await assert.rejects(db.query('select public.submit_personal_score($1,$2)', [today, 25001]), /invalid_score/);
    await assert.rejects(db.query('select public.submit_personal_score($1,$2)', ['2020-01-01', 10000]), /current_day_only/);
    await assert.rejects(db.query('select public.submit_personal_score($1,$2)', [null, 10000]), /current_day_only/);
    await db.query('select public.submit_personal_score($1,$2)', [today, 12000]);
    await db.query('select public.submit_personal_score($1,$2)', [today, 15000]);
    const { rows } = await db.query('select player_id,score from public.personal_scores');
    assert.deepEqual(rows, [{ player_id: alice, score: 15000 }]);
    await db.exec('reset role');
    await login(db, bob);
    await db.query('select public.submit_personal_score($1,$2)', [today, 10000]);
    assert.deepEqual((await db.query('select player_id,score from public.personal_scores')).rows, [{ player_id: bob, score: 10000 }]);
    await assert.rejects(db.query('select private.complete_september_history()'), /permission denied/);
    await db.exec('reset role');
    assert.equal((await db.query('select count(*)::int n from private.score_changes')).rows[0].n, 3);
  } finally { await db.close(); }
});

test('histórico incompleto não penaliza; carga é idempotente e conclusão ativa ausências', async () => {
  const db = await database();
  try {
    await db.query('select private.add_september_participant($1,$2)', [alice, 'Alice']);
    await db.query('select private.load_september_score($1,$2,$3)', [alice, '2026-09-01', 20002]);
    await db.query('select private.load_september_score($1,$2,$3)', [bob, '2026-09-01', 16668]);
    await db.query('select private.load_september_score($1,$2,$3)', [bob, '2026-09-01', 16668]);
    assert.equal((await db.query('select count(*)::int n from public.personal_scores')).rows[0].n, 2);
    const query = 'select * from private.calculate_tournament($1,$2)';
    const initial = (await db.query(query, [tournament, '2026-09-03'])).rows;
    assert.ok(initial.every(r => r.provisional && r.applied_score >= 0));
    assert.ok(initial.some(r => r.result_kind === 'pending'));
    await db.query('select private.complete_september_history()');
    const complete = (await db.query(query, [tournament, '2026-09-03'])).rows;
    assert.ok(complete.some(r => r.applied_score === -2500));
    await assert.rejects(db.query('select private.load_september_score($1,$2,$3)', [alice, '2026-08-31', 10000]), /fora do periodo/);
    await assert.rejects(db.query('select private.load_september_score($1,$2,$3)', [outsider, '2026-09-01', 10000]), /Vincule/);
    const log = (await db.query('select count(*)::int n from private.score_changes')).rows[0].n;
    assert.equal(log, 2);
  } finally { await db.close(); }
});
