begin;

-- Do not rename existing accounts or merge identities during migration.
create function private.clean_public_name(value text) returns text
language sql immutable set search_path = '' as $$
  select normalize(btrim(value, E' \t\n\r\f\013'), NFC);
$$;
create function private.public_name_key(value text) returns text
language sql immutable set search_path = '' as $$
  select lower(private.clean_public_name(value));
$$;
revoke all on function private.clean_public_name(text), private.public_name_key(text) from public, anon, authenticated;

lock table public.profiles in share row exclusive mode;
do $$ begin
  if exists(select 1 from public.profiles where nullif(private.public_name_key(display_name),'') is not null
    group by private.public_name_key(display_name) having count(*) > 1) then
    raise exception 'existing_public_name_conflicts: resolve collisions before applying this migration';
  end if;
end $$;

alter table public.profiles
  add column public_name_confirmed boolean not null default false,
  add column geoguessr_url text;
create unique index profiles_public_name_unique on public.profiles(private.public_name_key(display_name))
  where nullif(private.public_name_key(display_name),'') is not null;

create function private.validate_public_name(value text) returns text
language plpgsql immutable set search_path = '' as $$
declare cleaned text := private.clean_public_name(value);
begin
  if cleaned is null or char_length(cleaned) not between 1 and 80
    or cleaned ~ '[@[:cntrl:]]' then raise exception 'invalid_public_name'; end if;
  return cleaned;
end $$;
create function private.clean_geoguessr_url(value text) returns text
language plpgsql immutable set search_path = '' as $$
declare cleaned text := nullif(btrim(value),'');
begin
  if cleaned is null then return null; end if;
  if cleaned !~ '^https://(www\.)?geoguessr\.com/user/[A-Za-z0-9_-]{1,100}/?$' then
    raise exception 'invalid_geoguessr_url';
  end if;
  return regexp_replace(regexp_replace(cleaned,'^https://geoguessr\.com/','https://www.geoguessr.com/'),'/$','');
end $$;
revoke all on function private.validate_public_name(text), private.clean_geoguessr_url(text) from public, anon, authenticated;

-- No direct client writes can bypass validation or confirm an inherited name.
drop policy "users update own profile" on public.profiles;
drop policy "users insert own profile" on public.profiles;

create table private.profile_changes (
  id bigint generated always as identity primary key,
  profile_id uuid not null, actor_id uuid, changed_at timestamptz not null default now(),
  old_data jsonb, new_data jsonb not null
);
alter table private.profile_changes enable row level security;
revoke all on private.profile_changes from public, anon, authenticated;
create function private.log_profile_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' or (old.display_name,old.public_name_confirmed,old.geoguessr_url)
    is distinct from (new.display_name,new.public_name_confirmed,new.geoguessr_url) then
    insert into private.profile_changes(profile_id,actor_id,old_data,new_data)
    values(new.id,auth.uid(),case when tg_op='UPDATE' then to_jsonb(old) end,to_jsonb(new));
  end if;
  return new;
end $$;
revoke all on function private.log_profile_change() from public, anon, authenticated;
create trigger profile_change_log after insert or update on public.profiles
for each row execute function private.log_profile_change();

create function public.update_my_profile(public_name text, profile_url text default null) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'authentication_required' using errcode='42501'; end if;
  update public.profiles set display_name=private.validate_public_name(public_name),
    geoguessr_url=private.clean_geoguessr_url(profile_url),public_name_confirmed=true where id=auth.uid();
  if not found then raise exception 'profile_not_found'; end if;
exception when unique_violation then raise exception 'public_name_unavailable' using errcode='23505';
end $$;
revoke all on function public.update_my_profile(text,text) from public,anon;
grant execute on function public.update_my_profile(text,text) to authenticated;

-- Returns availability only, never an account identifier or e-mail.
create function public.is_public_name_available(public_name text) returns boolean
language plpgsql stable security definer set search_path = '' as $$
declare cleaned text := private.validate_public_name(public_name);
begin
  return not exists(select 1 from public.profiles where private.public_name_key(display_name)=private.public_name_key(cleaned));
end $$;
revoke all on function public.is_public_name_available(text) from public;
grant execute on function public.is_public_name_available(text) to anon,authenticated;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id,display_name,public_name_confirmed)
  values(new.id,private.validate_public_name(new.raw_user_meta_data->>'display_name'),true);
  return new;
exception when unique_violation then raise exception 'public_name_unavailable' using errcode='23505';
end $$;

create function private.visible_player_name(player public.profiles) returns text
language sql immutable set search_path = '' as $$
  select case when player.public_name_confirmed then player.display_name else 'Jogador ' || left(player.id::text,8) end;
