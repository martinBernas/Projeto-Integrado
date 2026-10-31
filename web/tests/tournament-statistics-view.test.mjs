import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as tournament from '../src/lib/tournament.ts';
import * as stats from '../src/lib/tournament-statistics.ts';
import * as chart from '../src/lib/tournament-report-chart.ts';
import * as viewport from '../src/lib/tournament-chart-viewport.ts';

async function load(path,deps) {
 deps['@/lib/tournament-chart-viewport']=viewport;
 const source=await readFile(new URL(`../src/${path}`,import.meta.url),'utf8');
 const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}});
 const exports={};vm.runInNewContext(outputText,{exports,Date,Math,Set,require:n=>{assert.ok(n in deps,n);return deps[n];}});return exports;
}
test('RF21 screen uses session identity, authorized target, private aggregates, graph/table and explicit empty/error states',async()=>{
 const id='00000000-0000-4000-8000-000000000001';let user={id:'me'},error=null,access=true;
 const data={access:true,today:'2026-10-18',tournament:{id,name:'Torneio teste',starts_at:'2026-10-01',ends_at:'2026-10-31'},excluded_dates:[],
 participants:[{id:'me',name:'Own',eligible_from:'2026-10-01'},{id:'other-secret-id',name:'Other secret name',eligible_from:'2026-10-01'}],
 results:[{player_id:'me',played_on:'2026-10-01',raw_score:12000,applied_score:12000,result_kind:'score',provisional:false},
 {player_id:'me',played_on:'2026-10-02',raw_score:null,applied_score:-2500,result_kind:'absence',provisional:false},
 {player_id:'other-secret-id',played_on:'2026-10-01',raw_score:10000,applied_score:10000,result_kind:'score',provisional:false}]};
 const calls=[];
 const deps={'react/jsx-runtime':jsx,'react':React,'next/link':{default:({children,...props})=>jsx.jsx('a',{...props,children})},'next/navigation':{redirect:()=>{throw Error('redirect');}},
 '@/lib/supabase/config':{isSupabaseConfigured:true},'@/lib/supabase/server':{createClient:async()=>({auth:{getUser:async()=>({data:{user}})},rpc:async(...args)=>{calls.push(args);return {data:access?data:{access:false},error};}})},
 '@/lib/tournament':tournament,'@/lib/tournament-statistics':stats,'@/lib/tournament-report-chart':chart,'../../../retry-load':{RetryLoad:()=>jsx.jsx('button',{children:'Tentar novamente'})}};
 const {ComparisonChart}=await load('app/dashboard/tournaments/[id]/statistics/comparison-chart.tsx',deps);deps['./comparison-chart']={ComparisonChart};
 deps['./cumulative-plot']=await load('app/dashboard/tournaments/[id]/statistics/cumulative-plot.tsx',deps);
 deps['./cumulative-chart']=await load('app/dashboard/tournaments/[id]/statistics/cumulative-chart.tsx',deps);
 deps['./nemesis']=await load('app/dashboard/tournaments/[id]/statistics/nemesis.tsx',deps);
 const {default:Page}=await load('app/dashboard/tournaments/[id]/statistics/page.tsx',deps);
 const render=async(target=id)=>renderToStaticMarkup(await Page({params:Promise.resolve({id:target}),searchParams:Promise.resolve({player:'other-secret-id'})}));
 let html=await render();
 for(const text of ['Sua média no torneio','4.750 pontos','Média conjunta dos demais','10.000 pontos','Seus dias em primeiro','Ver valores e base de cálculo','Somente dias encerrados'])assert.ok(html.includes(text),text);
 assert.doesNotMatch(html,/other-secret-id|raw_score/);assert.match(html,/Other secret name/);
 assert.match(html,/Progressão da pontuação acumulada/);assert.match(html,/Nêmesis: suas maiores disputas/);
 assert.match(html,/Ver pontos acumulados por jogador e data/);assert.match(html,/role="img"/);assert.match(html,/<table/);
 assert.match(html,/href="\/dashboard\?tournament=/);assert.equal(calls.at(-1)[0],'get_tournament_dashboard');assert.equal(calls.at(-1)[1].target,id);
 data.tournament.closed_at='2026-10-18T10:00Z';assert.match(await render(),/Resultados preservados/);
 data.results=[];html=await render();assert.match(html,/Sem dias encerrados com dados/);assert.doesNotMatch(html,/role="img"|0 pontos/);
 user={id:'organizer'};data.results=[{player_id:'me',played_on:'2026-10-01',raw_score:100,applied_score:0,result_kind:'score',provisional:false}];
 html=await render();assert.match(html,/Você não participa como jogador/);assert.match(html,/0 pontos/);assert.doesNotMatch(html,/Seus dias em primeiro/);
 error={message:'private database error'};html=await render();assert.match(html,/Tentar novamente/);assert.doesNotMatch(html,/private database|Comparação de médias/);
 error=null;access=false;assert.match(await render(),/Torneio indisponível/);
 const count=calls.length;assert.match(await render('invalid'),/Torneio indisponível/);assert.equal(calls.length,count);
 user=null;await assert.rejects(render(),/redirect/);assert.equal(calls.length,count);
});

test('cumulative chart and Nemesis distinguish no data, one zero date, late entry and nonparticipant',async()=>{
 const deps={'react/jsx-runtime':jsx,'react':React,'@/lib/tournament':tournament,'@/lib/tournament-statistics':stats,'@/lib/tournament-report-chart':chart};
 deps['./cumulative-plot']=await load('app/dashboard/tournaments/[id]/statistics/cumulative-plot.tsx',deps);
 const {CumulativeChart}=await load('app/dashboard/tournaments/[id]/statistics/cumulative-chart.tsx',deps);
 const {Nemesis}=await load('app/dashboard/tournaments/[id]/statistics/nemesis.tsx',deps);
 const data={access:true,today:'2027-02-10',tournament:{id:'t',name:'Outro torneio',starts_at:'2027-02-01',ends_at:'2027-02-09'},excluded_dates:[],
  participants:[{id:'own-id',name:'Jogador próprio',eligible_from:'2027-02-01'},{id:'late-id',name:'Jogador tardio',eligible_from:'2027-02-05'}],results:[]};
 let calculated=stats.tournamentStatistics(data,'own-id');
 assert.equal(renderToStaticMarkup(jsx.jsx(CumulativeChart,{progression:calculated.progression,playerId:'own-id'})),'');
 data.results=[{player_id:'own-id',played_on:'2027-02-01',applied_score:0,raw_score:10,result_kind:'score',provisional:false}];
 calculated=stats.tournamentStatistics(data,'own-id');
 const html=renderToStaticMarkup(jsx.jsx(CumulativeChart,{progression:calculated.progression,playerId:'own-id'}));
 assert.match(html,/única data pontuada/);assert.match(html,/Sem participação elegível/);
 assert.match(html,/Jogador próprio/);assert.match(html,/Jogador tardio/);assert.match(html,/\(você\)/);
 assert.doesNotMatch(html,/NaN|Infinity|own-id|late-id/);assert.equal((html.match(/<circle /g)||[]).length,1);
 assert.match(renderToStaticMarkup(jsx.jsx(Nemesis,{participant:true,rivals:[]})),/Ainda não houve trocas/);
 assert.match(renderToStaticMarkup(jsx.jsx(Nemesis,{participant:false,rivals:[]})),/não há Nêmesis pessoal/);
 const tied=renderToStaticMarkup(jsx.jsx(Nemesis,{participant:true,rivals:[{id:'a',name:'A',swaps:2},{id:'b',name:'B',swaps:2}]}));
 assert.equal((tied.match(/Maior disputa/g)||[]).length,2);
});
