-- S7: separate personal requests from organizer notifications. No business rows changed.
begin;
set local lock_timeout='10s';
create function private.list_score_changes(page_number integer, audience text) returns jsonb
language plpgsql stable set search_path='' as $$
declare result jsonb;
begin
 if auth.uid() is null then raise exception 'authentication_required' using errcode='42501'; end if;
 if audience not in('personal','managed') or audience is null then raise exception 'invalid_audience'; end if;
 if audience='managed' and not exists(select 1 from public.tournaments where organizer_id=auth.uid()) then raise exception 'organizer_required' using errcode='42501'; end if;
 if page_number is null or page_number not between 0 and 100000 then raise exception 'invalid_page'; end if;
 with visible as (
  select c.*, (audience='managed' and exists(select 1 from private.score_change_decisions nd join public.tournaments nt on nt.id=nd.tournament_id where nd.change_id=c.id and nd.status='pending' and nt.organizer_id=auth.uid())) needs_review from private.retroactive_score_changes c where (audience='personal' and c.player_id=auth.uid()) or (audience='managed' and exists(
   select 1 from private.score_change_decisions d join public.tournaments t on t.id=d.tournament_id
   where d.change_id=c.id and t.organizer_id=auth.uid()))
  order by needs_review desc,c.requested_at desc,c.id desc limit 51 offset page_number*50
 ), page as (select * from visible order by needs_review desc,requested_at desc,id desc limit 50)
 select jsonb_build_object('has_more',(select count(*)>50 from visible),'changes',coalesce((select jsonb_agg(
  jsonb_build_object('id',c.id,'player_id',c.player_id,'player_name',private.visible_player_name(p),'played_on',c.played_on,
   'old_score',c.old_score,'new_score',c.new_score,'reason',c.reason,'requested_at',c.requested_at,
   'decisions',coalesce((select jsonb_agg(jsonb_build_object('id',d.id,'tournament_id',t.id,'tournament_name',t.name,
    'old_score',d.old_score,'status',d.status,'decided_at',d.decided_at,'decided_by_name',case when dp.id is not null then private.visible_player_name(dp) end,
    'can_review',audience='managed' and d.status='pending' and t.closed_at is null and t.organizer_id=auth.uid(),
    'audit_blocked',exists(select 1 from private.score_audits a where a.tournament_id=t.id and a.player_id=c.player_id
      and a.played_on=c.played_on and a.status in('requested','open')))
    order by t.name,t.id) from private.score_change_decisions d join public.tournaments t on t.id=d.tournament_id
    left join public.profiles dp on dp.id=d.decided_by where d.change_id=c.id and ((audience='personal' and c.player_id=auth.uid()) or (audience='managed' and t.organizer_id=auth.uid()))),'[]'))
    order by c.needs_review desc,c.requested_at desc,c.id desc) from page c join public.profiles p on p.id=c.player_id),'[]')) into result;
 return result;
end $$;


create or replace function public.get_score_audits(target uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not private.can_view_tournament(target) then raise exception 'audit_not_allowed' using errcode='42501'; end if;
 return jsonb_build_object('server_now',clock_timestamp(),
  'organizer',(select organizer_id=auth.uid() from public.tournaments where id=target),
  'participant',exists(select 1 from public.tournament_participants where tournament_id=target and player_id=auth.uid()),
  'audits',coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'personal_score_id',a.personal_score_id,'player_id',a.player_id,
   'played_on',a.played_on,'raw_score',a.raw_score,'reason',a.reason,'status',a.status,'requested_at',a.requested_at,'requested_by_me',a.requester_id=auth.uid(),
   'opened_at',a.opened_at,'deadline',a.deadline,'resolved_at',a.resolved_at,'resolution_reason',a.resolution_reason,
   'punishment',a.punishment,'penalty',a.penalty,'penalty_rule',a.penalty_rule,
   'invalid_votes',a.invalid_votes,'maintain_votes',a.maintain_votes,
   'before_results',a.before_results,'after_results',a.after_results,
   'my_vote',(select choice from private.audit_votes v where v.audit_id=a.id and v.player_id=auth.uid()),
   'can_vote',a.status='open' and clock_timestamp()<a.deadline
    and exists(select 1 from private.audit_electors e where e.audit_id=a.id and e.player_id=auth.uid())
    and exists(select 1 from public.tournament_participants p where p.tournament_id=target and p.player_id=auth.uid()))
   order by a.requested_at desc,a.id) from private.score_audits a where tournament_id=target),'[]'));
