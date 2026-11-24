import { medalTiers, type Medal, type MedalCounts } from '@/lib/medals';
import { InfoTip } from '@/app/info-tip';

export function MedalIcon({ kind }: { kind: Medal }) {
  return <svg className={`medal-icon medal-${kind}`} viewBox="0 0 40 48" fill="none" aria-hidden="true" focusable="false">
    <path d="m8 2 9 1 8 20-10 2Z" fill="var(--medal-ribbon)" />
    <path d="m23 3 9-1-7 23-10-2Z" fill="var(--medal-ribbon-light)" />
    <path d="m12 2 4 1 7 18-4 1Z" fill="#fff" opacity=".22" />
    <circle cx="20" cy="29" r="16" fill="var(--medal-edge)" />
    <circle cx="20" cy="28" r="13" fill="var(--medal-fill)" stroke="var(--medal-shine)" strokeWidth="2" />
    <path d="M10 25a10 10 0 0 1 10-7" stroke="var(--medal-shine)" strokeWidth="2" strokeLinecap="round" opacity=".9" />
    {kind === 'platinum' ? <path d="m20 20 7 7-7 9-7-9Z" fill="var(--medal-shine)" stroke="var(--medal-edge)" />
      : <path d="m20 21 2.1 4.3 4.7.7-3.4 3.3.8 4.7-4.2-2.2-4.2 2.2.8-4.7-3.4-3.3 4.7-.7Z" fill="var(--medal-shine)" opacity=".8" />}
  </svg>;
}

export function MedalCollection({ counts, scope, provisional = false, notParticipant = false }: {
  counts: MedalCounts | null; scope: 'personal' | 'tournament'; provisional?: boolean; notParticipant?: boolean;
}) {
  const title = scope === 'personal' ? 'Medalhas do histórico pessoal' : 'Suas medalhas neste torneio';
  return <section className="medal-collection" aria-label={title}>
    <div className="info-heading"><h3 className="text-base font-bold">{title}</h3><InfoTip label={title}>
      Uma medalha por resultado, pela pontuação absoluta (bruta), sem acumular categorias.
      {medalTiers.map(tier => <span key={tier.key}> {tier.label}: {tier.range} pontos.</span>)} Abaixo de 5.000 não há medalha.
      {scope === 'personal' ? ' Considera todo o seu histórico até hoje, incluindo cargas históricas, além dos 100 lançamentos exibidos. Cada dia conta uma vez, independentemente de quantos torneios você disputa.'
        : ' Conta somente seus resultados válidos no período, calendário e participação deste torneio. Usa o bruto aceito no torneio; resultados invalidados por auditoria, ausências e pendências não contam. Resultados provisórios podem mudar. Torneios encerrados usam seus resultados preservados.'}
    </InfoTip></div>
    {notParticipant ? <p className="mt-2 text-sm text-slate-600">Você não participa como jogador deste torneio.</p>
      : counts === null ? <p role="status" className="mt-2 text-sm text-slate-600">Não foi possível carregar suas medalhas. Atualize a página para tentar novamente.</p>
        : <ul className="medal-shelf" aria-label="Quantidade por categoria">{medalTiers.map(tier => <li key={tier.key} className={`medal-counter medal-${tier.key}`} aria-label={`${tier.label}: ${counts[tier.key]} ${counts[tier.key] === 1 ? 'medalha' : 'medalhas'}`}>
          <MedalIcon kind={tier.key} /><span className="medal-counter-copy"><span className="medal-count">{counts[tier.key].toLocaleString('pt-BR')}</span><span className="medal-name">{tier.label}</span></span>
        </li>)}</ul>}
    {provisional && <p className="mt-2 text-sm text-slate-600">Inclui medalha provisória de hoje.</p>}
  </section>;
}
