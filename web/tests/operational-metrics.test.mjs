import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import {PGlite} from '@electric-sql/pglite';

const sql=()=>readFile(new URL('../supabase/migrations/202610180003_operational_metrics.sql',import.meta.url),'utf8');
const event=(extra={})=>({occurred_at:new Date().toISOString(),stage:'tournament_rpc',duration_ms:25,outcome:'success',...extra});
async function database(){const db=new PGlite();await db.exec('create role anon;create role authenticated;create role service_role;create schema private;grant usage on schema private to anon,authenticated,service_role;');await db.exec(await sql());return db;}
const send=(db,events)=>db.query('select public.record_operational_metrics($1::jsonb) r',[JSON.stringify(events)]);

test('RF24 restricts collection to server role, private reads to administrator and rejects arbitrary payload/identity/time',async()=>{
 const db=await database();try{
  for(const role of ['anon','authenticated']){
   await db.exec(`set role ${role}`);await assert.rejects(send(db,[event()]),/permission denied/);
   await assert.rejects(db.query('select * from private.operational_metrics'),/permission denied/);await db.exec('reset role');
  }
  await db.exec('set role service_role');assert.equal((await send(db,[event({code:'57014'})])).rows[0].r.accepted,1);
  await assert.rejects(db.query('select * from private.operational_metrics'),/permission denied/);
  for(const payload of [null,{},[],Array.from({length:33},()=>event()),[event({player_id:'private'})],[event({message:'private'})],[event({duration_ms:-1})],
   [event({duration_ms:1.5})],[event({duration_ms:3600001})],[event({stage:'anything'})],[event({outcome:'anything'})],[event({code:'NAME_OR_TOKEN'})],
   [event({occurred_at:'1900-01-01T00:00:00.000Z'})],[event({occurred_at:'9999-01-01T00:00:00.000Z'})],[event({stage:null})],[event(),event({email:'private'})]])await assert.rejects(send(db,payload));
  await db.exec('reset role');assert.equal((await db.query('select count(*)::integer n from private.operational_metrics')).rows[0].n,1);
 }finally{await db.close();}
});

test('RF24 administrative report separates denied/empty from failures and scheduler refuses activation without pg_cron',async()=>{
 const db=await database();try{
  await db.exec('set role service_role');
  await send(db,[event({duration_ms:10}),event({duration_ms:20,outcome:'error',code:'57014'}),event({duration_ms:30,outcome:'denied'}),event({duration_ms:40,outcome:'empty'})]);
  await db.exec('reset role');
  const report=await readFile(new URL('../supabase/operations/operational-metrics/03-report.sql',import.meta.url),'utf8');
  const tables=await db.exec(report);const row=tables.find(t=>t.rows?.[0]?.stage==='tournament_rpc').rows[0];
  assert.equal(Number(row.recorded_events),4);assert.equal(Number(row.recorded_failure_percent),25);assert.equal(Number(row.denied_results),1);assert.equal(Number(row.empty_results),1);
  assert.equal(row.median_ms,25);assert.equal(row.p95_ms,38.5);
  const schedule=await readFile(new URL('../supabase/operations/operational-metrics/02-schedule-purge.sql',import.meta.url),'utf8');
  await assert.rejects(db.exec(schedule),/Enable Supabase Cron/);await db.exec('rollback');
 }finally{await db.close();}
});

