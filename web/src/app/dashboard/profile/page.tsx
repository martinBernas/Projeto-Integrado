import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { ProfileForm } from './profile-form';
export default async function ProfilePage() {
  if (!isSupabaseConfigured) return <main className="p-8">Serviço em preparação.</main>;
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/auth/login');
  const { data: profile, error } = await client.from('profiles').select('display_name, public_name_confirmed, geoguessr_url').eq('id',user.id).single();
  return <main className="min-h-screen bg-slate-50 px-4 py-8"><div className="mx-auto max-w-2xl space-y-6">
    <header><Link href="/dashboard" className="font-semibold text-emerald-800">← Voltar ao painel</Link><h1 className="mt-4 text-3xl font-bold">Meu perfil</h1><p className="mt-2 text-slate-600">Escolha como você aparece nos torneios. A edição preserva suas pontuações e participações.</p></header>
    {error || !profile ? <p role="alert">Não foi possível carregar seu perfil. Atualize a página e tente novamente.</p> : <ProfileForm name={profile.display_name ?? ''} url={profile.geoguessr_url ?? ''} confirmed={profile.public_name_confirmed} />}
  </div></main>;
}
