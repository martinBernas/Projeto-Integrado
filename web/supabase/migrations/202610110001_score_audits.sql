-- S6: apply once after S5, before publishing the dependent interface.
begin;
set local lock_timeout='10s';
lock table public.tournaments,public.personal_scores in share row exclusive mode;

create table private.score_audits (
 id uuid primary key default gen_random_uuid(), tournament_id uuid not null references public.tournaments(id) on delete cascade,
 personal_score_id uuid not null references public.personal_scores(id), player_id uuid not null,
 played_on date not null, raw_score integer not null, requester_id uuid not null,
 reason text not null check(char_length(trim(reason)) between 3 and 1000),
 requested_at timestamptz not null default now(),
 status text not null default 'requested' check(status in('requested','open','rejected','maintained','invalidated')),
 opened_at timestamptz, deadline timestamptz, opened_by uuid, resolved_at timestamptz, resolved_by uuid,
 resolution_reason text, punishment text check(punishment in('disregard','penalty')),
 invalid_votes integer, maintain_votes integer, penalty integer, penalty_rule jsonb,
 before_results jsonb, after_results jsonb,
 unique(tournament_id,personal_score_id)
);
create index score_audits_status on private.score_audits(tournament_id,status);
create table private.audit_electors (
 audit_id uuid not null references private.score_audits(id) on delete cascade,
 player_id uuid not null, primary key(audit_id,player_id)
);
create table private.audit_votes (
 audit_id uuid not null, player_id uuid not null,
 choice text not null check(choice in('invalidate','maintain')), voted_at timestamptz not null default now(),
 primary key(audit_id,player_id), foreign key(audit_id,player_id) references private.audit_electors(audit_id,player_id)
);
create table private.audit_events (
 id bigint generated always as identity primary key, audit_id uuid not null references private.score_audits(id) on delete cascade,
 actor_id uuid, occurred_at timestamptz not null default now(), event text not null, data jsonb not null
);
alter table private.score_audits enable row level security;
alter table private.audit_electors enable row level security;
alter table private.audit_votes enable row level security;
alter table private.audit_events enable row level security;
revoke all on private.score_audits,private.audit_electors,private.audit_votes,private.audit_events from public,anon,authenticated;

create function public.request_score_audit(target uuid, score_id uuid, justification text) returns uuid
language plpgsql security definer set search_path='' as $$
declare t public.tournaments; s public.personal_scores; result uuid;
begin
 if auth.uid() is null then raise exception 'authentication_required'; end if;
 select * into t from public.tournaments where id=target for update;
 if not found or not exists(select 1 from public.tournament_participants where tournament_id=target and player_id=auth.uid()) then
  raise exception 'audit_not_allowed' using errcode='42501'; end if;
 if t.closed_at is not null then raise exception 'tournament_closed'; end if;
 if justification is null or char_length(trim(justification)) not between 3 and 1000 then raise exception 'invalid_audit_reason'; end if;
 select * into s from public.personal_scores where id=score_id;
 if not found or s.score<=0 or not exists(select 1 from private.calculate_tournament(target,(now() at time zone 'America/Sao_Paulo')::date) c
   where c.personal_score_id=score_id and c.result_kind='score') then raise exception 'audit_score_unavailable'; end if;
 if exists(select 1 from private.score_audits where tournament_id=target and personal_score_id=score_id) then raise exception 'audit_exists'; end if;
 insert into private.score_audits(tournament_id,personal_score_id,player_id,played_on,raw_score,requester_id,reason)
 values(target,score_id,s.player_id,s.played_on,s.score,auth.uid(),trim(justification)) returning id into result;
 insert into private.audit_events(audit_id,actor_id,event,data) values(result,auth.uid(),'requested',jsonb_build_object('reason',trim(justification),'raw_score',s.score));
 return result;
end $$;

create function private.require_audit(audit uuid, organizer boolean default false) returns private.score_audits
language plpgsql set search_path='' as $$
declare a private.score_audits; t public.tournaments;
begin
 if auth.uid() is null then raise exception 'authentication_required'; end if;
 select * into a from private.score_audits where id=audit;
 if not found then raise exception 'audit_not_allowed' using errcode='42501'; end if;
 select * into t from public.tournaments where id=a.tournament_id for update;
 if not private.can_view_tournament(t.id) or (organizer and t.organizer_id<>auth.uid()) then raise exception 'audit_not_allowed' using errcode='42501'; end if;
 if t.closed_at is not null then raise exception 'tournament_closed'; end if;
 select * into a from private.score_audits where id=audit for update;
 return a;
end $$;

