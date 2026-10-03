import type { RuleVersion } from './rules';
export type Participant = { id: string; name: string; geoguessr_url?: string | null; eligible_from: string };
export type DayResult = {
  player_id: string; played_on: string; raw_score: number | null; applied_score: number;
  result_kind: 'score' | 'absence' | 'pending'; provisional: boolean;
  applied_rule_snapshot: { version: string; minimum_positive: number | null; mode?: string; absence_penalty?: number };
};
export type TournamentData = {
  access: true; today: string;
  tournament: { id: string; name: string; starts_at: string; ends_at: string; timezone: string; history_ready: boolean; rule_version: string; closed_at?: string | null };
  participants: Participant[]; excluded_dates: string[]; results: DayResult[];
  current_rule?: RuleVersion; rule_versions?: RuleVersion[];
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
export function sortDailyResults(participants: Participant[], results: DayResult[]) {
  const names = new Map(participants.map(p => [p.id, p.name]));
  return [...results].sort((a, b) =>
    Number(a.result_kind === 'pending') - Number(b.result_kind === 'pending')
    || (a.result_kind === 'pending' ? 0 : b.applied_score - a.applied_score)
    || (names.get(a.player_id) ?? '').localeCompare(names.get(b.player_id) ?? '', 'pt-BR')
    || a.player_id.localeCompare(b.player_id));
}
export function formatScore(value: number) { return value.toLocaleString('pt-BR'); }
