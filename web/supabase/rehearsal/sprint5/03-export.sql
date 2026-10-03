-- Contains private data. Save outside Git, e.g. ignored backups/sprint-5/.
select to_jsonb(b) backup_completo,md5(b.snapshot::text) checksum_snapshot
from private.sprint5_backups b where id='before-s5-v1';
