import { formatDate } from '@/lib/tournament';
import { statisticsScore, type TournamentStatistics } from '@/lib/tournament-statistics';
import { scoreChartPanels, scoredDateTickIndices } from '@/lib/tournament-report-chart';

export function CumulativeChart({ progression, playerId }: {
  progression: TournamentStatistics['progression']; playerId: string;
}) {
  const { points, ranking } = progression;
  if (!points.length) return null;
  const { minimum, maximum } = scoreChartPanels(points, ranking).overview;
  const width = 920, height = 390, left = 96, right = 22, top = 28, bottom = 48;
  const plotWidth = width - left - right;
  const positions = new Map(points.map((point, i) => [point.day, i]));
  const x = (day: string) => points.length === 1 ? (left + width - right) / 2
    : left + 4 + positions.get(day)! / (points.length - 1) * (plotWidth - 8);
  const y = (value: number) => minimum === maximum ? (top + height - bottom) / 2
    : height - bottom - 4 - (value - minimum) / (maximum - minimum) * (height - top - bottom - 8);
  const divisions = Math.min(5, maximum - minimum);
  const ticks = divisions === 0 ? [minimum] : Array.from({ length: divisions + 1 }, (_, i) => minimum + Math.round((maximum - minimum) * i / divisions));
  const color = (i: number) => `var(--tournament-line-${i % 8 + 1})`;
  const dash = (i: number) => i < 8 ? undefined : i < 16 ? '6 4' : `${2 + Math.floor((i - 16) / 8)} 4`;
  return <figure className="rounded-2xl border border-slate-200 bg-white p-5" aria-labelledby="cumulative-heading">
    <h2 id="cumulative-heading" className="text-xl font-bold">Progressão da pontuação acumulada</h2>
    <p className="mt-2 text-sm text-slate-600">Todos os jogadores e todo o período com dias encerrados. Os pontos aplicados são somados desde o início do torneio, incluindo ausências, penalidades e auditorias.</p>
    <p className="mt-2 text-sm text-slate-600">Somente datas pontuadas no eixo horizontal, igualmente espaçadas. Escala de {statisticsScore(minimum)} a {statisticsScore(maximum)} pontos.</p>
    {points.length === 1 && <p className="mt-2 text-sm">Há uma única data pontuada: os marcadores mostram os acumulados, sem uma curva temporal.</p>}
    <div className="mt-4 overflow-x-auto" tabIndex={0} role="region" aria-label="Gráfico acumulado com rolagem horizontal">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="cumulative-title cumulative-desc" className="block w-full min-w-[760px]">
        <title id="cumulative-title">Pontuação acumulada de todos os jogadores do torneio</title>
        <desc id="cumulative-desc">De {formatDate(points[0].day)} a {formatDate(points.at(-1)!.day)}. Cores e traços identificam os jogadores na legenda. A linha do jogador conectado é mais espessa. Antes da elegibilidade não há pontos. Tabela completa disponível abaixo.</desc>
        <text x={left} y={16} fontSize="12" fill="#475569">Pontos acumulados</text>
        {ticks.map(value => <g key={value}>
          <line x1={left} x2={width - right} y1={y(value)} y2={y(value)} stroke="#cbd5e1" />
          <text x={left - 10} y={y(value) + 4} textAnchor="end" fontSize="12" fill="#475569">{statisticsScore(value)}</text>
        </g>)}
        {minimum < 0 && maximum > 0 && !ticks.includes(0) && <line x1={left} x2={width - right} y1={y(0)} y2={y(0)} stroke="#cbd5e1" strokeWidth="1.5" />}
        {ranking.map((player, i) => {
          const valid = points.filter(p => p.day >= player.eligible_from);
          return <g key={player.id}>
            <polyline points={valid.map(p => `${x(p.day)},${y(p.totals[player.id])}`).join(' ')} fill="none" stroke={color(i)} strokeWidth={player.id === playerId ? 3 : 1.7} strokeDasharray={dash(i)}>
              <title>{player.name}</title>
            </polyline>
            {valid.map(p => <circle key={p.day} cx={x(p.day)} cy={y(p.totals[player.id])} r={player.id === playerId ? 3.5 : 2.5} fill={color(i)}>
              <title>{`${formatDate(p.day)} · ${player.name}: ${statisticsScore(p.totals[player.id])} pontos acumulados`}</title>
            </circle>)}
          </g>;
        })}
        {scoredDateTickIndices(points.length, plotWidth - 8, 62).map(i => <text key={points[i].day} x={x(points[i].day)} y={height - bottom + 20} textAnchor="middle" fontSize="12" fill="#475569">{formatDate(points[i].day).slice(0, 5)}</text>)}
        <text x={(left + width - right) / 2} y={height - 7} textAnchor="middle" fontSize="12" fill="#475569">Data do jogo</text>
      </svg>
    </div>
    <ul aria-label="Legenda dos jogadores" className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
      {ranking.map((player, i) => <li key={player.id} className="flex min-w-0 items-center gap-2">
        <svg width="32" height="14" viewBox="0 0 32 14" aria-hidden="true" className="shrink-0"><line x1="0" x2="32" y1="7" y2="7" stroke={color(i)} strokeWidth="2.5" strokeDasharray={dash(i)} /></svg>
        <span className="break-words">{player.name}{player.id === playerId && <span className="ml-1 font-semibold text-emerald-800">(você)</span>}</span>
      </li>)}
    </ul>
    <figcaption className="mt-3 text-sm text-slate-600">O acumulado reflete os resultados aceitos atualmente no torneio por data, incluindo decisões posteriores. Nos torneios encerrados, usa os resultados congelados.</figcaption>
    <details className="mt-4"><summary className="cursor-pointer font-semibold text-emerald-800">Ver pontos acumulados por jogador e data</summary>
      <div className="mt-3 max-h-96 overflow-auto"><table className="w-full text-left text-sm">
        <caption className="sr-only">Valores completos da progressão acumulada</caption>
        <thead><tr><th className="whitespace-nowrap p-2">Data</th>{ranking.map(p => <th key={p.id} className="whitespace-nowrap p-2 text-right">{p.name}</th>)}</tr></thead>
        <tbody>{points.map(point => <tr key={point.day} className="border-t border-slate-100">
          <th scope="row" className="whitespace-nowrap p-2 font-medium">{formatDate(point.day)}</th>
          {ranking.map(p => <td key={p.id} className={`whitespace-nowrap p-2 text-right tabular-nums ${p.id === playerId ? 'bg-emerald-50' : ''}`}>
            {p.eligible_from > point.day ? 'Sem participação elegível' : statisticsScore(point.totals[p.id])}
          </td>)}
        </tr>)}</tbody>
      </table></div>
    </details>
  </figure>;
}
