begin;

-- Fail rather than silently converting an unexpected legacy timezone.
alter table public.tournaments add constraint tournament_fixed_timezone check (timezone = 'America/Sao_Paulo');

create table public.tournament_rule_versions (
  id bigint generated always as identity primary key,
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  effective_from date not null, effective_to date not null check(effective_to >= effective_from),
  scoring_mode public.scoring_mode not null,
  absence_penalty integer not null,
  weekly_schedule public.weekly_schedule not null,
  exclusions jsonb not null default '[]' check(jsonb_typeof(exclusions) = 'array'),
  version text not null, reason text not null,
  actor_id uuid, created_at timestamptz not null default now()
);
create index rule_versions_lookup on public.tournament_rule_versions(tournament_id,id desc);
alter table public.tournament_rule_versions enable row level security;
revoke all on public.tournament_rule_versions from public,anon,authenticated;
grant select on public.tournament_rule_versions to authenticated;
create policy "read accessible rule versions" on public.tournament_rule_versions for select to authenticated
using(private.can_view_tournament(tournament_id));

-- Baseline does not change any legacy result, snapshot, score or membership.
insert into public.tournament_rule_versions(tournament_id,effective_from,effective_to,scoring_mode,
  absence_penalty,weekly_schedule,exclusions,version,reason)
select t.id,t.starts_at,t.ends_at,t.scoring_mode,t.absence_penalty,t.weekly_schedule,
  coalesce((select jsonb_agg(jsonb_build_object('date',e.excluded_date,'reason',coalesce(e.reason,'Exclusão existente'))
    order by e.excluded_date) from public.tournament_excluded_dates e where e.tournament_id=t.id),'[]'),
  t.rule_version,'Referência migrada, sem alteração dos resultados'
from public.tournaments t;

create function private.initialize_tournament_rules() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if tg_op='INSERT' then
    insert into public.tournament_rule_versions(tournament_id,effective_from,effective_to,scoring_mode,
      absence_penalty,weekly_schedule,version,reason,actor_id)
    values(new.id,new.starts_at,new.ends_at,new.scoring_mode,new.absence_penalty,new.weekly_schedule,
      new.rule_version,'Configuração inicial',auth.uid());
  elsif (new.starts_at,new.ends_at) is distinct from (old.starts_at,old.ends_at) then
    -- Existing period-edit RPC allows this only before participants/results/exclusions.
    if (select count(*) from public.tournament_rule_versions where tournament_id=new.id)<>1 then
      raise exception 'period_locked';
    end if;
    update public.tournament_rule_versions set effective_from=new.starts_at,effective_to=new.ends_at
      where tournament_id=new.id;
  end if;
  return new;
end $$;
create trigger initialize_tournament_rules after insert or update of starts_at,ends_at on public.tournaments
for each row execute function private.initialize_tournament_rules();
revoke all on function private.initialize_tournament_rules() from public,anon,authenticated;

create function private.validate_rule_proposal(t public.tournaments, proposal jsonb) returns jsonb
language plpgsql set search_path='' as $$
declare a date; b date; penalty integer; ex jsonb; normalized jsonb; mode text; schedule text; note text;
begin
  if proposal is null or jsonb_typeof(proposal)<>'object' or
    proposal - array['from','to','mode','penalty','schedule','exclusions','reason'] <> '{}'::jsonb then
    raise exception 'invalid_rule';
  end if;
  a := (proposal->>'from')::date; b := (proposal->>'to')::date;
  penalty := (proposal->>'penalty')::integer; mode:=proposal->>'mode'; schedule:=proposal->>'schedule';
  note:=trim(proposal->>'reason'); ex:=proposal->'exclusions';
  if a is null or b is null or a<t.starts_at or b>t.ends_at or b<a or not isfinite(a) or not isfinite(b) then
    raise exception 'invalid_rule_period';
  end if;
  if penalty is null or penalty not between -25000 and 0 or mode is null or mode not in('absolute','relative_to_lowest')
    or schedule is null or schedule not in('monday_to_friday','every_day')
    or note is null or char_length(note) not between 3 and 500 then raise exception 'invalid_rule'; end if;
  if ex is null or jsonb_typeof(ex)<>'array' then raise exception 'invalid_exclusions'; end if;
  if jsonb_array_length(ex)>366 then raise exception 'invalid_exclusions'; end if;
  if exists(select 1 from jsonb_array_elements(ex) e where jsonb_typeof(e)<>'object'
      or e - array['date','reason'] <> '{}'::jsonb or e->>'date' is null
      or (e->>'date')::date<a or (e->>'date')::date>b or not isfinite((e->>'date')::date)
      or e->>'reason' is null or char_length(trim(e->>'reason')) not between 3 and 200)
    or (select count(*) from jsonb_array_elements(ex))<>
       (select count(distinct (e->>'date')::date) from jsonb_array_elements(ex) e) then
    raise exception 'invalid_exclusions';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('date',(e->>'date')::date,'reason',trim(e->>'reason'))
    order by (e->>'date')::date),'[]') into normalized from jsonb_array_elements(ex) e;
  return jsonb_build_object('from',a,'to',b,'mode',mode,'penalty',penalty,'schedule',schedule,
    'exclusions',normalized,'reason',note);
