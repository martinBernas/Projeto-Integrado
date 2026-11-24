import { InfoTip } from '@/app/info-tip';
import { formatDate, formatScore, type TournamentData } from '@/lib/tournament';
import type { AuditData } from '@/lib/audits';
import { AuditForm } from './tournaments/audit-form';

export function AuditRequest({ data, evaluation }: { data: TournamentData; evaluation: AuditData }) {
  if (data.tournament.closed_at) return <p className="mt-4 text-sm">Torneio encerrado. Não recebe novas denúncias.</p>;
  if (!evaluation.participant) return <p className="mt-4 text-sm">Somente participantes podem abrir denúncias neste torneio.</p>;
  const candidates = data.results.filter(r => r.result_kind === 'score' && r.raw_score !== null && r.raw_score > 0 && r.personal_score_id
    && !evaluation.audits.some(a => a.personal_score_id === r.personal_score_id));
  const name = (player: string) => data.participants.find(p => p.id === player)?.name ?? 'Jogador';
  return candidates.length === 0 ? <p className="mt-3">Não há pontuações disponíveis para um novo pedido.</p> : <AuditForm target={data.tournament.id} operation="request" label="Enviar denúncia">
    <div className="info-heading"><h3 className="font-semibold">Denúncia de pontuação</h3><InfoTip label="Denúncia de pontuação">O organizador avalia a denúncia antes de abrir a votação. Uma auditoria por pontuação neste torneio, sem reabertura. Explique o motivo sem incluir dados pessoais desnecessários.</InfoTip></div>
    <label className="block">Pontuação<select name="score" required className="mt-1 block w-full rounded border p-2"><option value="">Selecione</option>{candidates.map(r => <option key={r.personal_score_id} value={r.personal_score_id!}>{formatDate(r.played_on)} · {name(r.player_id)} · {formatScore(r.raw_score!)}</option>)}</select></label>
    <label className="block">Justificativa<textarea name="reason" required minLength={3} maxLength={1000} rows={3} className="mt-1 block w-full rounded border p-2" /></label>
  </AuditForm>;
}
