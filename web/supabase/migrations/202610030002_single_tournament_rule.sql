-- Incremental migration after deployed S5. Do not reapply earlier migrations.
-- Refuses mixed effective rules: normalize explicitly before applying.
begin;
set local lock_timeout='10s';
lock table public.tournaments,public.tournament_rule_versions in share row exclusive mode;
do $$ begin
 if exists(select 1 from public.tournaments t where t.closed_at is null and not exists(
  select 1 from public.tournament_rule_versions v where v.id=(select max(x.id) from public.tournament_rule_versions x where x.tournament_id=t.id)
   and v.effective_from=t.starts_at and v.effective_to=t.ends_at)) then
  raise exception 'single_rule_migration_requires_full_period: torneio aberto com ultima revisao parcial; revisar explicitamente todo o periodo antes de migrar';
 end if;
end $$;
-- Immutable revisions remain an audit trail; newest revision governs all open days.
create or replace function private.rule_on_day(target uuid,game_day date) returns jsonb
language sql stable set search_path='' as $$
 select to_jsonb(v) from public.tournament_rule_versions v join public.tournaments t on t.id=v.tournament_id
 where t.id=target and game_day between t.starts_at and t.ends_at
  and (t.closed_at is null or game_day between v.effective_from and v.effective_to)
 order by v.id desc limit 1;
$$;
-- Dates are edited together with the rule through preview/confirmation.
drop trigger initialize_tournament_rules on public.tournaments;
create or replace function private.initialize_tournament_rules() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if tg_op='INSERT' then
    insert into public.tournament_rule_versions(tournament_id,effective_from,effective_to,scoring_mode,
      absence_penalty,weekly_schedule,version,reason,actor_id)
    values(new.id,new.starts_at,new.ends_at,new.scoring_mode,new.absence_penalty,new.weekly_schedule,
      new.rule_version,'Configuração inicial',auth.uid());
  end if;
  return new;
end $$;
create trigger initialize_tournament_rules after insert on public.tournaments
for each row execute function private.initialize_tournament_rules();
create or replace function private.validate_rule_proposal(t public.tournaments, proposal jsonb) returns jsonb
language plpgsql set search_path='' as $$
declare a date; b date; penalty integer; ex jsonb; normalized jsonb; mode text; schedule text; note text;
begin
  if proposal is null or jsonb_typeof(proposal)<>'object' or
    proposal - array['from','to','mode','penalty','schedule','exclusions','reason','scope'] <> '{}'::jsonb then
    raise exception 'invalid_rule';
  end if;
  if proposal->>'scope' is distinct from 'tournament' then raise exception 'rule_scope_requires_updated_app'; end if;
  a := (proposal->>'from')::date; b := (proposal->>'to')::date;
  penalty := (proposal->>'penalty')::integer; mode:=proposal->>'mode'; schedule:=proposal->>'schedule';
  note:=trim(proposal->>'reason'); ex:=proposal->'exclusions';
  if a is null or b is null or a<date '0001-01-01' or b>date '9999-12-31' or b<a or not isfinite(a) or not isfinite(b) then
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
    'exclusions',normalized,'reason',note,'scope','tournament');
exception when invalid_text_representation or datetime_field_overflow or numeric_value_out_of_range then
  raise exception 'invalid_rule';
end $$;
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
create or replace function private.rule_preview(target uuid,proposal jsonb) returns jsonb
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
       and s.played_on between least(t.starts_at,(p->>'from')::date) and greatest(t.ends_at,(p->>'to')::date)),'[]'),
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
create or replace function public.apply_tournament_rules(target uuid,proposal jsonb,expected_token text) returns bigint
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
 update public.tournaments set starts_at=(p->>'from')::date,ends_at=(p->>'to')::date,
  scoring_mode=(p->>'mode')::public.scoring_mode,absence_penalty=(p->>'penalty')::integer,
  weekly_schedule=(p->>'schedule')::public.weekly_schedule,rule_version='s5-'||revision where id=target;
 insert into private.rule_revision_changes(tournament_id,actor_id,version_id,proposal,impact)
 values(target,auth.uid(),revision,p,preview-array['token']);
 perform private.refresh_tournament(target,(preview->>'today')::date);
 return revision;
end $$;
-- The name-only administration path must not bypass period impact confirmation.
create or replace function public.update_tournament(target uuid,tournament_name text,start_day date,end_day date) returns void
language plpgsql security definer set search_path='' as $$
declare t public.tournaments;
begin
 t:=private.require_open_organized_tournament(target);
 if tournament_name is null or char_length(trim(tournament_name)) not between 3 and 100 then raise exception 'invalid_name'; end if;
 if start_day is null or end_day is null or not isfinite(start_day) or not isfinite(end_day)
  or start_day<date '0001-01-01' or end_day>date '9999-12-31' or end_day<start_day then raise exception 'invalid_period'; end if;
 if (start_day,end_day) is distinct from (t.starts_at,t.ends_at) then raise exception 'period_requires_rule_preview'; end if;
 update public.tournaments set name=trim(tournament_name) where id=target and name is distinct from trim(tournament_name);
end $$;
commit;
