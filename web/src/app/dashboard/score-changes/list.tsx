import Link from 'next/link';
import { formatDate, formatScore } from '@/lib/tournament';
import type { ScoreChangesData } from '@/lib/score-changes';
import { ScoreChangeReview } from './forms';

export function ScoreChangeList({ changes, userId, page, management = false, paginationParams = {} }: { changes: ScoreChangesData; userId: string; page: number; management?: boolean; paginationParams?: Record<string, string> }) {
  const user = { id: userId };
  const basePath = management ? '/dashboard/notifications' : '/dashboard/requests';
  const query = Object.entries(paginationParams).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');
  const pageHref = (next: number) => `${basePath}?${query ? `${query}&` : ''}page=${next}`;
  const status = { pending: 'Aguardando decisão', approved: 'Aprovada', rejected: 'Recusada' };
  const value = (score: number | null) => score === null ? 'Sem lançamento (ausência)' : `${formatScore(score)} pontos${score === 0 ? ' (ausência)' : ''}`;
  return <>
    {!changes.changes.length && <p className="rounded-xl bg-white p-5">Nenhuma solicitação nesta página.</p>}
          {changes.changes.map(change => <article key={change.id} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
            <h3 className="font-bold">{change.player_id === user.id ? 'Seu lançamento' : change.player_name || 'Jogador'} · {formatDate(change.played_on)}</h3>
            <p className="mt-2 text-sm">Histórico pessoal: {value(change.old_score)} → <strong>{value(change.new_score)}</strong></p>
            <p className="mt-2 text-sm text-slate-500">Solicitado em {new Date(change.requested_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} (São Paulo)</p>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm"><strong>Justificativa:</strong> {change.reason}</p>
            {!change.decisions.length && <p className="mt-4 text-sm text-slate-600">Nenhum torneio aberto elegível nesta data. Atualização somente no histórico pessoal.</p>}
            <div className="mt-4 space-y-4">{change.decisions.map(decision => <div key={decision.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="font-semibold">{decision.tournament_name}</h4>
              <p className="mt-1 text-sm">Valor anterior no torneio: {value(decision.old_score)}</p>
              <p className="mt-1 font-semibold">{status[decision.status]}</p>
              {decision.status === 'pending' && <p className="mt-1 text-sm">O torneio mantém o valor anterior até aprovação. Pedidos pendentes impedem seu encerramento.</p>}
              {decision.status === 'rejected' && <p className="mt-1 text-sm">Valor anterior preservado neste torneio. O histórico pessoal permanece atualizado.</p>}
              {decision.status === 'approved' && <p className="mt-1 text-sm">Alteração aceita neste torneio; punições de auditoria continuam valendo.</p>}
              {decision.decided_at && <p className="mt-2 text-sm text-slate-600">Decisão de {decision.decided_by_name || 'Organizador'} em {new Date(decision.decided_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} (São Paulo).</p>}
              {management && decision.can_review && <ScoreChangeReview decision={decision.id} auditBlocked={decision.audit_blocked} />}
            </div>)}</div>
          </article>)}
          <nav aria-label="Páginas das solicitações" className="flex justify-between gap-4">{page > 0 && <Link className="font-semibold text-emerald-800" href={pageHref(page - 1)}>Mais recentes</Link>}{changes.has_more && <Link className="font-semibold text-emerald-800" href={pageHref(page + 1)}>Mais antigas</Link>}</nav>

  </>;
}
