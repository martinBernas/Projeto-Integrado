-- Administrative, before enabling the new interface and while business writes remain paused.
begin isolation level repeatable read read only;
do $$
declare b private.sprint6_backups; current_snapshot jsonb;
begin
 select * into b from private.sprint6_backups where id='before-retroactive-20261018-v1';
 if not found then raise exception 'missing_retroactive_backup'; end if;
 if to_regprocedure('public.submit_retroactive_score(date,integer,text)') is null
  or to_regprocedure('public.review_score_change(uuid,boolean)') is null then raise exception 'migration_missing'; end if;
 current_snapshot:=private.sprint6_snapshot(b.as_of)||jsonb_build_object(
  'audits',coalesce((select jsonb_agg(to_jsonb(a) order by id) from private.score_audits a),'[]'),
  'electors',coalesce((select jsonb_agg(to_jsonb(e) order by audit_id,player_id) from private.audit_electors e),'[]'),
  'votes',coalesce((select jsonb_agg(to_jsonb(v) order by audit_id,player_id) from private.audit_votes v),'[]'),
  'audit_events',coalesce((select jsonb_agg(to_jsonb(e) order by id) from private.audit_events e),'[]'));
 if current_snapshot is distinct from b.snapshot then raise exception 'business_snapshot_changed'; end if;
 if exists(select 1 from private.retroactive_score_changes) or exists(select 1 from private.score_change_decisions)
  or exists(select 1 from private.tournament_score_inputs) then raise exception 'new_feature_already_used'; end if;
end $$;
select 'preserved' as business_snapshot, 'installed' as retroactive_scores;
commit;
