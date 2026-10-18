-- Dono do produto authorized removal on 18/10/2026. Requires private export from 02.
-- Deletes only the backed-up exact target and its live dependencies; personal scores remain.
begin;
set local lock_timeout='10s';
lock table public.tournaments,public.tournament_participants,public.tournament_excluded_dates,public.tournament_score_results,public.tournament_rule_versions,public.profiles,public.personal_scores,private.score_audits,private.audit_electors,private.audit_votes,private.audit_events,private.score_changes,private.result_changes,private.tournament_changes,private.participant_changes,private.rule_revision_changes in share row exclusive mode;
do $$ declare saved private.maintenance_backups; current_state jsonb; expected jsonb; after_state jsonb;
 section text; field text; filtered jsonb; audit_ids text[]; begin
 select * into saved from private.maintenance_backups where id='before-audit-test-removal-20261018-v1' for update;
 if not found then raise exception 'Backup required'; end if;
 if (select count(*) from public.tournaments where name='Teste auditoria Aztecas Outubro')<>1
  or not exists(select 1 from public.tournaments where id=saved.target_id and name='Teste auditoria Aztecas Outubro') then
  raise exception 'Target identity changed; deletion refused'; end if;
 -- Refuse unknown cascade dependencies rather than delete unreviewed data.
 if exists(select 1 from pg_constraint where contype='f'
  and confrelid in ('public.tournaments'::regclass,'public.tournament_participants'::regclass,
   'public.tournament_excluded_dates'::regclass,'public.tournament_score_results'::regclass,
   'public.tournament_rule_versions'::regclass,'private.score_audits'::regclass,
   'private.audit_electors'::regclass,'private.audit_votes'::regclass,'private.audit_events'::regclass)
  and conrelid not in ('public.tournament_participants'::regclass,'public.tournament_excluded_dates'::regclass,
   'public.tournament_score_results'::regclass,'public.tournament_rule_versions'::regclass,'private.score_audits'::regclass,
   'private.audit_electors'::regclass,'private.audit_votes'::regclass,'private.audit_events'::regclass)) then
  raise exception 'Unknown dependency; review before deletion'; end if;
 current_state:=private.audit_cleanup_snapshot();
 if current_state is distinct from saved.snapshot then raise exception 'Data changed after backup; deletion refused'; end if;
 select coalesce(array_agg(id::text),'{}') into audit_ids from private.score_audits where tournament_id=saved.target_id;
 expected:=current_state;
 for section,field in select * from (values ('tournaments','id'),('participants','tournament_id'),
  ('exclusions','tournament_id'),('results','tournament_id'),('versions','tournament_id'),('audits','tournament_id')) s loop
  select coalesce(jsonb_agg(e.value order by e.ordinality),'[]') into filtered
   from jsonb_array_elements(current_state->section) with ordinality e
   where e.value->>field is distinct from saved.target_id::text;
  expected:=jsonb_set(expected,array[section],filtered);
 end loop;
 foreach section in array array['electors','votes','events'] loop
  select coalesce(jsonb_agg(e.value order by e.ordinality),'[]') into filtered
   from jsonb_array_elements(current_state->section) with ordinality e where not(e.value->>'audit_id'=any(audit_ids));
  expected:=jsonb_set(expected,array[section],filtered);
 end loop;
 -- Votes reference the electorate without ON DELETE CASCADE; remove them first.
 delete from private.audit_votes where audit_id::text=any(audit_ids);
 -- Remove backed-up test audits before participant cascade invokes the pending-audit guard.
 delete from private.score_audits where tournament_id=saved.target_id;
 delete from public.tournaments where id=saved.target_id;
 insert into private.tournament_changes(tournament_id,actor_id,old_data,new_data)
 select saved.target_id,auth.uid(),e,jsonb_build_object('operation','delete','reason','Test cleanup authorized by Dono do produto on 2026-10-18')
 from jsonb_array_elements(saved.snapshot->'tournaments') e where e->>'id'=saved.target_id::text;
 after_state:=private.audit_cleanup_snapshot();
 -- Change logs are retained and may gain deletion events; all old events must remain.
 foreach section in array array['score_changes','result_changes','tournament_changes','participant_changes','rule_changes'] loop
  if not ((after_state->section) @> (current_state->section)) then raise exception 'Historical events lost; rolling back'; end if;
  after_state:=jsonb_set(after_state,array[section],expected->section);
 end loop;
 if after_state is distinct from expected then raise exception 'Unexpected data change; rolling back'; end if;
end $$;
commit;
select b.target_id,not exists(select 1 from public.tournaments where id=b.target_id) test_removed,
 (select count(*) from public.personal_scores) preserved_personal_scores,
 md5(b.snapshot::text) backup_checksum from private.maintenance_backups b where id='before-audit-test-removal-20261018-v1';
