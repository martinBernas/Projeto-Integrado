# Correção do gráfico do relatório geral — plano aprovado e implementação local de 31/10/2026

## Reenvio pontual concluído tecnicamente — 31/10/2026

Dono do produto apresentou o acompanhamento SQL após reativar os envios. Aztecas: 6 destinatários/6 `sent`; HCM: 18 destinatários/18 `sent`. Ambos com `pending=0`, `sending=0`, `failed=0`, `uncertain=0`, `lease_until=null` e `withdrawn_at=null`. Horários originais de geração e prazo de retirada mantidos.

Com a reativação 6/18 pendentes anteriormente apresentada, confirma aceitação SMTP dos 24 novos envios pelo fluxo existente, usando os PDFs corrigidos armazenados e conferidos. Não interpretar `sent` como prova de recebimento/leitura nas caixas. Nenhum novo teste de anexo recebido foi informado. Não repetir a reativação nem reexecutar envios concluídos.

Operação excepcional solicitada pelo Dono do produto atendida, sem nova funcionalidade, schema ou publicação. Correção, substituição de PDFs e reenvio técnico dos dois torneios concluídos. Evidência é o retorno SQL fornecido, sem consulta direta do agente. O primeiro resultado de `06-resend-status.sql` (identificação/contagem do backup operacional) não foi apresentado nesta mensagem; a preservação em `private.sprint8_backups` decorre da mesma transação do script de reativação executado e foi testada localmente, sem alegar nova conferência remota desse registro ou exportação privada adicional. Backups/evidências anteriores permanecem privados e fora do Git.

Não restam ações necessárias para disparar este reenvio. Eventual confirmação de recebimento/leitura e o ensaio independente de retirada automática são evidências distintas, não inferidas nem encerradas por esta consulta. Registros antigos abaixo de reenvio ainda não executado/aceitação pendente são históricos substituídos por esta conclusão. Nesta rodada somente atualização documental e `git diff --check`, sem alteração de código, novo envio ou repetição de testes funcionais.


31/10/2026 — Nova solicitação posterior à correção concluída: Dono do produto quer forçar o reenvio de HCM/Aztecas sem implementar funcionalidade. [Operação pontual](sprint-8-reenvio-pontual.md) preparada e testada: arquivar o estado anterior na tabela privada de backups existente, renovar IDs dos 24 envios e voltar a `pending`, preservando relatórios/prazos. Nenhuma alteração de aplicação ou deployment necessário. Execução e aceitação dos novos envios ainda pendentes; não apresentar a manutenção anterior como se já tivesse reenviado anexos.

## Correção v5 e regeneração concluídas — 31/10/2026

O Dono do produto apresentou a conferência final `04-verify-replaced-targets.sql`. Os dois alvos retornaram todos os indicadores verdadeiros: `corrected_pdf_ok`, `snapshot_preserved`, `generated_at_preserved`, `due_at_preserved`, `not_withdrawn_ok` e `delivery_counts_preserved`.

| Torneio | ID | Destinatários | Envios `sent` | Resultado |
| --- | --- | ---: | ---: | --- |
| Aztecas Outubro | 34727be9-2447-4e7c-af41-e685b6db290b | 6 | 6 | PDF v5 e preservações confirmados |
| HCM - Outubro | 93c7e3c5-a676-42d4-83ca-05284cce0fff | 18 | 18 | PDF v5 e preservações confirmados |

Aceite explícito da v5, publicação Vercel informada pelo Dono do produto, backup completo validado e retornos individuais de substituição já registrados. A leitura final resolve a última pendência de comparação conjunta. Correção e substituição desses dois relatórios na plataforma concluídas, sem reabrir torneios, reiniciar geração/prazo ou reenviar e-mails. Contadores `sent` confirmam preservação dos registros de aceitação SMTP, sem nova comprovação de recebimento/leitura das mensagens. Anexos enviados anteriormente continuam sendo os originais; esta manutenção atualizou os PDFs armazenados na plataforma, conforme escopo autorizado.

Evidência final é o resultado SQL apresentado pelo Dono do produto, não consulta remota independente do agente. Comprova hashes dos PDFs/capturas, horários e contadores esperados; não alegar comparação remota de cada campo dos registros de destinatários além dos indicadores apresentados. Os scripts atualizam somente `pdf_base64` e a preservação integral dos demais registros está coberta pelos testes locais e pelo backup. Não repetir as substituições já concluídas.

A implementação permanece no gerador compartilhado publicado e aplica automaticamente as regras aos novos PDFs de qualquer torneio: panorama, blocos de cinco datas pontuadas, sobra unitária unida, mínimo/máximo locais, um gráfico por página, até cinco duplas e nomes no anexo. Sem migração adicional. PDFs entregues e backups/evidências privadas continuam nos caminhos registrados, ignorados pelo Git. Nenhuma credencial, endereço ou arquivo de backup adicionado à documentação versionável.

Não restam pendências desta correção/refinamento/regeneração HCM/Aztecas. Registros anteriores abaixo são históricos, substituídos por esta conclusão. O ensaio de retirada automática e demais acompanhamentos independentes da Sprint 8 não foram comprovados por esta consulta e não são encerrados aqui. Validação local final do incremento: 145 testes, build/TypeScript e lint sem erros (um aviso preexistente), conforme registro anterior. Nesta rodada somente atualização documental e `git diff --check`, sem nova alteração funcional, envio ou escrita remota pelo agente.


## Ambos os PDFs substituídos — conferência final conjunta pendente

31/10/2026 — Dono do produto apresentou retorno da substituição Aztecas `34727be9-2447-4e7c-af41-e685b6db290b`: `corrected_pdf_md5=359473d39308e759d7b6c0a2f2b9479b`, correspondente ao PDF v5 gerado pelo código aprovado. `generated_at=2026-10-31 03:21:13.879956+00`, `due_at=2026-11-07 03:21:12.691942+00` e `withdrawn_at=null`, iguais ao estado anterior.

Junto do retorno HCM já conferido, confirma armazenamento dos dois PDFs corrigidos e preservação desses horários. Não repetir as escritas. Resta executar somente a leitura `web/supabase/operations/report-score-correction/04-verify-replaced-targets.sql` e receber as duas linhas com todos os indicadores verdadeiros, snapshot preservado e contadores HCM 18/18 e Aztecas 6/6. Os resultados individuais ainda não demonstram esses dois critérios finais; manutenção aguarda essa comparação para encerramento.

