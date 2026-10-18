-- Administrative: reuse the validated 005 backup, authorized by the product owner
-- after confirming no business writes since capture. Do not overwrite that backup.
begin isolation level repeatable read read only;
do $$
declare b private.sprint6_backups; current_snapshot jsonb;
begin
 select * into b from private.sprint6_backups where id='before-notifications-20261018-v1';
 if not found then raise exception 'missing_adjustment_filter_backup'; end if;
 if to_regprocedure('public.get_personal_score_changes(integer)') is null
  or to_regprocedure('public.get_managed_score_changes(integer)') is null
  or to_regprocedure('public.get_tournament_score_changes(uuid,integer)') is null then raise exception 'migration_missing'; end if;
 current_snapshot:=private.sprint6_snapshot(b.as_of)||jsonb_build_object(
  'audits',coalesce((select jsonb_agg(to_jsonb(a) order by id) from private.score_audits a),'[]'),
  'electors',coalesce((select jsonb_agg(to_jsonb(e) order by audit_id,player_id) from private.audit_electors e),'[]'),
  'votes',coalesce((select jsonb_agg(to_jsonb(v) order by audit_id,player_id) from private.audit_votes v),'[]'),
  'audit_events',coalesce((select jsonb_agg(to_jsonb(e) order by id) from private.audit_events e),'[]'),
  'retroactive_changes',coalesce((select jsonb_agg(to_jsonb(c) order by id) from private.retroactive_score_changes c),'[]'),
  'retroactive_decisions',coalesce((select jsonb_agg(to_jsonb(d) order by id) from private.score_change_decisions d),'[]'),
  'tournament_inputs',coalesce((select jsonb_agg(to_jsonb(i) order by tournament_id,player_id,played_on) from private.tournament_score_inputs i),'[]'));
 if current_snapshot is distinct from b.snapshot then raise exception 'business_snapshot_changed'; end if;
end $$;
select 'preserved' as business_snapshot, 'installed' as tournament_adjustment_filter;
commit;
