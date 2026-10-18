-- S7-01. Apply after backup/verification; no existing business rows are rewritten.
begin;
set local lock_timeout='10s';
lock table public.tournaments, public.personal_scores in share row exclusive mode;

create table private.retroactive_score_changes (
 id uuid primary key default gen_random_uuid(), player_id uuid not null references public.profiles(id),
 personal_score_id uuid not null references public.personal_scores(id), played_on date not null,
 old_score integer, new_score integer not null check(new_score between 0 and 25000),
 reason text not null check(char_length(trim(reason)) between 3 and 1000),
 requested_at timestamptz not null default clock_timestamp()
);
create index score_changes_player_day on private.retroactive_score_changes(player_id,played_on);
create table private.score_change_decisions (
 id uuid primary key default gen_random_uuid(), change_id uuid not null references private.retroactive_score_changes(id),
 tournament_id uuid not null references public.tournaments(id), old_score integer,
 status text not null default 'pending' check(status in('pending','approved','rejected')),
 decided_at timestamptz, decided_by uuid references public.profiles(id),
 unique(change_id,tournament_id),
 check((status='pending' and decided_at is null and decided_by is null)
    or (status<>'pending' and decided_at is not null and decided_by is not null))
);
create index score_change_pending on private.score_change_decisions(tournament_id) where status='pending';
-- An explicit NULL is an accepted absence, distinct from having no override.
create table private.tournament_score_inputs (
 tournament_id uuid not null references public.tournaments(id), player_id uuid not null references public.profiles(id),
 played_on date not null, personal_score_id uuid references public.personal_scores(id),
 raw_score integer check(raw_score between 0 and 25000),
 primary key(tournament_id,player_id,played_on)
);
alter table private.retroactive_score_changes enable row level security;
alter table private.score_change_decisions enable row level security;
alter table private.tournament_score_inputs enable row level security;
revoke all on private.retroactive_score_changes,private.score_change_decisions,private.tournament_score_inputs from public,anon,authenticated;

create function public.submit_retroactive_score(game_day date, raw_score integer, justification text) returns uuid
language plpgsql security definer set search_path='' as $$
declare player uuid:=auth.uid(); today date:=(now() at time zone 'America/Sao_Paulo')::date;
 score_id uuid; previous integer; change_id uuid; t record;
begin
 if player is null then raise exception 'authentication_required' using errcode='42501'; end if;
 if game_day is null or not isfinite(game_day) or game_day<date '0001-01-01' or game_day>=today then raise exception 'past_day_required'; end if;
 if raw_score is null or raw_score not between 0 and 25000 then raise exception 'invalid_score'; end if;
 if justification is null or char_length(trim(justification)) not between 3 and 1000 then raise exception 'invalid_change_reason'; end if;
 -- Also serializes players without memberships. Review never takes this lock.
 perform pg_advisory_xact_lock(hashtextextended(player::text||':'||game_day::text,7101));
 -- Same ascending tournament-before-score order as ordinary score submission.
 -- Lock all open tournaments to stabilize membership/calendar and closing races.
 perform 1 from public.tournaments where closed_at is null order by id for update;
 if exists(select 1 from private.retroactive_score_changes c join private.score_change_decisions d on d.change_id=c.id
   where c.player_id=player and c.played_on=game_day and d.status='pending') then raise exception 'score_change_pending'; end if;
 select id,score into score_id,previous from public.personal_scores where player_id=player and played_on=game_day for update;
 if previous is not distinct from raw_score then raise exception 'score_unchanged'; end if;
 -- Capture tournament-effective values BEFORE updating the shared personal score.
 for t in select tr.id from public.tournaments tr join public.tournament_participants p on p.tournament_id=tr.id
   where tr.closed_at is null and p.player_id=player and p.eligible_from<=game_day
   and game_day between tr.starts_at and tr.ends_at
   and exists(select 1 from private.calculate_tournament(tr.id,today) c where c.player_id=player and c.played_on=game_day)
 loop
  insert into private.tournament_score_inputs(tournament_id,player_id,played_on,personal_score_id,raw_score)
   select t.id,player,game_day,c.personal_score_id,c.raw_score from private.calculate_tournament(t.id,today) c
   where c.player_id=player and c.played_on=game_day
   on conflict(tournament_id,player_id,played_on) do nothing;
 end loop;
 insert into public.personal_scores as s(player_id,occurred_at,score,source)
 values(player,(game_day+time '12:00') at time zone 'America/Sao_Paulo',raw_score,'player')
 on conflict(player_id,played_on) do update set score=excluded.score,source='player',updated_at=now()
 returning id into score_id;
 insert into private.retroactive_score_changes(player_id,personal_score_id,played_on,old_score,new_score,reason)
 values(player,score_id,game_day,previous,raw_score,trim(justification)) returning id into change_id;
 insert into private.score_change_decisions(change_id,tournament_id,old_score)
 select change_id,tr.id,i.raw_score from public.tournaments tr
 join public.tournament_participants p on p.tournament_id=tr.id and p.player_id=player and p.eligible_from<=game_day
 join private.tournament_score_inputs i on i.tournament_id=tr.id and i.player_id=player and i.played_on=game_day
 where tr.closed_at is null and game_day between tr.starts_at and tr.ends_at
 and exists(select 1 from private.calculate_tournament(tr.id,today) c where c.player_id=player and c.played_on=game_day);
 return change_id;
