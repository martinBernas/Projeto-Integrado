import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatDate, formatScore } from '@/lib/tournament';
import type { ScoreChangesData, ScoreChangeSummary } from '@/lib/score-changes';
import { RetroactiveScoreForm, ScoreChangeReview } from './forms';
import { RetryLoad } from '../retry-load';

export default async function ScoreChangesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const rawPage = (await searchParams).page;
  const page = rawPage && /^\d{1,6}$/.test(rawPage) ? Math.min(Number(rawPage), 100000) : 0;
  const [{ data, error }, { data: summaryData, error: summaryError }] = await Promise.all([
    supabase.rpc('get_score_changes', { page_number: page }), supabase.rpc('get_score_change_summary'),
  ]);
  const changes = data as ScoreChangesData | null;
  const summary = summaryData as ScoreChangeSummary | null;
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const previousDay = new Date(`${today}T12:00:00Z`); previousDay.setUTCDate(previousDay.getUTCDate() - 1);
  const status = { pending: 'Aguardando decisão', approved: 'Aprovada', rejected: 'Recusada' };
  const value = (score: number | null) => score === null ? 'Sem lançamento (ausência)' : `${formatScore(score)} pontos${score === 0 ? ' (ausência)' : ''}`;
  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6"><div className="mx-auto max-w-4xl space-y-6">
    <header><Link href="/dashboard" className="font-semibold text-emerald-800">Voltar ao painel</Link><h1 className="mt-4 text-3xl font-bold">Alterações retroativas</h1></header>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><h2 className="mb-4 text-xl font-bold">Registrar ou corrigir um dia passado</h2><RetroactiveScoreForm yesterday={previousDay.toISOString().slice(0, 10)} /></section>
    <section aria-labelledby="requests-title" className="space-y-4"><h2 id="requests-title" className="text-xl font-bold">Solicitações e decisões</h2>
      {!summaryError && summary && <p className="text-sm text-slate-600">{summary.pending_approvals} pedido(s) aguardando sua decisão como organizador. {summary.pending_days} dia(s) do seu histórico aguardando decisão dos torneios.</p>}
      {error || !changes || summaryError ? <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-5"><p>Não foi possível carregar todas as solicitações. Atualize para consultar as pendências.</p><RetryLoad /></div>
        : <>{!changes.changes.length && <p className="rounded-xl bg-white p-5">Nenhuma solicitação nesta página.</p>}
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
              {decision.status === 'rejected' && <p className="mt-1 text-sm">Valor anterior preservado neste torneio. Seu histórico pessoal permanece atualizado.</p>}
              {decision.status === 'approved' && <p className="mt-1 text-sm">Alteração aceita neste torneio; punições de auditoria continuam valendo.</p>}
              {decision.decided_at && <p className="mt-2 text-sm text-slate-600">Decisão de {decision.decided_by_name || 'Organizador'} em {new Date(decision.decided_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} (São Paulo).</p>}
              {decision.can_review && <ScoreChangeReview decision={decision.id} auditBlocked={decision.audit_blocked} />}
            </div>)}</div>
          </article>)}
          <nav aria-label="Páginas das solicitações" className="flex justify-between gap-4">{page > 0 && <Link className="font-semibold text-emerald-800" href={`/dashboard/score-changes?page=${page - 1}`}>Mais recentes</Link>}{changes.has_more && <Link className="font-semibold text-emerald-800" href={`/dashboard/score-changes?page=${page + 1}`}>Mais antigas</Link>}</nav>
        </>}
    </section>
  </div></main>;
}