Publicação, aceite v5 e backup validado permanecem registrados. Evidência remota fornecida pelo Dono do produto; sem consulta direta do agente ou reenvio de e-mails. Atualização exclusivamente documental com `git diff --check`; nenhuma alteração de código ou repetição de testes funcionais. Pendências antigas de execução Aztecas abaixo estão resolvidas por este retorno.


## HCM substituído — Aztecas e conferência conjunta pendentes

31/10/2026 — Retorno SQL fornecido pelo Dono do produto confirma a substituição do HCM `93c7e3c5-a676-42d4-83ca-05284cce0fff`. `corrected_pdf_md5=df9f8c21ab263beb92bb942d2b783a04`, igual ao manifesto do PDF aprovado. Geração preservada em `2026-10-31 03:22:45.052714+00`; retirada prevista preservada em `2026-11-07 03:22:43.681343+00`; `withdrawn_at=null`. Não reiniciou geração/prazo nem retirou o torneio. Evidência é o resultado remoto apresentado pelo Dono do produto, não uma consulta direta do agente.

Não repetir a escrita do HCM para obter essa mesma evidência. Faltam o retorno de `aztecas-preview-v5/replace-reviewed-report.sql` e a conferência somente leitura `04-verify-replaced-targets.sql`, que deve apresentar ambos os alvos com todos os indicadores verdadeiros, incluindo preservação de snapshot e contadores 18/18 e 6/6. Resultado de escrita HCM isolado não comprova execução Aztecas nem igualdade de destinatários/snapshot. Não registrar manutenção dos dois torneios como concluída até receber a comparação.

Backup completo validado e publicação previamente confirmados permanecem como evidência válida. Nenhum envio novo solicitado/executado. Atualização documental, sem alteração de código; `git diff --check` aprovado. As pendências anteriores de execução HCM abaixo foram resolvidas por este retorno; as de Aztecas e validação final permanecem atuais.


## Backup validado — substituição pronta para execução

31/10/2026 — Dono do produto forneceu o resultado da exportação completa de backup dos dois alvos. Conteúdo recebido como tabela, extraído sem alterar valores e salvo em `backups/report-score-correction/before-replacement-v5.json`; original colado preservado privadamente em `before-replacement-v5-pasted-original.txt`. SHA-256 do original recebido: `8e43cc5f78e708eb6701efca556040ba5dca5d42df12195012def4388897bb96`. SHA-256 do JSON extraído: `781b6e1037e3fd1b08cc6d8326ec2aef380f923d33bd39a0b27cd24344471bcb`. Arquivos contêm endereços/PDFs e permanecem ignorados pelo Git; somente hashes/estado registrados nesta documentação.

CLI `verify-report-replacement-backup.mjs` retornou `verified=true` para HCM e Aztecas, com 18/18 e 6/6 destinatários `sent`. Capturas estruturalmente iguais às referências, IDs de destinatários correspondentes aos participantes, sem duplicidades, hashes dos PDFs originais iguais às referências, geração/prazo válidos e sem retirada ou lease ativo. Evidência privada em `before-replacement-v5.json.verified.json`. Leitura independente dos dois PDFs originais por pypdf também válida. Resolvida a pendência de obter/validar backup completo imediatamente anterior à substituição nesta etapa; se a execução for adiada ou o estado mudar, reconsultar e preservar nova evidência conforme necessário.

Scripts privados `hcm-preview-v5-final/replace-reviewed-report.sql` e `aztecas-preview-v5/replace-reviewed-report.sql` conferidos: conteúdo base64 exatamente igual a cada PDF v5 aprovado/preparado, IDs e hashes de captura/PDF original esperados, recusa de fila ocupada/retirada e uma única atualização de `pdf_base64`, sem alteração de destinatários. Manifesto privado `replacement-ready-v5.json` registra os checksums dos scripts e dos PDFs. Nenhum SQL de substituição executado pelo agente, sem acesso administrativo remoto disponível nesta sessão.

Próxima ação operacional: executar os dois scripts de substituição no SQL Editor (autorização geral já concedida), registrar retorno por alvo e executar `web/supabase/operations/report-score-correction/04-verify-replaced-targets.sql`. Esperado: HCM e Aztecas com todos os indicadores verdadeiros e contadores 18/18 e 6/6. Somente depois registrar regeneração concluída. Esta conferência não altera prazo/estado de envios nem reenviará anexos já enviados. Publicação do código já foi confirmada pelo Dono do produto; pendência atual é execução e comparação da substituição remota. Registros anteriores de backup ainda não recebido são históricos substituídos.

Atualização de documentação/evidência, sem alteração de código funcional ou nova geração de PDF. `git diff --check` aprovado; suíte, lint e build finais anteriores continuam válidos e não foram repetidos sem mudança de código.


## Publicação confirmada — próxima etapa: backup dos dois relatórios

31/10/2026 — Dono do produto informou que o deploy na Vercel está pronto com o último commit. HEAD local `af2fa7e` (`S8: correcoes aos pdfs`) conferido e árvore limpa antes desta atualização documental. Registrar publicação por confirmação do Dono do produto, sem alegar inspeção independente do deployment/logs. Resolvida a pendência de publicação registrada abaixo; referências anteriores à publicação ainda não realizada são históricas.

Avançar com `web/supabase/operations/report-score-correction/03-backup-approved-targets.sql`, somente leitura, imediatamente antes da manutenção. Exportar exatamente duas linhas como JSON privado e informar o caminho local para validar com `verify-report-replacement-backup.mjs`. Contém endereços e PDFs antigos: manter o arquivo fora da conversa e do Git. O backup ainda não foi recebido/executado nesta etapa. A autorização para regenerar HCM e Aztecas já está confirmada; não solicitar novamente aprovação geral.

Depois do backup validado, executar os scripts privados dos dois PDFs e conferir `04-verify-replaced-targets.sql`, preservando captura, geração, prazo e envios. Publicação do código não substitui os PDFs já armazenados. Ainda não houve substituição remota, novo envio ou comprovação de backup de manutenção. Nesta atualização somente registro documental e `git diff --check`; testes funcionais/build anteriores permanecem válidos, sem alteração de código.


