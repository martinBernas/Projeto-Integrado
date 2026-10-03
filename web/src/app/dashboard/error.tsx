"use client";

export default function DashboardError({ retry }: { retry: () => void }) {
  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
    <section role="alert" className="mx-auto max-w-6xl rounded-2xl border border-amber-300 bg-amber-50 p-6">
      <h1 className="text-xl font-bold">Painel temporariamente indisponível</h1>
      <p className="mt-2">Não foi possível concluir o carregamento. Tente novamente.</p>
      <button type="button" onClick={retry} className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">Tentar novamente</button>
    </section>
  </main>;
}
