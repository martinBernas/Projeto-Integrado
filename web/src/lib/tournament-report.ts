import type { DayResult, Participant } from './tournament.ts';

export type ReportSnapshot = {
  tournament: { id: string; name: string; starts_at: string; ends_at: string; closed_at: string };
  participants: Participant[];
  results: DayResult[];
};
export type ReportPoint = { day: string; positions: Record<string, number>; totals: Record<string, number> };

// Reconstruct the final accepted results by game date, not what was displayed
// before later corrections. A tied pair retains its last strict order.
export function tournamentReport(snapshot: ReportSnapshot) {
  const participants = [...snapshot.participants].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR') || a.id.localeCompare(b.id));
  const byId = new Map(participants.map(p => [p.id, p]));
  const rows = snapshot.results.filter(r => byId.has(r.player_id) && r.played_on >= byId.get(r.player_id)!.eligible_from
    && r.played_on >= snapshot.tournament.starts_at && r.played_on <= snapshot.tournament.ends_at);
  if (rows.some(r => r.provisional || r.result_kind === 'pending')) throw new Error('report_not_consolidated');
  const days = [...new Set(rows.map(r => r.played_on))].sort();
  const grouped = new Map<string, DayResult[]>();
  for (const row of rows) grouped.set(row.played_on, [...(grouped.get(row.played_on) ?? []), row]);
  const totals: Record<string, number> = Object.fromEntries(participants.map(p => [p.id, 0]));
  const pairs = participants.flatMap((a, i) => participants.slice(i + 1).map(b => ({ a, b, swaps: 0, last: 0 })));
  const points: ReportPoint[] = [];
  for (const day of days) {
    for (const r of grouped.get(day)!) totals[r.player_id] += r.applied_score;
    const ranked = participants.filter(p => p.eligible_from <= day).sort((a, b) => totals[b.id] - totals[a.id] || a.name.localeCompare(b.name, 'pt-BR') || a.id.localeCompare(b.id));
    const positions: Record<string, number> = {};
    let position = 0;
    ranked.forEach((p, i) => { if (!i || totals[p.id] !== totals[ranked[i - 1].id]) position = i + 1; positions[p.id] = position; });
    points.push({ day, positions, totals: { ...totals } });
    for (const pair of pairs) {
      if (pair.a.eligible_from > day || pair.b.eligible_from > day) continue;
      const order = Math.sign(totals[pair.a.id] - totals[pair.b.id]);
      if (!order) continue;
      if (pair.last && order !== pair.last) pair.swaps++;
      pair.last = order;
    }
  }
  const final = [...participants].sort((a, b) => totals[b.id] - totals[a.id] || a.name.localeCompare(b.name, 'pt-BR') || a.id.localeCompare(b.id));
  let position = 0;
  const ranking = final.map((p, i) => {
    if (!i || totals[p.id] !== totals[final[i - 1].id]) position = i + 1;
    return { ...p, total: totals[p.id], position };
  });
  const maximum = Math.max(0, ...pairs.map(p => p.swaps));
  return { participants, points, ranking, rivalries: pairs.filter(p => maximum > 0 && p.swaps === maximum) };
}
