-- ONE-OFF operation explicitly requested by the product owner.
-- Requeues 24 original recipients for the corrected PDFs already stored.
-- This can trigger email immediately through the existing scheduled worker.
-- Run ONCE as database administrator. No app feature/deployment/migration needed.
begin;
set local lock_timeout='10s';
do $$
declare target record; report private.tournament_reports; changed integer;
 operation_id constant text:='force-corrected-report-resend-20261031-v1';
begin
 if to_regclass('private.sprint8_backups') is null then raise exception 'private_backup_table_missing'; end if;
 perform 1 from public.tournaments
 where id in('34727be9-2447-4e7c-af41-e685b6db290b','93c7e3c5-a676-42d4-83ca-05284cce0fff') order by id for update;
 perform 1 from private.tournament_reports
 where tournament_id in('34727be9-2447-4e7c-af41-e685b6db290b','93c7e3c5-a676-42d4-83ca-05284cce0fff') order by tournament_id for update;
 perform 1 from private.tournament_report_deliveries
 where tournament_id in('34727be9-2447-4e7c-af41-e685b6db290b','93c7e3c5-a676-42d4-83ca-05284cce0fff') order by tournament_id,id for update;
 if exists(select 1 from private.sprint8_backups where id=operation_id) then raise exception 'resend_already_requested'; end if;
 for target in select * from (values
  ('34727be9-2447-4e7c-af41-e685b6db290b'::uuid,'a2587770c6163af56fcc4b876836b5b1','359473d39308e759d7b6c0a2f2b9479b',6),
  ('93c7e3c5-a676-42d4-83ca-05284cce0fff'::uuid,'ab7951e112207aaf37ef5c2d482b5ad3','df9f8c21ab263beb92bb942d2b783a04',18)
 ) as targets(id,snapshot_md5,pdf_md5,recipients) loop
  select * into report from private.tournament_reports where tournament_id=target.id;
  if not found or report.withdrawn_at is not null or report.generated_at is null
   or report.snapshot is null or report.pdf_base64 is null then raise exception 'report_unavailable'; end if;
  if report.lease_until>clock_timestamp() then raise exception 'report_busy'; end if;
  if md5(report.snapshot::text)<>target.snapshot_md5 or md5(report.pdf_base64)<>target.pdf_md5
   then raise exception 'corrected_report_changed'; end if;
  if (select count(*) from private.tournament_report_deliveries where tournament_id=target.id)<>target.recipients
   or exists(select 1 from private.tournament_report_deliveries where tournament_id=target.id
    and (state<>'sent' or email is null or btrim(email)='')) then raise exception 'delivery_state_changed'; end if;
 end loop;
 -- Existing private backup table, already protected by RLS/revoked public access.
 -- Save old IDs, provider IDs, dates and states before changing the active queue.
 insert into private.sprint8_backups(id,as_of,snapshot,function_definitions)
 select operation_id,(clock_timestamp() at time zone 'America/Sao_Paulo')::date,jsonb_build_object(
  'operation','force_corrected_report_resend','revision','cumulative-scores-v5',
  'reports',(select jsonb_agg(to_jsonb(r) order by tournament_id) from private.tournament_reports r
   where tournament_id in('34727be9-2447-4e7c-af41-e685b6db290b','93c7e3c5-a676-42d4-83ca-05284cce0fff')),
  'deliveries',(select jsonb_agg(to_jsonb(d) order by tournament_id,id) from private.tournament_report_deliveries d
   where tournament_id in('34727be9-2447-4e7c-af41-e685b6db290b','93c7e3c5-a676-42d4-83ca-05284cce0fff'))
 ),'[]'::jsonb;
 -- A new UUID yields a fresh Message-ID in the existing Gmail sender.
 update private.tournament_report_deliveries set id=gen_random_uuid(),state='pending',
  first_attempt_at=null,sent_at=null,provider_id=null
 where tournament_id in('34727be9-2447-4e7c-af41-e685b6db290b','93c7e3c5-a676-42d4-83ca-05284cce0fff');
 get diagnostics changed=row_count;
 if changed<>24 then raise exception 'unexpected_delivery_count'; end if;
end $$;
-- Summary only: no addresses/PDF content. The worker may start after COMMIT.
select r.tournament_id,t.name,r.generated_at,r.due_at,
 count(d.id) as recipients,count(d.id) filter(where d.state='pending') as pending,
 count(d.id) filter(where d.state='sent') as sent
from private.tournament_reports r join public.tournaments t on t.id=r.tournament_id
join private.tournament_report_deliveries d on d.tournament_id=r.tournament_id
where r.tournament_id in('34727be9-2447-4e7c-af41-e685b6db290b','93c7e3c5-a676-42d4-83ca-05284cce0fff')
group by r.tournament_id,t.name,r.generated_at,r.due_at order by t.name;
commit;
