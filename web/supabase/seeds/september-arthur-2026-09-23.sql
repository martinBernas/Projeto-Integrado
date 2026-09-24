-- Arthur Andrade: 17.545 pontos em 23/09/2026, informados em 24/09.
-- Execute integralmente no SQL Editor. Repetivel e transacional.
begin;
do $$
declare
  arthur_id uuid;
  was_ready boolean;
begin
  select history_ready into strict was_ready from public.tournaments
    where id = '20260900-0000-4000-8000-000000000001' for update;
  -- Identificador confirmado na carga de 22/09. Ausencia/ambiguidade aborta.
  select u.id into strict arthur_id from auth.users u
    join public.profiles p on p.id = u.id
    where split_part(u.email, '@', 1) = 'arthur.andrade';

  perform private.load_september_score(arthur_id, date '2026-09-23', 17545);
  if not exists (select 1 from public.personal_scores
    where player_id = arthur_id and played_on = date '2026-09-23' and score = 17545) then
    raise exception 'Falha na conferencia da pontuacao de Arthur';
  end if;
  if was_ready then
    perform private.complete_september_history();
  end if;
end $$;

select p.display_name as name, s.played_on, s.score, t.history_ready
from public.personal_scores s
join auth.users u on u.id = s.player_id
join public.profiles p on p.id = u.id
join public.tournaments t on t.id = '20260900-0000-4000-8000-000000000001'
where split_part(u.email, '@', 1) = 'arthur.andrade'
  and s.played_on = date '2026-09-23';
commit;
