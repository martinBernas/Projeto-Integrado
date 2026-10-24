-- Reuse the validated original backup only when business data is unchanged
-- and all report queues remain empty. Run before and after migration 002.
-- Keep writes and report workers paused between both checks.
begin isolation level repeatable read read only;
do $$ declare b private.sprint8_backups;
begin
 select * into b from private.sprint8_backups where id='before-reports-20261024-v1';
 if not found then raise exception 'original_backup_missing'; end if;
 if private.sprint8_snapshot(b.as_of) is distinct from b.snapshot then raise exception 'business_snapshot_changed'; end if;
 if exists(select 1 from private.tournament_reports)
  or exists(select 1 from private.tournament_report_deliveries)
  or exists(select 1 from private.tournament_mail_events) then raise exception 'report_queues_not_empty'; end if;
 if to_regprocedure('public.complete_gmail_tournament_delivery(uuid,uuid,uuid,text)') is not null then
  if to_regprocedure('public.fail_gmail_tournament_delivery(uuid,uuid,uuid,boolean)') is null then raise exception 'gmail_migration_incomplete'; end if;
  if has_function_privilege('authenticated','public.complete_gmail_tournament_delivery(uuid,uuid,uuid,text)','execute')
   or has_function_privilege('service_role','public.record_tournament_mail_event(text,text,timestamptz)','execute') then raise exception 'gmail_permissions_invalid'; end if;
 end if;
end $$;
select 'preserved' business_snapshot,'empty' report_queues,
 case when to_regprocedure('public.complete_gmail_tournament_delivery(uuid,uuid,uuid,text)') is null
  then 'pending' else 'installed' end gmail_reports;
commit;
