-- Run AFTER migration, in administrative SQL Editor, after enabling Supabase Cron.
-- Does not create/enable an extension or alter any other job.
begin;
do $$ begin
 if not exists(select 1 from pg_extension where extname='pg_cron') then
  raise exception 'Enable Supabase Cron (pg_cron) before scheduling retention'; end if;
 if exists(select 1 from cron.job where jobname='geoguaras-operational-metrics-purge') then
  raise exception 'Retention job already exists; inspect it instead of overwriting'; end if;
end $$;
select cron.schedule('geoguaras-operational-metrics-purge','15 * * * *',
 $job$select private.purge_operational_metrics();
 delete from cron.job_run_details where jobid=(select jobid from cron.job where jobname='geoguaras-operational-metrics-purge')
 and end_time<now()-interval '14 days';$job$);
commit;
select jobid,jobname,schedule,active from cron.job where jobname='geoguaras-operational-metrics-purge';
