import { formatDate, formatScore, type TournamentData } from '@/lib/tournament';
import { auditStatus, auditTimestamp, type AuditData } from '@/lib/audits';
import { AuditForm, AuditResolution } from './tournaments/audit-form';

export function AuditHistory({ data, evaluation, management = false, allowVoting = true, onlyMine = false }: {
  data: TournamentData; evaluation: AuditData; management?: boolean; allowVoting?: boolean; onlyMine?: boolean;
}) {
  const id = data.tournament.id;
  const closed = !!data.tournament.closed_at;
  const name = (player: string) => data.participants.find(p => p.id === player)?.name ?? 'Jogador';
  const visible = onlyMine ? evaluation.audits.filter(a => a.requested_by_me) : evaluation.audits;
  return (
    <section className="space-y-4"><h2 className="text-xl font-bold">Pedidos e decisões</h2>
      {!visible.length && <p>Nenhum pedido de auditoria.</p>}
      {visible.map(a => <article key={a.id} id={`audit-${a.id}`} className="scroll-mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="font-bold">{name(a.player_id)} · {formatDate(a.played_on)} · {formatScore(a.raw_score)} pontos</h3>
        <p className="mt-2 font-semibold">{a.status === 'open' && a.deadline && new Date(evaluation.server_now) >= new Date(a.deadline) ? 'Votação encerrada · Aguardando apuração' : auditStatus[a.status]}</p><p className="mt-2 whitespace-pre-wrap break-words">{a.reason}</p>
        <p className="mt-2 text-sm text-slate-600">Pedido em {auditTimestamp(a.requested_at)} (São Paulo)</p>
        {a.deadline && <p className="text-sm">Prazo: {auditTimestamp(a.deadline)} (São Paulo)</p>}
        {a.resolution_reason && <p className="mt-2">{a.resolution_reason}</p>}
        {a.my_vote && <p className="mt-2">Seu voto: {a.my_vote === 'invalidate' ? 'Invalidar' : 'Manter'}</p>}
        {a.status === 'open' && <p className="mt-2 text-sm text-slate-600">{a.deadline && new Date(evaluation.server_now) >= new Date(a.deadline)
          ? 'O prazo para votar terminou. Ainda não há resultado apurado. Os totais de votos serão exibidos após a apuração pelo organizador; até lá, a pontuação permanece inalterada.'
          : 'Votação em andamento. Os totais de votos serão exibidos após a apuração; até lá, a pontuação permanece inalterada.'}</p>}
        {!closed && management && evaluation.organizer && a.status === 'requested' && <>
          <AuditForm target={id} audit={a.id} operation="approve" label="Aprovar e iniciar votação" />
          <details className="mt-3"><summary className="cursor-pointer">Rejeitar pedido</summary><AuditForm target={id} audit={a.id} operation="reject" label="Rejeitar pedido"><label className="block">Motivo<textarea name="reason" minLength={3} maxLength={1000} required className="mt-1 block w-full rounded border p-2" /></label></AuditForm></details>
        </>}
        {!closed && allowVoting && a.can_vote && <AuditForm target={id} audit={a.id} operation="vote" label={a.my_vote ? 'Alterar meu voto' : 'Salvar voto secreto'}>
          <label className="block">Seu voto<select name="selection" defaultValue={a.my_vote ?? ''} required className="ml-2 rounded border p-2"><option value="">Selecione</option><option value="maintain">Manter pontuação</option><option value="invalidate">Invalidar pontuação</option></select></label>
        </AuditForm>}
        {!closed && a.status === 'open' && new Date(evaluation.server_now) >= new Date(a.deadline!) && (management && evaluation.organizer
          ? <AuditResolution target={id} audit={a.id} /> : <p className="mt-2">Prazo encerrado. Aguardando apuração pelo organizador.</p>)}
        {a.resolved_at && <p className="mt-2 text-sm">Encerrada em {auditTimestamp(a.resolved_at)} (São Paulo)</p>}
        {a.invalid_votes !== null && a.maintain_votes !== null && <section className="mt-3 rounded-lg bg-slate-50 p-4" aria-label="Resultado da apuração">
          <h4 className="font-bold">Resultado da apuração</h4>
          <p>Votos a favor de invalidar a pontuação: {a.invalid_votes}</p>
          <p>Votos contra invalidar (manter a pontuação): {a.maintain_votes}</p>
          <p>Total de votos: {a.invalid_votes + a.maintain_votes}</p>
          <p className="mt-2 font-semibold">{a.status === 'invalidated' ? 'Decisão: pontuação invalidada por maioria dos votos.'
            : a.invalid_votes + a.maintain_votes === 0 ? 'Decisão: pontuação mantida porque não houve votos.'
            : a.invalid_votes === a.maintain_votes ? 'Decisão: pontuação mantida por empate.'
            : 'Decisão: pontuação mantida por maioria dos votos.'}</p>
          {a.status === 'maintained' && <p>Nenhuma punição aplicada; a pontuação permanece no cálculo do torneio.</p>}
        </section>}
        {a.status === 'invalidated' && <p className="mt-2">{a.punishment === 'penalty' ? `Penalidade aplicada: ${formatScore(a.penalty ?? 0)} pontos.` : 'Contribuição desconsiderada: zero pontos, sem penalidade.'} Pontuação pessoal preservada; decisão restrita a este torneio.</p>}
        {a.before_results && a.after_results && <details className="mt-3"><summary className="cursor-pointer">Resultados do dia antes e depois da apuração</summary><div className="overflow-x-auto"><table className="mt-2 w-full text-left text-sm"><caption className="sr-only">Impacto da apuração</caption><thead><tr><th>Jogador</th><th>Antes</th><th>Depois</th></tr></thead><tbody>{a.after_results.map(r => <tr key={r.player_id}><th className="py-2 font-medium">{name(r.player_id)}</th><td>{formatScore(a.before_results?.find(b => b.player_id === r.player_id)?.applied_score ?? 0)}</td><td>{formatScore(r.applied_score)}</td></tr>)}</tbody></table></div></details>}
      </article>)}
    </section>

  );
}
