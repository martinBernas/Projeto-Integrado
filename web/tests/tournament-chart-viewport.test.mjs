import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chartDomain, fullChartViewport, zoomChart, panChart, MAX_CHART_ZOOM } from '../src/lib/tournament-chart-viewport.ts';

test('selection changes only the plotted domain, preserving zero, negatives and ineligible gaps', () => {
  const points = [{ scores: [0, null, -20] }, { scores: [100, 60, -30] }];
  const copy = structuredClone(points);
  assert.deepEqual(chartDomain(points, [true, true, true]), { xMin: 0, xMax: 1, yMin: -30, yMax: 100 });
  assert.deepEqual(chartDomain(points, [false, true, false]), { xMin: 0, xMax: 1, yMin: 60, yMax: 60 });
  assert.deepEqual(chartDomain(points, [false, false, false]), { xMin: 0, xMax: 1, yMin: 0, yMax: 0 });
  assert.deepEqual(points, copy);
});

test('zoom magnifies both axes around the current center, respects limits and zooms back to the full domain', () => {
  const domain = { xMin: 0, xMax: 20, yMin: -100, yMax: 300 };
  const full = fullChartViewport(domain), zoomed = zoomChart(domain, full, 2);
  assert.deepEqual(zoomed, { xMin: 5, xMax: 15, yMin: 0, yMax: 200, zoom: 2 });
  assert.deepEqual(zoomChart(domain, zoomed, 0.5), full);
  assert.equal(zoomChart(domain, full, 1000).zoom, MAX_CHART_ZOOM);
  assert.deepEqual(zoomChart(domain, full, 0.001), full);
});

test('panning keeps the viewport inside real data bounds, including at zoom-out near an edge', () => {
  const domain = { xMin: 0, xMax: 20, yMin: -100, yMax: 300 };
  const zoomed = zoomChart(domain, fullChartViewport(domain), 2);
  const edge = panChart(domain, zoomed, 100, -100);
  assert.deepEqual(edge, { xMin: 10, xMax: 20, yMin: -100, yMax: 100, zoom: 2 });
  assert.deepEqual(zoomChart(domain, edge, 0.5), fullChartViewport(domain));
  assert.deepEqual(panChart(domain, fullChartViewport(domain), -100, 100), fullChartViewport(domain));
});

test('mouse zoom preserves the value beneath the cursor and clamps edge anchors', () => {
  const domain = { xMin: 0, xMax: 20, yMin: -100, yMax: 300 };
  const full = fullChartViewport(domain);
  const anchor = { x: 0.25, y: 0.75 };
  const zoomed = zoomChart(domain, full, 2, anchor);
  assert.equal(zoomed.xMin + anchor.x * (zoomed.xMax - zoomed.xMin), 5);
  assert.equal(zoomed.yMin + anchor.y * (zoomed.yMax - zoomed.yMin), 200);
  assert.deepEqual(zoomChart(domain, zoomed, 0.5, anchor), full);
  assert.deepEqual(zoomChart(domain, full, 2, { x: -2, y: 8 }), { xMin: 0, xMax: 10, yMin: 100, yMax: 300, zoom: 2 });
});

test('one date and constant scores keep finite bounds; a two-date chart never zooms into an invented date interval', () => {
  for (const domain of [{ xMin: 0, xMax: 0, yMin: 0, yMax: 0 }, { xMin: 0, xMax: 1, yMin: -10, yMax: -10 }]) {
    const view = panChart(domain, zoomChart(domain, fullChartViewport(domain), 8), 5, -5);
    assert.equal(view.xMin, domain.xMin);assert.equal(view.xMax, domain.xMax);
    assert.equal(view.yMin, domain.yMin);assert.equal(view.yMax, domain.yMax);
    assert.ok(Object.values(view).every(Number.isFinite));
  }
});
