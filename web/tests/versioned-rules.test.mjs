import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const alice='00000000-0000-4000-8000-000000000001';
const bob='00000000-0000-4000-8000-000000000002';
const outsider='00000000-0000-4000-8000-000000000003';
const migration='202610030001_versioned_rules.sql';
async function setup(apply=true) {
 const db=new PGlite();
 await db.exec(`create role anon; create role authenticated; create schema auth;
 create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema public,auth to anon,authenticated;`);
 for(const file of (await readdir(new URL('../supabase/migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')&&f<migration).sort())
  await db.exec(await readFile(new URL(`../supabase/migrations/${file}`,import.meta.url),'utf8'));
 await db.query(`insert into auth.users(id,email,raw_user_meta_data) values
 ($1,'alice@example.test','{"display_name":"Alice"}'),($2,'bob@example.test','{"display_name":"Bob"}'),
 ($3,'other@example.test','{"display_name":"Other"}')`,[alice,bob,outsider]);
 await db.exec('grant select,insert,update,delete on all tables in schema public to anon,authenticated');
 if(apply) await db.exec(await readFile(new URL(`../supabase/migrations/${migration}`,import.meta.url),'utf8'));
 return db;
}
async function login(db,id,role='authenticated') {
 await db.exec('reset role'); await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id??'']); await db.exec(`set role ${role}`);
}
const proposal=(overrides={})=>({from:'2020-01-01',to:'2020-01-10',mode:'absolute',penalty:-1000,
 schedule:'monday_to_friday',exclusions:[],reason:'Revisão acordada',...overrides});
async function tournament(db) {
 await login(db,alice);
 const id=(await db.query("select public.create_tournament('Teste regras','2020-01-01','2020-01-10') id")).rows[0].id;
 await db.query("select public.add_tournament_participant($1,$2,'2020-01-01')",[id,alice]);
 await db.query("select public.add_tournament_participant($1,$2,'2020-01-01')",[id,bob]);
 await db.exec('reset role');
 await db.query(`insert into public.personal_scores(player_id,occurred_at,score) values
 ($1,'2020-01-01 15:00Z',10000),($2,'2020-01-01 15:00Z',12000),
 ($1,'2020-01-02 15:00Z',0),($1,'2020-01-04 15:00Z',14000),($1,'2020-01-05 15:00Z',15000) on conflict(player_id,played_on) do nothing`,[alice,bob]);
 await login(db,alice); await db.query('select public.complete_tournament_history($1)',[id]);
 return id;
}
const preview=async(db,id,p)=>(await db.query('select public.preview_tournament_rules($1,$2) p',[id,p])).rows[0].p;
const apply=(db,id,p,token)=>db.query('select public.apply_tournament_rules($1,$2,$3) id',[id,p,token]);
const dashboard=async(db,id)=>(await db.query('select public.get_tournament_dashboard($1) d',[id])).rows[0].d;

test('S5 migration preserves legacy rows, snapshots and calculation; fixed timezone rejects unexpected legacy',async()=>{
 const db=await setup(false);
 try {
  const id=await tournament(db); await db.exec('reset role');
  const before=(await db.query('select to_jsonb(r) d from public.tournament_score_results r order by id')).rows;
  const calculation=(await db.query("select * from private.calculate_tournament($1,'2020-01-11') order by played_on,player_id",[id])).rows;
  await db.exec(await readFile(new URL(`../supabase/migrations/${migration}`,import.meta.url),'utf8'));
  assert.deepEqual((await db.query('select to_jsonb(r) d from public.tournament_score_results r order by id')).rows,before);
  assert.deepEqual((await db.query("select * from private.calculate_tournament($1,'2020-01-11') order by played_on,player_id",[id])).rows,calculation);
  await assert.rejects(db.query("update public.tournaments set timezone='UTC' where id=$1",[id]),/tournament_fixed_timezone/);
 } finally {await db.close();}
});

