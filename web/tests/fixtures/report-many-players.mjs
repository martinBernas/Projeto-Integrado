// Entirely synthetic: 18 players, 21 dates, penalties, ties and late entry.
export function manyPlayersSnapshot() {
  const dates = Array.from({ length: 30 }, (_, i) => `2026-10-${String(i + 1).padStart(2, '0')}`)
    .filter(day => ![0, 6].includes(new Date(day).getUTCDay()) && day !== '2026-10-12');
  const participants = Array.from({ length: 18 }, (_, i) => ({
    id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`,
    name: `Jogador de teste ${String(i + 1).padStart(2, '0')}${i === 16 ? ' 🪑' : ''}`,
    eligible_from: i === 5 ? '2026-10-05' : i === 14 ? '2026-10-08' : '2026-10-01',
  }));
  return {
    tournament: { id: '00000000-0000-4000-9000-000000000001', name: 'Validação sintética - 18 jogadores',
      starts_at: '2026-10-01', ends_at: '2026-10-30', closed_at: '2026-10-31T03:22:00Z' },
    participants,
    results: dates.flatMap((played_on, d) => participants.filter(p => p.eligible_from <= played_on).map(p => {
      const i = participants.indexOf(p);
      const penalty = i >= 15 || (d === 11 && i === 0);
      const score = penalty ? -2500 : 9000 - i * 430 + ((d * 17 + i * 5) % 9) * 160;
      return { player_id: p.id, played_on, raw_score: penalty ? null : score, applied_score: score,
        result_kind: penalty ? 'audit_penalty' : 'score', provisional: false,
        applied_rule_snapshot: { version: 'synthetic', minimum_positive: 0 } };
    })),
  };
}
