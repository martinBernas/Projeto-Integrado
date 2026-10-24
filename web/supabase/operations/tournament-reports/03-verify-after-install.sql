begin isolation level repeatable read read only;
do $$
declare b private.sprint8_backups;
begin
 select * into b from private.sprint8_backups where id='before-reports-20261024-v1';
 if not found then raise exception 'missing_reports_backup'; end if;
 if to_regprocedure('public.claim_tournament_report(uuid)') is null
  or to_regprocedure('public.record_tournament_mail_event(text,text,timestamptz)') is null
  or to_regclass('private.available_tournaments') is null then raise exception 'reports_migration_missing'; end if;
 if private.sprint8_snapshot(b.as_of) is distinct from b.snapshot then raise exception 'business_snapshot_changed'; end if;
 if exists(select 1 from private.tournament_reports) or exists(select 1 from private.tournament_report_deliveries)
  or exists(select 1 from private.tournament_mail_events) then raise exception 'reports_used_before_comparison'; end if;
end $$;
select 'preserved' business_snapshot,'installed' tournament_reports;
commit;
