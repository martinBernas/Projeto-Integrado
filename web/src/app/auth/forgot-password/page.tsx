import { RecoveryForms } from "../recovery-forms";

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="min-h-screen bg-slate-50 px-6 py-16"><div className="mx-auto max-w-md space-y-6">
    <h1 className="text-3xl font-bold">Recuperar senha</h1>
    <p className="text-slate-600">Enviaremos um código por e-mail. Digite o código abaixo para escolher uma nova senha.</p>
    {error && <p role="alert" className="text-red-700">Não foi possível validar a recuperação anterior. Solicite um novo código abaixo.</p>}
    <RecoveryForms />
  </div></main>;
}
