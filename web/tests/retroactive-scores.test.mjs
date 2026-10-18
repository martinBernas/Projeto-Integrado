import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const owner='00000000-0000-4000-8000-000000000001';
const player='00000000-0000-4000-8000-000000000002';
const otherOwner='00000000-0000-4000-8000-000000000003';
const outsider='00000000-0000-4000-8000-000000000004';
const migration='202610180004_retroactive_scores.sql';
async function login(db,id,role='authenticated') {
 await db.exec('reset role'); await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id??'']); await db.exec(`set role ${role}`);
}
async function setup() {
 const db=new PGlite();
 await db.exec(`create role anon; create role authenticated; create role service_role; create schema auth;
 create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth,public to anon,authenticated;`);
 for(const file of (await readdir(new URL('../supabase/migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')&&f<migration).sort())
  await db.exec(await readFile(new URL(`../supabase/migrations/${file}`,import.meta.url),'utf8'));
 await db.exec('grant select,insert,update,delete on all tables in schema public to anon,authenticated');
 for(const [id,name] of [[owner,'Organizador'],[player,'Jogador'],[otherOwner,'Outro'],[outsider,'Externo']])
  await db.query('insert into auth.users(id,email,raw_user_meta_data) values($1,$2,$3)',[id,`${name}@test`,JSON.stringify({display_name:name})]);
 const ids=[];
 for(const organizer of [owner,otherOwner,owner]) {
  await login(db,organizer);
  const id=(await db.query("select public.create_tournament('Retroativo teste','2020-01-01','2020-01-02') id")).rows[0].id;
  for(const p of [owner,player,otherOwner]) await db.query("select public.add_tournament_participant($1,$2,'2020-01-01')",[id,p]);
  ids.push(id);
 }
 await db.exec('reset role');
 await db.query("insert into public.personal_scores(player_id,occurred_at,score) values($1,'2020-01-01 15:00Z',15000),($2,'2020-01-01 15:00Z',10000)",[owner,player]);
 for(const id of ids) await db.query("select private.refresh_tournament($1,current_date)",[id]);
 await login(db,owner); await db.query('select public.close_tournament($1)',[ids[2]]);
 await db.exec('reset role');
 const before=(await db.query('select * from public.tournament_score_results order by tournament_id,player_id,played_on')).rows;
 await db.exec(await readFile(new URL('../supabase/operations/retroactive-scores/01-backup-before-install.sql',import.meta.url),'utf8'));
 await assert.rejects(db.exec(await readFile(new URL('../supabase/operations/retroactive-scores/01-backup-before-install.sql',import.meta.url),'utf8')),/backup already exists/);
 await db.exec('rollback');
 await db.exec(await readFile(new URL(`../supabase/migrations/${migration}`,import.meta.url),'utf8'));
 await db.exec(await readFile(new URL('../supabase/operations/retroactive-scores/03-verify-after-install.sql',import.meta.url),'utf8'));
 assert.deepEqual((await db.query('select * from public.tournament_score_results order by tournament_id,player_id,played_on')).rows,before);
 return {db,ids};
}
async function submit(db,score,day='2020-01-01') {
 return (await db.query('select public.submit_retroactive_score($1,$2,$3) id',[day,score,'Corrigir valor digitado'])).rows[0].id;
}
async function changes(db) {return (await db.query('select public.get_score_changes() data')).rows[0].data.changes;}
async function results(db,id) {
 await db.exec('reset role'); await db.query('select private.refresh_tournament($1,current_date)',[id]);
 return (await db.query("select player_id,raw_score,applied_score,result_kind from public.tournament_score_results where tournament_id=$1 and played_on='2020-01-01' order by player_id",[id])).rows;
}

test('retroactive updates personal immediately, preserves other/closed tournaments and independent decisions across refreshes',async()=>{
 const {db,ids}=await setup();
 try {
  const baseline=await results(db,ids[0]); const frozen=await results(db,ids[2]);
  await login(db,player); const change=await submit(db,8000);
  assert.equal((await db.query("select score from public.personal_scores where player_id=$1 and played_on='2020-01-01'",[player])).rows[0].score,8000);
  const own=(await changes(db)).find(c=>c.id===change); assert.equal(own.decisions.length,2);
  assert.deepEqual(await results(db,ids[0]),baseline); assert.deepEqual(await results(db,ids[1]),baseline);
  await login(db,owner); const visible=(await changes(db)).find(c=>c.id===change);
  assert.equal(visible.decisions.length,1); const first=visible.decisions[0].id;
  await db.query('select public.review_score_change($1,true)',[first]);
  await db.query('select public.review_score_change($1,true)',[first]);
  await assert.rejects(db.query('select public.review_score_change($1,false)',[first]),/already_decided/);
  const accepted=await results(db,ids[0]); assert.equal(accepted.find(r=>r.player_id===owner).applied_score,7000);
  assert.deepEqual(await results(db,ids[1]),baseline);
  await login(db,player); await assert.rejects(submit(db,9000),/score_change_pending/);
  await login(db,otherOwner); const second=(await changes(db)).find(c=>c.id===change).decisions[0].id;
  await db.query('select public.review_score_change($1,false)',[second]);
  await login(db,player); const next=await submit(db,9000);
  assert.ok(next!==change); assert.deepEqual(await results(db,ids[0]),accepted);
  assert.deepEqual(await results(db,ids[1]),baseline); assert.deepEqual(await results(db,ids[2]),frozen);
 } finally {await db.close();}
});

test('absent input remains absent until approval, no memberships works, authorization and validation are enforced',async()=>{
 const {db,ids}=await setup();
 try {
  await login(db,player); await submit(db,12000,'2020-01-02');
  const absent=await results(db,ids[0]); // day one remains untouched
  assert.equal(absent.find(r=>r.player_id===player).raw_score,10000);
  await login(db,owner); const d=(await changes(db))[0].decisions[0].id;
  await db.exec('reset role');
  const missing=await db.query("select raw_score,applied_score from private.calculate_tournament($1,current_date) where player_id=$2 and played_on='2020-01-02'",[ids[0],player]);
  assert.equal(missing.rows[0].raw_score,null);assert.equal(missing.rows[0].applied_score,-2500);
  await login(db,owner);await db.query('select public.review_score_change($1,true)',[d]);
  await db.exec('reset role');
  assert.equal((await db.query("select raw_score from private.calculate_tournament($1,current_date) where player_id=$2 and played_on='2020-01-02'",[ids[0],player])).rows[0].raw_score,12000);
  await login(db,player); await assert.rejects(db.query('select public.review_score_change($1,true)',[d]),/not_allowed/);
  await assert.rejects(db.query('select * from private.tournament_score_inputs'),/permission denied/);
  await db.query("update public.personal_scores set score=1 where player_id=$1",[player]);
  assert.equal((await db.query("select score from public.personal_scores where player_id=$1 and played_on='2020-01-01'",[player])).rows[0].score,10000);
  await assert.rejects(submit(db,25001),/invalid_score/);
  await assert.rejects(submit(db,1,'9999-01-01'),/past_day_required/);
  await assert.rejects(db.query("select public.submit_retroactive_score('2020-01-01',1,' ' )"),/invalid_change_reason/);
  await login(db,outsider); assert.deepEqual(await changes(db),[]);
  await submit(db,1234,'1900-01-01'); assert.equal((await changes(db))[0].decisions.length,0);
  await submit(db,1235,'1900-01-01');
  await login(db,null,'anon'); await assert.rejects(db.query('select public.get_score_changes()'),/permission denied/);
 } finally {await db.close();}
});

test('competing submissions and decisions keep one outcome; refresh failure rolls back approval, inputs and results',async()=>{
 const {db,ids}=await setup();
 try {
  await login(db,player);
  const attempts=await Promise.allSettled([submit(db,8000),submit(db,9000)]);
  assert.equal(attempts.filter(a=>a.status==='fulfilled').length,1);
  assert.match(attempts.find(a=>a.status==='rejected').reason.message,/score_change_pending/);
  await login(db,owner);const decision=(await changes(db))[0].decisions[0].id;
  await db.exec('reset role');
  const before=(await db.query('select * from private.tournament_score_inputs order by tournament_id,player_id,played_on')).rows;
  const rows=(await db.query('select * from public.tournament_score_results order by id')).rows;
  await db.exec(`create function private.fail_retro_test() returns trigger language plpgsql as $$begin raise exception 'simulated_refresh_failure'; end$$;
   create trigger fail_retro_test before update on public.tournament_score_results for each row execute function private.fail_retro_test();`);
  await login(db,owner); await assert.rejects(db.query('select public.review_score_change($1,true)',[decision]),/simulated_refresh_failure/);
  assert.equal((await changes(db))[0].decisions[0].status,'pending');
  await db.exec('reset role');assert.deepEqual((await db.query('select * from private.tournament_score_inputs order by tournament_id,player_id,played_on')).rows,before);
  assert.deepEqual((await db.query('select * from public.tournament_score_results order by id')).rows,rows);
  await db.exec('drop trigger fail_retro_test on public.tournament_score_results');
  await login(db,owner);
  const decisions=await Promise.allSettled([db.query('select public.review_score_change($1,true)',[decision]),db.query('select public.review_score_change($1,false)',[decision])]);
  assert.equal(decisions.filter(a=>a.status==='fulfilled').length,1);
  assert.match(decisions.find(a=>a.status==='rejected').reason.message,/already_decided/);
 } finally {await db.close();}
});

test('request history paginates beyond fifty; backup export is complete and recapture after install is refused',async()=>{
 const {db}=await setup();
 try {
  await db.exec('reset role');
  const exportResult=await db.exec(await readFile(new URL('../supabase/operations/retroactive-scores/02-export-backup-private.sql',import.meta.url),'utf8'));
  assert.equal(exportResult[0].rows[0].id,'before-retroactive-20261018-v1');
  const exported=exportResult[0].rows[0];
  assert.equal(Object.keys(exported.snapshot).length,17);assert.equal(exported.function_definitions.length,4);
  await assert.rejects(db.exec(await readFile(new URL('../supabase/operations/retroactive-scores/01-backup-before-install.sql',import.meta.url),'utf8')),/already installed/);await db.exec('rollback');
  await login(db,outsider);
  for(let i=0;i<52;i++)await submit(db,1000+i,'1900-01-01');
  const first=(await db.query('select public.get_score_changes(0) d')).rows[0].d;
  assert.equal(first.changes.length,50);assert.equal(first.has_more,true);
  const second=(await db.query('select public.get_score_changes(1) d')).rows[0].d;
  assert.equal(second.changes.length,2);assert.equal(second.has_more,false);
  assert.ok(second.changes.every(c=>!first.changes.some(a=>a.id===c.id)));
  await assert.rejects(db.query('select public.get_score_changes(-1)'),/invalid_page/);
 } finally {await db.close();}
});

test('pending decisions prevent close, eligibility and rules edits; self approval is allowed and closed cannot change',async()=>{
 const {db,ids}=await setup();
 try {
  await login(db,owner); await submit(db,16000);
  const d=(await changes(db))[0].decisions.find(d=>d.tournament_id===ids[0]).id;
  await assert.rejects(db.query('select public.close_tournament($1)',[ids[0]]),/score_change_pending/);
  await assert.rejects(db.query('select public.remove_tournament_participant($1,$2)',[ids[0],owner]),/score_change_pending/);
  await assert.rejects(db.query("select public.update_tournament_participant($1,$2,'2020-01-02')",[ids[0],owner]),/score_change_pending/);
  const proposal={scope:'tournament',from:'2020-01-01',to:'2020-01-02',mode:'absolute',penalty:-2500,schedule:'every_day',exclusions:[],reason:'Revisar configuração'};
  const preview=(await db.query('select public.preview_tournament_rules($1,$2) p',[ids[0],proposal])).rows[0].p;
  await assert.rejects(db.query('select public.apply_tournament_rules($1,$2,$3)',[ids[0],proposal,preview.token]),/score_change_pending/);
  await db.query('select public.review_score_change($1,true)',[d]);
  await db.query('select public.close_tournament($1)',[ids[0]]);
  await assert.rejects(db.query('select public.review_score_change($1,true)',[d]),/tournament_closed/);
 } finally {await db.close();}
});

test('current-day audit guard stays effective and excluded days do not create retroactive decisions',async()=>{
 const {db,ids}=await setup();
 try {
  await login(db,player);
  await submit(db,10000,'2020-01-04'); // Saturday and beyond the period: personal only.
  assert.equal((await changes(db))[0].decisions.length,0);
  await login(db,owner);
  const today=(await db.query("select (now() at time zone 'America/Sao_Paulo')::date::text as day")).rows[0].day;
  await db.exec('reset role');
  const score=(await db.query("insert into public.personal_scores(player_id,occurred_at,score) values($1,($2::date+time '12:00') at time zone 'America/Sao_Paulo',10000) returning id",[player,today])).rows[0].id;
  await db.query("insert into private.score_audits(tournament_id,personal_score_id,player_id,played_on,raw_score,requester_id,reason) values($1,$2,$3,$4,10000,$5,'Proteção do dia atual')",[ids[0],score,player,today,owner]);
  await login(db,player);await assert.rejects(db.query('select public.submit_personal_score($1,11000)',[today]),/audit_score_locked/);
 } finally {await db.close();}
});

test('audit sees tournament-effective score, permits personal update, blocks approval and keeps sanction after correction',async()=>{
 const {db,ids}=await setup();
 try {
  await login(db,player); await submit(db,8000);
  const score=(await db.query("select id from public.personal_scores where player_id=$1 and played_on='2020-01-01'",[player])).rows[0].id;
  await login(db,owner);
  const audit=(await db.query("select public.request_score_audit($1,$2,'Conferir resultado original') id",[ids[0],score])).rows[0].id;
  const a=(await db.query('select public.get_score_audits($1) d',[ids[0]])).rows[0].d.audits[0];
  assert.equal(a.raw_score,10000);
  await db.query('select public.review_score_audit($1,true)',[audit]);
  const decision=(await changes(db))[0].decisions[0].id;
  await assert.rejects(db.query('select public.review_score_change($1,true)',[decision]),/audit_pending/);
  await db.query("select public.vote_score_audit($1,'invalidate')",[audit]);
  await db.exec('reset role'); await db.query("update private.score_audits set deadline=now()-interval '1 second' where id=$1",[audit]);
  await login(db,owner); await db.query("select public.resolve_score_audit($1,'penalty')",[audit]);
  await db.query('select public.review_score_change($1,true)',[decision]);
  const rows=await results(db,ids[0]); assert.equal(rows.find(r=>r.player_id===player).result_kind,'audit_penalty');
  assert.equal(rows.find(r=>r.player_id===player).applied_score,-2500);
  // Further personal changes during an already-open audit on the other tournament.
  await login(db,otherOwner);
  const second=(await db.query("select public.request_score_audit($1,$2,'Conferir outro torneio') id",[ids[1],score])).rows[0].id;
  await db.query('select public.review_score_audit($1,true)',[second]);
  const pending=(await changes(db))[0].decisions[0].id; await db.query('select public.review_score_change($1,false)',[pending]);
  await login(db,player); await submit(db,9000);
 } finally {await db.close();}
});