end $$;

create function public.review_score_change(decision uuid, approve boolean) returns void
language plpgsql security definer set search_path='' as $$
declare d private.score_change_decisions; c private.retroactive_score_changes; t public.tournaments;
begin
 if auth.uid() is null then raise exception 'authentication_required' using errcode='42501'; end if;
 select * into d from private.score_change_decisions where id=decision;
 if not found then raise exception 'change_not_allowed' using errcode='42501'; end if;
 select * into t from public.tournaments where id=d.tournament_id for update;
 if t.organizer_id<>auth.uid() then raise exception 'change_not_allowed' using errcode='42501'; end if;
 if t.closed_at is not null then raise exception 'tournament_closed'; end if;
 if approve is null then raise exception 'invalid_change_review'; end if;
 select * into d from private.score_change_decisions where id=decision for update;
 -- Identical retry is harmless; an opposite decision cannot replace the original.
 if d.status=(case when approve then 'approved' else 'rejected' end) then return; end if;
 if d.status<>'pending' then raise exception 'change_already_decided'; end if;
 select * into c from private.retroactive_score_changes where id=d.change_id;
 if approve and exists(select 1 from private.score_audits a where a.tournament_id=t.id
   and a.player_id=c.player_id and a.played_on=c.played_on and a.status in('requested','open')) then raise exception 'audit_pending'; end if;
 if approve then
  update private.tournament_score_inputs set raw_score=c.new_score,personal_score_id=c.personal_score_id
   where tournament_id=t.id and player_id=c.player_id and played_on=c.played_on;
  if not found then raise exception 'change_input_missing'; end if;
 end if;
 update private.score_change_decisions set status=case when approve then 'approved' else 'rejected' end,
  decided_at=clock_timestamp(),decided_by=auth.uid() where id=decision;
 if approve then perform private.refresh_tournament(t.id,(now() at time zone 'America/Sao_Paulo')::date); end if;
end $$;

create function public.get_score_change_summary() returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'authentication_required' using errcode='42501'; end if;
 return jsonb_build_object('pending_approvals',(select count(*) from private.score_change_decisions d
  join public.tournaments t on t.id=d.tournament_id where t.organizer_id=auth.uid() and d.status='pending'),
  'pending_days',(select count(distinct c.played_on) from private.retroactive_score_changes c
   join private.score_change_decisions d on d.change_id=c.id where c.player_id=auth.uid() and d.status='pending'));
end $$;

