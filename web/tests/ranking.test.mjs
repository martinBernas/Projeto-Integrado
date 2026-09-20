import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ranking } from '../src/lib/tournament.ts';

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
