"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string };

export async function requestPasswordReset(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Informe um e-mail válido." };
  const supabase = await createClient();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/auth/reset-password`,
  });
  if (error) return { error: "Não foi possível solicitar o link agora. Aguarde alguns minutos e tente novamente." };
  return { message: "Se houver uma conta com esse e-mail, você receberá um link para redefinir a senha. Confira também o spam e abra o link neste mesmo navegador." };
}

export async function resetPassword(_: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) return { error: "A senha deve ter pelo menos 6 caracteres." };
  if (password !== String(formData.get("confirmation") ?? "")) return { error: "As senhas não coincidem." };
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Seu acesso expirou. Solicite um novo link de recuperação." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "Não foi possível alterar a senha. Use uma senha diferente, com pelo menos 6 caracteres, ou solicite um novo link." };
  return { message: "Senha atualizada. Você já pode acessar o painel." };
}

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: String(formData.get("email") ?? "").trim(), password: String(formData.get("password") ?? "") });
  if (error) return { error: "E-mail ou senha inválidos." };
  redirect("/dashboard");
}

export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email: String(formData.get("email") ?? "").trim(), password: String(formData.get("password") ?? ""), options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback` } });
  if (error) return { error: error.message };
  return { message: "Conta criada. Confira seu e-mail para confirmar o acesso." };
}

export async function signOut() { const supabase = await createClient(); await supabase.auth.signOut(); redirect("/"); }
