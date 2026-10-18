-- Export the complete result into private ignored storage before tournament adjustment filter migration.
-- Contains personal data and secret votes. Do not paste publicly or commit.
select id,captured_at,as_of,md5(snapshot::text) checksum,snapshot,function_definitions
from private.sprint6_backups where id='before-tournament-adjustments-20261018-v1';
