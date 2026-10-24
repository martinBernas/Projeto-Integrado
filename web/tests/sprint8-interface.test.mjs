import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';
import * as crypto from 'node:crypto';
import * as webhook from '../src/lib/report-webhook.ts';

async function load(file,deps,globals={}){
 const source=await readFile(new URL(`../src/${file}`,import.meta.url),'utf8');
 const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}});
 const exports={};vm.runInNewContext(outputText,{exports,...globals,require:name=>{assert.ok(name in deps,name);return deps[name];}});return exports;
}

test('theme persists explicit choice, follows system only in system mode and survives blocked storage',async()=>{
 const dom={documentElement:{dataset:{preference:'system',theme:'light'}}};
 const handlers=new Map(),mediaHandlers=new Map();let blocked=false,saved,cleanup;
 const media={matches:false,addEventListener:(n,fn)=>mediaHandlers.set(n,fn),removeEventListener:n=>mediaHandlers.delete(n)};
 const window={addEventListener:(n,fn)=>handlers.set(n,fn),removeEventListener:n=>handlers.delete(n),dispatchEvent:event=>handlers.get(event.type)?.()};
 const {ThemePicker}=await load('app/theme-picker.tsx',{'react/jsx-runtime':jsx,react:{useEffect:fn=>{cleanup=fn();},useSyncExternalStore:(subscribe,get)=>{subscribe(()=>{});return get();}}},
  {document:dom,window,matchMedia:()=>media,Event,localStorage:{setItem:(_,v)=>{if(blocked)throw Error('disabled');saved=v;}}});
 const tree=ThemePicker();const select=tree.props.children.props.children[1];
 select.props.onChange({target:{value:'dark'}});assert.equal(dom.documentElement.dataset.theme,'dark');assert.equal(saved,'dark');
 media.matches=false;mediaHandlers.get('change')();assert.equal(dom.documentElement.dataset.theme,'dark');
 blocked=true;select.props.onChange({target:{value:'light'}});assert.equal(dom.documentElement.dataset.theme,'light');
 media.matches=true;select.props.onChange({target:{value:'system'}});assert.equal(dom.documentElement.dataset.theme,'dark');
 media.matches=false;mediaHandlers.get('change')();assert.equal(dom.documentElement.dataset.theme,'light');
 handlers.get('storage')({key:'geoguaras-theme',newValue:'dark'});assert.equal(dom.documentElement.dataset.theme,'dark');
 handlers.get('storage')({key:null,newValue:null});assert.equal(dom.documentElement.dataset.preference,'system');
 cleanup();assert.equal(mediaHandlers.size,0);
});

test('report actions require session and organizer status before privileged retry; withdrawal requires confirmation',async()=>{
 let user=null,status=null,error=null,processed=0;const calls=[];
 const {manageTournamentReport}=await load('app/dashboard/tournaments/report-actions.ts',{
  'next/cache':{revalidatePath:()=>{}},'@/lib/report-server':{runTournamentReports:async()=>{processed++;}},
  '@/lib/supabase/server':{createClient:async()=>({auth:{getUser:async()=>({data:{user}})},rpc:async(name,args)=>{calls.push([name,args]);return {data:status,error};}})},
 },{process:{env:{TOURNAMENT_REPORTS_ENABLED:'true'}}});
 const form=new FormData();form.set('target','00000000-0000-4000-8000-000000000001');form.set('operation','retry');
 assert.match((await manageTournamentReport({},form)).error,/sessão/);assert.equal(processed,0);
 user={id:'owner'};error={message:'forbidden'};assert.match((await manageTournamentReport({},form)).error,/indisponível/);assert.equal(processed,0);
 error=null;status={generated:false};assert.match((await manageTournamentReport({},form)).message,/Processamento/);assert.equal(processed,1);
 form.set('operation','withdraw');assert.match((await manageTournamentReport({},form)).error,/Confirme/);assert.ok(!calls.some(c=>c[0]==='withdraw_tournament'));
 form.set('confirm','yes');assert.match((await manageTournamentReport({},form)).message,/retirado/);assert.equal(calls.at(-1)[0],'withdraw_tournament');
});

test('worker requires secret and retired Resend webhook cannot change SMTP states',async()=>{
 const secret='whsec_'+Buffer.from('at-least-sixteen-characters').toString('base64');let events=0,workers=0;
 const env={TOURNAMENT_REPORTS_ENABLED:'true',RESEND_WEBHOOK_SECRET:secret,CRON_SECRET:'test-worker-secret'};
 const {POST}=await load('app/api/tournament-reports/webhook/route.ts',{'@/lib/report-server':{recordReportMailEvent:async(...args)=>{events++;assert.equal(args[0],'provider-test');}},'@/lib/report-webhook':webhook},{process:{env},Buffer,Response});
 const request=body=>new Request('https://example.test/webhook',{method:'POST',body});
 assert.equal((await POST(request('{}'))).status,410);
 assert.equal((await POST(request('a'.repeat(64001)))).status,410);assert.equal(events,0);
 const body=JSON.stringify({type:'email.delivered',created_at:new Date().toISOString(),data:{email_id:'provider-test',to:['private@example.test']}});
 const timestamp=String(Math.floor(Date.now()/1000));const signature=crypto.createHmac('sha256',Buffer.from(secret.slice(6),'base64')).update(`msg.${timestamp}.${body}`).digest('base64');
 const signed=new Request('https://example.test/webhook',{method:'POST',body,headers:{'svix-id':'msg','svix-timestamp':timestamp,'svix-signature':`v1,${signature}`}});
 assert.equal((await POST(signed)).status,410);assert.equal(events,0);
 const {GET}=await load('app/api/tournament-reports/route.ts',{'node:crypto':crypto,'@/lib/report-server':{runTournamentReports:async()=>{workers++;}}},{process:{env},Buffer,Response});
 assert.equal((await GET(new Request('https://example.test/worker'))).status,401);assert.equal(workers,0);
 assert.equal((await GET(new Request('https://example.test/worker',{headers:{authorization:'Bearer test-worker-secret'}}))).status,200);assert.equal(workers,1);
});
