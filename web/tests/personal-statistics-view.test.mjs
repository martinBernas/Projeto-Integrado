import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
import * as stats from '../src/lib/personal-statistics.ts';
import * as tournament from '../src/lib/tournament.ts';

test('RF20 screen shows filter, means and accessible chart/table; ignores supplied player, rejects anonymous and shows no partial/empty metrics',async()=>{
 let user={id:'owner'},error=false,points=[{played_on:'2026-10-01',score:20000},{played_on:'2026-10-11',score:15000}];const calls=[];
 const dependencies={'react/jsx-runtime':jsx,'next/link':{default:({children,...props})=>jsx.jsx('a',{...props,children})},'next/navigation':{redirect:path=>{throw Error(`redirect:${path}`);}},
  '@/lib/supabase/config':{isSupabaseConfigured:true},'@/lib/supabase/server':{createClient:async()=>({auth:{getUser:async()=>({data:{user}})}})},
  '@/lib/tournament':tournament,'@/lib/personal-statistics':{...stats,saoPauloToday:()=> '2026-10-11',loadPersonalStatistics:async(_,id,period,today)=>{calls.push({id,period,today});if(error)throw Error('private query error');return stats.personalStatistics(points);}},
  '../retry-load':{RetryLoad:()=>jsx.jsx('button',{children:'Tentar novamente'})}};
 async function load(file){const source=await readFile(new URL(`../src/app/dashboard/statistics/${file}`,import.meta.url),'utf8');const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;const exports={};vm.runInNewContext(code,{exports,Date,require:name=>{assert.ok(name in dependencies,name);return dependencies[name];}});return exports;}
 dependencies['./score-chart']=await load('score-chart.tsx');const page=await load('page.tsx');
 const render=async params=>renderToStaticMarkup(await page.default({searchParams:Promise.resolve(params)}));
 const html=await render({player:'other-account'});
 assert.equal(calls.at(-1).id,'owner');assert.equal(calls.at(-1).period,'last5');
 assert.match(html,/17.500/);assert.match(html,/3.500/);assert.match(html,/2 dias jogados/);assert.match(html,/10 jogos/);
 assert.match(html,/role="img"/);assert.match(html,/<table/);assert.match(html,/25.000/);assert.match(html,/01\/10\/2026/);assert.match(html,/11\/10\/2026/);
 assert.match(html,/value="last5" selected=""/);assert.match(html,/Últimos 30 dias/);assert.match(html,/Desde o início/);
 assert.equal((html.match(/<circle/g)??[]).length,2);
 const thirty=await render({period:'last30'});assert.equal(calls.at(-1).period,'last30');assert.match(thirty,/12\/09\/2026/);
 await render({period:'all'});assert.equal(calls.at(-1).period,'all');
 points=[];const empty=await render({});assert.match(empty,/Sem dias jogados/);assert.doesNotMatch(empty,/Média bruta diária|<svg|<circle|NaN|Infinity/);
 error=true;const failure=await render({});assert.match(failure,/temporariamente indisponíveis/);assert.match(failure,/Tentar novamente/);assert.doesNotMatch(failure,/private query error|<svg|Média bruta diária/);
 user=null;await assert.rejects(render({}),/redirect:\/auth\/login/);
 const loading=await load('loading.tsx');assert.match(renderToStaticMarkup(jsx.jsx(loading.default,{})),/role="status"/);
});
