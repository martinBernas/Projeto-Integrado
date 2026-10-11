export type AuditResult = { player_id: string; applied_score: number; result_kind: string };
export type ScoreAudit = {
  id: string; personal_score_id: string; player_id: string; played_on: string; raw_score: number;
  reason: string; status: 'requested' | 'open' | 'rejected' | 'maintained' | 'invalidated';
  requested_at: string; deadline: string | null; resolved_at: string | null; resolution_reason: string | null;
  punishment: 'disregard' | 'penalty' | null; penalty: number | null;
  invalid_votes: number | null; maintain_votes: number | null; my_vote: 'invalidate' | 'maintain' | null;
  can_vote: boolean; before_results: AuditResult[] | null; after_results: AuditResult[] | null;
};
export type AuditData = { server_now: string; organizer: boolean; participant: boolean; audits: ScoreAudit[] };
export const auditStatus: Record<ScoreAudit['status'], string> = {
  requested: 'Aguardando aprovação', open: 'Votação aberta', rejected: 'Pedido rejeitado',
  maintained: 'Pontuação mantida', invalidated: 'Pontuação invalidada',
};
export function auditTimestamp(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}
