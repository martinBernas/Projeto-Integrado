import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const alice = '00000000-0000-4000-8000-000000000001';
const bob = '00000000-0000-4000-8000-000000000002';
async function database() {
  const db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth, public to authenticated, anon;
    grant execute on function auth.uid() to authenticated, anon;`);
  for (const file of ['202609120001_initial_schema.sql', '202609200001_september_mvp.sql', '202609200002_score_entry.sql', '202609260001_tournament_management.sql']) {
    await db.exec(await readFile(new URL(`../supabase/migrations/${file}`, import.meta.url), 'utf8'));
  }
  await db.exec('grant select, insert, update, delete on all tables in schema public to authenticated, anon');
  await db.query("insert into auth.users(id,email) values ($1,'alice@example.test'),($2,'bob@example.test')", [alice, bob]);
  return db;
}
async function login(db, id, role = 'authenticated') {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
  await db.exec(`set role ${role}`);
}
async function create(db, start = '2020-01-01', end = '2020-01-03') {
  return (await db.query("select public.create_tournament(' Torneio teste ', $1, $2) as id", [start, end])).rows[0].id;
}

test('criação fixa as regras, valida campos e mantém isolamento e auditoria', async () => {
  const db = await database();
  try {
    await login(db, alice);
    const id = await create(db);
    const row = (await db.query('select * from public.tournaments where id=$1', [id])).rows[0];
    assert.equal(row.organizer_id, alice);
    assert.equal(row.name, 'Torneio teste');
    assert.equal(row.scoring_mode, 'relative_to_lowest');
    assert.equal(row.absence_penalty, -2500);
    assert.equal(row.weekly_schedule, 'monday_to_friday');
    assert.equal(row.timezone, 'America/Sao_Paulo');
    assert.equal(row.history_ready, false);
    assert.equal(row.closed_at, null);
    for (const args of [[null, '2020-01-01', '2020-01-03'], ['ab', '2020-01-01', '2020-01-03'], ['Teste', null, '2020-01-03'], ['Teste', '2020-01-04', '2020-01-03'], ['Teste', '2020-01-01', 'infinity']]) {
      await assert.rejects(db.query('select public.create_tournament($1,$2,$3)', args), /invalid_/);
    }
    await db.query("select public.update_tournament($1,'Novo nome','2020-02-01','2020-02-04')", [id]);
    assert.equal((await db.query('select name from public.tournaments')).rows[0].name, 'Novo nome');
    assert.equal((await db.query('update public.tournaments set absence_penalty=0 returning id')).rows.length, 0);
    assert.equal((await db.query('delete from public.tournaments returning id')).rows.length, 0);
    await assert.rejects(db.query('select * from private.tournament_changes'), /permission denied/);
    await login(db, bob);
    assert.equal((await db.query('select * from public.tournaments')).rows.length, 0);
    await assert.rejects(db.query("select public.update_tournament($1,'Invasao','2020-01-01','2020-01-03')", [id]), /tournament_not_allowed/);
    await assert.rejects(db.query('select public.close_tournament($1)', [id]), /tournament_not_allowed/);
    await login(db, '', 'anon');
    await assert.rejects(create(db), /permission denied/);
    await login(db, '');
    await assert.rejects(create(db), /authentication_required/);
    await db.exec('reset role');
    const logs = (await db.query('select actor_id,old_data,new_data from private.tournament_changes order by id')).rows;
    assert.equal(logs.length, 2);
    assert.equal(logs[1].actor_id, alice);
    assert.equal(logs[1].old_data.name, 'Torneio teste');
  } finally { await db.close(); }
});

test('encerramento exige fim e histórico pronto, congela resultados e é idempotente', async () => {
  const db = await database();
  try {
    await login(db, alice);
    const id = await create(db);
    const other = await create(db);
    const today = (await db.query("select (now() at time zone 'America/Sao_Paulo')::date::text d")).rows[0].d;
    const current = await create(db, today, today);
    await assert.rejects(db.query('select public.close_tournament($1)', [current]), /tournament_not_finished/);
    await db.exec('reset role');
    for (const target of [id, other]) {
      await db.query("insert into public.tournament_participants(tournament_id,player_id,eligible_from) values ($1,$2,'2020-01-01')", [target, alice]);
    }
    await db.query("insert into public.personal_scores(player_id,occurred_at,score) values ($1,'2020-01-01T15:00:00Z',12000)", [alice]);
    await login(db, alice);
    await assert.rejects(db.query("select public.update_tournament($1,'Nome valido','2020-01-02','2020-01-03')", [id]), /period_locked/);
    await db.query("select public.update_tournament($1,'Nome alterado','2020-01-01','2020-01-03')", [id]);
    await assert.rejects(db.query('select public.close_tournament($1)', [id]), /history_not_ready/);
    await db.exec('reset role');
    await db.query('update public.tournaments set history_ready=true where id in ($1,$2)', [id, other]);
    await login(db, alice);
    await db.query('select public.close_tournament($1)', [id]);
    const closed = (await db.query('select closed_at from public.tournaments where id=$1', [id])).rows[0].closed_at;
    const results = (await db.query('select * from public.tournament_score_results where tournament_id=$1 order by played_on', [id])).rows;
    assert.equal(results.length, 3);
    assert.ok(results.every(r => !r.provisional));
    assert.equal(results[1].applied_score, -2500);
    await db.query('select public.close_tournament($1)', [id]);
    assert.deepEqual((await db.query('select closed_at from public.tournaments where id=$1', [id])).rows[0].closed_at, closed);
    await assert.rejects(db.query("select public.update_tournament($1,'Outro nome','2020-01-01','2020-01-03')", [id]), /tournament_closed/);
    await db.query('select public.submit_personal_score($1,10000)', [today]);
    await db.exec('reset role');
    await db.query('update public.personal_scores set score=15000 where player_id=$1', [alice]);
    await db.query('select private.refresh_tournament($1,$2)', [id, today]);
    await db.query('select private.refresh_tournament($1,$2)', [other, today]);
    assert.deepEqual((await db.query('select * from public.tournament_score_results where tournament_id=$1 order by played_on', [id])).rows, results);
    assert.equal((await db.query('select raw_score from public.tournament_score_results where tournament_id=$1 order by played_on', [other])).rows[0].raw_score, 15000);
    // Membership access and the final results remain available after closing.
    await login(db, alice);
    assert.equal((await db.query('select id from public.tournaments where id=$1', [id])).rows.length, 1);
  } finally { await db.close(); }
});
