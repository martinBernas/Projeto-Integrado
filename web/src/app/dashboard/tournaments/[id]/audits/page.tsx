import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatDate, formatScore, type TournamentData } from '@/lib/tournament';
import { auditStatus, auditTimestamp, type AuditData } from '@/lib/audits';
import { AuditForm } from '../../audit-form';
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
  const name = (player: string) => data.participants.find(p => p.id === player)?.name ?? 'Jogador';
  const candidates = data.results.filter(r => r.result_kind === 'score' && r.personal_score_id
    && !evaluation.audits.some(a => a.personal_score_id === r.personal_score_id));
  return <main className="min-h-screen bg-slate-50 px-4 py-8"><div className="mx-auto max-w-3xl space-y-6">
    <Link href={`/dashboard?tournament=${id}`} className="font-semibold text-emerald-800">Voltar ao torneio</Link>
    <header><h1 className="text-3xl font-bold">Auditoria de pontuações</h1><p className="mt-2 text-slate-600">{data.tournament.name}</p></header>
    <p className="rounded-xl bg-white p-4 text-sm">O organizador aprova os pedidos antes de iniciar a votação de 48 horas. Os votos são secretos e podem ser alterados até o prazo. Empate ou nenhum voto mantém a pontuação. Durante a avaliação, o ranking permanece com a pontuação original. Pontuações em avaliação aguardam a decisão para poderem ser corrigidas.</p>
    {closed && <p className="rounded-xl bg-slate-200 p-4">Torneio encerrado. Histórico disponível para consulta.</p>}
    {!closed && evaluation.participant && <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-xl font-bold">Solicitar auditoria</h2>
      {candidates.length === 0 ? <p className="mt-3">Não há pontuações disponíveis para um novo pedido.</p> : <AuditForm target={id} operation="request" label="Enviar pedido">
        <label className="block">Pontuação<select name="score" required className="mt-1 block w-full rounded border p-2"><option value="">Selecione</option>{candidates.map(r => <option key={r.personal_score_id} value={r.personal_score_id!}>{formatDate(r.played_on)} · {name(r.player_id)} · {formatScore(r.raw_score!)}</option>)}</select></label>
        <label className="block">Justificativa<textarea name="reason" required minLength={3} maxLength={1000} rows={3} className="mt-1 block w-full rounded border p-2" /></label>
        <p className="text-sm text-slate-600">Uma auditoria por pontuação neste torneio, sem recurso ou reabertura nesta sprint. Explique o motivo sem incluir dados pessoais desnecessários.</p>
      </AuditForm>}
    </section>}
    <section className="space-y-4"><h2 className="text-xl font-bold">Pedidos e decisões</h2>
      {!evaluation.audits.length && <p>Nenhum pedido de auditoria.</p>}
      {evaluation.audits.map(a => <article key={a.id} id={`audit-${a.id}`} className="scroll-mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="font-bold">{name(a.player_id)} · {formatDate(a.played_on)} · {formatScore(a.raw_score)} pontos</h3>
        <p className="mt-2 font-semibold">{auditStatus[a.status]}</p><p className="mt-2 whitespace-pre-wrap break-words">{a.reason}</p>
        <p className="mt-2 text-sm text-slate-600">Pedido em {auditTimestamp(a.requested_at)} (São Paulo)</p>
        {a.deadline && <p className="text-sm">Prazo: {auditTimestamp(a.deadline)} (São Paulo)</p>}
        {a.resolution_reason && <p className="mt-2">{a.resolution_reason}</p>}
        {a.my_vote && <p className="mt-2">Seu voto: {a.my_vote === 'invalidate' ? 'Invalidar' : 'Manter'}</p>}
        {!closed && evaluation.organizer && a.status === 'requested' && <>
          <AuditForm target={id} audit={a.id} operation="approve" label="Aprovar e iniciar votação" />
          <details className="mt-3"><summary className="cursor-pointer">Rejeitar pedido</summary><AuditForm target={id} audit={a.id} operation="reject" label="Rejeitar pedido"><label className="block">Motivo<textarea name="reason" minLength={3} maxLength={1000} required className="mt-1 block w-full rounded border p-2" /></label></AuditForm></details>
        </>}
        {!closed && a.can_vote && <AuditForm target={id} audit={a.id} operation="vote" label={a.my_vote ? 'Alterar meu voto' : 'Salvar voto secreto'}>
          <label className="block">Seu voto<select name="selection" defaultValue={a.my_vote ?? ''} required className="ml-2 rounded border p-2"><option value="">Selecione</option><option value="maintain">Manter pontuação</option><option value="invalidate">Invalidar pontuação</option></select></label>
        </AuditForm>}
        {!closed && a.status === 'open' && new Date(evaluation.server_now) >= new Date(a.deadline!) && (evaluation.organizer
          ? <AuditForm target={id} audit={a.id} operation="resolve" label="Apurar e encerrar">
            <label className="block">Punição se houver maioria pela invalidez<select name="sanction" required className="mt-1 block w-full rounded border p-2"><option value="disregard">Desconsiderar: contribuição zero, sem penalidade</option><option value="penalty">Aplicar penalidade do dia</option></select></label>
            <label className="block text-sm"><input type="checkbox" name="confirm" value="yes" required className="mr-2" />Confirmo a apuração e o recálculo deste torneio.</label>
            <p className="text-sm">A votação determina a validade. Empate ou nenhum voto mantém a pontuação, independentemente da punição selecionada.</p>
          </AuditForm> : <p className="mt-2">Prazo encerrado. Aguardando apuração pelo organizador.</p>)}
        {a.resolved_at && <p className="mt-2 text-sm">Encerrada em {auditTimestamp(a.resolved_at)} (São Paulo)</p>}
        {a.invalid_votes !== null && <p className="mt-2">Apuração: {a.invalid_votes} para invalidar · {a.maintain_votes} para manter.</p>}
        {a.status === 'invalidated' && <p className="mt-2">{a.punishment === 'penalty' ? `Penalidade aplicada: ${formatScore(a.penalty ?? 0)} pontos.` : 'Contribuição desconsiderada: zero pontos, sem penalidade.'} Pontuação pessoal preservada; decisão restrita a este torneio.</p>}
        {a.before_results && a.after_results && <details className="mt-3"><summary className="cursor-pointer">Resultados do dia antes e depois da apuração</summary><div className="overflow-x-auto"><table className="mt-2 w-full text-left text-sm"><caption className="sr-only">Impacto da apuração</caption><thead><tr><th>Jogador</th><th>Antes</th><th>Depois</th></tr></thead><tbody>{a.after_results.map(r => <tr key={r.player_id}><th className="py-2 font-medium">{name(r.player_id)}</th><td>{formatScore(a.before_results?.find(b => b.player_id === r.player_id)?.applied_score ?? 0)}</td><td>{formatScore(r.applied_score)}</td></tr>)}</tbody></table></div></details>}
      </article>)}
    </section>
    <p className="text-sm text-slate-600">Atualize a página para consultar novos votos próprios, aprovações e o término do prazo. A autoria dos demais votos permanece secreta.</p>
  </div></main>;
}
