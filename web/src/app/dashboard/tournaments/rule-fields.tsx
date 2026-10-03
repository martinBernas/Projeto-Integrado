import type { RuleVersion } from '@/lib/rules';

const inputClass = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-emerald-600';
export function RuleFields({ rule }: { rule?: RuleVersion }) {
  return <fieldset className="space-y-4"><legend className="mb-3 font-bold">Pontuação e calendário</legend>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm font-medium">Modo de pontuação<select name="mode" defaultValue={rule?.scoring_mode ?? 'relative_to_lowest'} className={inputClass}>
        <option value="relative_to_lowest">Relativo ao menor positivo</option><option value="absolute">Absoluto</option>
      </select></label>
      <label className="block text-sm font-medium">Penalidade de ausência<input name="penalty" type="number" min={-25000} max={0} step={1} required defaultValue={rule?.absence_penalty ?? -2500} className={inputClass} /><span className="mt-1 block text-xs text-slate-600">De −25.000 a 0. Zero bruto representa ausência nos dois modos.</span></label>
      <label className="block text-sm font-medium sm:col-span-2">Dias de jogo<select name="schedule" defaultValue={rule?.weekly_schedule === 'every_day' ? 'every_day' : 'monday_to_friday'} className={inputClass}>
        <option value="monday_to_friday">Segunda a sexta</option><option value="every_day">Todos os dias</option>
      </select></label>
    </div>
    {rule?.weekly_schedule === 'monday_to_friday_and_sunday' && <p className="text-sm text-amber-800">A versão anterior usa segunda a sexta e domingos. Escolha um dos calendários atuais e confira o impacto antes de confirmar.</p>}
    <label className="block text-sm font-medium">Datas excluídas e motivos<textarea name="exclusions" rows={3} maxLength={90000} defaultValue={rule?.exclusions.map(e => `${e.date} | ${e.reason}`).join('\n') ?? ''} className={inputClass} aria-describedby="exclusion-help" placeholder="2026-10-12 | Feriado" /><span id="exclusion-help" className="mt-1 block text-xs text-slate-600">Uma por linha: AAAA-MM-DD | motivo. Inclua apenas datas dentro da vigência. Deixar vazio significa nenhum dia excluído nesse intervalo.</span></label>
  </fieldset>;
}
