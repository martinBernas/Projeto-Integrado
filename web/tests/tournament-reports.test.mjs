import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { tournamentReport } from '../src/lib/tournament-report.ts';
import { renderTournamentPdf } from '../src/lib/tournament-report-pdf.ts';
import { processReport } from '../src/lib/report-processing.ts';
import { verifyReportWebhook } from '../src/lib/report-webhook.ts';
import { createHmac } from 'node:crypto';

const owner='00000000-0000-4000-8000-000000000001',player='00000000-0000-4000-8000-000000000002',outsider='00000000-0000-4000-8000-000000000003';
const snapshot={tournament:{id:'test',name:'Torneio de São Paulo — evolução',starts_at:'2020-01-01',ends_at:'2020-01-04',closed_at:'2020-01-05T12:00:00Z'},
 participants:[{id:'a',name:'André',eligible_from:'2020-01-01'},{id:'b',name:'Bárbara',eligible_from:'2020-01-01'}],
 results:[]};
for(const [i,values] of [[100,80],[50,90],[70,50],[80,60]].entries())for(const [j,value]of values.entries())snapshot.results.push({player_id:j?'b':'a',played_on:`2020-01-0${i+1}`,applied_score:value,raw_score:value,result_kind:'score',provisional:false,applied_rule_snapshot:{version:'test',minimum_positive:0}});

test('RF19 reconstructs cumulative positions, ignores intermediate ties and counts unordered pairs',()=>{
 const result=tournamentReport(snapshot);
 assert.deepEqual(result.points.map(p=>[p.positions.a,p.positions.b]),[[1,2],[2,1],[1,1],[1,2]]);
 assert.equal(result.rivalries.length,1);assert.equal(result.rivalries[0].swaps,2);
 assert.deepEqual(result.ranking.map(p=>p.total),[300,280]);
 const unchanged=structuredClone(snapshot);unchanged.results=unchanged.results.filter(r=>r.played_on!=='2020-01-02');
 assert.equal(tournamentReport(unchanged).rivalries.length,0);
 const empty=structuredClone(snapshot);empty.participants=[];assert.equal(tournamentReport(empty).ranking.length,0);
 const late=structuredClone(snapshot);late.participants[1].eligible_from='2020-01-04';
 assert.equal(tournamentReport(late).points[0].positions.b,undefined);assert.equal(tournamentReport(late).rivalries.length,0);
 const pending=structuredClone(snapshot);pending.results[0].provisional=true;assert.throws(()=>tournamentReport(pending),/not_consolidated/);
});

test('PDF renders all dates, ranking and pair counts without remote resources',async()=>{
 const pdf=await renderTournamentPdf(snapshot);assert.equal(pdf.subarray(0,5).toString(),'%PDF-');assert.ok(pdf.length>5000);
 // Synthetic fixture only, available for visual QA without personal data.
 await mkdir(new URL('../tmp/pdfs/',import.meta.url),{recursive:true});
 await writeFile(new URL('../tmp/pdfs/sprint-8-example.pdf',import.meta.url),pdf);
});

test('outbox saves PDF before sending, preserves partial success and releases lease on failure',async()=>{
 const calls=[];const job={id:'t',token:'lease',snapshot,pdf:null,deliveries:[{id:'1',email:'a@example.test'},{id:'2',email:'b@example.test'}]};
 const rpc=async(name,args)=>{calls.push([name,args]);return {data:name==='claim_tournament_report'?job:null,error:null};};
 const result=await processReport(rpc,async()=>Buffer.from('pdf'),async(_,d)=>{if(d.id==='2')throw Error('network');return 'provider-1';},'t');
 assert.equal(result.failed,true);assert.equal(calls[1][0],'save_tournament_report');
 assert.equal(calls.filter(c=>c[0]==='complete_gmail_tournament_delivery').length,1);
 assert.equal(calls.find(c=>c[0]==='fail_gmail_tournament_delivery')[1].retryable,false);
 assert.equal(calls.at(-1)[0],'release_tournament_report');assert.equal(calls.at(-1)[1].failure,'processing_failed');
 const saved=structuredClone(job);saved.pdf='cGRm';saved.deliveries=[];
 let rendered=false;await processReport(async name=>({data:name==='claim_tournament_report'?saved:null,error:null}),async()=>{rendered=true;return Buffer.from('bad');},async()=> 'unused');assert.equal(rendered,false);
});

