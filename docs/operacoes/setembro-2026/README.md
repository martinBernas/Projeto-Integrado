# Relatórios e retirada dos torneios de setembro de 2026

Atividade operacional fora do escopo do projeto e da Sprint 5, solicitada em 03/10/2026. Dono do produto escolheu remover os torneios após backup e validação dos PDFs, com um relatório por torneio. Supabase executado exclusivamente pelo Dono do produto; nenhuma operação remota foi realizada pelo assistente.

Captura privada anterior indica dois alvos já encerrados: Aztecas - Setembro 2026 e GeoGuaras — Setembro 2026, ambos de 01/09 a 30/09/2026. Isso não substitui inventário/captura atuais. Encerrar no sistema congela resultados, mas não os oculta; a retirada solicitada será posterior aos relatórios, sem alteração da aplicação.

## Sequência

1. Executar 01-inventario.sql e conferir nomes, períodos, encerramento e contagens.
2. Executar 02-capturar-backup.sql. Captura consistente na infraestrutura privada existente; não sobrescreve referência nem altera dados de negócio. Recusa alvos diferentes, abertos ou com histórico incompleto.
3. Executar 03-exportar-backup.sql e fornecer exportação privada completa e resumo do backup. Validar checksum, salvar fora do versionamento e conferir dados finais antes de gerar PDFs.
4. Gerar e validar visualmente um PDF por torneio com classificação final completa, regras, participação e destaques. Usar nomes públicos; não incluir e-mails, IDs de conta, credenciais ou detalhes de backup.
5. PDFs aceitos pelo Dono do produto. Executar 04-remover-torneios-validados.sql: valida referência dos PDFs, os dois IDs e encerramento; recusa dependências inesperadas e dados do campeonato alterados. Captura atual before-september-delete-v1 e comparação transacional preservam pontuações pessoais, contas, auditorias e torneios de outubro. Não restaurar base inteira.
6. Executar 05-exportar-captura-da-retirada.sql e guardar/exportar de forma privada. Conferir saída da retirada e painel atualizado.

## Métricas previstas para os PDFs

Classificação pelo total aplicado final, com empates compartilhando posição. Participação: resultados válidos, ausências consolidadas e dias elegíveis por jogador. Médias de desempenho consideram apenas dias com resultado válido; zero aplicado ao menor positivo é válido, bruto zero representa ausência. Mostrar penalidades separadamente. Destaques por maior pontuação bruta válida de cada dia, incluindo empates; dia com único resultado não será chamado de vitória contra adversários. Sem dados válidos, informar ausência de dados. Métricas serão conciliadas com snapshots armazenados e totais, sem recalcular ou modificar os campeonatos.

## Situação

Inventário remoto executado pelo Dono do produto e recebido em 03/10/2026: dois alvos confirmados, encerrados e com history_ready=true. Aztecas - Setembro 2026: 5 participantes, 110 resultados, 1 versão; encerramento em 01/10/2026 às 09:45:37 (São Paulo). GeoGuaras — Setembro 2026: 16 participantes, 282 resultados, 1 versão; encerramento em 01/10/2026 às 09:45:48 (São Paulo). Captura e exportação atuais recebidas e validadas: before-september-removal-v1, capturada em 03/10/2026 às 15:31:08 (São Paulo), checksum 1a78c55e07146e80bed71225847aca5e. Contagens: 4 torneios, 291 pontuações pessoais, 434 resultados e 6 versões. Cópia privada salva em backups/setembro-2026/before-september-removal-v1.json; SHA-256 2bc0985728af10b29905fea3382dfa9f60fb9e8c18bf3aba5106c30c6fc5e1bc. PDFs gerados e conferidos tecnicamente/visualmente: Aztecas (2 páginas) e GeoGuaras (3 páginas), em backups/setembro-2026/output/pdf, ignorados pelo Git. PDFs aceitos explicitamente pelo Dono do produto em 03/10/2026. Remoção preparada e ensaiada localmente; execução remota confirmada pelo retorno do Dono do produto. Backup de negócio não equivale a backup integral Supabase/Auth. Exportações e relatórios com dados reais devem ficar em diretório privado ignorado pelo Git; apenas roteiro e evidências sem dados pessoais serão versionáveis.
## Conferência dos relatórios

