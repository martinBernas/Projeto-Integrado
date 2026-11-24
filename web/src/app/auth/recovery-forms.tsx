"use client";

import { InfoTip } from '@/app/info-tip';
import { useActionState, useState } from "react";
import Link from "next/link";
import { requestPasswordReset, verifyPasswordResetCode, type AuthState } from "./actions";

export function RecoveryForms() {
  const [email, setEmail] = useState("");
  const [requestState, requestAction, requesting] = useActionState(requestPasswordReset, {} as AuthState);
  const [verifyState, verifyAction, verifying] = useActionState(verifyPasswordResetCode, {} as AuthState);
  const pending = requesting || verifying;
  const inputClass = "mt-1 w-full rounded-md border border-slate-300 px-3 py-2";
  const buttonClass = "w-full rounded-md bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-60";
  const emailField = <label className="block text-sm font-medium">E-mail da conta<input className={inputClass} name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={pending} required /></label>;

  return <div className="space-y-6">
    <form action={requestAction} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="info-heading"><h2 className="text-xl font-semibold">1. Solicitar código</h2><InfoTip label="Reenvio do código">Para receber outro código, envie novamente e aguarde alguns minutos entre solicitações.</InfoTip></div>
      {emailField}
      <button className={buttonClass} disabled={pending}>{requesting ? "Enviando…" : "Enviar código de recuperação"}</button>
      {requestState.error && <p role="alert" className="text-sm text-red-700">{requestState.error}</p>}
      {requestState.message && <p role="status" className="text-sm text-emerald-700">{requestState.message}</p>}

    </form>
    <form action={verifyAction} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="info-heading"><h2 className="text-xl font-semibold">2. Informar código</h2><InfoTip label="Verificação em outro aparelho">Já recebeu o código? Informe o mesmo e-mail da solicitação. Você pode continuar em outro navegador ou aparelho.</InfoTip></div>

      {emailField}
      <label className="block text-sm font-medium">Código recebido por e-mail<input className={inputClass} name="code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,10}" minLength={6} maxLength={10} disabled={pending} required /></label>
      <button className={buttonClass} disabled={pending}>{verifying ? "Validando…" : "Validar código"}</button>
      {verifyState.error && <p role="alert" className="text-sm text-red-700">{verifyState.error}</p>}
    </form>
    <Link className="block text-sm underline" href="/auth/login">Voltar para o login</Link>
  </div>;
}
