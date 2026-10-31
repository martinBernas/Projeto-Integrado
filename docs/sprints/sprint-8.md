# Sprint 8 — encerramento definitivo de torneios e modo escuro

31/10/2026 — RF26 refinado pelo Dono do produto: navegação direta com mouse implementada localmente. Roda sobre a área de curvas amplia/reduz ancorada no cursor; após ampliar, arrasto com botão esquerdo move datas e pontos, limitado aos dados. Captura de ponteiro mantém o arrasto ao sair do SVG e termina ao soltar/cancelar. Roda fora da área de curvas mantém rolagem normal; botões e seleção continuam disponíveis. Substitui a limitação anterior de navegação somente por botões. Sem pinça em toque, novas consultas, gravações ou migração. Publicação/aceite pendentes.

31/10/2026 — RF26 ampliado por pedido do Dono do produto: zoom, deslocamento e seleção de jogadores na legenda, com todos/nenhum/somente você. Implementado localmente, 154 testes, build/TypeScript e lint sem erros (aviso preexistente). Interações verificadas no navegador, teclado, temas e celular. Requisitos, arquitetura e decisões atualizados. Publicação e aceite pendentes; sem migração. [Entrega](sprint-8-estatisticas-progressao-nemesis.md).

## Novo incremento RF26/RF27 — 31/10/2026

Dono do produto solicitou e pediu registro formal do panorama acumulado do PDF nas estatísticas e de Nêmesis pessoal. Implementação local e requisitos registrados, 150 testes/lint/build aprovados, UI revisada com dados sintéticos em claro/escuro e 375/1280 px. Sem migração, publicação ou aceite remoto desta nova tela. [Entrega e decisões](sprint-8-estatisticas-progressao-nemesis.md). Correção/reenvio de PDFs anteriores permanecem concluídos e separados.

## Reenvio pontual concluído tecnicamente — 31/10/2026

Dono do produto apresentou o acompanhamento SQL após reativar os envios. Aztecas: 6 destinatários/6 `sent`; HCM: 18 destinatários/18 `sent`. Ambos com `pending=0`, `sending=0`, `failed=0`, `uncertain=0`, `lease_until=null` e `withdrawn_at=null`. Horários originais de geração e prazo de retirada mantidos.

Com a reativação 6/18 pendentes anteriormente apresentada, confirma aceitação SMTP dos 24 novos envios pelo fluxo existente, usando os PDFs corrigidos armazenados e conferidos. Não interpretar `sent` como prova de recebimento/leitura nas caixas. Nenhum novo teste de anexo recebido foi informado. Não repetir a reativação nem reexecutar envios concluídos.

Operação excepcional solicitada pelo Dono do produto atendida, sem nova funcionalidade, schema ou publicação. Correção, substituição de PDFs e reenvio técnico dos dois torneios concluídos. Evidência é o retorno SQL fornecido, sem consulta direta do agente. O primeiro resultado de `06-resend-status.sql` (identificação/contagem do backup operacional) não foi apresentado nesta mensagem; a preservação em `private.sprint8_backups` decorre da mesma transação do script de reativação executado e foi testada localmente, sem alegar nova conferência remota desse registro ou exportação privada adicional. Backups/evidências anteriores permanecem privados e fora do Git.

Não restam ações necessárias para disparar este reenvio. Eventual confirmação de recebimento/leitura e o ensaio independente de retirada automática são evidências distintas, não inferidas nem encerradas por esta consulta. Registros antigos abaixo de reenvio ainda não executado/aceitação pendente são históricos substituídos por esta conclusão. Nesta rodada somente atualização documental e `git diff --check`, sem alteração de código, novo envio ou repetição de testes funcionais.


## Reenvio reativado — 24 registros pendentes

31/10/2026 — Retorno SQL apresentado pelo Dono do produto confirma operação administrativa executada: Aztecas `34727be9-2447-4e7c-af41-e685b6db290b`, 6 destinatários, 6 pendentes e 0 `sent`; HCM `93c7e3c5-a676-42d4-83ca-05284cce0fff`, 18 destinatários, 18 pendentes e 0 `sent`. Geração mantida em `2026-10-31 03:21:13.879956+00`/`2026-10-31 03:22:45.052714+00` e retirada prevista em `2026-11-07 03:21:12.691942+00`/`2026-11-07 03:22:43.681343+00`, respectivamente.

Reativação dos 24 registros confirmada, sem alegar novo e-mail aceito ou recebido. O resumo é emitido dentro da transação antes do commit; o worker pode já ter avançado depois desse instante. Não executar novamente `05-force-resend-approved.sql`. Usar o botão existente “Processar envios pendentes” ou aguardar a agenda; processamento em lotes de até cinco destinatários por execução, com lease para exclusão mútua. Conferir `06-resend-status.sql`: operação/24 registros anteriores preservados no primeiro resultado e estados atuais dos dois torneios no segundo. O backup é gravado na mesma transação pelo script; o resultado de acompanhamento ainda precisa confirmar sua identificação/contagem, sem exportar endereços para a conversa.

Conclusão técnica do reenvio ainda pendente: Aztecas 6/6 e HCM 18/18 `sent`, sem pendentes/em envio/falhas/incertos. Erros/estados incertos exigem conciliação pelo procedimento existente, sem nova reativação em massa. Nenhuma alteração funcional nesta rodada, somente documentação e `git diff --check`. As pendências anteriores de executar a reativação estão resolvidas por este retorno; aceitação SMTP dos novos envios e eventual confirmação de recebimento/anexo são evidências separadas.


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