test('S5 legacy Sunday-only calendar retains historical meaning without adding Saturday silently',async()=>{
 const db=await setup(false);
 try {
  const id=await tournament(db);await db.exec('reset role');
  await db.query("update public.tournaments set weekly_schedule='monday_to_friday_and_sunday' where id=$1",[id]);
  const before=(await db.query("select * from private.calculate_tournament($1,'2020-01-11') order by played_on,player_id",[id])).rows;
  assert.ok(before.some(r=>new Date(r.played_on).toISOString().slice(0,10)==='2020-01-05'));
  assert.ok(before.every(r=>new Date(r.played_on).toISOString().slice(0,10)!=='2020-01-04'));
  await db.exec(await readFile(new URL(`../supabase/migrations/${migration}`,import.meta.url),'utf8'));
  assert.deepEqual((await db.query("select * from private.calculate_tournament($1,'2020-01-11') order by played_on,player_id",[id])).rows,before);
 }finally {await db.close();}
});

test('S5 retroactive absolute/zero/calendar: preview is read-only, apply audited and isolated, exclusion removes rows',async()=>{
 const db=await setup();
 try {
  const id=await tournament(db); const other=await tournament(db);
  const before=await dashboard(db,id); const untouched=await dashboard(db,other);
  assert.ok(before.results.every(r=>!['2020-01-04','2020-01-05'].includes(r.played_on)));
  const p=proposal({schedule:'every_day',exclusions:[{date:'2020-01-03',reason:'Feriado teste'}]});
  const pre=await preview(db,id,p);
  assert.equal(pre.retroactive,true); assert.ok(pre.changes.some(c=>c.day==='2020-01-05'));
  assert.deepEqual((await dashboard(db,id)).results,before.results);
  await apply(db,id,p,pre.token);
  const after=await dashboard(db,id);
  assert.equal(after.results.find(r=>r.player_id===alice&&r.played_on==='2020-01-01').applied_score,10000);
  assert.equal(after.results.find(r=>r.player_id===alice&&r.played_on==='2020-01-02').result_kind,'absence');
  assert.equal(after.results.find(r=>r.player_id===alice&&r.played_on==='2020-01-02').applied_score,-1000);
  assert.equal(after.results.find(r=>r.player_id===alice&&r.played_on==='2020-01-05').applied_score,15000);
  assert.ok(after.results.every(r=>r.played_on!=='2020-01-03'));
  assert.equal(after.results.find(r=>r.player_id===alice&&r.played_on==='2020-01-04').applied_score,14000);
  assert.equal(after.results.find(r=>r.player_id===bob&&r.played_on==='2020-01-04').result_kind,'absence');
  assert.equal(after.results.find(r=>r.player_id===bob&&r.played_on==='2020-01-04').applied_score,-1000);
  assert.deepEqual((await dashboard(db,other)).results,untouched.results);
  assert.deepEqual(pre.totals.map(t=>[t.player_id,t.after]),after.participants.map(p=>[p.id,after.results.filter(r=>r.player_id===p.id).reduce((n,r)=>n+r.applied_score,0)]).sort());
  await assert.rejects(apply(db,id,p,pre.token),/rule_preview_expired/);
  const attempted=proposal({from:'2020-01-06',mode:'relative_to_lowest'});
  const sharedPreview=await preview(db,id,attempted);
  await db.exec('reset role');
  await db.query("update public.personal_scores set score=11000 where player_id=$1 and played_on='2020-01-01'",[alice]);
  await login(db,alice);
  await assert.rejects(apply(db,id,attempted,sharedPreview.token),/rule_preview_expired/);
  await db.exec('reset role');
  assert.equal(Number((await db.query('select count(*) n from private.rule_revision_changes')).rows[0].n),1);
  assert.ok(Number((await db.query("select count(*) n from private.result_changes where new_data='null'::jsonb")).rows[0].n)>0);
 } finally {await db.close();}
});

