"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
export type ScoreState = { error?: string; message?: string };
export async function saveScore(_: ScoreState, form: FormData): Promise<ScoreState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sua sessão expirou. Entre novamente.' };
  const text = String(form.get('score') ?? '').trim();
  const day = String(form.get('day') ?? '');
  if (!/^\d{1,5}$/.test(text) || Number(text) > 25000 || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    return { error: 'Informe a data e uma pontuação bruta inteira de 0 a 25.000.' };
  }
  const { error } = await supabase.rpc('submit_personal_score', { game_day: day, raw_score: Number(text) });
  if (error) {
    if (error.message.includes('current_day_only')) return { error: 'Você pode lançar ou corrigir apenas o dia atual, no fuso de São Paulo. Atualize a página se o dia virou.' };
    return { error: 'Não foi possível salvar a pontuação. Tente novamente.' };
  }
  revalidatePath('/dashboard');
  return { message: 'Pontuação salva. Seus resultados foram atualizados.' };
}
