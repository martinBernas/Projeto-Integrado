import Link from "next/link";
import { AuthForm } from "./auth-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="min-h-screen bg-slate-50 px-6 py-16"><div className="mx-auto max-w-3xl space-y-8"><Link className="font-bold text-slate-900" href="/">← GeoGuaras</Link><div><p className="font-semibold text-emerald-700">Acesso</p><h1 className="mt-2 text-3xl font-bold">Entre para registrar suas pontuações.</h1></div>
    {error && <p role="alert" className="text-red-700">Não foi possível validar o link de acesso. Tente entrar com e-mail e senha ou use “Esqueci minha senha”.</p>}
    <AuthForm /></div></main>;
}
