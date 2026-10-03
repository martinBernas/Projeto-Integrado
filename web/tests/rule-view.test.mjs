import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import * as React from 'react';
import * as jsx from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import * as rules from '../src/lib/rules.ts';
import * as tournament from '../src/lib/tournament.ts';

test('S5 views show absolute mode, each day snapshot, immutable timezone and explicit preview confirmation',async()=>{
 const rule={id:2,effective_from:'2026-10-01',effective_to:'2026-10-31',scoring_mode:'absolute',absence_penalty:-1000,
 weekly_schedule:'every_day',exclusions:[],version:'s5-2',reason:'Revisão confirmada',created_at:'2026-10-03T12:00:00Z'};
 const pre={token:'a'.repeat(32),proposal:{from:'2026-10-01',to:'2026-10-31',mode:'absolute',penalty:-1000,schedule:rule.weekly_schedule,exclusions:[],reason:'Revisão proposta'},
 retroactive:true,changes:[{player_id:'a',day:'2026-10-01',before:0,after:10000,before_kind:'score',after_kind:'score'}],totals:[{player_id:'a',name:'Ana',before:0,after:10000,delta:10000}]};
 const deps={'react/jsx-runtime':jsx,'react':{...React,useActionState:()=>[{preview:pre},'/disabled',false]},
 '@/lib/rules':rules,'@/lib/tournament':tournament,'./rule-actions':{reviseRules:()=>{}},'./player-name':{PlayerName:({name})=>jsx.jsx('span',{children:name})}};
 async function load(path) {
  const source=await readFile(new URL(`../src/app/dashboard/${path}`,import.meta.url),'utf8');
  const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}});
  const exports={};vm.runInNewContext(outputText,{exports,Intl,Date,require:n=>{assert.ok(n in deps,n);return deps[n];}});return exports;
 }
 deps['./rule-fields']=await load('tournaments/rule-fields.tsx');
 const timeline=await load('tournaments/rule-timeline.tsx');deps['./tournaments/rule-timeline']=timeline;
 const form=await load('tournaments/rule-form.tsx'); const view=await load('tournament-view.tsx');
 const html=renderToStaticMarkup(jsx.jsx(form.RuleForm,{id:'test',start:'2026-10-01',end:'2026-10-31',rule}));
 assert.match(html,/Prévia da revisão retroativa/);assert.match(html,/Confirmar revisão/);assert.match(html,/name="confirm"/);
 assert.doesNotMatch(html,/name="timezone"/);assert.match(html,/Zero bruto representa ausência/);
 const data={access:true,today:'2026-10-03',tournament:{name:'Copa',starts_at:'2026-10-01',ends_at:'2026-10-31',history_ready:true,timezone:'America/Sao_Paulo',rule_version:'mvp-v1'},
 participants:[{id:'a',name:'Ana',eligible_from:'2026-10-01'}],excluded_dates:[],current_rule:rule,rule_versions:[rule],
 results:[{player_id:'a',played_on:'2026-10-01',raw_score:10000,applied_score:10000,result_kind:'score',provisional:false,applied_rule_snapshot:{version:'s5-2',mode:'absolute',minimum_positive:10000}}]};
 const dashboard=renderToStaticMarkup(jsx.jsx(view.TournamentView,{data,userId:'a'}));
 assert.match(dashboard,/Pontuação absoluta · Regra s5-2/);assert.match(dashboard,/Todos os dias/);
 assert.doesNotMatch(dashboard,/Menor positivo:|−2.500 pontos/);
 assert.match(dashboard,/Histórico de regras/);assert.match(dashboard,/America\/Sao_Paulo/);
 assert.equal(rules.ruleForDate([{...rule,id:1,scoring_mode:'relative_to_lowest'},rule],'2026-10-01').id,2);
});