exception when invalid_text_representation or datetime_field_overflow or numeric_value_out_of_range then
  raise exception 'invalid_rule';
end $$;
revoke all on function private.validate_rule_proposal(public.tournaments,jsonb) from public,anon,authenticated;

-- Overlapping revision intervals are immutable history. Highest id wins on each
-- date, yielding exactly one effective rule with baseline coverage throughout.
create function private.rule_on_day(target uuid, game_day date) returns jsonb
language sql stable set search_path='' as $$
 select to_jsonb(v) from public.tournament_rule_versions v
 where v.tournament_id=target and game_day between v.effective_from and v.effective_to
 order by v.id desc limit 1;
$$;

create function private.calculate_versioned_tournament(target uuid, as_of date, proposal jsonb default null)
returns table(player_id uuid,played_on date,personal_score_id uuid,raw_score integer,
 applied_score integer,result_kind text,provisional boolean,rule_snapshot jsonb)
language sql stable set search_path='' as $$
 with configured as (
  select t.*,d::date game_day,case when proposal is not null and d::date between
    (proposal->>'from')::date and (proposal->>'to')::date then
      jsonb_build_object('scoring_mode',proposal->>'mode','absence_penalty',proposal->'penalty',
        'weekly_schedule',proposal->>'schedule','exclusions',proposal->'exclusions','version','prévia')
    else private.rule_on_day(t.id,d::date) end rule
  from public.tournaments t cross join lateral generate_series(t.starts_at::timestamp,
    least(t.ends_at,as_of)::timestamp,interval '1 day') d where t.id=target
 ), days as (
  select * from configured d where
    (d.rule->>'weekly_schedule'='every_day' or extract(isodow from d.game_day) between 1 and 5 or
      (d.rule->>'weekly_schedule'='monday_to_friday_and_sunday' and extract(isodow from d.game_day)=7))
    and not exists(select 1 from jsonb_array_elements(d.rule->'exclusions') e
      where (e->>'date')::date=d.game_day)
 ), inputs as (
  select p.player_id,d.*,s.id score_id,s.score,
   min(s.score) filter(where s.score>0) over(partition by d.game_day) minimum
  from days d join public.tournament_participants p on p.tournament_id=d.id and p.eligible_from<=d.game_day
  left join public.personal_scores s on s.player_id=p.player_id and s.played_on=d.game_day
 )
 select i.player_id,i.game_day,i.score_id,i.score,
  case when i.score>0 then case when i.rule->>'scoring_mode'='absolute' then i.score else i.score-i.minimum end
    when i.game_day<as_of and i.history_ready then (i.rule->>'absence_penalty')::integer else 0 end,
  case when i.score>0 then 'score' when i.game_day<as_of and i.history_ready then 'absence' else 'pending' end,
  i.game_day=as_of or not i.history_ready,
  jsonb_build_object('version',i.rule->>'version','mode',i.rule->>'scoring_mode',
    'absence_penalty',(i.rule->>'absence_penalty')::integer,'timezone','America/Sao_Paulo',
    'minimum_positive',i.minimum,'weekly_schedule',i.rule->>'weekly_schedule','history_ready',i.history_ready)
 from inputs i;
$$;
create or replace function private.calculate_tournament(target uuid,as_of date)
returns table(player_id uuid,played_on date,personal_score_id uuid,raw_score integer,
 applied_score integer,result_kind text,provisional boolean,rule_snapshot jsonb)
language sql stable set search_path='' as $$
 select * from private.calculate_versioned_tournament(target,as_of,null);
$$;
revoke all on function private.rule_on_day(uuid,date) from public,anon,authenticated;
revoke all on function private.calculate_versioned_tournament(uuid,date,jsonb) from public,anon,authenticated;

