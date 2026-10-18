'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type AuditState = { error?: string; message?: string; tally?: { invalid_votes: number; maintain_votes: number } };
const uuid = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const errors: Record<string, string> = {
  audit_not_allowed: 'Você não tem permissão para esta auditoria.',
  tournament_closed: 'Este torneio está encerrado.',
  invalid_audit_reason: 'Informe uma justificativa de 3 a 1.000 caracteres.',
  audit_exists: 'Esta pontuação já possui um pedido de auditoria neste torneio.',
  audit_score_unavailable: 'A pontuação mudou ou não está disponível para auditoria. Atualize a página.',
  audit_state_changed: 'O pedido já foi avaliado. Atualize a página.',
  audit_voting_closed: 'A votação está encerrada ou seu prazo terminou.',
  audit_not_eligible: 'Sua conta não pode votar nesta avaliação.',
  audit_not_ready: 'A apuração fica disponível após o prazo de 48 horas.',
  audit_punishment_required: 'Escolha a punição para a pontuação invalidada pela votação.',
};

export async function manageAudit(_: AuditState, form: FormData): Promise<AuditState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sua sessão expirou. Entre novamente.' };
  const operation = String(form.get('operation') ?? '');
  const target = String(form.get('target') ?? '');
  const audit = String(form.get('audit') ?? '');
  const reason = String(form.get('reason') ?? '').trim();
  if (!uuid.test(target) || !['request', 'approve', 'reject', 'vote', 'preview', 'resolve'].includes(operation)
    || (operation !== 'request' && !uuid.test(audit))) return { error: 'Operação inválida.' };
  if ((operation === 'request' || operation === 'reject') && (reason.length < 3 || reason.length > 1000)) return { error: errors.invalid_audit_reason };
  let result;
  if (operation === 'request') {
    const score = String(form.get('score') ?? '');
    if (!uuid.test(score)) return { error: 'Selecione uma pontuação válida.' };
    result = await supabase.rpc('request_score_audit', { target, score_id: score, justification: reason });
  } else if (operation === 'approve' || operation === 'reject') {
    result = await supabase.rpc('review_score_audit', { audit, approve: operation === 'approve', explanation: reason || null });
  } else if (operation === 'vote') {
    const selection = String(form.get('selection') ?? '');
    if (!['invalidate', 'maintain'].includes(selection)) return { error: 'Selecione seu voto.' };
    result = await supabase.rpc('vote_score_audit', { audit, selection });
  } else if (operation === 'preview') {
    result = await supabase.rpc('preview_score_audit', { audit });
    if (!result.error) return { tally: result.data };
  } else {
    const sanction = String(form.get('sanction') ?? '');
    if (sanction && !['disregard', 'penalty'].includes(sanction)) return { error: errors.audit_punishment_required };
    if (form.get('confirm') !== 'yes') return { error: 'Confirme a apuração e seus efeitos no ranking.' };
    result = await supabase.rpc('resolve_score_audit', { audit, sanction: sanction || null });
  }
  if (result.error) return { error: Object.entries(errors).find(([key]) => result.error.message.includes(key))?.[1]
    ?? 'Não foi possível concluir. Atualize a página e tente novamente.' };
  revalidatePath('/dashboard', 'layout');
  revalidatePath(`/dashboard/tournaments/${target}/audits`);
  return { message: operation === 'request' ? 'Pedido enviado ao organizador.' : operation === 'vote' ? 'Seu voto secreto foi salvo.'
    : operation === 'approve' ? 'Votação de 48 horas iniciada.' : operation === 'reject' ? 'Pedido rejeitado.' : 'Apuração concluída. Consulte a decisão e o ranking.' };
}
