import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import * as tournament from '../src/lib/tournament.ts';
import * as audits from '../src/lib/audits.ts';
import * as notifications from '../src/lib/notifications.ts';
async function load(file,deps){
 const source=await readFile(new URL(`../src/app/dashboard/${file}.tsx`,import.meta.url),'utf8');
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
 const exports={};vm.runInNewContext(code,{exports,Date,Intl,require:n=>{assert.ok(n in deps,n);return deps[n];}});return exports;
}
const common={'react/jsx-runtime':jsx,'next/link':{default:({children,...props})=>{const a={...props};delete a.prefetch;return jsx.jsx('a',{...a,children});}},
 '@/lib/tournament':tournament,'@/lib/audits':audits,'@/lib/notifications':notifications,
 'next/navigation':{redirect:path=>{throw Error(`redirect:${path}`);}},
};
const id='00000000-0000-4000-8000-000000000001';
function fixture(){return {server_now:'2026-10-18T20:00Z',is_organizer:true,pending_days:1,
 request_tournaments:[{id,name:'Meu torneio',closed_at:null}],managed_tournaments:[{id,name:'Meu torneio',closed_at:null,corrections_pending:1,audits_requested:1,audits_open:1,audits_ready:1}],
 open_votings:[{id:'open',tournament_id:id,tournament_name:'Meu torneio',played_on:'2020-01-01',deadline:'2026-10-19T20:00Z',can_vote:true,has_voted:false}]};}

test('dashboard management card is exclusive to organizers; voting notification survives own vote and explains ineligible participants',async()=>{
 const cards=await load('notification-cards',{...common,'./retry-load':{RetryLoad:()=>jsx.jsx('button',{children:'Tentar novamente'})}});
 const data=fixture();
 const render=(organizer=false,failed=false)=>renderToStaticMarkup(jsx.jsx(cards.NotificationCards,{data,failed,isOrganizer:organizer}));
 assert.doesNotMatch(render(),/Gerenciar notificações|ajuste\(s\) para decidir/);assert.match(render(),/Votações abertas/);assert.match(render(),/>[^<]*Votar<\/a>/);
 assert.match(render(true),/Gerenciar notificações dos torneios/);assert.match(render(true),/1 denúncia/);assert.match(render(true),/1 apuração/);
 data.open_votings[0].has_voted=true;assert.match(render(),/Seu voto já foi registrado/);assert.match(render(),/Consultar ou alterar meu voto/);
 data.open_votings[0].can_vote=false;data.open_votings[0].has_voted=false;assert.match(render(),/Acompanhar votação/);assert.match(render(),/sem direito a voto/);
 data.open_votings=[];assert.doesNotMatch(render(),/Votações abertas/);
 assert.match(render(true,true),/Não foi possível conferir as pendências/);assert.doesNotMatch(render(true,true),/1 ajuste/);
});

