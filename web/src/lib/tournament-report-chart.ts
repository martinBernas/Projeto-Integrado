import type { ReportPoint } from './tournament-report.ts';
import type { Participant } from './tournament.ts';

export type ScorePanel = { points: ReportPoint[]; minimum: number; maximum: number };

export function scoredDateTickIndices(count: number, width: number, minimumGap = 28): number[] {
  if (count < 2) return count ? [0] : [];
  const spacing = width / (count - 1);
  const stride = Math.max(1, Math.ceil(minimumGap / spacing));
  const ticks: number[] = [];
  for (let i = 0; i < count; i += stride) ticks.push(i);
  if (ticks.at(-1) !== count - 1) {
    if (ticks.length > 1 && (count - 1 - ticks.at(-1)!) * spacing < minimumGap) ticks.pop();
    ticks.push(count - 1);
  }
  return ticks;
}

// Chronological, consolidated tournament dates; no fixed name/calendar/roster.
export function scoredDayGroups(points: ReportPoint[]): ReportPoint[][] {
  const groups: ReportPoint[][] = [];
  for (let offset = 0; offset < points.length; offset += 5) groups.push(points.slice(offset, offset + 5));
  if (groups.length > 1 && groups.at(-1)!.length === 1) groups.at(-2)!.push(...groups.pop()!);
  return groups;
}

export function scoreChartPanels(points: ReportPoint[], participants: Participant[]) {
  const panel = (selected: ReportPoint[]): ScorePanel => {
    let minimum = Infinity, maximum = -Infinity;
    for (const point of selected) for (const p of participants) if (p.eligible_from <= point.day) {
      minimum = Math.min(minimum, point.totals[p.id]);
      maximum = Math.max(maximum, point.totals[p.id]);
    }
    return { points: selected, minimum: minimum === Infinity ? 0 : minimum, maximum: maximum === -Infinity ? 0 : maximum };
  };
  return {
    overview: panel(points),
    // A one-date tournament needs only an overview; never invent another date.
    details: points.length > 1 ? scoredDayGroups(points).map(panel) : [],
  };
}
