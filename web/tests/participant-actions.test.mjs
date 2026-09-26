import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

test('ações de participantes validam sessão, seleção, data e confirmação antes de chamar RPC', async () => {
  const source=await readFile(new URL('../src/app/dashboard/tournaments/participant-actions.ts',import.meta.url),'utf8');
  const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
  const calls=[]; const paths=[]; let user=null; let error=null;
  const dependencies={
    'next/cache':{revalidatePath:path=>paths.push(path)},
    '@/lib/supabase/server':{createClient:async()=>({auth:{getUser:async()=>({data:{user}})},rpc:async(...args)=>{calls.push(args);return {error};}})},
  };
  const exports={}; vm.runInNewContext(outputText,{exports,require:name=>{assert.ok(name in dependencies);return dependencies[name];}});
  const form=new FormData();
  form.set('operation','add');form.set('target','00000000-0000-4000-8000-000000000001');
  form.set('player','00000000-0000-4000-8000-000000000002');form.set('eligible','2026-09-01');
  assert.match((await exports.manageParticipant({},form)).error,/sessão/);
  user={id:'organizer'};
  assert.match((await exports.manageParticipant({},form)).error,/Confirme/);
  form.set('confirm','yes');form.set('eligible','2026-02-30');
  assert.match((await exports.manageParticipant({},form)).error,/data/);
  assert.equal(calls.length,0);
  form.set('eligible','2026-09-01');
  assert.ok((await exports.manageParticipant({},form)).message);
  assert.equal(calls[0][0],'add_tournament_participant');
  assert.equal(calls[0][1].player,form.get('player'));assert.equal(paths.length,3);
  error={message:'tournament_closed'};form.set('operation','update');
  assert.match((await exports.manageParticipant({},form)).error,/encerrado/);
  assert.equal(paths.length,3);
  error={message:'secret details'};
  assert.doesNotMatch((await exports.manageParticipant({},form)).error,/secret/);
  error=null;form.set('operation','remove');
  assert.match((await exports.manageParticipant({},form)).message,/preservadas/);
  assert.equal(calls.at(-1)[0],'remove_tournament_participant');
  form.set('operation','complete');form.delete('player');
  assert.ok((await exports.manageParticipant({},form)).message);
  assert.equal(calls.at(-1)[0],'complete_tournament_history');
});
