import type { TournamentData } from './tournament';
import { tournamentProgression } from './tournament-progression.ts';

export type TournamentPoint = { day: string; own: number | null; others: number | null; othersCount: number };
export type TournamentStatistics = {
  ownAverage: number | null; othersAverage: number | null;
  ownDays: number; othersDays: number; first: number; last: number;
  participant: boolean; points: TournamentPoint[];
  progression: ReturnType<typeof tournamentProgression>;
  nemeses: { id: string; name: string; swaps: number }[];
};

// Results are the authoritative, tournament-local applied values. In particular,
// closed tournaments must never be reconstructed from current personal scores.
export function tournamentStatistics(data: TournamentData, player: string): TournamentStatistics {
  const starts = new Map(data.participants.map(p => [p.id, p.eligible_from]));
  const consolidated = data.results.filter(row => {
    const eligible = starts.get(row.player_id);
    return eligible !== undefined && row.played_on >= eligible && row.played_on >= data.tournament.starts_at
      && row.played_on <= data.tournament.ends_at && row.played_on < data.today
      && !row.provisional && row.result_kind !== 'pending' && !data.excluded_dates.includes(row.played_on);
  });
  const progression = tournamentProgression(data.participants, consolidated, data.tournament);
  const nemeses = progression.rivalries.filter(p => p.a.id === player || p.b.id === player)
    .map(p => ({ id: p.a.id === player ? p.b.id : p.a.id, name: p.a.id === player ? p.b.name : p.a.name, swaps: p.swaps }))
    .sort((a, b) => b.swaps - a.swaps || a.name.localeCompare(b.name, 'pt-BR') || a.id.localeCompare(b.id)).slice(0, 5);
  const days = new Map<string, typeof data.results>();
  for (const row of consolidated) {
    const group = days.get(row.played_on) ?? [];
    group.push(row); days.set(row.played_on, group);
  }
  let ownSum = 0, othersSum = 0, ownDays = 0, othersDays = 0, first = 0, last = 0;
  const points = [...days].sort(([a], [b]) => a.localeCompare(b)).map(([day, rows]) => {
    const own = rows.find(r => r.player_id === player);
    const others = rows.filter(r => r.player_id !== player);
    const sum = others.reduce((total, r) => total + r.applied_score, 0);
    if (own) { ownSum += own.applied_score; ownDays++; }
    othersSum += sum; othersDays += others.length;
    const valid = rows.filter(r => r.result_kind === 'score' && (r.raw_score ?? 0) > 0);
    if (own && valid.includes(own)) {
      if (valid.every(r => r.applied_score <= own.applied_score)) first++;
      if (valid.every(r => r.applied_score >= own.applied_score)) last++;
    }
    return { day, own: own?.applied_score ?? null, others: others.length ? sum / others.length : null, othersCount: others.length };
  });
  return { ownAverage: ownDays ? ownSum / ownDays : null, othersAverage: othersDays ? othersSum / othersDays : null,
    ownDays, othersDays, first, last, participant: starts.has(player), points, progression, nemeses };
}

export function statisticsScore(value: number) {
  return (Object.is(Math.round(value), -0) ? 0 : Math.round(value)).toLocaleString('pt-BR');
}
