"use client";
import { useActionState } from 'react';
import { saveScore } from './actions';
import { formatDate } from '@/lib/tournament';
export function ScoreForm({ today, current }: { today: string; current?: number }) {
  const [state, action, pending] = useActionState(saveScore, {});
  return <form action={action} className="space-y-4">
    <input type="hidden" name="day" value={today} />
    <p className="text-sm text-slate-600">{formatDate(today)} · Horário de São Paulo</p>
    <label className="block font-medium" htmlFor="score">Sua pontuação bruta</label>
    <div className="flex flex-wrap gap-3">
      <input key={`${today}-${current}`} id="score" name="score" type="number" inputMode="numeric" required min={0} max={25000} step={1}
        defaultValue={current} placeholder="Ex.: 18500" aria-describedby="score-help"
        className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 focus:outline-emerald-600" />
      <button disabled={pending} className="rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
        {pending ? 'Salvando…' : current === undefined ? 'Salvar pontuação' : 'Atualizar pontuação'}
      </button>
    </div>
    <p id="score-help" className="text-sm leading-6 text-slate-600">Informe o resultado de 0 a 25.000 do jogo. No torneio, calculamos a diferença para o menor resultado positivo do dia. Zero é tratado como ausência. Você pode corrigir o lançamento até o fim do dia.</p>
    <div aria-live="polite">{state.error && <p className="text-sm text-red-700">{state.error}</p>}{state.message && <p className="text-sm text-emerald-800">{state.message}</p>}</div>
  </form>;
}
