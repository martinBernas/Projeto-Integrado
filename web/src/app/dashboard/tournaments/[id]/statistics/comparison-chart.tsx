import { formatDate } from '@/lib/tournament';
import { statisticsScore, type TournamentPoint } from '@/lib/tournament-statistics';

export function ComparisonChart({ points }: { points: TournamentPoint[] }) {
  if (!points.length) return null;
  const width = 760, height = 300, left = 74, right = 24, top = 24, bottom = 44;
  const values = points.flatMap(p => [p.own, p.others]).filter((v): v is number => v !== null);
  const min = Math.min(0, ...values), max = Math.max(1, ...values);
  const first = Date.parse(`${points[0].day}T12:00:00Z`), last = Date.parse(`${points.at(-1)!.day}T12:00:00Z`);
  const x = (day: string) => first === last ? (left + width - right) / 2
    : left + (Date.parse(`${day}T12:00:00Z`) - first) / (last - first) * (width - left - right);
  const y = (value: number) => top + (max - value) / (max - min) * (height - top - bottom);
  const series = [{ key: 'own', color: '#047857', label: 'Seu resultado aplicado' },
    { key: 'others', color: '#1d4ed8', label: 'Média dos demais' }] as const;
  return <figure className="rounded-2xl border border-slate-200 bg-white p-5" aria-labelledby="comparison-heading">
    <h2 id="comparison-heading" className="text-xl font-bold">Sua evolução no torneio</h2>
    <p className="mt-2 text-sm text-slate-600">Seu resultado aplicado em cada dia encerrado e a média dos demais naquele dia. A média do período usa todas as participações elegíveis, não a média simples dos pontos do gráfico.</p>
    <p className="mt-3 text-sm"><span className="font-semibold text-emerald-800">● Seu resultado aplicado</span><span className="ml-4 font-semibold text-blue-800">◆ Média dos demais</span></p>
    <div className="mt-4 overflow-x-auto" tabIndex={0} role="region" aria-label="Gráfico comparativo com rolagem horizontal">
      <svg viewBox={`0 0 ${width} ${height}`} className="block w-full min-w-[640px]" role="img" aria-labelledby="comparison-title comparison-desc">
        <title id="comparison-title">Desempenho próprio e média conjunta dos demais participantes</title>
        <desc id="comparison-desc">Somente dias encerrados. Valores negativos representam pontos aplicados negativos. Círculos verdes identificam seu resultado; losangos azuis, a média dos demais. Valores e bases de cálculo na tabela abaixo.</desc>
        {[...new Set([min, 0, max])].map(v => <g key={v}><line x1={left} x2={width - right} y1={y(v)} y2={y(v)} stroke="#cbd5e1" /><text x={left - 8} y={y(v) + 4} textAnchor="end" fontSize="12" fill="#475569">{statisticsScore(v)}</text></g>)}
        {series.map(s => <g key={s.key}>
          {points.slice(1).map((p, i) => p[s.key] !== null && points[i][s.key] !== null
            ? <line key={p.day} x1={x(points[i].day)} y1={y(points[i][s.key]!)} x2={x(p.day)} y2={y(p[s.key]!)} stroke={s.color} strokeWidth="2" strokeDasharray={s.key === 'others' ? '5 4' : undefined} /> : null)}
          {points.map(p => p[s.key] === null ? null : s.key === 'own'
            ? <circle key={p.day} cx={x(p.day)} cy={y(p.own!)} r="4" fill={s.color}><title>{`${formatDate(p.day)} · ${s.label}: ${statisticsScore(p.own!)}`}</title></circle>
            : <path key={p.day} d={`M ${x(p.day)} ${y(p.others!) - 5} l 5 5 l -5 5 l -5 -5 Z`} fill={s.color}><title>{`${formatDate(p.day)} · ${s.label}: ${statisticsScore(p.others!)}`}</title></path>)}
        </g>)}
        <text x={left} y={height - 12} fontSize="12" fill="#475569">{formatDate(points[0].day)}</text>
        {first !== last && <text x={width - right} y={height - 12} textAnchor="end" fontSize="12" fill="#475569">{formatDate(points.at(-1)!.day)}</text>}
      </svg>
    </div>
    <figcaption className="mt-2 text-sm text-slate-600">Ausências e punições entram nos valores aplicados. Sem base de cálculo, o valor fica ausente. Intervalos entre datas são proporcionais.</figcaption>
    <details className="mt-4"><summary className="cursor-pointer font-semibold text-emerald-800">Ver valores e base de cálculo ({points.length} dias)</summary>
      <div className="mt-3 max-h-96 overflow-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Valores do gráfico comparativo</caption>
        <thead><tr><th className="p-2">Dia</th><th className="p-2 text-right">Seu resultado</th><th className="p-2 text-right">Média dos demais</th><th className="p-2 text-right">Participantes na comparação</th></tr></thead>
        <tbody>{points.map(p => <tr key={p.day} className="border-t border-slate-100"><th scope="row" className="p-2 font-medium">{formatDate(p.day)}</th><td className="p-2 text-right">{p.own === null ? 'Sem participação elegível' : statisticsScore(p.own)}</td><td className="p-2 text-right">{p.others === null ? 'Sem dados' : statisticsScore(p.others)}</td><td className="p-2 text-right">{p.othersCount}</td></tr>)}</tbody>
      </table></div>
    </details>
  </figure>;
}
