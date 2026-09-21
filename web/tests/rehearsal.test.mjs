import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
const owner = 'b3afc09f-8eb4-4d1d-ab46-0113b3a7968d';
const other = '00000000-0000-4000-8000-000000000002';
const target = '20260900-0000-4000-8000-000000000001';
const read = file => readFile(new URL(`../supabase/${file}`,import.meta.url),'utf8');
async function setup() {
  const db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;`);
  for (const file of ['202609120001_initial_schema.sql','202609200001_september_mvp.sql','202609200002_score_entry.sql']) {
    await db.exec(await read(`migrations/${file}`));
  }
  await db.query("insert into auth.users(id,email) values($1,'owner@example.test'),($2,'other@example.test')",[owner,other]);
  await db.query('select private.provision_september($1)',[owner]);
  // Existing data must survive the full test, including its original UUID/timestamps.
  await db.query('select private.add_september_participant($1,$2)',[owner,'Dono do produto']);
  await db.query('select private.load_september_score($1,$2,$3)',[owner,'2026-09-01',17000]);
  return db;
}
async function snapshot(db) {
  const state = {};
  for (const table of ['profiles','personal_scores','tournament_participants','tournament_score_results','tournaments']) {
    state[table] = (await db.query(`select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]') as data from public.${table} t`)).rows[0].data;
  }
  return state;
}
test('ensaio real: carga, conciliacao e rollback restauram integralmente os dados anteriores', async () => {
  const db = await setup();
  try {
    const before = await snapshot(db);
    await db.exec(await read('rehearsal/01-load.sql'));
    const results = await db.exec(await read('rehearsal/02-verify.sql'));
    assert.equal(results[0].rows.length,2);
    assert.ok(results[0].rows.every(r=>r.todos_os_dias_corretos && r.historico_concluido_para_teste));
    assert.equal((await db.query('select count(*)::int n from public.tournament_score_results where played_on in ($1,$2,$3)', ['2026-09-05','2026-09-06','2026-09-07'])).rows[0].n,0);
    await db.exec(await read('rehearsal/03-rollback.sql'));
    assert.deepEqual(await snapshot(db),before);
    await db.exec(await read('rehearsal/03-rollback.sql'));
    assert.deepEqual(await snapshot(db),before);
    assert.equal((await db.query('select history_ready from public.tournaments where id=$1',[target])).rows[0].history_ready,false);
  } finally { await db.close(); }
});
test('rollback recusa descartar uma pontuacao alterada apos a carga',async()=>{
  const db = await setup();
  try {
    await db.exec(await read('rehearsal/01-load.sql'));
    await db.query("update public.personal_scores set score=19999 where player_id=$1 and played_on='2026-09-01'",[owner]);
    await assert.rejects(db.exec(await read('rehearsal/03-rollback.sql')),/Dados alterados depois/);
    await db.exec('rollback');
    assert.equal((await db.query("select score from public.personal_scores where player_id=$1 and played_on='2026-09-01'",[owner])).rows[0].score,19999);
  } finally { await db.close(); }
});

test('backup do formulario restaura pontuacao preexistente e remove somente os novos testes',async()=>{
  const db=await setup();
  const second='af91b88b-46c0-4c8a-9dd3-be5787b90517';
  try {
    await db.query("insert into auth.users(id,email) values($1,'second@example.test')",[second]);
    const today=(await db.query("select (now() at time zone 'America/Sao_Paulo')::date::text as day")).rows[0].day;
    await db.query("insert into public.personal_scores(player_id,occurred_at,score,source) values($1,($2::date+time '12:00') at time zone 'America/Sao_Paulo',9999,'manual_history') on conflict(player_id,played_on) do update set score=9999",[owner,today]);
    await db.query('select private.refresh_tournament($1,$2)',[target,today]);
    const before=await snapshot(db);
    await db.exec(await read('rehearsal/04-backup-form.sql'));
    await db.query("update public.personal_scores set score=12000,source='player' where player_id=$1 and played_on=$2",[owner,today]);
    await db.query("insert into public.personal_scores(player_id,occurred_at,score,source) values($1,($2::date+time '12:00') at time zone 'America/Sao_Paulo',15000,'player')",[second,today]);
    await db.query('select private.refresh_tournament($1,$2)',[target,today]);
    await db.exec(await read('rehearsal/06-restore-form.sql'));
    assert.deepEqual(await snapshot(db),before);
    await db.exec(await read('rehearsal/06-restore-form.sql'));
    assert.deepEqual(await snapshot(db),before);
  } finally {await db.close();}
});

test('roteiro remoto de permissoes verifica papeis e reverte a transacao',async()=>{
  const db=await setup();
  const second='af91b88b-46c0-4c8a-9dd3-be5787b90517';
  try {
    await db.exec(`create or replace function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth, public to authenticated, anon;
      grant execute on function auth.uid() to authenticated, anon;
      grant select,insert,update,delete on all tables in schema public to authenticated,anon;`);
    await db.query("insert into auth.users(id,email) values($1,'second@example.test')",[second]);
    await db.exec(await read('rehearsal/04-backup-form.sql'));
    await db.query(`insert into public.personal_scores(player_id,occurred_at,score)
      values($1,now(),12000),($2,now(),15000)
      on conflict(player_id,played_on) do update set score=excluded.score`,[owner,second]);
    const before=await snapshot(db);
    const output=await db.exec(await read('rehearsal/05-check-permissions.sql'));
    assert.equal(output.at(-1).rows[0].resultado,'APROVADO');
    assert.deepEqual(await snapshot(db),before);
  } finally {await db.close();}
});
