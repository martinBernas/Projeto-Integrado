begin;

alter table public.tournaments add column closed_at timestamptz;
create table private.tournament_changes (
  id bigint generated always as identity primary key,
  tournament_id uuid not null, actor_id uuid, changed_at timestamptz not null default now(),
  old_data jsonb, new_data jsonb not null
);
alter table private.tournament_changes enable row level security;
revoke all on private.tournament_changes from public, anon, authenticated;
create function private.log_tournament_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into private.tournament_changes(tournament_id, actor_id, old_data, new_data)
  values(new.id, auth.uid(), case when tg_op = 'UPDATE' then to_jsonb(old) end, to_jsonb(new));
  return new;
end $$;
revoke all on function private.log_tournament_change() from public, anon, authenticated;
create trigger tournament_change_log after insert or update on public.tournaments
for each row execute function private.log_tournament_change();

create function public.create_tournament(tournament_name text, start_day date, end_day date) returns uuid
language plpgsql security definer set search_path = '' as $$
declare target uuid;
begin
  if auth.uid() is null then raise exception 'authentication_required' using errcode = '42501'; end if;
  if tournament_name is null or char_length(trim(tournament_name)) not between 3 and 100 then
    raise exception 'invalid_name' using errcode = '22023';
  end if;
  if start_day is null or end_day is null or not isfinite(start_day) or not isfinite(end_day)
    or start_day < date '0001-01-01' or end_day > date '9999-12-31' or end_day < start_day then
    raise exception 'invalid_period' using errcode = '22023';
  end if;
  insert into public.tournaments(organizer_id, name, starts_at, ends_at, timezone,
    scoring_mode, absence_penalty, weekly_schedule, rule_version, history_ready)
  values(auth.uid(), trim(tournament_name), start_day, end_day, 'America/Sao_Paulo',
    'relative_to_lowest', -2500, 'monday_to_friday', 'mvp-v1', false)
  returning id into target;
  return target;
end $$;

create function public.update_tournament(target uuid, tournament_name text, start_day date, end_day date) returns void
language plpgsql security definer set search_path = '' as $$
declare current_tournament public.tournaments;
begin
  if auth.uid() is null then raise exception 'authentication_required' using errcode = '42501'; end if;
  select * into current_tournament from public.tournaments where id = target and organizer_id = auth.uid() for update;
  if not found then raise exception 'tournament_not_allowed' using errcode = '42501'; end if;
  if current_tournament.closed_at is not null then raise exception 'tournament_closed'; end if;
  if tournament_name is null or char_length(trim(tournament_name)) not between 3 and 100 then raise exception 'invalid_name'; end if;
  if start_day is null or end_day is null or not isfinite(start_day) or not isfinite(end_day)
    or start_day < date '0001-01-01' or end_day > date '9999-12-31' or end_day < start_day then raise exception 'invalid_period'; end if;
  if (start_day, end_day) is distinct from (current_tournament.starts_at, current_tournament.ends_at) then
    if exists(select 1 from public.tournament_participants where tournament_id = target)
      or exists(select 1 from public.tournament_score_results where tournament_id = target)
      or exists(select 1 from public.tournament_excluded_dates where tournament_id = target) then
      raise exception 'period_locked';
    end if;
  end if;
  update public.tournaments set name = trim(tournament_name), starts_at = start_day, ends_at = end_day
  where id = target and (name, starts_at, ends_at) is distinct from (trim(tournament_name), start_day, end_day);
end $$;

-- Preserve the existing calculation and serialize the closed-state check with all refreshes.
alter function private.refresh_tournament(uuid, date) rename to refresh_open_tournament;
create function private.refresh_tournament(target uuid, as_of date) returns void
language plpgsql set search_path = '' as $$
declare closed timestamptz;
begin
  select closed_at into closed from public.tournaments where id = target for update;
  if not found or closed is not null then return; end if;
  perform private.refresh_open_tournament(target, as_of);
end $$;
revoke all on function private.refresh_tournament(uuid, date) from public, anon, authenticated;

create function public.close_tournament(target uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare current_tournament public.tournaments; today date;
begin
  if auth.uid() is null then raise exception 'authentication_required' using errcode = '42501'; end if;
  select * into current_tournament from public.tournaments where id = target and organizer_id = auth.uid() for update;
  if not found then raise exception 'tournament_not_allowed' using errcode = '42501'; end if;
  if current_tournament.closed_at is not null then return; end if;
  today := (now() at time zone current_tournament.timezone)::date;
  if today <= current_tournament.ends_at then raise exception 'tournament_not_finished'; end if;
  if not current_tournament.history_ready and exists(select 1 from public.tournament_participants where tournament_id = target) then
    raise exception 'history_not_ready';
  end if;
  perform private.refresh_tournament(target, today);
  update public.tournaments set closed_at = now() where id = target;
end $$;

revoke all on function public.create_tournament(text, date, date) from public, anon;
revoke all on function public.update_tournament(uuid, text, date, date) from public, anon;
revoke all on function public.close_tournament(uuid) from public, anon;
grant execute on function public.create_tournament(text, date, date) to authenticated;
grant execute on function public.update_tournament(uuid, text, date, date) to authenticated;
grant execute on function public.close_tournament(uuid) to authenticated;
commit;
