-- Luca e Zade: UUIDs e inicio em 01/09 confirmados pelo Dono do produto em 23/09.
-- Fonte: GeoGuaras.xlsx versionado, aba Diario, ate 22/09/2026.
-- SHA256: e74d1a6560a56ee1f7d3103df641199fbf308b2a5e735a46b6e0082bf93efcc4
-- 14 resultados de Luca e 15 de Zade. Nao inclui 23/09.
-- Executar integralmente no SQL Editor do Supabase como administrador.
-- Preserva a preparacao anterior: se penalidades estavam ativas, reativa ao final.
begin;
select id from public.tournaments where id='20260900-0000-4000-8000-000000000001' for update;
create temporary table new_players(name text primary key, player_id uuid unique not null) on commit drop;
insert into new_players values
('Luca', '8d899496-3cb0-41f6-b67d-4e57bb1185c4'),
('Zade', '55a4aeaf-30bc-403a-a5e6-563328466313');
create temporary table previous_history on commit drop as
select history_ready from public.tournaments where id = '20260900-0000-4000-8000-000000000001';
create temporary table new_scores(name text references new_players(name), game_day date, raw_score integer,
  primary key(name, game_day), check(raw_score between 0 and 25000)) on commit drop;
insert into new_scores values
('Luca', '2026-09-01', 7560),
('Luca', '2026-09-02', 13528),
('Luca', '2026-09-03', 12511),
('Luca', '2026-09-04', 16659),
('Luca', '2026-09-08', 9690),
('Luca', '2026-09-09', 19534),
('Luca', '2026-09-10', 8846),
('Luca', '2026-09-11', 11355),
('Luca', '2026-09-14', 15149),
('Luca', '2026-09-15', 15694),
('Luca', '2026-09-16', 19008),
('Luca', '2026-09-17', 20195),
('Luca', '2026-09-21', 18406),
('Luca', '2026-09-22', 17586),
('Zade', '2026-09-01', 20918),
('Zade', '2026-09-02', 14071),
('Zade', '2026-09-03', 13078),
('Zade', '2026-09-04', 20708),
('Zade', '2026-09-08', 11176),
('Zade', '2026-09-09', 12972),
('Zade', '2026-09-10', 7379),
('Zade', '2026-09-11', 14231),
('Zade', '2026-09-14', 16223),
('Zade', '2026-09-15', 15382),
('Zade', '2026-09-16', 15014),
('Zade', '2026-09-17', 15815),
('Zade', '2026-09-18', 5408),
('Zade', '2026-09-21', 14546),
('Zade', '2026-09-22', 21829);
do $$
declare p record; score_row record;
begin
  if not exists(select 1 from previous_history) then
    raise exception 'Torneio de setembro nao encontrado';
  end if;
  if exists(select 1 from new_players n left join auth.users u on u.id=n.player_id
    left join public.profiles pr on pr.id=u.id where u.id is null or pr.id is null) then
    raise exception 'Conta ou perfil ausente. Confira os UUIDs antes da carga';
  end if;
  for p in select * from new_players loop
    perform private.add_september_participant(p.player_id, p.name);
    update public.tournament_participants set eligible_from = date '2026-09-01'
      where tournament_id = '20260900-0000-4000-8000-000000000001' and player_id = p.player_id;
  end loop;
  for score_row in select n.player_id, s.game_day, s.raw_score from new_scores s join new_players n using(name)
    order by s.game_day, n.name loop
    perform private.load_september_score(score_row.player_id, score_row.game_day, score_row.raw_score);
  end loop;
  if exists(select 1 from new_scores s join new_players n using(name)
    left join public.personal_scores a on a.player_id=n.player_id and a.played_on=s.game_day
    where a.id is null or a.score <> s.raw_score) then
    raise exception 'Falha na conciliacao das 29 pontuacoes';
  end if;
  if (select history_ready from previous_history) then
    perform private.complete_september_history();
  end if;
end $$;
select n.name, n.player_id, p.eligible_from, count(s.game_day) as scores_imported
from new_players n join public.tournament_participants p on p.player_id=n.player_id
  and p.tournament_id='20260900-0000-4000-8000-000000000001'
join new_scores s using(name) group by n.name,n.player_id,p.eligible_from order by n.name;
select history_ready from public.tournaments where id='20260900-0000-4000-8000-000000000001';
commit;
