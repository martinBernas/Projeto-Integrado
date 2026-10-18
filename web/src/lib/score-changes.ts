export type ScoreChangeDecision = {
  id: string; tournament_id: string; tournament_name: string; old_score: number | null;
  status: 'pending' | 'approved' | 'rejected'; decided_at: string | null;
  decided_by_name: string | null; can_review: boolean; audit_blocked: boolean;
};
export type ScoreChange = {
  id: string; player_id: string; player_name: string; played_on: string;
  old_score: number | null; new_score: number; reason: string; requested_at: string;
  decisions: ScoreChangeDecision[];
};
export type ScoreChangesData = { has_more: boolean; changes: ScoreChange[] };
export type ScoreChangeSummary = { pending_approvals: number; pending_days: number };

export const scoreChangeMessages: Record<string, string> = {
  past_day_required: 'Selecione uma data anterior a hoje, no horário de São Paulo.',
  invalid_score: 'Informe uma pontuação inteira de 0 a 25.000.',
  invalid_change_reason: 'Informe uma justificativa de 3 a 1.000 caracteres.',
  score_unchanged: 'Esse valor já está no seu histórico pessoal. Informe uma pontuação diferente.',
  score_change_pending: 'Este dia aguarda a decisão de um ou mais torneios. Aguarde todos aceitarem ou recusarem antes de alterar novamente.',
  audit_pending: 'Conclua o pedido de auditoria ou a votação desta pontuação antes de aprovar a alteração. Ainda é possível recusá-la.',
  tournament_closed: 'O torneio foi encerrado. Seus resultados permanecem congelados.',
  change_already_decided: 'Este pedido já foi decidido. Atualize a página para consultar o resultado.',
  change_not_allowed: 'Pedido indisponível ou sem permissão para decidir.',
};

export function validScoreDay(day: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(day) && day >= '0001-01-01'
    && !Number.isNaN(Date.parse(`${day}T12:00:00Z`))
    && new Date(`${day}T12:00:00Z`).toISOString().slice(0, 10) === day;
}
