"use client";
import { InfoTip } from '@/app/info-tip';
import { useActionState } from 'react';
import { saveProfile } from './actions';
import { nameHelp, urlHelp } from '@/lib/profile';
export function ProfileForm({ name, url, confirmed }: { name: string; url: string; confirmed: boolean }) {
  const [state, action, pending] = useActionState(saveProfile, {});
  return <form action={action} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
    {!confirmed && !state.message && <p className="rounded-lg bg-amber-50 p-4 text-sm">Confirme ou substitua seu nome público. Até salvar, os outros jogadores veem uma identificação neutra.</p>}
    <div className="info-label"><label className="font-medium" htmlFor="public-name">Nome público</label><InfoTip label="Nome público" id="name-help">{nameHelp}</InfoTip></div>
    <input id="public-name" name="public_name" defaultValue={name} required minLength={1} maxLength={80} autoComplete="nickname" aria-describedby="name-help" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
    <div className="info-label"><label className="font-medium" htmlFor="geoguessr-url">Perfil no GeoGuessr (opcional)</label><InfoTip label="Perfil no GeoGuessr" id="url-help">{urlHelp} Participantes e organizadores dos seus torneios poderão abrir o link. Ele não comprova titularidade e não importa resultados.</InfoTip></div>
    <input id="geoguessr-url" name="geoguessr_url" type="url" defaultValue={url} maxLength={150} placeholder="https://www.geoguessr.com/user/seu-id" aria-describedby="url-help" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
    <button disabled={pending} className="rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white disabled:opacity-50">{pending ? 'Salvando…' : 'Salvar perfil'}</button>
    <div aria-live="polite">{state.error && <p role="alert" className="text-red-700">{state.error}</p>}{state.message && <p className="text-emerald-800">{state.message}</p>}</div>
  </form>;
}
