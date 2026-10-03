-- Run before and immediately after migration, before normal application use.
begin;
set transaction isolation level repeatable read,read only;
do $$ begin
 if not exists(select 1 from private.sprint5_backups where id='before-s5-v1') then raise exception 'Backup S5 nao encontrado'; end if;
end $$;
with reference as (
 select *,private.sprint5_snapshot(as_of) current_snapshot from private.sprint5_backups where id='before-s5-v1'
), differences as (
 select old.key section from reference r cross join lateral jsonb_each(r.snapshot) old
 where old.value is distinct from r.current_snapshot->old.key
)
select id,captured_at,as_of,md5(snapshot::text) checksum_backup,md5(current_snapshot::text) checksum_current,
 (select count(*) from differences) different_sections,
 coalesce((select jsonb_agg(section order by section) from differences),'[]') sections
from reference;
commit;