31/10/2026 — Revisão final local concluída: 145 testes aprovados, lint sem erros (um aviso preexistente em `retroactive-scores.test.mjs`) e build/TypeScript aprovados. Primeiro build encontrou EBUSY transitório em `.next/package.json`; repetição sequencial concluiu normalmente, sem alteração adicional do código. `git diff --check` aprovado. Código, testes, documentação e ferramentas operacionais finalizados para publicação. PDFs HCM/Aztecas gerados e conferidos; publicação e substituição remota ainda não executadas.

## Situação atual — arquivos preparados para publicação e dois PDFs gerados

31/10/2026 — Dono do produto apresentou inventário atualizado e exportação Aztecas. Confirmou que a correção v5 ainda não foi publicada e que fará a publicação após a atualização dos arquivos locais. A aprovação da v5 e autorização de regeneração dos dois alvos continuam válidas; não solicitar novo aceite geral. Nenhum deployment ou substituição remota afirmado.

Inventário fornecido: HCM/Aztecas com captura/PDF, sem retirada/lease, envios 18/18 e 6/6. HCM manteve `snapshot_database_md5=ab7951e112207aaf37ef5c2d482b5ad3` e `previous_pdf_md5=42aa3fce99f2e75608ff9f9072fd2306`. Aztecas: captura `a2587770c6163af56fcc4b876836b5b1` e PDF original `84c2c566b89ba42c9fe7dfe48d31eb15`. Esses hashes correspondem aos scripts privados preparados; são evidência pontual, não monitoramento contínuo.

Aztecas exportado para `backups/report-score-correction/aztecas-frozen-export.json`, com arquivo colado original preservado privadamente (SHA-256 `9b212006b24c15af545ff34b8553254a59fa26a7928b0e3d2b6bfdc170b3ee84`). Hash da captura recalculado por `jsonb::text` em PGlite e confirmado igual ao remoto. Mesmo renderizador v5, sem adaptação específica: 6 jogadores, 126 resultados, 21 datas e blocos 5/5/5/6. PDF `web/output/pdf/aztecas-outubro-relatorio-v5.pdf`, 8 páginas, SHA-256 `89d29405d438c35c649996e0fef5f9971bbcae08b8d27acc048d532d79f1d881`. Conferidos independentemente os seis totais, as 126 células do anexo, min/max/datas dos intervalos e as cinco duplas (2/2/2/2/1 trocas). Todas as páginas renderizadas/inspecionadas; nenhuma informação pessoal adicionada ao Git. PDF/QA/scripts privados em `backups/report-score-correction/aztecas-preview-v5/`.

Preparadas operações somente leitura `03-backup-approved-targets.sql` (duas filas completas e destinatários) e `04-verify-replaced-targets.sql` (checksums novos, captura, geração, prazo e contadores). O primeiro gera material privado, que deve ser salvo localmente e não colado na conversa. Novo CLI `verify-report-replacement-backup.mjs` valida cada alvo contra sua exportação, igualdade da captura, hash/PDF original, prazo, lease, identidades e todos os estados `sent`; grava evidência com SHA-256 sem imprimir endereços ou PDF. Teste sintético confirma dois alvos válidos e recusa falta/duplicação de alvo, alteração de captura/PDF/destinatário/prazo/estado, retirada, lease e JSON malformado, com erros sanitizados. Não cria permissões ou integrações novas, não acessa rede nem altera os PDFs de produção.

Manifesto privado `backups/report-score-correction/approved-targets-v5.json` relaciona os dois arquivos/checksums/scripts. MD5 esperado do texto base64 corrigido no banco: HCM `df9f8c21ab263beb92bb942d2b783a04`; Aztecas `359473d39308e759d7b6c0a2f2b9479b`. Não são MD5 dos bytes dos PDFs. Código de produção permaneceu o v5 aprovado; somente ferramentas operacionais/teste/documentação avançaram nesta etapa.

Publicação pelo fluxo do Dono do produto, backup completo imediatamente anterior à escrita, verificação local do backup e substituição/comparação remotas continuam pendentes. Capturas recebidas e PDFs novos não substituem o backup completo da fila com os PDFs antigos e registros de envio. Não reenviar e-mails, reiniciar prazos ou reabrir torneios. Procedimento detalhado em [operação](sprint-8-correcao-grafico-operacao.md). Estados anteriores de “exportação/prévia Aztecas pendente” abaixo são históricos resolvidos por esta etapa.


## Aceite confirmado e avanço operacional — 31/10/2026

O Dono do produto respondeu “sim versao aprovada” à confirmação de aprovação da v5 para avançar com publicação da correção e regeneração dos relatórios HCM e Aztecas. Aceite visual/funcional da versão encerrado. Arquivo aprovado: `web/output/pdf/hcm-outubro-relatorio-v5.pdf`, SHA-256 `322ee0cf56597aed808748f6871830fae4346c1f5c4e010f6c5bc1332bf63556`, novamente conferido nesta etapa. Pendências de aceite da v5 em registros anteriores abaixo são históricas e foram resolvidas por essa confirmação. Não implica aceite de mudança de escopo, reenvio de e-mails ou aprovação de versões rejeitadas.

Preparada `web/supabase/operations/report-score-correction/02-approved-targets-and-aztecas-export.sql`: reconsulta somente HCM/Aztecas e exporta a captura congelada Aztecas, sem endereços ou credenciais, sem gravar ou disparar processamento. HCM já tem PDF e scripts v5 correspondentes preparados; Aztecas ainda depende da exportação para aplicar o mesmo gerador e conferir seus totais. Torneios de ensaio e HCM Games 2026 permanecem fora dos alvos.

Limite operacional atual: configuração local contém apenas URL/chave pública do Supabase, sem conexão administrativa ao banco ou ferramenta de publicação configurada. As consultas remotas desta conversa foram executadas pelo Dono do produto no SQL Editor. Não há acesso disponível para executar a substituição diretamente ou comprovar deployment. Não acessar nem solicitar credenciais na conversa. Código/documentação locais prontos e verificações anteriores válidas; nenhum código funcional alterado nesta etapa de aceite. Consulta/roteiro novos verificados por revisão e `git diff --check`; sem teste funcional ou publicação repetidos.

