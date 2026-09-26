"use server";

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type ParticipantState = { error?: string; message?: string };
const errors: Record<string, string> = {
  tournament_not_allowed: 'Torneio indisponível ou sem permissão para administrar.',
  tournament_closed: 'Este torneio está encerrado. Os participantes não podem ser alterados.',
  invalid_eligibility: 'A data de participação deve estar dentro do período do torneio.',
  account_not_found: 'Esta conta não está mais disponível. Atualize a lista de usuários.',
  participant_exists: 'Este jogador já participa do torneio. Atualize a página.',
  participant_not_found: 'Este jogador não participa mais do torneio. Atualize a página.',
  participants_required: 'Adicione participantes antes de concluir a preparação.',
};
const uuid = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export async function manageParticipant(_: ParticipantState, form: FormData): Promise<ParticipantState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sua sessão expirou. Entre novamente.' };
  const operation = String(form.get('operation') ?? '');
  const target = String(form.get('target') ?? '');
  const player = String(form.get('player') ?? '');
  if (!uuid.test(target) || !['add', 'update', 'remove', 'complete'].includes(operation)) return { error: 'Operação inválida.' };
  if (operation !== 'complete' && !uuid.test(player)) return { error: 'Selecione um jogador válido.' };
  if (form.get('confirm') !== 'yes') return { error: 'Confirme a alteração e seus efeitos no ranking.' };
  let result;
  if (operation === 'add' || operation === 'update') {
    const day = String(form.get('eligible') ?? '');
    const date = new Date(`${day}T12:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== day) {
      return { error: errors.invalid_eligibility };
    }
    result = await supabase.rpc(operation === 'add' ? 'add_tournament_participant' : 'update_tournament_participant', {
      target, player, eligible_day: day,
    });
  } else {
    result = operation === 'remove'
      ? await supabase.rpc('remove_tournament_participant', { target, player })
      : await supabase.rpc('complete_tournament_history', { target });
  }
  if (result.error) return { error: Object.entries(errors).find(([key]) => result.error.message.includes(key))?.[1]
    ?? 'Não foi possível concluir a alteração. Atualize a página e tente novamente.' };
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/tournaments');
  revalidatePath(`/dashboard/tournaments/${target}/participants`);
  return { message: operation === 'remove' ? 'Participante removido deste torneio. Pontuações pessoais preservadas.'
    : operation === 'complete' ? 'Preparação concluída. Ausências dos dias encerrados foram calculadas.'
    : 'Participação salva. Resultados deste torneio recalculados.' };
}
