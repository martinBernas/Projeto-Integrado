"use server";

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { parseRuleFields } from '@/lib/rules';

export type TournamentState = { error?: string; message?: string };

const messages: Record<string, string> = {
  score_change_pending: 'Resolva as alterações retroativas pendentes antes de encerrar ou alterar as regras deste torneio. Consulte Gerenciar notificações dos torneios no painel.',
  audit_pending: 'Avalie os pedidos e conclua as votações pendentes antes de encerrar ou alterar as regras deste torneio.',
  invalid_name: 'Informe um nome de 3 a 100 caracteres.',
  invalid_period: 'Informe um período válido, com o fim igual ou posterior ao início.',
  period_requires_rule_preview: 'Altere as datas em Configurar período e regras, conferindo o impacto antes de confirmar.',
  period_locked: 'O período não pode mudar depois de vincular participantes, resultados ou exclusões de calendário.',
  tournament_closed: 'Este torneio está encerrado e não pode ser editado.',
  tournament_not_allowed: 'Torneio indisponível ou sem permissão para administrar.',
  tournament_not_finished: 'Aguarde o fim do último dia do torneio, no horário de São Paulo.',
  invalid_rule: 'Confira modo, penalidade (−25.000 a 0), calendário, datas excluídas e motivos.',
  invalid_exclusions: 'Confira as datas excluídas: uma por linha, dentro do período e sem repetição, com motivo.',
};

function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && value >= '0001-01-01'
    && !Number.isNaN(Date.parse(`${value}T12:00:00Z`))
    && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
}

export async function manageTournament(_: TournamentState, form: FormData): Promise<TournamentState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sua sessão expirou. Entre novamente.' };
  const operation = String(form.get('operation') ?? '');
  const target = String(form.get('target') ?? '');
  if (!['create', 'update', 'close'].includes(operation)) return { error: 'Operação inválida.' };
  if (operation !== 'create' && !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(target)) return { error: messages.tournament_not_allowed };
  let result;
  if (operation === 'close') {
    if (form.get('confirm') !== 'yes') return { error: 'Confirme o encerramento para continuar.' };
    result = await supabase.rpc('close_tournament', { target });
  } else {
    const name = String(form.get('name') ?? '').trim();
    const start = String(form.get('start') ?? '');
    const end = String(form.get('end') ?? '');
    if ([...name].length < 3 || [...name].length > 100) return { error: messages.invalid_name };
    if (!validDate(start) || !validDate(end) || end < start) return { error: messages.invalid_period };
    const fields = { tournament_name: name, start_day: start, end_day: end };
    const proposal = operation === 'create' && form.has('mode') ? parseRuleFields(form) : null;
    if (operation === 'create' && form.has('mode') && !proposal) return { error: messages.invalid_rule };
    result = operation === 'create'
      ? proposal ? await supabase.rpc('create_configured_tournament', { ...fields, proposal }) : await supabase.rpc('create_tournament', fields)
      : await supabase.rpc('update_tournament', { target, ...fields });
  }
  if (result.error) {
    return { error: Object.entries(messages).find(([key]) => result.error.message.includes(key))?.[1]
      ?? 'Não foi possível salvar. Atualize a página e tente novamente.' };
  }
  if (operation === 'close' && process.env.TOURNAMENT_REPORTS_ENABLED === 'true') {
    try { const { runTournamentReports } = await import('@/lib/report-server'); await runTournamentReports(target); }
    catch {
      revalidatePath('/dashboard'); revalidatePath('/dashboard/tournaments');
      return { message: 'Torneio encerrado. O relatório aguarda processamento; a retirada está bloqueada até concluir a geração e todos os envios.' };
    }
  }
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/tournaments');
  return { message: operation === 'create' ? 'Torneio criado.' : operation === 'close' ? 'Torneio encerrado. Resultados preservados. Confira a geração e as entregas do relatório abaixo.' : 'Torneio atualizado.' };
}
