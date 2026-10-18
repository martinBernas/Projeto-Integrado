import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
const owner='00000000-0000-4000-8000-000000000001',player='00000000-0000-4000-8000-000000000002',other='00000000-0000-4000-8000-000000000003',outsider='00000000-0000-4000-8000-000000000004';
const migration='202610180005_notification_workspaces.sql';
const sql=f=>readFile(new URL(`../supabase/${f}`,import.meta.url),'utf8');
async function login(db,id,role='authenticated') {await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id??'']);await db.exec(`set role ${role}`);}
async function setup(apply=true){
 const db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;
 create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth,public to anon,authenticated;`);
 for(const f of (await readdir(new URL('../supabase/migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')&&f<migration).sort())await db.exec(await sql(`migrations/${f}`));
 await db.exec('grant select,insert,update,delete on all tables in schema public to anon,authenticated');
 for(const [id,name] of [[owner,'Organizador'],[player,'Jogador'],[other,'Outro'],[outsider,'Externo']])await db.query('insert into auth.users(id,email,raw_user_meta_data) values($1,$2,$3)',[id,`${name}@test`,JSON.stringify({display_name:name})]);
 const ids=[];
 for(const organizer of [owner,other]){
  await login(db,organizer);const id=(await db.query("select public.create_tournament('Notificações teste','2020-01-01','2020-01-02') id")).rows[0].id;ids.push(id);
  for(const p of [owner,player,other])await db.query("select public.add_tournament_participant($1,$2,'2020-01-01')",[id,p]);
 }
 await db.exec('reset role');await db.query("insert into public.personal_scores(player_id,occurred_at,score) values($1,'2020-01-01 15:00Z',15000),($2,'2020-01-01 15:00Z',10000)",[owner,player]);
 await login(db,player);await db.query("select public.submit_retroactive_score('2020-01-01',8000,'Corrigir digitação')");
 const score=(await db.query("select id from public.personal_scores where player_id=$1",[player])).rows[0].id;
 await login(db,owner);const audit=(await db.query("select public.request_score_audit($1,$2,'Conferir partida') id",[ids[0],score])).rows[0].id;
 if(apply){await db.exec('reset role');await db.exec(await sql(`migrations/${migration}`));}
 return {db,ids,audit,score};
}
async function notifications(db){return (await db.query('select public.get_tournament_notifications() d')).rows[0].d;}
async function listing(db,name,page=0){return (await db.query(`select public.${name}($1) d`,[page])).rows[0].d;}
async function snapshot(db){
 await db.exec('reset role');const tables=['public.tournaments','public.personal_scores','public.tournament_participants','public.tournament_rule_versions','public.tournament_score_results','private.score_changes','private.result_changes','private.score_audits','private.audit_electors','private.audit_votes','private.audit_events','private.retroactive_score_changes','private.score_change_decisions','private.tournament_score_inputs'];
 const state={};for(const table of tables)state[table]=(await db.query(`select coalesce(jsonb_agg(r order by r::text),'[]') d from (select to_jsonb(t) r from ${table} t) rows`)).rows[0].d;return state;
}
test('notification migration preserves live pending changes/audits and scoped lists enforce role and ownership before pagination',async()=>{
 const {db,ids}=await setup(false);try{
  const before=await snapshot(db);await db.exec(await sql(`migrations/${migration}`));assert.deepEqual(await snapshot(db),before);
  await login(db,owner);await db.query("select public.submit_retroactive_score('2020-01-01',16000,'Meu ajuste pessoal')");
  const personal=await listing(db,'get_personal_score_changes');assert.equal(personal.changes.length,1);assert.equal(personal.changes[0].player_id,owner);assert.equal(personal.changes[0].decisions.length,2);assert.ok(personal.changes[0].decisions.every(d=>!d.can_review));
  const managed=await listing(db,'get_managed_score_changes');assert.equal(managed.changes.length,2);assert.ok(managed.changes.every(c=>c.decisions.length===1&&c.decisions[0].tournament_id===ids[0]));
  assert.ok(managed.changes.every(c=>c.decisions[0].can_review));
  await db.exec('reset role');const otherScore=(await db.query("insert into public.personal_scores(player_id,occurred_at,score) values($1,'2020-01-01 15:00Z',20000) returning id",[other])).rows[0].id;
  for(let i=0;i<52;i++){
   const c=(await db.query("insert into private.retroactive_score_changes(player_id,personal_score_id,played_on,new_score,reason) values($1,$2,'2020-01-01',20000,'Histórico de outro torneio') returning id",[other,otherScore])).rows[0].id;
   await db.query("insert into private.score_change_decisions(change_id,tournament_id,status,decided_at,decided_by) values($1,$2,'rejected',now(),$3)",[c,ids[1],other]);
  }
  await login(db,owner);assert.equal((await listing(db,'get_personal_score_changes')).changes.length,1);assert.equal((await listing(db,'get_managed_score_changes')).changes.length,2);
  await login(db,player);await assert.rejects(listing(db,'get_managed_score_changes'),/organizer_required/);
  assert.ok((await listing(db,'get_personal_score_changes')).changes.every(c=>c.player_id===player));
  await assert.rejects(db.query("select private.list_score_changes(0,'managed')"),/permission denied/);
  await login(db,outsider);assert.deepEqual((await listing(db,'get_personal_score_changes')).changes,[]);assert.equal((await notifications(db)).is_organizer,false);
  await login(db,null,'anon');await assert.rejects(db.query('select public.get_tournament_notifications()'),/permission denied/);
 }finally{await db.close();}
});
test('organizer notifications distinguish request, open vote and awaiting tally; participant notice persists after own vote and respects deadline/electorate/revocation',async()=>{
 const {db,ids,audit}=await setup();try{
  await login(db,owner);let n=await notifications(db);assert.equal(n.managed_tournaments.length,1);assert.equal(n.managed_tournaments[0].corrections_pending,1);assert.equal(n.managed_tournaments[0].audits_requested,1);assert.equal(n.open_votings.length,0);
  await db.query('select public.review_score_audit($1,true)',[audit]);
  n=await notifications(db);assert.equal(n.managed_tournaments[0].audits_requested,0);assert.equal(n.managed_tournaments[0].audits_open,1);assert.equal(n.open_votings[0].can_vote,true);
  await db.query("select public.vote_score_audit($1,'maintain')",[audit]);n=await notifications(db);assert.equal(n.open_votings.length,1);assert.equal(n.open_votings[0].has_voted,true);assert.ok(!JSON.stringify(n).includes('maintain'));
  await login(db,player);n=await notifications(db);assert.equal(n.is_organizer,false);assert.equal(n.managed_tournaments.length,0);assert.equal(n.open_votings[0].can_vote,false);assert.equal(n.pending_days,1);
  await login(db,outsider);n=await notifications(db);assert.deepEqual(n.open_votings,[]);assert.deepEqual(n.request_tournaments,[]);
  await login(db,owner);await db.query("select public.add_tournament_participant($1,$2,'2020-01-01')",[ids[0],outsider]);
  await login(db,outsider);assert.equal((await notifications(db)).open_votings[0].can_vote,false);
  await login(db,owner);await db.query('select public.remove_tournament_participant($1,$2)',[ids[0],outsider]);
  await login(db,outsider);assert.equal((await notifications(db)).open_votings.length,0);
  await db.exec('reset role');await db.query("update private.score_audits set deadline=clock_timestamp() where id=$1",[audit]);
  await login(db,owner);n=await notifications(db);assert.equal(n.open_votings.length,0);assert.equal(n.managed_tournaments[0].audits_open,0);assert.equal(n.managed_tournaments[0].audits_ready,1);
  await db.query('select public.resolve_score_audit($1)',[audit]);assert.equal((await notifications(db)).managed_tournaments[0].audits_ready,0);
 }finally{await db.close();}
});
test('audit read marks only own requests, never requester identity or other votes; reads do not change results',async()=>{
 const {db,ids}=await setup();try{
  const before=await snapshot(db);
  await login(db,owner);let a=(await db.query('select public.get_score_audits($1) d',[ids[0]])).rows[0].d.audits[0];assert.equal(a.requested_by_me,true);assert.ok(!('requester_id' in a));
  await login(db,player);a=(await db.query('select public.get_score_audits($1) d',[ids[0]])).rows[0].d.audits[0];assert.equal(a.requested_by_me,false);
  await notifications(db);await listing(db,'get_personal_score_changes');assert.deepEqual(await snapshot(db),before);
 }finally{await db.close();}
});

test('notification backup/export/verification includes all accepted inputs and decisions without requiring empty tables',async()=>{
 const {db}=await setup(false);try{
  await db.exec('reset role');const before=await snapshot(db);
  const backup=await sql('operations/notification-workspaces/01-backup-before-install.sql');
  await db.exec(backup);
  await assert.rejects(db.exec(backup),/backup already exists/);await db.exec('rollback');
  const exported=(await db.exec(await sql('operations/notification-workspaces/02-export-backup-private.sql')))[0].rows[0];
  assert.equal(exported.id,'before-notifications-20261018-v1');assert.equal(Object.keys(exported.snapshot).length,20);assert.equal(exported.function_definitions.length,5);
  assert.ok(exported.snapshot.retroactive_changes.length>0);assert.ok(exported.snapshot.retroactive_decisions.length>0);assert.ok(exported.snapshot.tournament_inputs.length>0);
  await db.exec(await sql(`migrations/${migration}`));await db.exec(await sql('operations/notification-workspaces/03-verify-after-install.sql'));
  assert.deepEqual(await snapshot(db),before);
  await assert.rejects(db.exec(backup),/already installed/);await db.exec('rollback');
 }finally{await db.close();}
});
