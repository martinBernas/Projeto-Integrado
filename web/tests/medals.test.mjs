import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import * as medals from '../src/lib/medals.ts';

test('cada resultado recebe uma unica categoria nos limites exatos', () => {
  for (const [score, tier] of [[0,null],[4999,null],[5000,'bronze'],[14999,'bronze'],[15000,'silver'],[22499,'silver'],[22500,'gold'],[24999,'gold'],[25000,'platinum'],[25001,null],[-5000,null],[22500.5,null],[NaN,null],[Infinity,null],[null,null],[undefined,null]]) assert.equal(medals.medalForScore(score), tier, String(score));
  assert.deepEqual(medals.emptyMedals(), { bronze: 0, silver: 0, gold: 0, platinum: 0 });
});

function fixture() {
  const row = (day, raw, overrides = {}) => ({ player_id: 'me', played_on: day, raw_score: raw, applied_score: 0, result_kind: 'score', provisional: false, applied_rule_snapshot: { version: '1' }, ...overrides });
  return { access: true, today: '2026-11-24', tournament: { id: 'one', starts_at: '2026-11-01', ends_at: '2026-11-30', timezone: 'America/Sao_Paulo' },
    participants: [{ id: 'me', name: 'Own', eligible_from: '2026-11-10' }, { id: 'other', name: 'Other', eligible_from: '2026-11-01' }], excluded_dates: ['2026-11-16'],
    results: [row('2026-11-09',25000),row('2026-11-10',5000),row('2026-11-11',15000),row('2026-11-12',22500),row('2026-11-13',25000),row('2026-11-14',25000),row('2026-11-15',25000),row('2026-11-16',25000),
      row('2026-11-17',25000,{result_kind:'audit_disregarded'}),row('2026-11-18',25000,{result_kind:'audit_penalty'}),row('2026-11-19',25000,{result_kind:'pending'}),row('2026-11-20',null,{result_kind:'absence'}),
      row('2026-11-23',14999),row('2026-11-24',24999,{provisional:true}),row('2026-11-25',25000),row('2026-10-30',25000),row('2026-12-01',25000),row('2026-11-10',25000,{player_id:'other'})] };
}

test('medalhas de torneio usam bruto proprio com periodo, elegibilidade, calendario e validade', () => {
  const data = fixture(), original = JSON.stringify(data);
  assert.deepEqual(medals.tournamentMedals(data, 'me'), { counts: { bronze:2,silver:1,gold:2,platinum:1 }, provisional:true });
  assert.equal(medals.tournamentMedals(data, 'organizer-only'), null);
  assert.equal(JSON.stringify(data), original);
  const closed = { ...data, tournament: { ...data.tournament, closed_at:'2026-12-01' } };
  assert.deepEqual(medals.tournamentMedals(closed, 'me'), medals.tournamentMedals(data,'me'));
  const shortened = { ...data, tournament: { ...data.tournament, ends_at:'2026-11-12' } };
  assert.deepEqual(medals.tournamentMedals(shortened,'me').counts, { bronze:1,silver:1,gold:1,platinum:0 });
});

test('calendarios diario e legado e exclusoes da regra sao respeitados', () => {
  const data = fixture();
  const rule = { id:1,effective_from:'2026-11-01',effective_to:'2026-11-30',weekly_schedule:'every_day',exclusions:[{date:'2026-11-16'}] };
  assert.equal(medals.tournamentMedals({...data,current_rule:rule,rule_versions:[]},'me').counts.platinum,3);
  assert.equal(medals.tournamentMedals({...data,rule_versions:[{...rule,weekly_schedule:'monday_to_friday_and_sunday'}]},'me').counts.platinum,2);
  assert.equal(medals.tournamentMedals({...data,rule_versions:[{...rule,id:2,exclusions:[{date:'2026-11-13'},{date:'2026-11-16'}]}]},'me').counts.platinum,2);
});

