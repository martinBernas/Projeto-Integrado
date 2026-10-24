begin isolation level repeatable read read only;
do $$ declare b private.sprint8_backups;
begin
 select * into b from private.sprint8_backups where id='before-gmail-reports-20261024-v1';
 if not found then raise exception 'gmail_backup_missing'; end if;
 if to_regprocedure('public.complete_gmail_tournament_delivery(uuid,uuid,uuid,text)') is null
  or to_regprocedure('public.fail_gmail_tournament_delivery(uuid,uuid,uuid,boolean)') is null then raise exception 'gmail_migration_missing'; end if;
 if private.sprint8_gmail_snapshot(b.as_of) is distinct from b.snapshot then raise exception 'gmail_snapshot_changed'; end if;
 if has_function_privilege('authenticated','public.complete_gmail_tournament_delivery(uuid,uuid,uuid,text)','execute')
  or has_function_privilege('service_role','public.record_tournament_mail_event(text,text,timestamptz)','execute') then raise exception 'gmail_permissions_invalid'; end if;
end $$;
select 'preserved' business_snapshot,'installed' gmail_reports;
commit;
