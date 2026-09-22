-- GeoGuaras.xlsx / Diario, 01 a 22/09/2026.
-- SHA256: e74d1a6560a56ee1f7d3103df641199fbf308b2a5e735a46b6e0082bf93efcc4
-- 11 contas confirmadas na coluna C; 148 pontuacoes brutas.
-- Sem cadastro (nao incluidos): Luca, Ramiro, Zade, Marcelo.
-- Execute integralmente no SQL Editor do Supabase, como administrador.
-- Requer as tres migracoes existentes e o seed september.sql ja aplicados.
-- Nao cria contas. Nao conclui o historico nem ativa penalidades por faltas.
-- O cadastro usa e-mail: identificadores C devem corresponder EXATAMENTE
-- a parte anterior ao @ em auth.users.email. Zero ou multiplas contas abortam.
-- Se o identificador nao for esse, substitua o resolvedor por UUIDs conferidos.
begin;
create temporary table import_players (
  name text not null, account text primary key, player_id uuid unique
) on commit drop;
insert into import_players(name, account) values
('Leo', 'leonardohuffo'),
('Martin', 'martin.bernasconi'),
('Fabio', 'fabio.teixeira.sap'),
('Arthur', 'arthur.andrade'),
('Tales', 'tales.ocampos'),
('Diana', 'dianaseibt'),
('Luiz', 'luizf9844'),
('Vinicius', 'ramos.viniciusuriel'),
('Eduardo', 'eduardobrohr2'),
('Cristina', 'crisbobsin'),
('Bastian', 'math.9711');

-- Validar todas as identidades antes de qualquer escrita persistente.
do $$
declare p record; matches integer; resolved uuid;
begin
  if not exists (select 1 from public.tournaments
    where id = '20260900-0000-4000-8000-000000000001') then
    raise exception 'Execute primeiro o seed september.sql';
  end if;
  for p in select * from import_players loop
    select count(*) into matches from auth.users u
      join public.profiles pr on pr.id = u.id
      where split_part(u.email, '@', 1) = p.account;
    if matches <> 1 then
      raise exception 'Conta %: % correspondencias. Confira o UUID antes de carregar.', p.account, matches;
    end if;
    select u.id into resolved from auth.users u
      join public.profiles pr on pr.id = u.id
      where split_part(u.email, '@', 1) = p.account;
    update import_players set player_id = resolved where account = p.account;
  end loop;
end $$;

