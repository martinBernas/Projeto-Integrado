import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

test('S6 server action authenticates, validates reason/vote/confirmation and sends only expected RPC parameters',async()=>{
 const source=await readFile(new URL('../src/app/dashboard/tournaments/audit-actions.ts',import.meta.url),'utf8');
 const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
 let user=null,error=null;const calls=[],paths=[];
 const deps={'next/cache':{revalidatePath:p=>paths.push(p)},'@/lib/supabase/server':{createClient:async()=>({auth:{getUser:async()=>({data:{user}})},rpc:async(...args)=>{calls.push(args);return {error};}})}};
 const exports={};vm.runInNewContext(outputText,{exports,require:n=>deps[n]});
 const form=new FormData();const id='00000000-0000-4000-8000-000000000001';
 form.set('target',id);form.set('operation','request');form.set('score',id);
 assert.match((await exports.manageAudit({},form)).error,/sessão/);user={id};
 assert.match((await exports.manageAudit({},form)).error,/justificativa/);assert.equal(calls.length,0);
 form.set('reason','Justificativa válida');assert.ok((await exports.manageAudit({},form)).message);
 assert.equal(calls[0][0],'request_score_audit');assert.equal(calls[0][1].justification,'Justificativa válida');
 form.set('audit',id);form.set('operation','vote');form.set('selection','bad');
 assert.match((await exports.manageAudit({},form)).error,/voto/);
 form.set('selection','invalidate');assert.ok((await exports.manageAudit({},form)).message);assert.equal(calls.at(-1)[0],'vote_score_audit');
 form.set('operation','approve');assert.ok((await exports.manageAudit({},form)).message);assert.equal(calls.at(-1)[1].approve,true);
 form.set('operation','reject');assert.ok((await exports.manageAudit({},form)).message);assert.equal(calls.at(-1)[1].approve,false);
 form.set('operation','resolve');form.set('sanction','disregard');assert.match((await exports.manageAudit({},form)).error,/Confirme/);
 form.set('confirm','yes');assert.ok((await exports.manageAudit({},form)).message);assert.equal(calls.at(-1)[0],'resolve_score_audit');
 const count=paths.length;error={message:'audit_not_ready'};assert.match((await exports.manageAudit({},form)).error,/48 horas/);assert.equal(paths.length,count);
 error={message:'private database details'};assert.doesNotMatch((await exports.manageAudit({},form)).error,/private database/);
});
