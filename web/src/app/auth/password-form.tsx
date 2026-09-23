"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, resetPassword, type AuthState } from "./actions";

export function PasswordForm({ reset = false }: { reset?: boolean }) {
  const [state, action, pending] = useActionState(reset ? resetPassword : requestPasswordReset, {} as AuthState);
  const inputClass = "mt-1 w-full rounded-md border border-slate-300 px-3 py-2";
  return <form action={action} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    {!(reset && state.message) && <>
      {reset ? <>
        <label className="block text-sm font-medium">Nova senha<input className={inputClass} name="password" type="password" autoComplete="new-password" minLength={6} required /></label>
        <label className="block text-sm font-medium">Confirme a nova senha<input className={inputClass} name="confirmation" type="password" autoComplete="new-password" minLength={6} required /></label>
      </> : <label className="block text-sm font-medium">E-mail da conta<input className={inputClass} name="email" type="email" autoComplete="email" required /></label>}
      <button className="w-full rounded-md bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-60" disabled={pending}>{pending ? "Aguarde…" : reset ? "Salvar nova senha" : "Enviar link de recuperação"}</button>
    </>}
    {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
    {state.message && <p role="status" className="text-sm text-emerald-700">{state.message}</p>}
    {reset && state.message ? <Link className="block font-semibold underline" href="/dashboard">Acessar painel</Link> : <Link className="block text-sm underline" href={reset ? "/auth/forgot-password" : "/auth/login"}>{reset ? "Solicitar novo link" : "Voltar para o login"}</Link>}
  </form>;
}
