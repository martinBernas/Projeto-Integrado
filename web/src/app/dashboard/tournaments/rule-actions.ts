"use server";
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { parseRuleFields, type RulePreview } from '@/lib/rules';

export type RuleState = { error?: string; message?: string; preview?: RulePreview };
const invalid = 'Confira período do torneio, modo, penalidade, calendário e exclusões (data | motivo).';
function message(error: { message: string }) {
  if (error.message.includes('rule_preview_expired')) return 'Os dados mudaram desde a prévia. Gere uma nova prévia antes de confirmar.';
  if (error.message.includes('tournament_closed')) return 'Este torneio está encerrado e não permite revisão.';
  if (error.message.includes('tournament_not_allowed')) return 'Torneio indisponível ou sem permissão para administrar.';
  if (error.message.includes('rule_scope_requires_updated_app')) return 'Atualize a aplicação para editar o período e a regra única do torneio.';
  if (error.message.includes('invalid_')) return invalid;
  return 'Não foi possível revisar as regras. Atualize a página e tente novamente.';
}
export async function reviseRules(_: RuleState, form: FormData): Promise<RuleState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sua sessão expirou. Entre novamente.' };
  const target = String(form.get('target') ?? '');
  if (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(target)) return { error: 'Torneio inválido.' };
  const operation = String(form.get('operation') ?? '');
  if (operation === 'preview') {
    const proposal = parseRuleFields(form);
    if (!proposal) return { error: invalid };
    const { data, error } = await supabase.rpc('preview_tournament_rules', { target, proposal });
    return error ? { error: message(error) } : { preview: data as RulePreview };
  }
  if (operation !== 'apply' || form.get('confirm') !== 'yes') return { error: 'Confira a prévia e confirme a revisão para continuar.' };
  const token = String(form.get('token') ?? '');
  const raw = String(form.get('proposal') ?? '');
  if (!/^[a-f0-9]{32}$/.test(token) || raw.length > 100000) return { error: invalid };
  let proposal;
  try { proposal = JSON.parse(raw); } catch { return { error: invalid }; }
  const { error } = await supabase.rpc('apply_tournament_rules', { target, proposal, expected_token: token });
  if (error) return { error: message(error) };
  revalidatePath('/dashboard'); revalidatePath('/dashboard/tournaments');
  revalidatePath(`/dashboard/tournaments/${target}/rules`);
  return { message: 'Revisão aplicada. Resultados atualizados e histórico preservado.' };
}
