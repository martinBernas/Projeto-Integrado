-- Execute once in the Supabase SQL Editor BEFORE S4-02 changes.
-- Writes only to private backup storage; never refreshes or changes live results.
begin;
create table if not exists private.sprint4_backups (
  id text primary key,
  tournament_id uuid not null,
  captured_at timestamptz not null default now(),
  as_of date not null,
  players uuid[] not null,
  snapshot jsonb not null
);
alter table private.sprint4_backups enable row level security;
revoke all on private.sprint4_backups from public, anon, authenticated;

-- Private helper shared by capture and comparison. Totals use a fixed date so
-- midnight alone does not create differences. Include former members' scores.
create or replace function private.sprint4_snapshot(target uuid, original_players uuid[], comparison_day date)
returns jsonb language sql stable set search_path = '' as $$
  with players as (
    select unnest(original_players) as id
    union select player_id from public.tournament_participants where tournament_id = target
  ), calculated as (
    select * from private.calculate_tournament(target, comparison_day)
  )
  select jsonb_build_object(
    'tournament', coalesce((select jsonb_object_agg(t.id::text, to_jsonb(t)) from public.tournaments t where t.id=target), '{}'),
    'participants', coalesce((select jsonb_object_agg(p.player_id::text, to_jsonb(p)) from public.tournament_participants p where p.tournament_id=target), '{}'),
    'profiles', coalesce((select jsonb_object_agg(p.id::text, to_jsonb(p)) from public.profiles p where p.id in (select id from players)), '{}'),
    'personal_scores', coalesce((select jsonb_object_agg(s.id::text, to_jsonb(s)) from public.personal_scores s where s.player_id in (select id from players)), '{}'),
    'excluded_dates', coalesce((select jsonb_object_agg(e.id::text, to_jsonb(e)) from public.tournament_excluded_dates e where e.tournament_id=target), '{}'),
    'stored_results', coalesce((select jsonb_object_agg(r.id::text, to_jsonb(r)) from public.tournament_score_results r where r.tournament_id=target), '{}'),
    'calculated_results', coalesce((select jsonb_object_agg(c.player_id::text || '/' || c.played_on::text, to_jsonb(c)) from calculated c), '{}'),
    'stored_totals', coalesce((select jsonb_object_agg(t.player_id::text, to_jsonb(t)) from (
      select p.player_id, coalesce(sum(r.applied_score),0) as total
      from public.tournament_participants p left join public.tournament_score_results r
        on r.tournament_id=p.tournament_id and r.player_id=p.player_id and r.played_on>=p.eligible_from
      where p.tournament_id=target group by p.player_id
    ) t), '{}'),
    'calculated_totals', coalesce((select jsonb_object_agg(t.player_id::text, to_jsonb(t)) from (
      select p.player_id, coalesce(sum(c.applied_score),0) as total
      from public.tournament_participants p left join calculated c on c.player_id=p.player_id
      where p.tournament_id=target group by p.player_id
    ) t), '{}')
  );
$$;
revoke all on function private.sprint4_snapshot(uuid, uuid[], date) from public, anon, authenticated;

-- Briefly block concurrent writes so all sections represent the same state.
set local lock_timeout = '10s';
lock table public.tournaments, public.tournament_participants, public.profiles,
  public.personal_scores, public.tournament_excluded_dates, public.tournament_score_results in share mode;
do $$
declare
  target constant uuid := '20260900-0000-4000-8000-000000000001';
  backup_id constant text := 'before-s4-02-september-v1';
  players uuid[];
  comparison_day date;
begin
  if exists(select 1 from private.sprint4_backups where id=backup_id) then
    raise exception 'Backup ja existe; nao sera sobrescrito. Consulte 02-verify.sql e 03-export.sql.';
  end if;
  select (now() at time zone timezone)::date into comparison_day from public.tournaments where id=target;
  if not found then raise exception 'Torneio de setembro nao encontrado'; end if;
  select array_agg(player_id order by player_id) into players from public.tournament_participants where tournament_id=target;
  if players is null then raise exception 'Torneio sem participantes; confira o ambiente antes de continuar'; end if;
  insert into private.sprint4_backups(id,tournament_id,as_of,players,snapshot)
  values(backup_id,target,comparison_day,players,private.sprint4_snapshot(target,players,comparison_day));
end $$;
commit;

select id as backup_id, captured_at, as_of as data_referencia,
  cardinality(players) as participantes,
  (select count(*) from jsonb_object_keys(snapshot->'personal_scores')) as pontuacoes_pessoais,
  (select count(*) from jsonb_object_keys(snapshot->'stored_results')) as resultados_armazenados,
  md5(snapshot::text) as checksum_snapshot
from private.sprint4_backups where id='before-s4-02-september-v1';
