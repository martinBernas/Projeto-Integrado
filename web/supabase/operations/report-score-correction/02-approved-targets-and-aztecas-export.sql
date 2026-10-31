-- Version cumulative-scores-v5 approved by the product owner on 2026-10-31.
-- READ ONLY. Does not regenerate a PDF, claim a lease, send or withdraw.
-- Result 1: refresh only the two approved targets, without recipient addresses.
select t.id,t.name,t.closed_at,r.due_at,r.withdrawn_at,r.generated_at,r.lease_until,
 r.snapshot is not null as has_snapshot,r.pdf_base64 is not null as has_pdf,
 md5(r.snapshot::text) as snapshot_database_md5,md5(r.pdf_base64) as previous_pdf_md5,
 (select count(*) from private.tournament_report_deliveries d where d.tournament_id=t.id) recipients,
 (select count(*) from private.tournament_report_deliveries d where d.tournament_id=t.id and d.state='sent') sent
from public.tournaments t left join private.tournament_reports r on r.tournament_id=t.id
where t.id in('93c7e3c5-a676-42d4-83ca-05284cce0fff','34727be9-2447-4e7c-af41-e685b6db290b')
order by t.name,t.id;

-- Result 2: private Aztecas snapshot export, without addresses or PDF bytes.
-- Export this single-row result as JSON into /backups/report-score-correction/.
-- The preview CLI accepts this format. Do not send credentials or mail addresses.
select r.tournament_id,r.due_at,r.withdrawn_at,r.snapshot,
 md5(r.snapshot::text) as snapshot_database_md5,md5(r.pdf_base64) as previous_pdf_md5
from private.tournament_reports r join public.tournaments t on t.id=r.tournament_id
where r.tournament_id='34727be9-2447-4e7c-af41-e685b6db290b' and t.closed_at is not null;
