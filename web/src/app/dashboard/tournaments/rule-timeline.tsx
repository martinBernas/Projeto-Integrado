import { formatDate, formatScore } from '@/lib/tournament';
import { modeLabel, scheduleLabel, type RuleVersion } from '@/lib/rules';
export function RuleTimeline({ versions }: { versions: RuleVersion[] }) {
  return <details className="rounded-xl border border-slate-200 bg-white p-4"><summary className="cursor-pointer font-semibold">Histórico de regras ({versions.length} versões)</summary>
    <p className="mt-3 text-sm text-slate-600">O torneio tem uma única regra atual para todo o período. As versões anteriores registram as configurações usadas antes de cada alteração.</p>
    <ol className="mt-3 divide-y divide-slate-200">{versions.map(v => <li key={v.id} className="space-y-1 py-3 text-sm">
      <p className="font-semibold">{v.version} · {formatDate(v.effective_from)} a {formatDate(v.effective_to)}</p>
      <p>{modeLabel(v.scoring_mode)} · Ausência {formatScore(v.absence_penalty)} · {scheduleLabel(v.weekly_schedule)}</p>
      <p className="break-words text-slate-600">{v.reason}</p>
      <p className="text-slate-600">{v.exclusions.length ? v.exclusions.map(e => `${formatDate(e.date)}: ${e.reason}`).join('; ') : 'Sem datas excluídas'}</p>
      <p className="text-xs text-slate-500">Registrada em {new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }).format(new Date(v.created_at))} (São Paulo)</p>
    </li>)}</ol>
  </details>;
}