Próximas etapas concretas autorizadas: receber resultado atual dos dois alvos e exportação Aztecas; gerar/conferir PDF Aztecas automaticamente pelo mesmo código; comprovar publicação da v5; exportar/validar backup completo de cada alvo; executar os SQLs delimitados pelos hashes do PDF validado e comparar arquivo/metadados/destinatários depois. Não repetir aprovação geral para essas operações já autorizadas. Não considerar a consulta/backup isolados como regeneração concluída. Publicação e substituição remota continuam sem evidência nesta entrega.


## Implementação vigente local — v5 automática para todos os torneios

31/10/2026 — Dono do produto considerou a imagem promissora e autorizou implementar no PDF, com uma página inteira por gráfico. Reforçou que as regras devem ser automáticas para qualquer campeonato, não uma composição exclusiva para HCM. Também definiu as cinco duplas com mais trocas e solicitou não chamar jogadores de séries no anexo. Esses pedidos foram implementados no código da aplicação; o simulador Python é somente ferramenta de refinamento, sem participação no fluxo de produção.

### Regras implementadas

- `tournamentReport` reconstrói os acumulados finais aceitos e as datas pontuadas de qualquer captura encerrada, preservando elegibilidade, ausência, penalidade, empate e auditoria. Dias pontuados são datas consolidadas do torneio, inclusive com ausência/zero/penalidade; não apenas datas de resultados positivos.
- `scoreChartPanels`/`scoredDayGroups` dividem automaticamente essas datas cronológicas em blocos de cinco. Resto com uma data se incorpora ao anterior (21 datas → 5/5/5/6); restos de duas a quatro datas formam intervalo próprio. Sem perda/duplicação e sem alterar a captura. Não há datas, nome de campeonato ou tamanho de elenco fixados.
- Eixo X ordinal, apenas datas pontuadas, igualmente espaçadas; legenda em coluna lateral com identificação constante. Rótulos no panorama são reduzidos adaptativamente quando necessário, sempre escolhidos entre datas válidas, sem remover observações. Detalhes mostram suas cinco/seis datas. Todas as curvas são dos acumulados desde o início, sem reiniciar em cada trecho.
- Mínimo e máximo calculados entre todos os acumulados elegíveis do próprio intervalo, sem forçar zero ou recortar jogadores por faixa. Limites reais escritos no PDF; domínio constante desenha linha/observações no centro, sem divisão por zero. Uma página A4 paisagem por gráfico, incluindo o panorama. Legendas acima de 18 entradas continuam em páginas próprias sem dividir o gráfico por jogadores.
- Sem resultados: mensagem explícita, sem gráfico inventado. Uma data total: somente panorama com marcadores e explicação de que não há curva temporal. Poucos jogadores, zeros e totais negativos mantêm a mesma regra. Classificação e tabelas paginam com cabeçalhos; nomes de jogadores substituem “Série” e “S1” no anexo numérico. Emojis continuam omitidos apenas na apresentação com aviso na capa, sem alteração do cadastro.
- Duplas: contar inversões pela última ordem estrita, preservando regra de empate intermediário; ordenar todas as duplas com contagem positiva por trocas decrescentes e apresentar até cinco, não somente as empatadas no máximo. Menos de cinco positivas: mostrar as existentes; zero inversões: mensagem explícita. Ordem alfabética de nomes e IDs em empates é escolha técnica de apresentação, documentada no PDF e testada, sem aumentar a contagem nem incluir pares de zero trocas. Essa seleção substitui a regra anterior de exibir todas as líderes empatadas.

### Integração comum e escopo

Fluxo já existente: `runTournamentReports` em `web/src/lib/report-server.ts` fornece `renderTournamentPdf` a `processReport`; o worker `/api/tournament-reports` e o encerramento usam esse mesmo caminho. Alterados os módulos compartilhados de cálculo/renderização, não criada uma rota específica para HCM. Depois de publicado, novos PDFs de qualquer torneio passam automaticamente por essas regras. Arquivos já gerados continuam exigindo a substituição administrativa delimitada, pois o worker reutiliza o PDF existente. Não foi alterada a integração SMTP, o estado dos envios, a captura ou o prazo de retirada. Sem migração, grant ou nova tabela/RPC.

### Prévia real e evidência

PDF `web/output/pdf/hcm-outubro-relatorio-v5.pdf`, 10 páginas. SHA-256 `322ee0cf56597aed808748f6871830fae4346c1f5c4e010f6c5bc1332bf63556`. Panorama na página 3; quatro gráficos de intervalo em páginas 4–7 (5/5/5/6 datas); anexos numéricos com nomes nas páginas 8–10. Dados reais: 18 jogadores, 371 resultados e 21 datas. Duplas: Evelyn/Zader (8), Andrade/Leonardo H (7), BASTIÃO/Feyh (6), Didi98/Zader (6), Andrade/BASTIÃO (4). Todas as 378 células do anexo conferidas contra somas independentes da captura; contagem das cinco duplas verificada independentemente entre todos os pares; limites e rótulos de cada intervalo comparados com a simulação validada conceitualmente. Não há “Série”/“S1” no anexo.

Fonte, PDF, evidência e SQLs correspondentes em `backups/report-score-correction/hcm-preview-v5-final/`, privados. Preservados checksum/captura recebidos; isso não substitui o backup completo imediatamente anterior à futura manutenção. Versões anteriores e seus scripts são históricos e não devem ser usados para substituir a versão atual.

### Verificações e limites

Suíte completa: 143 testes aprovados. Testes focados após ajuste final de espaçamento: 17 aprovados, incluindo separação de rótulos em 2/5/6/21/31/365 datas. Lint de todos os módulos/testes alterados e CLI sem erros/avisos; build/TypeScript aprovados após o ajuste final. Cobertura de agrupamento para 0/1/2/5/6/7/10/11/21/22/31 datas em calendário arbitrário; domínios exatos positivos, negativos e zero, elegibilidade tardia e preservação de entradas; top cinco com contagens distintas, empate no corte e ordem de entrada invertida. PDFs sintéticos com 2/3/18/24 participantes, uma/6/21/31 datas, domínio plano/negativo e continuação de legenda gerados pelo mesmo renderizador. Teste SQL de substituição/preservação continua em PGlite, não comprova concorrência remota real. PDF HCM renderizado e todas as dez páginas inspecionadas. `git diff --check` aprovado.