create function public.get_score_changes(page_number integer default 0) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if auth.uid() is null then raise exception 'authentication_required' using errcode='42501'; end if;
 if page_number is null or page_number not between 0 and 100000 then raise exception 'invalid_page'; end if;
 with visible as (
  select c.* from private.retroactive_score_changes c where c.player_id=auth.uid() or exists(
   select 1 from private.score_change_decisions d join public.tournaments t on t.id=d.tournament_id
   where d.change_id=c.id and t.organizer_id=auth.uid())
  order by c.requested_at desc,c.id desc limit 51 offset page_number*50
 ), page as (select * from visible order by requested_at desc,id desc limit 50)
 select jsonb_build_object('has_more',(select count(*)>50 from visible),'changes',coalesce((select jsonb_agg(
  jsonb_build_object('id',c.id,'player_id',c.player_id,'player_name',private.visible_player_name(p),'played_on',c.played_on,
   'old_score',c.old_score,'new_score',c.new_score,'reason',c.reason,'requested_at',c.requested_at,
   'decisions',coalesce((select jsonb_agg(jsonb_build_object('id',d.id,'tournament_id',t.id,'tournament_name',t.name,
    'old_score',d.old_score,'status',d.status,'decided_at',d.decided_at,'decided_by_name',case when dp.id is not null then private.visible_player_name(dp) end,
    'can_review',d.status='pending' and t.closed_at is null and t.organizer_id=auth.uid(),
    'audit_blocked',exists(select 1 from private.score_audits a where a.tournament_id=t.id and a.player_id=c.player_id
      and a.played_on=c.played_on and a.status in('requested','open')))
    order by t.name,t.id) from private.score_change_decisions d join public.tournaments t on t.id=d.tournament_id
    left join public.profiles dp on dp.id=d.decided_by where d.change_id=c.id and (c.player_id=auth.uid() or t.organizer_id=auth.uid())),'[]'))
    order by c.requested_at desc,c.id desc) from page c join public.profiles p on p.id=c.player_id),'[]')) into result;
 return result;
end $$;

-- Current-day edits retain the audit guard; retroactive edits are isolated by tournament inputs.
create or replace function private.guard_pending_audit_score() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.score is distinct from old.score and old.played_on>=(now() at time zone 'America/Sao_Paulo')::date
  and exists(select 1 from private.score_audits where personal_score_id=old.id and status in('requested','open')) then
  raise exception 'audit_score_locked'; end if;
 return new;
end $$;

create function private.guard_pending_score_changes() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if tg_table_name='tournaments' then
  if (new.closed_at,new.starts_at,new.ends_at,new.scoring_mode,new.absence_penalty,new.weekly_schedule,new.rule_version)
   is distinct from (old.closed_at,old.starts_at,old.ends_at,old.scoring_mode,old.absence_penalty,old.weekly_schedule,old.rule_version)
   and exists(select 1 from private.score_change_decisions where tournament_id=old.id and status='pending') then
   raise exception 'score_change_pending'; end if;
 else
  if exists(select 1 from private.score_change_decisions d join private.retroactive_score_changes c on c.id=d.change_id
   where d.tournament_id=old.tournament_id and c.player_id=old.player_id and d.status='pending') then
   raise exception 'score_change_pending'; end if;
  if tg_op='DELETE' then return old; end if;
 end if;
 return new;
end $$;
create trigger pending_score_changes_tournament before update on public.tournaments for each row execute function private.guard_pending_score_changes();
create trigger pending_score_changes_participant before delete or update of eligible_from on public.tournament_participants
 for each row execute function private.guard_pending_score_changes();

revoke all on function private.guard_pending_score_changes() from public,anon,authenticated;
revoke all on function public.submit_retroactive_score(date,integer,text),public.review_score_change(uuid,boolean),
 public.get_score_change_summary(),public.get_score_changes(integer) from public,anon;
grant execute on function public.submit_retroactive_score(date,integer,text),public.review_score_change(uuid,boolean),
 public.get_score_change_summary(),public.get_score_changes(integer) to authenticated;

-- The calculation and audit request definitions follow below in this transaction.

create or replace function private.calculate_versioned_tournament(target uuid, as_of date, proposal jsonb default null)
returns table(player_id uuid,played_on date,personal_score_id uuid,raw_score integer,
 applied_score integer,result_kind text,provisional boolean,rule_snapshot jsonb)
