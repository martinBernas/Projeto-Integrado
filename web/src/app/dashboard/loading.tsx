export default function Loading() {
  return <main aria-busy="true" className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
    <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-bold">Seu painel</h1>
      <p role="status" aria-live="polite" className="mt-3 text-slate-600">Carregando seus dados…</p>
    </div>
  </main>;
}
