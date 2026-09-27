"use server";
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { cleanPublicName, validPublicName, validGeoGuessrUrl, nameHelp, urlHelp } from '@/lib/profile';
export type ProfileState = { error?: string; message?: string };
export async function saveProfile(_: ProfileState, form: FormData): Promise<ProfileState> {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { error: 'Sua sessão expirou. Entre novamente.' };
  const name = cleanPublicName(String(form.get('public_name') ?? ''));
  const url = String(form.get('geoguessr_url') ?? '').trim();
  if (!validPublicName(name)) return { error: nameHelp };
  if (!validGeoGuessrUrl(url)) return { error: urlHelp };
  const { error } = await client.rpc('update_my_profile', { public_name: name, profile_url: url || null });
  if (error) return { error: error.message.includes('public_name_unavailable') || error.code === '23505'
    ? 'Este nome público já está em uso. Escolha outro.'
    : 'Não foi possível salvar o perfil. Tente novamente.' };
  revalidatePath('/dashboard', 'layout');
  return { message: 'Perfil salvo. Seu nome e link foram atualizados nos torneios.' };
}