end $$;

create function public.get_personal_score_changes(page_number integer default 0) returns jsonb
language sql stable security definer set search_path='' as $$
 select private.list_score_changes(page_number,'personal');
$$;
create function public.get_managed_score_changes(page_number integer default 0) returns jsonb
language sql stable security definer set search_path='' as $$
 select private.list_score_changes(page_number,'managed');
$$;

-- Derived notifications: no read/dismiss flag can hide an unresolved task or active vote.
create function public.get_tournament_notifications() returns jsonb
language plpgsql security definer set search_path='' as $$
declare observed_at timestamptz:=clock_timestamp();
begin
 if auth.uid() is null then raise exception 'authentication_required' using errcode='42501'; end if;
 return jsonb_build_object('server_now',observed_at,
  'is_organizer',exists(select 1 from public.tournaments where organizer_id=auth.uid()),
  'pending_days',(select count(distinct c.played_on) from private.retroactive_score_changes c
   join private.score_change_decisions d on d.change_id=c.id where c.player_id=auth.uid() and d.status='pending'),
  'request_tournaments',coalesce((select jsonb_agg(jsonb_build_object('id',t.id,'name',t.name,'closed_at',t.closed_at) order by t.closed_at nulls first,t.starts_at desc,t.id)
   from public.tournaments t join public.tournament_participants p on p.tournament_id=t.id where p.player_id=auth.uid()),'[]'),
  'managed_tournaments',coalesce((select jsonb_agg(jsonb_build_object('id',t.id,'name',t.name,'closed_at',t.closed_at,
   'corrections_pending',(select count(*) from private.score_change_decisions d where d.tournament_id=t.id and d.status='pending' and t.closed_at is null),
   'audits_requested',(select count(*) from private.score_audits a where a.tournament_id=t.id and a.status='requested' and t.closed_at is null),
   'audits_open',(select count(*) from private.score_audits a where a.tournament_id=t.id and a.status='open' and a.deadline>observed_at and t.closed_at is null),
   'audits_ready',(select count(*) from private.score_audits a where a.tournament_id=t.id and a.status='open' and a.deadline<=observed_at and t.closed_at is null))
   order by t.closed_at nulls first,t.starts_at desc,t.id) from public.tournaments t where t.organizer_id=auth.uid()),'[]'),
  'open_votings',coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'tournament_id',t.id,'tournament_name',t.name,
   'played_on',a.played_on,'deadline',a.deadline,
   'can_vote',exists(select 1 from private.audit_electors e where e.audit_id=a.id and e.player_id=auth.uid()),
   'has_voted',exists(select 1 from private.audit_votes v where v.audit_id=a.id and v.player_id=auth.uid()))
   order by a.deadline,a.id) from private.score_audits a join public.tournaments t on t.id=a.tournament_id
   join public.tournament_participants p on p.tournament_id=t.id and p.player_id=auth.uid()
   where t.closed_at is null and a.status='open' and a.deadline>observed_at),'[]'));
end $$;

revoke all on function private.list_score_changes(integer,text) from public,anon,authenticated;
revoke all on function public.get_personal_score_changes(integer),public.get_managed_score_changes(integer),public.get_tournament_notifications() from public,anon;
grant execute on function public.get_personal_score_changes(integer),public.get_managed_score_changes(integer),public.get_tournament_notifications() to authenticated;
-- Existing mixed RPC retained only for compatibility during publication; new screens use scoped RPCs.
commit;