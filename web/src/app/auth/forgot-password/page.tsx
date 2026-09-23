import { PasswordForm } from "../password-form";

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="min-h-screen bg-slate-50 px-6 py-16"><div className="mx-auto max-w-md space-y-6">
    <h1 className="text-3xl font-bold">Recuperar senha</h1>
    <p className="text-slate-600">Enviaremos um link para você escolher uma nova senha. Abra o link no mesmo navegador em que fez a solicitação.</p>
    {error && <p role="alert" className="text-red-700">O link é inválido, expirou ou foi aberto em outro navegador. Solicite um novo link abaixo.</p>}
    <PasswordForm />
  </div></main>;
}
