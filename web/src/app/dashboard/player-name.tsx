import { validGeoGuessrUrl } from '@/lib/profile';
export function PlayerName({ name, url }: { name: string; url?: string | null }) {
  return <>{name}{url && validGeoGuessrUrl(url) && <a href={url} target="_blank" rel="noopener noreferrer" className="ml-2 inline-block text-xs font-medium text-emerald-800 underline" aria-label={`Perfil de ${name} no GeoGuessr (nova aba)`}>GeoGuessr ↗</a>}</>;
}
