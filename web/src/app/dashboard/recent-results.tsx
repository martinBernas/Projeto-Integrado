"use client";

import { useId, useState, type ReactNode } from 'react';

const recentDayLimit = 5;

export function RecentResults({ items }: { items: { day: string; content: ReactNode }[] }) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const canExpand = items.length > recentDayLimit;
  const visible = expanded ? items : items.slice(0, recentDayLimit);

  return <section className="space-y-3">
    <h2 className="text-xl font-bold">Resultados por dia</h2>
    {!items.length ? <p className="text-slate-600">Ainda não há dias de jogo a apresentar.</p>
      : <p role="status" aria-live="polite" className="text-sm text-slate-600">Mostrando {visible.length} de {items.length} dias, do mais recente ao mais antigo.</p>}
    <div id={listId} className="space-y-3">{visible.map(item => <div key={item.day}>{item.content}</div>)}</div>
    {canExpand && <button type="button" aria-expanded={expanded} aria-controls={listId}
      onClick={() => setExpanded(value => !value)}
      className="rounded-lg border border-emerald-700 bg-white px-4 py-2 font-semibold text-emerald-800 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">
      {expanded ? 'Mostrar menos' : 'Ver todos'}
    </button>}
  </section>;
}
