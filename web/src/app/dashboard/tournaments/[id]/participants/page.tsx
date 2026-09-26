import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { formatDate, type Participant } from '@/lib/tournament';
import { ParticipantForm } from '../../participant-form';

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
  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6"><div className="mx-auto max-w-3xl space-y-6">
    <header><Link href="/dashboard/tournaments" className="font-semibold text-emerald-800">← Voltar aos torneios</Link>
      <h1 className="mt-4 text-3xl font-bold">Participantes</h1><p className="mt-2 break-words text-lg">{tournament.name}</p>
      <p className="mt-1 text-sm text-slate-600">{formatDate(tournament.starts_at)} a {formatDate(tournament.ends_at)}</p>
    </header>
    <aside className="rounded-xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600">
      {tournament.closed_at ? 'Torneio encerrado. Participantes e resultados estão preservados.'
        : 'As pontuações pessoais já registradas contam desde a data de participação, inclusive antes do vínculo. Adicionar, remover ou mudar a data pode alterar a diferença relativa de todos os jogadores deste torneio. As pontuações pessoais e os outros torneios são preservados.'}
    </aside>
    <section className="space-y-4"><h2 className="text-xl font-bold">Participantes atuais{!members.error && ` (${people.length})`}</h2>
      {members.error ? <p role="alert">Não foi possível carregar os participantes. Atualize a página.</p>
        : !people.length ? <p className="text-slate-600">Nenhum participante vinculado ainda.</p>
        : people.map(person => <article key={`${person.id}-${person.eligible_from}`} className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="break-words font-bold">{person.name}</h3><p className="mt-1 text-sm text-slate-600">Participa desde {formatDate(person.eligible_from)}</p>
          {!tournament.closed_at && <><ParticipantForm {...period} player={person.id} eligible={person.eligible_from} operation="update" />
            <details className="mt-5 border-t border-slate-200 pt-4"><summary className="cursor-pointer text-sm font-semibold text-red-800">Remover participante</summary>
              <p className="mt-2 text-sm text-slate-600">Remove a participação e a contribuição no ranking deste torneio. O histórico pessoal permanece.</p>
              <ParticipantForm {...period} player={person.id} operation="remove" /></details></>}
        </article>)}
    </section>
    {!tournament.closed_at && <>
      <section className="space-y-4"><h2 className="text-xl font-bold">Adicionar usuários cadastrados</h2>
        <p className="text-sm text-slate-600">Selecione pelo nome e e-mail. Contas já vinculadas não aparecem nesta lista.</p>
        <form method="get" className="flex flex-wrap items-end gap-3"><label className="min-w-0 flex-1 text-sm font-medium">Buscar nome ou e-mail
          <input name="q" maxLength={254} defaultValue={query} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2" /></label>
          <button className="rounded-lg bg-slate-800 px-4 py-2 font-semibold text-white">Buscar</button></form>
        {candidates.error ? <p role="alert">Não foi possível carregar os usuários. Atualize a página.</p>
          : !directory?.users.length ? <p className="text-slate-600">Nenhuma conta disponível para esta busca.</p>
          : directory.users.map(candidate => <article key={candidate.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="break-words font-bold">{candidate.name}</h3><p className="mt-1 break-all text-sm text-slate-600">{candidate.email ?? 'Sem e-mail cadastrado'}</p>
            <ParticipantForm {...period} player={candidate.id} operation="add" />
          </article>)}
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
