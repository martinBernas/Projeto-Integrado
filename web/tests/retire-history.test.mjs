import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const owner='00000000-0000-4000-8000-000000000001', player='00000000-0000-4000-8000-000000000002';
const migration='202610180002_retire_history_preparation.sql';
const sql=file=>readFile(new URL(`../supabase/${file}`,import.meta.url),'utf8');
async function login(db,id=owner,role='authenticated') {
 await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id??'']);await db.exec(`set role ${role}`);
}
async function setup() {
 const db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create schema auth;
 create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth,public to anon,authenticated;`);
 for(const file of (await readdir(new URL('../supabase/migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')&&f<migration).sort()) await db.exec(await sql(`migrations/${file}`));
 await db.exec('grant select,insert,update,delete on all tables in schema public to anon,authenticated');
 await db.query(`insert into auth.users(id,email,raw_user_meta_data) values ($1,'owner@test','{"display_name":"Owner"}'),($2,'player@test','{"display_name":"Player"}')`,[owner,player]);
 return db;
}
async function create(db,name='Original',end='2020-01-03') {
 await login(db);
 const id=(await db.query("select public.create_tournament($1,'2020-01-01',$2) id",[name,end])).rows[0].id;
 await db.query("select public.add_tournament_participant($1,$2,'2020-01-01')",[id,owner]);
 await db.query("select public.add_tournament_participant($1,$2,'2020-01-02')",[id,player]);
 return id;
}
async function state(db) {
 const tables=['public.tournaments','public.personal_scores','public.profiles','public.tournament_participants','public.tournament_score_results','public.tournament_rule_versions','private.score_audits','private.audit_votes','private.audit_events'];
 const result={};for(const table of tables)result[table]=(await db.query(`select coalesce(jsonb_agg(r order by r::text),'[]') rows from (select to_jsonb(t) r from ${table} t) s`)).rows[0].rows;
 return result;
}
test('retiring history preserves stored rows and closed results, applies absences without a gate and retains calendar, eligibility and today semantics',async()=>{
 const db=await setup();try {
  const open=await create(db);const closed=await create(db,'Closed');
  await db.query('select public.complete_tournament_history($1)',[closed]);await db.query('select public.close_tournament($1)',[closed]);
  await db.exec('reset role');
  await db.query("insert into public.personal_scores(player_id,occurred_at,score) values ($1,'2020-01-01 15:00Z',10000),($2,'2020-01-02 15:00Z',0)",[owner,player]);
  const before=await state(db);
  await db.exec(await sql(`migrations/${migration}`));assert.deepEqual(await state(db),before);
  assert.equal((await db.query("select to_regprocedure('public.complete_tournament_history(uuid)') fn")).rows[0].fn,null);
  const rows=(await db.query("select * from private.calculate_tournament($1,'2020-01-03')",[open])).rows.map(r=>({...r,played_on:new Date(r.played_on).toISOString().slice(0,10)}));
  assert.ok(rows.some(r=>r.player_id===player&&r.played_on==='2020-01-02'&&r.result_kind==='absence'&&r.applied_score===-2500&&!r.provisional),JSON.stringify(rows));
  assert.ok(rows.some(r=>r.played_on==='2020-01-03'&&r.result_kind==='pending'&&r.provisional));
  assert.ok(!rows.some(r=>r.player_id===player&&r.played_on==='2020-01-01'));
  assert.ok(rows.filter(r=>r.played_on<'2020-01-03').every(r=>!r.provisional));
  await login(db,player);await assert.rejects(db.query('select public.close_tournament($1)',[open]),/tournament_not_allowed/);
  await login(db);await db.query('select public.close_tournament($1)',[open]);
  await db.exec('reset role');
  assert.deepEqual((await state(db))['public.tournament_score_results'].filter(r=>r.tournament_id===closed),before['public.tournament_score_results'].filter(r=>r.tournament_id===closed));
  const fresh=await create(db,'Fresh','2020-01-07');await db.exec('reset role');
  assert.equal((await db.query('select history_ready from public.tournaments where id=$1',[fresh])).rows[0].history_ready,true);
  assert.ok((await db.query("select * from private.calculate_tournament($1,'2020-01-06')",[fresh])).rows.every(r=>!['2020-01-04','2020-01-05'].includes(r.played_on)));
  await db.query('update public.tournaments set history_ready=false where id=$1',[fresh]);
  assert.ok((await db.query("select * from private.calculate_tournament($1,'2020-01-06')",[fresh])).rows.some(r=>r.result_kind==='absence'));
 }finally{await db.close();}
});

test('configured absolute tournaments need no preparation and audit sanctions still override absence and retain transactional guards',async()=>{
 const db=await setup();try {
  await db.exec(await sql(`migrations/${migration}`));await login(db);
  const proposal={from:'2020-01-01',to:'2020-01-05',scope:'tournament',mode:'absolute',penalty:-1000,schedule:'every_day',exclusions:[{date:'2020-01-03',reason:'Excluded day'}],reason:'Initial rule'};
  const id=(await db.query("select public.create_configured_tournament('Configured','2020-01-01','2020-01-05',$1) id",[proposal])).rows[0].id;
  await db.query("select public.add_tournament_participant($1,$2,'2020-01-01')",[id,player]);
  await db.query("select public.add_tournament_participant($1,$2,'2020-01-01')",[id,owner]);
  await db.exec('reset role');await db.query("insert into public.personal_scores(player_id,occurred_at,score) values ($1,'2020-01-02 15:00Z',15000)",[player]);
  const score=(await db.query('select id from public.personal_scores where player_id=$1',[player])).rows[0].id;
  await login(db);const data=(await db.query('select public.get_tournament_dashboard($1) d',[id])).rows[0].d;
  assert.ok(data.results.some(r=>r.result_kind==='absence'&&r.applied_score===-1000));
  assert.ok(data.results.some(r=>r.result_kind==='score'&&r.applied_score===15000));
  assert.ok(!data.results.some(r=>r.played_on==='2020-01-03'));
  const audit=(await db.query("select public.request_score_audit($1,$2,'Audit evidence') id",[id,score])).rows[0].id;
  await db.query('select public.review_score_audit($1,true)',[audit]);await db.query("select public.vote_score_audit($1,'invalidate')",[audit]);
  await assert.rejects(db.query('select public.close_tournament($1)',[id]),/audit_pending/);
  await db.exec('reset role');await db.query("update private.score_audits set deadline=now()-interval '1 second' where id=$1",[audit]);
  await login(db);await db.query("select public.resolve_score_audit($1,'penalty')",[audit]);
  const resolved=(await db.query('select public.get_tournament_dashboard($1) d',[id])).rows[0].d;
  assert.ok(resolved.results.some(r=>r.player_id===player&&r.result_kind==='audit_penalty'&&r.applied_score===-1000&&r.raw_score===15000));
 }finally{await db.close();}
});

test('test tournament cleanup backs up votes and removes only exact test dependencies, preserving original, raw scores and historical logs',async()=>{
 const db=await setup();try {
  await db.exec(await sql(`migrations/${migration}`));
  const original=await create(db,'Aztecas Outubro');const target=await create(db,'Teste auditoria Aztecas Outubro');
  await db.exec('reset role');await db.query("insert into public.personal_scores(player_id,occurred_at,score) values ($1,'2020-01-02 15:00Z',15000)",[player]);
  const score=(await db.query('select id from public.personal_scores where player_id=$1',[player])).rows[0].id;
  await login(db);const audit=(await db.query("select public.request_score_audit($1,$2,'Test evidence') id",[target,score])).rows[0].id;
  await db.query('select public.review_score_audit($1,true)',[audit]);await db.query("select public.vote_score_audit($1,'invalidate')",[audit]);
  await db.exec('reset role');const before=await state(db);
  await db.exec(await sql('operations/audit-test-cleanup/01-backup.sql'));
  assert.deepEqual(await state(db),before);
  await db.exec(await sql('operations/audit-test-cleanup/03-remove.sql'));
  const after=await state(db);
  assert.deepEqual(after['public.personal_scores'],before['public.personal_scores']);
  assert.deepEqual(after['public.profiles'],before['public.profiles']);
  assert.deepEqual(after['public.tournaments'],before['public.tournaments'].filter(r=>r.id===original));
  assert.ok(!after['private.score_audits'].length);assert.ok(!after['private.audit_votes'].length);
  const backup=(await db.query('select snapshot from private.maintenance_backups')).rows[0].snapshot;
  assert.equal(backup.votes.length,1);assert.equal(backup.audits.length,1);
  assert.ok(backup.events.length>=3);
  const persisted=await state(db);
  await assert.rejects(db.exec(await sql('operations/audit-test-cleanup/03-remove.sql')),/identity changed/);await db.exec('rollback');
  assert.deepEqual(await state(db),persisted);
 }finally{await db.close();}
});

test('cleanup refuses duplicate names and stale backup without deleting data',async()=>{
 const db=await setup();try {
  await db.exec(await sql(`migrations/${migration}`));await create(db,'Teste auditoria Aztecas Outubro');
  await db.exec('reset role');await db.exec(await sql('operations/audit-test-cleanup/01-backup.sql'));
  await db.query("insert into public.personal_scores(player_id,occurred_at,score) values ($1,'2020-01-02 15:00Z',14000)",[player]);
  const before=await state(db);
  await assert.rejects(db.exec(await sql('operations/audit-test-cleanup/03-remove.sql')),/Data changed after backup/);await db.exec('rollback');
  assert.deepEqual(await state(db),before);
  await create(db,'Teste auditoria Aztecas Outubro');await db.exec('reset role');
  await assert.rejects(db.exec(await sql('operations/audit-test-cleanup/01-backup.sql')),/unique test tournament/);await db.exec('rollback');
  assert.equal((await db.query('select count(*)::integer n from public.tournaments')).rows[0].n,2);
 }finally{await db.close();}
});
