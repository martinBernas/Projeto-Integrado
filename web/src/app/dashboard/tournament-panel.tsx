"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition, type ReactNode } from 'react';

type Tab = { id: string; name: string; closed_at: string | null };

export function TournamentPanel({ tournaments, selectedId, children }: { tournaments: Tab[]; selectedId?: string; children: ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [requestedName, setRequestedName] = useState('');
  return <section aria-label="Torneios">
    {!!tournaments.length && <nav aria-label="Selecionar torneio" className="flex items-end gap-1 overflow-x-auto rounded-t-xl bg-slate-200 px-2 pt-2">
      {tournaments.map(t => <Link key={t.id} href={`/dashboard?tournament=${encodeURIComponent(t.id)}`} prefetch={false}
        aria-current={selectedId === t.id ? 'page' : undefined} title={`${t.name} · ${t.closed_at ? 'Encerrado' : 'Aberto'}`}
        onNavigate={event => {
          event.preventDefault();
          setRequestedName(t.name);
          startTransition(() => router.push(`/dashboard?tournament=${encodeURIComponent(t.id)}`, { scroll: false }));
        }}
        className={`max-w-72 shrink-0 rounded-t-lg border-t-2 px-4 py-2 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-emerald-400 ${selectedId === t.id ? 'border-emerald-400 bg-slate-900 text-white' : 'border-transparent bg-slate-300 text-slate-700 hover:bg-slate-100'}`}>
        <span className="block truncate">{t.name}</span>
      </Link>)}
    </nav>}
    <div aria-busy={pending} className="space-y-4 rounded-b-2xl border border-slate-300 bg-slate-100 p-3 sm:p-4">
      {pending ? <p role="status" aria-live="polite" className="rounded-xl bg-white p-6 font-semibold text-slate-700">Carregando torneio {requestedName}…</p> : children}
    </div>
  </section>;
}
