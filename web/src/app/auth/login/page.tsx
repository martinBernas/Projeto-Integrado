import Link from "next/link";
import { AuthForm } from "./auth-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="auth-page min-h-screen bg-slate-50 px-6 py-16"><div className="mx-auto max-w-4xl space-y-8"><Link className="font-bold text-slate-900" href="/">GeoGuaras</Link><div className="auth-intro"><p className="eyebrow">Sua próxima rodada começa aqui</p><h1 className="mt-2 text-3xl font-bold">Bom ter você na disputa.</h1><p className="mt-3 text-slate-600">Entre ou crie sua conta para registrar pontuações e acompanhar seus torneios.</p></div>
    {error && <p role="alert" className="text-red-700">Não foi possível validar o link de acesso. Tente entrar com e-mail e senha ou use “Esqueci minha senha”.</p>}
    <AuthForm /></div></main>;
}
