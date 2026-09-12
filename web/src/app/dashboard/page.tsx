import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  if (!isSupabaseConfigured) return <main className="mx-auto min-h-screen max-w-2xl px-6 py-20"><h1 className="text-3xl font-bold">Configure o Supabase para continuar</h1><p className="mt-4 text-slate-600">Copie `.env.local.example` para `.env.local` e informe a URL e a chave pública do projeto Supabase.</p><Link className="mt-6 inline-block font-semibold text-emerald-700" href="/">Voltar ao início</Link></main>;
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/auth/login");
  return <main className="min-h-screen bg-slate-50 px-6 py-16"><div className="mx-auto max-w-4xl space-y-8"><header className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-semibold text-emerald-700">Área protegida</p><h1 className="text-3xl font-bold">Olá, {user.email}</h1></div><form action={signOut}><button className="rounded-md border border-slate-300 px-4 py-2 font-semibold">Sair</button></form></header><section className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-bold">Sprint 2 concluída</h2><p className="mt-2 text-slate-600">Sua sessão foi autenticada pelo Supabase. Os módulos de pontuações e torneios serão adicionados nas próximas sprints.</p></section></div></main>;
}
