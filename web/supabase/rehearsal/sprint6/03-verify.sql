-- Run after migration, BEFORE new application usage, with writes still paused.
begin;
set local lock_timeout='10s';
lock table public.tournaments,public.tournament_rule_versions,public.tournament_participants,
 public.personal_scores,public.profiles,public.tournament_excluded_dates,public.tournament_score_results,
 private.score_audits,private.audit_electors,private.audit_votes,private.audit_events in share mode;
do $$ declare b private.sprint6_backups; current_data jsonb;
begin
 select * into b from private.sprint6_backups where id='before-s6-v1';
 if not found then raise exception 'Backup S6 ausente'; end if;
 current_data:=private.sprint6_snapshot(b.as_of);
 if b.snapshot is distinct from current_data then raise exception 'Comparacao S6 divergente; nao publicar'; end if;
 if exists(select 1 from private.score_audits) then raise exception 'Auditorias ja utilizadas; comparacao anterior ao uso invalida'; end if;
 if exists(select 1 from pg_class where oid in('private.score_audits'::regclass,'private.audit_electors'::regclass,
  'private.audit_votes'::regclass,'private.audit_events'::regclass) and not relrowsecurity) then raise exception 'RLS S6 ausente'; end if;
 if has_table_privilege('authenticated','private.audit_votes','select')
  or has_table_privilege('authenticated','private.score_audits','update')
  or has_function_privilege('anon','public.get_score_audits(uuid)','execute')
  or not has_function_privilege('authenticated','public.vote_score_audit(uuid,text)','execute') then raise exception 'Permissoes S6 inesperadas'; end if;
end $$;
select id,md5(snapshot::text) checksum_backup,md5(private.sprint6_snapshot(as_of)::text) checksum_current,
 snapshot=private.sprint6_snapshot(as_of) preserved from private.sprint6_backups where id='before-s6-v1';
commit;
