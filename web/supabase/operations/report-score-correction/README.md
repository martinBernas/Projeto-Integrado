# Correção do gráfico de relatórios

Reenvio pontual posterior à substituição: `05-force-resend-approved.sql` (uma única execução, reativa 24 envios e pode disparar o worker após commit), com backup dos registros anteriores na tabela privada já existente. `06-resend-status.sql` acompanha os estados sem endereços. Não exige nova publicação nem implementa funcionalidade. [Procedimento/testes](../../../../docs/sprints/sprint-8-reenvio-pontual.md). A substituição dos PDFs v5 já foi concluída; não repetir os scripts anteriores para reenviar.

Estado atual: v5 aprovada, PDFs HCM e Aztecas preparados/conferidos; publicação ainda não realizada segundo o Dono do produto. Próxima etapa remota após publicar:

- `03-backup-approved-targets.sql`: somente leitura; exportar as duas linhas como JSON privado em `backups/`, sem colar endereços na conversa.
- `web/scripts/verify-report-replacement-backup.mjs`: verificar localmente esse backup contra as duas capturas e registrar SHA-256/contagens, sem imprimir campos privados.
- `replace-reviewed-report.sql`: scripts privados de cada PDF, gerados pelo CLI e preservados fora do Git; executar somente depois de validar o backup.
- `04-verify-replaced-targets.sql`: somente leitura; confirmar PDF novo e preservação de snapshot, geração, prazo e contadores.

[Sequência e comandos atuais](../../../../docs/sprints/sprint-8-correcao-grafico-operacao.md). Não há migração, reabertura de torneio ou reenvio nesta manutenção.


Operação administrativa delimitada, sem migração e sem reenvio. Ver [procedimento completo](../../../../docs/sprints/sprint-8-correcao-grafico-operacao.md).

`01-inventory-and-export.sql` somente lê: inventário de encerrados e exportação privada do HCM - Outubro. Não reivindica lease nem altera captura/retirada. Exportar a segunda consulta como JSON em `backups/` antes do prazo de retirada.

O CLI `web/scripts/preview-tournament-report.mjs` gera prévia offline. Com `--prepare-replacement`, prepara SQL privado de backup e substituição para exatamente o ID/checksums da exportação. Executá-los remotamente somente depois do aceite da prévia, publicação do renderizador e validação do backup completo do alvo. Não redefinir fila/envios nem reutilizar o SQL para outro torneio. Saídas e dados pessoais não devem ser versionados.


31/10/2026 — V5 aprovada pelo Dono do produto para avançar com publicação e regeneração HCM/Aztecas. Próxima consulta: `02-approved-targets-and-aztecas-export.sql`, somente leitura, alvos delimitados. Primeiro resultado atualiza estado/checksums; segundo exporta uma captura Aztecas sem endereços. Gravações e distribuição de retificação por e-mail não fazem parte dessa consulta. Publicação e substituição remota ainda precisam de evidência.
