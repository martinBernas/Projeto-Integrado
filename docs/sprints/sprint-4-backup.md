# Backup anterior à S4-02

Preparação em 26/09/2026. Alvo: GeoGuaras — Setembro 2026, UUID `20260900-0000-4000-8000-000000000001`. Identificador fixo do backup: `before-s4-02-september-v1`.

## Execução no Supabase

1. Antes de aplicar mudanças da S4-02, executar integralmente [01-backup.sql](../../web/supabase/rehearsal/sprint4/01-backup.sql) no SQL Editor. Guardar o retorno com identificador, horário, data de referência, contagens e checksum.
2. Executar [02-verify.sql](../../web/supabase/rehearsal/sprint4/02-verify.sql). Imediatamente após a captura, o esperado é `diferencas = 0` e checksums iguais. Se houver diferenças, examinar `detalhes` antes de continuar; usuários ativos podem ter lançado pontos entre as duas execuções.
3. Executar [03-export.sql](../../web/supabase/rehearsal/sprint4/03-export.sql) e salvar o resultado completo, como JSON ou CSV, fora do banco. Não copiar apenas o trecho visível da célula. O conteúdo inclui identificadores e pontuações; manter em local privado e fora do Git. A cópia privada no mesmo banco, sozinha, não protege contra perda do projeto inteiro.
4. Reexecutar somente a verificação após cada mudança/ensaio e revisar as diferenças contra o comportamento esperado. Não substituir o backup original nem restaurar dados automaticamente.

O script de captura usa uma transação e bloqueia brevemente escritas nas tabelas envolvidas para obter uma cópia consistente. Se não conseguir o bloqueio em 10 segundos, falha sem captura parcial; executar novamente após o fim da transação anterior. Se o backup já existir, o script recusa sobrescrevê-lo. Conferência e exportação são somente leitura. Nenhum desses scripts recalcula e grava os resultados de produção.

## Conteúdo e limites

- Linha completa do torneio, participantes/elegibilidade, exclusões e perfis dos participantes.
- Todas as pontuações pessoais dos participantes atuais, inclusive fora de setembro, preservando IDs, origem e datas.
- Resultados armazenados e totais equivalentes ao filtro de elegibilidade usado no ranking.
- Cálculo de referência e totais calculados sem escrita, usando a data da captura. Isso permite comparar o motor após mudanças sem que a passagem de dias, sozinha, acrescente penalidades à referência calculada.

A comparação continua considerando pontuações dos participantes originais mesmo se forem removidos do torneio; novos participantes e seus dados aparecem como inclusões. `detalhes` identifica seção, chave, tipo da mudança e valores anteriores/atuais. Novos lançamentos legítimos, correções, atualizações de perfil e recálculos normais também aparecem: diferença não significa automaticamente erro. Resultados armazenados e calculados são comparados separadamente; não se presume que o ranking persistido estivesse atualizado no instante da captura.

É uma cópia dos dados de negócio delimitados acima, não um backup integral de Supabase Auth, senhas, esquema, logs ou de outros torneios. Não inclui restauração automática: qualquer restauração deve ser planejada a partir das diferenças, preservando alterações legítimas posteriores e pontuações compartilhadas. Relatório por e-mail e exclusão continuam fora desta preparação.

## Evidências

Teste local `node --test tests/sprint4-backup.test.mjs` aprovado: captura sem alterar dados ativos, pontuações fora do período incluídas, recusa de sobrescrita, exportação preservada, comparação inicialmente sem diferenças, detecção de pontuação alterada/incluída/excluída, remoção de participante sem perder a comparação de seu histórico e acesso negado aos papéis autenticado/anônimo.

Backup real executado pelo Dono do produto no SQL Editor e exportação recebida como anexo local. Referência confirmada: `before-s4-02-september-v1`, captura em `2026-09-26 13:56:45.612398+00`, data de referência `2026-09-26`, 13 participantes, 215 pontuações pessoais e 234 resultados armazenados. A comparação remota fornecida retornou zero diferenças e detalhes vazios, com checksum do backup e atual iguais a `3d847140e955fd6feaaffab3b252dbe8`.

O anexo exportado foi analisado integralmente como JSON: contém as nove seções esperadas, 13 perfis e as contagens acima. O checksum foi recalculado localmente com PostgreSQL/PGlite (`md5(snapshot::jsonb::text)`) e coincide com a referência remota. SHA-256 do arquivo recebido: `06e3833b5c27fe9ca193e08c99dcef26814274bc859cf5ea126ff604f8d771e3`. Conteúdo privado mantido no anexo da tarefa, fora do repositório; não foi copiado para o Git. A captura, a comparação inicial e a exportação estão verificadas. Não houve restauração nem alteração dos dados reais pelo agente.

Por solicitação do Dono do produto, uma cópia JSON completa foi salva também em `backups/sprint-4/before-s4-02-september-v1.json`, na pasta local do projeto. A regra `/backups/` no `.gitignore` mantém os arquivos dessa pasta fora do versionamento. O arquivo salvo foi relido e seu checksum de conteúdo reconfirmado como `3d847140e955fd6feaaffab3b252dbe8`. O JSON foi formatado para leitura; o SHA-256 do anexo acima identifica o arquivo de origem, não o JSON formatado. Preservar essa cópia local junto da referência no banco.