$$;
revoke all on function private.visible_player_name(public.profiles) from public,anon,authenticated;

create or replace function public.get_tournament_dashboard(target uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  tournament public.tournaments;
  today date;
begin
  if auth.uid() is null then raise exception 'authentication_required' using errcode = '42501'; end if;
  if not private.can_view_tournament(target) then return jsonb_build_object('access', false); end if;
  select * into tournament from public.tournaments where id = target for update;
  if not found or not private.can_view_tournament(target) then return jsonb_build_object('access', false); end if;
  today := (now() at time zone tournament.timezone)::date;
  perform private.refresh_tournament(target, today);
  return jsonb_build_object('access', true, 'today', today, 'tournament', to_jsonb(tournament),
    'participants', coalesce((select jsonb_agg(jsonb_build_object('id', p.player_id,
      'name', private.visible_player_name(pr), 'eligible_from', p.eligible_from, 'geoguessr_url', pr.geoguessr_url)
      order by private.visible_player_name(pr), p.player_id)
      from public.tournament_participants p join public.profiles pr on pr.id = p.player_id
      where p.tournament_id = target), '[]'::jsonb),
    'excluded_dates', coalesce((select jsonb_agg(e.excluded_date) from public.tournament_excluded_dates e
      where e.tournament_id = target), '[]'::jsonb),
    'results', coalesce((select jsonb_agg(to_jsonb(r) order by r.played_on desc, r.player_id)
      from public.tournament_score_results r where r.tournament_id = target), '[]'::jsonb));
end $$;
revoke all on function public.get_tournament_dashboard(uuid) from public, anon;
grant execute on function public.get_tournament_dashboard(uuid) to authenticated;



create or replace function public.get_managed_participants(target uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'authentication_required' using errcode='42501'; end if;
  if not exists(select 1 from public.tournaments where id=target and organizer_id=auth.uid()) then
    raise exception 'tournament_not_allowed' using errcode='42501';
  end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id',p.player_id,
    'name',private.visible_player_name(pr),'eligible_from',p.eligible_from,'geoguessr_url',pr.geoguessr_url)
    order by private.visible_player_name(pr),p.player_id)
    from public.tournament_participants p join public.profiles pr on pr.id=p.player_id
    where p.tournament_id=target),'[]');
end $$;

create or replace function public.list_participant_candidates(target uuid, search_term text default '', page_number integer default 0) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare result jsonb;
begin
  if auth.uid() is null then raise exception 'authentication_required' using errcode='42501'; end if;
  if not exists(select 1 from public.tournaments where id=target and organizer_id=auth.uid()) then
    raise exception 'tournament_not_allowed' using errcode='42501';
  end if;
  if page_number is null or page_number<0 or page_number>100000 or search_term is null or length(search_term)>254 then
    raise exception 'invalid_search';
  end if;
  with candidates as (
    select p.id,private.visible_player_name(p) as name,u.email
    from public.profiles p join auth.users u on u.id=p.id
    where not exists(select 1 from public.tournament_participants m where m.tournament_id=target and m.player_id=p.id)
      and (trim(search_term)='' or strpos(lower(private.visible_player_name(p)),lower(trim(search_term)))>0
        or strpos(lower(coalesce(u.email,'')),lower(trim(search_term)))>0)
    order by lower(private.visible_player_name(p)),p.id limit 26 offset (page_number*25)
  ), displayed as (select * from candidates order by lower(name),id limit 25)
  select jsonb_build_object('has_more',(select count(*)>25 from candidates),
    'users',coalesce((select jsonb_agg(to_jsonb(d) order by lower(d.name),d.id) from displayed d),'[]')) into result;
  return result;
end $$;


create or replace function private.add_september_participant(player uuid, display_name text) returns void
language plpgsql set search_path = '' as $$
declare target constant uuid := '20260900-0000-4000-8000-000000000001';
begin
  perform 1 from public.tournaments where id = target for update;
  if not found then raise exception 'Provisione o torneio primeiro'; end if;
  if not exists (select 1 from public.profiles where id = player) then
    raise exception 'Jogador deve possuir conta cadastrada';
  end if;
  if display_name is null or length(trim(display_name)) not between 1 and 80 then
    raise exception 'Informe um nome de 1 a 80 caracteres';
  end if;
  -- Membership maintenance must not replace a name chosen by the account holder.
  insert into public.tournament_participants(tournament_id, player_id, eligible_from)
  values(target, player, '2026-09-01') on conflict (tournament_id, player_id) do nothing;
  if found then update public.tournaments set history_ready = false where id = target; end if;
end $$;


commit;
