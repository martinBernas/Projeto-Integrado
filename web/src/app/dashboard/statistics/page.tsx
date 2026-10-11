import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { loadPersonalStatistics, periodLabels, saoPauloToday, statisticsPeriod, thirtyDayStart } from '@/lib/personal-statistics';
import { formatDate, formatScore } from '@/lib/tournament';
import { ScoreChart } from './score-chart';
import { RetryLoad } from '../retry-load';

export default async function PersonalStatisticsPage({ searchParams }: { searchParams: Promise<{ period?: string | string[] }> }) {
  if (!isSupabaseConfigured) return <main className="p-8">Serviço em preparação.</main>;
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/auth/login');
  const period = statisticsPeriod((await searchParams).period), today = saoPauloToday();
  let stats;
  // Use the narrow read-only query contract; Supabase's generic overloads can
  // otherwise expand recursively when checked against a fluent query interface.
  try { stats = await loadPersonalStatistics(client as unknown as Parameters<typeof loadPersonalStatistics>[0], user.id, period, today); } catch { /* Render an error, never partial metrics. */ }
  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6"><div className="mx-auto max-w-4xl space-y-6">
    <header><Link href="/dashboard" className="font-semibold text-emerald-800">← Voltar ao painel</Link><h1 className="mt-4 text-3xl font-bold">Minhas estatísticas</h1><p className="mt-2 text-slate-600">Seu desempenho pessoal com base nas pontuações brutas. Auditorias e penalidades de torneios não alteram estas médias.</p></header>
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <form method="get" action="/dashboard/statistics" className="flex flex-wrap items-end gap-3">
        <label className="font-semibold">Período<select name="period" defaultValue={period} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2">{Object.entries(periodLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <button className="rounded-lg bg-emerald-800 px-4 py-2 font-semibold text-white">Aplicar período</button>
      </form>
      <p className="mt-3 text-sm text-slate-600">{period === 'last5' ? 'Os cinco dias jogados mais recentes, mesmo que não sejam consecutivos.' : period === 'last30' ? `De ${formatDate(thirtyDayStart(today))} a ${formatDate(today)}, no horário de São Paulo.` : 'Todo o seu histórico pessoal até hoje, no horário de São Paulo.'} Somente pontuações positivas entram nas médias e no gráfico.</p>
    </section>
    {!stats ? <section role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-5"><h2 className="font-bold">Estatísticas temporariamente indisponíveis</h2><p className="mt-2">Não foi possível carregar todos os dados do período. Tente novamente.</p><RetryLoad /></section>
      : !stats.days ? <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-bold">Sem dias jogados neste período</h2><p className="mt-2 text-slate-600">Quando houver uma pontuação positiva, suas médias e o gráfico aparecerão aqui. Você também pode selecionar outro período.</p></section>
      : <><section aria-label="Médias pessoais" className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="font-semibold text-slate-600">Média bruta diária</h2><p className="mt-2 text-3xl font-bold tabular-nums">{formatScore(stats.dailyAverage!)} <span className="text-sm font-normal">pontos</span></p><p className="mt-2 text-sm text-slate-600">{stats.days} dias jogados · até 25.000 pontos por dia</p></article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="font-semibold text-slate-600">Média por jogo</h2><p className="mt-2 text-3xl font-bold tabular-nums">{formatScore(stats.gameAverage!)} <span className="text-sm font-normal">pontos</span></p><p className="mt-2 text-sm text-slate-600">{stats.days * 5} jogos · cinco por dia · até 5.000 pontos por jogo</p></article>
      </section><ScoreChart points={stats.points} /></>}
    <p className="text-sm text-slate-600">Médias arredondadas sem casas decimais, somente após o cálculo. Pontuações zero e dias sem lançamento não entram no número de dias jogados.</p>
  </div></main>;
}