31/10/2026 — Relatório Aztecas v5 também gerado/conferido com dados reais, pelo gerador compartilhado aprovado. Dono do produto informou publicação ainda não realizada e que a fará após finalizar os arquivos do repositório. [Entrega e procedimento](sprint-8-correcao-grafico.md). Não há nova pendência de aprovação geral, exportação Aztecas ou desenvolvimento do layout; permanecem publicação, backup completo e substituição/comparação remotas.

31/10/2026 — Aceite explícito recebido para o relatório v5; Dono do produto autorizou avançar com publicação e regeneração de HCM/Aztecas. Resolve a pendência de validação do PDF desta correção. Exportação Aztecas, comprovação de publicação, backup anterior à substituição e execução/comparação remotas ainda pendentes. [Registro do aceite](sprint-8-correcao-grafico.md). Não implica fechamento global da Sprint 8 nem evidência nova da retirada automática do torneio de ensaio.

31/10/2026 — Dono do produto considerou a simulação promissora e autorizou implementar no PDF, reforçando regras automáticas para todos os campeonatos. Implementado gerador compartilhado v5 com um gráfico por página, blocos de cinco datas pontuadas/sobra unitária unida, escala local, cinco duplas e nomes de jogadores no anexo. [Entrega, testes, prévia e limites](sprint-8-correcao-grafico.md). Publicação e substituição remota ainda pendentes; a autorização de implementação não é aceite do PDF final.

31/10/2026 — V4 rejeitada visualmente. Dono do produto esclareceu intervalos temporais de cinco dias com mínimo/máximo locais no eixo Y e pediu imagem antes de outro PDF. [Simulação PNG real HCM](sprint-8-correcao-grafico.md) preparada; cinco dias corridos adotados para validação. Nenhum PDF/renderer alterado nesta rodada. Aguardar avaliação da imagem antes de implementar nova revisão e de qualquer substituição remota.

31/10/2026 — Dono do produto solicitou detalhes por faixas menores do eixo Y, mantendo o panorama. Implementada prévia HCM v4; detalhes não separam jogadores. [Entrega atual e verificações](sprint-8-correcao-grafico.md). Aceite visual e operações remotas ainda pendentes; referências v2/v3 abaixo são históricas.

31/10/2026 — Após rejeição da apresentação da legenda e da classificação final pelo Dono do produto, prévia v3 gerada: legenda lateral em uma coluna e tabela com todos os 18 resultados do HCM na primeira página. [Entrega visual revisada](sprint-8-correcao-grafico.md). Nova prévia aguardando aceite; nenhuma operação remota.

## Correção de RF19 implementada localmente — 31/10/2026

Plano aprovado pelo Dono do produto. Evolução por pontos acumulados implementada, com prévia real do HCM e substituição administrativa preparada. [Entrega, verificações e limitações](sprint-8-correcao-grafico.md) e [inventário/procedimento](sprint-8-correcao-grafico-operacao.md). Aceite da prévia, publicação e substituição remota permanecem pendentes; sem novos envios. O refinamento abaixo registra o planejamento anterior e foi sucedido por esta implementação.

## Refinamento de 31/10/2026 — gráfico do relatório

O Dono do produto esclareceu que RF19 deve apresentar pontuações acumuladas por data, substituindo a interpretação anterior de evolução de posições. O HCM encerrado, com 18 participantes, será o caso real de validação antes da regeneração delimitada dos relatórios na plataforma. [Plano de correção e critérios de aceite](sprint-8-correcao-grafico.md). Esta revisão é documental: nenhum código, PDF corrigido, envio, publicação ou operação remota executados. O aceite anterior do teste isolado não homologa o gráfico rejeitado após uso real. Permanecem separados os acompanhamentos operacionais da retirada automática.

## Situação consolidada ao encerrar o avanço de 24/10/2026

O Dono do produto confirmou que testou o modo escuro e que está conforme o desejado: homologação e aceite funcional do modo escuro registrados. Esse aceite substitui as pendências gerais de homologação do tema nos registros anteriores, sem presumir evidências detalhadas de cada dispositivo/cenário. Nenhuma alteração de código decorrente desse aceite.

Relatórios: PDF gerado, conteúdo inspecionado e recebimento pelos dois destinatários confirmados no primeiro teste; retirada antecipada validada. Migrações e comparações remotas concluídas, backup original reaproveitado com preservação confirmada, agendas instaladas/executando e cinco respostas HTTP 200 sem timeout/erro. Segundo torneio de teste mantido com PDF gerado e 2/2 envios aceitos para observar a retirada automática a partir de 31/10/2026 às 17:46 (São Paulo), conforme painel. Esta observação permanece pendente; não declarar encerramento global da sprint antes de sua validação/aceite. Cenários detalhados sem evidência remota continuam cobertos apenas pelas verificações locais já registradas. Trabalho do dia pode ser encerrado com esse acompanhamento identificado.

24/10/2026 — Dono do produto apresentou painel do segundo torneio isolado, “Torneio Agendadp”: encerrado, PDF gerado e 2/2 envios aceitos pelo Gmail. Retirada prevista exibida: 31/10/2026 às 17:46, São Paulo. Este é o torneio mantido para observar retirada automática após uma semana; não executar retirada antecipada nele durante o ensaio. Conferir após o prazo com agendas já verificadas, registrando desaparecimento para organizador e participantes. Horário do painel tem precisão de minutos; considerar a execução seguinte do cron após o instante efetivo. Ainda não há evidência de retirada automática desse torneio. Esta evidência resolve a pendência de prazo e estado PDF/envios do segundo teste; recebimento nas caixas desse segundo torneio não foi informado.

