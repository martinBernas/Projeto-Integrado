-- Read-only reconciliation, independently computed from the saved test fixtures.
with setup as (
  select b.*, least(date '2026-09-30',(now() at time zone 'America/Sao_Paulo')::date) as last_day
  from private.sprint3_rehearsal b where id = 'september-two-player-v1' and rolled_back_at is null
), days as (
  select d::date as day from setup s cross join lateral
    generate_series(timestamp '2026-09-01',s.last_day::timestamp,interval '1 day') d
  where extract(isodow from d) between 1 and 5 and d::date <> date '2026-09-07'
), fixtures as (
  select f.* from setup s cross join lateral
    jsonb_to_recordset(s.fixtures) as f(player_id uuid,played_on date,raw_score integer)
), inputs as (
  select p.player_id,d.day,f.raw_score,
    min(f.raw_score) filter(where f.raw_score > 0) over(partition by d.day) as minimum
  from setup s cross join lateral unnest(s.players) p(player_id) cross join days d
  left join fixtures f on f.player_id = p.player_id and f.played_on = d.day
), expected as (
  select player_id,day,
    case when raw_score > 0 then raw_score-minimum
      when day < (now() at time zone 'America/Sao_Paulo')::date then -2500 else 0 end as points
  from inputs
), actual as (
  select player_id,played_on,applied_score from public.tournament_score_results
  where tournament_id = '20260900-0000-4000-8000-000000000001'
), compared as (
  select coalesce(e.player_id,a.player_id) as player_id, e.points,a.applied_score,
    (e.points is not null and a.applied_score is not null and e.points = a.applied_score) as ok
  from expected e full join actual a on a.player_id = e.player_id and a.played_on = e.day
)
select p.display_name as jogador,c.player_id,
  sum(c.points) as total_esperado,sum(c.applied_score) as total_aplicado,
  bool_and(c.ok) as todos_os_dias_corretos,
  (select history_ready from public.tournaments where id = '20260900-0000-4000-8000-000000000001') as historico_concluido_para_teste
from compared c join public.profiles p on p.id = c.player_id
group by p.display_name,c.player_id order by total_esperado desc;
