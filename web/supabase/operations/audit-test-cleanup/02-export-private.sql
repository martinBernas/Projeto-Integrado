-- Export the result to private ignored storage. Contains personal data; do not commit/share publicly.
select id,captured_at,target_id,md5(snapshot::text) checksum,snapshot
from private.maintenance_backups where id='before-audit-test-removal-20261018-v1';
