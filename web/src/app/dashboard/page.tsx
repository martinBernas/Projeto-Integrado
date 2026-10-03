import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatScore, type TournamentData } from '@/lib/tournament';
import { ScoreForm } from './score-form';
import { TournamentView } from './tournament-view';
import { RecentResults } from './recent-results';
import { TournamentPanel } from './tournament-panel';
import { RetryLoad } from './retry-load';
import { measureDashboardQuery } from '@/lib/dashboard-metrics';
import { ruleForDate } from '@/lib/rules';

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ tournament?: string | string[] }> }) {
  if (!isSupabaseConfigured) return <main className="mx-auto min-h-screen max-w-2xl px-6 py-20"><h1 className="text-3xl font-bold">Serviço em preparação</h1><p className="mt-4 text-slate-600">O acesso às pontuações estará disponível em breve.</p><Link className="mt-6 inline-block font-semibold text-emerald-700" href="/">Voltar ao início</Link></main>;
  const supabase = await createClient(); const { data: { user } } = await measureDashboardQuery('authentication', supabase.auth.getUser()); if (!user) redirect("/auth/login");
  const requested = (await searchParams).tournament;
  const [{ data: tournaments, error: listError }, { data: history, error: historyError }, { data: profile }] = await Promise.all([
    measureDashboardQuery('tournaments', supabase.from('tournaments').select('id, name, starts_at, ends_at, closed_at, organizer_id').order('starts_at', { ascending: false }).order('id')),
    measureDashboardQuery('personal_history', supabase.from('personal_scores').select('id, played_on, score, source').eq('player_id', user.id).order('played_on', { ascending: false }).limit(100)),
    measureDashboardQuery('profile', supabase.from('profiles').select('public_name_confirmed').eq('id',user.id).maybeSingle()),
  ]);
  const selected = requested === undefined ? tournaments?.find(t => !t.closed_at) ?? tournaments?.[0] : tournaments?.find(t => t.id === requested);
  const { data, error } = selected ? await measureDashboardQuery('tournament_rpc', supabase.rpc('get_tournament_dashboard', { target: selected.id })) : { data: null, error: null };
  const tournament = data?.access ? data as TournamentData : null;
  const today = tournament?.today ?? new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const ownToday = history?.find(row => row.played_on === today)?.score;
  const todayRule = tournament?.rule_versions ? ruleForDate(tournament.rule_versions, today) : undefined;
  const todayIsGame = tournament && today >= tournament.tournament.starts_at && today <= tournament.tournament.ends_at
    && !(todayRule?.exclusions.map(e => e.date) ?? tournament.excluded_dates).includes(today)
    && (todayRule?.weekly_schedule === 'every_day' ? true : todayRule?.weekly_schedule === 'monday_to_friday_and_sunday'
      ? new Date(`${today}T12:00:00Z`).getUTCDay() !== 6
      : ![0, 6].includes(new Date(`${today}T12:00:00Z`).getUTCDay()));
  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div><Link href="/" className="text-sm font-bold tracking-wide text-emerald-800">GEOGUARAS</Link><h1 className="mt-2 text-3xl font-bold tracking-tight">Seu painel</h1><p className="mt-1 break-all text-sm text-slate-600">{user.email}</p></div>
        <div className="flex flex-wrap items-center gap-4"><Link href="/dashboard/profile" className="font-semibold text-emerald-800">Meu perfil</Link><Link href="/dashboard/tournaments" className="font-semibold text-emerald-800">Administrar torneios</Link><form action={signOut}><button className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold">Sair</button></form></div>
      </header>
      {profile && !profile.public_name_confirmed && <aside className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">Confirme seu nome público para ser identificado nos torneios. <Link href="/dashboard/profile" className="font-semibold underline">Completar meu perfil</Link></aside>}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7" aria-labelledby="entry-title">
        <h2 id="entry-title" className="mb-4 text-xl font-bold">Resultado de hoje</h2>
        <ScoreForm today={today} current={ownToday} />
        {tournament && (!todayIsGame || tournament.tournament.closed_at) && <p className="mt-4 rounded-lg bg-slate-100 p-3 text-sm">Este lançamento não conta no torneio selecionado. Sua pontuação pessoal pode contar em outros torneios elegíveis.</p>}
      </section>
      <TournamentPanel tournaments={listError ? [] : tournaments ?? []} selectedId={selected?.id}>
        {listError ? <section role="alert" className="rounded-xl bg-white p-5 text-red-700"><p>Não foi possível carregar seus torneios.</p><RetryLoad /></section> : !tournaments?.length && <p className="rounded-xl bg-white p-5 text-slate-600">Você ainda não participa de um torneio. O organizador pode incluir sua conta; você já pode registrar pontuações pessoais.</p>}
      {error || (selected && !data) ? <section role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-5"><h2 className="font-bold">Torneio temporariamente indisponível</h2><p className="mt-2 text-sm">Não foi possível carregar os resultados. Tente novamente.</p><RetryLoad /></section>
        : !tournament ? (requested !== undefined && !listError ? <section role="alert" className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-bold">Torneio indisponível</h2><p className="mt-2 text-slate-600">Este torneio não existe ou sua conta não tem acesso. Selecione um dos seus torneios acima.</p></section> : null)
        : <TournamentView data={tournament} userId={user.id} />}
      </TournamentPanel>
      {historyError ? <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-bold">Meu histórico pessoal</h2><p role="alert" className="mt-4 text-red-700">Não foi possível carregar seu histórico.</p><RetryLoad /></section>
        : <RecentResults key={user.id} personal items={(history ?? []).map(row => ({ day: row.played_on, content: <div className="flex flex-wrap justify-between gap-2 border-b border-slate-100 py-3 text-sm"><span>{formatDate(row.played_on)} <span className="ml-2 text-slate-500">{row.source === 'manual_history' ? 'Carga histórica' : 'Lançamento pessoal'}</span></span><strong className="tabular-nums">{formatScore(row.score)}</strong></div> }))} />}
    </div>
  </main>;
}