Limites mantidos: limite técnico preexistente de 8 MB por PDF e disponibilidade da captura congelada. Ausência de captura não autoriza reconstrução silenciosa nem reabrir torneio. Arquitetura/ADR/diagrama/requisitos/operacional atualizados. Nenhuma publicação, migração, substituição remota, retirada ou e-mail novo executados nesta entrega.

Pendências atuais: aceite do PDF HCM v5 pelo Dono do produto, exportação/prévia Aztecas, publicação do código geral, backup completo validado imediatamente antes da manutenção e substituição/comparação remotas dos alvos delimitados. A autorização de implementação e a avaliação promissora da simulação não foram registradas como aceite do PDF gerado. Os registros abaixo preservam o histórico de refinamento, substituído pela implementação atual.


## Situação atual — sobra sem curva incorporada ao intervalo anterior

31/10/2026 — Dono do produto solicitou que, quando faltarem pontuações suficientes para mostrar uma curva no último intervalo, os dados sejam incorporados ao gráfico anterior. Aplicação técnica no simulador: uma única data não forma segmento temporal; unir a sobra de uma data ao bloco imediatamente anterior. Blocos finais com duas a quatro datas já formam curvas e permanecem próprios. Torneio com uma única data total não tem gráfico anterior: manter o estado de uma data, sem inventar observações, sujeito à definição visual desse caso antes da implementação PDF.

HCM agora tem quatro detalhes com 5/5/5/6 datas pontuadas. O último reúne 23, 26, 27, 28, 29 e 30/10; eixo Y recalculado de -46.868 a 164.414 pontos. Panorama preservado, somente datas válidas no eixo X e acumulados desde o início do torneio. Não há gráfico isolado de 30/10.

Imagem completa atual `web/output/pdf/hcm-simulacao-cinco-dias-final-unido.png`; último trecho ampliado `web/output/pdf/hcm-simulacao-ultimo-intervalo-unido.png`. Evidências privadas em `backups/report-score-correction/hcm-five-scored-days-merged/`. Verificação: 21 datas sem perda/duplicação, primeiros três blocos intactos, união exata das datas dos dois blocos finais anteriores, novo min/max equivalente aos extremos desses dois blocos e preservação dos 18 totais finais. Imagem completa inspecionada; `git diff --check` aprovado. A regra anterior de gráfico final com uma data fica substituída por esta decisão. Nenhum PDF novo, alteração do renderizador de produção, migração, publicação, acesso remoto ou e-mail. Continua aguardando avaliação da simulação antes de implementar o PDF.


## Simulação atual — cinco dias pontuados por intervalo

31/10/2026 — Dono do produto esclareceu que os intervalos devem ser de cinco dias pontuados. Substituída a interpretação anterior de cinco dias corridos. O simulador agora divide as datas consolidadas ordenadas em blocos consecutivos de cinco, sem repetir ou descartar datas. O último bloco contém o restante, sem completar com dias inválidos ou duplicar observações.

HCM: 01, 02, 05, 06 e 07/10; 08, 09, 13, 14 e 15/10; 16, 19, 20, 21 e 22/10; 23, 26, 27, 28 e 29/10; último bloco somente 30/10. Acumulado permanece desde o início; cada detalhe calcula seu mínimo/máximo sobre as pontuações elegíveis dessas datas. Todos os dias do eixo X são pontuados e igualmente espaçados. Gráfico geral preservado. Último bloco de um dia mostra os pontos daquela data, sem inventar uma linha temporal.

Imagem atual `web/output/pdf/hcm-simulacao-cinco-dias-pontuados.png`; exemplo ampliado `web/output/pdf/hcm-simulacao-primeiros-cinco-dias-pontuados.png`. Evidências privadas em `backups/report-score-correction/hcm-five-scored-days-reviewed/`. Conferidos blocos 5/5/5/5/1, cobertura das 21 datas sem perdas/repetições, espaçamento e preservação dos 18 totais finais. Imagem completa inspecionada visualmente; `git diff --check` aprovado. Simulações de dias corridos abaixo ficam como histórico substituído. Nenhum PDF novo, alteração do renderizador de produção, migração, publicação, operação remota ou e-mail. Aguarda avaliação da imagem antes da nova implementação PDF.


## Ajuste atual da simulação — eixo X somente com datas válidas

31/10/2026 — Dono do produto solicitou remover do eixo X dias não válidos para o torneio. Simulador PNG atualizado para eixo ordinal: somente datas presentes nos resultados consolidados congelados, igualmente espaçadas. Não inferir validade apenas por dia da semana: a captura HCM traz 21 datas consolidadas e não contém calendário/exclusões explícitos. Para este torneio encerrado, essas datas são a referência disponível; calendário de qualquer novo caso sem resultados completos exige sua própria fonte de validade, sem inventar datas.

Ajuste aplicado tanto ao panorama quanto aos detalhes. Mantidos os intervalos de cinco dias corridos adotados na simulação anterior, sem converter silenciosamente para cinco partidas/datas válidas por página; apenas as observações válidas dentro de cada intervalo ocupam o eixo. Exemplo: intervalo 11–15/10 mostra 13, 14 e 15/10, sem espaço para 11 ou 12. Min/max locais e acumulados não mudaram.

Imagem atual `web/output/pdf/hcm-simulacao-cinco-dias-validos.png`; exemplo ampliado `web/output/pdf/hcm-simulacao-13-15-dias-validos.png`. Evidência e imagens individuais em `backups/report-score-correction/hcm-five-days-valid-dates/`, ignoradas pelo Git. Conferidos: 21 datas sem perda/duplicação, espaçamento uniforme, ausência de 12/10 e preservação dos seis limites locais e dos 18 totais finais comparados à simulação anterior. Imagem completa inspecionada visualmente; `git diff --check` aprovado. Nenhum PDF novo, alteração do renderizador, banco, publicação ou envio. Continua aguardando avaliação da simulação antes de implementar o desenho final no PDF.


## Situação atual — simulação de intervalos de cinco dias, 31/10/2026

