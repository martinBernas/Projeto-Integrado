"use client";

import { useActionState } from 'react';
import { manageTournament } from './actions';

export type ManagedTournament = {
  id: string; name: string; starts_at: string; ends_at: string; closed_at: string | null;
};
const inputClass = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-emerald-600';
const buttonClass = 'rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 disabled:opacity-50';

export function TournamentForm({ tournament }: { tournament?: ManagedTournament }) {
  const [state, action, pending] = useActionState(manageTournament, {});
  return <form action={action} className="space-y-4">
    <input type="hidden" name="operation" value={tournament ? 'update' : 'create'} />
    {tournament && <input type="hidden" name="target" value={tournament.id} />}
    <label className="block text-sm font-medium">Nome do torneio
      <input name="name" required minLength={3} maxLength={100} defaultValue={tournament?.name} className={inputClass} />
    </label>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm font-medium">Início<input name="start" type="date" required min="0001-01-01" max="9999-12-31" defaultValue={tournament?.starts_at} className={inputClass} /></label>
      <label className="block text-sm font-medium">Fim<input name="end" type="date" required min="0001-01-01" max="9999-12-31" defaultValue={tournament?.ends_at} className={inputClass} /></label>
    </div>
    {tournament && <p className="text-sm text-slate-600">O período só pode mudar enquanto não houver participantes, resultados ou exclusões de calendário.</p>}
    <button disabled={pending} className={buttonClass}>{pending ? 'Salvando…' : tournament ? 'Salvar alterações' : 'Criar torneio'}</button>
    <div aria-live="polite">{state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}{state.message && <p className="text-sm text-emerald-800">{state.message}</p>}</div>
  </form>;
}

export function CloseTournamentForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(manageTournament, {});
  return <form action={action} className="mt-6 space-y-3 border-t border-slate-200 pt-5">
    <input type="hidden" name="operation" value="close" /><input type="hidden" name="target" value={id} />
    <p className="text-sm text-slate-600">Encerre após o último dia e a conferência do histórico. Os resultados serão congelados e o torneio não poderá mais ser editado.</p>
    <label className="flex items-start gap-2 text-sm"><input className="mt-1" type="checkbox" name="confirm" value="yes" required />Confirmo que desejo encerrar este torneio.</label>
    <button disabled={pending} className="rounded-lg border border-slate-400 px-4 py-2 font-semibold disabled:opacity-50">{pending ? 'Encerrando…' : 'Encerrar torneio'}</button>
    <div aria-live="polite">{state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}{state.message && <p className="text-sm text-emerald-800">{state.message}</p>}</div>
  </form>;
}
