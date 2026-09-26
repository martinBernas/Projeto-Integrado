import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { formatDate, type Participant } from '@/lib/tournament';
import { ParticipantForm } from '../../participant-form';
import { ParticipantGrid } from '../../participant-grid';

type Candidate = { id: string; name: string; email: string | null };

export default async function ParticipantsPage({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
}) {
  if (!isSupabaseConfigured) return <main className="p-8">Serviço em preparação.</main>;
  const { id } = await params;
  if (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)) notFound();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { data: tournament, error } = await supabase.from('tournaments')
    .select('id, name, starts_at, ends_at, closed_at, history_ready').eq('id', id).eq('organizer_id', user.id).maybeSingle();
  if (error) return <main className="p-8"><Link href="/dashboard/tournaments">Voltar aos torneios</Link><p role="alert">Não foi possível carregar o torneio. Tente novamente.</p></main>;
  if (!tournament) notFound();
  const filters = await searchParams;
  const query = typeof filters.q === 'string' ? filters.q.slice(0, 254) : '';
  const page = typeof filters.page === 'string' && /^\d{1,6}$/.test(filters.page) ? Math.min(Number(filters.page), 100000) : 0;
  const [members, candidates] = await Promise.all([
    supabase.rpc('get_managed_participants', { target: id }),
    tournament.closed_at ? Promise.resolve({ data: null, error: null })
      : supabase.rpc('list_participant_candidates', { target: id, search_term: query, page_number: page }),
  ]);
  const people = (members.data ?? []) as Participant[];
  const directory = candidates.data as { users: Candidate[]; has_more: boolean } | null;
  const period = { target: id, start: tournament.starts_at, end: tournament.ends_at };
  const pageUrl = (index: number) => `?${new URLSearchParams({ q: query, page: String(index) })}`;
  return <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6"><div className="mx-auto max-w-5xl space-y-5">
    <header><Link href="/dashboard/tournaments" className="font-semibold text-emerald-800">← Voltar aos torneios</Link>
      <h1 className="mt-4 text-3xl font-bold">Participantes</h1><p className="mt-2 break-words text-lg">{tournament.name}</p>
      <p className="mt-1 text-sm text-slate-600">{formatDate(tournament.starts_at)} a {formatDate(tournament.ends_at)}</p>
    </header>
    <aside className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-slate-700">
      {tournament.closed_at ? 'Torneio encerrado. Participantes e resultados estão preservados.'
        : 'A participação considera o histórico desde a data escolhida. Alterações recalculam o ranking deste torneio; pontuações pessoais e outros torneios são preservados.'}
    </aside>
    <section className="space-y-4"><h2 className="text-xl font-bold">Participantes atuais{!members.error && ` (${people.length})`}</h2>
      {members.error ? <p role="alert">Não foi possível carregar os participantes. Atualize a página.</p>
        : !people.length ? <p className="text-slate-600">Nenhum participante vinculado ainda.</p>
        : <ParticipantGrid {...period} people={people} mode="members" closed={Boolean(tournament.closed_at)} />}
    </section>
    {!tournament.closed_at && <>
      <section className="space-y-4"><h2 className="text-xl font-bold">Adicionar usuários cadastrados</h2>
        <p className="text-sm text-slate-600">Selecione pelo nome e e-mail. Contas já vinculadas não aparecem nesta lista.</p>
        <form method="get" className="flex flex-wrap items-end gap-3"><label className="min-w-0 flex-1 text-sm font-medium">Buscar nome ou e-mail
          <input name="q" maxLength={254} defaultValue={query} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2" /></label>
          <button className="rounded-lg bg-slate-800 px-4 py-2 font-semibold text-white">Buscar</button></form>
        {candidates.error ? <p role="alert">Não foi possível carregar os usuários. Atualize a página.</p>
          : !directory?.users.length ? <p className="text-slate-600">Nenhuma conta disponível para esta busca.</p>
          : <ParticipantGrid {...period} people={directory.users} mode="candidates" />}
        <nav aria-label="Páginas de usuários" className="flex gap-5 text-sm font-semibold text-emerald-800">
          {page > 0 && <Link href={pageUrl(page - 1)}>Anterior</Link>}{directory?.has_more && <Link href={pageUrl(page + 1)}>Próxima</Link>}
        </nav>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-xl font-bold">Preparação do histórico</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{tournament.history_ready
          ? 'Histórico pronto: ausências em dias encerrados recebem a penalidade, inclusive após adicionar participantes ou alterar datas.'
          : 'Histórico em preparação: resultados provisórios e sem penalidades de ausência. Confira as datas e as pontuações existentes antes de concluir.'}</p>
        {!tournament.history_ready && <ParticipantForm {...period} operation="complete" />}
      </section>
    </>}
  </div></main>;
}
