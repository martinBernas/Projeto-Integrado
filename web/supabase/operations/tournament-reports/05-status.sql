-- Administrative summary; no addresses, PDF, snapshot or secrets.
select r.tournament_id,r.created_at,r.due_at,r.generated_at,r.withdrawn_at,
 r.last_error,r.lease_until,r.next_attempt_at,
 count(d.id) recipients,count(d.id) filter(where d.state='sent') delivered,
 count(d.id) filter(where d.state='accepted') awaiting_webhook,
 count(d.id) filter(where d.state='uncertain') requiring_reconciliation
from private.tournament_reports r left join private.tournament_report_deliveries d on d.tournament_id=r.tournament_id
group by r.tournament_id order by r.created_at;
select j.jobname,d.status,d.return_message,d.start_time,d.end_time
from cron.job_run_details d join cron.job j on j.jobid=d.jobid
where j.jobname in('geoguaras-tournament-withdrawal','geoguaras-tournament-reports') order by d.start_time desc limit 20;
