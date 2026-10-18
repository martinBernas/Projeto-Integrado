-- Administrative SQL Editor: new business backup, not the old test-removal capture.
-- Pause application writes until comparison after migration. Export with 02 before installing notification workspaces.
begin isolation level repeatable read;
set local lock_timeout='10s';
lock table public.tournaments,public.tournament_rule_versions,public.tournament_participants,
 public.personal_scores,public.profiles,public.tournament_excluded_dates,public.tournament_score_results,
 private.score_changes,private.result_changes,private.tournament_changes,private.participant_changes,
 private.rule_revision_changes,private.score_audits,private.audit_electors,private.audit_votes,private.audit_events,private.retroactive_score_changes,private.score_change_decisions,private.tournament_score_inputs in share mode;
create table if not exists private.sprint6_backups (
 id text primary key, captured_at timestamptz not null default now(), as_of date not null,
 snapshot jsonb not null, function_definitions jsonb not null
);
alter table private.sprint6_backups enable row level security;
revoke all on private.sprint6_backups from public,anon,authenticated;
create or replace function private.sprint6_snapshot(comparison_day date) returns jsonb
language sql stable set search_path='' as $$
 select jsonb_build_object(
 'tournaments',coalesce((select jsonb_agg(to_jsonb(t) order by id) from public.tournaments t),'[]'),
 'versions',coalesce((select jsonb_agg(to_jsonb(t) order by id) from public.tournament_rule_versions t),'[]'),
 'participants',coalesce((select jsonb_agg(to_jsonb(t) order by tournament_id,player_id) from public.tournament_participants t),'[]'),
 'profiles',coalesce((select jsonb_agg(to_jsonb(t) order by id) from public.profiles t),'[]'),
 'scores',coalesce((select jsonb_agg(to_jsonb(t) order by id) from public.personal_scores t),'[]'),
 'exclusions',coalesce((select jsonb_agg(to_jsonb(t) order by id) from public.tournament_excluded_dates t),'[]'),
 'results',coalesce((select jsonb_agg(to_jsonb(t) order by id) from public.tournament_score_results t),'[]'),
 'score_changes',coalesce((select jsonb_agg(to_jsonb(t) order by id) from private.score_changes t),'[]'),
 'result_changes',coalesce((select jsonb_agg(to_jsonb(t) order by id) from private.result_changes t),'[]'),
 'tournament_changes',coalesce((select jsonb_agg(to_jsonb(t) order by id) from private.tournament_changes t),'[]'),
 'participant_changes',coalesce((select jsonb_agg(to_jsonb(t) order by id) from private.participant_changes t),'[]'),
 'rule_changes',coalesce((select jsonb_agg(to_jsonb(t) order by id) from private.rule_revision_changes t),'[]'),
 'calculated',coalesce((select jsonb_agg(jsonb_build_object('tournament_id',t.id,'result',to_jsonb(c)) order by t.id,c.player_id,c.played_on)
  from public.tournaments t cross join lateral private.calculate_tournament(t.id,comparison_day) c),'[]'));
$$;
revoke all on function private.sprint6_snapshot(date) from public,anon,authenticated;

do $$ begin
 if to_regprocedure('public.get_tournament_notifications()') is not null then
  raise exception 'notification workspaces already installed; inspect state instead of capturing a before-install backup'; end if;
 if exists(select 1 from private.sprint6_backups where id='before-notifications-20261018-v1') then
  raise exception 'notification workspaces backup already exists; do not overwrite'; end if;
end $$;
insert into private.sprint6_backups(id,as_of,snapshot,function_definitions)
select 'before-notifications-20261018-v1',reference_day,
 private.sprint6_snapshot(reference_day)||jsonb_build_object(
  'audits',coalesce((select jsonb_agg(to_jsonb(a) order by id) from private.score_audits a),'[]'),
  'electors',coalesce((select jsonb_agg(to_jsonb(e) order by audit_id,player_id) from private.audit_electors e),'[]'),
  'votes',coalesce((select jsonb_agg(to_jsonb(v) order by audit_id,player_id) from private.audit_votes v),'[]'),
  'audit_events',coalesce((select jsonb_agg(to_jsonb(e) order by id) from private.audit_events e),'[]'),
  'retroactive_changes',coalesce((select jsonb_agg(to_jsonb(c) order by id) from private.retroactive_score_changes c),'[]'),
  'retroactive_decisions',coalesce((select jsonb_agg(to_jsonb(d) order by id) from private.score_change_decisions d),'[]'),
  'tournament_inputs',coalesce((select jsonb_agg(to_jsonb(i) order by tournament_id,player_id,played_on) from private.tournament_score_inputs i),'[]')),
 jsonb_build_array(
  pg_get_functiondef('private.calculate_versioned_tournament(uuid,date,jsonb)'::regprocedure),
  pg_get_functiondef('private.rule_preview(uuid,jsonb)'::regprocedure),
  pg_get_functiondef('public.request_score_audit(uuid,uuid,text)'::regprocedure),
  pg_get_functiondef('private.guard_pending_audit_score()'::regprocedure),
  pg_get_functiondef('public.get_score_audits(uuid)'::regprocedure))
from (select (now() at time zone 'America/Sao_Paulo')::date reference_day) d;
commit;
select id,captured_at,as_of,md5(snapshot::text) checksum,
 jsonb_array_length(snapshot->'tournaments') tournaments,
 jsonb_array_length(snapshot->'scores') personal_scores,
 jsonb_array_length(snapshot->'results') score_results,
 md5((snapshot->'tournaments')::text) tournaments_checksum,
 md5((snapshot->'scores')::text) personal_scores_checksum,
 md5((snapshot->'results')::text) score_results_checksum
from private.sprint6_backups where id='before-notifications-20261018-v1';
