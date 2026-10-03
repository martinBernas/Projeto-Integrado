export type RuleExclusion = { date: string; reason: string };
export type RuleProposal = {
  from: string; to: string; mode: 'absolute' | 'relative_to_lowest'; penalty: number;
  schedule: 'monday_to_friday' | 'every_day'; exclusions: RuleExclusion[]; reason: string;
};
export type RuleVersion = {
  id: number; effective_from: string; effective_to: string; scoring_mode: RuleProposal['mode'];
  absence_penalty: number; weekly_schedule: RuleProposal['schedule'] | 'monday_to_friday_and_sunday'; exclusions: RuleExclusion[];
  version: string; reason: string; created_at: string;
};
export type RulePreview = {
  token: string; proposal: RuleProposal; today: string; retroactive: boolean;
  totals: { player_id: string; name: string; before: number; after: number; delta: number }[];
  changes: { player_id: string; day: string; before: number | null; after: number | null; before_kind: string | null; after_kind: string | null }[];
};
export function validRuleDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && value >= '0001-01-01'
    && !Number.isNaN(Date.parse(`${value}T12:00:00Z`))
    && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
}
export function parseRuleFields(form: FormData): RuleProposal | null {
  const from = String(form.get('rule_from') ?? form.get('start') ?? '');
  const to = String(form.get('rule_to') ?? form.get('end') ?? '');
  const mode = String(form.get('mode') ?? '');
  const schedule = String(form.get('schedule') ?? '');
  const penaltyText = String(form.get('penalty') ?? '');
  const reason = String(form.get('reason') ?? 'Configuração inicial').trim();
  const lines = String(form.get('exclusions') ?? '').split(/\r?\n/).filter(line => line.trim());
  if (!validRuleDate(from) || !validRuleDate(to) || to < from || !/^-?\d{1,5}$/.test(penaltyText)
    || Number(penaltyText) < -25000 || Number(penaltyText) > 0
    || !['absolute', 'relative_to_lowest'].includes(mode)
    || !['monday_to_friday', 'every_day'].includes(schedule)
    || reason.length < 3 || reason.length > 500 || lines.length > 366) return null;
  const exclusions = lines.map(line => {
    const split = line.indexOf('|');
    if (split < 0) return { date: '', reason: '' };
    return { date: line.slice(0, split).trim(), reason: line.slice(split + 1).trim() };
  });
  if (exclusions.some(e => !validRuleDate(e.date) || e.date < from || e.date > to || e.reason.length < 3 || e.reason.length > 200)
    || new Set(exclusions.map(e => e.date)).size !== exclusions.length) return null;
  return { from, to, mode: mode as RuleProposal['mode'], penalty: Number(penaltyText),
    schedule: schedule as RuleProposal['schedule'], exclusions, reason };
}
export const modeLabel = (mode: string) => mode === 'absolute' ? 'Absoluto' : 'Relativo ao menor positivo';
export const scheduleLabel = (schedule: string) => schedule === 'every_day' ? 'Todos os dias' : schedule === 'monday_to_friday_and_sunday' ? 'Segunda a sexta e domingos (legado)' : 'Segunda a sexta';
export function ruleForDate(versions: RuleVersion[], day: string) {
  return [...versions].sort((a, b) => b.id - a.id).find(v => day >= v.effective_from && day <= v.effective_to);
}
