-- Somente leitura. Executado pelo Dono do produto no SQL Editor do Supabase.
-- Identificar torneios pelo período; não encerrar/excluir com base apenas no nome.
select t.id, t.name, t.starts_at, t.ends_at, t.closed_at, t.history_ready,
  (select count(*) from public.tournament_participants p where p.tournament_id=t.id) participants,
  (select count(*) from public.tournament_score_results r where r.tournament_id=t.id) results,
  (select count(*) from public.tournament_rule_versions v where v.tournament_id=t.id) rule_versions
from public.tournaments t
where t.starts_at >= date '2026-09-01' and t.ends_at <= date '2026-09-30'
order by t.starts_at, t.name, t.id;
