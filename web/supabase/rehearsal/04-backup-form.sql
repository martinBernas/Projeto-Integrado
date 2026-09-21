-- Run BEFORE the guided form tests. Does not change scores or memberships.
begin;
create table if not exists private.sprint3_form_test (
  id text primary key,
  test_day date not null,
  players uuid[] not null,
  before_scores jsonb not null,
  before_results jsonb not null,
  before_members jsonb not null,
  started_at timestamptz not null default now(),
  restored_at timestamptz
);
alter table private.sprint3_form_test enable row level security;
revoke all on private.sprint3_form_test from public, anon, authenticated;
do $$
declare
  target constant uuid := '20260900-0000-4000-8000-000000000001';
  accounts constant uuid[] := array['b3afc09f-8eb4-4d1d-ab46-0113b3a7968d'::uuid,'af91b88b-46c0-4c8a-9dd3-be5787b90517'::uuid];
  day_to_test date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  perform 1 from public.tournaments where id = target and history_ready = false for update;
  if not found then raise exception 'Torneio deve estar com historico em preparacao'; end if;
  if (select count(*) from public.profiles p join auth.users u on u.id=p.id where p.id=any(accounts)) <> 2 then
    raise exception 'Uma das duas contas de teste nao foi encontrada';
  end if;
  if exists(select 1 from private.sprint3_form_test where id='form-test-v1') then
    raise exception 'Backup ja existe. Nao substitua o backup; consulte-o antes de continuar';
  end if;
  if exists(select 1 from public.tournament_participants where player_id=any(accounts) and tournament_id<>target) then
    raise exception 'Conta participa de outro torneio; revisar escopo do backup';
  end if;
  if exists(select 1 from public.tournament_participants where tournament_id=target and not(player_id=any(accounts))) then
    raise exception 'Torneio possui outros participantes; revisar escopo do teste';
  end if;
  insert into private.sprint3_form_test(id,test_day,players,before_scores,before_results,before_members)
  values('form-test-v1',day_to_test,accounts,
    coalesce((select jsonb_agg(to_jsonb(s) order by s.id) from public.personal_scores s
      where s.player_id=any(accounts) and s.played_on=day_to_test),'[]'),
    coalesce((select jsonb_agg(to_jsonb(r) order by r.id) from public.tournament_score_results r
      where r.tournament_id=target and r.played_on=day_to_test),'[]'),
    coalesce((select jsonb_agg(to_jsonb(p) order by p.player_id) from public.tournament_participants p
      where p.tournament_id=target),'[]'));
end $$;
commit;
select test_day as data_do_teste,jsonb_array_length(before_scores) as pontuacoes_preexistentes,
  started_at as backup_criado_em
from private.sprint3_form_test where id='form-test-v1';
