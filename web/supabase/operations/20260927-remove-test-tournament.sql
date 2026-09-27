-- Operação pontual autorizada pelo Dono do produto. Executar no SQL Editor.
-- Remove somente o torneio identificado; vínculos, exclusões e resultados
-- associados são removidos por FK. Pontuações pessoais e auditorias permanecem.
begin;
set local lock_timeout = '5s';

do $$
declare
  target constant uuid := 'de088fbd-6b81-4f4d-a3c5-b4e8683ee73e';
  current_tournament public.tournaments;
begin
  select * into current_tournament from public.tournaments where id = target for update;
  if not found then raise exception 'Torneio não encontrado; nenhuma exclusão realizada.'; end if;
  if current_tournament.name <> 'Teste edicao'
    or current_tournament.starts_at <> date '2026-09-21'
    or current_tournament.ends_at <> date '2026-09-25'
    or current_tournament.closed_at is distinct from timestamptz '2026-09-26 13:45:59.445227+00' then
    raise exception 'Dados do torneio divergem da identificação confirmada; operação cancelada.';
  end if;

  insert into private.tournament_changes(tournament_id, actor_id, old_data, new_data)
  values(target, auth.uid(), to_jsonb(current_tournament),
    jsonb_build_object('operation', 'delete', 'reason', 'Remocao pontual do torneio de teste autorizada pelo Dono do produto', 'database_role', current_user));

  delete from public.tournaments where id = target;
  if exists(select 1 from public.tournaments where id = target) then
    raise exception 'Exclusão não concluída; transação cancelada.';
  end if;
end $$;

select id, name, starts_at, ends_at, closed_at
from public.tournaments order by name, id;
commit;