create function public.review_score_audit(audit uuid, approve boolean, explanation text default null) returns void
language plpgsql security definer set search_path='' as $$
declare a private.score_audits;
begin
 a:=private.require_audit(audit,true);
 if a.status<>'requested' then raise exception 'audit_state_changed'; end if;
 if approve is null then raise exception 'invalid_audit_review'; end if;
 if approve then
  if not exists(select 1 from private.calculate_tournament(a.tournament_id,(now() at time zone 'America/Sao_Paulo')::date) c
    where c.personal_score_id=a.personal_score_id and c.raw_score=a.raw_score and c.result_kind='score') then raise exception 'audit_score_unavailable'; end if;
  update private.score_audits set status='open',opened_at=clock_timestamp(),deadline=clock_timestamp()+interval '48 hours',opened_by=auth.uid() where id=audit;
  insert into private.audit_electors(audit_id,player_id)
   select audit,p.player_id from public.tournament_participants p where p.tournament_id=a.tournament_id and p.player_id<>a.player_id;
 else
  if explanation is null or char_length(trim(explanation)) not between 3 and 1000 then raise exception 'invalid_audit_reason'; end if;
  update private.score_audits set status='rejected',resolved_at=clock_timestamp(),resolved_by=auth.uid(),resolution_reason=trim(explanation) where id=audit;
 end if;
 insert into private.audit_events(audit_id,actor_id,event,data) values(audit,auth.uid(),case when approve then 'opened' else 'rejected' end,
  jsonb_build_object('explanation',explanation));
end $$;

create function public.vote_score_audit(audit uuid, selection text) returns void
language plpgsql security definer set search_path='' as $$
declare a private.score_audits;
begin
 a:=private.require_audit(audit);
 if a.status<>'open' or clock_timestamp()>=a.deadline then raise exception 'audit_voting_closed'; end if;
 if selection is null or selection not in('invalidate','maintain') then raise exception 'invalid_audit_vote'; end if;
 if not exists(select 1 from private.audit_electors where audit_id=audit and player_id=auth.uid())
   or not exists(select 1 from public.tournament_participants where tournament_id=a.tournament_id and player_id=auth.uid()) then
  raise exception 'audit_not_eligible' using errcode='42501'; end if;
 insert into private.audit_votes(audit_id,player_id,choice) values(audit,auth.uid(),selection)
 on conflict(audit_id,player_id) do update set choice=excluded.choice,voted_at=clock_timestamp();
 insert into private.audit_events(audit_id,actor_id,event,data) values(audit,auth.uid(),'voted',jsonb_build_object('choice',selection));
end $$;

create function public.resolve_score_audit(audit uuid, sanction text default null) returns void
language plpgsql security definer set search_path='' as $$
declare a private.score_audits; invalid integer; valid integer; rule jsonb; before_data jsonb; after_data jsonb; day date;
begin
 a:=private.require_audit(audit,true);
 -- Safe retries never apply a second punishment or change the original decision.
 if a.status in('maintained','invalidated') then return; end if;
 if a.status<>'open' or clock_timestamp()<a.deadline then raise exception 'audit_not_ready'; end if;
 select count(*) filter(where choice='invalidate'),count(*) filter(where choice='maintain') into invalid,valid
  from private.audit_votes where audit_id=audit;
 if invalid>valid and (sanction is null or sanction not in('disregard','penalty')) then raise exception 'audit_punishment_required'; end if;
 day:=(now() at time zone 'America/Sao_Paulo')::date;
 perform private.refresh_tournament(a.tournament_id,day);
 rule:=private.rule_on_day(a.tournament_id,a.played_on);
 select coalesce(jsonb_agg(to_jsonb(r) order by player_id),'[]') into before_data from public.tournament_score_results r
  where tournament_id=a.tournament_id and played_on=a.played_on;
 update private.score_audits set status=case when invalid>valid then 'invalidated' else 'maintained' end,
  invalid_votes=invalid,maintain_votes=valid,resolved_at=clock_timestamp(),resolved_by=auth.uid(),
  punishment=case when invalid>valid then sanction end,
  penalty=case when invalid>valid and sanction='penalty' then (rule->>'absence_penalty')::integer end,
  penalty_rule=rule,before_results=before_data where id=audit;
 perform private.refresh_tournament(a.tournament_id,day);
 select coalesce(jsonb_agg(to_jsonb(r) order by player_id),'[]') into after_data from public.tournament_score_results r
  where tournament_id=a.tournament_id and played_on=a.played_on;
 update private.score_audits set after_results=after_data where id=audit;
 insert into private.audit_events(audit_id,actor_id,event,data) values(audit,auth.uid(),'resolved',
  jsonb_build_object('invalid_votes',invalid,'maintain_votes',valid,'punishment',case when invalid>valid then sanction end));
end $$;

