-- Pontuacoes brutas de 23/09/2026 informadas pelo Dono do produto.
-- Execute o arquivo inteiro no SQL Editor do Supabase.
-- Repetivel; preserva o estado anterior de preparacao/penalidades.
begin;
create temporary table daily_import (
  name text primary key, player_id uuid unique not null, raw_score integer not null
) on commit drop;

do $$
declare
  leo_id uuid;
  was_ready boolean;
  score_row record;
begin
  select history_ready into strict was_ready from public.tournaments
    where id = '20260900-0000-4000-8000-000000000001' for update;
  -- Identificador confirmado na carga anterior. Ausencia ou ambiguidade aborta.
  select u.id into strict leo_id from auth.users u
    join public.profiles p on p.id = u.id
    where split_part(u.email, '@', 1) = 'leonardohuffo';

  insert into daily_import values
    ('Zade', '55a4aeaf-30bc-403a-a5e6-563328466313', 14715),
    ('Luca', '8d899496-3cb0-41f6-b67d-4e57bb1185c4', 17861),
    ('Leo', leo_id, 12428);

  for score_row in select * from daily_import loop
    perform private.load_september_score(score_row.player_id, date '2026-09-23', score_row.raw_score);
  end loop;
  if exists (
    select 1 from daily_import d left join public.personal_scores s
      on s.player_id = d.player_id and s.played_on = date '2026-09-23'
    where s.id is null or s.score <> d.raw_score
  ) then
    raise exception 'Falha na conferencia das tres pontuacoes';
  end if;
  if was_ready then
    perform private.complete_september_history();
  end if;
end $$;

select d.name, s.played_on, s.score, t.history_ready
from daily_import d
join public.personal_scores s on s.player_id = d.player_id and s.played_on = date '2026-09-23'
join public.tournaments t on t.id = '20260900-0000-4000-8000-000000000001'
order by d.name;
commit;
