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

select 'schema_and_permissions' check_name,
 exists(select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid
   join pg_namespace n on n.oid = t.typnamespace
   where n.nspname = 'public' and t.typname = 'weekly_schedule' and e.enumlabel = 'every_day') every_day_present,
 exists(select 1 from pg_constraint where conrelid = 'public.tournaments'::regclass
   and conname = 'tournament_fixed_timezone' and convalidated) fixed_timezone_validated,
 (select relrowsecurity from pg_class where oid = 'public.tournament_rule_versions'::regclass) versions_rls_enabled,
 exists(select 1 from pg_policies where schemaname = 'public' and tablename = 'tournament_rule_versions'
   and policyname = 'read accessible rule versions' and cmd = 'SELECT'
   and roles = array['authenticated']::name[] and qual like '%can_view_tournament%') membership_read_policy,
 has_table_privilege('authenticated', 'public.tournament_rule_versions', 'SELECT') authenticated_can_read,
 not (has_table_privilege('authenticated', 'public.tournament_rule_versions', 'INSERT')
   or has_table_privilege('authenticated', 'public.tournament_rule_versions', 'UPDATE')
   or has_table_privilege('authenticated', 'public.tournament_rule_versions', 'DELETE')) authenticated_cannot_write,
 not has_table_privilege('anon', 'public.tournament_rule_versions', 'SELECT') anon_cannot_read,
 not has_function_privilege('anon', 'public.apply_tournament_rules(uuid,jsonb,text)', 'EXECUTE') anon_cannot_apply,
 has_function_privilege('authenticated', 'public.apply_tournament_rules(uuid,jsonb,text)', 'EXECUTE') authenticated_can_call_apply;
commit;
