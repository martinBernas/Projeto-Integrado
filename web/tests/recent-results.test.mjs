import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
import * as tournament from '../src/lib/tournament.ts';
import * as rules from '../src/lib/rules.ts';
async function load(path,deps) {
 const source=await readFile(new URL(`../src/app/dashboard/${path}`,import.meta.url),'utf8');
 const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}});
 const exports={};vm.runInNewContext(outputText,{exports,require:name=>{assert.ok(name in deps,name);return deps[name];}});return exports;
}
async function harness() {
 let expanded=false;
 const deps={'react/jsx-runtime':jsx,react:{useId:()=> 'recent-days-test',useState:()=>[expanded,update=>{expanded=typeof update==='function'?update(expanded):update;}]}};
 const {RecentResults}=await load('recent-results.tsx',deps);return {deps,RecentResults};
}
const items=count=>Array.from({length:count},(_,i)=>({day:`day-${i}`,content:jsx.jsx('details',{children:`result-${i}`})}));
test('recent results handles empty and short lists without expansion',async()=>{
 const {RecentResults}=await harness();
 for(const count of [0,1,5]) {
  const html=renderToStaticMarkup(RecentResults({items:items(count)}));
  assert.equal((html.match(/<details/g)??[]).length,count);assert.doesNotMatch(html,/<button/);
  if(!count)assert.match(html,/Ainda não há dias/);else assert.match(html,new RegExp(`Mostrando ${count} de ${count} dias`));
 }
});
test('recent results expands all days and reduces again with accessible control',async()=>{
 const {RecentResults}=await harness();const list=items(8);
 let tree=RecentResults({items:list});let html=renderToStaticMarkup(tree);
 assert.equal((html.match(/<details/g)??[]).length,5);assert.match(html,/Ver todos/);assert.match(html,/aria-expanded="false"/);
 assert.match(html,/aria-controls="recent-days-test"/);assert.doesNotMatch(html,/result-7/);
 tree.props.children.at(-1).props.onClick();tree=RecentResults({items:list});html=renderToStaticMarkup(tree);
 assert.equal((html.match(/<details/g)??[]).length,8);assert.match(html,/Mostrar menos/);assert.match(html,/aria-expanded="true"/);assert.match(html,/result-7/);
 tree.props.children.at(-1).props.onClick();assert.equal((renderToStaticMarkup(RecentResults({items:list})).match(/<details/g)??[]).length,5);
});
test('tournament keeps full ranking, orders recent dates and keys expansion by selected tournament',async()=>{
 const {deps,RecentResults}=await harness();
 Object.assign(deps,{'./recent-results':{RecentResults},'@/lib/tournament':tournament,'@/lib/rules':rules,
 './player-name':{PlayerName:({name})=>jsx.jsx('span',{children:name})},'./tournaments/rule-timeline':{RuleTimeline:()=>null}});
 const {TournamentView}=await load('tournament-view.tsx',deps);
 const data={access:true,today:'2026-10-09',excluded_dates:[],tournament:{id:'first',name:'Test',starts_at:'2026-10-01',ends_at:'2026-10-31',timezone:'America/Sao_Paulo',history_ready:true,rule_version:'test'},
 participants:[{id:'a',name:'Ana',eligible_from:'2026-10-01'}],results:Array.from({length:8},(_,i)=>({player_id:'a',played_on:`2026-10-0${i+1}`,raw_score:100,applied_score:100,result_kind:'score',provisional:false,applied_rule_snapshot:{version:'test',mode:'absolute'}}))};
 const tree=TournamentView({data,userId:'a'});const widget=tree.props.children.at(-1);assert.equal(widget.key,'first');
 assert.deepEqual(Array.from(widget.props.items.slice(0,5),item=>item.day),['2026-10-08','2026-10-07','2026-10-06','2026-10-05','2026-10-04']);
 const html=renderToStaticMarkup(tree);assert.match(html,/>800<\/td>/);assert.match(html,/Mostrando 5 de 8 dias/);
 assert.doesNotMatch(html,/>01\/10\/2026 </);assert.match(html,/>08\/10\/2026 </);
 assert.equal(TournamentView({data:{...data,tournament:{...data.tournament,id:'second'}},userId:'a'}).props.children.at(-1).key,'second');
});

test('personal history has independent presentation, counts entries and expands the loaded history',async()=>{
 const {RecentResults}=await harness();const list=items(9);
 let tree=RecentResults({items:list,personal:true});let html=renderToStaticMarkup(tree);
 assert.match(html,/Meu histórico pessoal/);assert.match(html,/Mostrando 5 de 9 lançamentos/);
 assert.match(html,/Até 100 lançamentos/);assert.doesNotMatch(html,/result-8/);
 tree.props.children.at(-1).props.onClick();html=renderToStaticMarkup(RecentResults({items:list,personal:true}));
 assert.match(html,/Mostrando 9 de 9 lançamentos/);assert.match(html,/result-8/);assert.match(html,/Mostrar menos/);
 tree.props.children.at(-1).props.onClick();assert.match(renderToStaticMarkup(RecentResults({items:list,personal:true})),/Mostrando 5 de 9 lançamentos/);
 const {RecentResults:empty}=await harness();assert.match(renderToStaticMarkup(empty({items:[],personal:true})),/Seu primeiro lançamento aparecerá aqui/);
 for(const count of [1,5])assert.doesNotMatch(renderToStaticMarkup(empty({items:items(count),personal:true})),/<button/);
});
