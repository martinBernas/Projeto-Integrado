import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoredDayGroups, scoreChartPanels, scoredDateTickIndices } from '../src/lib/tournament-report-chart.ts';

const player = { id: 'a', name: 'A', eligible_from: '2027-02-01' };
const points = count => Array.from({ length: count }, (_, i) => ({
  day: new Date(Date.UTC(2027, 1, 1 + i * 2)).toISOString().slice(0, 10),
  totals: { a: 100 + i * 10 }, positions: { a: 1 },
}));

test('date labels remain separated in short and long tournaments without inventing or losing plotted dates', () => {
  assert.deepEqual(scoredDateTickIndices(0, 460), []);
  assert.deepEqual(scoredDateTickIndices(1, 460), [0]);
  for (const count of [2, 5, 6, 21, 31, 365]) {
    const ticks = scoredDateTickIndices(count, 460);
    assert.equal(ticks[0], 0);assert.equal(ticks.at(-1), count - 1);
    assert.equal(new Set(ticks).size, ticks.length);
    for (let i = 1; i < ticks.length; i++) assert.ok((ticks[i] - ticks[i - 1]) * 460 / (count - 1) >= 28);
  }
});

test('five scored dates per group across arbitrary calendars; singleton remainder merges without losing observations', () => {
  for (const [count, sizes] of [[0, []], [1, [1]], [2, [2]], [5, [5]], [6, [6]], [7, [5, 2]],
    [10, [5, 5]], [11, [5, 6]], [21, [5, 5, 5, 6]], [22, [5, 5, 5, 5, 2]], [31, [5, 5, 5, 5, 5, 6]]]) {
    const input = points(count), copy = structuredClone(input);
    const groups = scoredDayGroups(input);
    assert.deepEqual(groups.map(p => p.length), sizes);
    assert.deepEqual(groups.flat(), input);
    assert.deepEqual(input, copy);
  }
});

test('each time interval uses its actual eligible min/max, without forced zero or reset accumulations', () => {
  const input = points(11);
  input[2].totals.a = -25;
  const { overview, details } = scoreChartPanels(input, [player]);
  assert.deepEqual([overview.minimum, overview.maximum], [-25, 200]);
  assert.deepEqual(details.map(p => [p.points.length, p.minimum, p.maximum]), [[5, -25, 140], [6, 150, 200]]);
  assert.equal(details[1].points[0].totals.a, 150);
  assert.equal(details[1].points.at(-1).totals.a, 200);
  const late = { ...player, eligible_from: input[5].day };
  const ranged = scoreChartPanels(input, [late]);
  assert.equal(ranged.overview.minimum, 150);
  assert.equal(ranged.details[0].minimum, 0);
  assert.equal(ranged.details[1].minimum, 150);
});

test('empty, single-date, all-zero and negative-only tournaments have finite exact domains', () => {
  assert.deepEqual(scoreChartPanels([], [player]), { overview: { points: [], minimum: 0, maximum: 0 }, details: [] });
  const one = scoreChartPanels(points(1), [player]);
  assert.equal(one.overview.minimum, 100);assert.equal(one.overview.maximum, 100);assert.equal(one.details.length, 0);
  for (const value of [0, -100]) {
    const input = points(7);input.forEach(p => { p.totals.a = value; });
    const result = scoreChartPanels(input, [player]);
    assert.equal(result.overview.minimum, value);assert.equal(result.overview.maximum, value);
    assert.ok(result.details.every(p => p.minimum === value && p.maximum === value));
  }
});
