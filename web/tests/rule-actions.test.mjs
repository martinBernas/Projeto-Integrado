import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import * as rules from '../src/lib/rules.ts';

test('S5 actions: valid dates, session, explicit confirmation, changed preview and no revalidation on preview',async()=>{
 const source=await readFile(new URL('../src/app/dashboard/tournaments/rule-actions.ts',import.meta.url),'utf8');
 const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
 const calls=[]; const paths=[]; let user=null; let error=null;
 const deps={'@/lib/rules':rules,'next/cache':{revalidatePath:p=>paths.push(p)},
 '@/lib/supabase/server':{createClient:async()=>({auth:{getUser:async()=>({data:{user}})},
 rpc:async(...args)=>{calls.push(args);return {data:{token:'a'.repeat(32)},error};}})}};
 const exports={};vm.runInNewContext(outputText,{exports,require:n=>deps[n]});
 const f=new FormData(); f.set('target','00000000-0000-4000-8000-000000000001'); f.set('operation','preview');
 for(const [k,v] of Object.entries({rule_from:'2026-10-01',rule_to:'2026-10-31',mode:'absolute',penalty:'0',
 schedule:'monday_to_friday',exclusions:'2026-10-12 | Feriado',reason:'Alterar o modo'})) f.set(k,v);
 assert.match((await exports.reviseRules({},f)).error,/sessão/); assert.equal(calls.length,0);
 user={id:'owner'}; f.set('rule_from','2026-02-30');assert.match((await exports.reviseRules({},f)).error,/Confira/);
 assert.equal(calls.length,0);f.set('rule_from','2026-10-01');
 assert.equal((await exports.reviseRules({},f)).preview.token,'a'.repeat(32));assert.equal(paths.length,0);
 assert.equal(calls.at(-1)[0],'preview_tournament_rules');assert.equal(calls.at(-1)[1].proposal.scope,'tournament');
 f.set('operation','apply'); const previous=calls.length;
 assert.match((await exports.reviseRules({},f)).error,/confirme/);assert.equal(calls.length,previous);
 f.set('confirm','yes');f.set('token','a'.repeat(32));f.set('proposal','{}'); error={message:'rule_preview_expired'};
 assert.match((await exports.reviseRules({},f)).error,/nova prévia/);assert.equal(paths.length,0);
 error={message:'secret server detail'};assert.doesNotMatch((await exports.reviseRules({},f)).error,/secret/);
 error=null;assert.match((await exports.reviseRules({},f)).message,/aplicada/);assert.equal(paths.length,3);
 assert.equal(calls.at(-1)[0],'apply_tournament_rules');
});

test('S5 fields reject duplicate exclusions, wrong interval and missing separators; fixed timezone absent from proposal',()=>{
 const f=new FormData();for(const [k,v]of Object.entries({start:'2026-10-01',end:'2026-10-31',mode:'absolute',penalty:'-1000',schedule:'monday_to_friday'}))f.set(k,v);
 assert.ok(rules.parseRuleFields(f)); assert.ok(!('timezone' in rules.parseRuleFields(f)));
 for(const text of ['2026-10-12 Feriado','2026-10-12x','2026-11-01 | Feriado','2026-10-12 | abc\n2026-10-12 | def']){
  f.set('exclusions',text);assert.equal(rules.parseRuleFields(f),null);
 }
});
