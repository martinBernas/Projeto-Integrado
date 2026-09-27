import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eligibleResults, ranking, sortDailyResults } from '../src/lib/tournament.ts';

test('inicio em 16/09 exclui resultados antigos e pendencias anteriores da exibicao e ranking', () => {
  const participants = [{ id: 'bastian', name: 'Bastian', eligible_from: '2026-09-16' }];
  const results = [
    { player_id: 'bastian', played_on: '2026-09-10', applied_score: 0, result_kind: 'pending', provisional: true },
    { player_id: 'bastian', played_on: '2026-09-15', applied_score: -2500, result_kind: 'absence', provisional: false },
    { player_id: 'bastian', played_on: '2026-09-16', applied_score: 3000, result_kind: 'score', provisional: false },
    { player_id: 'bastian', played_on: '2026-09-17', applied_score: 0, result_kind: 'pending', provisional: true },
  ];
  const filtered = eligibleResults(participants, results);
  assert.deepEqual(filtered, results.slice(2));
  assert.equal(ranking(participants, filtered)[0].total, 3000);
  assert.equal(results.length, 4);
});

test('ranking agrega dias e penalidades, preserva empate e não altera entradas', () => {
  const participants = ['a','b','c','d'].map(id => ({ id, name: id, eligible_from: '2026-09-01' }));
  const results = [
    { player_id: 'a', applied_score: 5500 }, { player_id: 'a', applied_score: -2500 },
    { player_id: 'b', applied_score: 3000 }, { player_id: 'c', applied_score: -2500 },
  ];
  const before = JSON.stringify(results);
  assert.deepEqual(ranking(participants, results).map(({id,total,position}) => ({id,total,position})), [
    { id: 'a', total: 3000, position: 1 }, { id: 'b', total: 3000, position: 1 },
    { id: 'd', total: 0, position: 3 }, { id: 'c', total: -2500, position: 4 },
  ]);
  assert.equal(JSON.stringify(results), before);
});

test('resultados diários: pontuação decrescente, empates por nome e pendências ao final', () => {
  const participants = [{id:'a',name:'Ana'},{id:'b',name:'Bruno'},{id:'c',name:'Carla'},{id:'d',name:'Davi'},{id:'e',name:'Eva'}];
  const rows = [
    {player_id:'d',applied_score:0,result_kind:'pending'},
    {player_id:'c',applied_score:-2500,result_kind:'absence'},
    {player_id:'b',applied_score:3000,result_kind:'score'},
    {player_id:'e',applied_score:7000,result_kind:'score'},
    {player_id:'a',applied_score:3000,result_kind:'score'},
  ];
  const before = JSON.stringify(rows);
  assert.deepEqual(sortDailyResults(participants, rows).map(r=>r.player_id), ['e','a','b','c','d']);
  assert.equal(JSON.stringify(rows), before);
});