function countClient(rows, failAt = -1) {
  const calls = [];
  return { calls, from(table) {
    assert.equal(table,'personal_scores');
    let selected = [...rows]; const index = calls.length; const call = []; calls.push(call);
    const q = { select: (columns, options) => { assert.equal(columns,'id'); assert.deepEqual(options,{count:'exact',head:true}); return q; },
      eq: (column,value) => { call.push([column,'eq',value]); selected=selected.filter(r=>r[column]===value); return q; },
      gte: (column,value) => { call.push([column,'gte',value]); selected=selected.filter(r=>r[column]>=value); return q; },
      lte: (column,value) => { call.push([column,'lte',value]); selected=selected.filter(r=>r[column]<=value); return q; },
      then: (resolve,reject) => Promise.resolve({count:index===failAt?null:selected.length,error:index===failAt?{message:'private detail'}:null}).then(resolve,reject) };
    return q;
  } };
}

test('totais pessoais contam mais de 1000 registros sem limite de linhas ou duplicacao por torneio', async () => {
  const rows = Array.from({length:1205},(_,i)=>({player_id:'me',played_on:new Date(Date.UTC(2020,0,1+i)).toISOString().slice(0,10),score:7000}));
  rows.push(...[14999,15000,22499,22500,24999,25000,4999].map(score=>({player_id:'me',played_on:'2026-11-23',score})));
  rows.push({player_id:'other',played_on:'2026-11-23',score:25000},{player_id:'me',played_on:'2026-11-25',score:25000});
  const client=countClient(rows);
  assert.deepEqual(await medals.loadPersonalMedals(client,'me','2026-11-24'),{bronze:1206,silver:2,gold:2,platinum:1});
  assert.equal(client.calls.length,4);
  for(const call of client.calls){assert.ok(call.some(([column,op,value])=>column==='player_id'&&op==='eq'&&value==='me'));assert.ok(call.some(([column,op,value])=>column==='played_on'&&op==='lte'&&value==='2026-11-24'));}
});

test('falha de uma categoria nao apresenta total parcial e zero real permanece zero', async () => {
  assert.deepEqual(await medals.loadPersonalMedals(countClient([]),'me','2026-11-24'),medals.emptyMedals());
  await assert.rejects(medals.loadPersonalMedals(countClient([],2),'me','2026-11-24'),/personal_medals_unavailable/);
  await assert.rejects(medals.loadPersonalMedals(countClient([]),'','2026-11-24'),/personal_medals_unavailable/);
});

test('colecao apresenta quatro medalhas com nomes, quantidades e estados separados', async () => {
  const source=await readFile(new URL('../src/app/dashboard/medal-collection.tsx',import.meta.url),'utf8');
  const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}});
  const exports={},deps={'react/jsx-runtime':jsx,'@/lib/medals':medals,'@/app/info-tip':{InfoTip:()=>null}};
  vm.runInNewContext(outputText,{exports,require:name=>{assert.ok(name in deps,name);return deps[name];}});
  const html=renderToStaticMarkup(jsx.jsx(exports.MedalCollection,{scope:'personal',counts:{bronze:2,silver:1,gold:0,platinum:3}}));
  assert.match(html,/Bronze: 2 medalhas/);assert.match(html,/Prata: 1 medalha/);assert.match(html,/Ouro: 0 medalhas/);assert.match(html,/Platina: 3 medalhas/);
  assert.equal((html.match(/<svg/g)??[]).length,4);
  const unavailable=renderToStaticMarkup(jsx.jsx(exports.MedalCollection,{scope:'personal',counts:null}));
  assert.match(unavailable,/Não foi possível carregar/);assert.doesNotMatch(unavailable,/<svg/);
  const notParticipant=renderToStaticMarkup(jsx.jsx(exports.MedalCollection,{scope:'tournament',counts:null,notParticipant:true}));
  assert.match(notParticipant,/não participa como jogador/);assert.doesNotMatch(notParticipant,/Não foi possível carregar/);
});
