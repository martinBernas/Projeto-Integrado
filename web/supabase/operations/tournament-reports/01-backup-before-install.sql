-- Administrative. Pause business writes until 03 comparison.
-- Export 02 and validate privately BEFORE applying the new migration.
begin isolation level repeatable read;
set local lock_timeout='10s';
lock table public.tournaments,public.tournament_rule_versions,public.tournament_participants,
 public.personal_scores,public.profiles,public.tournament_excluded_dates,public.tournament_score_results,
 private.score_changes,private.result_changes,private.tournament_changes,private.participant_changes,
 private.rule_revision_changes,private.profile_changes,private.score_audits,private.audit_electors,private.audit_votes,
 private.audit_events,private.retroactive_score_changes,private.score_change_decisions,private.tournament_score_inputs in share mode;
create table if not exists private.sprint8_backups (
 id text primary key,captured_at timestamptz not null default now(),as_of date not null,
 snapshot jsonb not null,function_definitions jsonb not null
);
alter table private.sprint8_backups enable row level security;
revoke all on private.sprint8_backups from public,anon,authenticated;
create or replace function private.sprint8_snapshot(comparison_day date) returns jsonb
language plpgsql stable set search_path='' as $$
declare relation text; rows jsonb; result jsonb:='{}';
begin
 foreach relation in array array['public.tournaments','public.tournament_rule_versions','public.tournament_participants',
  'public.personal_scores','public.profiles','public.tournament_excluded_dates','public.tournament_score_results',
  'private.score_changes','private.result_changes','private.tournament_changes','private.participant_changes',
  'private.rule_revision_changes','private.profile_changes','private.score_audits','private.audit_electors','private.audit_votes',
  'private.audit_events','private.retroactive_score_changes','private.score_change_decisions','private.tournament_score_inputs'] loop
  execute format('select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),''[]''::jsonb) from %s t',relation::regclass) into rows;
  result:=result||jsonb_build_object(relation,rows);
 end loop;
 return result||jsonb_build_object('calculated',coalesce((select jsonb_agg(jsonb_build_object('tournament_id',t.id,'result',to_jsonb(c)) order by t.id,c.player_id,c.played_on)
  from public.tournaments t cross join lateral private.calculate_tournament(t.id,comparison_day) c),'[]'));
end $$;
revoke all on function private.sprint8_snapshot(date) from public,anon,authenticated;
do $$ begin
 if to_regclass('private.tournament_reports') is not null then raise exception 'reports_already_installed'; end if;
 if exists(select 1 from private.sprint8_backups where id='before-reports-20261024-v1') then raise exception 'backup_already_exists'; end if;
end $$;
insert into private.sprint8_backups(id,as_of,snapshot,function_definitions)
select 'before-reports-20261024-v1',reference_day,private.sprint8_snapshot(reference_day),
 (select jsonb_agg(pg_get_functiondef(p.oid) order by p.oid::regprocedure::text)
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in('public','private') and p.prokind='f')
from (select (now() at time zone 'America/Sao_Paulo')::date reference_day) d;
commit;
select id,captured_at,as_of,md5(snapshot::text) snapshot_md5,md5(function_definitions::text) functions_md5
from private.sprint8_backups where id='before-reports-20261024-v1';
