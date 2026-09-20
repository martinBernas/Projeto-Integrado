import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatScore, type TournamentData } from '@/lib/tournament';
import { ScoreForm } from './score-form';
import { TournamentView } from './tournament-view';

export default async function DashboardPage() {
  if (!isSupabaseConfigured) return <main className="mx-auto min-h-screen max-w-2xl px-6 py-20"><h1 className="text-3xl font-bold">Serviço em preparação</h1><p className="mt-4 text-slate-600">O acesso às pontuações estará disponível em breve.</p><Link className="mt-6 inline-block font-semibold text-emerald-700" href="/">Voltar ao início</Link></main>;
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/auth/login");
  const [{ data, error }, { data: history, error: historyError }] = await Promise.all([
    supabase.rpc('get_september_dashboard'),
    supabase.from('personal_scores').select('id, played_on, score, source').eq('player_id', user.id).order('played_on', { ascending: false }).limit(100),
  ]);
  const tournament = data?.access ? data as TournamentData : null;
  const today = tournament?.today ?? new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const ownToday = history?.find(row => row.played_on === today)?.score;
  const todayIsGame = tournament && today >= tournament.tournament.starts_at && today <= tournament.tournament.ends_at
    && !tournament.excluded_dates.includes(today) && ![0, 6].includes(new Date(`${today}T12:00:00Z`).getUTCDay());
  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div><Link href="/" className="text-sm font-bold tracking-wide text-emerald-800">GEOGUARAS</Link><h1 className="mt-2 text-3xl font-bold tracking-tight">Seu painel</h1><p className="mt-1 break-all text-sm text-slate-600">{user.email}</p></div>
        <form action={signOut}><button className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold">Sair</button></form>
      </header>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7" aria-labelledby="entry-title">
        <h2 id="entry-title" className="mb-4 text-xl font-bold">Resultado de hoje</h2>
        <ScoreForm today={today} current={ownToday} />
        {tournament && !todayIsGame && <p className="mt-4 rounded-lg bg-slate-100 p-3 text-sm">Hoje não é dia de jogo deste torneio. O lançamento fica apenas no seu histórico pessoal.</p>}
      </section>
      {error ? <section role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-5"><h2 className="font-bold">Torneio temporariamente indisponível</h2><p className="mt-2 text-sm">Não foi possível carregar os resultados. Tente atualizar a página em instantes.</p></section>
        : !tournament ? <section className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-bold">Aguardando vínculo ao torneio</h2><p className="mt-2 text-slate-600">Sua conta está pronta. O organizador irá vincular os participantes ao torneio de setembro e carregar o histórico. Você já pode registrar suas pontuações pessoais.</p></section>
        : <TournamentView data={tournament} userId={user.id} />}
      <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-bold">Meu histórico pessoal</h2><p className="mt-1 text-sm text-slate-600">Até 100 lançamentos recentes, incluindo dias que não contam no torneio.</p>
        {historyError ? <p role="alert" className="mt-4 text-red-700">Não foi possível carregar seu histórico.</p> : !history?.length ? <p className="mt-4 text-slate-600">Seu primeiro lançamento aparecerá aqui.</p> : <ul className="mt-4 divide-y divide-slate-100">{history.map(row => <li key={row.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span>{formatDate(row.played_on)} <span className="ml-2 text-slate-500">{row.source === 'manual_history' ? 'Carga histórica' : 'Lançamento pessoal'}</span></span><strong className="tabular-nums">{formatScore(row.score)}</strong></li>)}</ul>}
      </section>
    </div>
  </main>;
}