O Dono do produto rejeitou os recortes de faixas Y da v4 e esclareceu que deseja dividir o gráfico em intervalos temporais de cinco dias, usando os valores mínimo e máximo dos acumulados elegíveis de cada intervalo como limites locais do eixo Y. Pediu simular uma imagem antes de gerar outro PDF. O gráfico geral permanece. Isso substitui a interpretação anterior de manter o mês inteiro em cada detalhe com recortes por faixas de pontos.

Entregue somente simulação PNG com dados reais do HCM, por `web/scripts/simulate-report-five-days.py`. Cinco dias corridos adotados como interpretação para a imagem: 01–05, 06–10, 11–15, 16–20, 21–25 e 26–30/10. Não reinicia acumulados, não força zero, não agrega médias nem descarta observações; datas sem resultados não recebem pontos inventados. Cada trecho mostra todos os jogadores elegíveis, com identidade de cor/traço constante. Mínimo/máximo calculados entre todos os valores elegíveis efetivamente exibidos no trecho; limites escritos na imagem. Legenda suporta até 18 participantes nesta simulação HCM e recusa entradas maiores, sem omitir jogadores.

| Intervalo | Mínimo | Máximo | Datas consolidadas |
| --- | ---: | ---: | ---: |
| 01–05/10 | -7.500 | 34.089 | 3 |
| 06–10/10 | -17.500 | 67.006 | 4 |
| 11–15/10 | -25.000 | 90.194 | 3 |
| 16–20/10 | -32.500 | 101.146 | 3 |
| 21–25/10 | -40.000 | 117.673 | 3 |
| 26–30/10 | -46.868 | 164.414 | 5 |

Imagem completa em `web/output/pdf/hcm-simulacao-cinco-dias.png`; exemplo ampliado em `web/output/pdf/hcm-simulacao-26-30.png`. Apesar do nome da pasta de saída previamente ignorada pelo Git, são exclusivamente imagens, nenhum PDF novo. Exportação, PNGs individuais e evidência com checksum da fonte em `backups/report-score-correction/hcm-five-days-simulation/`, privados. Fonte congelada é a mesma das revisões anteriores.

Verificação independente contra `tournamentReport` da aplicação: todos os 18 totais finais, as 21 datas sem perda/duplicação e os seis domínios mínimo/máximo conferem. Imagem completa e exemplo em tamanho integral inspecionados visualmente. `git diff --check` aprovado. Sem alteração do renderizador de produção, sem migração, publicação, modificação remota ou e-mail; testes de PDF/build não repetidos nesta rodada exclusivamente de simulação. Documentação atualizada para distinguir o pedido confirmado da interpretação de dias corridos, ainda sujeita à validação visual.

Próximo passo depende da avaliação da imagem pelo Dono do produto. Somente depois aplicar o desenho validado ao renderizador, testar e gerar nova prévia PDF. V4 e seus scripts de substituição não têm aceite e não devem ser executados. Prévia Aztecas, publicação, backup anterior à manutenção e substituições remotas seguem pendentes após essa validação.


## Revisão v4 — histórico rejeitado pelo Dono do produto

Decisão confirmada pelo Dono do produto: manter o gráfico geral e substituir as visualizações por grupos de jogadores por faixas menores do eixo Y. Implementado `cumulative-scores-v4`. O panorama contém todos os jogadores; cada detalhe mantém o período inteiro e todas as curvas, recortadas geometricamente na faixa de pontuação indicada. Não filtrar apenas pontos internos nem limitar valores às bordas: isso perderia cruzamentos ou criaria linhas falsas. Legenda lateral mostra as séries com algum ponto ou segmento visível, inclusive segmentos que cruzam uma faixa com ambas as observações fora dela. Cores, traços e números de identificação permanecem os mesmos do panorama. Continuações de legenda em torneios maiores não dividem os jogadores entre gráficos.

Escala geral calculada com zero e todos os acumulados elegíveis; cada intervalo da grade geral vira uma ampliação com subdivisões menores. Para HCM: panorama de -50.000 a 200.000; detalhes -50.000–0, 0–50.000, 50.000–100.000, 100.000–150.000 e 150.000–200.000, com grade de 10.000 pontos. Todas as páginas informam explicitamente os limites do recorte e que trechos fora da faixa ficam ocultos. O cálculo ajusta os intervalos ao domínio de cada torneio; zero/ausência de variação não gera detalhes redundantes. Classificação tabular, duplas e tabela de valores preservadas.

Prévia real: `web/output/pdf/hcm-outubro-pontos-acumulados-v4.pdf`, 14 páginas (panorama e cinco recortes). SHA-256: `6094fd3b236afc3017364fc5a0c8fc7264b0f2af5e8baadbb964843421468e4b`. Captura e scripts correspondentes em `backups/report-score-correction/hcm-preview-v4/`, privados; versões anteriores e seus scripts ficam como histórico, não devem ser usados para substituição da revisão atual.

Verificações: 14 testes focados aprovados (11 de relatório/SQL e três de escala, travessias, elegibilidade e domínio zero/negativo); lint dos quatro arquivos alterados sem erros/avisos; build/TypeScript aprovados. Todas as 14 páginas renderizadas e inspecionadas. Conferência independente do PDF: um panorama, cinco limites de Y esperados, período completo, operadores de clipping presentes, legendas equivalentes aos pontos/segmentos que interceptam cada faixa, 18 resultados juntos na capa e 378 células da evolução iguais às somas da captura. Dupla Evelyn/Zader permanece com oito trocas. `git diff --check` aprovado. Nenhum dado pessoal foi adicionado a arquivos versionáveis.

Sem mudança de banco, cálculo, permissões ou integração. Documentação/ADR atualizados. Aceite do Dono do produto sobre a v4, prévia Aztecas, publicação, backup completo imediatamente anterior à manutenção e substituição/comparação remotas ainda pendentes. Nenhum envio novo ou operação remota foi realizado.


## Revisão visual v3 — histórico substituído pela v4

O Dono do produto apontou legenda pouco clara e classificação final visualmente desagradável, incluindo quebra dos resultados entre páginas. A prévia v2 não foi aceita. Implementada revisão `cumulative-scores-v3`: legenda em painel lateral com um nome por linha, amostra de cor/traço ao lado e fonte maior; classificação final em tabela com posição, jogador e pontos alinhados, cabeçalho verde, linhas alternadas e totais negativos destacados. Capa compactada para manter os 18 resultados reais do HCM na primeira página. Torneios maiores continuam paginados com cabeçalho repetido. Não se atribui causa ao aplicativo da captura: a nova organização evita nomes de legenda na mesma linha e melhora a separação visual.