create temporary table import_scores (
  account text references import_players(account), game_day date, raw_score integer,
  primary key(account, game_day), check (raw_score between 0 and 25000)
) on commit drop;
insert into import_scores values
('leonardohuffo', '2026-09-01', 16757),
('leonardohuffo', '2026-09-02', 18501),
('leonardohuffo', '2026-09-03', 19000),
('leonardohuffo', '2026-09-04', 17483),
('leonardohuffo', '2026-09-08', 7254),
('leonardohuffo', '2026-09-09', 19004),
('leonardohuffo', '2026-09-10', 15850),
('leonardohuffo', '2026-09-11', 11279),
('leonardohuffo', '2026-09-14', 16641),
('leonardohuffo', '2026-09-15', 15479),
('leonardohuffo', '2026-09-16', 18731),
('leonardohuffo', '2026-09-17', 20358),
('leonardohuffo', '2026-09-18', 20607),
('leonardohuffo', '2026-09-21', 17314),
('leonardohuffo', '2026-09-22', 19445),
('martin.bernasconi', '2026-09-01', 14427),
('martin.bernasconi', '2026-09-02', 14928),
('martin.bernasconi', '2026-09-03', 14240),
('martin.bernasconi', '2026-09-04', 20403),
('martin.bernasconi', '2026-09-08', 6757),
('martin.bernasconi', '2026-09-09', 22421),
('martin.bernasconi', '2026-09-10', 7030),
('martin.bernasconi', '2026-09-11', 18575),
('martin.bernasconi', '2026-09-14', 22367),
('martin.bernasconi', '2026-09-15', 16070),
('martin.bernasconi', '2026-09-16', 11888),
('martin.bernasconi', '2026-09-17', 15573),
('martin.bernasconi', '2026-09-18', 15379),
('martin.bernasconi', '2026-09-21', 22051),
('martin.bernasconi', '2026-09-22', 18063),
('fabio.teixeira.sap', '2026-09-01', 11188),
('fabio.teixeira.sap', '2026-09-02', 10020),
('fabio.teixeira.sap', '2026-09-03', 10256),
('fabio.teixeira.sap', '2026-09-04', 14968),
('fabio.teixeira.sap', '2026-09-08', 14499),
('fabio.teixeira.sap', '2026-09-09', 18630),
('fabio.teixeira.sap', '2026-09-10', 8344),
('fabio.teixeira.sap', '2026-09-11', 15266),
('fabio.teixeira.sap', '2026-09-14', 9157),
('fabio.teixeira.sap', '2026-09-15', 15563),
('fabio.teixeira.sap', '2026-09-16', 10573),
('fabio.teixeira.sap', '2026-09-17', 17165),
('fabio.teixeira.sap', '2026-09-18', 13299),
('fabio.teixeira.sap', '2026-09-21', 13648),
('fabio.teixeira.sap', '2026-09-22', 23442),
('arthur.andrade', '2026-09-01', 15383),
('arthur.andrade', '2026-09-02', 19596),
('arthur.andrade', '2026-09-04', 20060),
('arthur.andrade', '2026-09-08', 15787),
('arthur.andrade', '2026-09-09', 22485),
('arthur.andrade', '2026-09-10', 13741),
('arthur.andrade', '2026-09-11', 16688),
('arthur.andrade', '2026-09-14', 17859),
('arthur.andrade', '2026-09-15', 17002),
('arthur.andrade', '2026-09-16', 21178),
('arthur.andrade', '2026-09-17', 19634),
('arthur.andrade', '2026-09-18', 12019),
('arthur.andrade', '2026-09-21', 16800),
('arthur.andrade', '2026-09-22', 19640),
('tales.ocampos', '2026-09-01', 14955),
('tales.ocampos', '2026-09-02', 20138),
('tales.ocampos', '2026-09-03', 18272),
('tales.ocampos', '2026-09-04', 19232),
('tales.ocampos', '2026-09-08', 13727),
('tales.ocampos', '2026-09-09', 19118),
('tales.ocampos', '2026-09-10', 14984),
('tales.ocampos', '2026-09-11', 14951),
('tales.ocampos', '2026-09-14', 18756),
('tales.ocampos', '2026-09-15', 20081),
('tales.ocampos', '2026-09-16', 17266),
('tales.ocampos', '2026-09-17', 18741),
('tales.ocampos', '2026-09-18', 17270),
('tales.ocampos', '2026-09-21', 22074),
('dianaseibt', '2026-09-01', 4582),
('dianaseibt', '2026-09-02', 19461),
('dianaseibt', '2026-09-04', 23079),
('dianaseibt', '2026-09-08', 12470),
('dianaseibt', '2026-09-09', 20916),
('dianaseibt', '2026-09-10', 15296),
('dianaseibt', '2026-09-11', 14662),
('dianaseibt', '2026-09-14', 16825),
('dianaseibt', '2026-09-15', 16426),
('dianaseibt', '2026-09-16', 18636),
('dianaseibt', '2026-09-17', 17383),
('dianaseibt', '2026-09-18', 15119),
('dianaseibt', '2026-09-21', 17305),
('dianaseibt', '2026-09-22', 19040),
('luizf9844', '2026-09-01', 9463),
('luizf9844', '2026-09-03', 15339),
('luizf9844', '2026-09-04', 14051),
('luizf9844', '2026-09-08', 3882),
('luizf9844', '2026-09-09', 17923),
('luizf9844', '2026-09-10', 6031),
('luizf9844', '2026-09-11', 17042),
('luizf9844', '2026-09-14', 13865),
('luizf9844', '2026-09-15', 19835),
('luizf9844', '2026-09-16', 13412),
('luizf9844', '2026-09-17', 11051),
('luizf9844', '2026-09-18', 12795),
('luizf9844', '2026-09-21', 11069),
('luizf9844', '2026-09-22', 20766),
('ramos.viniciusuriel', '2026-09-01', 10576),
('ramos.viniciusuriel', '2026-09-02', 11021),
('ramos.viniciusuriel', '2026-09-03', 16616),
('ramos.viniciusuriel', '2026-09-04', 15916),
('ramos.viniciusuriel', '2026-09-08', 11671),
('ramos.viniciusuriel', '2026-09-09', 19717),
('ramos.viniciusuriel', '2026-09-10', 9469),
('ramos.viniciusuriel', '2026-09-11', 14119),
('ramos.viniciusuriel', '2026-09-14', 11950),
('ramos.viniciusuriel', '2026-09-15', 13849),
('ramos.viniciusuriel', '2026-09-16', 17759),
('ramos.viniciusuriel', '2026-09-17', 10524),
('ramos.viniciusuriel', '2026-09-18', 7583),
('ramos.viniciusuriel', '2026-09-21', 11498),
('ramos.viniciusuriel', '2026-09-22', 19281),
('eduardobrohr2', '2026-09-01', 12189),
('eduardobrohr2', '2026-09-02', 11117),
('eduardobrohr2', '2026-09-03', 8967),
('eduardobrohr2', '2026-09-04', 12075),
('eduardobrohr2', '2026-09-08', 3673),
('eduardobrohr2', '2026-09-09', 10529),
('eduardobrohr2', '2026-09-10', 10406),
('eduardobrohr2', '2026-09-11', 9835),
('eduardobrohr2', '2026-09-14', 8252),
('eduardobrohr2', '2026-09-15', 13448),
('eduardobrohr2', '2026-09-16', 18483),
('eduardobrohr2', '2026-09-17', 16538),
('eduardobrohr2', '2026-09-18', 9311),
('eduardobrohr2', '2026-09-21', 13906),
('eduardobrohr2', '2026-09-22', 18456),
('crisbobsin', '2026-09-01', 8735),
('crisbobsin', '2026-09-02', 17470),
('crisbobsin', '2026-09-03', 18553),
('crisbobsin', '2026-09-09', 18498),
('crisbobsin', '2026-09-11', 11321),
('crisbobsin', '2026-09-14', 12230),
('crisbobsin', '2026-09-15', 16657),
('crisbobsin', '2026-09-16', 17911),
('crisbobsin', '2026-09-17', 15934),
('crisbobsin', '2026-09-18', 13380),
('crisbobsin', '2026-09-21', 16434),
('crisbobsin', '2026-09-22', 17218),
('math.9711', '2026-09-16', 16893),
('math.9711', '2026-09-17', 18504),
('math.9711', '2026-09-18', 14199),
('math.9711', '2026-09-21', 19202),
('math.9711', '2026-09-22', 18275);

do $$
declare player_row record; score_row record;
begin
  for player_row in select * from import_players order by account loop
    perform private.add_september_participant(player_row.player_id, player_row.name);
  end loop;
  for score_row in select p.player_id, s.game_day, s.raw_score
    from import_scores s join import_players p using(account)
    order by s.game_day, p.account loop
    perform private.load_september_score(score_row.player_id, score_row.game_day, score_row.raw_score);
  end loop;
  if exists (
    select 1 from import_scores s join import_players p using(account)
    left join public.personal_scores actual
      on actual.player_id = p.player_id and actual.played_on = s.game_day
    where actual.id is null or actual.score <> s.raw_score
  ) then
    raise exception 'Falha na conciliacao da carga';
  end if;
end $$;

-- Resumo da carga conferida. Lacunas nao foram convertidas em zero.
select p.name, p.account, p.player_id, count(s.game_day) as scores_imported
from import_players p left join import_scores s using(account)
group by p.name, p.account, p.player_id order by p.name;
commit;
