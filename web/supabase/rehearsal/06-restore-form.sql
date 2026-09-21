-- Run AFTER the guided tests. Does not use the earlier historical-load rollback.
begin;
do $$
declare
  target constant uuid := '20260900-0000-4000-8000-000000000001';
  backup private.sprint3_form_test;
  members_now jsonb;
begin
  perform 1 from public.tournaments where id=target and history_ready=false for update;
  if not found then raise exception 'Historico foi alterado; revisar antes de restaurar'; end if;
  select * into backup from private.sprint3_form_test where id='form-test-v1' for update;
  if not found then raise exception 'Backup nao encontrado'; end if;
  if backup.restored_at is not null then raise notice 'Restauracao ja concluida'; return; end if;
  select coalesce(jsonb_agg(to_jsonb(p) order by p.player_id),'[]') into members_now
    from public.tournament_participants p where p.tournament_id=target;
  if members_now is distinct from backup.before_members or exists(
    select 1 from public.tournament_participants where player_id=any(backup.players) and tournament_id<>target
  ) then raise exception 'Vinculos alterados; revisar antes de restaurar'; end if;
  -- Only remove the prescribed test values (or untouched original records).
  if exists(select 1 from public.personal_scores s
    where s.player_id=any(backup.players) and s.played_on=backup.test_day
      and not (backup.before_scores @> jsonb_build_array(to_jsonb(s)))
      and not (s.source='player' and (
        (s.player_id=backup.players[1] and s.score in (10000,12000)) or
        (s.player_id=backup.players[2] and s.score=15000)
      ))) then raise exception 'Pontuacao diferente dos valores de teste; revisar para nao perder dados'; end if;
  -- Every result in the affected day depends on its minimum positive score.
  delete from public.tournament_score_results where tournament_id=target and played_on=backup.test_day;
  delete from public.personal_scores where player_id=any(backup.players) and played_on=backup.test_day;
  insert into public.personal_scores(id,player_id,score,occurred_at,created_at,updated_at,source)
    select id,player_id,score,occurred_at,created_at,updated_at,source
    from jsonb_populate_recordset(null::public.personal_scores,backup.before_scores);
  insert into public.tournament_score_results(id,tournament_id,personal_score_id,player_id,applied_score,
    applied_rule_snapshot,created_at,played_on,raw_score,result_kind,provisional,updated_at)
    select id,tournament_id,personal_score_id,player_id,applied_score,applied_rule_snapshot,
      created_at,played_on,raw_score,result_kind,provisional,updated_at
    from jsonb_populate_recordset(null::public.tournament_score_results,backup.before_results);
  update private.sprint3_form_test set restored_at=now() where id=backup.id;
end $$;
commit;
select b.test_day,b.restored_at,t.history_ready from private.sprint3_form_test b
cross join public.tournaments t
where b.id='form-test-v1' and t.id='20260900-0000-4000-8000-000000000001';