24/10/2026 — Dono do produto forneceu cinco respostas pg_net (IDs 1–5), entre 20:55 e 21:15 UTC, todas com `status_code=200`, `timed_out=false`, `error_msg=null`. Com o histórico cron já apresentado, confirmada chamada agendada ao worker com resposta de sucesso, sem falha de autenticação/timeout observada. HTTP 200 não prova processamento de destinatários em cada execução: o worker pode não encontrar trabalho. Instalação e funcionamento técnico das agendas verificados; retirada efetiva após 168 horas ainda depende da observação do novo torneio no prazo exibido. Data/hora específica desse novo torneio e seu estado PDF/envios ainda não fornecidos; não reutilizar o horário do primeiro torneio já retirado.

24/10/2026 — Histórico remoto fornecido pelo Dono do produto confirmou `succeeded` para o job de retirada entre 21:11 e 21:19 UTC e para relatórios às 21:15 UTC, todos com retorno `1 row`. Execução SQL das agendas confirmada. `1 row` não significa um torneio retirado nem email enviado; na agenda HTTP comprova somente o enfileiramento da chamada pg_net. Status HTTP correspondente ainda não fornecido; autenticação/execução remota do worker pela agenda e retirada ao fim de 168 horas continuam pendentes.

24/10/2026 — Dono do produto confirmou pg_net ativo, ausência prévia de jobs de relatórios, apresentou os dois nomes esperados no Vault (valores não inspecionados) e retornou instalação das agendas: job 2 `geoguaras-tournament-withdrawal`, `* * * * *`, active=true; job 3 `geoguaras-tournament-reports`, `*/5 * * * *`, active=true. Configuração remota das agendas confirmada; execução dos jobs, resposta HTTP/autenticação do worker e retirada após 168 horas ainda exigem evidência. Não repetir 04-schedule.sql. Próxima verificação: histórico cron e metadados HTTP, sem expor headers/segredos.

24/10/2026 — Dono do produto confirmou retirada antecipada do primeiro torneio de teste: deixou de aparecer para ambos os usuários e anexos permaneceram nas caixas. Retirada antecipada validada nesse cenário; não comprova preservação de todos os demais torneios/pontuações. Criou e encerrou outro torneio com data final 23/10 para observar retirada após uma semana; prazo parte do encerramento efetivo, não da data final. PDF/envios desse novo torneio e data/hora exibida de retirada ainda não informados. Próxima etapa: preflight de extensões/jobs e configuração de agendas, ainda sem evidência de instalação. Não há retirada automática homologada.

24/10/2026 — Dono do produto confirmou recebimento do relatório pelos dois destinatários do torneio isolado. Evidências combinadas: painel com PDF gerado/aceitação Gmail 2/2, PDF de três páginas inspecionado e recebimento nas duas caixas confirmado. Fluxo de processamento e recebimento validado para este teste; não implica garantia geral de entrega nem comprova geração automática no ato de um novo encerramento, pois este relatório foi processado pelo botão de pendências após ajuste de configuração. Próxima homologação: retirada antecipada do mesmo torneio com confirmação explícita, conferência de desaparecimento para organizador/participantes e manutenção dos anexos nas caixas. Agendas automáticas e demais cenários permanecem pendentes.

24/10/2026 — PDF de teste fornecido pelo Dono do produto inspecionado integralmente por extração e renderização das três páginas, sem copiar o documento/dados pessoais para arquivos versionados. Classificação final, gráfico acumulado com primeiro lugar no topo e tabela diária legíveis, sem cortes/sobreposições observados. As três inversões registradas na tabela (09, 12 e 14/10) coincidem com os cruzamentos do gráfico e com a contagem da dupla mais disputada. Verificada coerência interna do PDF, sem confrontar pontuações com o banco; arquivo disponibilizado não comprova recebimento nas duas caixas nem aceite funcional. Retirada antecipada e agendas continuam pendentes.

24/10/2026 — Dono do produto apresentou painel remoto do torneio isolado “Teste reporte” com `PDF: gerado` e `Envios aceitos pelo Gmail: 2/2`, após orientação de conferência/substituição da chave de relatórios. Geração e aceitação SMTP registradas na aplicação; recebimento nas caixas, conteúdo dos anexos, retirada antecipada e agendamento automático ainda não comprovados. Não afirmar causa definitiva do 42501 anterior sem evidência da configuração efetivamente alterada. Retirada exibida a partir de 31/10/2026 às 17:20 (São Paulo), condicionada aos bloqueios; exibição não comprova job instalado. Esta evidência substitui o estado de PDF pendente/0 de 2 e falha ativa nos registros anteriores, preservados como histórico.

24/10/2026 — Consulta remota de permissões informada pelo Dono do produto: `acesso_schema=true`, `pode_processar=true`, `executa_com_permissao_do_dono=true`, `dono_funcao=postgres` para `claim_tournament_report(uuid)`. Grant de execução a service_role e SECURITY DEFINER confirmados; não há justificativa para ampliar acesso a anon/authenticated. Erro 42501 continua sem causa definitiva. Próxima conferência operacional: substituir somente o valor de SUPABASE_REPORTS_SECRET_KEY em Production por uma Secret key do mesmo projeto da URL configurada, publicar novo deployment e repetir no mesmo torneio; métricas e chaves existentes permanecem preservadas.

