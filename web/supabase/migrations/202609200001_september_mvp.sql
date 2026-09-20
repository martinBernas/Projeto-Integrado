-- Incremental migration. Apply after 202609120001_initial_schema.sql.
begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

alter table public.personal_scores
  add column played_on date generated always as ((occurred_at at time zone 'America/Sao_Paulo')::date) stored,
  add column source text not null default 'player' check (source in ('player', 'manual_history'));
-- Deliberately fail on existing duplicates: never silently discard historical data.
alter table public.personal_scores add constraint personal_scores_player_day_key unique (player_id, played_on);

alter table public.tournaments add column rule_version text not null default 'mvp-v1';
alter table public.tournament_participants add column eligible_from date;
update public.tournament_participants p set eligible_from = t.starts_at
from public.tournaments t where t.id = p.tournament_id;
alter table public.tournament_participants alter column eligible_from set not null;
-- Historical absence is meaningful only after the owner's load is complete.
alter table public.tournaments add column history_ready boolean not null default false;

create table private.score_changes (
  id bigint generated always as identity primary key,
  score_id uuid not null, actor_id uuid, changed_at timestamptz not null default now(),
  old_data jsonb, new_data jsonb not null
);
-- No client policies: history is accessed only by the owner and trusted triggers.
alter table private.score_changes enable row level security;
create function private.log_score_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into private.score_changes(score_id, actor_id, old_data, new_data)
  values (new.id, auth.uid(), case when tg_op = 'UPDATE' then to_jsonb(old) end, to_jsonb(new));
  return new;
end $$;
create trigger score_change_log after insert or update on public.personal_scores
for each row execute function private.log_score_change();

-- Security-definer membership check avoids recursive tournament/member policies.
create function private.can_view_tournament(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.tournaments t where t.id = target and (
      t.organizer_id = auth.uid() or exists (
        select 1 from public.tournament_participants p
        where p.tournament_id = t.id and p.player_id = auth.uid()
      )
    )
  );
$$;
revoke all on function private.can_view_tournament(uuid) from public;
grant execute on function private.can_view_tournament(uuid) to authenticated;

drop policy "profiles are visible to authenticated users" on public.profiles;
create policy "read own profile" on public.profiles for select to authenticated using (id = auth.uid());
drop policy "players manage own scores" on public.personal_scores;
create policy "read own scores" on public.personal_scores for select to authenticated using (player_id = auth.uid());
-- Writes use validated RPCs only. Removing UI buttons alone is not authorization.
drop policy "participants view tournament" on public.tournaments;
drop policy "users create own tournaments" on public.tournaments;
drop policy "organizers manage own tournaments" on public.tournaments;
drop policy "organizers delete own tournaments" on public.tournaments;
create policy "read accessible tournament" on public.tournaments for select to authenticated
using (private.can_view_tournament(id));
drop policy "participants view memberships" on public.tournament_participants;
drop policy "organizers manage memberships" on public.tournament_participants;
create policy "read accessible memberships" on public.tournament_participants for select to authenticated
using (private.can_view_tournament(tournament_id));
drop policy "participants view exclusions" on public.tournament_excluded_dates;
drop policy "organizers manage exclusions" on public.tournament_excluded_dates;
create policy "read accessible exclusions" on public.tournament_excluded_dates for select to authenticated
using (private.can_view_tournament(tournament_id));
drop policy "participants view results" on public.tournament_score_results;
create policy "read accessible results" on public.tournament_score_results for select to authenticated
using (private.can_view_tournament(tournament_id));

-- Null score reference represents absence, not a fabricated personal score.
alter table public.tournament_score_results alter column personal_score_id drop not null;
alter table public.tournament_score_results add column played_on date;
update public.tournament_score_results r set played_on = s.played_on
from public.personal_scores s where s.id = r.personal_score_id;
alter table public.tournament_score_results alter column played_on set not null;
alter table public.tournament_score_results
  add column raw_score integer,
  add column result_kind text not null default 'score' check (result_kind in ('score', 'absence', 'pending')),
  add column provisional boolean not null default true,
  add column updated_at timestamptz not null default now(),
  add constraint tournament_player_day_key unique (tournament_id, player_id, played_on);

create table private.result_changes (
  id bigint generated always as identity primary key,
  result_id uuid not null, tournament_id uuid not null,
  changed_at timestamptz not null default now(), actor_id uuid,
  old_data jsonb, new_data jsonb not null
);
alter table private.result_changes enable row level security;
create function private.log_result_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into private.result_changes(result_id, tournament_id, actor_id, old_data, new_data)
  values (new.id, new.tournament_id, auth.uid(), case when tg_op = 'UPDATE' then to_jsonb(old) end, to_jsonb(new));
  return new;
end $$;
create trigger result_change_log after insert or update on public.tournament_score_results
for each row execute function private.log_result_change();

-- Internal date argument allows deterministic tests; never exposed as a public RPC.
create function private.calculate_tournament(target uuid, as_of date)
returns table(player_id uuid, played_on date, personal_score_id uuid, raw_score integer,
  applied_score integer, result_kind text, provisional boolean, rule_snapshot jsonb)