const backupPath=new URL('../../backups/sprint-4/before-s4-02-september-v1.json',import.meta.url);
test('S5 private September copy preserves all original rows, calculation and baseline exclusions', {skip:!existsSync(backupPath)},async()=>{
 const db=await setup(false);
 try {
  const backup=JSON.parse(await readFile(backupPath,'utf8'));const snapshot=backup.snapshot;
  const ids=new Set([...backup.players,...Object.values(snapshot.tournament).map(t=>t.organizer_id)]);
  for(const id of ids)await db.query("insert into auth.users(id,email,raw_user_meta_data) values($1,$2,$3) on conflict do nothing",[id,`${id}@fixture.invalid`,JSON.stringify({display_name:`Fixture ${id}`})]);
  for(const p of Object.values(snapshot.profiles))await db.query('update public.profiles set display_name=$2,created_at=$3 where id=$1',[p.id,p.display_name,p.created_at]);
  for(const [table,section]of [['tournaments','tournament'],['tournament_participants','participants'],['tournament_excluded_dates','excluded_dates']])
   await db.query(`insert into public.${table} select * from jsonb_populate_recordset(null::public.${table},$1::jsonb)`,[JSON.stringify(Object.values(snapshot[section]))]);
  await db.query(`insert into public.personal_scores(id,player_id,score,occurred_at,created_at,updated_at,source)
   select id,player_id,score,occurred_at,created_at,updated_at,source from jsonb_populate_recordset(null::public.personal_scores,$1::jsonb)`,[JSON.stringify(Object.values(snapshot.personal_scores))]);
  await db.query('insert into public.tournament_score_results select * from jsonb_populate_recordset(null::public.tournament_score_results,$1::jsonb)',[JSON.stringify(Object.values(snapshot.stored_results))]);
  const state=async()=>Promise.all(['profiles','personal_scores','tournaments','tournament_participants','tournament_excluded_dates','tournament_score_results'].map(async table=>(await db.query(`select to_jsonb(t) d from public.${table} t order by to_jsonb(t)::text`)).rows));
  const before=await state();const calculated=(await db.query('select * from private.calculate_tournament($1,$2) order by player_id,played_on',[backup.tournament_id,backup.as_of])).rows;
  await db.exec(await readFile(new URL(`../supabase/migrations/${migration}`,import.meta.url),'utf8'));
  assert.deepEqual(await state(),before);
  assert.deepEqual((await db.query('select * from private.calculate_tournament($1,$2) order by player_id,played_on',[backup.tournament_id,backup.as_of])).rows,calculated);
  assert.equal((await db.query("select exclusions from public.tournament_rule_versions where tournament_id=$1",[backup.tournament_id])).rows[0].exclusions.length,Object.keys(snapshot.excluded_dates).length);
  await login(db,backup.players[0]);
  const compatible=(await db.query('select public.get_september_dashboard() d')).rows[0].d;
  assert.equal(compatible.access,true);assert.ok(compatible.rule_versions.length);
 }finally {await db.close();}
});

test('S5 future revision selects its interval without changing earlier rule snapshots',async()=>{
 const db=await setup();
 try {
  await login(db,alice);
  const id=(await db.query("select public.create_tournament('Torneio futuro','2090-01-01','2090-01-10') id")).rows[0].id;
  await db.query("select public.add_tournament_participant($1,$2,'2090-01-01')",[id,alice]);
  await db.exec('reset role');
  const before=(await db.query("select * from private.calculate_tournament($1,'2090-01-05') order by played_on,player_id",[id])).rows;
  await login(db,alice);
  const p=proposal({from:'2090-01-06',to:'2090-01-10',schedule:'every_day',penalty:0});
  const pre=await preview(db,id,p);assert.equal(pre.retroactive,false);assert.deepEqual(pre.changes,[]);
  await apply(db,id,p,pre.token);await db.exec('reset role');
  assert.deepEqual((await db.query("select * from private.calculate_tournament($1,'2090-01-05') order by played_on,player_id",[id])).rows,before);
  const after=(await db.query("select * from private.calculate_tournament($1,'2090-01-10') order by played_on,player_id",[id])).rows;
  assert.ok(after.filter(r=>r.played_on>='2090-01-06').every(r=>r.rule_snapshot.mode==='absolute'&&r.rule_snapshot.absence_penalty===0));
 }finally {await db.close();}
});

