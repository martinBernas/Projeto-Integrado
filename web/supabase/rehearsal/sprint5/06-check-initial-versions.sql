-- Dono do produto: execute after 02-verify.sql passes and before S5 application use.
-- Read-only structural checks; do not include personal data in the returned summary.
begin;
set transaction isolation level repeatable read, read only;
with baseline as (
 select t.id, count(v.id) versions,
 bool_and(v.effective_from = t.starts_at and v.effective_to = t.ends_at
   and v.scoring_mode = t.scoring_mode and v.absence_penalty = t.absence_penalty
   and v.weekly_schedule = t.weekly_schedule and v.version = t.rule_version
   and v.exclusions = coalesce((select jsonb_agg(jsonb_build_object(
     'date', e.excluded_date, 'reason', coalesce(e.reason, 'Exclusão existente'))
     order by e.excluded_date) from public.tournament_excluded_dates e where e.tournament_id = t.id), '[]'::jsonb)
 ) equivalent
 from public.tournaments t left join public.tournament_rule_versions v on v.tournament_id = t.id
 group by t.id
)
select 'initial_versions' check_name,
 (select count(*) from public.tournaments) tournaments,
 (select count(*) from public.tournament_rule_versions) versions,
 count(*) filter(where versions <> 1 or equivalent is distinct from true) inconsistent_tournaments
from baseline;

commit;
