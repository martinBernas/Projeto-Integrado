import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import type { RuleVersion } from '@/lib/rules';
import { RuleForm } from '../../rule-form';
import { RuleTimeline } from '../../rule-timeline';

export default async function RulesPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured) return <main className="p-8">Serviço em preparação.</main>;
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { data: tournament } = await supabase.from('tournaments').select('id,name,starts_at,ends_at,closed_at').eq('id', id).eq('organizer_id', user.id).maybeSingle();
  if (!tournament) return <main className="p-8"><h1 className="text-xl font-bold">Torneio indisponível ou sem permissão</h1><Link href="/dashboard/tournaments" className="mt-4 inline-block underline">Voltar à administração</Link></main>;
  const { data, error } = await supabase.rpc('get_tournament_dashboard', { target: id });
  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6"><div className="mx-auto max-w-3xl space-y-6">
    <header><Link href="/dashboard/tournaments" className="font-semibold text-emerald-800">← Voltar à administração</Link><h1 className="mt-4 text-3xl font-bold">Regras de {tournament.name}</h1><p className="mt-2 text-sm text-slate-600">Horário fixo de São Paulo. Zero bruto representa ausência em ambos os modos.</p></header>
    {error || !data?.current_rule ? <p role="alert" className="rounded-xl bg-amber-50 p-5">Não foi possível carregar as regras. Atualize a página e tente novamente.</p> : <>
      {tournament.closed_at ? <p className="rounded-xl bg-white p-5">Torneio encerrado. Regras e resultados preservados; revisão indisponível.</p> : <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="mb-4 text-xl font-bold">Revisar configuração</h2><RuleForm id={id} start={tournament.starts_at} end={tournament.ends_at} rule={data.current_rule as RuleVersion} /></section>}
      <RuleTimeline versions={data.rule_versions as RuleVersion[]} />
    </>}
  </div></main>;
}
