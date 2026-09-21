-- Ensaio autorizado pelo Dono do produto: somente duas contas e torneio de setembro.
-- Executar uma vez no SQL Editor; manter 03-rollback.sql disponível.
-- Não altera nomes, contas ou senhas. Guarda o estado anterior antes da carga.
begin;
create table if not exists private.sprint3_rehearsal (
  id text primary key,
  started_at timestamptz not null default now(),
  rolled_back_at timestamptz,
  players uuid[] not null,
  before_ready boolean not null,
  before_scores jsonb not null,
  before_members jsonb not null,
  before_results jsonb not null,
  expected_scores jsonb,
  expected_members jsonb,
  fixtures jsonb
);
alter table private.sprint3_rehearsal enable row level security;
revoke all on private.sprint3_rehearsal from public, anon, authenticated;

do $$
declare
  target constant uuid := '20260900-0000-4000-8000-000000000001';
  owner_id constant uuid := 'b3afc09f-8eb4-4d1d-ab46-0113b3a7968d';
  run_id constant text := 'september-two-player-v1';
  other_id uuid;
  test_players uuid[];
  t public.tournaments;
  day date;
  player uuid;
  value integer;
  sample jsonb := '[]'::jsonb;
begin
  select * into t from public.tournaments where id = target for update;
  if not found then raise exception 'Torneio nao encontrado'; end if;
  if exists(select 1 from private.sprint3_rehearsal where id = run_id) then
    raise exception 'Ensaio ja registrado. Nao reaplicar a carga; consulte o registro e o rollback';
  end if;
  if t.organizer_id <> owner_id or t.history_ready or t.starts_at <> date '2026-09-01'
    or t.ends_at <> date '2026-09-30' or t.scoring_mode <> 'relative_to_lowest'
    or t.absence_penalty <> -2500 or t.weekly_schedule <> 'monday_to_friday'
    or t.timezone <> 'America/Sao_Paulo' then
    raise exception 'Configuracao diferente da esperada; interrompido sem alterar dados';
  end if;
  if (select count(*) from public.tournament_excluded_dates where tournament_id = target) <> 1
    or not exists(select 1 from public.tournament_excluded_dates where tournament_id = target and excluded_date = '2026-09-07') then
    raise exception 'Calendario de exclusoes diferente do esperado';
  end if;
  if (now() at time zone 'America/Sao_Paulo')::date < date '2026-09-18' then
    raise exception 'Este ensaio exige que 18/09/2026 ja tenha sido alcancado';
  end if;
  -- Fail closed rather than guessing the second account when more users exist.
  if (select count(*) from public.profiles) <> 2
    or not exists(select 1 from public.profiles where id = owner_id)
    or (select count(*) from auth.users u join public.profiles p on p.id = u.id) <> 2 then
    raise exception 'Esperadas exatamente duas contas Auth com perfil, incluindo o organizador. Envie a lista de UUIDs para ajustar o ensaio';
  end if;
  select id into other_id from public.profiles where id <> owner_id;
  test_players := array[owner_id, other_id];
  if exists(select 1 from public.tournament_participants where tournament_id = target and not(player_id = any(test_players)))
    or exists(select 1 from public.tournament_participants where tournament_id <> target and player_id = any(test_players)) then
    raise exception 'Ha participantes/torneios fora do escopo; interrompido para preservar seus resultados';
  end if;
  if exists(select 1 from public.tournament_score_results r join public.personal_scores s on s.id = r.personal_score_id
    where r.tournament_id <> target and s.player_id = any(test_players) and s.played_on between t.starts_at and t.ends_at) then
    raise exception 'Pontuacoes utilizadas em outro torneio; interrompido';
  end if;

  insert into private.sprint3_rehearsal(id,players,before_ready,before_scores,before_members,before_results)
  values(run_id, test_players, t.history_ready,
    coalesce((select jsonb_agg(to_jsonb(s) order by s.id) from public.personal_scores s
      where s.player_id = any(test_players) and s.played_on between t.starts_at and t.ends_at),'[]'),
    coalesce((select jsonb_agg(to_jsonb(p) order by p.player_id) from public.tournament_participants p where p.tournament_id = target),'[]'),
    coalesce((select jsonb_agg(to_jsonb(r) order by r.id) from public.tournament_score_results r where r.tournament_id = target),'[]'));

  insert into public.tournament_participants(tournament_id,player_id,eligible_from)
  values(target,owner_id,t.starts_at),(target,other_id,t.starts_at)
  on conflict(tournament_id,player_id) do update set eligible_from = excluded.eligible_from;
  -- Remove only the snapshotted September data, so the planned absences are real.
  delete from public.tournament_score_results where tournament_id = target;
  delete from public.personal_scores where player_id = any(test_players) and played_on between t.starts_at and t.ends_at;

  for day in select d::date from generate_series(t.starts_at::timestamp,
    least(t.ends_at,(now() at time zone 'America/Sao_Paulo')::date)::timestamp, interval '1 day') d loop
    foreach player in array test_players loop
      -- Weekends are normally omitted; 05/09 and 06/09 deliberately exercise exclusions.
      if extract(isodow from day) > 5 and day not in (date '2026-09-05', date '2026-09-06') then continue; end if;
      if day = date '2026-09-04' or (day = date '2026-09-03' and player = other_id) then continue; end if;
      -- Pseudorandom, reproducible integers; independent of real personal results.
      value := 5000 + (('x'||substr(md5('geoguaras-test-v1-'||day::text||case when player = owner_id then '-A' else '-B' end),1,7))::bit(28)::int % 20001);
      if day = date '2026-09-01' then value := case when player = owner_id then 20002 else 16668 end; end if;
      if day = date '2026-09-02' then value := 12000; end if;
      if day = date '2026-09-03' then value := 15000; end if;
      if day = date '2026-09-08' then value := case when player = owner_id then 0 else 18000 end; end if;
      if day = date '2026-09-09' then value := case when player = owner_id then 25000 else 1 end; end if;
      perform private.load_september_score(player,day,value);
      sample := sample || jsonb_build_array(jsonb_build_object('player_id',player,'played_on',day,'raw_score',value));
    end loop;
  end loop;
  -- Validate the preparation state before enabling penalties for this rehearsal.
  if exists(select 1 from public.tournament_score_results where tournament_id = target and (result_kind = 'absence' or not provisional)) then
    raise exception 'Falha: historico em preparacao gerou ausencia ou resultado definitivo';
  end if;
  perform private.complete_september_history();
  update private.sprint3_rehearsal set fixtures = sample,
    expected_scores = coalesce((select jsonb_agg(to_jsonb(s) order by s.id) from public.personal_scores s
      where s.player_id = any(test_players) and s.played_on between t.starts_at and t.ends_at),'[]'),
    expected_members = coalesce((select jsonb_agg(to_jsonb(p) order by p.player_id) from public.tournament_participants p where p.tournament_id = target),'[]')
  where id = run_id;
end $$;
commit;

select p.display_name, s.player_id, s.played_on, s.score as pontuacao_bruta
from public.personal_scores s join public.profiles p on p.id = s.player_id
where s.player_id = any((select players from private.sprint3_rehearsal where id = 'september-two-player-v1')::uuid[])
  and s.played_on between date '2026-09-01' and date '2026-09-30'
order by s.played_on, s.player_id;