test('S5 stale preview, permissions, invalid proposals, closed state and private/direct writes',async()=>{
 const db=await setup();
 try {
  const id=await tournament(db); const p=proposal(); const pre=await preview(db,id,p);
  await db.query("select public.update_tournament_participant($1,$2,'2020-01-02')",[id,bob]);
  await assert.rejects(apply(db,id,p,pre.token),/rule_preview_expired/);
  for(const bad of [proposal({timezone:'UTC'}),proposal({penalty:1}),proposal({penalty:-25001}),proposal({from:'2019-12-01'}),
   proposal({exclusions:[{date:'2020-01-01',reason:'abc'},{date:'2020-01-01',reason:'def'}]}),proposal({mode:'invalid'}),proposal({reason:''}),proposal({schedule:'monday_to_friday_and_sunday'})])
   await assert.rejects(preview(db,id,bad),/invalid_/);
  await login(db,bob); assert.ok((await dashboard(db,id)).rule_versions.length);
  await assert.rejects(preview(db,id,p),/tournament_not_allowed/);
  await assert.rejects(db.query('delete from public.tournament_rule_versions where tournament_id=$1',[id]),/permission denied/);
  await login(db,outsider); assert.deepEqual((await db.query('select * from public.tournament_rule_versions where tournament_id=$1',[id])).rows,[]);
  assert.deepEqual(await dashboard(db,id),{access:false});
  await login(db,null,'anon'); await assert.rejects(preview(db,id,p),/permission denied/);
  await login(db,alice); await db.query('select public.close_tournament($1)',[id]);
  await assert.rejects(preview(db,id,p),/tournament_closed/);
 } finally {await db.close();}
});

test('S5 interval precedence, future rules preserve past, exclusions restore and pending absence stays pending',async()=>{
 const db=await setup();
 try {
  const id=await tournament(db); const before=await dashboard(db,id);
  const p=proposal({from:'2020-01-06',penalty:0}); await apply(db,id,p,(await preview(db,id,p)).token);
  assert.deepEqual((await dashboard(db,id)).results.filter(r=>r.played_on<'2020-01-06'),before.results.filter(r=>r.played_on<'2020-01-06'));
  const ex=proposal({from:'2020-01-06',exclusions:[{date:'2020-01-07',reason:'Excluir data'}]});
  await apply(db,id,ex,(await preview(db,id,ex)).token);
  assert.ok((await dashboard(db,id)).results.every(r=>r.played_on!=='2020-01-07'));
  await apply(db,id,p,(await preview(db,id,p)).token);
  assert.ok((await dashboard(db,id)).results.some(r=>r.played_on==='2020-01-07'));
  await db.exec('reset role');
  const rows=(await db.query("select * from private.calculate_tournament($1,'2020-01-06')",[id])).rows;
  assert.ok(rows.filter(r=>r.played_on==='2020-01-06').every(r=>r.result_kind==='pending'&&r.applied_score===0));
  await db.query('update public.tournaments set history_ready=false where id=$1',[id]);
  assert.ok((await db.query("select * from private.calculate_tournament($1,'2020-01-10')",[id])).rows.filter(r=>r.raw_score===null||r.raw_score===0).every(r=>r.result_kind==='pending'));
 } finally {await db.close();}
});

test('S5 configured creation is atomic, legacy create compatibility and empty period edits',async()=>{
 const db=await setup();
 try {
  await login(db,alice); const p=proposal();
  const id=(await db.query("select public.create_configured_tournament('Copa absoluta','2020-01-01','2020-01-10',$1) id",[p])).rows[0].id;
  assert.equal((await dashboard(db,id)).current_rule.scoring_mode,'absolute');
  await db.query("select public.update_tournament($1,'Copa absoluta','2020-02-01','2020-02-10')",[id]);
  assert.equal((await dashboard(db,id)).current_rule.effective_from,'2020-02-01');
  const count=(await db.query('select count(*) n from public.tournaments')).rows[0].n;
  await assert.rejects(db.query("select public.create_configured_tournament('Copa inválida','2020-01-01','2020-01-10',$1)",[proposal({penalty:500})]),/invalid_rule/);
  assert.equal((await db.query('select count(*) n from public.tournaments')).rows[0].n,count);
 } finally {await db.close();}
});