-- Reads expose only one's own vote; even the organizer never receives voter identities.
create function public.get_score_audits(target uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not private.can_view_tournament(target) then raise exception 'audit_not_allowed' using errcode='42501'; end if;
 return jsonb_build_object('server_now',clock_timestamp(),
  'organizer',(select organizer_id=auth.uid() from public.tournaments where id=target),
  'participant',exists(select 1 from public.tournament_participants where tournament_id=target and player_id=auth.uid()),
  'audits',coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'personal_score_id',a.personal_score_id,'player_id',a.player_id,
   'played_on',a.played_on,'raw_score',a.raw_score,'reason',a.reason,'status',a.status,'requested_at',a.requested_at,
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

-- Consistency guards reuse the same tournament lock as existing mutations.
create function private.guard_audit_tournament() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if (new.closed_at,new.starts_at,new.ends_at,new.scoring_mode,new.absence_penalty,new.weekly_schedule,new.rule_version)
  is distinct from (old.closed_at,old.starts_at,old.ends_at,old.scoring_mode,old.absence_penalty,old.weekly_schedule,old.rule_version)
  and exists(select 1 from private.score_audits where tournament_id=old.id and status in('requested','open')) then
  raise exception 'audit_pending'; end if;
 return new;
end $$;
create trigger audit_tournament_guard before update on public.tournaments for each row execute function private.guard_audit_tournament();

create function private.guard_audit_participant() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from private.score_audits where tournament_id=old.tournament_id and player_id=old.player_id and status in('requested','open')) then
  raise exception 'audit_pending'; end if;
 if tg_op='DELETE' then return old; end if;
 return new;
end $$;
create trigger audit_participant_guard before delete or update of eligible_from on public.tournament_participants
 for each row execute function private.guard_audit_participant();

-- Keep the value under evaluation stable; otherwise a correction could evade the
-- single-audit policy by cancelling the vote. Closed decisions remain tournament-local.
create function private.guard_pending_audit_score() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.score is distinct from old.score and exists(select 1 from private.score_audits
  where personal_score_id=old.id and status in('requested','open')) then raise exception 'audit_score_locked'; end if;
 return new;
end $$;
create trigger audit_score_change before update of score on public.personal_scores for each row execute function private.guard_pending_audit_score();

revoke all on function private.require_audit(uuid,boolean),private.guard_audit_tournament(),private.guard_audit_participant(),private.guard_pending_audit_score() from public,anon,authenticated;
revoke all on function public.request_score_audit(uuid,uuid,text),public.review_score_audit(uuid,boolean,text),public.vote_score_audit(uuid,text),public.resolve_score_audit(uuid,text),public.get_score_audits(uuid) from public,anon;
grant execute on function public.request_score_audit(uuid,uuid,text),public.review_score_audit(uuid,boolean,text),public.vote_score_audit(uuid,text),public.resolve_score_audit(uuid,text),public.get_score_audits(uuid) to authenticated;

alter table public.tournament_score_results drop constraint tournament_score_results_result_kind_check;
alter table public.tournament_score_results add constraint tournament_score_results_result_kind_check
 check(result_kind in('score','absence','pending','audit_disregarded','audit_penalty'));

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
  left join public.personal_scores s on s.player_id=p.player_id and s.played_on=d.game_day
  left join private.score_audits a on a.tournament_id=d.id and a.personal_score_id=s.id and a.status='invalidated'
 )
 select i.player_id,i.game_day,i.score_id,i.score,
  case when i.audit_id is not null then case when i.punishment='penalty' then i.penalty else 0 end
    when i.score>0 then case when i.rule->>'scoring_mode'='absolute' then i.score else i.score-i.minimum end
    when i.game_day<as_of and i.history_ready then (i.rule->>'absence_penalty')::integer else 0 end,
  case when i.audit_id is not null then case when i.punishment='penalty' then 'audit_penalty' else 'audit_disregarded' end
    when i.score>0 then 'score' when i.game_day<as_of and i.history_ready then 'absence' else 'pending' end,
  i.game_day=as_of or not i.history_ready,
  jsonb_build_object('version',i.rule->>'version','mode',i.rule->>'scoring_mode',
    'absence_penalty',(i.rule->>'absence_penalty')::integer,'timezone','America/Sao_Paulo',
    'minimum_positive',i.minimum,'weekly_schedule',i.rule->>'weekly_schedule','history_ready',i.history_ready)
   || case when i.audit_id is null then '{}'::jsonb else jsonb_build_object('audit_id',i.audit_id,
      'audit_punishment',i.punishment,'audit_penalty',i.penalty,'audit_penalty_rule',i.penalty_rule) end
 from inputs i;
$$;

-- Include decisions in preview tokens, even when their contribution is already zero.
alter function private.rule_preview(uuid,jsonb) rename to rule_preview_before_audits;
create function private.rule_preview(target uuid,proposal jsonb) returns jsonb
language plpgsql set search_path='' as $$
declare result jsonb; decisions jsonb;
begin
 result:=private.rule_preview_before_audits(target,proposal);
 select coalesce(jsonb_agg(to_jsonb(a) order by id),'[]') into decisions from private.score_audits a where tournament_id=target;
 return result || jsonb_build_object('token',md5((result->>'token')||decisions::text));
end $$;
revoke all on function private.rule_preview_before_audits(uuid,jsonb),private.rule_preview(uuid,jsonb) from public,anon,authenticated;

-- Existing SQL/PLpgSQL wrappers must resolve the new preview by name.
create or replace function public.preview_tournament_rules(target uuid,proposal jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
begin return private.rule_preview(target,proposal); end $$;
commit;
