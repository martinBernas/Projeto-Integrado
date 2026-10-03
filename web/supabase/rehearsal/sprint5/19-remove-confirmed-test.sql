-- Dono do produto: remove ONLY the confirmed TESTE S5 after functional tests.
-- Preserves raw scores, original tournaments and private audit history.
begin;
set local lock_timeout='10s';
lock table public.tournaments,public.tournament_participants,public.personal_scores,
 public.profiles,public.tournament_excluded_dates,public.tournament_score_results,
 public.tournament_rule_versions,private.rule_revision_changes in share row exclusive mode;
do $$
declare target uuid:='ffb35af7-e582-49b8-bc74-05906df651ca'; t public.tournaments;
 day date:=(now() at time zone 'America/Sao_Paulo')::date;
 before_state jsonb; expected jsonb; after_state jsonb; section text; field text; filtered jsonb;
begin
 select * into t from public.tournaments where id=target for update;
 if not found or t.name<>'TESTE S5' or t.closed_at is not null
  or t.starts_at<>date '2026-09-01' or t.ends_at<>date '2026-10-31' then
  raise exception 'Alvo divergente; retirada recusada';
 end if;
 if (select count(*) from public.tournament_participants where tournament_id=target)<>17
  or (select count(*) from public.tournament_score_results where tournament_id=target)<>544
  or (select count(*) from public.tournament_rule_versions where tournament_id=target)<>9
  or exists(select 1 from public.tournament_excluded_dates where tournament_id=target) then
  raise exception 'Contagens mudaram desde a conferencia; retirada recusada';
 end if;
 if exists(select 1 from private.sprint5_backups where id='before-s5-test-cleanup-v1') then
  raise exception 'Referencia de retirada ja existe; nao sobrescrever';
 end if;
 before_state:=private.sprint5_snapshot(day)||jsonb_build_object(
  'rule_versions',coalesce((select jsonb_agg(to_jsonb(v) order by id) from public.tournament_rule_versions v),'[]'::jsonb),
  'rule_revision_changes',coalesce((select jsonb_agg(to_jsonb(a) order by id) from private.rule_revision_changes a),'[]'::jsonb));
 insert into private.sprint5_backups(id,as_of,snapshot,function_definitions)
 values('before-s5-test-cleanup-v1',day,before_state,'[]'::jsonb);
 expected:=before_state;
 for section,field in select * from (values
  ('tournaments','id'),('participants','tournament_id'),('exclusions','tournament_id'),
  ('results','tournament_id'),('calculated','tournament_id'),('rule_versions','tournament_id')) sections loop
  select coalesce(jsonb_agg(e.value order by e.ordinality),'[]'::jsonb) into filtered
  from jsonb_array_elements(before_state->section) with ordinality e
  where e.value->>field is distinct from target::text;
  expected:=jsonb_set(expected,array[section],filtered);
 end loop;
 delete from public.tournaments where id=target;
 after_state:=private.sprint5_snapshot(day)||jsonb_build_object(
  'rule_versions',coalesce((select jsonb_agg(to_jsonb(v) order by id) from public.tournament_rule_versions v),'[]'::jsonb),
  'rule_revision_changes',coalesce((select jsonb_agg(to_jsonb(a) order by id) from private.rule_revision_changes a),'[]'::jsonb));
 if after_state is distinct from expected then
  raise exception 'Dados fora do torneio de teste divergiram; retirada revertida';
 end if;
end $$;
commit;
select b.id backup_id,b.captured_at,md5(b.snapshot::text) checksum_backup,
 not exists(select 1 from public.tournaments where id='ffb35af7-e582-49b8-bc74-05906df651ca') test_removed,
 (select count(*) from public.tournaments) remaining_tournaments,
 jsonb_array_length(b.snapshot->'scores') preserved_personal_scores
from private.sprint5_backups b where b.id='before-s5-test-cleanup-v1';