test('RF24 enforces atomic daily cap, accounts discarded events, purges expired metrics/counters and preserves accepted prefix without outcome bias',async()=>{
 const db=await database();try{
  await db.exec(`insert into private.operational_metrics_days(day,received,accepted) values((now() at time zone 'UTC')::date,4999,4999);
   insert into private.operational_metrics(occurred_at,stage,duration_ms,outcome) values(now()-interval '15 days','profile',1,'error');
   insert into private.operational_metrics_days(day,received,accepted) values((now() at time zone 'UTC')::date-15,1,1);`);
  await db.exec('set role service_role');
  assert.deepEqual((await send(db,[event(),event({outcome:'error'})])).rows[0].r,{accepted:1,discarded:1});
  const attempts=await Promise.all([send(db,[event()]),send(db,[event()])]);assert.ok(attempts.every(a=>a.rows[0].r.accepted===0));
  await db.exec('reset role');const day=(await db.query('select * from private.operational_metrics_days')).rows[0];
  assert.equal(day.accepted,5000);assert.equal(day.received,5003);assert.equal(day.discarded,3);
  const rows=(await db.query('select * from private.operational_metrics')).rows;assert.equal(rows.length,1);assert.equal(rows[0].outcome,'success');
  await db.exec("insert into private.operational_metrics(occurred_at,stage,duration_ms,outcome) values(now()-interval '15 days','profile',1,'error');select private.purge_operational_metrics();");
  await db.exec("insert into private.operational_metrics(occurred_at,received_on,stage,duration_ms,outcome) values(now(),(now() at time zone 'UTC')::date-14,'profile',1,'error');select private.purge_operational_metrics();");
  assert.equal((await db.query('select count(*)::integer n from private.operational_metrics')).rows[0].n,1);
 }finally{await db.close();}
});

test('RF24 request-scoped batching runs after response, sanitizes payload, times out fetch and swallows storage/scheduler failures',async()=>{
 const source=await readFile(new URL('../src/lib/operational-metrics.ts',import.meta.url),'utf8');
 const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const scheduled=[],calls=[],warnings=[],timeouts=[];let writeError=null,failSchedule=false,failWrite=false,networkStarted=false;
 const env={OPERATIONAL_METRICS_ENABLED:'true',NEXT_PUBLIC_SUPABASE_URL:'https://test.supabase.co',SUPABASE_METRICS_SECRET_KEY:'secret-server-key'};
 const deps={'server-only':{},'next/server':{after:cb=>{if(failSchedule)throw Error('schedule');scheduled.push(cb);}},
  '@supabase/supabase-js':{createClient:(url,key,options)=>{assert.equal(key,'secret-server-key');assert.equal(options.auth.persistSession,false);return {rpc:async(name,args)=>{
   networkStarted=true;calls.push({name,args});await options.global.fetch(url,{});if(failWrite)throw Error('secret payload');return {error:writeError};}};}},
  './dashboard-metrics':{measureDashboardQuery:async(stage,query,collect)=>{const result=await query;collect?.({stage,duration_ms:5,outcome:'success'});return result;}}};
 const exports={};vm.runInNewContext(compiled,{exports,Date,Math,process:{env},console:{warn:v=>warnings.push(v)},AbortSignal:{timeout:ms=>{timeouts.push(ms);return 'abort';}},fetch:async(_url,options)=>{assert.equal(options.signal,'abort');},require:n=>{assert.ok(n in deps,n);return deps[n];}});
 const measure=exports.createDashboardMetrics();const queryResult={data:'private'};
 assert.equal(await measure('profile',Promise.resolve(queryResult)),queryResult);assert.equal(networkStarted,false);
 await measure('tournaments',Promise.resolve(queryResult));assert.equal(scheduled.length,1);
 await scheduled.shift()();assert.equal(calls[0].args.events.length,2);assert.deepEqual(timeouts,[2000]);
 assert.doesNotMatch(JSON.stringify(calls),/private|secret-server-key|player_id/);
 await exports.persistOperationalMetrics([{...event({code:'PRIVATE_MESSAGE'}),email:'private@test',player_id:'private'}]);
 assert.ok(!('code' in calls.at(-1).args.events[0]));assert.doesNotMatch(JSON.stringify(calls),/private@test|player_id/);
 writeError={message:'private database detail'};await exports.persistOperationalMetrics([event()]);
 failWrite=true;await exports.persistOperationalMetrics([event()]);assert.ok(warnings.every(w=>!w.includes('secret')&&!w.includes('private')));
 failSchedule=true;assert.equal(await exports.createDashboardMetrics()('profile',Promise.resolve(queryResult)),queryResult);
 env.OPERATIONAL_METRICS_ENABLED='false';const count=calls.length;await exports.persistOperationalMetrics([event()]);assert.equal(calls.length,count);
 env.OPERATIONAL_METRICS_ENABLED='true';delete env.SUPABASE_METRICS_SECRET_KEY;await exports.persistOperationalMetrics([event()]);assert.equal(calls.length,count);
});
