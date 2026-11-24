"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPassword, type AuthState } from "./actions";

export function PasswordForm() {
  const [state, action, pending] = useActionState(resetPassword, {} as AuthState);
  const inputClass = "mt-1 w-full rounded-md border border-slate-300 px-3 py-2";
  return <form action={action} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    {!state.message && <>
        <label className="block text-sm font-medium">Nova senha<input className={inputClass} name="password" type="password" autoComplete="new-password" minLength={6} required /></label>
        <label className="block text-sm font-medium">Confirme a nova senha<input className={inputClass} name="confirmation" type="password" autoComplete="new-password" minLength={6} required /></label>
      <button className="w-full rounded-md bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-60" disabled={pending}>{pending ? "Aguarde…" : "Salvar nova senha"}</button>
    </>}
    {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
    {state.message && <p role="status" className="text-sm text-emerald-700">{state.message}</p>}
    {state.message ? <Link className="block font-semibold underline" href="/dashboard">Acessar painel</Link> : <Link className="block text-sm underline" href="/auth/forgot-password">Solicitar novo código</Link>}
  </form>;
}
