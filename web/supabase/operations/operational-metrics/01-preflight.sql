-- Administrative SQL Editor. Read-only; does not enable extensions or collect metrics.
select current_database() database_name,current_user database_role,
 to_regprocedure('public.record_operational_metrics(jsonb)') existing_ingestion,
 exists(select 1 from pg_available_extensions where name='pg_cron') cron_available,
 exists(select 1 from pg_extension where extname='pg_cron') cron_enabled;

-- Record these fingerprints before and after the additive migration.
select 'tournaments' section,count(*) rows,md5(coalesce(jsonb_agg(to_jsonb(t) order by id),'[]')::text) checksum from public.tournaments t
union all select 'personal_scores',count(*),md5(coalesce(jsonb_agg(to_jsonb(s) order by id),'[]')::text) from public.personal_scores s
union all select 'score_results',count(*),md5(coalesce(jsonb_agg(to_jsonb(r) order by id),'[]')::text) from public.tournament_score_results r;
