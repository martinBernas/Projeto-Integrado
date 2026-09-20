begin;
alter table public.personal_scores add constraint personal_score_range check (score between 0 and 25000);

create function public.submit_personal_score(game_day date, raw_score integer) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  player uuid := auth.uid();
  today date := (now() at time zone 'America/Sao_Paulo')::date;
  score_id uuid;
  target uuid;
begin
  if player is null then raise exception 'authentication_required' using errcode = '42501'; end if;
  if game_day is null or game_day <> today then raise exception 'current_day_only' using errcode = '22023'; end if;
  if raw_score is null or raw_score < 0 or raw_score > 25000 then
    raise exception 'invalid_score' using errcode = '22023';
  end if;
  -- Lock before changing shared inputs so concurrent rankings cannot persist stale values.
  perform 1 from public.tournaments t where exists (
    select 1 from public.tournament_participants p where p.tournament_id = t.id and p.player_id = player
  ) order by t.id for update;
  insert into public.personal_scores as existing(player_id, occurred_at, score, source)
  values (player, (game_day + time '12:00') at time zone 'America/Sao_Paulo', raw_score, 'player')
  on conflict (player_id, played_on) do update
    set score = excluded.score, source = 'player', updated_at = now()
    where existing.score is distinct from excluded.score
  returning id into score_id;
  if score_id is null then
    select id into score_id from public.personal_scores where player_id = player and played_on = game_day;
  end if;
  for target in select p.tournament_id from public.tournament_participants p where p.player_id = player loop
    perform private.refresh_tournament(target, today);
  end loop;
  return score_id;
end $$;
revoke all on function public.submit_personal_score(date, integer) from public, anon;
grant execute on function public.submit_personal_score(date, integer) to authenticated;

create function private.add_september_participant(player uuid, display_name text) returns void
language plpgsql set search_path = '' as $$
declare target constant uuid := '20260900-0000-4000-8000-000000000001';
begin
  perform 1 from public.tournaments where id = target for update;
  if not found then raise exception 'Provisione o torneio primeiro'; end if;
  if not exists (select 1 from public.profiles where id = player) then
    raise exception 'Jogador deve possuir conta cadastrada';
  end if;
  if display_name is null or length(trim(display_name)) not between 1 and 80 then
    raise exception 'Informe um nome de 1 a 80 caracteres';
  end if;
  update public.profiles set display_name = trim(add_september_participant.display_name) where id = player;
  insert into public.tournament_participants(tournament_id, player_id, eligible_from)
  values(target, player, '2026-09-01') on conflict (tournament_id, player_id) do nothing;
  if found then update public.tournaments set history_ready = false where id = target; end if;
end $$;

create function private.load_september_score(player uuid, game_day date, raw_score integer) returns void
language plpgsql set search_path = '' as $$
declare target constant uuid := '20260900-0000-4000-8000-000000000001';
begin
  perform 1 from public.tournaments where id = target for update;
  if not exists (select 1 from public.tournament_participants where tournament_id = target and player_id = player) then
    raise exception 'Vincule a conta ao torneio antes da carga';
  end if;
  if game_day is null or game_day < date '2026-09-01' or game_day > date '2026-09-30'
    or game_day > (now() at time zone 'America/Sao_Paulo')::date then
    raise exception 'Data fora do periodo ou futura';
  end if;
  if raw_score is null or raw_score not between 0 and 25000 then raise exception 'Pontuacao bruta invalida'; end if;
  -- Close the historical batch explicitly after verifying the Excel's coverage.
  update public.tournaments set history_ready = false where id = target;
  insert into public.personal_scores as existing(player_id, occurred_at, score, source)
  values(player, (game_day + time '12:00') at time zone 'America/Sao_Paulo', raw_score, 'manual_history')
  on conflict (player_id, played_on) do update set
    score = excluded.score, source = 'manual_history', updated_at = now()
  where (existing.score, existing.source) is distinct from (excluded.score, excluded.source);
  perform private.refresh_tournament(target, (now() at time zone 'America/Sao_Paulo')::date);
end $$;

create function private.complete_september_history() returns void
language plpgsql set search_path = '' as $$
declare target constant uuid := '20260900-0000-4000-8000-000000000001';
begin
  perform 1 from public.tournaments where id = target for update;
  if not found then raise exception 'Torneio nao provisionado'; end if;
  if not exists(select 1 from public.tournament_participants where tournament_id = target) then
    raise exception 'Cadastre os participantes antes de concluir a carga';
  end if;
  update public.tournaments set history_ready = true where id = target;
  perform private.refresh_tournament(target, (now() at time zone 'America/Sao_Paulo')::date);
end $$;
revoke all on function private.add_september_participant(uuid, text) from public, anon, authenticated;
revoke all on function private.load_september_score(uuid, date, integer) from public, anon, authenticated;
revoke all on function private.complete_september_history() from public, anon, authenticated;
commit;