const operation=name=>readFile(new URL(`../supabase/rehearsal/sprint5/${name}.sql`,import.meta.url),'utf8');
test('S5 fresh backup/export/verify and recovery restore old schema without changing business data',async()=>{
 const db=await setup(false);
 try {
  const id=await tournament(db);await db.exec('reset role');
  await db.exec(await operation('01-backup'));
  const exported=(await db.exec(await operation('03-export'))).at(-1).rows[0];
  assert.ok(exported.backup_completo.snapshot.scores.length);assert.equal(exported.backup_completo.function_definitions.length,3);
  await assert.rejects(db.exec(await operation('01-backup')),/Backup ja existe/);await db.exec('rollback');
  await db.exec(await readFile(new URL(`../supabase/migrations/${migration}`,import.meta.url),'utf8'));
  const verify=async()=>(await db.exec(await operation('02-verify'))).find(r=>r.rows?.[0]?.different_sections!==undefined).rows[0];
  assert.equal(Number((await verify()).different_sections),0);
  await db.exec(await operation('04-recover-before-use'));
  assert.equal((await db.query("select to_regclass('public.tournament_rule_versions') name")).rows[0].name,null);
  assert.equal(Number((await verify()).different_sections),0);
  await login(db,alice);assert.equal((await dashboard(db,id)).access,true);
  await db.exec('reset role');
  assert.deepEqual((await db.exec(await operation('03-export'))).at(-1).rows[0],exported);
  // Re-apply and ensure recovery refuses a genuine S5 revision.
  await db.exec(await readFile(new URL(`../supabase/migrations/${migration}`,import.meta.url),'utf8'));
  await login(db,alice);const p=proposal();await apply(db,id,p,(await preview(db,id,p)).token);
  await db.exec('reset role');
  await assert.rejects(db.exec(await operation('04-recover-before-use')),/recuperacao automatica recusada/);await db.exec('rollback');
  assert.notEqual((await db.query("select to_regclass('public.tournament_rule_versions') name")).rows[0].name,null);
  await login(db,bob);await assert.rejects(db.query('select * from private.sprint5_backups'),/permission denied/);
 }finally {await db.close();}
});

test('S5 two confirmations of one preview serialize and failure during refresh rolls back the entire revision',async()=>{
 const db=await setup();
 try {
  const id=await tournament(db);const p=proposal();const pre=await preview(db,id,p);
  const attempts=await Promise.allSettled([apply(db,id,p,pre.token),apply(db,id,p,pre.token)]);
  assert.equal(attempts.filter(a=>a.status==='fulfilled').length,1);
  const data=await dashboard(db,id);await db.exec('reset role');
  const counts=(await db.query('select count(*) n from public.tournament_rule_versions where tournament_id=$1',[id])).rows[0].n;
  await db.exec(`create function private.reject_test_result() returns trigger language plpgsql as $$begin raise exception 'simulated_failure'; end$$;
   create trigger reject_test_result before update on public.tournament_score_results for each row execute function private.reject_test_result();`);
  await login(db,alice);const next=proposal({penalty:-2000});const pre2=await preview(db,id,next);
  await assert.rejects(apply(db,id,next,pre2.token),/simulated_failure/);
  await db.exec('reset role');assert.equal((await db.query('select count(*) n from public.tournament_rule_versions where tournament_id=$1',[id])).rows[0].n,counts);
  assert.deepEqual((await db.query('select to_jsonb(r) d from public.tournament_score_results r where tournament_id=$1 order by played_on,player_id',[id])).rows.map(r=>r.d),[...data.results].sort((a,b)=>a.played_on.localeCompare(b.played_on)||a.player_id.localeCompare(b.player_id)));
 }finally {await db.close();}
});

