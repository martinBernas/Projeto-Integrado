-- Private export of the current capture taken atomically before test removal.
select to_jsonb(b) backup_completo,md5(b.snapshot::text) checksum_snapshot
from private.sprint5_backups b where id='before-s5-test-cleanup-v1';
