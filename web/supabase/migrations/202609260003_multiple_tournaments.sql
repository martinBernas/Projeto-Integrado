begin;

create function public.get_tournament_dashboard(target uuid) returns jsonb
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
      'name', coalesce(nullif(pr.display_name, ''), 'Jogador'), 'eligible_from', p.eligible_from)
      order by pr.display_name, p.player_id)
      from public.tournament_participants p join public.profiles pr on pr.id = p.player_id
      where p.tournament_id = target), '[]'::jsonb),
    'excluded_dates', coalesce((select jsonb_agg(e.excluded_date) from public.tournament_excluded_dates e
      where e.tournament_id = target), '[]'::jsonb),
    'results', coalesce((select jsonb_agg(to_jsonb(r) order by r.played_on desc, r.player_id)
      from public.tournament_score_results r where r.tournament_id = target), '[]'::jsonb));
end $$;
revoke all on function public.get_tournament_dashboard(uuid) from public, anon;
grant execute on function public.get_tournament_dashboard(uuid) to authenticated;


-- Compatibility for already published clients.
create or replace function public.get_september_dashboard() returns jsonb
language sql security invoker set search_path = '' as $$
  select public.get_tournament_dashboard('20260900-0000-4000-8000-000000000001'::uuid);
$$;

commit;