language sql stable set search_path = '' as $$
  with days as (
    select t.*, d::date as game_day from public.tournaments t
    cross join lateral pg_catalog.generate_series(t.starts_at::timestamp,
      least(t.ends_at, as_of)::timestamp, interval '1 day') d
    where t.id = target
      and (extract(isodow from d) between 1 and 5 or
        (t.weekly_schedule = 'monday_to_friday_and_sunday' and extract(isodow from d) = 7))
      and not exists (select 1 from public.tournament_excluded_dates e
        where e.tournament_id = t.id and e.excluded_date = d::date)
  ), inputs as (
    select p.player_id, d.*, s.id as score_id, s.score,
      min(s.score) filter (where s.score > 0) over (partition by d.game_day) as minimum
    from days d join public.tournament_participants p
      on p.tournament_id = d.id and p.eligible_from <= d.game_day
    left join public.personal_scores s on s.player_id = p.player_id and s.played_on = d.game_day
  )
  select i.player_id, i.game_day, i.score_id, i.score,
    case when i.score > 0 then
      case when i.scoring_mode = 'absolute' then i.score else i.score - i.minimum end
      when i.game_day < as_of and i.history_ready then i.absence_penalty else 0 end,
    case when i.score > 0 then 'score' when i.game_day < as_of and i.history_ready then 'absence' else 'pending' end,
    i.game_day = as_of or not i.history_ready,
    jsonb_build_object('version', i.rule_version, 'mode', i.scoring_mode,
      'absence_penalty', i.absence_penalty, 'timezone', i.timezone,
      'minimum_positive', i.minimum, 'weekly_schedule', i.weekly_schedule, 'history_ready', i.history_ready)
  from inputs i;
$$;

create function private.refresh_tournament(target uuid, as_of date) returns void
language plpgsql set search_path = '' as $$
begin
  -- Serializes refreshes, including those triggered by historical imports.
  perform 1 from public.tournaments where id = target for update;
  insert into public.tournament_score_results as existing
    (tournament_id, player_id, played_on, personal_score_id, raw_score, applied_score,
     result_kind, provisional, applied_rule_snapshot)
  select target, c.player_id, c.played_on, c.personal_score_id, c.raw_score,
    c.applied_score, c.result_kind, c.provisional, c.rule_snapshot
  from private.calculate_tournament(target, as_of) c
  on conflict (tournament_id, player_id, played_on) do update set
    personal_score_id = excluded.personal_score_id, raw_score = excluded.raw_score,
    applied_score = excluded.applied_score, result_kind = excluded.result_kind,
    provisional = excluded.provisional, applied_rule_snapshot = excluded.applied_rule_snapshot,
    updated_at = now()
  where (existing.personal_score_id, existing.raw_score, existing.applied_score,
    existing.result_kind, existing.provisional, existing.applied_rule_snapshot)
    is distinct from (excluded.personal_score_id, excluded.raw_score, excluded.applied_score,
    excluded.result_kind, excluded.provisional, excluded.applied_rule_snapshot);
end $$;

create function public.get_september_dashboard() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  target constant uuid := '20260900-0000-4000-8000-000000000001';
  tournament public.tournaments;
  today date;
begin
  if auth.uid() is null then raise exception 'authentication_required' using errcode = '42501'; end if;
  if not private.can_view_tournament(target) then return jsonb_build_object('access', false); end if;
  select * into tournament from public.tournaments where id = target;
  today := (now() at time zone tournament.timezone)::date;
  perform private.refresh_tournament(target, today);
  return jsonb_build_object('access', true, 'today', today, 'tournament', to_jsonb(tournament),
    'participants', coalesce((select jsonb_agg(jsonb_build_object('id', p.player_id,
      'name', coalesce(nullif(pr.display_name, ''), 'Jogador'), 'eligible_from', p.eligible_from)
      order by pr.display_name, p.player_id)
      from public.tournament_participants p join public.profiles pr on pr.id = p.player_id
      where p.tournament_id = target), '[]'::jsonb),
    'excluded_dates', coalesce((select jsonb_agg(e.excluded_date) from public.tournament_excluded_dates e
      where e.tournament_id = target), '[]'::jsonb),
    'results', coalesce((select jsonb_agg(to_jsonb(r) order by r.played_on desc, r.player_id)
      from public.tournament_score_results r where r.tournament_id = target), '[]'::jsonb));
end $$;
revoke all on function public.get_september_dashboard() from public, anon;
grant execute on function public.get_september_dashboard() to authenticated;

-- Only the database owner/SQL Editor can provision and load history.
create function private.provision_september(organizer uuid) returns uuid
language plpgsql set search_path = '' as $$
declare target constant uuid := '20260900-0000-4000-8000-000000000001';
begin
  if not exists (select 1 from public.profiles where id = organizer) then
    raise exception 'Organizador deve possuir conta cadastrada';
  end if;
  insert into public.tournaments(id, organizer_id, name, starts_at, ends_at, timezone,
    scoring_mode, absence_penalty, weekly_schedule, rule_version)
  values (target, organizer, 'GeoGuaras — Setembro 2026', '2026-09-01', '2026-09-30',
    'America/Sao_Paulo', 'relative_to_lowest', -2500, 'monday_to_friday', 'mvp-v1')
  on conflict (id) do nothing;
  if exists (select 1 from public.tournaments where id = target and organizer_id <> organizer) then
    raise exception 'Torneio existente possui outro organizador';
  end if;
  insert into public.tournament_excluded_dates(tournament_id, excluded_date, reason)
  values (target, '2026-09-07', 'Feriado — exclusão definida pelo Dono do produto')
  on conflict (tournament_id, excluded_date) do nothing;
  return target;
end $$;

revoke all on all functions in schema private from public, anon, authenticated;
revoke all on all tables in schema private from public, anon, authenticated;
grant execute on function private.can_view_tournament(uuid) to authenticated;
commit;
