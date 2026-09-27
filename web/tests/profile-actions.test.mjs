import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import * as profile from '../src/lib/profile.ts';
async function load(file,deps){
 const source=await readFile(new URL(file,import.meta.url),'utf8');
 const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
 const exports={}; vm.runInNewContext(outputText,{exports,process:{env:{}},require:name=>name==='@/lib/profile'?profile:deps[name]});return exports;
}
test('edição de perfil valida sessão e campos, usa identidade do servidor e traduz colisões',async()=>{
 let user=null; let error=null; const calls=[]; const paths=[];
 const actions=await load('../src/app/dashboard/profile/actions.ts',{
  'next/cache':{revalidatePath:(...args)=>paths.push(args)},
  '@/lib/supabase/server':{createClient:async()=>({auth:{getUser:async()=>({data:{user}})},rpc:async(...args)=>{calls.push(args);return {error};}})},
 });
 const form=new FormData();form.set('public_name','Ana');
 assert.match((await actions.saveProfile({},form)).error,/sessão/);assert.equal(calls.length,0);
 user={id:'own'};form.set('public_name','a@b.test');assert.ok((await actions.saveProfile({},form)).error);assert.equal(calls.length,0);
 form.set('public_name','  Ana  ');form.set('geoguessr_url','javascript:alert(1)');assert.ok((await actions.saveProfile({},form)).error);assert.equal(calls.length,0);
 form.set('geoguessr_url','');form.set('id','someone-else');
 assert.match((await actions.saveProfile({},form)).message,/salvo/);
 assert.equal(calls[0][0],'update_my_profile');assert.equal(calls[0][1].public_name,'Ana');assert.equal(calls[0][1].profile_url,null);assert.equal('id' in calls[0][1],false);
 assert.deepEqual(paths,[['/dashboard','layout']]);
 error={code:'23505',message:'public_name_unavailable'};assert.match((await actions.saveProfile({},form)).error,/já está em uso/);
 error={message:'internal password secret'};assert.doesNotMatch((await actions.saveProfile({},form)).error,/secret/);
});
test('cadastro exige nome e envia metadados; colisão após consulta é tratada sem expor erro interno',async()=>{
 const calls=[];let available=true;let signupError=null;
 const actions=await load('../src/app/auth/actions.ts',{
  'next/navigation':{},
  '@/lib/supabase/server':{createClient:async()=>({
   rpc:async()=>({data:available,error:null}),
   auth:{signUp:async data=>{calls.push(data);if(signupError)available=false;return {error:signupError};}},
  })},
 });
 const form=new FormData();form.set('email','example@test.test');form.set('password','abcdef');
 assert.ok((await actions.signUp({},form)).error);assert.equal(calls.length,0);
 form.set('public_name',' Ana ');assert.match((await actions.signUp({},form)).message,/Conta criada/);assert.equal(calls[0].options.data.display_name,'Ana');
 available=false;assert.match((await actions.signUp({},form)).error,/já está em uso/);assert.equal(calls.length,1);
 available=true;signupError={message:'database error'};assert.match((await actions.signUp({},form)).error,/já está em uso/);assert.equal(calls.length,2);
});