24/10/2026 — Diagnóstico remoto fornecido pelo Dono do produto às 20:28:31 UTC: `claim_tournament_report` falhou com SQLSTATE `42501`, seguido de `processing/report_database_failed`. Causa localizada na etapa de acesso ao banco antes de obter o trabalho, não na autenticação Gmail/PDF. Falta identificar se há divergência de grants/proprietário no banco ou papel efetivo da chave na hospedagem; não ampliar permissões de anon/authenticated. Próxima verificação somente leitura de permissões da função para service_role. Diagnóstico já observado em produção; geração/envio permanecem sem sucesso confirmado.

24/10/2026 — Diagnóstico sanitizado validado localmente: 135 testes aprovados, zero falhas/pulados; lint dos quatro arquivos alterados e build de produção/TypeScript aprovados. Inclui teste que impede exposição de mensagens brutas, credenciais, emails e caminhos. Sem nova migração; publicação da instrumentação e diagnóstico remoto continuam pendentes.

24/10/2026 — Teste remoto em torneio isolado mostrou PDF pendente e 0/2 envios. Flag inicialmente `TRUE` não atendia à comparação literal `true`; após orientação de correção, mensagem mudou para falha genérica de processamento. Dono do produto forneceu requisição POST `/dashboard/tournaments` de 17:23:00 GMT-3, deployment `dpl_BeitYrUSHiu7nPNjwBHrRTKHexhZ`, Production/main, HTTP 200, sem mensagem de erro. HTTP 200 não comprova processamento: a ação captura exceções. Causa ainda não identificada; não presumir falha de senha, PDF ou banco. Adicionado diagnóstico local sanitizado por etapa/código em configuração, RPC, PDF e envio, sem alterar dados ou repetição. Teste de sanitização incluído; publicação desta correção e novo teste remoto pendentes. Nenhum envio/PDF real confirmado.

24/10/2026 — Dono do produto apresentou cadastro das cinco variáveis de relatórios em Production na Vercel, confirmou `TOURNAMENT_REPORTS_ENABLED=false` e informou deploy pronto. Valores secretos não verificados; URL/identificador desta publicação não fornecidos. Publicação informada com processamento desativado; ativação, teste SMTP/PDF, agendas e homologação continuam pendentes. Nenhum envio real confirmado.

24/10/2026 — Comparação remota posterior a 002 executada pelo Dono do produto retornou `business_snapshot=preserved`, `report_queues=empty`, `gmail_reports=installed`. Incremento Gmail confirmado pelo script de conferência: dados comparados preservados, filas vazias e verificações de funções/permissões aprovadas. Backup original reaproveitado; pausa de gravações liberada. Manter `TOURNAMENT_REPORTS_ENABLED=false` até configurar a hospedagem e publicar o código pelo fluxo do Dono do produto. Configuração SMTP, publicação desta versão, agendas e homologação/envio real continuam sem evidência. Este registro substitui as pendências de migração e comparação remotas anteriores.

24/10/2026 — Dono do produto informou execução remota de `202610240002_gmail_report_delivery.sql` com retorno `Success. No rows returned`. Migração 002 executada sem erro reportado; comparação posterior com `gmail-reports/00-verify-existing-backup.sql` ainda pendente. Manter gravações/worker pausados até essa conferência. Não há evidência de configuração SMTP, publicação, agendas ou envio real nesta etapa. Este registro substitui a pendência de execução de 002 nos registros anteriores.

24/10/2026 — Dono do produto executou remotamente `gmail-reports/00-verify-existing-backup.sql` antes de 002: `business_snapshot=preserved`, `report_queues=empty`, `gmail_reports=pending`. Confirmado reaproveitamento do backup original validado, sem nova captura/exportação. Migração Gmail 002 e comparação posterior ainda pendentes; manter gravações/worker pausados até a comparação. Esta evidência substitui a pendência de conferência prévia registrada abaixo.

24/10/2026 — Dono do produto confirmou ausência de alterações desde o backup original. Roteiro ajustado para reutilizá-lo mediante comparação das 21 seções e confirmação de filas vazias, com `gmail-reports/00-verify-existing-backup.sql` antes/depois de 002. Conferência remota pendente. Nova captura de 24 seções passa a alternativa se houver diferenças/fila, substituindo sua obrigatoriedade nos registros anteriores. Backup original contém funções anteriores a 001; essa migração permanece preservada no repositório. Script somente leitura preparado, ainda não executado remotamente; nenhuma mudança de arquitetura nesta atualização.

24/10/2026 — Adaptação Gmail validada localmente: 134 testes completos aprovados, zero falhas/pulados, lint dos arquivos alterados e build/TypeScript aprovados. Inclui aceitação SMTP, sanitização de falhas, rejeição repetível, quarentena imediata de tentativa interrompida, proteção contra duplicidade e preservação integral da fila no incremento. Validador de backup sintético Gmail confirmou 24 seções e 82 definições; Nodemailer e fonte do PDF presentes no rastreamento de produção. Migração 002, captura/exportação/comparação novas, credenciais SMTP de relatórios, publicação/agendas e homologação ainda pendentes no ambiente remoto; nenhum envio real ou alteração na recuperação de senha. Migração 001 e comparação originais não devem ser repetidas.

## Incremento Gmail vigente — 24/10/2026