test('post-migration read-only structural checklist', async () => {
 const db = await setup(false);
 try {
  await tournament(db);
  await db.exec('reset role');
  await db.exec(await readFile(new URL(`../supabase/migrations/${migration}`, import.meta.url), 'utf8'));
  const results = await db.exec(await readFile(new URL('../supabase/rehearsal/sprint5/05-check-migration.sql', import.meta.url), 'utf8'));
  const rows = results.flatMap(result => result.rows ?? []);
  const baseline = rows.find(row => row.check_name === 'initial_versions');
  assert.equal(Number(baseline.tournaments), 1);
  assert.equal(Number(baseline.versions), 1);
  assert.equal(Number(baseline.inconsistent_tournaments), 0);
  const permissions = rows.find(row => row.check_name === 'schema_and_permissions');
  for (const [key, value] of Object.entries(permissions)) {
   if (key !== 'check_name') assert.equal(value, true, key);
  }
 } finally { await db.close(); }
});

test('pre-test S5 backup preserves versions and refuses overwrite', async () => {
 const db = await setup(false);
 try {
  await tournament(db);
  await db.exec('reset role');
  await db.exec(await readFile(new URL('../supabase/rehearsal/sprint5/01-backup.sql', import.meta.url), 'utf8'));
  await db.exec(await readFile(new URL(`../supabase/migrations/${migration}`, import.meta.url), 'utf8'));
  const script = await readFile(new URL('../supabase/rehearsal/sprint5/07-backup-before-tests.sql', import.meta.url), 'utf8');
  await db.exec(script);
  const b = (await db.query("select snapshot from private.sprint5_backups where id='before-s5-tests-v1'")).rows[0];
  assert.equal(b.snapshot.tournaments.length, 1);
  assert.equal(b.snapshot.rule_versions.length, 1);
  assert.deepEqual(b.snapshot.rule_revision_changes, []);
  const exported = await db.exec(await readFile(new URL('../supabase/rehearsal/sprint5/08-export-before-tests.sql', import.meta.url), 'utf8'));
  assert.equal(exported.flatMap(r => r.rows ?? [])[0].backup_completo.id, 'before-s5-tests-v1');
  const verification = await db.exec(await readFile(new URL('../supabase/rehearsal/sprint5/09-verify-before-tests.sql', import.meta.url), 'utf8'));
  const comparison = verification.flatMap(r => r.rows ?? []).find(r => r.id === 'before-s5-tests-v1');
  assert.equal(Number(comparison.different_sections), 0);
  assert.equal(comparison.checksum_backup, comparison.checksum_current);
  await assert.rejects(db.exec(script), /ja existe/);
  await db.exec('rollback');
  assert.equal(Number((await db.query('select count(*) n from private.sprint5_backups')).rows[0].n), 2);
 } finally { await db.close(); }
});

const singleRuleMigration = '202610030002_single_tournament_rule.sql';
const wholeProposal = (overrides={}) => proposal({scope:'tournament', ...overrides});
async function installSingleRule(db) {
 await db.exec('reset role');
 await db.exec(await readFile(new URL(`../supabase/migrations/${singleRuleMigration}`,import.meta.url),'utf8'));
 await login(db,alice);
}

test('single rule migration preserves full-period data, requires updated proposal and replaces whole rule',async()=>{
 const db=await setup();
 try {
  const id=await tournament(db);
  await db.exec('reset role');
  const stored=(await db.query('select to_jsonb(r) d from public.tournament_score_results r order by id')).rows;
  const computed=(await db.query("select * from private.calculate_tournament($1,'2020-01-11') order by played_on,player_id",[id])).rows;
  await installSingleRule(db);
  await db.exec('reset role');
  assert.deepEqual((await db.query('select to_jsonb(r) d from public.tournament_score_results r order by id')).rows,stored);
  assert.deepEqual((await db.query("select * from private.calculate_tournament($1,'2020-01-11') order by played_on,player_id",[id])).rows,computed);
  const scores=(await db.query('select to_jsonb(s) d from public.personal_scores s order by id')).rows;
  await login(db,alice);
  await assert.rejects(preview(db,id,proposal({from:'2020-01-02'})),/rule_scope_requires_updated_app/);
  const p=wholeProposal({schedule:'every_day'}); const pre=await preview(db,id,p);
  const before=(await dashboard(db,id)).rule_versions.length;
  assert.equal(before,1);
  await apply(db,id,p,pre.token);
  const d=await dashboard(db,id);
  assert.equal(d.rule_versions.length,2);
  assert.ok(d.results.every(r=>r.applied_rule_snapshot.mode==='absolute'));
  assert.ok(d.results.every(r=>r.applied_rule_snapshot.version===d.current_rule.version));
  await db.exec('reset role');
  assert.deepEqual((await db.query('select to_jsonb(s) d from public.personal_scores s order by id')).rows,scores);
 } finally {await db.close();}
});

