"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string };

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