Critério confirmado pelo Dono do produto: aceitar como sucesso o envio aceito pelo Gmail para encaminhamento. SMTP/TLS com a conta existente substitui Resend; sem domínio/serviço pago, sem modificar recuperação de senha. Resposta negativa comprovada permite repetição; timeout/confirmação perdida vira incerto e bloqueia ambas as retiradas, sem reenvio automático. A migração 001 e sua comparação já foram confirmadas; não reaplicar. Incremento 002 preparado localmente, com nova captura/exportação/validação/comparação de 24 seções ainda pendentes no ambiente remoto. [ADR-014](../decisoes/adr-014-relatorios-gmail-sem-custo.md) e [roteiro vigente](sprint-8-gmail-operacao.md) substituem instruções anteriores de Resend/webhook. Nenhuma credencial lida/configurada nem envio real realizado pelo agente. Verificação final: 134 testes, lint e build/TypeScript aprovados. Registros anteriores de critério pendente foram substituídos pela confirmação atual.

24/10/2026 — Localizado registro anterior em docs/sprints/operacao-2026-09-23.md, seção Validação posterior e recuperação entre aparelhos: Dono do produto configurou envio por Gmail e confirmou funcionamento da solicitação/abertura do link de recuperação no Chrome. web/README.md documenta configuração SMTP de autenticação no Supabase. Essa evidência substitui a suposição de inexistência de configuração Gmail no projeto; não comprova validade atual das credenciais nem envio de relatórios. Reaproveitar a conta e o arranjo SMTP como base para RF19, sem criar conta/domínio e sem modificar a recuperação de senha. Credenciais não lidas/expostas. Critério de sucesso SMTP versus entrega externa ainda não confirmado; adaptação de RF19 ainda não implementada. Migração/comparação anteriores permanecem concluídas.

24/10/2026 — Dono do produto informou que já existe uma conta Gmail exclusiva do projeto. Considerar essa conta na avaliação de envio sem domínio próprio/custo monetário adicional; não solicitar criação de outra conta. Endereço e credenciais não foram fornecidos nem registrados. Autenticação e disponibilidade da senha de aplicativo ainda não verificadas. A adoção técnica do Gmail e eventual alteração do critério de sucesso de entrega ainda exigem alinhamento; não dispensar a proteção de retirada. Migração/comparação RF19 já concluídas permanecem válidas; Resend não ativado, nenhum envio real realizado.

24/10/2026 — Dono do produto definiu restrição de custo monetário zero: projeto sem fins lucrativos, sem interesse em investir dinheiro. Não possui conta Resend e informou apenas o endereço geoguaras.vercel.app, que não fornece controle DNS para verificar remetente no Resend. Não contratar plano, comprar domínio ou presumir serviço pago. A ativação de e-mail via Gmail SMTP fica suspensa enquanto se avalia alternativa gratuita sem domínio próprio; não altera a migração/comparação já concluídas nem autoriza dispensar os relatórios/envios exigidos para retirada. Nenhuma alternativa de provedor ou mudança do critério de sucesso de envio foi confirmada ainda; implementação existente permanece local, sem envio/retirada real.

24/10/2026 — Comparação remota pós-migração RF19 confirmada pelo Dono do produto: business_snapshot=preserved e tournament_reports=installed. As 21 seções foram comparadas à captura before-reports-20261024-v1 na data de referência, com filas/eventos novos vazios. Backup/exportação/validação, migração e comparação concluídos; não repetir os scripts 01–03 nem a migração. Pausa nas gravações pode terminar. Próxima etapa: configurar provedor/remetente, segredos de servidor e webhook, publicar a interface/servidor e ativar agendas conforme roteiro, mantendo geração/envio desabilitados até a configuração conferida. Nenhum envio ou retirada real, configuração remota, publicação ou homologação da Sprint 8 confirmados nesta etapa; nenhuma operação remota realizada pelo agente.

24/10/2026 — Dono do produto informou “Success. No rows returned” após executar 202610240001_tournament_reports.sql. Execução remota da migração RF19 confirmada pelo relato; não reaplicar. Backup/exportação privados e checksums já validados. Próximo passo executar 03-verify-after-install.sql e exigir business_snapshot=preserved e tournament_reports=installed, mantendo pausa nas gravações até a comparação. Preservação pós-migração, configuração/ativação dos serviços, publicação e homologação ainda não confirmadas. Nenhuma operação remota realizada pelo agente.

24/10/2026 — Exportação privada pré-migração RF19 recebida e validada localmente: before-reports-20261024-v1, 21 seções e 72 definições de funções. Validador em PGlite recalculou os MD5 canônicos iguais à captura: snapshot=37569d6c293eae9933e4883f4bfb6535, funções=d824fdd90f677a7ff7c6ef317235799c. Original preservado em backups/tournament-reports/before-reports-20261024-v1-export-original.txt, SHA-256=4f46ce0fbf4d6a87278aab06e2e4526091a032279ebe4c62a1da487e0aa1eacd; JSON normalizado em before-reports-20261024-v1.json na mesma pasta, ambos ignorados pelo Git. Removida apenas a embalagem da exportação (lista/coluna backup), sem alterar seu conteúdo. Captura/exportação/validação concluídas; não repetir nem sobrescrever. Próximo passo aplicar somente 202610240001_tournament_reports.sql e executar comparação 03 antes de retomar gravações. Migração, comparação, ativação e homologação remotas ainda não confirmadas; nenhuma operação remota realizada pelo agente. Nenhum conteúdo pessoal, voto ou segredo reproduzido.

