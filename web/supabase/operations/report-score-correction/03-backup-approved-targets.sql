-- READ ONLY. Run after publication, immediately before replacement.
-- PRIVATE: includes recipient addresses and original PDFs. Do not paste results
-- into chat. Export the two-row result as JSON into ignored /backups/.
-- Missing/changed/withdrawn targets yield fewer than two rows: stop and inspect.
with targets(tournament_id,snapshot_md5,pdf_md5) as (
 values
 ('34727be9-2447-4e7c-af41-e685b6db290b'::uuid,'a2587770c6163af56fcc4b876836b5b1','84c2c566b89ba42c9fe7dfe48d31eb15'),
 ('93c7e3c5-a676-42d4-83ca-05284cce0fff'::uuid,'ab7951e112207aaf37ef5c2d482b5ad3','42aa3fce99f2e75608ff9f9072fd2306')
)
select jsonb_build_object(
 'captured_at',clock_timestamp(),
 'report',to_jsonb(r),
 'deliveries',coalesce((select jsonb_agg(to_jsonb(d) order by d.id)
   from private.tournament_report_deliveries d where d.tournament_id=r.tournament_id),'[]'::jsonb)
) as backup
from targets target join private.tournament_reports r on r.tournament_id=target.tournament_id
where r.withdrawn_at is null and r.snapshot is not null and r.generated_at is not null
 and md5(r.snapshot::text)=target.snapshot_md5 and md5(r.pdf_base64)=target.pdf_md5
order by r.tournament_id;
