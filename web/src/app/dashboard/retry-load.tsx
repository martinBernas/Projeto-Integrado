"use client";

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export function RetryLoad() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <div className="mt-4">
    <button type="button" disabled={pending} onClick={() => startTransition(() => router.refresh())}
      className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">
      {pending ? 'Carregando…' : 'Tentar novamente'}
    </button>
    {pending && <p role="status" aria-live="polite" className="mt-2 text-sm">Consultando os dados novamente…</p>}
  </div>;
}
