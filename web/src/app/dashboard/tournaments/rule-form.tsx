"use client";
import { useActionState, useState } from 'react';
import { formatDate, formatScore } from '@/lib/tournament';
import { modeLabel, scheduleLabel, type RuleVersion } from '@/lib/rules';
import { reviseRules } from './rule-actions';
import { RuleFields } from './rule-fields';

const kindLabel = (kind: string | null) => kind === 'score' ? 'resultado' : kind === 'absence' ? 'ausência' : 'aguardando';

export function RuleForm({ id, start, end, rule }: { id: string; start: string; end: string; rule: RuleVersion }) {
  const [state, action, pending] = useActionState(reviseRules, {});
  const [dirty, setDirty] = useState(false);
  const preview = !dirty ? state.preview : undefined;
  return <div className="space-y-6">
    <form action={action} onChange={() => setDirty(true)} onSubmit={() => setDirty(false)} className="space-y-4">
      <input type="hidden" name="target" value={id} /><input type="hidden" name="operation" value="preview" />
      <p className="text-sm text-slate-600">Defina a configuração completa para o intervalo. As versões anteriores ficam preservadas; a revisão mais recente prevalece em cada data. Datas fora do intervalo mantêm suas regras.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">Vigência inicial<input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" name="rule_from" type="date" min={start} max={end} defaultValue={start} required /></label>
        <label className="block text-sm font-medium">Vigência final<input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" name="rule_to" type="date" min={start} max={end} defaultValue={end} required /></label>
      </div>
      <RuleFields rule={rule} />
      <label className="block text-sm font-medium">Motivo da revisão<textarea className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" name="reason" rows={2} minLength={3} maxLength={500} required /></label>
      <button disabled={pending} className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-50">{pending ? 'Conferindo…' : 'Conferir impacto'}</button>
    </form>
    <div aria-live="polite">{state.error && <p role="alert" className="text-red-700">{state.error}</p>}{state.message && <p role="status" className="text-emerald-800">{state.message}</p>}</div>
    {preview && <section aria-labelledby="preview-title" className="space-y-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
      <h3 id="preview-title" className="text-lg font-bold">Prévia da revisão{preview.retroactive ? ' retroativa' : ''}</h3>
      <p className="text-sm">{formatDate(preview.proposal.from)} a {formatDate(preview.proposal.to)} · {modeLabel(preview.proposal.mode)} · Ausência {formatScore(preview.proposal.penalty)} · {scheduleLabel(preview.proposal.schedule)}</p>
      <p className="break-words text-sm">Motivo: {preview.proposal.reason}</p>
      <p className="text-sm">Datas excluídas: {preview.proposal.exclusions.length ? preview.proposal.exclusions.map(e => `${formatDate(e.date)} (${e.reason})`).join('; ') : 'nenhuma'}</p>
      <p className="text-sm">{preview.changes.length} resultados com alteração de valor, situação ou presença no calendário. A confirmação também registra a nova versão mesmo quando os valores não mudam. Dias futuros ainda não geram resultados nesta prévia.</p>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="mb-2 text-left font-semibold">Impacto nos totais acumulados</caption><thead><tr><th className="p-2">Jogador</th><th className="p-2 text-right">Antes</th><th className="p-2 text-right">Depois</th><th className="p-2 text-right">Diferença</th></tr></thead><tbody>{preview.totals.map(t => <tr key={t.player_id} className="border-t border-amber-200"><th scope="row" className="p-2 font-medium">{t.name}</th><td className="p-2 text-right">{formatScore(t.before)}</td><td className="p-2 text-right">{formatScore(t.after)}</td><td className="p-2 text-right">{formatScore(t.delta)}</td></tr>)}</tbody></table></div>
      {!!preview.changes.length && <details><summary className="cursor-pointer font-semibold">Conferir alterações por dia</summary><div className="mt-3 max-h-96 overflow-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Dia</th><th className="p-2">Jogador</th><th className="p-2">Antes</th><th className="p-2">Depois</th></tr></thead><tbody>{preview.changes.map(c => <tr key={`${c.player_id}-${c.day}`} className="border-t border-amber-200"><td className="p-2">{formatDate(c.day)}</td><th scope="row" className="p-2 font-medium">{preview.totals.find(t => t.player_id === c.player_id)?.name ?? 'Jogador'}</th><td className="p-2">{c.before === null ? 'Fora do calendário' : `${formatScore(c.before)} (${kindLabel(c.before_kind)})`}</td><td className="p-2">{c.after === null ? 'Fora do calendário' : `${formatScore(c.after)} (${kindLabel(c.after_kind)})`}</td></tr>)}</tbody></table></div></details>}
      <form action={action} className="space-y-3"><input type="hidden" name="target" value={id} /><input type="hidden" name="operation" value="apply" /><input type="hidden" name="token" value={preview.token} /><input type="hidden" name="proposal" value={JSON.stringify(preview.proposal)} />
        <label className="flex items-start gap-2 text-sm"><input name="confirm" type="checkbox" value="yes" required className="mt-1" />Conferi o intervalo, a configuração e o impacto. Confirmo a revisão, incluindo o recálculo dos dias anteriores quando aplicável.</label>
        <button disabled={pending} className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-50">{pending ? 'Aplicando…' : 'Confirmar revisão'}</button>
      </form>
    </section>}
  </div>;
}
