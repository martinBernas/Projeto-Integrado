import Link from 'next/link';
import { formatDate } from '@/lib/tournament';
import { auditTimestamp } from '@/lib/audits';
import { notificationTotals, type TournamentNotifications } from '@/lib/notifications';
import { RetryLoad } from './retry-load';

export function NotificationCards({ data, failed, isOrganizer }: { data: TournamentNotifications | null; failed: boolean; isOrganizer: boolean }) {
  const totals = data ? notificationTotals(data) : null;
  return <>
    {isOrganizer && <aside className="rounded-xl border border-amber-200 bg-amber-50 p-4" aria-labelledby="organizer-notifications">
      <h2 id="organizer-notifications" className="font-bold">Notificações dos seus torneios</h2>
      <Link href="/dashboard/notifications" className="mt-2 inline-block font-semibold text-emerald-800 underline">Gerenciar notificações dos torneios</Link>
      {failed || !totals ? <p role="alert" className="mt-2 text-sm">Não foi possível conferir as pendências. Abra a gestão para tentar novamente.</p>
        : <p className="mt-2 text-sm">{totals.corrections} ajuste(s) para decidir · {totals.requests} denúncia(s) para avaliar · {totals.voting} auditoria(s) em votação · {totals.ready} apuração(ões) pendente(s).</p>}
    </aside>}
    {failed ? <aside role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm"><p>Não foi possível conferir as votações abertas.</p><RetryLoad /></aside>
      : !!data?.open_votings.length && <aside className="rounded-xl border border-sky-200 bg-sky-50 p-4" aria-labelledby="open-votings">
        <h2 id="open-votings" className="font-bold">Votações abertas nos seus torneios ({data.open_votings.length})</h2>
        <ul className="mt-3 space-y-3">{data.open_votings.map(vote => <li key={vote.id} className="text-sm">
          <Link href={`/dashboard/tournaments/${vote.tournament_id}/audits#audit-${vote.id}`} prefetch={false} className="font-semibold text-emerald-800 underline">{vote.tournament_name} · {formatDate(vote.played_on)} · {vote.can_vote ? vote.has_voted ? 'Consultar ou alterar meu voto' : 'Votar' : 'Acompanhar votação'}</Link>
          <p className="mt-1">Prazo: {auditTimestamp(vote.deadline)} (São Paulo). {vote.has_voted ? 'Seu voto já foi registrado. O aviso permanece até o fim da votação.' : !vote.can_vote ? 'Sua conta acompanha esta avaliação, sem direito a voto.' : 'Seu voto é secreto.'}</p>
        </li>)}</ul>
      </aside>}
  </>;
}
