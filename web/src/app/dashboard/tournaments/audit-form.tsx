'use client';

import { useActionState, type ReactNode } from 'react';
import { manageAudit, type AuditState } from './audit-actions';

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
