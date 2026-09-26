-- Read only. Save the complete result as JSON/CSV outside the database.
-- Contains player identifiers and scores: keep private and out of Git.
select jsonb_build_object(
  'backup_id',id,'tournament_id',tournament_id,'captured_at',captured_at,
  'as_of',as_of,'players',players,'checksum_snapshot',md5(snapshot::text),'snapshot',snapshot
) as backup_completo
from private.sprint4_backups where id='before-s4-02-september-v1';
