export type Participant = { id: string; name: string; eligible_from: string };
export type DayResult = {
  player_id: string; played_on: string; raw_score: number | null; applied_score: number;
  result_kind: 'score' | 'absence' | 'pending'; provisional: boolean;
  applied_rule_snapshot: { version: string; minimum_positive: number | null };
};
export type TournamentData = {
  access: true; today: string;
  tournament: { name: string; starts_at: string; ends_at: string; timezone: string; history_ready: boolean; rule_version: string };
  participants: Participant[]; excluded_dates: string[]; results: DayResult[];
};
export function eligibleResults(participants: Participant[], results: DayResult[]) {
  const starts = new Map(participants.map(p => [p.id, p.eligible_from]));
  return results.filter(r => {
    const start = starts.get(r.player_id);
    return start !== undefined && r.played_on >= start;
  });
}
export function ranking(participants: Participant[], results: DayResult[]) {
  const totals = new Map<string, number>();
  for (const row of results) totals.set(row.player_id, (totals.get(row.player_id) ?? 0) + row.applied_score);
  const sorted = participants.map(p => ({ ...p, total: totals.get(p.id) ?? 0 }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'pt-BR') || a.id.localeCompare(b.id));
  let position = 0;
  return sorted.map((p, i) => {
    if (i === 0 || p.total !== sorted[i - 1].total) position = i + 1;
    return { ...p, position };
  });
}
export function formatDate(day: string) { return day.split('-').reverse().join('/'); }
export function formatScore(value: number) { return value.toLocaleString('pt-BR'); }
