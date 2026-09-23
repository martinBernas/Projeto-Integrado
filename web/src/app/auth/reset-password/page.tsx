import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PasswordForm } from "../password-form";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/auth/forgot-password?error=invalid-link");
  return <main className="min-h-screen bg-slate-50 px-6 py-16"><div className="mx-auto max-w-md space-y-6">
    <h1 className="text-3xl font-bold">Definir nova senha</h1>
    <p className="text-slate-600">Escolha uma senha com pelo menos 6 caracteres.</p>
    <PasswordForm reset />
  </div></main>;
}
