-- New private backup for the incremental SMTP change. Do not repeat 001.
-- Pause business writes until comparison; export and validate before migrating.
begin isolation level repeatable read;
set local lock_timeout='10s';
lock table public.tournaments,public.tournament_rule_versions,public.tournament_participants,
 public.personal_scores,public.profiles,public.tournament_excluded_dates,public.tournament_score_results,
 private.score_changes,private.result_changes,private.tournament_changes,private.participant_changes,
 private.rule_revision_changes,private.profile_changes,private.score_audits,private.audit_electors,private.audit_votes,
 private.audit_events,private.retroactive_score_changes,private.score_change_decisions,private.tournament_score_inputs,
 private.tournament_reports,private.tournament_report_deliveries,private.tournament_mail_events in share mode;
create function private.sprint8_gmail_snapshot(comparison_day date) returns jsonb
language sql stable set search_path='' as $$
 select private.sprint8_snapshot(comparison_day)||jsonb_build_object(
 'private.tournament_reports',coalesce((select jsonb_agg(to_jsonb(r) order by tournament_id) from private.tournament_reports r),'[]'),
 'private.tournament_report_deliveries',coalesce((select jsonb_agg(to_jsonb(d) order by id) from private.tournament_report_deliveries d),'[]'),
 'private.tournament_mail_events',coalesce((select jsonb_agg(to_jsonb(e) order by provider_id) from private.tournament_mail_events e),'[]'));
$$;
revoke all on function private.sprint8_gmail_snapshot(date) from public,anon,authenticated;
do $$ begin
 if to_regprocedure('public.complete_gmail_tournament_delivery(uuid,uuid,uuid,text)') is not null then raise exception 'gmail_reports_already_installed'; end if;
 if exists(select 1 from private.sprint8_backups where id='before-gmail-reports-20261024-v1') then raise exception 'gmail_backup_already_exists'; end if;
end $$;
insert into private.sprint8_backups(id,as_of,snapshot,function_definitions)
select 'before-gmail-reports-20261024-v1',reference_day,private.sprint8_gmail_snapshot(reference_day),
 (select jsonb_agg(pg_get_functiondef(p.oid) order by p.oid::regprocedure::text)
 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in('public','private') and p.prokind='f')
from(select (now() at time zone 'America/Sao_Paulo')::date reference_day) d;
commit;
select id,captured_at,as_of,md5(snapshot::text) snapshot_md5,md5(function_definitions::text) functions_md5
from private.sprint8_backups where id='before-gmail-reports-20261024-v1';