language sql stable set search_path='' as $$
 with configured as (
  select t.*,d::date game_day,case when proposal is not null and d::date between
    (proposal->>'from')::date and (proposal->>'to')::date then
      jsonb_build_object('scoring_mode',proposal->>'mode','absence_penalty',proposal->'penalty',
        'weekly_schedule',proposal->>'schedule','exclusions',proposal->'exclusions','version','prévia')
    else private.rule_on_day(t.id,d::date) end rule
  from public.tournaments t cross join lateral generate_series(coalesce((proposal->>'from')::date,t.starts_at)::timestamp,
    least(coalesce((proposal->>'to')::date,t.ends_at),as_of)::timestamp,interval '1 day') d where t.id=target
 ), days as (
  select * from configured d where
    (d.rule->>'weekly_schedule'='every_day' or extract(isodow from d.game_day) between 1 and 5 or
      (d.rule->>'weekly_schedule'='monday_to_friday_and_sunday' and extract(isodow from d.game_day)=7))
    and not exists(select 1 from jsonb_array_elements(d.rule->'exclusions') e where (e->>'date')::date=d.game_day)
 ), inputs as (
  select p.player_id,d.*,s.id score_id,s.score,a.id audit_id,a.punishment,a.penalty,a.penalty_rule,
   min(s.score) filter(where s.score>0 and a.id is null) over(partition by d.game_day) minimum
  from days d join public.tournament_participants p on p.tournament_id=d.id and p.eligible_from<=d.game_day
  left join lateral (
   select case when i.tournament_id is not null then i.personal_score_id else ps.id end id,
    case when i.tournament_id is not null then i.raw_score else ps.score end score
   from (select 1) seed
   left join public.personal_scores ps on ps.player_id=p.player_id and ps.played_on=d.game_day
   left join private.tournament_score_inputs i on i.tournament_id=d.id and i.player_id=p.player_id and i.played_on=d.game_day
  ) s on true
  left join private.score_audits a on a.tournament_id=d.id and a.personal_score_id=s.id and a.status='invalidated'
 )
 select i.player_id,i.game_day,i.score_id,i.score,
  case when i.audit_id is not null then case when i.punishment='penalty' then i.penalty else 0 end
    when i.score>0 then case when i.rule->>'scoring_mode'='absolute' then i.score else i.score-i.minimum end
    when i.game_day<as_of then (i.rule->>'absence_penalty')::integer else 0 end,
  case when i.audit_id is not null then case when i.punishment='penalty' then 'audit_penalty' else 'audit_disregarded' end
    when i.score>0 then 'score' when i.game_day<as_of then 'absence' else 'pending' end,
  i.game_day=as_of,
  jsonb_build_object('version',i.rule->>'version','mode',i.rule->>'scoring_mode',
    'absence_penalty',(i.rule->>'absence_penalty')::integer,'timezone','America/Sao_Paulo',
    'minimum_positive',i.minimum,'weekly_schedule',i.rule->>'weekly_schedule')
   || case when i.audit_id is null then '{}'::jsonb else jsonb_build_object('audit_id',i.audit_id,
      'audit_punishment',i.punishment,'audit_penalty',i.penalty,'audit_penalty_rule',i.penalty_rule) end
 from inputs i;
$$;


create or replace function public.request_score_audit(target uuid, score_id uuid, justification text) returns uuid
language plpgsql security definer set search_path='' as $$
declare t public.tournaments; s public.personal_scores; result uuid; effective integer;
begin
 if auth.uid() is null then raise exception 'authentication_required'; end if;
 select * into t from public.tournaments where id=target for update;
 if not found or not exists(select 1 from public.tournament_participants where tournament_id=target and player_id=auth.uid()) then
  raise exception 'audit_not_allowed' using errcode='42501'; end if;
 if t.closed_at is not null then raise exception 'tournament_closed'; end if;
 if justification is null or char_length(trim(justification)) not between 3 and 1000 then raise exception 'invalid_audit_reason'; end if;
 select * into s from public.personal_scores where id=score_id;
 if not found or not exists(select 1 from private.calculate_tournament(target,(now() at time zone 'America/Sao_Paulo')::date) c
   where c.personal_score_id=score_id and c.raw_score>0 and c.result_kind='score') then raise exception 'audit_score_unavailable'; end if;
 if exists(select 1 from private.score_audits where tournament_id=target and personal_score_id=score_id) then raise exception 'audit_exists'; end if;
 select c.raw_score into effective from private.calculate_tournament(target,(now() at time zone 'America/Sao_Paulo')::date) c where c.personal_score_id=score_id;
 insert into private.score_audits(tournament_id,personal_score_id,player_id,played_on,raw_score,requester_id,reason)
 values(target,score_id,s.player_id,s.played_on,effective,auth.uid(),trim(justification)) returning id into result;
 insert into private.audit_events(audit_id,actor_id,event,data) values(result,auth.uid(),'requested',jsonb_build_object('reason',trim(justification),'raw_score',effective));
 return result;
end $$;


commit;