create or replace function private.refresh_open_tournament(target uuid,as_of date) returns void
language plpgsql set search_path='' as $$
begin
 perform 1 from public.tournaments where id=target for update;
 -- Calendar revisions may remove a former game day. Deletion is audited by the
 -- existing result_removal_log trigger, including the entire previous snapshot.
 delete from public.tournament_score_results r where r.tournament_id=target
  and not exists(select 1 from private.calculate_tournament(target,as_of) c
    where c.player_id=r.player_id and c.played_on=r.played_on);
 insert into public.tournament_score_results as existing
  (tournament_id,player_id,played_on,personal_score_id,raw_score,applied_score,result_kind,provisional,applied_rule_snapshot)
 select target,c.player_id,c.played_on,c.personal_score_id,c.raw_score,c.applied_score,c.result_kind,c.provisional,c.rule_snapshot
 from private.calculate_tournament(target,as_of) c
 on conflict(tournament_id,player_id,played_on) do update set
  personal_score_id=excluded.personal_score_id,raw_score=excluded.raw_score,applied_score=excluded.applied_score,
  result_kind=excluded.result_kind,provisional=excluded.provisional,applied_rule_snapshot=excluded.applied_rule_snapshot,updated_at=now()
 where (existing.personal_score_id,existing.raw_score,existing.applied_score,existing.result_kind,existing.provisional,existing.applied_rule_snapshot)
 is distinct from (excluded.personal_score_id,excluded.raw_score,excluded.applied_score,excluded.result_kind,excluded.provisional,excluded.applied_rule_snapshot);
end $$;

create table private.rule_revision_changes (
 id bigint generated always as identity primary key,tournament_id uuid not null,actor_id uuid not null,
 changed_at timestamptz not null default now(),version_id bigint not null,proposal jsonb not null,impact jsonb not null
);
alter table private.rule_revision_changes enable row level security;
revoke all on private.rule_revision_changes from public,anon,authenticated;

create function private.rule_preview(target uuid,proposal jsonb) returns jsonb
language plpgsql set search_path='' as $$
declare t public.tournaments; p jsonb; today date; changes jsonb; totals jsonb; token text;
begin
 t:=private.require_open_organized_tournament(target);
 p:=private.validate_rule_proposal(t,proposal);
 today:=(now() at time zone 'America/Sao_Paulo')::date;
 -- Hash all mutable inputs and persistent output under the tournament lock.
 -- Existing score/participant/history RPCs acquire this same lock before writes.
 select md5(jsonb_build_object('tournament',to_jsonb(t),'proposal',p,'today',today,
  'versions',coalesce((select jsonb_agg(to_jsonb(v) order by id) from public.tournament_rule_versions v where tournament_id=target),'[]'),
  'participants',coalesce((select jsonb_agg(to_jsonb(m) order by player_id) from public.tournament_participants m where tournament_id=target),'[]'),
  'scores',coalesce((select jsonb_agg(to_jsonb(s) order by s.id) from public.personal_scores s
     where exists(select 1 from public.tournament_participants m where m.tournament_id=target and m.player_id=s.player_id)
       and s.played_on between t.starts_at and t.ends_at),'[]'),
  'results',coalesce((select jsonb_agg(to_jsonb(r) order by r.id) from public.tournament_score_results r where tournament_id=target),'[]'))::text) into token;
 with before as (select player_id,played_on,raw_score,applied_score,result_kind from public.tournament_score_results where tournament_id=target),
 after as (select * from private.calculate_versioned_tournament(target,today,p))
 select coalesce(jsonb_agg(jsonb_build_object('player_id',coalesce(b.player_id,a.player_id),
  'day',coalesce(b.played_on,a.played_on),'before',b.applied_score,'after',a.applied_score,
  'before_kind',b.result_kind,'after_kind',a.result_kind) order by coalesce(b.played_on,a.played_on),coalesce(b.player_id,a.player_id)),'[]')
 into changes from before b full join after a using(player_id,played_on)
 where (b.raw_score,b.applied_score,b.result_kind) is distinct from (a.raw_score,a.applied_score,a.result_kind);
 with before as (select player_id,sum(applied_score) total from public.tournament_score_results where tournament_id=target group by player_id),
 after as (select player_id,sum(applied_score) total from private.calculate_versioned_tournament(target,today,p) group by player_id)
 select coalesce(jsonb_agg(jsonb_build_object('player_id',m.player_id,'name',private.visible_player_name(pr),
   'before',coalesce(b.total,0),'after',coalesce(a.total,0),'delta',coalesce(a.total,0)-coalesce(b.total,0)) order by m.player_id),'[]')
 into totals from public.tournament_participants m join public.profiles pr on pr.id=m.player_id
 left join before b on b.player_id=m.player_id left join after a on a.player_id=m.player_id where m.tournament_id=target;
 return jsonb_build_object('token',token,'proposal',p,'changes',changes,'totals',totals,
  'retroactive',(p->>'from')::date<today,'today',today);
end $$;
revoke all on function private.rule_preview(uuid,jsonb) from public,anon,authenticated;

