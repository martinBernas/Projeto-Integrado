"use client";

import { useActionState } from 'react';
import { manageTournamentReport } from './report-actions';

export function ReportForm({ target, ready, busy }: { target: string; ready: boolean; busy: boolean }) {
  const [state, action, pending] = useActionState(manageTournamentReport, {});
  return <form action={action} className="mt-3 space-y-3">
    <input type="hidden" name="target" value={target} />
    <button name="operation" value="retry" disabled={pending || busy} className="rounded-lg border border-slate-400 px-4 py-2 font-semibold disabled:opacity-50">{pending ? 'Processando…' : 'Processar envios pendentes'}</button>
    <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="confirm" value="yes" className="mt-1" />Confirmo a retirada antecipada. O torneio deixará de aparecer na aplicação e o PDF ficará apenas nos e-mails enviados.</label>
    <button name="operation" value="withdraw" disabled={pending || busy || !ready} className="rounded-lg border border-red-300 px-4 py-2 font-semibold text-red-800 disabled:opacity-50">Retirar torneio agora</button>
    <div aria-live="polite">{state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}{state.message && <p className="text-sm text-emerald-800">{state.message}</p>}</div>
  </form>;
}
