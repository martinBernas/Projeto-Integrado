-- Execute AFTER reviewing the deployed app. Restores only this rehearsal's scope.
-- Stops if anyone changed personal scores or memberships during the rehearsal.
begin;
do $$
declare
  target constant uuid := '20260900-0000-4000-8000-000000000001';
  saved private.sprint3_rehearsal;
  actual_scores jsonb;
  actual_members jsonb;
begin
  perform 1 from public.tournaments where id = target for update;
  select * into saved from private.sprint3_rehearsal where id = 'september-two-player-v1' for update;
  if not found then raise exception 'Backup do ensaio nao encontrado'; end if;
  if saved.rolled_back_at is not null then raise notice 'Rollback ja concluido'; return; end if;
  select coalesce(jsonb_agg(to_jsonb(s) order by s.id),'[]') into actual_scores
    from public.personal_scores s where s.player_id = any(saved.players) and s.played_on between '2026-09-01' and '2026-09-30';
  select coalesce(jsonb_agg(to_jsonb(p) order by p.player_id),'[]') into actual_members
    from public.tournament_participants p where p.tournament_id = target;
  if actual_scores is distinct from saved.expected_scores or actual_members is distinct from saved.expected_members then
    raise exception 'Dados alterados depois da carga de teste. Rollback interrompido para nao perder alteracoes; solicite conciliacao';
  end if;
  if exists(select 1 from public.tournament_participants where player_id = any(saved.players) and tournament_id <> target) then
    raise exception 'Novo vinculo com outro torneio: revisar antes de restaurar';
  end if;
  delete from public.tournament_score_results where tournament_id = target;
  delete from public.personal_scores where player_id = any(saved.players) and played_on between '2026-09-01' and '2026-09-30';
  insert into public.personal_scores(id,player_id,score,occurred_at,created_at,updated_at,source)
    select id,player_id,score,occurred_at,created_at,updated_at,source
    from jsonb_populate_recordset(null::public.personal_scores,saved.before_scores);
  delete from public.tournament_participants where tournament_id = target;
  insert into public.tournament_participants(tournament_id,player_id,joined_at,eligible_from)
    select tournament_id,player_id,joined_at,eligible_from
    from jsonb_populate_recordset(null::public.tournament_participants,saved.before_members);
  insert into public.tournament_score_results(id,tournament_id,personal_score_id,player_id,applied_score,
    applied_rule_snapshot,created_at,played_on,raw_score,result_kind,provisional,updated_at)
    select id,tournament_id,personal_score_id,player_id,applied_score,applied_rule_snapshot,
      created_at,played_on,raw_score,result_kind,provisional,updated_at
    from jsonb_populate_recordset(null::public.tournament_score_results,saved.before_results);
  update public.tournaments set history_ready = saved.before_ready where id = target;
  update private.sprint3_rehearsal set rolled_back_at = now() where id = saved.id;
end $$;
commit;
select t.name,t.history_ready,b.rolled_back_at
from public.tournaments t cross join private.sprint3_rehearsal b
where t.id = '20260900-0000-4000-8000-000000000001' and b.id = 'september-two-player-v1';
