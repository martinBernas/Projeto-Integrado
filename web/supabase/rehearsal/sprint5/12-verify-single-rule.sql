-- Read-only comparison of current S5 state against the pre-test reference.
begin;
set transaction isolation level repeatable read, read only;
do $$ begin
 if not exists(select 1 from private.sprint5_backups where id = 'before-s5-single-rule-v1') then
  raise exception 'Referencia anterior aos testes nao encontrada';
 end if;
end $$;
with reference as (
 select b.*, private.sprint5_snapshot(b.as_of) || jsonb_build_object(
  'rule_versions', coalesce((select jsonb_agg(to_jsonb(v) order by id) from public.tournament_rule_versions v), '[]'::jsonb),
  'rule_revision_changes', coalesce((select jsonb_agg(to_jsonb(a) order by id) from private.rule_revision_changes a), '[]'::jsonb)
 ) current_snapshot from private.sprint5_backups b where id = 'before-s5-single-rule-v1'
), differences as (
 select old.key section from reference r cross join lateral jsonb_each(r.snapshot) old
 where old.value is distinct from r.current_snapshot->old.key
)
select id, captured_at, as_of, md5(snapshot::text) checksum_backup,
 md5(current_snapshot::text) checksum_current,
 (select count(*) from differences) different_sections,
 coalesce((select jsonb_agg(section order by section) from differences), '[]'::jsonb) sections
from reference;
commit;
