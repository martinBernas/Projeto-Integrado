export type StatisticsPeriod = 'last5' | 'last30' | 'all';
export type PersonalPoint = { played_on: string; score: number };
export const periodLabels: Record<StatisticsPeriod, string> = {
  last5: 'Últimos 5 dias', last30: 'Últimos 30 dias', all: 'Desde o início',
};
export function statisticsPeriod(value: string | string[] | undefined): StatisticsPeriod {
  return value === 'last30' || value === 'all' ? value : 'last5';
}
export function saoPauloToday(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
export function thirtyDayStart(today: string) {
  const date = new Date(`${today}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 29);
  return date.toISOString().slice(0, 10);
}
export function personalStatistics(points: PersonalPoint[]) {
  const played = points.filter(p => p.score > 0).sort((a, b) => a.played_on.localeCompare(b.played_on));
  const total = played.reduce((sum, point) => sum + point.score, 0);
  return { points: played, days: played.length,
    dailyAverage: played.length ? Math.round(total / played.length) : null,
    gameAverage: played.length ? Math.round(total / (5 * played.length)) : null,
  };
}

type QueryResult = { data: PersonalPoint[] | null; error: unknown };
type ScoreQuery = PromiseLike<QueryResult> & {
  select(columns: string): ScoreQuery; eq(column: string, value: string): ScoreQuery;
  gt(column: string, value: number): ScoreQuery; lte(column: string, value: string): ScoreQuery;
  gte(column: string, value: string): ScoreQuery; lt(column: string, value: string): ScoreQuery;
  order(column: string, options: { ascending: boolean }): ScoreQuery; limit(value: number): ScoreQuery;
};
type ScoreClient = { from(table: 'personal_scores'): { select(columns: string): ScoreQuery } };

// Cursor is the unique player/day key. Do not infer completeness from a short
// page: the remote API may have a lower row cap than the requested page size.
export async function loadPersonalStatistics(client: ScoreClient, playerId: string, period: StatisticsPeriod, today: string) {
  const points: PersonalPoint[] = [];
  let cursor: string | undefined;
  while (true) {
    let query = client.from('personal_scores').select('played_on, score').eq('player_id', playerId)
      .gt('score', 0).lte('played_on', today).order('played_on', { ascending: false }).limit(period === 'last5' ? 5 - points.length : 200);
    if (period === 'last30') query = query.gte('played_on', thirtyDayStart(today));
    if (cursor) query = query.lt('played_on', cursor);
    const { data, error } = await query;
    if (error || !data) throw new Error('personal_statistics_unavailable');
    if (!data.length) break;
    const nextCursor = data[data.length - 1].played_on;
    if (cursor && nextCursor >= cursor) throw new Error('personal_statistics_incomplete');
    points.push(...data);
    if (period === 'last5' && points.length >= 5) break;
    cursor = nextCursor;
  }
  return personalStatistics(points);
}
