-- Read-only inventory before targeted removal. No raw scores are deleted.
select t.id,t.name,t.starts_at,t.ends_at,t.closed_at,
 (select count(*) from public.tournament_participants p where p.tournament_id=t.id) participants,
 (select count(*) from public.tournament_score_results r where r.tournament_id=t.id) results,
 (select count(*) from public.tournament_rule_versions v where v.tournament_id=t.id) rule_versions,
 (select count(*) from public.tournament_excluded_dates e where e.tournament_id=t.id) legacy_exclusions
from public.tournaments t where t.id='ffb35af7-e582-49b8-bc74-05906df651ca'::uuid;
-- Identify every declared dependency before preparing the removal transaction.
select conrelid::regclass dependent_table,conname,pg_get_constraintdef(oid) definition
from pg_constraint where contype='f' and confrelid='public.tournaments'::regclass order by 1,2;
