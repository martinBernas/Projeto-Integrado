'use client';

import { useActionState } from 'react';
import { manageScoreChange } from './actions';

export function RetroactiveScoreForm({ yesterday }: { yesterday: string }) {
  const [state, action, pending] = useActionState(manageScoreChange, {});
  return <form action={action} className="space-y-4">
    <input type="hidden" name="operation" value="submit" />
    <p className="text-sm leading-6 text-slate-600">Atualize um dia passado com uma justificativa. Seu histórico pessoal muda imediatamente. Cada torneio aberto mantém o valor anterior ou a ausência até seu organizador aprovar. Torneios encerrados permanecem congelados.</p>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block font-medium">Data do jogo<input name="day" type="date" min="0001-01-01" max={yesterday} required className="mt-2 block w-full rounded-lg border border-slate-300 bg-white p-3" /></label>
      <label className="block font-medium">Nova pontuação bruta<input name="score" type="number" inputMode="numeric" min={0} max={25000} step={1} required placeholder="0 a 25.000" className="mt-2 block w-full rounded-lg border border-slate-300 bg-white p-3" /></label>
    </div>
    <label className="block font-medium">Justificativa<textarea name="reason" required minLength={3} maxLength={1000} rows={3} className="mt-2 block w-full rounded-lg border border-slate-300 bg-white p-3" /></label>
    <p className="text-sm text-slate-600">Zero é ausência. Não será possível alterar este dia novamente até todos os torneios envolvidos aceitarem ou recusarem o pedido.</p>
    <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="confirm" value="yes" required className="mt-1" />Confirmo a atualização pessoal e o envio para avaliação nos torneios elegíveis.</label>
    <button disabled={pending} className="rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white disabled:opacity-50">{pending ? 'Enviando…' : 'Atualizar dia passado'}</button>
    <div aria-live="polite">{state.error && <p role="alert" className="text-red-700">{state.error}</p>}{state.message && <p className="text-emerald-800">{state.message}</p>}</div>
  </form>;
}

export function ScoreChangeReview({ decision, auditBlocked }: { decision: string; auditBlocked: boolean }) {
  const [state, action, pending] = useActionState(manageScoreChange, {});
  return <form action={action} className="mt-4 space-y-3">
    <input type="hidden" name="operation" value="review" /><input type="hidden" name="decision" value={decision} />
    {auditBlocked && <p className="text-sm text-amber-900">Há uma auditoria pendente para esta pontuação. Conclua a auditoria antes de aprovar; a recusa continua disponível.</p>}
    <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="confirm" value="yes" required className="mt-1" />Li a justificativa. Esta decisão vale somente para este torneio.</label>
    <div className="flex flex-wrap gap-3"><button name="selection" value="approve" disabled={pending || auditBlocked} className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-50">Aprovar e recalcular</button>
      <button name="selection" value="reject" disabled={pending} className="rounded-lg border border-slate-400 bg-white px-4 py-2 font-semibold disabled:opacity-50">Recusar alteração</button></div>
    <div aria-live="polite">{pending && <p className="text-sm">Registrando decisão…</p>}{state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}{state.message && <p className="text-sm text-emerald-800">{state.message}</p>}</div>
  </form>;
}
