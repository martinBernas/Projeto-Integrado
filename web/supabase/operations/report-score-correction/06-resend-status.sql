-- READ ONLY. Tracks the one-off resend, without recipient addresses.
select b.id as operation,b.captured_at,
 jsonb_array_length(b.snapshot->'deliveries') as original_deliveries_saved
from private.sprint8_backups b where b.id='force-corrected-report-resend-20261031-v1';
select t.id,t.name,r.generated_at,r.due_at,r.withdrawn_at,r.lease_until,
 count(d.id) as recipients,
 count(d.id) filter(where d.state='pending') as pending,
 count(d.id) filter(where d.state='sending') as sending,
 count(d.id) filter(where d.state='sent') as sent,
 count(d.id) filter(where d.state='failed') as failed,
 count(d.id) filter(where d.state='uncertain') as uncertain
from public.tournaments t join private.tournament_reports r on r.tournament_id=t.id
join private.tournament_report_deliveries d on d.tournament_id=t.id
where t.id in('34727be9-2447-4e7c-af41-e685b6db290b','93c7e3c5-a676-42d4-83ca-05284cce0fff')
group by t.id,t.name,r.generated_at,r.due_at,r.withdrawn_at,r.lease_until order by t.name;