24/10/2026 — Captura pré-migração RF19 confirmada pelo Dono do produto: before-reports-20261024-v1, captured_at=2026-10-24 19:14:49.161879+00 (16:14:49 em São Paulo), as_of=2026-10-24, snapshot_md5=37569d6c293eae9933e4883f4bfb6535, functions_md5=d824fdd90f677a7ff7c6ef317235799c. Preflight relatado: estrutura/fila e tabela de backup ausentes antes da captura; pg_cron 1.6.4 e supabase_vault 0.3.1 instalados, pg_net 0.20.4 disponível e ainda não instalado. Não repetir nem sobrescrever a captura. Próximo passo exportação privada completa e validação antes de migrar; exportação, validação, migração e comparação ainda não confirmadas. Manter pausa nas gravações. Nenhum dado pessoal, voto ou segredo registrado nesta evidência; operações remotas realizadas pelo Dono do produto.

## Implementação local — 24/10/2026

Implementação iniciada por autorização explícita do Dono do produto e concluída localmente no recorte abaixo. Migração, configuração de e-mail/webhook/agendas, publicação e homologação remotas ainda pendentes; nenhum envio ou retirada real realizado. Esta seção substitui as referências anteriores de implementação não iniciada; o planejamento e refinamento abaixo preservam o histórico.

| Entrega | Comportamento implementado |
| --- | --- |
| S8-01 / RF19 | Captura final atômica no encerramento existente; PDF geral gerado no servidor com classificação, evolução das posições acumuladas por data, tabela equivalente e todas as duplas líderes por inversões. Empates intermediários preservam a última ordem estrita. PDF anexado individualmente por participante via Gmail SMTP, sem serviço externo de renderização. |
| S8-02 / RF19 | Retirada lógica automática a partir de 168 horas, job SQL por minuto; ação antecipada do organizador. Ambos bloqueados até PDF gerado e aceitação SMTP de todos os destinatários pelo Gmail, sem worker ativo. Retirada limpa PDF/captura/endereços da fila e oculta acesso por RLS e consultas privilegiadas. |
| Falhas e recuperação | Fila privada, token/lease e registro por destinatário. Aceitação pelo Gmail conclui o envio; falhas seguras podem ser repetidas e resultados incertos exigem conciliação imediata, sem reenvio automático. Organizador acompanha contadores e pode solicitar nova tentativa. |
| S8-03 / FB01 | Claro/Escuro/Sistema em todas as páginas pelo layout; preferência no navegador, sincronização entre abas, acompanhamento do sistema somente em Sistema, inicialização antes da pintura e paleta central com ajustes de SVG/contraste. PDF usa apresentação clara para impressão. |

Escolhas técnicas detalhadas na [ADR-013](../decisoes/adr-013-relatorios-e-retirada-de-torneios.md) e no [diagrama de dados/fluxo](../diagramas/relatorios-e-retirada.md). Prazo de 168 horas, acumulado final por data, elegibilidade pelo vínculo presente no encerramento, todas as duplas líderes e retirada lógica são escolhas da implementação, sujeitas à homologação; não foram registradas como novas decisões explícitas do Dono do produto.

### Limites e situação operacional

- Migração nova: `202610240001_tournament_reports.sql`. Instalação não altera resultados antigos nem inscreve encerrados existentes; helper privado permite inclusão administrativa explícita por ID, com prazo original e possível retirada logo após entregar se a semana já venceu. Nenhuma inclusão realizada.
- Retirada significa sumir da aplicação, não exclusão física de dados originais. Referências de negócio permanecem internas, preservando outros torneios e pontuações pessoais; o PDF e os endereços temporários são limpos. RF25 permanece futuro, sem implementação.
- Credenciais Gmail de servidor e dois jobs devem ser configurados antes de ativar. Provedor e agendamento introduzem quotas/custo a conferir no ambiente. Flags falsas não suspendem retirada SQL de relatórios já aptos; roteiro explica suspensão dos dois jobs separadamente.
- Cada execução processa uma fila/até cinco destinatários; atrasos/falhas podem manter torneio visível além da semana, conforme proteção confirmada. Aceitação HTTP não equivale a entrega; aceitação SMTP comprova encaminhamento pelo Gmail, não entrega/leitura.
- PDF limitado a 8 MB, paginado sem truncar datas/participantes. Cálculo de duplas cresce com datas e quadrado de participantes; fonte incorporada não cobre todo Unicode/emoji. Erro mantém retirada bloqueada.
- Testes SQL em PGlite não comprovam concorrência de sessões PostgreSQL reais nem operação de cron, pg_net, Vault e Resend. Homologar em torneio isolado com contas de teste; não abrir testes artificiais com participantes legítimos.

### Verificações locais

Validação final: **129 testes completos aprovados**, zero falhas/pulados, lint dos arquivos de aplicação alterados e build de produção com TypeScript aprovados. Build executado fora do sandbox após bloqueio de limpeza de arquivos gerados pelo Next.js no Windows. Inclui captura/preservação e isolamento, empates, PDF, fila/repetição parcial, assinatura/timestamp/limite do webhook, autenticação do worker e ações, retirada automática/antecipada e persistência/sistema/armazenamento bloqueado do tema. Scripts SQL de backup/exportação/comparação exercitados com dados sintéticos; validador CLI confirmou 21 seções e 68 definições. Revisão visual das três páginas do PDF sintético após correção de rodapé que criava páginas extras, e início/login nos temas; largura móvel efetiva de 375 px sem rolagem horizontal na tela de acesso. Áreas autenticadas, todos os cenários remotos e contraste com participantes reais ainda exigem homologação. Confirmada inclusão da fonte, PDFKit e métricas de fonte no rastreamento de produção. `git diff --check` aprovado.

