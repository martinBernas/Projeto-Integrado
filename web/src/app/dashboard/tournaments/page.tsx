import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { formatDate } from '@/lib/tournament';
import { CloseTournamentForm, TournamentForm, type ManagedTournament } from './tournament-form';

export default async function ManageTournamentsPage() {
  if (!isSupabaseConfigured) return <main className="p-8"><h1 className="text-2xl font-bold">Serviço em preparação</h1><Link href="/dashboard">Voltar ao painel</Link></main>;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { data, error } = await supabase.from('tournaments')
    .select('id, name, starts_at, ends_at, closed_at').eq('organizer_id', user.id).order('created_at', { ascending: false });
  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6"><div className="mx-auto max-w-3xl space-y-6">
    <header><Link href="/dashboard" className="font-semibold text-emerald-800">← Voltar ao painel</Link><h1 className="mt-4 text-3xl font-bold">Administrar torneios</h1>
      <p className="mt-2 text-slate-600">Crie competições e administre os torneios que você organiza.</p></header>
    {error ? <p role="alert" className="rounded-xl bg-amber-50 p-5">Administração temporariamente indisponível. Tente novamente em instantes.</p> : <>
      <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="mb-3 text-xl font-bold">Novo torneio</h2>
        <p className="mb-5 text-sm leading-6 text-slate-600">Regra atual: diferença para o menor positivo, ausência de −2.500 após o fim do dia, segunda a sexta, no horário de São Paulo. Novos torneios começam sem participantes, sem datas excluídas e com o histórico em preparação.</p>
        <TournamentForm />
      </section>
      <section className="space-y-4"><h2 className="text-xl font-bold">Torneios que organizo</h2>
        {!data?.length && <p className="text-slate-600">Você ainda não criou um torneio.</p>}
        {(data as ManagedTournament[] | null)?.map(tournament => <article key={tournament.id} className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="break-words text-lg font-bold">{tournament.name}</h3>
          <p className="mb-5 mt-1 text-sm text-slate-600">{formatDate(tournament.starts_at)} a {formatDate(tournament.ends_at)} · {tournament.closed_at ? 'Encerrado' : 'Aberto'}</p>
          <Link href={`/dashboard/tournaments/${tournament.id}/participants`} className="mb-5 inline-block font-semibold text-emerald-800">{tournament.closed_at ? 'Consultar participantes' : 'Gerenciar participantes'}</Link>
          {tournament.closed_at ? <p className="text-sm text-slate-600">Resultados preservados. Edição indisponível após o encerramento.</p>
            : <><TournamentForm tournament={tournament} /><CloseTournamentForm id={tournament.id} /></>}
        </article>)}
      </section>
    </>}
  </div></main>;
}
