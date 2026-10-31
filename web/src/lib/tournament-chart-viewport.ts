export type ChartDomain = { xMin: number; xMax: number; yMin: number; yMax: number };
export type ChartViewport = ChartDomain & { zoom: number };
export const MAX_CHART_ZOOM = 8;

export function chartDomain(points: { scores: (number | null)[] }[], selected: boolean[]): ChartDomain {
  let yMin = Infinity, yMax = -Infinity;
  for (const point of points) point.scores.forEach((score, i) => {
    if (selected[i] && score !== null) { yMin = Math.min(yMin, score);yMax = Math.max(yMax, score); }
  });
  return { xMin: 0, xMax: Math.max(0, points.length - 1), yMin: yMin === Infinity ? 0 : yMin, yMax: yMax === -Infinity ? 0 : yMax };
}

export function fullChartViewport(domain: ChartDomain): ChartViewport { return { ...domain, zoom: 1 }; }

function fitAxis(min: number, max: number, size: number, center: number): [number, number] {
  if (max === min) return [min, max];
  const span = Math.min(max - min, size);
  const start = Math.max(min, Math.min(max - span, center - span / 2));
  return [start, start + span];
}

export function zoomChart(domain: ChartDomain, current: ChartViewport, factor: number, anchor = { x: 0.5, y: 0.5 }): ChartViewport {
  const zoom = Math.min(MAX_CHART_ZOOM, Math.max(1, current.zoom * factor));
  const xSize = Math.max(Math.min(1, domain.xMax - domain.xMin), (domain.xMax - domain.xMin) / zoom);
  const ySize = (domain.yMax - domain.yMin) / zoom;
  const ax = Math.max(0, Math.min(1, anchor.x)), ay = Math.max(0, Math.min(1, anchor.y));
  const [xMin, xMax] = fitAxis(domain.xMin, domain.xMax, xSize, current.xMin + ax * (current.xMax - current.xMin) + (0.5 - ax) * xSize);
  const [yMin, yMax] = fitAxis(domain.yMin, domain.yMax, ySize, current.yMin + ay * (current.yMax - current.yMin) + (0.5 - ay) * ySize);
  return { xMin, xMax, yMin, yMax, zoom };
}

export function panChart(domain: ChartDomain, current: ChartViewport, xFraction: number, yFraction: number): ChartViewport {
  const [xMin, xMax] = fitAxis(domain.xMin, domain.xMax, current.xMax - current.xMin,
    (current.xMin + current.xMax) / 2 + (current.xMax - current.xMin) * xFraction);
  const [yMin, yMax] = fitAxis(domain.yMin, domain.yMax, current.yMax - current.yMin,
    (current.yMin + current.yMax) / 2 + (current.yMax - current.yMin) * yFraction);
  return { xMin, xMax, yMin, yMax, zoom: current.zoom };
}