test('single rule period changes preview new days, reconcile removed dates and restore without raw score edits',async()=>{
 const db=await setup();
 try {
  const id=await tournament(db); await installSingleRule(db);
  const extend=wholeProposal({from:'2019-12-30',to:'2020-01-12',schedule:'every_day'});
  const pre=await preview(db,id,extend);
  assert.ok(pre.changes.some(c=>c.day==='2020-01-11'));
  assert.equal((await dashboard(db,id)).tournament.starts_at,'2020-01-01');
  await apply(db,id,extend,pre.token);
  let d=await dashboard(db,id);
  assert.equal(d.tournament.starts_at,'2019-12-30');assert.equal(d.tournament.ends_at,'2020-01-12');
  assert.ok(d.results.some(r=>r.played_on==='2020-01-11'));
  assert.ok(!d.results.some(r=>r.played_on==='2019-12-30')); // Existing eligibility stays unchanged.
  const shrink=wholeProposal({from:'2020-01-02',to:'2020-01-05',schedule:'every_day'});
  const narrow=await preview(db,id,shrink);
  assert.ok(narrow.changes.some(c=>c.day==='2020-01-01'&&c.after===null));
  await apply(db,id,shrink,narrow.token);d=await dashboard(db,id);
  assert.ok(d.results.every(r=>r.played_on>='2020-01-02'&&r.played_on<='2020-01-05'));
  assert.ok(d.results.every(r=>r.applied_rule_snapshot.version===d.current_rule.version));
  await db.exec('reset role');
  assert.ok(Number((await db.query("select count(*) n from private.result_changes where tournament_id=$1 and new_data='null'::jsonb",[id])).rows[0].n)>0);
  await login(db,alice);
  const restore=wholeProposal({schedule:'every_day'});
  await apply(db,id,restore,(await preview(db,id,restore)).token);
  assert.ok((await dashboard(db,id)).results.some(r=>r.played_on==='2020-01-01'&&r.raw_score===10000));
  await assert.rejects(db.query("select public.update_tournament($1,'Nome','2020-01-02','2020-01-10')",[id]),/period_requires_rule_preview/);
  await db.query("select public.update_tournament($1,'Novo nome','2020-01-01','2020-01-10')",[id]);
 } finally {await db.close();}
});

test('single rule rejects silent conversion of partial revisions and retains old state on failure',async()=>{
 const db=await setup();
 try {
  const id=await tournament(db);
  const partial=proposal({from:'2020-01-02',to:'2020-01-03'});
  await apply(db,id,partial,(await preview(db,id,partial)).token);
  await db.exec('reset role');
  await assert.rejects(db.exec(await readFile(new URL(`../supabase/migrations/${singleRuleMigration}`,import.meta.url),'utf8')),/requires_full_period/);
  await db.exec('rollback');
  const diagnosis=await db.exec(await readFile(new URL('../supabase/rehearsal/sprint5/13-diagnose-partial-rules.sql',import.meta.url),'utf8'));
  const affected=diagnosis.flatMap(r=>r.rows??[]);
  assert.equal(affected.length,1);assert.equal(affected[0].tournament_id,id);
  assert.equal(affected[0].scoring_mode,'absolute');
  await login(db,alice);
  // Old interval API remains usable when the incremental migration rolls back.
  assert.equal((await preview(db,id,proposal())).proposal.from,'2020-01-01');
 } finally {await db.close();}
});

