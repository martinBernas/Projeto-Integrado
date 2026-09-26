begin;

create table private.participant_changes (
  id bigint generated always as identity primary key,
  tournament_id uuid not null, player_id uuid not null, actor_id uuid,
  changed_at timestamptz not null default now(), old_data jsonb, new_data jsonb
);
alter table private.participant_changes enable row level security;
revoke all on private.participant_changes from public, anon, authenticated;
create function private.log_participant_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into private.participant_changes(tournament_id,player_id,actor_id,old_data,new_data)
  values(coalesce(new.tournament_id,old.tournament_id),coalesce(new.player_id,old.player_id),auth.uid(),
    case when tg_op <> 'INSERT' then to_jsonb(old) end,
    case when tg_op <> 'DELETE' then to_jsonb(new) end);
  return coalesce(new,old);
end $$;
revoke all on function private.log_participant_change() from public, anon, authenticated;
create trigger participant_change_log after insert or update or delete on public.tournament_participants
for each row execute function private.log_participant_change();

create function private.log_removed_result() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into private.result_changes(result_id,tournament_id,actor_id,old_data,new_data)
  values(old.id,old.tournament_id,auth.uid(),to_jsonb(old),'null'::jsonb);
  return old;
end $$;
revoke all on function private.log_removed_result() from public, anon, authenticated;
create trigger result_removal_log after delete on public.tournament_score_results
for each row execute function private.log_removed_result();

-- Called only for an edited/removed membership. Ordinary dashboard reads keep
-- their existing behavior; applying this migration does not rewrite old results.
create function private.refresh_changed_participant(target uuid, changed_player uuid, as_of date) returns void
language plpgsql set search_path = '' as $$
declare closed timestamptz;
begin
  select closed_at into closed from public.tournaments where id=target for update;
  if not found or closed is not null then return; end if;
  delete from public.tournament_score_results r where r.tournament_id=target and r.player_id=changed_player
    and not exists(select 1 from public.tournament_participants p
      where p.tournament_id=target and p.player_id=r.player_id and p.eligible_from<=r.played_on);
  perform private.refresh_tournament(target,as_of);
end $$;
revoke all on function private.refresh_changed_participant(uuid,uuid,date) from public, anon, authenticated;

create function private.require_open_organized_tournament(target uuid) returns public.tournaments
language plpgsql set search_path = '' as $$
declare t public.tournaments;
begin
  if auth.uid() is null then raise exception 'authentication_required' using errcode='42501'; end if;
  select * into t from public.tournaments where id=target and organizer_id=auth.uid() for update;
  if not found then raise exception 'tournament_not_allowed' using errcode='42501'; end if;
  if t.closed_at is not null then raise exception 'tournament_closed'; end if;
  return t;
end $$;
revoke all on function private.require_open_organized_tournament(uuid) from public, anon, authenticated;

create function public.get_managed_participants(target uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'authentication_required' using errcode='42501'; end if;
  if not exists(select 1 from public.tournaments where id=target and organizer_id=auth.uid()) then
    raise exception 'tournament_not_allowed' using errcode='42501';
  end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id',p.player_id,
    'name',coalesce(nullif(pr.display_name,''),'Jogador'),'eligible_from',p.eligible_from)
    order by pr.display_name,p.player_id)
    from public.tournament_participants p join public.profiles pr on pr.id=p.player_id
    where p.tournament_id=target),'[]');
end $$;

create function public.list_participant_candidates(target uuid, search_term text default '', page_number integer default 0) returns jsonb
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
    select p.id,coalesce(nullif(p.display_name,''),'Jogador') as name,u.email
    from public.profiles p join auth.users u on u.id=p.id
    where not exists(select 1 from public.tournament_participants m where m.tournament_id=target and m.player_id=p.id)
      and (trim(search_term)='' or strpos(lower(coalesce(p.display_name,'')),lower(trim(search_term)))>0
        or strpos(lower(coalesce(u.email,'')),lower(trim(search_term)))>0)
    order by lower(coalesce(nullif(p.display_name,''),'Jogador')),p.id limit 26 offset (page_number*25)
  ), displayed as (select * from candidates order by lower(name),id limit 25)
  select jsonb_build_object('has_more',(select count(*)>25 from candidates),
    'users',coalesce((select jsonb_agg(to_jsonb(d) order by lower(d.name),d.id) from displayed d),'[]')) into result;
  return result;
end $$;

create function public.add_tournament_participant(target uuid, player uuid, eligible_day date) returns void
language plpgsql security definer set search_path = '' as $$
declare t public.tournaments;
begin
  t := private.require_open_organized_tournament(target);
  if eligible_day is null or eligible_day<t.starts_at or eligible_day>t.ends_at then raise exception 'invalid_eligibility'; end if;
  if not exists(select 1 from auth.users u join public.profiles p on p.id=u.id where u.id=player) then raise exception 'account_not_found'; end if;
  if exists(select 1 from public.tournament_participants where tournament_id=target and player_id=player) then
    raise exception 'participant_exists';
  end if;
  insert into public.tournament_participants(tournament_id,player_id,eligible_from) values(target,player,eligible_day);
  perform private.refresh_tournament(target,(now() at time zone t.timezone)::date);
end $$;

create function public.update_tournament_participant(target uuid, player uuid, eligible_day date) returns void
language plpgsql security definer set search_path = '' as $$
declare t public.tournaments; old_day date;
begin
  t := private.require_open_organized_tournament(target);
  if eligible_day is null or eligible_day<t.starts_at or eligible_day>t.ends_at then raise exception 'invalid_eligibility'; end if;
  select eligible_from into old_day from public.tournament_participants where tournament_id=target and player_id=player;
  if not found then raise exception 'participant_not_found'; end if;
  if old_day=eligible_day then return; end if;
  update public.tournament_participants set eligible_from=eligible_day where tournament_id=target and player_id=player;
  perform private.refresh_changed_participant(target,player,(now() at time zone t.timezone)::date);
end $$;

create function public.remove_tournament_participant(target uuid, player uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare t public.tournaments;
begin
  t := private.require_open_organized_tournament(target);
  delete from public.tournament_participants where tournament_id=target and player_id=player;
  if not found then return; end if;
  perform private.refresh_changed_participant(target,player,(now() at time zone t.timezone)::date);
end $$;

create function public.complete_tournament_history(target uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare t public.tournaments;
begin
  t := private.require_open_organized_tournament(target);
  if t.history_ready then return; end if;
  if not exists(select 1 from public.tournament_participants where tournament_id=target) then raise exception 'participants_required'; end if;
  update public.tournaments set history_ready=true where id=target;
  perform private.refresh_tournament(target,(now() at time zone t.timezone)::date);
end $$;

revoke all on function public.get_managed_participants(uuid) from public, anon;
revoke all on function public.list_participant_candidates(uuid,text,integer) from public, anon;
revoke all on function public.add_tournament_participant(uuid,uuid,date) from public, anon;
revoke all on function public.update_tournament_participant(uuid,uuid,date) from public, anon;
revoke all on function public.remove_tournament_participant(uuid,uuid) from public, anon;
revoke all on function public.complete_tournament_history(uuid) from public, anon;
grant execute on function public.get_managed_participants(uuid) to authenticated;
grant execute on function public.list_participant_candidates(uuid,text,integer) to authenticated;
grant execute on function public.add_tournament_participant(uuid,uuid,date) to authenticated;
grant execute on function public.update_tournament_participant(uuid,uuid,date) to authenticated;
grant execute on function public.remove_tournament_participant(uuid,uuid) to authenticated;
grant execute on function public.complete_tournament_history(uuid) to authenticated;
commit;