Novo PDF: `web/output/pdf/hcm-outubro-pontos-acumulados-v3.pdf`, SHA-256 `466997af3ac10e170bead7463f9d699712e24ba4cacd18958662203bad2ff299`. Arquivos/evidências e scripts administrativos correspondentes em `backups/report-score-correction/hcm-preview-v3/`, privados e não executados. V2 e seu checksum abaixo ficam como histórico substituído para aceite e manutenção. Usar somente os scripts gerados para a revisão que vier a ser aceita.

Conferência independente do PDF real: 18 resultados na página 1, 18 nomes de legenda em coordenadas verticais distintas e coluna única; 378 células do anexo iguais às somas da captura, quatro gráficos do período completo, totais finais e oito trocas de Evelyn/Zader preservados. Todas as 12 páginas renderizadas com Poppler e inspecionadas. Os 11 testes focados de relatórios passaram, incluindo geração e substituição SQL em PGlite; lint dos dois arquivos alterados sem erros/avisos. `git diff --check` aprovado. Não houve alteração de schema, permissões, cálculo ou integração; build anterior continua como evidência da versão precedente, sem nova execução nesta revisão de apresentação.

Aceite do Dono do produto sobre a nova apresentação ainda pendente. Publicação, backup imediatamente anterior à manutenção, prévia Aztecas e substituição remota continuam pendentes. Nenhuma alteração no banco remoto ou envio de e-mail.

## Entrega local — 31/10/2026

Verificação final concluída: 11 testes focados aprovados após o ajuste dos emojis; lint de todos os arquivos de código alterados sem erros/avisos; build/TypeScript novamente aprovados. Conferência independente via extração do PDF confirmou as 378 células da evolução (18 × 21), incluindo traços de inelegibilidade, contra as somas da captura, além dos 18 totais do PDF anterior e das 8 trocas de Evelyn/Zader. As 12 páginas finais foram renderizadas e inspecionadas; não há glifos ausentes na extração. SHA-256 do PDF entregue: `fd4b00b11e4248498dbc198a1d066e3a556ee5d23a572f765a3a9b3a5d1d0720`. `git diff --check` aprovado. Aceite do Dono do produto ainda pendente.

O Dono do produto aprovou o plano. Implementado renderizador `cumulative-scores-v2`: pontos acumulados aceitos no encerramento, eixo crescente com zero/negativos, período completo, panorama com até 18 séries por página e detalhes com até seis, mesma escala global, legendas locais por nome e traço, datas inicial/final e tabelas numéricas com cabeçalhos repetidos. Elegibilidade preservada; classificação/duplas mantidas. Emojis sem glifo na fonte embarcada são omitidos apenas na apresentação do PDF, com aviso na capa e cadastro/captura intactos. Nomes extensos podem ser abreviados com reticências na legenda; classificação e cabeçalhos de tabela conservam o nome textual completo.

CLI offline valida e lê uma exportação, gera PDF/evidência sem conexão e prepara opcionalmente backup/SQL de substituição delimitada com checksums. SQL testado localmente com locks, recusa de lease ativo, original alterado e retirada, repetição idempotente e preservação de captura/metadados/pontuações/destinatários. Sem migração: somente `pdf_base64` é atualizado administrativamente; não são criadas novas permissões/RPCs. [Decisão e consequências](../decisoes/adr-015-correcao-pontos-acumulados.md).

Inventário remoto e captura HCM fornecidos pelo Dono do produto: 18 participantes, 371 resultados, 21 datas. Checksum da captura validado e todos os 18 totais finais comparados com o PDF original; Evelyn/Zader continua com 8 trocas. Prévia real de 12 páginas gerada e revisada; PDF final em `web/output/pdf/hcm-outubro-pontos-acumulados.pdf`, ignorado pelo Git. Evidências privadas em `backups/report-score-correction/`; não constituem o backup completo imediatamente anterior à manutenção. [Inventário, hashes, procedimento e recuperação](sprint-8-correcao-grafico-operacao.md).

Verificações locais: suíte completa com 138 testes aprovada; lint sem erros (um aviso preexistente em `retroactive-scores.test.mjs`); build/TypeScript aprovados. Após ajuste de apresentação dos emojis, testes focados e verificações finais foram repetidos conforme registro final abaixo. PDFs sintético e HCM renderizados com Poppler, incluindo inspeção de panorama, detalhes, tabelas, continuações e paginação. Testes SQL executados em PGlite; concorrência real remota não homologada nesta entrega.

Pendências atuais: aceite do Dono do produto sobre a prévia real; exportação/prévia do Aztecas; publicação do código; backup privado completo validado imediatamente antes da manutenção; substituição e comparação remotas dos alvos delimitados. Não houve migração, alteração remota, retirada ou reenvio. Torneio de ensaio automático preservado. O texto a seguir é o plano aprovado e conserva a situação histórica anterior à implementação.

## Decisão e situação

O Dono do produto esclareceu, após examinar o HCM encerrado, que deseja a evolução das **pontuações acumuladas dos jogadores por data**, em vez da evolução das posições. Esta decisão substitui a interpretação anterior de RF19 sobre a grandeza do gráfico. O teste anterior com poucos participantes não demonstrou adequadamente a legibilidade em um torneio real.

Sequência solicitada: planejar a correção, gerar o PDF corrigido do HCM encerrado para validação e, depois de concluída e validada a correção, regenerar os relatórios dos torneios correspondentes na plataforma. Este documento registra o planejamento; implementação, prévia corrigida, publicação e regeneração remota ainda não foram executadas. O esclarecimento do requisito não equivale ao aceite de um novo layout.

## Evidência e diagnóstico

PDF recebido: HCM - Outubro, período de 01 a 30/10/2026, encerrado em 31/10/2026 às 00:22 (São Paulo), 18 participantes e 10 páginas. Texto extraído das dez páginas e gráfico da página 3 inspecionado visualmente. A evolução ocupa duas páginas (01–29/10 e 29–30/10), usa posições e números de série cuja identificação fica em outras páginas. Existem totais finais negativos. O PDF não contém os pontos acumulados intermediários: posições e totais finais são insuficientes para reconstruí-los com fidelidade.

