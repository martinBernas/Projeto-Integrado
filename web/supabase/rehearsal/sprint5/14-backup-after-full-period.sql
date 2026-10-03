-- Dono do produto: capture BEFORE single-rule migration; this is not an automatic recovery script.
-- Current S5 business state and rule history, not full Supabase/Auth backup.
begin;
set local lock_timeout = '10s';
lock table public.tournaments, public.tournament_participants, public.personal_scores,
 public.profiles, public.tournament_excluded_dates, public.tournament_score_results,
 public.tournament_rule_versions, private.rule_revision_changes in share mode;
do $$
declare day date := (now() at time zone 'America/Sao_Paulo')::date;
begin
 if exists(select 1 from private.sprint5_backups where id = 'before-s5-single-rule-v2') then
  raise exception 'Referencia de testes ja existe; nao sobrescrever';
 end if;
 insert into private.sprint5_backups(id, as_of, snapshot, function_definitions)
 values ('before-s5-single-rule-v2', day, private.sprint5_snapshot(day) || jsonb_build_object(
  'rule_versions', coalesce((select jsonb_agg(to_jsonb(v) order by id) from public.tournament_rule_versions v), '[]'::jsonb),
  'rule_revision_changes', coalesce((select jsonb_agg(to_jsonb(a) order by id) from private.rule_revision_changes a), '[]'::jsonb)
 ), jsonb_build_array(pg_get_functiondef('private.initialize_tournament_rules()'::regprocedure),
 pg_get_functiondef('private.validate_rule_proposal(public.tournaments,jsonb)'::regprocedure),
 pg_get_functiondef('private.rule_on_day(uuid,date)'::regprocedure),
 pg_get_functiondef('private.calculate_versioned_tournament(uuid,date,jsonb)'::regprocedure),
 pg_get_functiondef('private.rule_preview(uuid,jsonb)'::regprocedure),
 pg_get_functiondef('public.apply_tournament_rules(uuid,jsonb,text)'::regprocedure),
 pg_get_functiondef('public.update_tournament(uuid,text,date,date)'::regprocedure)));
end $$;
commit;
select id, captured_at, as_of, md5(snapshot::text) checksum,
 jsonb_array_length(snapshot->'tournaments') tournaments,
 jsonb_array_length(snapshot->'scores') personal_scores,
 jsonb_array_length(snapshot->'results') stored_results,
 jsonb_array_length(snapshot->'rule_versions') rule_versions
from private.sprint5_backups where id = 'before-s5-single-rule-v2';
