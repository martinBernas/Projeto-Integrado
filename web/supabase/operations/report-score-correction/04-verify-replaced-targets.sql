-- READ ONLY. Run after replacing both PDFs; every *_ok/preserved flag must be true.
-- These MD5 values refer to the base64 text stored in PostgreSQL, not PDF bytes.
with targets(id,snapshot_md5,pdf_md5,generated_at,due_at,recipients) as (
 values
 ('34727be9-2447-4e7c-af41-e685b6db290b'::uuid,'a2587770c6163af56fcc4b876836b5b1','359473d39308e759d7b6c0a2f2b9479b',
  '2026-10-31 03:21:13.879956+00'::timestamptz,'2026-11-07 03:21:12.691942+00'::timestamptz,6),
 ('93c7e3c5-a676-42d4-83ca-05284cce0fff'::uuid,'ab7951e112207aaf37ef5c2d482b5ad3','df9f8c21ab263beb92bb942d2b783a04',
  '2026-10-31 03:22:45.052714+00'::timestamptz,'2026-11-07 03:22:43.681343+00'::timestamptz,18)
)
select target.id,t.name,
 coalesce(md5(r.pdf_base64)=target.pdf_md5,false) as corrected_pdf_ok,
 coalesce(md5(r.snapshot::text)=target.snapshot_md5,false) as snapshot_preserved,
 coalesce(r.generated_at=target.generated_at,false) as generated_at_preserved,
 coalesce(r.due_at=target.due_at,false) as due_at_preserved,
 (r.tournament_id is not null and r.withdrawn_at is null) as not_withdrawn_ok,
 (select count(*) from private.tournament_report_deliveries d where d.tournament_id=target.id) as recipients,
 (select count(*) from private.tournament_report_deliveries d where d.tournament_id=target.id and d.state='sent') as sent,
 ((select count(*) from private.tournament_report_deliveries d where d.tournament_id=target.id)=target.recipients
  and (select count(*) from private.tournament_report_deliveries d where d.tournament_id=target.id and d.state='sent')=target.recipients) as delivery_counts_preserved
from targets target left join public.tournaments t on t.id=target.id
left join private.tournament_reports r on r.tournament_id=target.id order by target.id;