O cálculo em `web/src/lib/tournament-report.ts` já produz `points[].totals`, além de posições. O renderizador `web/src/lib/tournament-report-pdf.ts` usa apenas posições no gráfico e no anexo numérico. O processamento em `web/src/lib/report-processing.ts` reutiliza o PDF existente; publicar o renderizador corrigido, isoladamente, não atualiza documentos antigos. A retirada limpa `snapshot` e `pdf_base64` na migração 202610240001. Não há inventário remoto novo nesta revisão.

## Apresentação proposta e critérios de aceite

- Título “Evolução da pontuação acumulada”; eixo horizontal por data de jogo e vertical em pontos acumulados, crescente de baixo para cima, com formatação pt-BR.
- Usar soma dos pontos aplicados aceitos no encerramento, incluindo ausências, penalidades e auditorias. Preservar valores negativos e quedas reais; incluir referência zero e escala que cubra todos os valores. Não usar pontuação bruta nem recalcular regras atuais sobre resultados congelados.
- Mostrar cada participante somente a partir da elegibilidade. Ausência de elegibilidade não é zero. Manter todas as datas consolidadas e os valores; reduzir rótulos de datas quando necessário, sem remover observações.
- Proposta visual: gráfico geral com o período completo, legenda de nomes na própria página, cores combinadas com traços e identificação sem sobreposição. Se 18 séries continuarem difíceis de ler, acrescentar painéis de detalhe com grupos estáveis, mesma escala e período completo; todos os participantes continuam no panorama e nos detalhes, sem seleção apenas dos líderes. Validar o desenho efetivo com o HCM, sem fixar quantidade arbitrária de linhas por página antes da inspeção.
- Anexo numérico deve apresentar pontos acumulados por data, com cabeçalhos/identificação repetidos em continuações. Último acumulado de cada jogador deve coincidir com seu total na classificação final.
- Classificação final e duplas mais disputadas mantêm suas regras atuais. A mudança solicitada é a métrica da evolução; não há solicitação de redefinir inversões ou empates.

## Execução planejada

1. Inventariar de forma somente leitura os torneios encerrados candidatos: ID, nome, encerramento, retirada prevista/efetiva, presença de captura/PDF, estado de envios e lease. Identificar HCM por ID, não apenas pelo nome. Delimitar a lista dos “torneios correspondentes” antes de qualquer lote e registrar os que não podem ser regenerados.
2. Obter cópia privada da captura congelada do HCM, conferir contagens e totais contra o documento original e preservar evidência/checksum fora do Git. Se a captura já tiver sido limpa, investigar os dados finais preservados e backups disponíveis; não reconstruir a evolução a partir das posições do PDF nem reabrir o torneio. Reconstrução alternativa exige comprovar equivalência ao estado encerrado.
3. Alterar renderizador, tabela e testes; aproveitar o cálculo de acumulados existente com filtro de elegibilidade. Criar caminho de prévia que somente lê a captura e gera arquivo local, sem chamar o worker de envio, alterar fila ou encerrar novamente o torneio.
4. Gerar PDF corrigido com dados reais do HCM, renderizar páginas e conferir legibilidade das 18 séries, valores negativos, nomes, legenda, datas, tabelas e paginação. Entregar a prévia ao Dono do produto para validação. Uma fixture sintética não substitui este aceite.
5. Preparar mecanismo administrativo explícito para regeneração dos IDs selecionados, com revisão/identificação do renderizador, operação repetível, exclusão mútua com worker e retirada e registro de resultado por torneio. Definir necessidade de migração a partir desse desenho; não zerar estados de entrega ou `generated_at` para forçar o fluxo comum.
6. Após validação do HCM, publicar a correção pelo fluxo do projeto e executar regeneração delimitada, com backup privado validado do estado afetado e comparação antes/depois. Preservar resultados congelados, participantes, pontuações pessoais e demais torneios. Conferir que cada PDF armazenado é da revisão corrigida; registrar falhas e permitir retomada sem repetir sucessos.

## Regeneração e envio são operações distintas

Regenerar o arquivo armazenado não corrige anexos já enviados. A solicitação atual autoriza planejar a regeneração na plataforma, mas não define reenvio de e-mails. Não reenviar automaticamente nem apagar o histórico de envios aceitos. Se for desejado distribuir a versão corrigida, definir esse alcance com o Dono do produto e usar entrega identificada como retificação, com rastreamento separado e proteção contra duplicação.

Torneios retirados não devem ser reativados silenciosamente; a regra vigente mantém o PDF somente nos e-mails após retirada. A possibilidade de obter dados para esses casos e o canal de entrega corrigida precisam ser tratados explicitamente no inventário. A agenda de retirada pode apagar capturas enquanto a correção é preparada: verificar prazos antes da execução e preparar preservação privada/coordenação temporária delimitada, sem alterar globalmente retenção ou reiniciar a contagem das 168 horas por causa de uma nova geração. O torneio isolado “Torneio Agendadp” continua fora de intervenções que invalidem o ensaio de retirada automática.

## Testes e documentação da implementação futura

Testar acumulados numéricos por data e correspondência com totais finais, pontos negativos e zero, quedas por sanções, empates, ingresso posterior, ausência, datas excluídas, zero/um participante e ausência de resultados. Usar fixture sintética com pelo menos 18 participantes e período de tamanho equivalente ao HCM, sem versionar seus dados pessoais. Verificar que gráfico e tabela usam acumulados e preservam todos os participantes/datas.

Para regeneração: PDF existente, revisão antiga/nova, repetição, falha parcial, lease ativo, concorrência com retirada, captura ausente e preservação dos envios anteriores. Executar testes pertinentes, lint e build. Conferir PDFs renderizados do cenário sintético e do HCM real. Registrar separadamente testes locais, publicação, execução remota e aceite do Dono do produto.

Na implementação, atualizar arquitetura, diagrama e eventual ADR se o fluxo administrativo/modelo de revisão alterar estados, permissões, transações ou retenção; atualizar roteiro operacional com backup, recuperação e evidências sem credenciais/dados pessoais. Nesta entrega documental não há alteração da arquitetura vigente, migração ou teste funcional. Verificação: revisão do plano e `git diff --check`.
