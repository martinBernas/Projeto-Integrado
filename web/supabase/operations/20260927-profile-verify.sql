-- Read-only comparison of original fields, excluding the two profile fields added by S4-04/S4-05.
-- Does not replace or rewrite the original backup. Profile edits after migration still change display_name.
-- An empty list of differences means unchanged, not necessarily a correct ranking.
begin;
set transaction isolation level repeatable read, read only;
do $$ begin
  if not exists(select 1 from private.sprint4_backups where id='before-s4-02-september-v1') then
    raise exception 'Backup original nao encontrado. Confira o ambiente e a referencia antes de prosseguir.';
  end if;
end $$;
with captured as materialized (
  select *, private.sprint4_snapshot(tournament_id,players,as_of) as raw_current_snapshot
  from private.sprint4_backups where id='before-s4-02-september-v1'
), baseline as (
  select *, jsonb_set(raw_current_snapshot, '{profiles}',
    (select coalesce(jsonb_object_agg(key,value - 'public_name_confirmed' - 'geoguessr_url'),'{}'::jsonb)
     from jsonb_each(raw_current_snapshot->'profiles'))) as current_snapshot
  from captured
), differences as (
  select old_section.key as section, rows_diff.*
  from baseline b
  cross join lateral jsonb_each(b.snapshot) old_section
  cross join lateral (
    select coalesce(old_row.key,new_row.key) as row_key,
      case when old_row.key is null then 'added' when new_row.key is null then 'removed' else 'changed' end as change,
      old_row.value as before, new_row.value as after
    from jsonb_each(old_section.value) old_row
    full join jsonb_each(b.current_snapshot->old_section.key) new_row on new_row.key=old_row.key
    where old_row.value is distinct from new_row.value
  ) rows_diff
)
select b.id as backup_id, b.captured_at, b.as_of as data_referencia,
  md5(b.snapshot::text) as checksum_backup,
  md5(b.current_snapshot::text) as checksum_atual,
  (select count(*) from differences) as diferencas,
  coalesce((select jsonb_agg(to_jsonb(d) order by section,row_key) from differences d),'[]') as detalhes
from baseline b;
commit;