test('single rule includes expanded score inputs in freshness token and rejects invalid exclusions, closed and other actors',async()=>{
 const db=await setup();
 try {
  const id=await tournament(db); await installSingleRule(db);
  const p=wholeProposal({to:'2020-01-12',schedule:'every_day'});
  const pre=await preview(db,id,p);
  await db.exec('reset role');
  await db.query("insert into public.personal_scores(player_id,occurred_at,score) values($1,'2020-01-11 15:00Z',19000)",[alice]);
  await login(db,alice);
  await assert.rejects(apply(db,id,p,pre.token),/rule_preview_expired/);
  await assert.rejects(preview(db,id,wholeProposal({to:'2020-01-02',exclusions:[{date:'2020-01-03',reason:'Feriado'}]})),/invalid_exclusions/);
  await login(db,bob);await assert.rejects(preview(db,id,p),/tournament_not_allowed/);
  await login(db,alice);await db.query('select public.close_tournament($1)',[id]);
  await assert.rejects(preview(db,id,p),/tournament_closed/);
 } finally {await db.close();}
});

test('single rule configured creation and period failure roll back dates, version and audit together',async()=>{
 const db=await setup();
 try {
  await installSingleRule(db);
  const config=wholeProposal({schedule:'every_day',exclusions:[{date:'2020-01-03',reason:'Feriado'}]});
  const id=(await db.query("select public.create_configured_tournament('Torneio único','2020-01-01','2020-01-10',$1) id",[config])).rows[0].id;
  await db.query("select public.add_tournament_participant($1,$2,'2020-01-01')",[id,alice]);
  const p=wholeProposal({from:'2019-12-30',to:'2020-01-12',schedule:'every_day'});
  const pre=await preview(db,id,p);
  await db.exec('reset role');
  await db.exec(`create function private.fail_single_refresh() returns trigger language plpgsql as $$begin raise exception 'simulated_refresh_failure'; end $$;
   create trigger fail_single_refresh before insert on public.tournament_score_results for each row execute function private.fail_single_refresh();`);
  await login(db,alice);
  await assert.rejects(apply(db,id,p,pre.token),/simulated_refresh_failure/);
  await db.exec('reset role');await db.exec('drop trigger fail_single_refresh on public.tournament_score_results');await login(db,alice);
  const d=await dashboard(db,id);
  assert.equal(d.tournament.starts_at,'2020-01-01');assert.equal(d.tournament.ends_at,'2020-01-10');
  assert.equal(d.rule_versions.length,1);assert.equal(d.current_rule.exclusions[0].date,'2020-01-03');
  await db.exec('reset role');
  assert.equal(Number((await db.query('select count(*) n from private.rule_revision_changes where tournament_id=$1',[id])).rows[0].n),0);
 } finally {await db.close();}
});

test('single rule fresh backup/export/verify preserves reference across migration',async()=>{
 const db=await setup(false);
 try {
  await tournament(db);await db.exec('reset role');
  const script=async file=>readFile(new URL(`../supabase/rehearsal/sprint5/${file}`,import.meta.url),'utf8');
  await db.exec(await script('01-backup.sql'));
  await db.exec(await readFile(new URL(`../supabase/migrations/${migration}`,import.meta.url),'utf8'));
  await db.exec(await script('10-backup-before-single-rule.sql'));
  const output=await db.exec(await script('11-export-before-single-rule.sql'));
  assert.equal(output.flatMap(r=>r.rows??[])[0].backup_completo.function_definitions.length,7);
  await db.exec(await readFile(new URL(`../supabase/migrations/${singleRuleMigration}`,import.meta.url),'utf8'));
  const comparison=(await db.exec(await script('12-verify-single-rule.sql'))).flatMap(r=>r.rows??[]).find(r=>r.id==='before-s5-single-rule-v1');
  assert.equal(Number(comparison.different_sections),0);assert.equal(comparison.checksum_backup,comparison.checksum_current);
 }finally{await db.close();}
});
