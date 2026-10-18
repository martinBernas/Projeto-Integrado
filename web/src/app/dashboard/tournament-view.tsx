import { RecentResults } from './recent-results';
import Link from 'next/link';
import { PlayerName } from './player-name';
import { eligibleResults, sortDailyResults, formatDate, formatScore, ranking, type TournamentData } from '@/lib/tournament';
import { modeLabel, scheduleLabel } from '@/lib/rules';
import { RuleTimeline } from './tournaments/rule-timeline';

export function TournamentView({ data, userId }: { data: TournamentData; userId: string }) {
  const results = eligibleResults(data.participants, data.results);
  const standings = ranking(data.participants, results);
  const days = [...new Set(results.map(r => r.played_on))].sort().reverse();
  const rule = data.current_rule;
  const auditByScore = new Map((data.score_audits ?? []).map(a => [a.personal_score_id, a]));
  return <>
    <section className="rounded-b-xl bg-slate-900 p-6 text-white sm:p-8">
      <h2 className="text-sm font-semibold text-emerald-300">Regras<span className="sr-only"> de {data.tournament.name}</span></h2>
      {data.tournament.closed_at && <p className="mt-2 font-semibold text-emerald-300">Torneio encerrado · Resultados finais preservados</p>}
      <p className="mt-3 text-slate-300">{formatDate(data.tournament.starts_at)} a {formatDate(data.tournament.ends_at)} · {scheduleLabel(rule?.weekly_schedule ?? 'monday_to_friday')}</p>
      {rule && <p className="mt-2 text-sm text-slate-300">Regra do torneio · {rule.version}. A mesma configuração vale para todo o período.</p>}
      {data.excluded_dates.length > 0 && <p className="mt-2 text-sm text-slate-300">Datas excluídas: {data.excluded_dates.map(formatDate).join(', ')}</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div><p className="text-sm text-slate-300">{modeLabel(rule?.scoring_mode ?? 'relative_to_lowest')}</p><p className="mt-1 font-semibold">{rule?.scoring_mode === 'absolute' ? 'Resultado bruto positivo' : 'Resultado bruto − menor positivo'}</p></div>
        <div><p className="text-sm text-slate-300">Ausência após o fim do dia</p><p className="mt-1 font-semibold">{formatScore(rule?.absence_penalty ?? -2500)} pontos</p></div>
        <div><p className="text-sm text-slate-300">Fuso do torneio</p><p className="mt-1 font-semibold">{data.tournament.timezone}</p></div>
      </div>
    </section>
    {data.rule_versions && <RuleTimeline versions={data.rule_versions} />}
    <Link href={`/dashboard/tournaments/${data.tournament.id}/audits`} className="inline-block rounded-lg border border-emerald-800 px-4 py-2 font-semibold text-emerald-800">Auditoria de pontuações</Link>
    <Link href={`/dashboard/tournaments/${data.tournament.id}/statistics`} className="ml-3 inline-block rounded-lg border border-emerald-800 px-4 py-2 font-semibold text-emerald-800">Estatísticas do torneio</Link>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="p-6"><h2 className="text-xl font-bold">Ranking acumulado</h2><p className="mt-1 text-sm text-slate-600">{data.participants.length} participantes · Resultados do dia atual são provisórios. Empates compartilham a posição.</p></div>
      {standings.length === 0 ? <p className="px-6 pb-6 text-slate-600">Nenhum participante vinculado ainda.</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Classificação acumulada de {data.tournament.name}</caption><thead className="bg-slate-100 text-slate-600"><tr><th className="px-6 py-3">Posição</th><th className="px-6 py-3">Jogador</th><th className="px-6 py-3 text-right">Pontos</th></tr></thead><tbody>{standings.map(p => <tr key={p.id} className={`border-t border-slate-100 ${p.id === userId ? 'bg-emerald-50' : ''}`}><td className="px-6 py-4 font-semibold">{p.position}º</td><th scope="row" className="px-6 py-4 font-medium"><PlayerName name={p.name} url={p.geoguessr_url} />{p.id === userId && <span className="ml-2 text-xs text-emerald-800">você</span>}</th><td className="px-6 py-4 text-right font-bold tabular-nums">{formatScore(p.total)}</td></tr>)}</tbody></table></div>}
    </section>
    <RecentResults key={data.tournament.id} items={days.map(day => {
        const rows = sortDailyResults(data.participants, results.filter(r => r.played_on === day));
        const hasScores = rows.some(r => r.result_kind === 'score');
        const snapshot = rows[0]?.applied_rule_snapshot;
        return { day, content: <details key={day} className="rounded-xl border border-slate-200 bg-white"><summary className="cursor-pointer px-5 py-4 font-semibold">{formatDate(day)} <span className="ml-2 text-xs font-normal text-slate-600">{rows.some(r => r.provisional) ? 'Provisório' : 'Encerrado'}{!hasScores ? ' · Sem resultados positivos' : ''}</span></summary>
          <div className="overflow-x-auto px-5 pb-5"><table className="w-full text-left text-sm"><caption className="pb-3 text-left text-xs text-slate-600">{snapshot?.mode === 'absolute' ? 'Pontuação absoluta' : hasScores ? `Menor positivo: ${formatScore(rows.find(r => r.raw_score && r.raw_score > 0)?.applied_rule_snapshot.minimum_positive ?? 0)}` : 'Sem resultados positivos; ausências e pendências abaixo.'} · Regra {snapshot?.version ?? data.tournament.rule_version}</caption><thead><tr className="border-b"><th className="py-2 pr-4">Jogador</th><th className="p-2 text-right">Bruta</th><th className="p-2 text-right">Aplicada</th><th className="p-2">Situação</th></tr></thead><tbody>{rows.map(r => <tr key={r.player_id} className="border-b border-slate-100"><th scope="row" className="py-3 pr-4 font-medium"><PlayerName name={data.participants.find(p => p.id === r.player_id)?.name ?? 'Jogador'} url={data.participants.find(p => p.id === r.player_id)?.geoguessr_url} /></th><td className="p-2 text-right tabular-nums">{r.raw_score === null ? '—' : formatScore(r.raw_score)}</td><td className="p-2 text-right tabular-nums">{r.result_kind === 'pending' ? '—' : formatScore(r.applied_score)}</td><td className="p-2 text-slate-600">{r.result_kind === 'score' ? 'Resultado' : r.result_kind === 'absence' ? 'Ausência' : r.result_kind === 'audit_disregarded' ? 'Desconsiderada por auditoria' : r.result_kind === 'audit_penalty' ? 'Penalidade por auditoria' : 'Aguardando'}{r.personal_score_id && auditByScore.has(r.personal_score_id) && <Link href={`/dashboard/tournaments/${data.tournament.id}/audits#audit-${auditByScore.get(r.personal_score_id)?.id}`} prefetch={false} aria-label={`${auditByScore.get(r.personal_score_id)?.status === 'invalidated' ? 'Punição aplicada' : 'Auditoria aberta'} da pontuação de ${data.participants.find(p => p.id === r.player_id)?.name ?? 'Jogador'} em ${formatDate(day)}: ${auditByScore.get(r.personal_score_id)?.status === 'invalidated' ? 'ver resultado' : 'ver votação'}`} className="mt-1 block rounded border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-900 underline focus-visible:outline-2 focus-visible:outline-offset-2">{auditByScore.get(r.personal_score_id)?.status === 'invalidated' ? 'Punição aplicada · Ver resultado' : 'Auditoria aberta · Ver votação'}</Link>}</td></tr>)}{data.participants.filter(p => day < p.eligible_from).map(p => <tr key={p.id} className="border-b border-slate-100"><th scope="row" className="py-3 pr-4 font-medium"><PlayerName name={p.name} url={p.geoguessr_url} /></th><td className="p-2 text-right">—</td><td className="p-2 text-right">—</td><td className="p-2 text-slate-600">Não inscrito</td></tr>)}</tbody></table></div>
        </details> };
      })} />
  </>;
}
