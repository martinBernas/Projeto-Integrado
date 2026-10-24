-- Administrative activation, AFTER both migrations/comparisons and Gmail SMTP.
-- Enable pg_cron and pg_net using Supabase Extensions first.
-- Create both secrets in Supabase Vault UI, never paste real secrets into Git:
-- geoguaras_report_worker_url = https://YOUR-DEPLOYMENT/api/tournament-reports
-- geoguaras_report_worker_secret = same value as CRON_SECRET in hosting.
begin;
do $$ begin
 if to_regprocedure('private.withdraw_due_tournaments()') is null then raise exception 'reports_migration_missing'; end if;
 if to_regprocedure('public.complete_gmail_tournament_delivery(uuid,uuid,uuid,text)') is null then raise exception 'gmail_migration_missing'; end if;
 if not exists(select 1 from vault.decrypted_secrets where name='geoguaras_report_worker_url' and decrypted_secret ~ '^https://[^/]+/api/tournament-reports$')
  or not exists(select 1 from vault.decrypted_secrets where name='geoguaras_report_worker_secret' and length(decrypted_secret)>=32)
  then raise exception 'worker_vault_secrets_missing'; end if;
 if exists(select 1 from cron.job where jobname in('geoguaras-tournament-withdrawal','geoguaras-tournament-reports'))
  then raise exception 'report_jobs_already_exist'; end if;
end $$;
select cron.schedule('geoguaras-tournament-withdrawal','* * * * *', $job$select private.withdraw_due_tournaments();$job$);
select cron.schedule('geoguaras-tournament-reports','*/5 * * * *', $job$
 select net.http_get(
  url:=(select decrypted_secret from vault.decrypted_secrets where name='geoguaras_report_worker_url'),
  headers:=jsonb_build_object('Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='geoguaras_report_worker_secret')),
  timeout_milliseconds:=60000);
$job$);
commit;
select jobid,jobname,schedule,active from cron.job where jobname in('geoguaras-tournament-withdrawal','geoguaras-tournament-reports');
