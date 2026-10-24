-- Complete JSON only, stored privately; may include personal data and PDF.
select jsonb_build_object('id',id,'captured_at',captured_at,'as_of',as_of,'snapshot',snapshot,
 'function_definitions',function_definitions,'snapshot_md5',md5(snapshot::text),'functions_md5',md5(function_definitions::text)) backup
from private.sprint8_backups where id='before-gmail-reports-20261024-v1';
