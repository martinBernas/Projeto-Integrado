-- Administrative SQL Editor: new business backup, not the old test-removal capture.
-- Pause application writes until comparison after migration. Export with 05 before installing RF24.
begin isolation level repeatable read;
set local lock_timeout='10s';
lock table public.tournaments,public.tournament_rule_versions,public.tournament_participants,
 public.personal_scores,public.profiles,public.tournament_excluded_dates,public.tournament_score_results,
 private.score_changes,private.result_changes,private.tournament_changes,private.participant_changes,
 private.rule_revision_changes,private.score_audits,private.audit_electors,private.audit_votes,private.audit_events in share mode;
do $$ begin
 if to_regprocedure('public.record_operational_metrics(jsonb)') is not null then
  raise exception 'RF24 already installed; inspect state instead of capturing a before-install backup'; end if;
 if exists(select 1 from private.sprint6_backups where id='before-rf24-20261018-v1') then
  raise exception 'RF24 backup already exists; do not overwrite'; end if;
end $$;
insert into private.sprint6_backups(id,as_of,snapshot,function_definitions)
select 'before-rf24-20261018-v1',reference_day,
 private.sprint6_snapshot(reference_day)||jsonb_build_object(
  'audits',coalesce((select jsonb_agg(to_jsonb(a) order by id) from private.score_audits a),'[]'),
  'electors',coalesce((select jsonb_agg(to_jsonb(e) order by audit_id,player_id) from private.audit_electors e),'[]'),
  'votes',coalesce((select jsonb_agg(to_jsonb(v) order by audit_id,player_id) from private.audit_votes v),'[]'),
  'audit_events',coalesce((select jsonb_agg(to_jsonb(e) order by id) from private.audit_events e),'[]')),
 jsonb_build_array(
  pg_get_functiondef('private.calculate_versioned_tournament(uuid,date,jsonb)'::regprocedure),
  pg_get_functiondef('private.rule_preview(uuid,jsonb)'::regprocedure))
from (select (now() at time zone 'America/Sao_Paulo')::date reference_day) d;
commit;
select id,captured_at,as_of,md5(snapshot::text) checksum,
 jsonb_array_length(snapshot->'tournaments') tournaments,
 jsonb_array_length(snapshot->'scores') personal_scores,
 jsonb_array_length(snapshot->'results') score_results,
 md5((snapshot->'tournaments')::text) tournaments_checksum,
 md5((snapshot->'scores')::text) personal_scores_checksum,
 md5((snapshot->'results')::text) score_results_checksum
from private.sprint6_backups where id='before-rf24-20261018-v1';
