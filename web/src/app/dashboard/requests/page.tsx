import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { ScoreChangesData } from '@/lib/score-changes';
import { notificationPage, type TournamentNotifications } from '@/lib/notifications';
import type { TournamentData } from '@/lib/tournament';
import type { AuditData } from '@/lib/audits';
import { RetroactiveScoreForm } from '../score-changes/forms';
import { ScoreChangeList } from '../score-changes/list';
import { AuditRequest } from '../audit-request';
import { AuditHistory } from '../audit-history';
import { RetryLoad } from '../retry-load';

export default async function RequestsPage({ searchParams }: { searchParams: Promise<{ page?: string; tournament?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const params = await searchParams;
  const page = notificationPage(params.page);
  const [{ data, error }, { data: notificationsData, error: notificationsError }] = await Promise.all([
    supabase.rpc('get_personal_score_changes', { page_number: page }), supabase.rpc('get_tournament_notifications'),
  ]);
  const changes = data as ScoreChangesData | null;
  const notifications = notificationsData as TournamentNotifications | null;
  const selected = notifications?.request_tournaments.find(t => t.id === params.tournament);
  const [{ data: dashboard, error: dashboardError }, { data: evaluation, error: auditError }] = selected ? await Promise.all([
    supabase.rpc('get_tournament_dashboard', { target: selected.id }), supabase.rpc('get_score_audits', { target: selected.id }),
  ]) : [{ data: null, error: null }, { data: null, error: null }];
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const previousDay = new Date(`${today}T12:00:00Z`); previousDay.setUTCDate(previousDay.getUTCDate() - 1);
  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6"><div className="mx-auto max-w-4xl space-y-6">
    <header><Link href="/dashboard" className="font-semibold text-emerald-800">Voltar ao painel</Link><h1 className="mt-4 text-3xl font-bold">Meus pedidos</h1><p className="mt-2 text-slate-600">Solicite ajustes de pontuação e abra denúncias nos torneios de que participa.</p></header>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><h2 className="mb-4 text-xl font-bold">Ajustar pontuação retroativa</h2><RetroactiveScoreForm yesterday={previousDay.toISOString().slice(0, 10)} /></section>
    <section className="space-y-4" aria-labelledby="my-adjustments"><h2 id="my-adjustments" className="text-xl font-bold">Meus ajustes e suas decisões</h2>
      {notifications && !notificationsError && <p className="text-sm text-slate-600">{notifications.pending_days} dia(s) aguardando decisão dos torneios. Dias pendentes ficam bloqueados para nova alteração.</p>}
      {error || !changes ? <div role="alert" className="rounded-xl bg-amber-50 p-5"><p>Não foi possível carregar seus ajustes.</p><RetryLoad /></div>
        : <ScoreChangeList changes={changes} userId={user.id} page={page} />}
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7" aria-labelledby="new-report"><h2 id="new-report" className="text-xl font-bold">Abrir denúncia de pontuação</h2>
      {notificationsError || !notifications ? <div role="alert" className="mt-4"><p>Não foi possível consultar os torneios para denúncias.</p><RetryLoad /></div>
        : !notifications.request_tournaments.length ? <p className="mt-4 text-sm">Você ainda não participa de um torneio.</p>
          : <><form action="/dashboard/requests" className="mt-4 flex flex-wrap items-end gap-3"><label className="min-w-0 flex-1">Torneio<select name="tournament" defaultValue={selected?.id ?? ''} required className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-3"><option value="">Selecione um torneio</option>{notifications.request_tournaments.map(t => <option key={t.id} value={t.id}>{t.name}{t.closed_at ? ' (encerrado)' : ''}</option>)}</select></label><button className="rounded-lg border border-emerald-800 px-4 py-3 font-semibold text-emerald-800">Consultar pontuações</button></form>
            {params.tournament && !selected && <p role="alert" className="mt-3">Torneio indisponível para seus pedidos.</p>}
            {selected && (dashboardError || auditError || !dashboard?.access || !evaluation ? <div role="alert" className="mt-4"><p>Não foi possível carregar as pontuações e denúncias.</p><RetryLoad /></div>
              : <div className="mt-5 space-y-5"><h3 className="font-bold">{selected.name}</h3><AuditRequest data={dashboard as TournamentData} evaluation={evaluation as AuditData} />
                <h3 className="font-bold">Minhas denúncias neste torneio</h3><AuditHistory data={dashboard as TournamentData} evaluation={evaluation as AuditData} onlyMine allowVoting={false} />
              </div>)}
          </>}
    </section>
  </div></main>;
}
