-- Private export: do not paste snapshot in documentation or track it in Git.
select id,captured_at,as_of,snapshot,function_definitions,md5(snapshot::text) checksum
from private.sprint6_backups where id='before-s6-v1';
