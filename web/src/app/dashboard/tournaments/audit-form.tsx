'use client';

import { useActionState, type ReactNode } from 'react';
import { manageAudit, type AuditState } from './audit-actions';

export function AuditResolution({ target, audit }: { target: string; audit: string }) {
  const [state, action, pending] = useActionState<AuditState, FormData>(manageAudit, {});
  const tally = state.tally;
  return <div className="mt-4 space-y-3">
    <form action={action} className="space-y-3">
      <input type="hidden" name="target" value={target} />
      <input type="hidden" name="audit" value={audit} />
      <input type="hidden" name="operation" value="preview" />
      <p>1. Apure os votos para conhecer o resultado. Esta consulta não aplica punição nem altera o ranking.</p>
      {state.error && <p role="alert" className="text-red-700">{state.error}</p>}
      <button disabled={pending} className="rounded-lg bg-emerald-800 px-4 py-2 font-semibold text-white disabled:opacity-50">{pending ? 'Apurando…' : 'Apurar votos'}</button>
    </form>
    {tally && <div className="rounded-lg border border-slate-200 p-4" role="status">
      <h4 className="font-bold">Resultado dos votos</h4>
      <p>Votos a favor de invalidar a pontuação: {tally.invalid_votes}</p>
      <p>Votos contra invalidar (manter a pontuação): {tally.maintain_votes}</p>
      <p>Total de votos: {tally.invalid_votes + tally.maintain_votes}</p>
      <p className="mt-2 font-semibold">{tally.invalid_votes > tally.maintain_votes
        ? 'Maioria pela invalidação. Escolha a punição para concluir.'
        : tally.invalid_votes + tally.maintain_votes === 0 ? 'Sem votos: a pontuação será mantida, sem punição.'
        : tally.invalid_votes === tally.maintain_votes ? 'Empate: a pontuação será mantida, sem punição.'
        : 'Maioria por manter a pontuação, sem punição.'}</p>
      <p>A apuração ainda não foi encerrada. O ranking permanece inalterado até a confirmação abaixo.</p>
      <AuditForm target={target} audit={audit} operation="resolve" label={tally.invalid_votes > tally.maintain_votes ? 'Aplicar punição e encerrar' : 'Manter pontuação e encerrar'}>
        {tally.invalid_votes > tally.maintain_votes && <label className="block">2. Escolha a punição<select name="sanction" required defaultValue="" className="mt-1 block w-full rounded border p-2">
          <option value="" disabled>Selecione a punição</option>
          <option value="disregard">Desconsiderar: contribuição zero, sem penalidade</option>
          <option value="penalty">Aplicar penalidade do dia</option>
        </select></label>}
        <label className="block text-sm"><input type="checkbox" name="confirm" value="yes" required className="mr-2" />Confirmo o encerramento da apuração e seus efeitos no ranking.</label>
      </AuditForm>
    </div>}
  </div>;
}

export function AuditForm({ target, audit, operation, label, children }: {
  target: string; audit?: string; operation: string; label: string; children?: ReactNode;
}) {
  const [state, action, pending] = useActionState<AuditState, FormData>(manageAudit, {});
  return <form action={action} className="mt-4 space-y-3">
    <input type="hidden" name="target" value={target} />
    <input type="hidden" name="operation" value={operation} />
    {audit && <input type="hidden" name="audit" value={audit} />}
    {children}
    {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
    {state.message && <p role="status" className="text-sm text-emerald-800">{state.message}</p>}
    <button disabled={pending} className="rounded-lg bg-emerald-800 px-4 py-2 font-semibold text-white disabled:opacity-50">{pending ? 'Salvando…' : label}</button>
  </form>;
}
