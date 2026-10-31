# ADR-015 — evolução por pontos e substituição administrativa de PDF

31/10/2026 — Esclarecimento operacional posterior à correção concluída: o Dono do produto autorizou reenvio forçado pontual HCM/Aztecas e rejeitou implementar funcionalidade. Preparado procedimento com backup dos registros anteriores na tabela privada existente e reativação de 24 destinatários no worker atual, com novos UUIDs de entrega para novos Message-IDs; sem schema/API/template novo. [Procedimento](../sprints/sprint-8-reenvio-pontual.md). Referências abaixo à ausência de reenvio descrevem corretamente a etapa de substituição anterior; o novo reenvio ainda aguarda execução.

Data: 31/10/2026. Situação: v5 implementada/testada e aprovada pelo Dono do produto; publicação Vercel confirmada e PDFs HCM/Aztecas substituídos após backup validado. Conferência final dos dois alvos fornecida pelo Dono do produto com todos os indicadores verdadeiros, incluindo capturas, horários e contadores de envio preservados.

## Contexto

O Dono do produto esclareceu que RF19 deve mostrar pontos acumulados, após rejeitar o gráfico de posições no HCM com 18 participantes. A fila reutiliza PDFs existentes e remove captura/PDF ao retirar o torneio. Não se deve reabrir encerramentos nem reiniciar entregas para corrigir apresentação.

## Decisão

Revisão vigente `cumulative-scores-v5`. O Dono do produto autorizou a implementação da simulação refinada e exigiu regras automáticas para qualquer torneio, com uma página por gráfico. Decisões confirmadas: gráfico geral mantido; detalhes em cinco datas pontuadas (não dias corridos); eixo X apenas com essas datas; domínio Y pelo mínimo/máximo dos acumulados elegíveis no intervalo; sobra de uma data unida ao anterior; seção de até cinco duplas por quantidade de trocas; nomes de jogadores no anexo, sem chamar jogadores de séries. Substitui as escolhas anteriores de grupos de jogadores e faixas Y com período inteiro, além de todas as duplas empatadas no máximo.

O código geral agrupa pontos cronológicos da captura congelada e usa seus acumulados originais, sem reiniciar em cada intervalo, sem suposições de dia da semana ou campeonato fixo. Resto de duas a quatro datas tem curva própria; uma única data no torneio tem só panorama de marcadores; vazio não inventa gráfico. Domínio constante é tratado sem divisão por zero. Identidade de cor/traço mantida e legenda excedente continua em página própria. Classificação/anexo têm cabeçalhos repetidos e nomes públicos; emojis não cobertos pela fonte são omitidos apenas na apresentação, com aviso na capa.

Duplas com zero inversões não completam artificialmente o top cinco. Inversões mantêm a última ordem estrita durante empates. Contagens empatadas usam ordem alfabética de nomes e IDs como escolha técnica de apresentação; o corte é de cinco pares, sem alegar vantagem de pontos por esse desempate. O PDF explica o critério. Sem tabela ou armazenamento novo; os dados da captura já permitem essa seleção.

Implementação compartilhada consumida por `runTournamentReports`/`processReport`, sem caminho específico para HCM. Revisão indicada no código, rodapé e evidência local. HCM é caso real de validação; testes adicionais usam calendários, pontuações e elencos sintéticos diferentes. Publicar o código atende novos PDFs; o worker continua reutilizando PDFs prontos.

Prévia por CLI offline, a partir da exportação privada. O mesmo CLI prepara, opcionalmente, SQL administrativo delimitado pelo ID e hashes da captura e do PDF original. Sem rota nova, permissão nova, tabela nova ou migração. A operação exige administrador no SQL Editor, fora do acesso das contas da aplicação. Bloqueia torneio e fila na ordem da retirada, recusa lease ativo/retirada/captura alterada e troca somente `pdf_base64`. Repetição com o mesmo PDF é inócua. `generated_at`, prazo de retirada, captura e estados de destinatários permanecem intactos. Checksums impedem substituir outra revisão inadvertidamente.

## Consequências

O código publicado atenderá novos relatórios; os existentes exigem substituição explícita depois do aceite da prévia e de backup privado validado. Reenvio não faz parte da operação: anexos anteriores permanecem nas caixas. Torneios retirados ou sem captura não são reativados. Backup/exportação e evidência ficam em `backups/`, ignorado pelo Git. O rodapé identifica a revisão sem introduzir coluna de versão na fila; o histórico de manutenção é documental e por evidência privada, não uma nova trilha de auditoria no banco. A ausência de captura continua exigindo análise própria.

Aceite, publicação, backup e substituição/comparação HCM/Aztecas concluídos conforme evidências operacionais. Não restam pendências desta correção; acompanhamentos independentes de retirada automática permanecem separados. Não confundir teste SQL em PGlite com homologação da concorrência no PostgreSQL remoto.
