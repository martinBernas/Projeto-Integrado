"use server";

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { runTournamentReports } from '@/lib/report-server';
import type { TournamentState } from './actions';

export async function manageTournamentReport(_: TournamentState, form: FormData): Promise<TournamentState> {
  const target = String(form.get('target') ?? ''), operation = String(form.get('operation') ?? '');
  if (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(target) || !['retry', 'withdraw'].includes(operation)) return { error: 'Operação inválida.' };
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { error: 'Sua sessão expirou. Entre novamente.' };
  // Privileged processing only follows an authenticated organizer-only lookup.
  const { data: status, error } = await client.rpc('get_tournament_report_status', { target });
  if (error || !status) return { error: 'Relatório indisponível. Atualize a página ou consulte o responsável pela operação.' };
  if (operation === 'withdraw') {
    if (form.get('confirm') !== 'yes') return { error: 'Confirme a retirada para continuar.' };
    const { error: withdrawal } = await client.rpc('withdraw_tournament', { target });
    if (withdrawal) return { error: 'Retirada bloqueada. Aguarde gerar o PDF, concluir todas as entregas e terminar o processamento.' };
  } else {
    if (process.env.TOURNAMENT_REPORTS_ENABLED !== 'true') return { error: 'Envio de relatórios ainda não configurado.' };
    try { await runTournamentReports(target); }
    catch { return { error: 'Não foi possível concluir o processamento. Os resultados continuam preservados; tente novamente.' }; }
  }
  revalidatePath('/dashboard'); revalidatePath('/dashboard/tournaments');
  return { message: operation === 'withdraw' ? 'Torneio retirado. O PDF permanece somente nos e-mails enviados.' : 'Processamento solicitado. Confira o estado das entregas abaixo.' };
}