test('webhook validates raw-body HMAC, multiple signatures and timestamp; rejects tampering',()=>{
 const secret='whsec_'+Buffer.from('test-secret-at-least-16').toString('base64'),now=Date.now(),timestamp=String(Math.floor(now/1000)),body='{"type":"email.delivered"}';
 const signature=createHmac('sha256',Buffer.from('test-secret-at-least-16')).update(`msg.${timestamp}.${body}`).digest('base64');
 const headers=new Headers({'svix-id':'msg','svix-timestamp':timestamp,'svix-signature':`v1,bad v1,${signature}`});
 assert.equal(verifyReportWebhook(body,headers,secret,now),true);assert.equal(verifyReportWebhook(body+' ',headers,secret,now),false);
 assert.equal(verifyReportWebhook(body,headers,secret,now+301000),false);
});

async function login(db,id,role='authenticated'){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id??'']);await db.exec(`set role ${role}`);}
async function setup(gmail=false){
 const db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;
 create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth,public to anon,authenticated,service_role;`);
 for(const f of (await readdir(new URL('../supabase/migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')&&f<'202610240001').sort())await db.exec(await readFile(new URL(`../supabase/migrations/${f}`,import.meta.url),'utf8'));
 await db.exec('grant select,insert,update,delete on all tables in schema public to anon,authenticated');
 for(const [id,name]of [[owner,'Organizador'],[player,'Jogador'],[outsider,'Externo']])await db.query('insert into auth.users(id,email,raw_user_meta_data) values($1,$2,$3)',[id,`${id}@example.test`,JSON.stringify({display_name:name})]);
 await login(db,owner);
 const ids=[];
 for(let i=0;i<3;i++){
  const id=(await db.query("select public.create_tournament('Relatório teste','2020-01-01','2020-01-02') id")).rows[0].id;ids.push(id);
  for(const p of [owner,player])await db.query("select public.add_tournament_participant($1,$2,'2020-01-01')",[id,p]);
 }
 await db.query('select public.close_tournament($1)',[ids[2]]);
 await db.exec('reset role');
 const before=(await db.query('select to_jsonb(t) data from public.tournaments t order by id')).rows;
 await db.exec(await readFile(new URL('../supabase/operations/tournament-reports/01-backup-before-install.sql',import.meta.url),'utf8'));
 const exported=await db.exec(await readFile(new URL('../supabase/operations/tournament-reports/02-export-backup-private.sql',import.meta.url),'utf8'));
 const backup=exported[0].rows[0].backup;
 await mkdir(new URL('../tmp/',import.meta.url),{recursive:true});
 await writeFile(new URL('../tmp/sprint8-backup-synthetic.json',import.meta.url),JSON.stringify(backup));
 assert.equal(Object.keys(backup.snapshot).length,21);assert.ok(backup.function_definitions.length>30);
 assert.equal((await db.query('select md5($1::jsonb::text) value',[JSON.stringify(backup.snapshot)])).rows[0].value,backup.snapshot_md5);
 await db.exec(await readFile(new URL('../supabase/migrations/202610240001_tournament_reports.sql',import.meta.url),'utf8'));
 await db.exec(await readFile(new URL('../supabase/operations/tournament-reports/03-verify-after-install.sql',import.meta.url),'utf8'));
 assert.deepEqual((await db.query('select to_jsonb(t) data from public.tournaments t order by id')).rows,before);
 assert.equal((await db.query('select count(*)::int n from private.tournament_reports')).rows[0].n,0);
 await login(db,owner);await db.query('select public.close_tournament($1)',[ids[0]]);
 if(gmail){
  await db.exec('reset role');
  await db.exec(await readFile(new URL('../supabase/operations/gmail-reports/01-backup-before-install.sql',import.meta.url),'utf8'));
  const exported=await db.exec(await readFile(new URL('../supabase/operations/gmail-reports/02-export-backup-private.sql',import.meta.url),'utf8'));
  assert.equal(Object.keys(exported[0].rows[0].backup.snapshot).length,24);
  await writeFile(new URL('../tmp/gmail-backup-synthetic.json',import.meta.url),JSON.stringify(exported[0].rows[0].backup));
  await db.exec(await readFile(new URL('../supabase/migrations/202610240002_gmail_report_delivery.sql',import.meta.url),'utf8'));
  await db.exec(await readFile(new URL('../supabase/operations/gmail-reports/03-verify-after-install.sql',import.meta.url),'utf8'));
  await login(db,owner);
 }
 return {db,ids};
}

test('real SQL closure snapshot, delivery confirmations, privacy, withdrawal, retries and preservation',async()=>{
 const {db,ids}=await setup();const target=ids[0];
 try{
  const status=(await db.query('select public.get_tournament_report_status($1) d',[target])).rows[0].d;
  assert.equal(status.recipients,2);assert.equal(status.generated,false);
  await assert.rejects(db.query('select public.withdraw_tournament($1)',[target]),/delivery_pending/);
  await assert.rejects(db.query('select public.claim_tournament_report($1)',[target]),/permission denied/);
  await assert.rejects(db.query('select * from private.tournament_reports'),/permission denied/);
  await login(db,player);await assert.rejects(db.query('select public.get_tournament_report_status($1)',[target]),/not_allowed/);
  await login(db,outsider);await assert.rejects(db.query('select public.withdraw_tournament($1)',[target]),/not_allowed/);
  await login(db,null,'service_role');
  const job=(await db.query('select public.claim_tournament_report($1) d',[target])).rows[0].d;
  assert.equal(job.snapshot.participants.length,2);assert.equal(job.deliveries.length,2);
  assert.equal((await db.query('select public.claim_tournament_report($1) d',[target])).rows[0].d,null);
  await assert.rejects(db.query('select public.save_tournament_report($1,$2,$3)',[target,outsider,Buffer.alloc(120).toString('base64')]),/lease_lost/);
  await db.query('select public.save_tournament_report($1,$2,$3)',[target,job.token,Buffer.alloc(120).toString('base64')]);
  for(const [i,d]of job.deliveries.entries()){
   await db.query('select public.begin_tournament_delivery($1,$2,$3)',[target,job.token,d.id]);
   // Confirm one event before the API response, the other afterwards.
   if(!i)await db.query("select public.record_tournament_mail_event($1,'email.delivered',now())",[`provider-${i}`]);
   await db.query('select public.complete_tournament_delivery($1,$2,$3,$4)',[target,job.token,d.id,`provider-${i}`]);
  }
  await db.query('select public.release_tournament_report($1,$2)',[target,job.token]);
  await login(db,owner);await assert.rejects(db.query('select public.withdraw_tournament($1)',[target]),/delivery_pending/);
  await login(db,null,'service_role');await db.query("select public.record_tournament_mail_event('provider-1','email.delivered',now())");
  assert.equal((await db.query('select public.withdraw_due_tournaments() n')).rows[0].n,0);
  await login(db,owner);await db.query('select public.withdraw_tournament($1)',[target]);
  assert.equal((await db.query('select id from public.tournaments where id=$1',[target])).rows.length,0);
  const dashboard=(await db.query('select public.get_tournament_dashboard($1) d',[target])).rows[0].d;assert.equal(dashboard.access,false);
  await assert.rejects(db.query('select public.get_managed_participants($1)',[target]),/not_allowed/);
  await assert.rejects(db.query('select public.list_participant_candidates($1)',[target]),/not_allowed/);
  await assert.rejects(db.query('select public.get_score_audits($1)',[target]),/not_allowed/);
  const notifications=(await db.query('select public.get_tournament_notifications() d')).rows[0].d;
  assert.ok(!notifications.managed_tournaments.some(t=>t.id===target));
  await login(db,player);assert.equal((await db.query('select id from public.tournaments where id=$1',[target])).rows.length,0);
  await db.exec('reset role');
  const stored=(await db.query('select * from private.tournament_reports where tournament_id=$1',[target])).rows[0];
  assert.equal(stored.snapshot,null);assert.equal(stored.pdf_base64,null);assert.ok(stored.withdrawn_at);
  assert.equal((await db.query('select count(*)::int n from private.tournament_report_deliveries where email is not null and tournament_id=$1',[target])).rows[0].n,0);
  assert.equal((await db.query('select count(*)::int n from public.tournament_participants where tournament_id=$1',[ids[1]])).rows[0].n,2);
  assert.equal((await db.query('select count(*)::int n from public.profiles')).rows[0].n,3);
 }finally{await db.close();}
});

test('automatic withdrawal honors 168 hours, keeps failed/uncertain jobs, and closure stays idempotent',async()=>{
 const {db,ids}=await setup();const target=ids[0];
 try{
  await db.query('select public.close_tournament($1)',[target]);await db.exec('reset role');
  const due=(await db.query("select due_at=created_at+interval '168 hours' ok from private.tournament_reports where tournament_id=$1",[target])).rows[0].ok;assert.equal(due,true);
  await db.query("update private.tournament_reports set generated_at=now(),pdf_base64='example',due_at=now()-interval '1 minute' where tournament_id=$1",[target]);
  await db.query("update private.tournament_report_deliveries set state='sending',first_attempt_at=now()-interval '25 hours' where tournament_id=$1",[target]);
  await login(db,null,'service_role');const job=(await db.query('select public.claim_tournament_report($1) d',[target])).rows[0].d;
  assert.equal(job.deliveries.length,0);await db.query('select public.release_tournament_report($1,$2)',[target,job.token]);
  assert.equal((await db.query('select public.withdraw_due_tournaments() n')).rows[0].n,0);
  await db.exec('reset role');assert.equal((await db.query("select count(*)::int n from private.tournament_report_deliveries where state='uncertain'")).rows[0].n,2);
  await db.query("update private.tournament_report_deliveries set state='sent' where tournament_id=$1",[target]);
  await login(db,null,'service_role');assert.equal((await db.query('select public.withdraw_due_tournaments() n')).rows[0].n,1);
  assert.equal((await db.query('select public.withdraw_due_tournaments() n')).rows[0].n,0);
 }finally{await db.close();}
});

test('Gmail incremental preserves existing queue; only SMTP acceptance completes sends; old webhook/server RPCs revoked',async()=>{
 const {db,ids}=await setup(true),target=ids[0];
 try{
  await assert.rejects(db.query('select public.complete_gmail_tournament_delivery($1,$2,$3,$4)',[target,owner,player,'smtp-id']),/permission denied/);
  await login(db,null,'service_role');
  await assert.rejects(db.query("select public.record_tournament_mail_event('old','email.delivered',now())"),/permission denied/);
  const job=(await db.query('select public.claim_tournament_report($1) d',[target])).rows[0].d;
  await db.query('select public.save_tournament_report($1,$2,$3)',[target,job.token,Buffer.alloc(120).toString('base64')]);
  for(const d of job.deliveries){
   await db.query('select public.begin_gmail_tournament_delivery($1,$2,$3)',[target,job.token,d.id]);
   await db.query('select public.complete_gmail_tournament_delivery($1,$2,$3,$4)',[target,job.token,d.id,`<${d.id}@gmail.com>`]);
   // A lost completion acknowledgement must not undo a committed success.
   await db.query('select public.fail_gmail_tournament_delivery($1,$2,$3,false)',[target,job.token,d.id]);
  }
  await db.query('select public.release_tournament_report($1,$2)',[target,job.token]);
  await login(db,owner);
  assert.equal((await db.query('select public.get_tournament_report_status($1) d',[target])).rows[0].d.sent,2);
  await db.query('select public.withdraw_tournament($1)',[target]);
  assert.equal((await db.query('select id from public.tournaments where id=$1',[target])).rows.length,0);
 }finally{await db.close();}
});

test('Gmail safely retries explicit rejection but quarantines interrupted SMTP immediately without automatic duplicate',async()=>{
 const {db,ids}=await setup(true),target=ids[0];
 try{
  await login(db,null,'service_role');
  const job=(await db.query('select public.claim_tournament_report($1) d',[target])).rows[0].d;
  await db.query('select public.save_tournament_report($1,$2,$3)',[target,job.token,Buffer.alloc(120).toString('base64')]);
  const [safe,unknown]=job.deliveries;
  await db.query('select public.begin_gmail_tournament_delivery($1,$2,$3)',[target,job.token,safe.id]);
  await db.query('select public.fail_gmail_tournament_delivery($1,$2,$3,true)',[target,job.token,safe.id]);
  await db.query('select public.begin_gmail_tournament_delivery($1,$2,$3)',[target,job.token,unknown.id]);
  await db.exec('reset role');
  await db.query("update private.tournament_reports set lease_until=now()-interval '1 second' where tournament_id=$1",[target]);
  await login(db,null,'service_role');
  const retry=(await db.query('select public.claim_tournament_report($1) d',[target])).rows[0].d;
  assert.deepEqual(retry.deliveries.map(d=>d.id),[safe.id]);
  await assert.rejects(db.query('select public.begin_gmail_tournament_delivery($1,$2,$3)',[target,retry.token,unknown.id]),/not_retryable/);
  await assert.rejects(db.query('select public.complete_gmail_tournament_delivery($1,$2,$3,$4)',[target,job.token,safe.id,'old-lease']),/lease_lost/);
  await db.query('select public.release_tournament_report($1,$2)',[target,retry.token]);
  await login(db,owner);await assert.rejects(db.query('select public.withdraw_tournament($1)',[target]),/delivery_pending/);
 }finally{await db.close();}
});
