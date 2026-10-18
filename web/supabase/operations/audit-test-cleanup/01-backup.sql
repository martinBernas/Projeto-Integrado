-- Authorized target: exact unique name. Run with writes paused; export privately before 02.
begin;
set local lock_timeout='10s';
lock table public.tournaments,public.tournament_participants,public.tournament_excluded_dates,public.tournament_score_results,public.tournament_rule_versions,public.profiles,public.personal_scores,private.score_audits,private.audit_electors,private.audit_votes,private.audit_events,private.score_changes,private.result_changes,private.tournament_changes,private.participant_changes,private.rule_revision_changes in share row exclusive mode;
create table if not exists private.maintenance_backups (
 id text primary key,captured_at timestamptz not null default now(),target_id uuid not null,snapshot jsonb not null
);
alter table private.maintenance_backups enable row level security;
revoke all on private.maintenance_backups from public,anon,authenticated;
create or replace function private.audit_cleanup_snapshot() returns jsonb
language sql stable set search_path='' as $$ select jsonb_build_object(
 'tournaments',coalesce((select jsonb_agg(to_jsonb(r) order by id) from public.tournaments r),'[]'::jsonb),
 'participants',coalesce((select jsonb_agg(to_jsonb(r) order by tournament_id,player_id) from public.tournament_participants r),'[]'::jsonb),
 'exclusions',coalesce((select jsonb_agg(to_jsonb(r) order by id) from public.tournament_excluded_dates r),'[]'::jsonb),
 'results',coalesce((select jsonb_agg(to_jsonb(r) order by id) from public.tournament_score_results r),'[]'::jsonb),
 'versions',coalesce((select jsonb_agg(to_jsonb(r) order by id) from public.tournament_rule_versions r),'[]'::jsonb),
 'profiles',coalesce((select jsonb_agg(to_jsonb(r) order by id) from public.profiles r),'[]'::jsonb),
 'scores',coalesce((select jsonb_agg(to_jsonb(r) order by id) from public.personal_scores r),'[]'::jsonb),
 'audits',coalesce((select jsonb_agg(to_jsonb(r) order by id) from private.score_audits r),'[]'::jsonb),
 'electors',coalesce((select jsonb_agg(to_jsonb(r) order by audit_id,player_id) from private.audit_electors r),'[]'::jsonb),
 'votes',coalesce((select jsonb_agg(to_jsonb(r) order by audit_id,player_id) from private.audit_votes r),'[]'::jsonb),
 'events',coalesce((select jsonb_agg(to_jsonb(r) order by id) from private.audit_events r),'[]'::jsonb),
 'score_changes',coalesce((select jsonb_agg(to_jsonb(r) order by id) from private.score_changes r),'[]'::jsonb),
 'result_changes',coalesce((select jsonb_agg(to_jsonb(r) order by id) from private.result_changes r),'[]'::jsonb),
 'tournament_changes',coalesce((select jsonb_agg(to_jsonb(r) order by id) from private.tournament_changes r),'[]'::jsonb),
 'participant_changes',coalesce((select jsonb_agg(to_jsonb(r) order by id) from private.participant_changes r),'[]'::jsonb),
 'rule_changes',coalesce((select jsonb_agg(to_jsonb(r) order by id) from private.rule_revision_changes r),'[]'::jsonb)); $$;
revoke all on function private.audit_cleanup_snapshot() from public,anon,authenticated;
do $$ declare target uuid; begin
 if (select count(*) from public.tournaments where name='Teste auditoria Aztecas Outubro')<>1 then
  raise exception 'Exact unique test tournament not found; no backup or deletion performed'; end if;
 select id into target from public.tournaments where name='Teste auditoria Aztecas Outubro';
 insert into private.maintenance_backups(id,target_id,snapshot)
 values('before-audit-test-removal-20261018-v1',target,private.audit_cleanup_snapshot());
end $$;
commit;
select id,captured_at,target_id,md5(snapshot::text) checksum,
 jsonb_array_length(snapshot->'scores') personal_scores,
 (select count(*) from private.score_audits where tournament_id=b.target_id) target_audits
from private.maintenance_backups b where id='before-audit-test-removal-20261018-v1';
