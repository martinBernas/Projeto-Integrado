-- Dono do produto: captura consistente antes dos PDFs e de qualquer remoção.
-- Não altera torneios, participantes ou pontuações. Não sobrescreve referência.
-- Reutiliza infraestrutura privada de backup já aplicada na Sprint 5.
begin isolation level repeatable read;
do $$
declare
  day date := (now() at time zone 'America/Sao_Paulo')::date;
  snapshot jsonb;
begin
  if exists(select 1 from private.sprint5_backups where id='before-september-removal-v1') then
    raise exception 'Backup ja existe; nao sobrescrever';
  end if;
  if (select count(*) from public.tournaments where
    (id='1e7e0238-fd89-49f2-bb2b-4efb99f6db44'::uuid and name='Aztecas - Setembro 2026'
      or id='20260900-0000-4000-8000-000000000001'::uuid and name='GeoGuaras — Setembro 2026')
    and starts_at=date '2026-09-01' and ends_at=date '2026-09-30'
    and closed_at is not null and history_ready) <> 2 then
    raise exception 'Torneios esperados nao encontrados encerrados e com historico pronto; conferir inventario';
  end if;
  snapshot := private.sprint5_snapshot(day) || jsonb_build_object(
    'rule_versions',coalesce((select jsonb_agg(to_jsonb(v) order by id) from public.tournament_rule_versions v),'[]'::jsonb),
    'rule_revision_changes',coalesce((select jsonb_agg(to_jsonb(a) order by id) from private.rule_revision_changes a),'[]'::jsonb));
  insert into private.sprint5_backups(id,as_of,snapshot,function_definitions)
    values('before-september-removal-v1',day,snapshot,'[]'::jsonb);
end $$;
commit;
select id,captured_at,as_of,md5(snapshot::text) checksum,
  jsonb_array_length(snapshot->'tournaments') tournaments,
  jsonb_array_length(snapshot->'scores') personal_scores,
  jsonb_array_length(snapshot->'results') stored_results,
  jsonb_array_length(snapshot->'rule_versions') rule_versions
from private.sprint5_backups where id='before-september-removal-v1';
