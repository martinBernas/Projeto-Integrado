-- Exportar e guardar de forma privada depois da retirada, sem versionar os dados.
select to_jsonb(b) backup_completo,md5(b.snapshot::text) checksum_snapshot
from private.sprint5_backups b where id='before-september-delete-v1';
