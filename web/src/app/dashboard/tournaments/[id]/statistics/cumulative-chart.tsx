import { formatDate } from '@/lib/tournament';
import { statisticsScore, type TournamentStatistics } from '@/lib/tournament-statistics';
import { CumulativePlot } from './cumulative-plot';

export function CumulativeChart({ progression, playerId }: {
  progression: TournamentStatistics['progression']; playerId: string;
}) {
  const { points, ranking } = progression;
  if (!points.length) return null;
  return <figure className="rounded-2xl border border-slate-200 bg-white p-5" aria-labelledby="cumulative-heading">
    <h2 id="cumulative-heading" className="text-xl font-bold">Progressão da pontuação acumulada</h2>
    <p className="mt-2 text-sm text-slate-600">Acompanhe os jogadores em todo o período com dias encerrados. Os pontos aplicados são somados desde o início do torneio, incluindo ausências, penalidades e auditorias.</p>
    <p className="mt-2 text-sm text-slate-600">Somente datas pontuadas no eixo horizontal, igualmente espaçadas. Use o zoom e marque jogadores na legenda para examinar suas disputas.</p>
    {points.length === 1 && <p className="mt-2 text-sm">Há uma única data pontuada: os marcadores mostram os acumulados, sem uma curva temporal.</p>}
    <CumulativePlot
      key={JSON.stringify([ranking.map(p => p.name), points.map(p => p.day), ranking.map(p => p.total)])}
      players={ranking.map(p => ({ name: p.name, own: p.id === playerId }))}
      points={points.map(point => ({ day: point.day, scores: ranking.map(p => p.eligible_from > point.day ? null : point.totals[p.id]) }))}
    />
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
