-- RF24: additive private telemetry only; existing business data is untouched.
begin;
set local lock_timeout='10s';

create table private.operational_metrics (
 id bigint generated always as identity primary key,
 occurred_at timestamptz not null,
 received_on date not null default (current_timestamp at time zone 'UTC')::date,
 stage text not null check(stage in('session_claims','authentication','tournaments','personal_history','profile','tournament_rpc','audit_status')),
 duration_ms integer not null check(duration_ms between 0 and 3600000),
 outcome text not null check(outcome in('success','error','exception','empty','denied')),
 code text check(code is null or code ~ '^([0-9]{2}[A-Z0-9]{3}|PGRST[0-9]{3})$')
);
create index operational_metrics_period on private.operational_metrics(occurred_at);
create table private.operational_metrics_days (
 day date primary key, received bigint not null default 0, accepted integer not null default 0 check(accepted between 0 and 5000),
 discarded bigint not null default 0, check(received=accepted+discarded)
);
alter table private.operational_metrics enable row level security;
alter table private.operational_metrics_days enable row level security;
revoke all on private.operational_metrics,private.operational_metrics_days from public,anon,authenticated,service_role;
revoke all on sequence private.operational_metrics_id_seq from public,anon,authenticated,service_role;

create function private.purge_operational_metrics() returns void
language plpgsql security definer set search_path='' set lock_timeout='250ms' as $$
declare cutoff date:=(clock_timestamp() at time zone 'UTC')::date-13;
begin
 perform pg_advisory_xact_lock(82424,1);
 delete from private.operational_metrics where received_on<cutoff or occurred_at < (cutoff::timestamp at time zone 'UTC');
 delete from private.operational_metrics_days where day<cutoff;
end $$;
revoke all on function private.purge_operational_metrics() from public,anon,authenticated,service_role;

create function public.record_operational_metrics(events jsonb) returns jsonb
language plpgsql security definer set search_path='' set lock_timeout='250ms' as $$
declare entry jsonb; batch integer; quota integer; kept integer;
 capture_day date:=(clock_timestamp() at time zone 'UTC')::date;
begin
 -- No client-supplied identities, payloads, messages or arbitrary keys.
 if events is null or jsonb_typeof(events)<>'array' then raise exception 'invalid_metrics_batch'; end if;
 batch:=jsonb_array_length(events);
 if batch<1 or batch>32 then raise exception 'invalid_metrics_batch'; end if;
 for entry in select value from jsonb_array_elements(events) loop
  if jsonb_typeof(entry)<>'object' or (entry-array['occurred_at','stage','duration_ms','outcome','code'])<>'{}'::jsonb
   or not(entry ?& array['occurred_at','stage','duration_ms','outcome'])
   or jsonb_typeof(entry->'occurred_at') is distinct from 'string'
   or jsonb_typeof(entry->'stage') is distinct from 'string'
   or jsonb_typeof(entry->'outcome') is distinct from 'string'
   or jsonb_typeof(entry->'duration_ms') is distinct from 'number'
   or (entry->>'duration_ms') !~ '^[0-9]{1,7}$'
   or (entry->>'duration_ms')::integer>3600000
   or entry->>'stage' not in('session_claims','authentication','tournaments','personal_history','profile','tournament_rpc','audit_status')
   or entry->>'outcome' not in('success','error','exception','empty','denied')
   or (entry ? 'code' and (jsonb_typeof(entry->'code') is distinct from 'string' or entry->>'code' !~ '^([0-9]{2}[A-Z0-9]{3}|PGRST[0-9]{3})$')) then
   raise exception 'invalid_metrics_event';
  end if;
  if entry->>'occurred_at' !~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$'
   or (entry->>'occurred_at')::timestamptz < ((capture_day-13)::timestamp at time zone 'UTC')
   or (entry->>'occurred_at')::timestamptz > clock_timestamp()+interval '5 minutes' then
   raise exception 'invalid_metrics_time';
  end if;
 end loop;
 perform private.purge_operational_metrics();
 insert into private.operational_metrics_days(day) values(capture_day) on conflict do nothing;
 select 5000-accepted into quota from private.operational_metrics_days where day=capture_day for update;
 kept:=least(batch,quota);
 insert into private.operational_metrics(occurred_at,received_on,stage,duration_ms,outcome,code)
 select (value->>'occurred_at')::timestamptz,capture_day,value->>'stage',(value->>'duration_ms')::integer,value->>'outcome',value->>'code'
 from jsonb_array_elements(events) with ordinality e(value,ord) where ord<=kept;
 update private.operational_metrics_days set received=received+batch,accepted=accepted+kept,discarded=discarded+batch-kept
 where day=capture_day;
 return jsonb_build_object('accepted',kept,'discarded',batch-kept);
end $$;
revoke all on function public.record_operational_metrics(jsonb) from public,anon,authenticated;
grant execute on function public.record_operational_metrics(jsonb) to service_role;
commit;