Somente resultados armazenados de encerramento e participantes elegíveis usados. Aztecas: 110 resultados elegíveis, 102 válidos, 8 ausências, 22 dias. GeoGuaras: 282 registros armazenados; 10 anteriores à elegibilidade excluídos, restando 272 (258 válidos e 14 ausências), 21 dias. Nenhum resultado elegível pendente ou provisório. Todos os pontos aplicados conciliados com os snapshots (relativo ou penalidade); posições, médias e nomes completos conferidos por extração do PDF. E-mails e IDs não incluídos. Símbolos decorativos sem glifo na fonte omitidos dos nomes, sem colisões entre os nomes apresentados.

Calendários preservados da fonte: Aztecas sem datas excluídas, com 07/09 contando cinco ausências; GeoGuaras exclui 07/09. Não ajustar regras ou totais retroativamente para os relatórios. O Dono do produto deve conferir essa diferença na aprovação.

Inspeção de todas as páginas PNG concluída após ajuste de cabeçalhos e paginação. Arquivos finais: aztecas-setembro-2026.pdf (SHA-256 7a5a686fb6b09f6293b0adb4d3f6085a32da91e5a7dca9257cc7e34af230350c); geoguaras-setembro-2026.pdf (SHA-256 e3e6f36701cc7190ec64841c4999f56184b4f1d240bb562f86875cf5deb97882). Cópia do gerador e evidências detalhadas ficam junto ao backup privado. A geração dos PDFs não executou nenhuma operação remota ou remoção.
## Aceite dos PDFs e preparação da retirada

Dono do produto aceitou os dois PDFs em 03/10/2026. Ensaio local em PGlite sobre cópia privada da captura atual: alteração do nome de um alvo após a fonte dos PDFs recusada sem exclusão; retirada isolada bem-sucedida; dois torneios restantes, 291 pontuações pessoais preservadas e auditorias de revisão mantidas; repetição recusada sem sobrescrever captura. Comparação integral de estado fora dos alvos executada na transação. Isso não comprova execução no Supabase remoto.

Representação de timestamptz normalizada em UTC dentro da transação para corresponder à exportação aprovada; o dia de comparação continua calculado explicitamente em São Paulo. Dados reais, PDFs e cópia do ensaio permanecem ignorados pelo Git. Execução remota confirmada; exportação da nova captura recebida/validada; conferência visual ainda aguardada. Não executar novamente se a captura before-september-delete-v1 já existir; conferir o resultado anterior.

## Resultado remoto da retirada

Retorno fornecido pelo Dono do produto: before-september-delete-v1, capturado em 03/10/2026 às 17:11:57 (São Paulo), checksum 1a78c55e07146e80bed71225847aca5e; september_removed=true, remaining_tournaments=2, preserved_personal_scores=291. A transação passou pela conferência de preservação fora dos alvos. Mesmo checksum da referência dos PDFs indica captura anterior à exclusão sem diferenças nessa comparação; não é checksum do estado após a retirada. PDFs já aceitos; nenhuma alteração da aplicação necessária. Exportação privada da nova captura recebida e validada; conferência do painel atualizado ainda não confirmada.

## Exportação final validada

Exportação before-september-delete-v1 recebida e salva de forma privada em backups/setembro-2026/before-september-delete-v1.json. Checksum PostgreSQL/PGlite verificado antes e após releitura: 1a78c55e07146e80bed71225847aca5e; snapshot idêntico ao da referência usada nos PDFs. SHA-256 do JSON salvo: 0581c6531d1d715eeee0f5a3c5eaf6d3a60a75a3c0a3dba1ea7aa03ab523dbad; anexo de origem: e875bb962a0e64552c3b18f57c5adaee6b35c14289e1081185dc3646a67c0973. Captura contém os quatro torneios antes da retirada e não representa o estado atual de dois torneios. PDFs aceitos, retirada remota e exportação concluídas; apenas conferência visual de ausência de setembro no painel ainda sem relato.
