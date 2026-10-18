import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { notificationPage, notificationTotals, type TournamentNotifications } from '@/lib/notifications';
import type { ScoreChangesData } from '@/lib/score-changes';
import type { TournamentData } from '@/lib/tournament';
import type { AuditData } from '@/lib/audits';
import { ScoreChangeList } from '../score-changes/list';
import { AuditHistory } from '../audit-history';
import { RetryLoad } from '../retry-load';

export default async function NotificationsPage({ searchParams }: { searchParams: Promise<{ page?: string; tournament?: string; adjustment_tournament?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { data: notificationData, error: notificationError } = await supabase.rpc('get_tournament_notifications');
  const notifications = notificationData as TournamentNotifications | null;
  if (notificationError || !notifications) return <main className="p-8"><Link href="/dashboard">Voltar ao painel</Link><p role="alert">Não foi possível conferir suas notificações.</p><RetryLoad /></main>;
  if (!notifications.is_organizer) return <main className="p-8"><Link href="/dashboard">Voltar ao painel</Link><p>Esta gestão é exclusiva dos organizadores de torneios.</p></main>;
  const params = await searchParams;
  const page = notificationPage(params.page);
  const selected = params.tournament ? notifications.managed_tournaments.find(t => t.id === params.tournament)
    : notifications.managed_tournaments.find(t => t.audits_requested + t.audits_ready + t.audits_open > 0) ?? notifications.managed_tournaments[0];
  const adjustmentTournament = params.adjustment_tournament ? notifications.managed_tournaments.find(t => t.id === params.adjustment_tournament)
    : notifications.managed_tournaments.find(t => t.corrections_pending > 0) ?? notifications.managed_tournaments[0];
  const [{ data, error }, { data: dashboard, error: dashboardError }, { data: evaluation, error: auditError }] = await Promise.all([
    adjustmentTournament ? supabase.rpc('get_tournament_score_changes', { target: adjustmentTournament.id, page_number: page }) : Promise.resolve({ data: null, error: null }),
    selected ? supabase.rpc('get_tournament_dashboard', { target: selected.id }) : Promise.resolve({ data: null, error: null }),
    selected ? supabase.rpc('get_score_audits', { target: selected.id }) : Promise.resolve({ data: null, error: null }),
  ]);
  const changes = data as ScoreChangesData | null;
  const totals = notificationTotals(notifications);
  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6"><div className="mx-auto max-w-4xl space-y-6">
    <header><Link href="/dashboard" className="font-semibold text-emerald-800">Voltar ao painel</Link><h1 className="mt-4 text-3xl font-bold">Gerenciar notificações dos torneios</h1><p className="mt-2 text-slate-600">Decida ajustes retroativos, avalie denúncias e apure as auditorias dos torneios que organiza.</p></header>
    <aside className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">{totals.corrections} ajuste(s) para decidir · {totals.requests} denúncia(s) para avaliar · {totals.voting} auditoria(s) em votação · {totals.ready} apuração(ões) pendente(s).</aside>
    <section className="space-y-4" aria-labelledby="adjustment-decisions"><h2 id="adjustment-decisions" className="text-xl font-bold">Ajustes retroativos dos seus torneios</h2>
      <form action="/dashboard/notifications" className="flex flex-wrap items-end gap-3">
        {selected && <input type="hidden" name="tournament" value={selected.id} />}
        <label className="min-w-0 flex-1">Torneio<select name="adjustment_tournament" defaultValue={adjustmentTournament?.id ?? ''} required className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-3"><option value="">Selecione</option>{notifications.managed_tournaments.map(t => <option key={t.id} value={t.id}>{t.name}{t.closed_at ? ' (encerrado)' : ''} · {t.corrections_pending} ajuste(s) pendente(s)</option>)}</select></label>
        <button className="rounded-lg border border-emerald-800 px-4 py-3 font-semibold text-emerald-800">Consultar ajustes</button>
      </form>
      {!adjustmentTournament ? <p role="alert">Torneio indisponível para consultar ajustes.</p>
        : <><h3 className="font-bold">{adjustmentTournament.name}</h3>
          {error || !changes ? <div role="alert" className="rounded-xl bg-amber-50 p-5"><p>Não foi possível carregar os ajustes para decisão.</p><RetryLoad /></div>
            : <ScoreChangeList changes={changes} userId={user.id} page={page} management paginationParams={{ adjustment_tournament: adjustmentTournament.id, ...(selected ? { tournament: selected.id } : {}) }} />}
        </>}
    </section>
    <section className="space-y-4" aria-labelledby="audit-management"><h2 id="audit-management" className="text-xl font-bold">Denúncias e auditorias dos seus torneios</h2>
      <form action="/dashboard/notifications" className="flex flex-wrap items-end gap-3">
        {adjustmentTournament && <input type="hidden" name="adjustment_tournament" value={adjustmentTournament.id} />}
        {page > 0 && <input type="hidden" name="page" value={page} />}
        <label className="min-w-0 flex-1">Torneio<select name="tournament" defaultValue={selected?.id ?? ''} required className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-3"><option value="">Selecione</option>{notifications.managed_tournaments.map(t => <option key={t.id} value={t.id}>{t.name}{t.closed_at ? ' (encerrado)' : ''} · {t.audits_requested + t.audits_open + t.audits_ready} auditoria(s) pendente(s)</option>)}</select></label><button className="rounded-lg border border-emerald-800 px-4 py-3 font-semibold text-emerald-800">Consultar auditorias</button></form>
      {!selected ? <p role="alert">Torneio indisponível para sua gestão.</p>
        : dashboardError || auditError || !dashboard?.access || !evaluation ? <div role="alert"><p>Não foi possível carregar as auditorias.</p><RetryLoad /></div>
          : <><h3 className="font-bold">{selected.name}</h3><AuditHistory data={dashboard as TournamentData} evaluation={evaluation as AuditData} management allowVoting={false} />
            <p className="text-sm text-slate-600">Para votar como participante, abra <Link href={`/dashboard/tournaments/${selected.id}/audits`} className="font-semibold underline">Votações e histórico de auditorias</Link>. Aprovação, apuração e punição ficam nesta gestão.</p></>}
    </section>
    <p className="text-sm text-slate-600">As pendências permanecem até a decisão. Votações em andamento ficam indicadas até o prazo; depois passam a aguardar apuração. Atualize a página para consultar mudanças.</p>
  </div></main>;
}
