import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import * as tournament from '../src/lib/tournament.ts';
import * as changes from '../src/lib/score-changes.ts';

async function load(file,deps) {
 const source=await readFile(new URL(`../src/${file}`,import.meta.url),'utf8');
 const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}});
 const exports={}; vm.runInNewContext(outputText,{exports,Date,Intl,require:name=>{assert.ok(name in deps,name);return deps[name];}}); return exports;
}
test('retroactive actions validate session, calendar, text, score and confirmation; use authorized RPCs and safe messages',async()=>{
 let user=null,error=null;const calls=[],paths=[];
 const actions=await load('app/dashboard/score-changes/actions.ts',{
  '@/lib/score-changes':changes,'next/cache':{revalidatePath:(...args)=>paths.push(args)},
  '@/lib/supabase/server':{createClient:async()=>({auth:{getUser:async()=>({data:{user}})},rpc:async(...args)=>{calls.push(args);return {error};}})},
 });
 const form=new FormData(); form.set('operation','submit');form.set('day','2020-01-01');form.set('score','8000');form.set('reason','Corrigir digitação');
 assert.match((await actions.manageScoreChange({},form)).error,/sessão/); user={id:'p'};
 assert.match((await actions.manageScoreChange({},form)).error,/Confirme/);form.set('confirm','yes');
 form.set('day','2020-02-30');assert.match((await actions.manageScoreChange({},form)).error,/data anterior/);
 form.set('day','9999-01-01');assert.match((await actions.manageScoreChange({},form)).error,/data anterior/);
 form.set('day','2020-01-01');form.set('score','25001');assert.match((await actions.manageScoreChange({},form)).error,/inteira/);
 form.set('score','8000');form.set('reason','  ');assert.match((await actions.manageScoreChange({},form)).error,/justificativa/);assert.equal(calls.length,0);
 form.set('reason','Corrigir digitação');assert.match((await actions.manageScoreChange({},form)).message,/Histórico pessoal atualizado/);
 assert.equal(calls[0][0],'submit_retroactive_score');assert.deepEqual(JSON.parse(JSON.stringify(calls[0][1])),{game_day:'2020-01-01',raw_score:8000,justification:'Corrigir digitação'});
 assert.deepEqual(paths[0],['/dashboard','layout']);
 error={message:'score_change_pending'};assert.match((await actions.manageScoreChange({},form)).error,/todos aceitarem/);
 form.set('operation','review');form.set('decision','00000000-0000-4000-8000-000000000001');form.set('selection','approve');
 error={message:'audit_pending'};assert.match((await actions.manageScoreChange({},form)).error,/auditoria/);
 error=null;await actions.manageScoreChange({},form);assert.equal(calls.at(-1)[0],'review_score_change');assert.equal(calls.at(-1)[1].approve,true);
 form.set('selection','reject');await actions.manageScoreChange({},form);assert.equal(calls.at(-1)[1].approve,false);
 error={message:'secret database text'};assert.doesNotMatch((await actions.manageScoreChange({},form)).error,/secret/);
});

test('retroactive screen renders independent states, safe justification, dates, paging, audit block and retry without false empty',async()=>{
 let user={id:'p'},error=null,summaryError=null;
 const data={has_more:true,changes:[{id:'c',player_id:'p',player_name:'Pessoa',played_on:'2020-01-01',old_score:10000,new_score:8000,
  reason:'<script>texto</script>',requested_at:'2026-10-18T20:00Z',decisions:[
   {id:'pending',tournament_name:'Primeiro',old_score:10000,status:'pending',can_review:true,audit_blocked:true},
   {id:'rejected',tournament_name:'Segundo',old_score:null,status:'rejected',can_review:false,decided_at:'2026-10-18T21:00Z',decided_by_name:'Organizador'},
   {id:'approved',tournament_name:'Terceiro',old_score:0,status:'approved',can_review:false},
  ]}]};
 const forms=await load('app/dashboard/score-changes/forms.tsx',{'react/jsx-runtime':jsx,'react':{useActionState:()=>[{},()=>{},false]},'./actions':{manageScoreChange:()=>{}}});
 const deps={'react/jsx-runtime':jsx,'next/link':{default:({children,...props})=>jsx.jsx('a',{...props,children})},
  'next/navigation':{redirect:()=>{throw Error('redirect');}},'@/lib/tournament':tournament,'./forms':forms,'../retry-load':{RetryLoad:()=>jsx.jsx('button',{children:'Tentar novamente'})},
  '@/lib/supabase/server':{createClient:async()=>({auth:{getUser:async()=>({data:{user}})},rpc:async name=>name==='get_score_changes'?{data,error}:{data:{pending_approvals:1,pending_days:1},error:summaryError}})},
 };
 const page=await load('app/dashboard/score-changes/page.tsx',deps);
 const render=async()=>renderToStaticMarkup(await page.default({searchParams:Promise.resolve({page:'1'})}));
 const html=await render();
 for(const text of ['Histórico pessoal','Aguardando decisão','Aprovada','Recusada','Sem lançamento (ausência)','&lt;script&gt;','Mais antigas','Mais recentes','auditoria pendente','name="reason"','name="day"','maxLength="1000"'])assert.ok(html.includes(text),text);
 assert.doesNotMatch(html,/<script>texto<\/script>/);assert.match(html,/<button[^>]+disabled=""[^>]*>Aprovar e recalcular/);
 error={message:'private details'};const failure=await render();assert.match(failure,/Tentar novamente/);assert.doesNotMatch(failure,/Nenhuma solicitação|private details/);
 error=null;summaryError={message:'bad'};assert.match(await render(),/Não foi possível carregar/);
 summaryError=null;data.changes=[];assert.match(await render(),/Nenhuma solicitação/);
 user=null;await assert.rejects(render(),/redirect/);
});
