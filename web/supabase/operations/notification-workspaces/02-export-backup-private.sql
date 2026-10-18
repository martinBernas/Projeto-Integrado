-- Export the complete result into private ignored storage before notification workspaces migration.
-- Contains personal data and secret votes. Do not paste publicly or commit.
select id,captured_at,as_of,md5(snapshot::text) checksum,snapshot,function_definitions
from private.sprint6_backups where id='before-notifications-20261018-v1';
