"use client";

import { useActionState } from 'react';
import { manageParticipant } from './participant-actions';

export function ParticipantForm({ target, player, start, end, eligible, operation }: {
  target: string; player?: string; start: string; end: string; eligible?: string;
  operation: 'add' | 'update' | 'remove' | 'complete';
}) {
  const [state, action, pending] = useActionState(manageParticipant, {});
  const dateNeeded = operation === 'add' || operation === 'update';
  const label = { add: 'Adicionar participante', update: 'Salvar data', remove: 'Remover do torneio', complete: 'Concluir preparação do histórico' }[operation];
  return <form action={action} className="mt-4 space-y-3">
    <input type="hidden" name="target" value={target} /><input type="hidden" name="operation" value={operation} />
    {player && <input type="hidden" name="player" value={player} />}
    {dateNeeded && <label className="block text-sm font-medium">Participa desde
      <input name="eligible" type="date" required min={start} max={end} defaultValue={eligible ?? start}
        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 sm:max-w-xs" />
    </label>}
    <label className="flex items-start gap-2 text-sm text-slate-600"><input name="confirm" type="checkbox" value="yes" required className="mt-1" />
      {operation === 'remove' ? 'Confirmo a remoção e o recálculo do ranking deste torneio.'
        : operation === 'complete' ? 'Conferi as datas e pontuações dos participantes. Confirmo a aplicação de penalidades por ausência.'
        : 'Confirmo a data e o recálculo do ranking, incluindo ausências se o histórico estiver pronto.'}
    </label>
    <button disabled={pending} className={`rounded-lg px-4 py-2 font-semibold disabled:opacity-50 ${operation === 'remove' ? 'border border-red-300 text-red-800' : 'bg-emerald-700 text-white hover:bg-emerald-800'}`}>{pending ? 'Salvando…' : label}</button>
    <div aria-live="polite">{state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}{state.message && <p className="text-sm text-emerald-800">{state.message}</p>}</div>
  </form>;
}
