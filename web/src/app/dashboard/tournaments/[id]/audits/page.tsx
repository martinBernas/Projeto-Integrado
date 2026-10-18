import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { type TournamentData } from '@/lib/tournament';
import { type AuditData } from '@/lib/audits';
import { AuditHistory } from '../../../audit-history';
import { RetryLoad } from '../../../retry-load';

export default async function AuditsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  if (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)) return <main className="p-8">Torneio indisponível.</main>;
  const [{ data: dashboard, error }, { data: audits, error: auditError }] = await Promise.all([
    supabase.rpc('get_tournament_dashboard', { target: id }), supabase.rpc('get_score_audits', { target: id }),
  ]);
  if (error || auditError) return <main className="p-8"><p role="alert">Não foi possível carregar as auditorias ou sua conta não tem acesso.</p><RetryLoad /><Link href="/dashboard" className="underline">Voltar ao painel</Link></main>;
  if (!dashboard?.access || !audits) return <main className="p-8">Torneio indisponível.</main>;
  const data = dashboard as TournamentData; const evaluation = audits as AuditData;
  const closed = !!data.tournament.closed_at;
  return <main className="min-h-screen bg-slate-50 px-4 py-8"><div className="mx-auto max-w-3xl space-y-6">
    <Link href={`/dashboard?tournament=${id}`} className="font-semibold text-emerald-800">Voltar ao torneio</Link>
    <header><h1 className="text-3xl font-bold">Votações e histórico de auditorias</h1><p className="mt-2 text-slate-600">{data.tournament.name}</p></header>
    <p className="rounded-xl bg-white p-4 text-sm">O organizador aprova os pedidos antes de iniciar a votação de 48 horas. Os votos são secretos e podem ser alterados até o prazo. Empate ou nenhum voto mantém a pontuação. Alterações retroativas não mudam o valor em avaliação antes da decisão do torneio.</p>
    {evaluation.organizer && <Link href={`/dashboard/notifications?tournament=${id}`} className="font-semibold text-emerald-800 underline">Gerenciar notificações dos torneios</Link>}
    <Link href={`/dashboard/requests?tournament=${id}`} className="font-semibold text-emerald-800 underline">Abrir uma denúncia em Meus pedidos</Link>
    {closed && <p className="rounded-xl bg-slate-200 p-4">Torneio encerrado. Histórico disponível para consulta.</p>}
    <AuditHistory data={data} evaluation={evaluation} />
    <p className="text-sm text-slate-600">Atualize a página para consultar novos votos próprios, aprovações e o término do prazo. A autoria dos demais votos permanece secreta.</p>
  </div></main>;
}
