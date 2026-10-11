import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const owner='00000000-0000-4000-8000-000000000001';
const player='00000000-0000-4000-8000-000000000002';
const voter='00000000-0000-4000-8000-000000000003';
const outsider='00000000-0000-4000-8000-000000000004';
const migration='202610110001_score_audits.sql';
async function login(db,id,role='authenticated') {
 await db.exec('reset role'); await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id??'']); await db.exec(`set role ${role}`);
}
async function setup(apply=true) {
 const db=new PGlite();
 await db.exec(`create role anon; create role authenticated; create schema auth;
 create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth,public to anon,authenticated;`);
 for(const file of (await readdir(new URL('../supabase/migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')&&f<migration).sort())
  await db.exec(await readFile(new URL(`../supabase/migrations/${file}`,import.meta.url),'utf8'));
 await db.exec('grant select,insert,update,delete on all tables in schema public to anon,authenticated');
 await db.query(`insert into auth.users(id,email,raw_user_meta_data) values ($1,'o@test','{"display_name":"Organizador"}'),($2,'p@test','{"display_name":"Auditado"}'),($3,'v@test','{"display_name":"Eleitor"}'),($4,'x@test','{"display_name":"Externo"}')`,[owner,player,voter,outsider]);
 await login(db,owner);
 const tournaments=[];
 for(let i=0;i<2;i++) {
  const id=(await db.query("select public.create_tournament('Auditoria teste','2020-01-01','2020-01-02') id")).rows[0].id;
  for(const p of [owner,player,voter]) await db.query("select public.add_tournament_participant($1,$2,'2020-01-01')",[id,p]);
  tournaments.push(id);
 }
 await db.exec('reset role');
 await db.query(`insert into public.personal_scores(player_id,occurred_at,score) values
 ($1,'2020-01-01 15:00Z',15000),($2,'2020-01-01 15:00Z',10000),($3,'2020-01-01 15:00Z',20000)`,[owner,player,voter]);
 const score=(await db.query('select id from public.personal_scores where player_id=$1',[player])).rows[0].id;
 await login(db,owner);
 for(const id of tournaments) await db.query('select public.complete_tournament_history($1)',[id]);
 await db.exec('reset role');
 if(apply) await db.exec(await readFile(new URL(`../supabase/migrations/${migration}`,import.meta.url),'utf8'));
 return {db,id:tournaments[0],other:tournaments[1],score};
}
async function request(db,id,score) {
 await login(db,voter);
 return (await db.query("select public.request_score_audit($1,$2,'Verificar evidência da partida') id",[id,score])).rows[0].id;
}
async function open(db,audit) {await login(db,owner);await db.query('select public.review_score_audit($1,true)',[audit]);}
async function expire(db,audit) {await db.exec('reset role');await db.query("update private.score_audits set deadline=now()-interval '1 second' where id=$1",[audit]);}
async function data(db,id) {return (await db.query('select public.get_score_audits($1) d',[id])).rows[0].d;}
async function results(db,id) {await db.exec('reset role');return (await db.query("select player_id,applied_score,result_kind,raw_score,applied_rule_snapshot from public.tournament_score_results where tournament_id=$1 and played_on='2020-01-01' order by player_id",[id])).rows;}

test('S6 migration preserves all existing data and calculation before first audit',async()=>{
 const {db,id}=await setup(false);
 try {
  const before=await results(db,id);
  const calc=(await db.query("select * from private.calculate_tournament($1,'2020-01-03') order by played_on,player_id",[id])).rows;
  await db.exec(await readFile(new URL('../supabase/rehearsal/sprint6/01-backup.sql',import.meta.url),'utf8'));
  await db.exec(await readFile(new URL(`../supabase/migrations/${migration}`,import.meta.url),'utf8'));
  await db.exec(await readFile(new URL('../supabase/rehearsal/sprint6/03-verify.sql',import.meta.url),'utf8'));
  assert.deepEqual(await results(db,id),before);
  assert.deepEqual((await db.query("select * from private.calculate_tournament($1,'2020-01-03') order by played_on,player_id",[id])).rows,calc);
 } finally {await db.close();}
});

test('S6 electorate is fixed at opening; revocation removes voting access; competing requests create only one audit',async()=>{
 const {db,id,score}=await setup();
 try {
  await login(db,voter);
  const attempts=await Promise.allSettled([
   db.query("select public.request_score_audit($1,$2,'Primeiro pedido') id",[id,score]),
   db.query("select public.request_score_audit($1,$2,'Segundo pedido') id",[id,score]),
  ]);
  assert.equal(attempts.filter(r=>r.status==='fulfilled').length,1);
  assert.match(attempts.find(r=>r.status==='rejected').reason.message,/audit_exists/);
  const audit=attempts.find(r=>r.status==='fulfilled').value.rows[0].id;await open(db,audit);
  await db.query("select public.add_tournament_participant($1,$2,'2020-01-01')",[id,outsider]);
  await login(db,outsider);await assert.rejects(db.query("select public.vote_score_audit($1,'maintain')",[audit]),/audit_not_eligible/);
  await login(db,voter);await db.query("select public.vote_score_audit($1,'maintain')",[audit]);
  await login(db,owner);await db.query('select public.remove_tournament_participant($1,$2)',[id,voter]);
  await login(db,voter);await assert.rejects(db.query("select public.vote_score_audit($1,'invalidate')",[audit]),/audit_not_allowed/);
  await expire(db,audit);await login(db,owner);await db.query("select public.resolve_score_audit($1,'penalty')",[audit]);
  assert.equal((await data(db,id)).audits[0].maintain_votes,1);
 } finally {await db.close();}
});

test('S6 request, organizer approval, electorate and secret mutable votes enforce permissions',async()=>{
 const {db,id,score}=await setup();
 try {
  await login(db,outsider);
  await assert.rejects(db.query("select public.request_score_audit($1,$2,'Motivo válido')",[id,score]),/audit_not_allowed/);
  await login(db,voter);
  await assert.rejects(db.query("select public.request_score_audit($1,$2,'  ')",[id,score]),/invalid_audit_reason/);
  const audit=await request(db,id,score);
  await assert.rejects(db.query("select public.request_score_audit($1,$2,'Outra razão')",[id,score]),/audit_exists/);
  await assert.rejects(db.query('select public.review_score_audit($1,true)',[audit]),/audit_not_allowed/);
  await assert.rejects(db.query("select public.vote_score_audit($1,'invalidate')",[audit]),/audit_voting_closed/);
  await open(db,audit);
  await db.exec('reset role');
  const row=(await db.query('select * from private.score_audits where id=$1',[audit])).rows[0];
  assert.ok(Math.abs((new Date(row.deadline)-new Date(row.opened_at))/3600000-48)<0.001);
  assert.equal((await db.query('select count(*)::int n from private.audit_electors where audit_id=$1',[audit])).rows[0].n,2);
  await login(db,player);
  await assert.rejects(db.query("select public.vote_score_audit($1,'invalidate')",[audit]),/audit_not_eligible/);
  await login(db,voter);
  await db.query("select public.vote_score_audit($1,'maintain')",[audit]);
  await db.query("select public.vote_score_audit($1,'invalidate')",[audit]);
  assert.equal((await data(db,id)).audits[0].my_vote,'invalidate');
  await assert.rejects(db.query('select * from private.audit_votes'),/permission denied/);
  await assert.rejects(db.query('select * from private.audit_events'),/permission denied/);
  await login(db,owner);
  const visible=(await data(db,id)).audits[0];
  assert.equal(visible.my_vote,null);assert.equal(visible.invalid_votes,null);
  assert.ok(!JSON.stringify(visible).includes(voter));
  await assert.rejects(db.query("select public.resolve_score_audit($1,'penalty')",[audit]),/audit_not_ready/);
  await expire(db,audit);await login(db,voter);
  await assert.rejects(db.query("select public.vote_score_audit($1,'maintain')",[audit]),/audit_voting_closed/);
  await login(db,outsider);await assert.rejects(data(db,id),/audit_not_allowed/);
  await login(db,null,'anon');await assert.rejects(data(db,id),/permission denied/);
 } finally {await db.close();}
});

for(const sanction of ['disregard','penalty']) test(`S6 ${sanction}: excludes relative minimum, preserves raw/other tournament, snapshots and safe retries`,async()=>{
 const {db,id,other,score}=await setup();
 try {
  const untouched=await results(db,other);const before=await results(db,id);
  const audit=await request(db,id,score);await open(db,audit);
  assert.deepEqual(await results(db,id),before);
  await login(db,voter);await db.query("select public.vote_score_audit($1,'invalidate')",[audit]);
  await expire(db,audit);await login(db,owner);
  await assert.rejects(db.query('select public.resolve_score_audit($1)',[audit]),/audit_punishment_required/);
  await db.query('select public.resolve_score_audit($1,$2)',[audit,sanction]);
  const after=await results(db,id);
  assert.equal(after.find(r=>r.player_id===owner).applied_score,0);
  assert.equal(after.find(r=>r.player_id===voter).applied_score,5000);
  assert.equal(after.find(r=>r.player_id===player).applied_score,sanction==='penalty'?-2500:0);
  assert.equal(after.find(r=>r.player_id===player).result_kind,sanction==='penalty'?'audit_penalty':'audit_disregarded');
  assert.equal(after.find(r=>r.player_id===player).raw_score,10000);
  assert.deepEqual(await results(db,other),untouched);
  const n=(await db.query('select count(*)::int n from private.result_changes')).rows[0].n;
  await login(db,owner);await db.query('select public.resolve_score_audit($1,$2)',[audit,sanction]);
  const decision=(await data(db,id)).audits[0];assert.equal(decision.invalid_votes,1);assert.equal(decision.my_vote,null);
  assert.deepEqual(decision.before_results.map(r=>r.applied_score),before.map(r=>r.applied_score));
  assert.deepEqual(decision.after_results.map(r=>r.applied_score),after.map(r=>r.applied_score));
  await db.exec('reset role');assert.equal((await db.query('select count(*)::int n from private.result_changes')).rows[0].n,n);
  assert.equal((await db.query('select score from public.personal_scores where id=$1',[score])).rows[0].score,10000);
  await db.query("select private.refresh_tournament($1,'2026-10-11')",[id]);assert.deepEqual(await results(db,id),after);
 } finally {await db.close();}
});

for(const scenario of ['none','tie','maintain']) test(`S6 ${scenario} maintains the score and cannot apply punishment`,async()=>{
 const {db,id,score}=await setup();
 try {
  const before=await results(db,id);const audit=await request(db,id,score);await open(db,audit);
  if(scenario!=='none') {await login(db,voter);await db.query("select public.vote_score_audit($1,'maintain')",[audit]);}
  if(scenario==='tie') {await login(db,owner);await db.query("select public.vote_score_audit($1,'invalidate')",[audit]);}
  await expire(db,audit);await login(db,owner);await db.query("select public.resolve_score_audit($1,'penalty')",[audit]);
  const a=(await data(db,id)).audits[0];assert.equal(a.status,'maintained');assert.equal(a.punishment,null);
  assert.deepEqual(await results(db,id),before);
 } finally {await db.close();}
});

test('S6 pending requests guard closing, audited membership, rules and score correction; rejection is recorded',async()=>{
 const {db,id,score}=await setup();
 try {
  const audit=await request(db,id,score);await login(db,owner);
  await assert.rejects(db.query('select public.close_tournament($1)',[id]),/audit_pending/);
  await assert.rejects(db.query('select public.remove_tournament_participant($1,$2)',[id,player]),/audit_pending/);
  await db.exec('reset role');await assert.rejects(db.query('update public.tournaments set absence_penalty=-100 where id=$1',[id]),/audit_pending/);
  await login(db,owner);await assert.rejects(db.query("select public.review_score_audit($1,false,'')",[audit]),/invalid_audit_reason/);
  await db.query("select public.review_score_audit($1,false,'Evidência insuficiente')",[audit]);
  assert.equal((await data(db,id)).audits[0].status,'rejected');
  await db.query('select public.close_tournament($1)',[id]);
  await login(db,voter);await assert.rejects(db.query("select public.request_score_audit($1,$2,'Motivo válido')",[id,score]),/tournament_closed/);
  const other=(await setup());
  try {
   const changed=await request(other.db,other.id,other.score);await open(other.db,changed);
   await other.db.exec('reset role');await assert.rejects(other.db.query('update public.personal_scores set score=11000 where id=$1',[other.score]),/audit_score_locked/);
   await login(other.db,owner);assert.equal((await data(other.db,other.id)).audits[0].status,'open');
   await assert.rejects(other.db.query("select public.resolve_score_audit($1,'penalty')",[changed]),/audit_not_ready/);
  } finally {await other.db.close();}
 } finally {await db.close();}
});

test('S6 penalty is frozen at adjudication; rule preview includes decision and absolute calculation remains correct',async()=>{
 const {db,id,score}=await setup();
 try {
  const audit=await request(db,id,score);await open(db,audit);await login(db,voter);await db.query("select public.vote_score_audit($1,'invalidate')",[audit]);
  await expire(db,audit);await login(db,owner);await db.query("select public.resolve_score_audit($1,'penalty')",[audit]);
  const proposal={from:'2020-01-01',to:'2020-01-02',scope:'tournament',mode:'absolute',penalty:-500,schedule:'every_day',exclusions:[],reason:'Revisão teste'};
  const preview=(await db.query('select public.preview_tournament_rules($1,$2) p',[id,proposal])).rows[0].p;
  await db.query('select public.apply_tournament_rules($1,$2,$3)',[id,proposal,preview.token]);
  const rows=await results(db,id);assert.equal(rows.find(r=>r.player_id===player).applied_score,-2500);
  assert.equal(rows.find(r=>r.player_id===owner).applied_score,15000);assert.equal(rows.find(r=>r.player_id===voter).applied_score,20000);
 } finally {await db.close();}
});

test('S6 failed recalculation rolls back adjudication, result changes and decision events atomically',async()=>{
 const {db,id,score}=await setup();
 try {
  const audit=await request(db,id,score);await open(db,audit);await login(db,voter);await db.query("select public.vote_score_audit($1,'invalidate')",[audit]);await expire(db,audit);
  const before=await results(db,id);
  await db.exec(`create function private.fail_s6_result() returns trigger language plpgsql as $$begin raise exception 'forced_s6_failure';end$$;
   create trigger fail_s6_result before update on public.tournament_score_results for each row execute function private.fail_s6_result();`);
  await login(db,owner);await assert.rejects(db.query("select public.resolve_score_audit($1,'penalty')",[audit]),/forced_s6_failure/);
  assert.equal((await data(db,id)).audits[0].status,'open');assert.deepEqual(await results(db,id),before);
  assert.equal((await db.query("select count(*)::int n from private.audit_events where audit_id=$1 and event='resolved'",[audit])).rows[0].n,0);
 } finally {await db.close();}
});
