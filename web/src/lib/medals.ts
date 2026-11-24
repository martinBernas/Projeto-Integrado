import type { TournamentData } from './tournament';
import { ruleForDate } from './rules.ts';

export const medalTiers = [
  { key: 'bronze', label: 'Bronze', min: 5000, max: 14999, range: '5.000 a 14.999' },
  { key: 'silver', label: 'Prata', min: 15000, max: 22499, range: '15.000 a 22.499' },
  { key: 'gold', label: 'Ouro', min: 22500, max: 24999, range: '22.500 a 24.999' },
  { key: 'platinum', label: 'Platina', min: 25000, max: 25000, range: '25.000' },
] as const;
export type Medal = typeof medalTiers[number]['key'];
export type MedalCounts = Record<Medal, number>;
export const emptyMedals = (): MedalCounts => ({ bronze: 0, silver: 0, gold: 0, platinum: 0 });

export function medalForScore(score: number | null | undefined): Medal | null {
  if (typeof score !== 'number' || !Number.isInteger(score)) return null;
  return medalTiers.find(tier => score >= tier.min && score <= tier.max)?.key ?? null;
}

export function tournamentMedals(data: TournamentData, playerId: string) {
  const participant = data.participants.find(player => player.id === playerId);
  if (!participant) return null;
  const counts = emptyMedals(); let provisional = false;
  for (const row of data.results) {
    if (row.player_id !== playerId || row.result_kind !== 'score' || row.played_on < participant.eligible_from
      || row.played_on < data.tournament.starts_at || row.played_on > data.tournament.ends_at || row.played_on > data.today) continue;
    const rule = (data.rule_versions?.length ? ruleForDate(data.rule_versions, row.played_on) : undefined) ?? data.current_rule;
    const exclusions = rule?.exclusions.map(item => item.date) ?? data.excluded_dates;
    if (exclusions.includes(row.played_on)) continue;
    const weekday = new Date(`${row.played_on}T12:00:00Z`).getUTCDay();
    const schedule = rule?.weekly_schedule ?? 'monday_to_friday';
    if (!Number.isInteger(weekday) || (schedule !== 'every_day' && (weekday === 6 || (weekday === 0 && schedule !== 'monday_to_friday_and_sunday')))) continue;
    const medal = medalForScore(row.raw_score);
    if (medal) { counts[medal]++; provisional ||= row.provisional; }
  }
  return { counts, provisional };
}

type CountResult = { count: number | null; error: unknown };
type CountQuery = PromiseLike<CountResult> & {
  eq(column: string, value: string): CountQuery;
  gte(column: string, value: number): CountQuery;
  lte(column: string, value: number | string): CountQuery;
};
export type MedalCountClient = {
  from(table: 'personal_scores'): { select(columns: 'id', options: { count: 'exact'; head: true }): CountQuery };
};

// Exact HEAD counts avoid the row cap without downloading the player's history.
// All four must succeed: failure must not appear as zero medals or a partial total.
export async function loadPersonalMedals(client: MedalCountClient, playerId: string, today: string): Promise<MedalCounts> {
  if (!playerId) throw new Error('personal_medals_unavailable');
  const totals = await Promise.all(medalTiers.map(tier => client.from('personal_scores')
    .select('id', { count: 'exact', head: true }).eq('player_id', playerId)
    .gte('score', tier.min).lte('score', tier.max).lte('played_on', today)));
  const counts = emptyMedals();
  totals.forEach((result, index) => {
    if (result.error || result.count === null || !Number.isSafeInteger(result.count) || result.count < 0) throw new Error('personal_medals_unavailable');
    counts[medalTiers[index].key] = result.count;
  });
  return counts;
}
