-- Incremental maintenance after S6. No business rows are changed by this migration.
-- Open tournaments previously in preparation apply absence rules on their next refresh.
begin;
set local lock_timeout='10s';
lock table public.tournaments in share row exclusive mode;
-- Retain the legacy column and historical snapshots for compatibility; it no longer gates calculation.
alter table public.tournaments alter column history_ready set default true;
create or replace function public.create_tournament(tournament_name text, start_day date, end_day date) returns uuid
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
    'relative_to_lowest', -2500, 'monday_to_friday', 'mvp-v1', true)
  returning id into target;
  return target;
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

create or replace function public.close_tournament(target uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare current_tournament public.tournaments; today date;
begin
  if auth.uid() is null then raise exception 'authentication_required' using errcode = '42501'; end if;
  select * into current_tournament from public.tournaments where id = target and organizer_id = auth.uid() for update;
  if not found then raise exception 'tournament_not_allowed' using errcode = '42501'; end if;
  if current_tournament.closed_at is not null then return; end if;
  today := (now() at time zone current_tournament.timezone)::date;
  if today <= current_tournament.ends_at then raise exception 'tournament_not_finished'; end if;
  perform private.refresh_tournament(target, today);
  update public.tournaments set closed_at = now() where id = target;
end $$;

-- The manual preparation operation is retired; no CASCADE or data deletion.
drop function public.complete_tournament_history(uuid);
commit;
