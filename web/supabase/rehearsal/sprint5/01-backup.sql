-- SQL Editor, BEFORE the S5 migration. Business-data snapshot, not an Auth backup.
begin;
set local lock_timeout='10s';
lock table public.tournaments,public.tournament_participants,public.personal_scores,
 public.profiles,public.tournament_excluded_dates,public.tournament_score_results in share mode;
do $$ begin
 if to_regclass('public.tournament_rule_versions') is not null then raise exception 'S5 ja aplicada; nao capturar referencia anterior'; end if;
 if exists(select 1 from public.tournaments where timezone<>'America/Sao_Paulo') then raise exception 'Fuso legado inesperado; revisar antes da migracao'; end if;
end $$;
create table if not exists private.sprint5_backups (
 id text primary key,captured_at timestamptz not null default now(),as_of date not null,
 snapshot jsonb not null,function_definitions jsonb not null
);
alter table private.sprint5_backups enable row level security;
revoke all on private.sprint5_backups from public,anon,authenticated;
create or replace function private.sprint5_snapshot(comparison_day date) returns jsonb
language sql stable set search_path='' as $$
 select jsonb_build_object(
 'tournaments',coalesce((select jsonb_agg(to_jsonb(t) order by id) from public.tournaments t),'[]'),
 'participants',coalesce((select jsonb_agg(to_jsonb(t) order by tournament_id,player_id) from public.tournament_participants t),'[]'),
 'profiles',coalesce((select jsonb_agg(to_jsonb(t) order by id) from public.profiles t),'[]'),
 'scores',coalesce((select jsonb_agg(to_jsonb(t) order by id) from public.personal_scores t),'[]'),
 'exclusions',coalesce((select jsonb_agg(to_jsonb(t) order by id) from public.tournament_excluded_dates t),'[]'),
 'results',coalesce((select jsonb_agg(to_jsonb(t) order by id) from public.tournament_score_results t),'[]'),
 'calculated',coalesce((select jsonb_agg(jsonb_build_object('tournament_id',t.id,'result',to_jsonb(c)) order by t.id,c.player_id,c.played_on)
   from public.tournaments t cross join lateral private.calculate_tournament(t.id,comparison_day) c),'[]'));
$$;
revoke all on function private.sprint5_snapshot(date) from public,anon,authenticated;
do $$ declare day date:=(now() at time zone 'America/Sao_Paulo')::date;
begin
 if exists(select 1 from private.sprint5_backups where id='before-s5-v1') then raise exception 'Backup ja existe; nao sera sobrescrito'; end if;
 insert into private.sprint5_backups(id,as_of,snapshot,function_definitions)
 values('before-s5-v1',day,private.sprint5_snapshot(day),jsonb_build_array(
   pg_get_functiondef('private.calculate_tournament(uuid,date)'::regprocedure),
   pg_get_functiondef('private.refresh_open_tournament(uuid,date)'::regprocedure),
   pg_get_functiondef('public.get_tournament_dashboard(uuid)'::regprocedure)));
end $$;
commit;
select id,captured_at,as_of,md5(snapshot::text) checksum,
 jsonb_array_length(snapshot->'tournaments') tournaments,
 jsonb_array_length(snapshot->'scores') personal_scores,
 jsonb_array_length(snapshot->'results') stored_results
from private.sprint5_backups where id='before-s5-v1';
