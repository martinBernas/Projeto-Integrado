import type { TournamentStatistics } from '@/lib/tournament-statistics';

export function Nemesis({ participant, rivals }: { participant: boolean; rivals: TournamentStatistics['nemeses'] }) {
  return <section aria-labelledby="nemesis-heading" className="rounded-2xl border border-slate-200 bg-white p-5">
    <h2 id="nemesis-heading" className="text-xl font-bold">Nêmesis: suas maiores disputas</h2>
    <p className="mt-2 text-sm text-slate-600">Adversários com quem você mais trocou a liderança na pontuação acumulada. Cada inversão da ordem entre vocês conta uma troca.</p>
    {!participant ? <p className="mt-4">Você não participa como jogador deste torneio; não há Nêmesis pessoal.</p>
      : !rivals.length ? <p className="mt-4">Ainda não houve trocas de liderança entre você e outro jogador nos dias encerrados.</p>
        : <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm">
          <caption className="sr-only">Até cinco adversários com mais trocas de liderança com você</caption>
          <thead className="bg-slate-100 text-slate-600"><tr><th className="p-3">Adversário</th><th className="p-3 text-right">Trocas de liderança</th></tr></thead>
          <tbody>{rivals.map(rival => <tr key={rival.id} className="border-t border-slate-100">
            <th scope="row" className="p-3 font-medium">{rival.name}{rival.swaps === rivals[0].swaps && <span className="ml-2 inline-block text-xs font-semibold text-emerald-800">Maior disputa</span>}</th>
            <td className="p-3 text-right font-bold tabular-nums">{rival.swaps}</td>
          </tr>)}</tbody>
        </table></div>}
    <p className="mt-3 text-sm text-slate-600">Empate não soma troca e preserva a última liderança: ficar à frente, empatar e depois ficar atrás conta uma troca. A comparação começa quando ambos são elegíveis. Até cinco adversários; empates na contagem são apresentados em ordem alfabética.</p>
  </section>;
}
