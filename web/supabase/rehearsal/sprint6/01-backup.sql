-- SQL Editor: capture before S6 migration, with application writes paused.
begin;
set local lock_timeout='10s';
lock table public.tournaments,public.tournament_rule_versions,public.tournament_participants,
 public.personal_scores,public.profiles,public.tournament_excluded_dates,public.tournament_score_results in share mode;
do $$ begin
 if to_regclass('private.score_audits') is not null then raise exception 'S6 ja aplicada; nao sobrescrever referencia'; end if;
end $$;
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
insert into private.sprint6_backups(id,as_of,snapshot,function_definitions)
select 'before-s6-v1',comparison_date,private.sprint6_snapshot(comparison_date),jsonb_build_array(
 pg_get_functiondef('private.calculate_versioned_tournament(uuid,date,jsonb)'::regprocedure),
 pg_get_functiondef('private.rule_preview(uuid,jsonb)'::regprocedure))
from (select (now() at time zone 'America/Sao_Paulo')::date as comparison_date) d;
commit;
select id,captured_at,as_of,md5(snapshot::text) checksum,
 jsonb_array_length(snapshot->'tournaments') tournaments,jsonb_array_length(snapshot->'scores') scores
from private.sprint6_backups where id='before-s6-v1';
