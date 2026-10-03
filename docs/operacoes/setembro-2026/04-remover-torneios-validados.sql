-- Dono do produto: PDFs aceitos em 03/10/2026. Excluir SOMENTE os dois IDs abaixo.
-- Backup atual e conferência na mesma transação; divergência desfaz toda a operação.
begin;
set local lock_timeout='10s';
-- A exportação aprovada representa timestamptz em UTC.
set local timezone='UTC';
lock table public.tournaments,public.tournament_participants,public.personal_scores,
  public.profiles,public.tournament_excluded_dates,public.tournament_score_results,
  public.tournament_rule_versions,private.rule_revision_changes in share row exclusive mode;
do $$
declare
  targets uuid[] := array['1e7e0238-fd89-49f2-bb2b-4efb99f6db44','20260900-0000-4000-8000-000000000001']::uuid[];
  day date := (now() at time zone 'America/Sao_Paulo')::date;
  approved jsonb; before_state jsonb; expected jsonb; after_state jsonb;
  section text; field text; filtered jsonb; reference_rows jsonb; current_rows jsonb;
begin
  select snapshot into approved from private.sprint5_backups where id='before-september-removal-v1';
  if approved is null or md5(approved::text)<>'1a78c55e07146e80bed71225847aca5e' then
    raise exception 'Backup dos PDFs ausente ou divergente';
  end if;
  if exists(select 1 from private.sprint5_backups where id='before-september-delete-v1') then
    raise exception 'Captura da retirada ja existe; nao repetir nem sobrescrever';
  end if;
  if (select count(*) from public.tournaments where id=any(targets)
      and starts_at=date '2026-09-01' and ends_at=date '2026-09-30'
      and closed_at is not null and history_ready)<>2 then
    raise exception 'Alvos nao encontrados encerrados e prontos; retirada recusada';
  end if;
  if exists(select 1 from pg_constraint where contype='f' and confrelid='public.tournaments'::regclass
    and (conrelid not in ('public.tournament_participants'::regclass,'public.tournament_excluded_dates'::regclass,
      'public.tournament_score_results'::regclass,'public.tournament_rule_versions'::regclass) or confdeltype<>'c')) then
    raise exception 'Dependencia nova ou sem cascata; revisar antes de excluir';
  end if;
  before_state := private.sprint5_snapshot(day)||jsonb_build_object(
    'rule_versions',coalesce((select jsonb_agg(to_jsonb(v) order by id) from public.tournament_rule_versions v),'[]'::jsonb),
    'rule_revision_changes',coalesce((select jsonb_agg(to_jsonb(a) order by id) from private.rule_revision_changes a),'[]'::jsonb));
  -- Recusar alterações nos campeonatos após a fonte dos PDFs; novos lançamentos
  -- pessoais e alterações legítimas nos torneios de outubro continuam permitidos.
  for section,field in select * from (values
    ('tournaments','id'),('participants','tournament_id'),('exclusions','tournament_id'),
    ('results','tournament_id'),('calculated','tournament_id'),('rule_versions','tournament_id')) sections loop
    select coalesce(jsonb_agg(e.value order by e.ordinality),'[]'::jsonb) into reference_rows
      from jsonb_array_elements(approved->section) with ordinality e where e.value->>field=any(targets::text[]);
    select coalesce(jsonb_agg(e.value order by e.ordinality),'[]'::jsonb) into current_rows
      from jsonb_array_elements(before_state->section) with ordinality e where e.value->>field=any(targets::text[]);
    if current_rows is distinct from reference_rows then
      raise exception 'Dados do campeonato mudaram apos os PDFs: %; retirada recusada',section;
    end if;
  end loop;
  insert into private.sprint5_backups(id,as_of,snapshot,function_definitions)
    values('before-september-delete-v1',day,before_state,'[]'::jsonb);
  expected := before_state;
  for section,field in select * from (values
    ('tournaments','id'),('participants','tournament_id'),('exclusions','tournament_id'),
    ('results','tournament_id'),('calculated','tournament_id'),('rule_versions','tournament_id')) sections loop
    select coalesce(jsonb_agg(e.value order by e.ordinality),'[]'::jsonb) into filtered
      from jsonb_array_elements(before_state->section) with ordinality e
      where not(e.value->>field=any(targets::text[]));
    expected := jsonb_set(expected,array[section],filtered);
  end loop;
  delete from public.tournaments where id=any(targets);
  after_state := private.sprint5_snapshot(day)||jsonb_build_object(
    'rule_versions',coalesce((select jsonb_agg(to_jsonb(v) order by id) from public.tournament_rule_versions v),'[]'::jsonb),
    'rule_revision_changes',coalesce((select jsonb_agg(to_jsonb(a) order by id) from private.rule_revision_changes a),'[]'::jsonb));
  if after_state is distinct from expected then
    raise exception 'Dados fora dos torneios de setembro divergiram; retirada revertida';
  end if;
end $$;
commit;
select b.id backup_id,b.captured_at,md5(b.snapshot::text) checksum_backup,
  not exists(select 1 from public.tournaments where id in
    ('1e7e0238-fd89-49f2-bb2b-4efb99f6db44','20260900-0000-4000-8000-000000000001')) september_removed,
  (select count(*) from public.tournaments) remaining_tournaments,
  jsonb_array_length(b.snapshot->'scores') preserved_personal_scores
from private.sprint5_backups b where id='before-september-delete-v1';
