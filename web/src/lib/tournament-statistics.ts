import type { TournamentData } from './tournament';

export type TournamentPoint = { day: string; own: number | null; others: number | null; othersCount: number };
export type TournamentStatistics = {
  ownAverage: number | null; othersAverage: number | null;
  ownDays: number; othersDays: number; first: number; last: number;
  participant: boolean; points: TournamentPoint[];
};

// Results are the authoritative, tournament-local applied values. In particular,
// closed tournaments must never be reconstructed from current personal scores.
export function tournamentStatistics(data: TournamentData, player: string): TournamentStatistics {
  const starts = new Map(data.participants.map(p => [p.id, p.eligible_from]));
  const days = new Map<string, typeof data.results>();
  for (const row of data.results) {
    const eligible = starts.get(row.player_id);
    if (!eligible || row.played_on < eligible || row.played_on < data.tournament.starts_at
      || row.played_on > data.tournament.ends_at || row.played_on >= data.today
      || row.provisional || row.result_kind === 'pending' || data.excluded_dates.includes(row.played_on)) continue;
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
    ownDays, othersDays, first, last, participant: starts.has(player), points };
}

export function statisticsScore(value: number) {
  return (Object.is(Math.round(value), -0) ? 0 : Math.round(value)).toLocaleString('pt-BR');
}