test('personal requests and organizer workspaces render distinct controls, scoped history, forbidden access and honest load errors',async()=>{
 let user={id:'p'},errorOn='';const n=fixture(),calls=[];
 const changeData={has_more:true,changes:[{id:'c',player_id:'p',played_on:'2020-01-01',old_score:10000,new_score:8000,reason:'Correção de digitação',requested_at:'2026-10-18T18:00Z',decisions:[{id:'d',tournament_name:'Meu torneio',old_score:10000,status:'pending',can_review:true,audit_blocked:false}]}]};
 const dashboard={access:true,tournament:{id,name:'Meu torneio',closed_at:null},participants:[{id:'p',name:'Jogador'}],results:[{personal_score_id:'available',player_id:'p',played_on:'2020-01-02',raw_score:10000,result_kind:'score'}]};
 const base={personal_score_id:'a',player_id:'p',played_on:'2020-01-01',raw_score:10000,reason:'Minha denúncia',requested_at:'2026-10-18T18:00Z',requested_by_me:true,my_vote:null,can_vote:true,invalid_votes:null,maintain_votes:null};
 const evaluation={organizer:true,participant:true,server_now:n.server_now,audits:[{...base,id:'requested',status:'requested'},{...base,id:'open',status:'open',requested_by_me:false,reason:'Denúncia de outra pessoa',deadline:'2026-10-19T20:00Z'},{...base,id:'expired',status:'open',deadline:'2026-10-17T20:00Z'}]};
 const deps={...common,'../retry-load':{RetryLoad:()=>jsx.jsx('button',{children:'Tentar novamente'})},
  '@/lib/supabase/server':{createClient:async()=>({auth:{getUser:async()=>({data:{user}})},rpc:async(name,args)=>{calls.push([name,args]);return {data:name==='get_tournament_notifications'?n:name==='get_tournament_dashboard'?dashboard:name==='get_score_audits'?evaluation:changeData,error:errorOn===name?{message:'private detail'}:null};}})},
  './tournaments/audit-form':{AuditForm:({children,label,operation})=>jsx.jsxs('form',{'data-operation':operation,children:[children,jsx.jsx('button',{children:label})]}),AuditResolution:()=>jsx.jsx('button',{children:'Apurar votos'})},
 };
 const forms=await load('score-changes/forms',{'react/jsx-runtime':jsx,'react':{useActionState:()=>[{},()=>{},false]},'./actions':{manageScoreChange:()=>{}}});
 deps['../score-changes/forms']=forms;deps['./forms']=forms;
 deps['../score-changes/list']=await load('score-changes/list',deps);
 deps['../audit-history']=await load('audit-history',deps);deps['../audit-request']=await load('audit-request',deps);
 const personal=await load('requests/page',deps),managed=await load('notifications/page',deps);
 const render=async(page,params={tournament:id})=>renderToStaticMarkup(await page.default({searchParams:Promise.resolve(params)}));
 let html=await render(personal);
 for(const text of ['Meus pedidos','Ajustar pontuação retroativa','Abrir denúncia','Enviar denúncia','Minha denúncia'])assert.ok(html.includes(text),text);
 assert.doesNotMatch(html,/Aprovar e recalcular|Aprovar e iniciar|Apurar votos|Salvar voto secreto|Denúncia de outra pessoa|como organizador/);
 assert.ok(calls.some(c=>c[0]==='get_personal_score_changes'));assert.ok(!calls.some(c=>c[0]==='get_managed_score_changes'));
 calls.length=0;html=await render(managed);
 for(const text of ['Gerenciar notificações dos torneios','Aprovar e recalcular','Aprovar e iniciar votação','Apurar votos'])assert.ok(html.includes(text),text);
 assert.doesNotMatch(html,/Atualizar dia passado|Enviar denúncia|Salvar voto secreto|Alterar meu voto/);
 assert.ok(calls.some(c=>c[0]==='get_managed_score_changes'));assert.ok(!calls.some(c=>c[0]==='get_personal_score_changes'));
 n.is_organizer=false;calls.length=0;assert.match(await render(managed),/exclusiva dos organizadores/);assert.equal(calls.length,1);
 n.is_organizer=true;errorOn='get_personal_score_changes';html=await render(personal);assert.match(html,/Não foi possível carregar seus ajustes/);assert.doesNotMatch(html,/Nenhuma solicitação nesta página|private detail/);
 errorOn='get_tournament_notifications';assert.match(await render(managed),/Não foi possível conferir suas notificações/);
 errorOn='';assert.match(await render(personal,{tournament:'inaccessible'}),/Torneio indisponível/);assert.match(await render(managed,{tournament:'inaccessible'}),/Torneio indisponível para sua gestão/);
 user=null;await assert.rejects(render(personal),/redirect:\/auth\/login/);await assert.rejects(render(managed),/redirect:\/auth\/login/);
});

test('legacy score changes URL redirects safely to personal requests and preserves pagination',async()=>{
 const page=await load('score-changes/page',common);
 await assert.rejects(page.default({searchParams:Promise.resolve({page:'2'})}),/redirect:\/dashboard\/requests\?page=2/);
 await assert.rejects(page.default({searchParams:Promise.resolve({page:'https:\/\/external'})}),/redirect:\/dashboard\/requests$/);
});
