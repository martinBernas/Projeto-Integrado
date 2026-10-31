-- Read-only. Run in the Supabase SQL Editor as administrator.
-- Result 1: inventory without addresses, credentials or PDF bytes.
select t.id,t.name,t.closed_at,r.due_at,r.withdrawn_at,
 r.snapshot is not null as has_snapshot,r.pdf_base64 is not null as has_pdf,
 r.generated_at,r.lease_until,
 (select count(*) from private.tournament_report_deliveries d where d.tournament_id=t.id) recipients,
 (select count(*) from private.tournament_report_deliveries d where d.tournament_id=t.id and d.state='sent') sent
from public.tournaments t left join private.tournament_reports r on r.tournament_id=t.id
where t.closed_at is not null order by t.closed_at desc,t.id;

-- Result 2: PRIVATE export for the HCM preview; no recipient addresses.
-- Requires exactly one matching closed tournament. With zero/multiple matches,
-- returns no rows: select the correct ID from result 1 before adjusting this query.
-- Export the result as JSON and save under /backups/ (ignored by Git).
with candidates as (
 select t.id from public.tournaments t
 where t.name='HCM - Outubro' and t.starts_at='2026-10-01' and t.ends_at='2026-10-30'
 and t.closed_at is not null
)
select r.tournament_id,r.due_at,r.withdrawn_at,r.snapshot,
 md5(r.snapshot::text) as snapshot_database_md5,md5(r.pdf_base64) as previous_pdf_md5
from private.tournament_reports r
where r.tournament_id in(select id from candidates)
 and (select count(*) from candidates)=1;
