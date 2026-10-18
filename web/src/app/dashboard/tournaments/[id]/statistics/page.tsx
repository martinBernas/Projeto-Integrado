import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { formatDate, type TournamentData } from '@/lib/tournament';
import { tournamentStatistics, statisticsScore } from '@/lib/tournament-statistics';
import { RetryLoad } from '../../../retry-load';
import { ComparisonChart } from './comparison-chart';

export default async function TournamentStatisticsPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured) return <main className="p-8">Serviço em preparação.</main>;
  const { id } = await params;
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/auth/login');
  if (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)) return <main className="p-8">Torneio indisponível.</main>;
  const { data: result, error } = await client.rpc('get_tournament_dashboard', { target: id });
  if (error) return <main className="p-8"><p role="alert">Não foi possível carregar as estatísticas ou sua conta não tem acesso.</p><RetryLoad /><Link href="/dashboard" className="underline">Voltar ao painel</Link></main>;
  if (!result?.access) return <main className="p-8">Torneio indisponível.</main>;
  const data = result as TournamentData, stats = tournamentStatistics(data, user.id);
  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6"><div className="mx-auto max-w-4xl space-y-6">
    <header><Link href={`/dashboard?tournament=${id}`} className="font-semibold text-emerald-800">← Voltar ao torneio</Link>
      <h1 className="mt-4 text-3xl font-bold">Seu desempenho no torneio</h1><p className="mt-2 text-lg font-semibold">{data.tournament.name}</p>
      <p className="mt-1 text-sm text-slate-600">{formatDate(data.tournament.starts_at)} a {formatDate(data.tournament.ends_at)} · Somente dias encerrados, anteriores a {formatDate(data.today)} (São Paulo).</p>
      {data.tournament.closed_at && <p className="mt-2 font-semibold">Torneio encerrado · Resultados preservados</p>}
    </header>
    <p className="rounded-xl bg-white p-4 text-sm text-slate-600">Médias calculadas com pontos aplicados neste torneio, incluindo ausências e punições. A comparação reúne os demais participantes e exclui seus resultados. Seus dados pessoais de outros torneios não entram aqui.</p>
    {!stats.points.length ? <section className="rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">Sem dias encerrados com dados</h2><p className="mt-2">As estatísticas aparecerão quando houver resultados de dias elegíveis encerrados.</p></section> : <>
      <section aria-label="Comparação de médias" className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6"><h2 className="font-semibold text-emerald-900">Sua média no torneio</h2><p className="mt-2 text-3xl font-bold">{stats.ownAverage === null ? 'Sem dados' : `${statisticsScore(stats.ownAverage)} pontos`}</p><p className="mt-2 text-sm">{stats.ownDays} dias elegíveis encerrados, incluindo ausências.</p>{!stats.participant && <p className="mt-2 text-sm">Você não participa como jogador deste torneio.</p>}</article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="font-semibold text-slate-600">Média conjunta dos demais</h2><p className="mt-2 text-3xl font-bold">{stats.othersAverage === null ? 'Sem dados' : `${statisticsScore(stats.othersAverage)} pontos`}</p><p className="mt-2 text-sm">{stats.othersDays} participações elegíveis por dia, incluindo ausências. Cada participante em cada dia conta uma vez.</p></article>
      </section>
      {stats.ownDays > 0 && <section aria-label="Suas colocações" className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border bg-white p-5"><h2 className="font-semibold">Seus dias em primeiro lugar</h2><p className="mt-2 text-3xl font-bold">{stats.first}</p></article>
        <article className="rounded-2xl border bg-white p-5"><h2 className="font-semibold">Seus dias em último lugar</h2><p className="mt-2 text-3xl font-bold">{stats.last}</p></article>
      </section>}
      <ComparisonChart points={stats.points} />
    </>}
    <p className="text-sm text-slate-600">Colocações consideram somente jogos com bruto positivo válido, comparados pelos pontos aplicados. Zero aplicado válido no relativo conta; ausências e pontuações invalidadas não contam. Todos os empatados recebem a contagem; um único resultado válido conta em primeiro e último.</p>
    <p className="text-sm text-slate-600">Médias arredondadas somente na exibição. Atualize a página após novos resultados ou decisões de auditoria. Estatísticas pessoais globais continuam em “Minhas estatísticas”.</p>
  </div></main>;
}
