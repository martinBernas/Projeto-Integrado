'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { formatDate } from '@/lib/tournament';
import { chartDomain, fullChartViewport, zoomChart, panChart, MAX_CHART_ZOOM, type ChartViewport } from '@/lib/tournament-chart-viewport';

export type CumulativePlotPlayer = { name: string; own: boolean };
export type CumulativePlotPoint = { day: string; scores: (number | null)[] };
const score = (value: number) => Math.round(value).toLocaleString('pt-BR');

export function CumulativePlot({ players, points }: { players: CumulativePlotPlayer[]; points: CumulativePlotPoint[] }) {
  const id = useId().replace(/:/g, '');
  const [selected, setSelected] = useState(() => players.map(() => true));
  const [view, setView] = useState<ChartViewport | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const domain = chartDomain(points, selected), viewport = view ?? fullChartViewport(domain);
  const active = selected.some(Boolean), selectedCount = selected.filter(Boolean).length;
  const { xMin, xMax, yMin, yMax } = viewport;
  const width = 920, height = 390, left = 96, right = 22, top = 28, bottom = 48;
  const x = (index: number) => xMin === xMax ? (left + width - right) / 2 : left + 4 + (index - xMin) / (xMax - xMin) * (width - left - right - 8);
  const y = (value: number) => yMin === yMax ? (top + height - bottom) / 2 : height - bottom - 4 - (value - yMin) / (yMax - yMin) * (height - top - bottom - 8);
  const ticks = yMin === yMax ? [yMin] : Array.from({ length: 6 }, (_, i) => yMin + (yMax - yMin) * i / 5);
  const formatTick = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: yMax - yMin < 5 ? 2 : 0 });
  const color = (i: number) => `var(--tournament-line-${i % 8 + 1})`;
  const dash = (i: number) => i < 8 ? undefined : i < 16 ? '6 4' : `${2 + Math.floor((i - 16) / 8)} 4`;
  const visibleDates = points.map((point, index) => ({ ...point, index })).filter(p => p.index >= xMin && p.index <= xMax);
  const tickStride = Math.max(1, Math.ceil(visibleDates.length / 11));
  const tickDates = visibleDates.filter((_, i) => i % tickStride === 0);
  const pick = (next: boolean[]) => { setSelected(next);setView(null); };
  const zoom = (factor: number) => setView(previous => zoomChart(domain, previous ?? fullChartViewport(domain), factor));
  const pan = (dx: number, dy: number) => setView(previous => panChart(domain, previous ?? fullChartViewport(domain), dx, dy));
  const button = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40';
  const canZoom = active && (domain.xMax > 1 || domain.yMax > domain.yMin);
  const { xMin: domainXMin, xMax: domainXMax, yMin: domainYMin, yMax: domainYMax } = domain;
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !canZoom) return;
    const wheel = (event: WheelEvent) => {
      const rect = svg.getBoundingClientRect();
      const sx = (event.clientX - rect.left) / rect.width * width;
      const sy = (event.clientY - rect.top) / rect.height * height;
      if (sx < left || sx > width - right || sy < top || sy > height - bottom || !event.deltaY) return;
      event.preventDefault();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rect.height : 1);
      const anchor = { x: (sx - left - 4) / (width - left - right - 8), y: (height - bottom - 4 - sy) / (height - top - bottom - 8) };
      const bounds = { xMin: domainXMin, xMax: domainXMax, yMin: domainYMin, yMax: domainYMax };
      setView(previous => zoomChart(bounds, previous ?? fullChartViewport(bounds), Math.exp(-Math.max(-200, Math.min(200, delta)) * 0.003), anchor));
    };
    svg.addEventListener('wheel', wheel, { passive: false });
    return () => svg.removeEventListener('wheel', wheel);
  }, [canZoom, domainXMin, domainXMax, domainYMin, domainYMax]);
  return <>
    <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Zoom do gráfico acumulado">
      <button type="button" className={button} aria-label="Diminuir zoom" disabled={!active || viewport.zoom <= 1} onClick={() => zoom(1 / 1.5)}>−</button>
      <span className="min-w-14 text-center text-sm tabular-nums" role="status" aria-live="polite">{Math.round(viewport.zoom * 100)}%</span>
      <button type="button" className={button} aria-label="Aumentar zoom" disabled={!canZoom || viewport.zoom >= MAX_CHART_ZOOM} onClick={() => zoom(1.5)}>+</button>
      <button type="button" className={button} disabled={viewport.zoom === 1} onClick={() => setView(null)}>Visão completa</button>
    </div>
    {viewport.zoom > 1 && active && <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Mover área ampliada">
      <button type="button" className={button} aria-label="Ver datas anteriores" disabled={xMin <= domain.xMin} onClick={() => pan(-0.35, 0)}>← Datas</button>
      <button type="button" className={button} aria-label="Ver datas seguintes" disabled={xMax >= domain.xMax} onClick={() => pan(0.35, 0)}>Datas →</button>
      <button type="button" className={button} aria-label="Ver pontuações menores" disabled={yMin <= domain.yMin} onClick={() => pan(0, -0.35)}>↓ Pontos</button>
      <button type="button" className={button} aria-label="Ver pontuações maiores" disabled={yMax >= domain.yMax} onClick={() => pan(0, 0.35)}>↑ Pontos</button>
    </div>}
    {active ? <>
      <p className="mt-3 text-sm text-slate-600">{selectedCount} de {players.length} jogadores selecionados. Escala visível: {formatTick(yMin)} a {formatTick(yMax)} pontos.</p>
      <div className="mt-4 overflow-x-auto" tabIndex={0} role="region" aria-label="Gráfico acumulado com zoom e rolagem horizontal">
        <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={`${id}-title ${id}-desc`} className={`block w-full min-w-[760px] ${viewport.zoom > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
          onPointerDown={event => {
            if (event.pointerType !== 'mouse' || event.button !== 0 || viewport.zoom <= 1) return;
            drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
            event.currentTarget.setPointerCapture(event.pointerId);
            event.preventDefault();
          }}
          onPointerMove={event => {
            const start = drag.current;
            if (!start || start.id !== event.pointerId) return;
            const rect = event.currentTarget.getBoundingClientRect();
            pan(-(event.clientX - start.x) / (rect.width * (width - left - right - 8) / width), (event.clientY - start.y) / (rect.height * (height - top - bottom - 8) / height));
            drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
          }}
          onPointerUp={event => { drag.current = null;if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
          onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}>
          <title id={`${id}-title`}>Pontuação acumulada dos jogadores selecionados</title>
          <desc id={`${id}-desc`}>Datas pontuadas igualmente espaçadas. Ampliação de {Math.round(viewport.zoom * 100)}%. A legenda permite marcar jogadores. Controles de datas e pontos movem a área ampliada. A tabela completa continua disponível abaixo.</desc>
          <defs><clipPath id={`${id}-clip`}><rect x={left} y={top} width={width - left - right} height={height - top - bottom} /></clipPath></defs>
          <text x={left} y={16} fontSize="12" fill="#475569">Pontos acumulados</text>
          {ticks.map((value, i) => <g key={i}><line x1={left} x2={width - right} y1={y(value)} y2={y(value)} stroke="#cbd5e1" /><text x={left - 10} y={y(value) + 4} textAnchor="end" fontSize="12" fill="#475569">{formatTick(value)}</text></g>)}
          {yMin < 0 && yMax > 0 && <line x1={left} x2={width - right} y1={y(0)} y2={y(0)} stroke="#cbd5e1" strokeWidth="1.5" />}
          <g clipPath={`url(#${id}-clip)`}>
            {players.map((player, i) => !selected[i] ? null : <g key={i}>
              <polyline points={points.flatMap((p, index) => p.scores[i] === null ? [] : [`${x(index)},${y(p.scores[i]!)}`]).join(' ')} fill="none" stroke={color(i)} strokeWidth={player.own ? 3 : 1.7} strokeDasharray={dash(i)}><title>{player.name}</title></polyline>
              {visibleDates.filter(p => p.scores[i] !== null && p.scores[i]! >= yMin && p.scores[i]! <= yMax).map(p => <circle key={p.day} cx={x(p.index)} cy={y(p.scores[i]!)} r={player.own ? 3.5 : 2.5} fill={color(i)}><title>{`${formatDate(p.day)} · ${player.name}: ${score(p.scores[i]!)} pontos acumulados`}</title></circle>)}
            </g>)}
          </g>
          {tickDates.map(p => <text key={p.day} x={x(p.index)} y={height - bottom + 20} textAnchor="middle" fontSize="12" fill="#475569">{formatDate(p.day).slice(0, 5)}</text>)}
          <text x={(left + width - right) / 2} y={height - 7} textAnchor="middle" fontSize="12" fill="#475569">Data do jogo</text>
        </svg>
      </div>
    </> : <p className="mt-4 rounded-lg bg-slate-100 p-4" role="status">Nenhum jogador selecionado. Marque jogadores na legenda para visualizar o gráfico.</p>}
    <fieldset className="mt-4"><legend className="font-semibold">Jogadores no gráfico</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className={button} disabled={selectedCount === players.length} onClick={() => pick(players.map(() => true))}>Marcar todos</button>
        <button type="button" className={button} disabled={!active} onClick={() => pick(players.map(() => false))}>Desmarcar todos</button>
        {players.some(p => p.own) && <button type="button" className={button} onClick={() => pick(players.map(p => p.own))}>Somente você</button>}
      </div>
      <div className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3" aria-label="Legenda dos jogadores">
        {players.map((player, i) => <label key={i} className="flex min-w-0 cursor-pointer items-center gap-2 rounded p-1">
          <input type="checkbox" checked={selected[i]} onChange={() => pick(selected.map((value, index) => index === i ? !value : value))} className="shrink-0" />
          <svg width="32" height="14" viewBox="0 0 32 14" aria-hidden="true" className="shrink-0"><line x1="0" x2="32" y1="7" y2="7" stroke={color(i)} strokeWidth="2.5" strokeDasharray={dash(i)} /></svg>
          <span className="break-words">{player.name}{player.own && <span className="ml-1 font-semibold text-emerald-800">(você)</span>}</span>
        </label>)}
      </div>
    </fieldset>
    <p className="mt-3 text-sm text-slate-600">Use a roda do mouse sobre as curvas para ampliar ou reduzir na posição do cursor. Após ampliar, clique e arraste para navegar. Mudar a seleção ajusta a escala e restaura a visão completa. A tabela mantém todos os jogadores e datas.</p>
  </>;
}
