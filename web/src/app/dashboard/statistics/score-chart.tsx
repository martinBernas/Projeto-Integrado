import { formatDate, formatScore } from '@/lib/tournament';
import type { PersonalPoint } from '@/lib/personal-statistics';

export function ScoreChart({ points }: { points: PersonalPoint[] }) {
  if (!points.length) return null;
  const width = 720, height = 260, left = 62, right = 24, top = 20, bottom = 40;
  const plotWidth = width - left - right, plotHeight = height - top - bottom;
  const first = Date.parse(`${points[0].played_on}T12:00:00Z`), last = Date.parse(`${points.at(-1)!.played_on}T12:00:00Z`);
  const x = (day: string) => first === last ? left + plotWidth / 2 : left + (Date.parse(`${day}T12:00:00Z`) - first) / (last - first) * plotWidth;
  const y = (score: number) => top + plotHeight * (1 - score / 25000);
  return <figure aria-labelledby="personal-chart-heading" className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
    <h2 id="personal-chart-heading" className="text-xl font-bold">Evolução da pontuação bruta</h2>
    <p className="mt-2 text-sm text-slate-600">Dias jogados em ordem cronológica. Dias sem jogo e pontuações zero não geram pontos. Consulte os valores na tabela abaixo.</p>
    <div className="mt-4 overflow-x-auto" tabIndex={0} role="region" aria-label="Gráfico de pontuação com rolagem horizontal">
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="personal-chart-title personal-chart-description" className="block w-full min-w-[640px]">
      <title id="personal-chart-title">Pontuação bruta por dia jogado</title>
      <desc id="personal-chart-description">{points.length} dias jogados, de {formatDate(points[0].played_on)} a {formatDate(points.at(-1)!.played_on)}. Escala de 0 a 25.000 pontos. Valores completos disponíveis na tabela.</desc>
      {[0, 12500, 25000].map(value => <g key={value}><line x1={left} x2={width - right} y1={y(value)} y2={y(value)} stroke="#cbd5e1" /><text x={left - 8} y={y(value) + 4} textAnchor="end" fontSize="12" fill="#475569">{formatScore(value)}</text></g>)}
      {points.length > 1 && <polyline points={points.map(p => `${x(p.played_on)},${y(p.score)}`).join(' ')} fill="none" stroke="#047857" strokeWidth="2" />}
      {points.map(p => <circle key={p.played_on} cx={x(p.played_on)} cy={y(p.score)} r="3" fill="#065f46"><title>{`${formatDate(p.played_on)}: ${formatScore(p.score)} pontos`}</title></circle>)}
      {first === last ? <text x={left + plotWidth / 2} y={height - 12} textAnchor="middle" fontSize="12" fill="#475569">{formatDate(points[0].played_on)}</text> : <>
        <text x={left} y={height - 12} fontSize="12" fill="#475569">{formatDate(points[0].played_on)}</text>
        <text x={width - right} y={height - 12} textAnchor="end" fontSize="12" fill="#475569">{formatDate(points.at(-1)!.played_on)}</text>
      </>}
    </svg></div>
    <figcaption className="mt-2 text-xs text-slate-600">As distâncias no eixo horizontal representam o intervalo entre as datas. A linha conecta somente os dias jogados.</figcaption>
    <details className="mt-4"><summary className="cursor-pointer font-semibold text-emerald-800">Ver valores do gráfico ({points.length} dias)</summary>
      <div className="mt-3 max-h-96 overflow-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Pontuações brutas dos dias selecionados</caption><thead><tr className="border-b"><th className="py-2">Data</th><th className="py-2 text-right">Pontuação bruta</th></tr></thead><tbody>{points.map(point => <tr key={point.played_on} className="border-b border-slate-100"><th scope="row" className="py-2 font-medium">{formatDate(point.played_on)}</th><td className="py-2 text-right tabular-nums">{formatScore(point.score)}</td></tr>)}</tbody></table></div>
    </details>
  </figure>;
}