### Procedimento e pendências remotas

[Roteiro completo](sprint-8-operacao.md): backup novo/exportação privada e validação de 21 seções, migração e comparação, configurar servidor/remetente/webhook, agendar recuperação a cada cinco minutos e retirada a cada minuto, publicar e homologar com evidências. Scripts de backup/exportação/comparação exercitados localmente com dados sintéticos. Nenhuma captura de dados reais ou execução remota foi realizada.

## Planejamento e decisões anteriores — histórico

## Situação e decisões — 24/10/2026

O Dono do produto definiu como foco da próxima sprint o encerramento definitivo de torneios e o modo escuro. Prioridades selecionadas para planejamento; regras detalhadas, capacidade, datas e início da implementação ainda não confirmados. Sprint 7 permanece encerrada conforme suas [evidências](sprint-7.md).

O histórico avançado foi retirado da proposta porque o Dono do produto não identificou ganho no uso observado. A proposta inicial de ampliar RF09 e refinar RF08 não integra esta sprint; não remove consultas ou rastreabilidade existentes. RF22/RF23 e integração GeoGuessr continuam fora do recorte.

## Regras confirmadas — refinamento de 24/10/2026

- Retirada automática do torneio após uma semana do encerramento.
- Organizador pode antecipar somente a retirada durante a semana após o encerramento, conforme esclarecimento explícito do Dono do produto. Não há encerramento antecipado: permanece a regra atual de encerrar após o último dia do torneio.
- Somente relatório geral nesta sprint, gerado no ato do encerramento sobre os resultados congelados, com gráfico da evolução de posições de cada participante e duplas mais disputadas por quantidade de trocas de posições. Relatórios individuais registrados separadamente em RF25 para implementação futura, sem sprint definida. PDF e envio por e-mail aos participantes logo após a geração no encerramento confirmados. Proteção contra falhas confirmada: permitir nova tentativa e bloquear retirada automática e antecipada até gerar o PDF e concluir todos os envios com sucesso.
- Modo escuro confirmado: opções Claro/Escuro/Sistema, preferência salva no navegador e aplicação a todas as telas e gráficos. Não há sincronização entre dispositivos prevista neste recorte.
- Após a retirada, o PDF ficará disponível apenas nos e-mails enviados; a aplicação não oferecerá consulta ou download do relatório.
- Encerrar/congelar já existe; a nova entrega complementa esse fluxo, sem tratá-lo como funcionalidade por implementar.

## Objetivo

Completar o ciclo de vida dos torneios após o encerramento e oferecer uma apresentação confortável em ambientes claros e escuros.

## Base existente e limites

- O encerramento atual congela resultados e bloqueia edição. Pedidos retroativos pendentes impedem encerrar; preservar essa proteção e o fluxo de auditorias.
- RF19 já prevê relatório enviado por e-mail aos participantes e exclusão posterior do torneio, com retirada automática após uma semana do encerramento ou retirada antecipada pelo organizador, conforme refinamento de 24/10. Até a implementação desse fluxo, os encerrados continuam visíveis além da semana.
- Preservar contas, pontuações pessoais e dados compartilhados com outros torneios. O alcance da exclusão sobre vínculos, resultados locais, auditorias, pedidos e relatórios ainda precisa ser definido.
- O CSS global atual possui cores claras; não há seleção de tema identificada nos arquivos globais consultados. A avaliação anterior do backlog também identifica cores claras fixas nos componentes; modo escuro exige revisão das telas, não apenas do fundo.

## Histórias para refinamento

Os identificadores abaixo substituem o recorte inicial de histórico, que não chegou a ser selecionado ou implementado.

| História | Entrega proposta | Critérios e decisões pendentes |
| --- | --- | --- |
| S8-01 — relatório final (RF19/FB03) | Gerar no ato do encerramento somente o relatório geral, com classificação final, gráfico da evolução de posições dos participantes e duplas com mais inversões de posição entre si; formato PDF, enviado por e-mail aos participantes logo após a geração no encerramento. | Conteúdo principal confirmado; formato PDF e envio aos participantes logo após a geração confirmados; refinar demais aspectos do cálculo; tratamento de empates nas inversões confirmado. Ver [detalhamento](../relatorios-de-torneio.md). Relatórios individuais são RF25 futuro; médias e contagens históricas de FB03 não foram aprovadas para esta entrega. Relatório deve refletir valores aceitos e sanções do torneio; dados pessoais de terceiros e votos secretos não podem ser expostos. Validar ausência de resultados e empates. |
| S8-02 — conclusão definitiva (RF19) | Retirar automaticamente uma semana após o encerramento, permitindo retirada antecipada pelo organizador, com tratamento seguro dos dados exclusivos e compartilhados. | Execução automática e antecipação pelo organizador confirmadas. Envio confirmado logo após a geração no encerramento. Definir significado de excluir e critério técnico verificável de sucesso do envio. Confirmado: bloquear retirada automática e antecipada enquanto PDF ou algum envio não concluir com sucesso; permitir nova tentativa, evitando duplicação de envios concluídos. Não remover pontuações pessoais nem afetar outros torneios. |
| S8-03 — modo escuro (FB01) | Seletor Claro/Escuro/Sistema e preferência persistida, cobrindo as telas da aplicação. | Claro/Escuro/Sistema e persistência no navegador confirmados pelo Dono do produto, com aplicação a todas as telas e gráficos. Sincronização entre dispositivos fora deste recorte. Cobrir formulários, rankings, estatísticas/gráficos, pedidos, notificações, login, erros, carregamento e foco por teclado; preservar contraste e legibilidade em celular. |

