-- Private export: save complete JSON outside Git.
select to_jsonb(b) backup_completo, md5(b.snapshot::text) checksum_snapshot
from private.sprint5_backups b where id = 'before-s5-single-rule-v2';
