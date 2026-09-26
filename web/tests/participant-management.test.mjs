import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';

const alice = '00000000-0000-4000-8000-000000000001';
const bob = '00000000-0000-4000-8000-000000000002';
const charlie = '00000000-0000-4000-8000-000000000003';
const migration = name => readFile(new URL(`../supabase/migrations/${name}.sql`, import.meta.url), 'utf8');
async function database(applyParticipants = true) {
  const db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth, public to authenticated, anon;`);
  for (const file of ['202609120001_initial_schema','202609200001_september_mvp','202609200002_score_entry','202609260001_tournament_management']) await db.exec(await migration(file));
  await db.exec('grant select,insert,update,delete on all tables in schema public to authenticated,anon');
  await db.query("insert into auth.users(id,email) values ($1,'alice@example.test'),($2,'bob@example.test'),($3,'charlie@example.test')", [alice,bob,charlie]);
  await db.query("update public.profiles set display_name='Bob Jogador' where id=$1",[bob]);
  await db.query(`insert into public.personal_scores(player_id,occurred_at,score) values
    ($1,'2020-01-01T15:00:00Z',20000),($2,'2020-01-01T15:00:00Z',15000),
    ($1,'2020-01-02T15:00:00Z',18000),($2,'2020-01-02T15:00:00Z',10000)`,[alice,bob]);
  await login(db,alice);
  const target = (await db.query("select public.create_tournament('Primeiro','2020-01-01','2020-01-03') id")).rows[0].id;
  const other = (await db.query("select public.create_tournament('Segundo','2020-01-01','2020-01-03') id")).rows[0].id;
  await db.exec('reset role');
  await db.query("insert into public.tournament_participants(tournament_id,player_id,eligible_from) values ($1,$3,'2020-01-01'),($2,$3,'2020-01-01')",[target,other,alice]);
  await db.query("select private.refresh_tournament($1,'2020-01-04')",[target]);
  await db.query("select private.refresh_tournament($1,'2020-01-04')",[other]);
  const original = await state(db);
  if (applyParticipants) await db.exec(await migration('202609260002_participant_management'));
  assert.deepEqual(await state(db),original,'migration must not mutate existing business data');
  return {db,target,other};
}

const localBackup = new URL('../../backups/sprint-4/before-s4-02-september-v1.json', import.meta.url);
test('cópia local de setembro: migração preserva dados e cálculo integralmente', { skip: !existsSync(localBackup) }, async () => {
  const {db} = await database(false);
  try {
    const backup=JSON.parse(await readFile(localBackup,'utf8'));
    const checksum=(await db.query('select md5($1::jsonb::text) checksum',[JSON.stringify(backup.snapshot)])).rows[0].checksum;
    assert.equal(checksum,'3d847140e955fd6feaaffab3b252dbe8');
    const snapshot=backup.snapshot;
    const ids=new Set([...backup.players,...Object.values(snapshot.tournament).map(t=>t.organizer_id)]);
    for (const id of ids) await db.query('insert into auth.users(id,email) values($1,$2)',[id,`${id}@fixture.invalid`]);
    for (const profile of Object.values(snapshot.profiles)) {
      await db.query('update public.profiles set display_name=$2,created_at=$3 where id=$1',[profile.id,profile.display_name,profile.created_at]);
    }
    await db.query(`insert into public.tournaments select * from jsonb_populate_recordset(null::public.tournaments,$1::jsonb)`,[JSON.stringify(Object.values(snapshot.tournament))]);
    await db.query(`insert into public.tournament_participants select * from jsonb_populate_recordset(null::public.tournament_participants,$1::jsonb)`,[JSON.stringify(Object.values(snapshot.participants))]);
    await db.query(`insert into public.tournament_excluded_dates select * from jsonb_populate_recordset(null::public.tournament_excluded_dates,$1::jsonb)`,[JSON.stringify(Object.values(snapshot.excluded_dates))]);
    await db.query(`insert into public.personal_scores(id,player_id,score,occurred_at,created_at,updated_at,source)
      select id,player_id,score,occurred_at,created_at,updated_at,source from jsonb_populate_recordset(null::public.personal_scores,$1::jsonb)`,[JSON.stringify(Object.values(snapshot.personal_scores))]);
    await db.query(`insert into public.tournament_score_results select * from jsonb_populate_recordset(null::public.tournament_score_results,$1::jsonb)`,[JSON.stringify(Object.values(snapshot.stored_results))]);
    // Compare hashes only: never print players' private data in test failures.
    const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
    const calculation=async ()=>(await db.query('select * from private.calculate_tournament($1,$2) order by player_id,played_on',[backup.tournament_id,backup.as_of])).rows;
    const before=hash(await state(db)); const calculatedBefore=hash(await calculation());
    await db.exec(await migration('202609260002_participant_management'));
    assert.equal(hash(await state(db)),before,'migration changed captured business data');
    assert.equal(hash(await calculation()),calculatedBefore,'migration changed reference calculation');
  } finally { await db.close(); }
});
async function login(db,id,role='authenticated') {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);
  await db.exec(`set role ${role}`);
}
async function state(db) {
  return (await db.query(`select
    (select jsonb_agg(to_jsonb(s) order by id) from public.personal_scores s) scores,
    (select jsonb_agg(to_jsonb(p) order by id) from public.profiles p) profiles,
    (select jsonb_agg(to_jsonb(t) order by id) from public.tournaments t) tournaments,
    (select jsonb_agg(to_jsonb(p) order by tournament_id,player_id) from public.tournament_participants p) participants,
    (select jsonb_agg(to_jsonb(r) order by id) from public.tournament_score_results r) results`)).rows[0];
}

test('seleção por nome/email restrita ao organizador, paginação e contas já vinculadas', async () => {
  const {db,target}=await database();
  try {
    await login(db,alice);
    const list = async (term='',page=0) => (await db.query('select public.list_participant_candidates($1,$2,$3) data',[target,term,page])).rows[0].data;
    assert.deepEqual((await list('BOB')).users,[{id:bob,name:'Bob Jogador',email:'bob@example.test'}]);
    assert.equal((await list('charlie@')).users[0].id,charlie);
    assert.equal((await list('%')).users.length,0);
    assert.equal((await list('alice')).users.length,0);
    await assert.rejects(list('',-1),/invalid_search/);
    await db.exec('reset role');
    await db.exec(`insert into auth.users(id,email) select gen_random_uuid(),'extra'||n||'@example.test' from generate_series(1,30) n`);
    await login(db,alice);
    const first=await list(); const second=await list('',1);
    assert.equal(first.users.length,25); assert.equal(first.has_more,true);
    assert.equal(second.users.length,7); assert.equal(second.has_more,false);
    assert.equal(new Set([...first.users,...second.users].map(u=>u.id)).size,32);
    await login(db,bob);
    await assert.rejects(list(),/tournament_not_allowed/);
    await assert.rejects(db.query('select public.get_managed_participants($1)',[target]),/tournament_not_allowed/);
    for (const sql of [
      'select public.add_tournament_participant($1,$2,\'2020-01-01\')',
      'select public.update_tournament_participant($1,$2,\'2020-01-01\')',
      'select public.remove_tournament_participant($1,$2)',
    ]) await assert.rejects(db.query(sql,[target,bob]),/tournament_not_allowed/);
    await assert.rejects(db.query('select public.complete_tournament_history($1)',[target]),/tournament_not_allowed/);
    await assert.rejects(db.query('select * from private.participant_changes'),/permission denied/);
    await login(db,'','anon'); await assert.rejects(list(),/permission denied/);
    await login(db,''); await assert.rejects(list(),/authentication_required/);
  } finally { await db.close(); }
});

test('ingresso retroativo, elegibilidade e remoção recalculam somente o alvo e preservam brutos', async () => {
  const {db,target,other}=await database();
  try {
    const before=await state(db);
    await login(db,alice);
    await assert.rejects(db.query('select public.add_tournament_participant($1,$2,null)',[target,bob]),/invalid_eligibility/);
    await assert.rejects(db.query("select public.add_tournament_participant($1,$2,'2019-12-31')",[target,bob]),/invalid_eligibility/);
    await db.query("select public.add_tournament_participant($1,$2,'2020-01-01')",[target,bob]);
    const results = async () => (await db.query('select player_id,played_on::text,raw_score,applied_score from public.tournament_score_results where tournament_id=$1 order by player_id,played_on',[target])).rows;
    assert.equal((await results()).find(r=>r.player_id===alice && r.played_on==='2020-01-01').applied_score,5000);
    assert.equal((await results()).find(r=>r.player_id===bob && r.played_on==='2020-01-03').applied_score,0);
    await assert.rejects(db.query("select public.add_tournament_participant($1,$2,'2020-01-02')",[target,bob]),/participant_exists/);
    await db.query('select public.complete_tournament_history($1)',[target]);
    assert.equal((await results()).find(r=>r.player_id===bob && r.played_on==='2020-01-03').applied_score,-2500);
    await db.query("select public.update_tournament_participant($1,$2,'2020-01-02')",[target,bob]);
    assert.ok(!(await results()).some(r=>r.player_id===bob && r.played_on==='2020-01-01'));
    assert.equal((await results()).find(r=>r.player_id===alice && r.played_on==='2020-01-01').applied_score,0);
    await db.query("select public.update_tournament_participant($1,$2,'2020-01-01')",[target,bob]);
    assert.equal((await results()).find(r=>r.player_id===alice && r.played_on==='2020-01-01').applied_score,5000);
    await db.query('select public.remove_tournament_participant($1,$2)',[target,bob]);
    assert.ok(!(await results()).some(r=>r.player_id===bob));
    assert.equal((await results()).find(r=>r.player_id===alice && r.played_on==='2020-01-01').applied_score,0);
    await db.query('select public.remove_tournament_participant($1,$2)',[target,bob]);
    await db.exec('reset role');
    const after=await state(db);
    assert.deepEqual(after.scores,before.scores); assert.deepEqual(after.profiles,before.profiles);
    assert.deepEqual(after.results.filter(r=>r.tournament_id===other),before.results.filter(r=>r.tournament_id===other));
    const changes=(await db.query('select * from private.participant_changes')).rows;
    assert.equal(changes.length,4); assert.ok(changes.every(r=>r.actor_id===alice));
    assert.ok((await db.query("select * from private.result_changes where new_data='null'::jsonb")).rows.length>0);
    await login(db,alice);
    await db.query("select public.add_tournament_participant($1,$2,'2020-01-01')",[target,bob]);
    assert.equal((await results()).find(r=>r.player_id===bob && r.played_on==='2020-01-03').applied_score,-2500);
    await login(db,bob);
    assert.equal((await db.query('select id from public.tournaments where id=$1',[target])).rows.length,1);
    await assert.rejects(db.query('select public.list_participant_candidates($1)',[target]),/tournament_not_allowed/);
    await assert.rejects(db.query("insert into public.tournament_participants(tournament_id,player_id,eligible_from) values($1,$2,'2020-01-01')",[target,charlie]),/row-level security/);
    await login(db,alice); await db.query('select public.close_tournament($1)',[target]);
    const frozen=await results();
    await assert.rejects(db.query("select public.add_tournament_participant($1,$2,'2020-01-01')",[target,charlie]),/tournament_closed/);
    await assert.rejects(db.query("select public.update_tournament_participant($1,$2,'2020-01-02')",[target,bob]),/tournament_closed/);
    await assert.rejects(db.query('select public.remove_tournament_participant($1,$2)',[target,bob]),/tournament_closed/);
    await assert.rejects(db.query('select public.complete_tournament_history($1)',[target]),/tournament_closed/);
    assert.deepEqual(await results(),frozen);
  } finally { await db.close(); }
});
