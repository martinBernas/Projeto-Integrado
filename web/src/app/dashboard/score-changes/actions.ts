'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { scoreChangeMessages, validScoreDay } from '@/lib/score-changes';

export type ChangeState = { error?: string; message?: string };

export async function manageScoreChange(_: ChangeState, form: FormData): Promise<ChangeState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sua sessão expirou. Entre novamente.' };
  const operation = String(form.get('operation') ?? '');
  let result;
  if (operation === 'submit') {
    const day = String(form.get('day') ?? '');
    const score = String(form.get('score') ?? '').trim();
    const reason = String(form.get('reason') ?? '').trim();
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    if (!validScoreDay(day) || day >= today) return { error: scoreChangeMessages.past_day_required };
    if (!/^\d{1,5}$/.test(score) || Number(score) > 25000) return { error: scoreChangeMessages.invalid_score };
    if ([...reason].length < 3 || [...reason].length > 1000) return { error: scoreChangeMessages.invalid_change_reason };
    if (form.get('confirm') !== 'yes') return { error: 'Confirme a atualização do histórico pessoal e o envio para os torneios.' };
    result = await supabase.rpc('submit_retroactive_score', { game_day: day, raw_score: Number(score), justification: reason });
  } else if (operation === 'review') {
    const decision = String(form.get('decision') ?? '');
    const selection = String(form.get('selection') ?? '');
    if (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(decision) || !['approve', 'reject'].includes(selection)) return { error: 'Decisão inválida.' };
    if (form.get('confirm') !== 'yes') return { error: 'Confirme que leu a justificativa antes de decidir.' };
    result = await supabase.rpc('review_score_change', { decision, approve: selection === 'approve' });
  } else return { error: 'Operação inválida.' };
  if (result.error) return { error: Object.entries(scoreChangeMessages).find(([key]) => result.error.message.includes(key))?.[1]
    ?? 'Não foi possível salvar. Atualize a página e tente novamente.' };
  revalidatePath('/dashboard', 'layout');
  return { message: operation === 'submit'
    ? 'Histórico pessoal atualizado. Os torneios abertos elegíveis receberam o pedido; consulte as decisões abaixo. Torneios encerrados permanecem congelados.'
    : 'Decisão registrada para este torneio.' };
}
