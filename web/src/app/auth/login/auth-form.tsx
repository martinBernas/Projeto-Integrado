"use client";

import { useActionState } from "react";
import { signIn, signUp, type AuthState } from "../actions";

const initialState: AuthState = {};
const Field = ({ label, type }: { label: string; type: string }) => <label className="block text-sm font-medium">{label}<input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" name={type} type={type} minLength={type === "password" ? 6 : undefined} required /></label>;

export function AuthForm() {
  const [signInState, signInAction, signingIn] = useActionState(signIn, initialState);
  const [signUpState, signUpAction, signingUp] = useActionState(signUp, initialState);
  return <div className="grid gap-6 sm:grid-cols-2"><form action={signInAction} className="space-y-4 rounded-xl border border-slate-200 p-6 shadow-sm"><div><h2 className="text-xl font-bold">Entrar</h2><p className="mt-1 text-sm text-slate-600">Acesse sua conta.</p></div><Field label="E-mail" type="email" /><Field label="Senha" type="password" />{signInState.error && <p className="text-sm text-red-700">{signInState.error}</p>}<button className="w-full rounded-md bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-60" disabled={signingIn}>{signingIn ? "Entrando…" : "Entrar"}</button></form><form action={signUpAction} className="space-y-4 rounded-xl border border-slate-200 p-6 shadow-sm"><div><h2 className="text-xl font-bold">Criar conta</h2><p className="mt-1 text-sm text-slate-600">Comece seu histórico de pontuações.</p></div><Field label="E-mail" type="email" /><Field label="Senha" type="password" />{signUpState.error && <p className="text-sm text-red-700">{signUpState.error}</p>}{signUpState.message && <p className="text-sm text-emerald-700">{signUpState.message}</p>}<button className="w-full rounded-md bg-emerald-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60" disabled={signingUp}>{signingUp ? "Criando…" : "Criar conta"}</button></form></div>;
}