## Fluxo de conclusão definitiva — regras confirmadas e pontos em aberto

1. Organizador resolve pendências e encerra pelo fluxo existente; resultados ficam congelados.
2. No ato do encerramento, o sistema gera em PDF o relatório geral do estado final congelado e o envia por e-mail aos participantes logo após a geração.
3. Torneio permanece disponível por até uma semana após o encerramento; organizador pode antecipar a retirada.
4. Retirada ocorre automaticamente após uma semana ou antes por ação do organizador. Ambas as retiradas ficam bloqueadas até gerar o PDF e concluir todos os envios com sucesso, mesmo após a semana; permitir nova tentativa em caso de falha.
5. Torneio deixa de aparecer na aplicação; dados pessoais compartilhados permanecem íntegros. PDF disponível somente nos e-mails enviados, sem consulta ou download na aplicação.

A seleção do foco não autoriza apagar torneios reais nesta etapa de planejamento. Após a retirada, o PDF fica disponível somente nos e-mails enviados, sem acesso pela aplicação. Arquivamento lógico versus remoção física dos demais dados e limpeza técnica de arquivos/metadados ainda não foram decididos. Retirada automática foi confirmada; mecanismo técnico e contagem exata do prazo ainda serão definidos. Tratamento de falhas confirmado pelo Dono do produto: nova tentativa e bloqueio de qualquer retirada enquanto geração ou algum envio não concluir com sucesso. Tratar torneios já encerrados antes da nova versão explicitamente, evitando exclusão retroativa em massa na ativação.

## Decisões para fechar o recorte

1. Definir contagem exata da semana e comportamento de ativação para torneios já encerrados. Antecipação limitada à retirada após encerrar, retirada automática após uma semana e geração de relatórios no encerramento já estão confirmadas.
2. Tratamento das inversões através de empates confirmado: contar somente mudança da última liderança estrita. Confirmar propostas de classificação acumulada por data e exibição das duplas líderes empatadas; PDF e envio aos participantes logo após a geração no encerramento confirmados; proteção contra falhas confirmada: nova tentativa e bloqueio de ambas as retiradas até PDF e todos os envios concluírem com sucesso. Disponibilidade do PDF após retirada confirmada: somente nos e-mails enviados. Definir critério verificável de sucesso do envio e alcance da retirada/limpeza dos demais dados.
3. Modo escuro refinado: Claro/Escuro/Sistema com preferência neste navegador, em todas as telas e gráficos. Implementação deverá respeitar a preferência do sistema quando essa opção estiver selecionada.
4. Confirmar capacidade e duração desejada antes de estimar. RF19 concentra a maior incerteza por envolver envio, retenção e dados relacionados; modo escuro é independente e pode avançar após seu refinamento.

## Validação e sequência técnica planejadas

Após refinamento: inventariar relações/permissões, desenhar estados de conclusão e integração de e-mail, atualizar arquitetura/diagramas e registrar decisão arquitetural pertinente. Preparar migração, backup privado/exportação validada e comparação de preservação se necessários. Para o tema, centralizar cores e preferência e revisar componentes e gráficos.

Verificações previstas: autorização do organizador, prazo da semana e retirada automática, antecipação pelo organizador, geração no encerramento, pendências, resultados congelados, preservação de outros torneios/pontuações pessoais, falha/repetição de envio, concorrência e repetição de conclusão. Para tema: persistência, preferência do sistema, renderização inicial, troca sem perder formulários, contraste e revisão visual em computador/celular/teclado. Executar testes pertinentes, lint e build na implementação; registrar evidências separadas de publicação e homologação.

## Acompanhamentos separados da Sprint 7

- RF24: relatório após aproximadamente uma semana da ativação de 18/10, referência aproximada 25/10, conforme [roteiro](sprint-7-metricas-operacao.md). Não há relatório novo nem automação criada.
- Homologação complementar de auditorias/notificações, autoraprovação, encerramento com pendência, celular/teclado e concorrência PostgreSQL real, somente em torneio isolado com contas de teste. Não há evidências novas desses cenários nesta revisão.

## Refinamento do relatório geral e requisito futuro

Conteúdo e propostas de cálculo em [Relatórios de torneio — RF19/RF25](../relatorios-de-torneio.md). Gráfico de posições e duplas mais disputadas foram solicitados pelo Dono do produto; tratamento de empates nas inversões confirmado pelo Dono do produto: inversão direta ou através de empate conta uma troca; empate com manutenção da liderança não conta. Acumulado final por data, elegibilidade e apresentação dos pares líderes ainda aguardam confirmação. RF25 fica fora desta sprint. Avaliar retenção necessária a relatórios futuros antes de escolher remoção física; nenhuma política nova de retenção está aprovada.

## Evidência desta revisão

Atualizados planejamento, requisitos, plano de ação, backlog, índice e histórico conforme a escolha do Dono do produto. Inspeção documental de RF19/FB01 e leitura do CSS global. Nenhuma implementação, migração, envio de e-mail, exclusão ou operação remota realizada. Arquitetura vigente não alterada. Verificação documental por `git diff --check`; testes funcionais não executados nesta revisão sem alteração de aplicação. Publicação e homologação da Sprint 8 ainda não se aplicam.
