-- Read-only comparison against the original capture, at its fixed reference day.
-- An empty list of differences means unchanged, not necessarily a correct ranking.
begin;
set transaction isolation level repeatable read, read only;
do $$ begin
  if not exists(select 1 from private.sprint4_backups where id='before-s4-02-september-v1') then
    raise exception 'Backup nao encontrado. Execute 01-backup.sql primeiro.';
  end if;
end $$;
with baseline as (
  select *, private.sprint4_snapshot(tournament_id,players,as_of) as current_snapshot
  from private.sprint4_backups where id='before-s4-02-september-v1'
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