create function public.preview_tournament_rules(target uuid,proposal jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
begin return private.rule_preview(target,proposal); end $$;

create function public.apply_tournament_rules(target uuid,proposal jsonb,expected_token text) returns bigint
language plpgsql security definer set search_path='' as $$
declare preview jsonb; p jsonb; revision bigint;
begin
 preview:=private.rule_preview(target,proposal); p:=preview->'proposal';
 if expected_token is null or expected_token<>preview->>'token' then raise exception 'rule_preview_expired'; end if;
 -- Retry after a successful identical confirmation is safe: the old token fails.
 insert into public.tournament_rule_versions(tournament_id,effective_from,effective_to,scoring_mode,absence_penalty,
   weekly_schedule,exclusions,version,reason,actor_id)
 values(target,(p->>'from')::date,(p->>'to')::date,(p->>'mode')::public.scoring_mode,(p->>'penalty')::integer,
   (p->>'schedule')::public.weekly_schedule,p->'exclusions','pending',p->>'reason',auth.uid()) returning id into revision;
 update public.tournament_rule_versions set version='s5-'||revision where id=revision;
 insert into private.rule_revision_changes(tournament_id,actor_id,version_id,proposal,impact)
 values(target,auth.uid(),revision,p,preview-array['token']);
 perform private.refresh_tournament(target,(preview->>'today')::date);
 return revision;
end $$;
revoke all on function public.preview_tournament_rules(uuid,jsonb) from public,anon;
revoke all on function public.apply_tournament_rules(uuid,jsonb,text) from public,anon;
grant execute on function public.preview_tournament_rules(uuid,jsonb) to authenticated;
grant execute on function public.apply_tournament_rules(uuid,jsonb,text) to authenticated;

create function public.create_configured_tournament(tournament_name text,start_day date,end_day date,proposal jsonb) returns uuid
language plpgsql security definer set search_path='' as $$
declare target uuid; t public.tournaments; p jsonb;
begin
 target:=public.create_tournament(tournament_name,start_day,end_day);
 select * into t from public.tournaments where id=target;
 p:=private.validate_rule_proposal(t,proposal);
 if (p->>'from')::date<>start_day or (p->>'to')::date<>end_day then raise exception 'invalid_rule_period'; end if;
 update public.tournaments set scoring_mode=(p->>'mode')::public.scoring_mode,absence_penalty=(p->>'penalty')::integer,
  weekly_schedule=(p->>'schedule')::public.weekly_schedule where id=target;
 -- Initial config is set atomically before the new tournament becomes visible.
 update public.tournament_rule_versions set scoring_mode=(p->>'mode')::public.scoring_mode,
  absence_penalty=(p->>'penalty')::integer,weekly_schedule=(p->>'schedule')::public.weekly_schedule,
  exclusions=p->'exclusions',reason=p->>'reason',version='s5-'||id where tournament_id=target;
 update public.tournaments set rule_version=(select version from public.tournament_rule_versions where tournament_id=target) where id=target;
 insert into public.tournament_excluded_dates(tournament_id,excluded_date,reason)
 select target,(e->>'date')::date,e->>'reason' from jsonb_array_elements(p->'exclusions') e;
 return target;
end $$;
revoke all on function public.create_configured_tournament(text,date,date,jsonb) from public,anon;
grant execute on function public.create_configured_tournament(text,date,date,jsonb) to authenticated;

-- Keep the legacy profile-aware dashboard and enrich its authorized response.
alter function public.get_tournament_dashboard(uuid) rename to get_legacy_tournament_dashboard;
revoke all on function public.get_legacy_tournament_dashboard(uuid) from public,anon,authenticated;
create function public.get_tournament_dashboard(target uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare data jsonb; current_rule jsonb; day date;
begin
 data:=public.get_legacy_tournament_dashboard(target);
 if not coalesce((data->>'access')::boolean,false) then return data; end if;
 day:=greatest((data->'tournament'->>'starts_at')::date,
   least((data->'tournament'->>'ends_at')::date,(data->>'today')::date));
 current_rule:=private.rule_on_day(target,day);
 return data || jsonb_build_object('current_rule',current_rule,
  'rule_versions',coalesce((select jsonb_agg(to_jsonb(v) order by id desc)
    from public.tournament_rule_versions v where tournament_id=target),'[]'),
  'excluded_dates',coalesce((select jsonb_agg(e->>'date' order by e->>'date')
    from jsonb_array_elements(current_rule->'exclusions') e),'[]'));
end $$;
revoke all on function public.get_tournament_dashboard(uuid) from public,anon;
grant execute on function public.get_tournament_dashboard(uuid) to authenticated;
-- Invalidate any previously cached legacy wrapper plan after the rename.
create or replace function public.get_september_dashboard() returns jsonb
language sql security invoker set search_path='' as $$
 select public.get_tournament_dashboard('20260900-0000-4000-8000-000000000001'::uuid);
$$;
commit;
