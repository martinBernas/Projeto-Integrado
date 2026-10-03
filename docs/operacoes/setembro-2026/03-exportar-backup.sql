-- Exportação privada: enviar o resultado ao assistente para validar e gerar PDFs.
-- Contém dados pessoais. Não versionar a exportação nem compartilhá-la com jogadores.
select to_jsonb(b) backup_completo, md5(b.snapshot::text) checksum_snapshot
from private.sprint5_backups b where id='before-september-removal-v1';
