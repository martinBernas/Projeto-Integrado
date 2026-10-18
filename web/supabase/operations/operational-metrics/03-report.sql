-- Read-only administrative report: last seven UTC calendar dates, including today.
-- Rates describe recorded events, NOT all page views/users or all attempted writes.
begin isolation level repeatable read read only;
with period as (
 select (((now() at time zone 'UTC')::date-6)::timestamp at time zone 'UTC') from_at,now() to_at
)
select stage,count(*) recorded_events,
 count(*) filter(where outcome='success') successes,
 count(*) filter(where outcome='error') errors,
 count(*) filter(where outcome='exception') exceptions,
 count(*) filter(where outcome='empty') empty_results,
 count(*) filter(where outcome='denied') denied_results,
 round(100.0*count(*) filter(where outcome in('error','exception'))/nullif(count(*),0),2) recorded_failure_percent,
 percentile_cont(0.5) within group(order by duration_ms) median_ms,
 percentile_cont(0.95) within group(order by duration_ms) p95_ms
from private.operational_metrics,period where occurred_at>=from_at and occurred_at<to_at group by stage order by stage;

-- Coverage of valid batches that REACHED the database, grouped by receipt date.
-- Missing configuration, runtime failure, transport loss and invalid batches are not counted here.
select day,received,accepted,discarded,accepted=5000 daily_cap_reached
from private.operational_metrics_days where day>=(now() at time zone 'UTC')::date-6 order by day;

select stage,outcome,code,count(*) recorded_events from private.operational_metrics
where occurred_at>=((((now() at time zone 'UTC')::date-6)::timestamp) at time zone 'UTC')
group by stage,outcome,code order by stage,outcome,code;

select (select count(*) from private.operational_metrics) stored_events,
 pg_total_relation_size('private.operational_metrics')+pg_total_relation_size('private.operational_metrics_days') storage_bytes_with_indexes;
commit;
