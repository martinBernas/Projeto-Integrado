-- Filter organizer adjustments by tournament BEFORE pagination. No data changes.
begin;
create function public.get_tournament_score_changes(target uuid, page_number integer default 0) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if auth.uid() is null then raise exception 'authentication_required' using errcode='42501'; end if;
 if not exists(select 1 from public.tournaments where id=target and organizer_id=auth.uid()) then raise exception 'change_not_allowed' using errcode='42501'; end if;
 if page_number is null or page_number not between 0 and 100000 then raise exception 'invalid_page'; end if;
 with visible as (
  select c.*, (exists(select 1 from private.score_change_decisions nd join public.tournaments nt on nt.id=nd.tournament_id where nd.change_id=c.id and nd.status='pending' and nt.organizer_id=auth.uid() and nt.id=target)) needs_review from private.retroactive_score_changes c where (exists(
   select 1 from private.score_change_decisions d join public.tournaments t on t.id=d.tournament_id
   where d.change_id=c.id and t.organizer_id=auth.uid() and t.id=target))
  order by needs_review desc,c.requested_at desc,c.id desc limit 51 offset page_number*50
 ), page as (select * from visible order by needs_review desc,requested_at desc,id desc limit 50)
 select jsonb_build_object('has_more',(select count(*)>50 from visible),'changes',coalesce((select jsonb_agg(
  jsonb_build_object('id',c.id,'player_id',c.player_id,'player_name',private.visible_player_name(p),'played_on',c.played_on,
   'old_score',c.old_score,'new_score',c.new_score,'reason',c.reason,'requested_at',c.requested_at,
   'decisions',coalesce((select jsonb_agg(jsonb_build_object('id',d.id,'tournament_id',t.id,'tournament_name',t.name,
    'old_score',d.old_score,'status',d.status,'decided_at',d.decided_at,'decided_by_name',case when dp.id is not null then private.visible_player_name(dp) end,
    'can_review',d.status='pending' and t.closed_at is null and t.organizer_id=auth.uid() and t.id=target,
    'audit_blocked',exists(select 1 from private.score_audits a where a.tournament_id=t.id and a.player_id=c.player_id
      and a.played_on=c.played_on and a.status in('requested','open')))
    order by t.name,t.id) from private.score_change_decisions d join public.tournaments t on t.id=d.tournament_id
    left join public.profiles dp on dp.id=d.decided_by where d.change_id=c.id and ((t.organizer_id=auth.uid() and t.id=target))),'[]'))
    order by c.needs_review desc,c.requested_at desc,c.id desc) from page c join public.profiles p on p.id=c.player_id),'[]')) into result;
 return result;
end $$;



revoke all on function public.get_tournament_score_changes(uuid,integer) from public,anon;
grant execute on function public.get_tournament_score_changes(uuid,integer) to authenticated;
commit;
