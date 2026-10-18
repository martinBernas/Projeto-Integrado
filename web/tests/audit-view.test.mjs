import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import * as tournament from '../src/lib/tournament.ts';
import * as audits from '../src/lib/audits.ts';

test('S6 page renders requests, secret own vote, organizer approval, deadline, adjudication and history',async()=>{
 const id='00000000-0000-4000-8000-000000000001';
 const dashboard={access:true,tournament:{id,name:'Torneio teste',closed_at:null},participants:[{id:'p',name:'Jogador teste'}],
  results:[{player_id:'p',personal_score_id:'available',played_on:'2020-01-02',raw_score:12000,result_kind:'score'}]};
 const base={id:'audit',personal_score_id:'score',player_id:'p',played_on:'2020-01-01',raw_score:10000,reason:'Evidência da partida',requested_at:'2026-10-11T12:00Z',
  deadline:null,resolved_at:null,resolution_reason:null,my_vote:null,can_vote:false,invalid_votes:null,maintain_votes:null,before_results:null,after_results:null};
 const evaluation={server_now:'2026-10-11T12:00Z',organizer:true,participant:true,audits:[
  {...base,id:'requested',status:'requested'},
  {...base,id:'open',status:'open',deadline:'2026-10-12T12:00Z',can_vote:true,my_vote:'maintain'},
  {...base,id:'expired',status:'open',deadline:'2026-10-10T12:00Z'},
  {...base,id:'resolved',status:'invalidated',resolved_at:'2026-10-11T11:00Z',punishment:'penalty',penalty:-2500,invalid_votes:2,maintain_votes:1,
   before_results:[{player_id:'p',applied_score:0}],after_results:[{player_id:'p',applied_score:-2500}]},
 ]};
 const deps={'react/jsx-runtime':jsx,'next/link':{default:({children,...props})=>jsx.jsx('a',{...props,children})},'next/navigation':{redirect:()=>{throw Error('redirect');}},
  '@/lib/supabase/server':{createClient:async()=>({auth:{getUser:async()=>({data:{user:{id:'p'}}})},rpc:async name=>({data:name==='get_score_audits'?evaluation:dashboard})})},
  '@/lib/tournament':tournament,'@/lib/audits':audits,'../../audit-form':{AuditResolution:()=>jsx.jsx('button',{children:'Apurar votos'}),AuditForm:({label,children})=>jsx.jsxs('form',{children:[children,jsx.jsx('button',{children:label})]})},'../../../retry-load':{RetryLoad:()=>null}};
 deps['./tournaments/audit-form']=deps['../../audit-form'];
 for(const [file,key] of [['audit-history','../../../audit-history'],['audit-request','request-component']]) {
  const code=ts.transpileModule(await readFile(new URL(`../src/app/dashboard/${file}.tsx`,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
  const component={};vm.runInNewContext(code,{exports:component,Date,Intl,require:n=>{assert.ok(n in deps,n);return deps[n];}});deps[key]=component;
 }
 const source=await readFile(new URL('../src/app/dashboard/tournaments/[id]/audits/page.tsx',import.meta.url),'utf8');
 const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}});
 const exports={};vm.runInNewContext(outputText,{exports,Date,Intl,require:n=>{assert.ok(n in deps,n);return deps[n];}});
 const render=async()=>renderToStaticMarkup(await exports.default({params:Promise.resolve({id})}));
 const html=await render();
 assert.match(html,/id="audit-open"/);
 for(const text of ['Alterar meu voto','Seu voto: Manter','Votos a favor de invalidar a pontuação: 2','Votos contra invalidar (manter a pontuação): 1','Total de votos: 3','Decisão: pontuação invalidada por maioria','Resultados do dia antes e depois']) assert.ok(html.includes(text),text);
 assert.doesNotMatch(html,/Aprovar e iniciar votação|Rejeitar pedido|Apurar votos|Enviar denúncia/);
 const management=renderToStaticMarkup(jsx.jsx(deps['../../../audit-history'].AuditHistory,{data:dashboard,evaluation,management:true,allowVoting:false}));
 assert.match(management,/Aprovar e iniciar votação/);assert.match(management,/Apurar votos/);assert.doesNotMatch(management,/Salvar voto secreto|Alterar meu voto/);
 const expired=html.match(/<article[^>]*id="audit-expired"[\s\S]*?<\/article>/)[0];
 assert.match(expired,/Votação encerrada · Aguardando apuração/);
 assert.match(expired,/Ainda não há resultado apurado/);
 assert.doesNotMatch(expired,/Resultado da apuração|Votos a favor/);
 for (const [invalid,maintain,reason] of [[0,0,'porque não houve votos'],[2,2,'por empate'],[1,3,'por maioria dos votos']]) {
  Object.assign(evaluation.audits[3],{status:'maintained',invalid_votes:invalid,maintain_votes:maintain});
  const result=await render();
  assert.ok(result.includes(`Decisão: pontuação mantida ${reason}.`));
  assert.match(result,/Nenhuma punição aplicada/);
 }
 const request=renderToStaticMarkup(jsx.jsx(deps['request-component'].AuditRequest,{data:dashboard,evaluation}));
 assert.match(request,/required="" minLength="3" maxLength="1000"/);assert.match(request,/Enviar denúncia/);assert.doesNotMatch(request,/Aprovar e iniciar/);
 evaluation.organizer=false;evaluation.audits[1].can_vote=false;
 const participant=await render();assert.doesNotMatch(participant,/Aprovar e iniciar|Apurar votos|Alterar meu voto/);assert.match(participant,/Aguardando apuração/);
 dashboard.tournament.closed_at='2026-10-11T12:00Z';
 const closed=await render();assert.doesNotMatch(closed,/<form/);assert.match(closed,/Histórico disponível/);
});
