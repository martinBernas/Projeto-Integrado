# Histórico da documentação

Aceite e encerramento em 03/10/2026: Dono do produto declarou explicitamente “está aceita a sprint”. Sprint 5 concluída, incluindo S5-01–S5-05. Aceite considera as evidências e limites registrados: carregamento confirmado na aplicação utilizada; Tentar novamente validado localmente, sem falha observada para homologação remota. Análise de amostras, diagnóstico da demora e eventuais melhorias permanecem acompanhamento posterior. Versão/URL do deployment não informadas; nenhum novo SQL necessário para S5-04/S5-05.

Os estados anteriores abaixo são registros históricos; o aceite acima é a situação vigente.

## Situação consolidada

Situação consolidada em 03/10/2026: S5-01–S5-03 implementadas, migrações executadas/verificadas e cenários relatados homologados; TESTE S5 retirado, quatro torneios originais e lançamentos legítimos preservados. S5-04 (resultados recentes e histórico pessoal) teve funcionamento confirmado pelo Dono do produto. S5-05 (carregamento, recuperação e métricas) implementada localmente, com 69 testes, lint e build aprovados; telas de carregamento confirmadas pelo Dono do produto na aplicação utilizada; nenhuma falha ocorreu para conferir Tentar novamente. Versão/URL não informadas. Análise das amostras e otimização posterior ficam como acompanhamento, conforme orientação do Dono do produto, sem prometer redução de latência. Sprint 5 aceita e encerrada pelo Dono do produto em 03/10/2026; análise de logs e melhorias posteriores ficam como acompanhamento. A situação detalhada e cronológica está em docs/sprints/sprint-5.md.

## Registros das etapas anteriores

Os registros abaixo preservam as evidências de cada etapa. Pendências descritas em etapas anteriores não prevalecem sobre a situação consolidada; os acréscimos S5-04/S5-05 ao final complementam esse histórico.

03/10/2026 — Dono do produto aprovou S5-04 (recorte de FB05): cinco dias recentes com Ver todos/Mostrar menos e ranking completo. Implementação local e requisitos/arquitetura/testes atualizados; sem migração de banco. Histórico pessoal incluído com cinco lançamentos recentes e expansão dos até 100 registros carregados. Lista de torneios, acesso a registros anteriores ao limite e FB06 permanecem no backlog futuro. Publicação e homologação do acréscimo ainda não confirmadas.

03/10/2026 — Revisão final de consistência da arquitetura S5: ADR-003 histórico, ADR-004 vigente, diagramas de regra única, classes e navegação atualizados com evidências remotas e retirada do teste. Pendências antigas separadas da situação atual; aceite global ainda não confirmado.

03/10/2026 — Conferência final direta confirmou lançamento legítimo de 03/10 preservado integralmente após retirada de TESTE S5 (13.943 pontos). Quatro torneios originais preservados visualmente; captura privada exportada/validada. Evidências de homologação consolidadas, sem antecipar aceite global/encerramento da Sprint 5.

03/10/2026 — Exportação da captura anterior à retirada de TESTE S5 recebida, validada e salva fora do Git. Checksum reconfirmado após releitura; 291 pontuações preservadas na referência. Conferência visual final e aceite global ainda não confirmados.

03/10/2026 — Dono do produto retirou TESTE S5 pelo script transacional específico; quatro torneios restantes e 291 pontuações pessoais preservadas. Comparação interna da retirada aprovada e referência capturada antes da exclusão. Exportação privada, conferência visual final e aceite global ainda não confirmados.

03/10/2026 — Dono do produto aprovou persistência após recarga, redução e restauração do período de TESTE S5 e preservação das regras dos quatro torneios originais. Evidências de homologação atualizadas; retirada do torneio de teste e aceite global ainda não confirmados.

03/10/2026 — Homologação de TESTE S5: ranking fornecido pelo Dono do produto tem os 17 totais iguais à prévia confirmada e ordenação coerente. Aplicação da mudança de penalidade conferida; recarga, edição do período e demais critérios de aceite ainda não confirmados.

03/10/2026 — Comparação pós-migração complementar de regra única aprovada pelo retorno do Dono do produto: zero diferenças e checksums iguais à referência v2. Dados e cálculo de referência preservados; verificação remota da migração concluída. Publicação/homologação da interface e retirada de torneios de teste ainda não confirmadas.

03/10/2026 — Migração complementar de regra única aplicada pelo Dono do produto no Supabase, retorno de sucesso sem linhas após normalização do TESTE S5. Comparação pós-migração, publicação da interface e homologação ainda pendentes.

03/10/2026 — Comparação remota v2 pós-normalização do TESTE S5 aprovada: zero diferenças e checksums iguais ao backup exportado. Preparação da nova tentativa da migração de regra única concluída; execução ainda não confirmada.

03/10/2026 — Exportação v2 anterior à regra única S5 validada integralmente e salva fora do Git; checksum reconfirmado após releitura, 8 versões e 3 revisões auditadas. Comparação remota e nova tentativa da migração ainda pendentes.

03/10/2026 — Captura v2 anterior à migração de regra única executada pelo Dono do produto após normalização: 5 torneios, 290 pontuações, 842 resultados e 8 versões. Metadados/checksum registrados; exportação/comparação e nova tentativa da migração ainda pendentes.

03/10/2026 — Dono do produto forneceu imagem confirmando revisão s5-8 do TESTE S5 para 01/09–31/10, com histórico anterior preservado. Preparada referência v2 por scripts 14–16 antes de nova tentativa da migração complementar; execução ainda não confirmada.

03/10/2026 — Migração complementar de regra única recusada pela proteção de revisão parcial. Referência exportada identifica TESTE S5 com revisão restrita a outubro em torneio setembro–outubro. Diagnóstico somente leitura preparado; aplicação e homologação da simplificação permanecem pendentes.

03/10/2026 — Comparação pré-migração de regra única S5 aprovada pelo retorno remoto do Dono do produto: zero diferenças e checksums iguais à referência exportada. Migração complementar e comparação posterior ainda não confirmadas; evidência na sprint e operação.

03/10/2026 — Exportação anterior à regra única S5 recebida, validada e salva fora do Git. Contagens e sete funções conferidas; checksum PostgreSQL reconfirmado após releitura. Comparação remota e migração complementar ainda pendentes; evidências na sprint e operação.

03/10/2026 — Dono do produto capturou referência anterior à migração complementar de regra única: 5 torneios, 290 pontuações pessoais, 978 resultados e 7 versões. Metadados/checksum registrados na sprint e operação; exportação/comparação e migração complementar ainda não confirmadas.

03/10/2026 — Durante homologação, Dono do produto definiu regra única para todo o torneio e início/fim editáveis, substituindo desenho técnico por intervalos. Implementados localmente fluxo conjunto, migração complementar com guarda de compatibilidade e backup/ensaio atuais. Atualizados ADR-004, requisitos, regras, sprint, operação, arquitetura e diagramas. `pnpm test`: 60 aprovados, zero falhas/pulados; `pnpm lint` e `pnpm build` aprovados. Nenhuma execução remota da migração complementar ou aceite confirmado.

03/10/2026 — Referência anterior aos testes S5 comparada remotamente pelo Dono do produto: zero diferenças e checksums iguais à exportação. Preparação de captura/exportação/comparação concluída; provas em novos torneios e retirada posterior ainda pendentes.

03/10/2026 — Exportação da referência anterior aos testes S5 recebida, validada e salva fora do Git: checksum confirmado após releitura, 5 versões e 1 auditoria de revisão. Comparação remota inicial ainda pendente; evidências na sprint e operação.

03/10/2026 — Dono do produto confirmou edição funcional do Aztecas Outubro e capturou referência pré-testes S5 com 4 torneios e 5 versões. Provas usarão novos torneios/regras e pontuações existentes, sem alterar dados brutos pessoais; retirada posterior limitada aos torneios de teste. Evidências e limites registrados na sprint e operação.

03/10/2026 — Referências iniciais S5 aprovadas pelo retorno remoto do Dono do produto: 4 torneios, 4 versões, zero inconsistências. Verificação remota da migração concluída; publicação da aplicação, testes funcionais e aceite ainda não confirmados.

03/10/2026 — Conferência remota S5: nove indicadores de esquema/permissões aprovados pelo retorno fornecido pelo Dono do produto. Resultado das referências iniciais ainda não fornecido; publicação e homologação funcional ainda não confirmadas.

03/10/2026 — Comparação pós-migração S5 fornecida pelo Dono do produto: zero diferenças e checksums iguais ao backup. Preservação dos dados/cálculo de referência confirmada. Preparada conferência estrutural somente leitura; publicação e homologação ainda não confirmadas.

03/10/2026 — Dono do produto executou a migração principal de regras versionadas S5 no Supabase, com retorno de sucesso sem linhas. Ambas as migrações S5 confirmadas; comparação pós-migração, publicação da aplicação e homologação ainda pendentes. Evidências atualizadas na sprint e operação.

03/10/2026 — Dono do produto executou a migração preparatória S5 de calendário no Supabase, com retorno de sucesso sem linhas. Migração principal e comparação posterior ainda pendentes; evidência registrada na sprint e operação.

03/10/2026 — Comparação remota do backup S5 executada pelo Dono do produto: zero seções diferentes, lista vazia e checksums iguais à captura/exportação. Evidência pré-migração registrada; execução das migrações e comparação posterior ainda não confirmadas.

03/10/2026 — Exportação do backup S5 recebida, validada integralmente e salva na pasta privada ignorada pelo Git. Checksum PostgreSQL reconfirmado após releitura, metadados/contagens e três definições de funções conferidos. Evidências na sprint e operação; comparação remota anterior à migração ainda pendente.

03/10/2026 — Captura de backup S5 executada pelo Dono do produto no Supabase: `before-s5-v1`, 4 torneios, 289 pontuações pessoais e 434 resultados armazenados. Retorno registrado na sprint e no roteiro operacional. Exportação, comparação e backup integral ainda não confirmados; migração/publicação pendentes.

03/10/2026 — Definição funcional da Sprint 5: calendário oferece segunda a sexta ou todos os dias, incluindo sábado/domingo. Atualizados interface, cálculo/avisos, RF11, regras, critérios, testes, ADR e operação; enum `every_day` em migração preparatória separada. Sem alteração silenciosa da semântica dos calendários legados. Sem execução remota.

03/10/2026 — Dono do produto autorizou início da Sprint 5. Implementados localmente modos/penalidade, calendário/exclusões e versões por intervalo, com prévia/confirmação de revisão retroativa, auditoria e proteção dos encerrados. Fuso fixo e zero como ausência respeitados. Preparados migração e scripts de captura/exportação/comparação/recuperação antes do uso; equivalência de cópia privada e ensaio de recuperação locais. Atualizados requisitos, regras, sprint, operação, arquitetura, ADR-003, diagramas e orientações funcionais. Nenhuma migração/publicação remota; homologação pendente. [Entrega](sprints/sprint-5.md).

03/10/2026 — Decisão posterior do Dono do produto no planejamento da Sprint 5: zero representa ausência também no modo absoluto; fuso permanece fixo em São Paulo e deixa de fazer parte da configuração do torneio. Substitui a escolha anterior de múltiplos fusos e resolve as pendências de zero/data compartilhada. Revisão retroativa explícita permanece. Atualizados plano, requisitos RF04/RN06, regras e cenários de teste; apenas documentação, sem implementação.

03/10/2026 — Refinamento da Sprint 5: Dono do produto definiu capacidade por tokens da semana, preferência de conclusão no fim de semana e reserva da semana seguinte para correções menores; escolheu revisão retroativa explícita e configuração de outros fusos. Plano atualizado, substituindo propostas de somente vigência futura/fuso fixo e invalidando a estimativa inicial do conjunto. Zero e semântica de datas compartilhadas ainda abertos; nenhuma implementação iniciada.

03/10/2026 — A pedido do Dono do produto, preparado planejamento da Sprint 5 antes de iniciar: objetivo, histórias S5-01–S5-03, critérios, estimativas preliminares, dependências, testes e implantação. Capacidade e decisões funcionais ainda abertas; não há compromisso fechado nem implementação. [Planejamento](sprints/sprint-5.md).

03/10/2026 — Dono do produto solicitou documentar e encaixar em Scrum os feedbacks sobre excesso de resultados/dias/torneios (FB05) e lentidão ao trocar torneios, com sugestão de pré-carregamento antes do login (FB06). Registrados como candidatos à S7-03, com histórias, critérios propostos, investigação e condições de capacidade. Sprints 5 e 6 preservadas; alocação sujeita ao Sprint Planning. Atualizados requisitos, plano, avaliação de backlog, índice e testes planejados. Revisão exclusivamente documental, sem implementação, migração, publicação ou homologação. [Pré-planejamento](sprints/sprint-7.md).

27/09/2026 — Avaliados escopo restante das sprints 5–7 e feedback sobre modo escuro, valores esquecidos, desempenho ao encerrar e integração GeoGuessr. Dono do produto prioriza o escopo planejado; propostas registradas sem compromisso de implementação. RF19 detalhado sem duplicação; pesquisa inicial não confirmou API pública oficial suportada. Atualizados requisitos, plano e índice, distinguindo recortes históricos da situação atual. Revisão exclusivamente documental, sem migração ou publicação. [Avaliação](avaliacao-backlog-2026-09-27.md).

27/09/2026 — Sprint 4 formalmente encerrada a pedido do Dono do produto. S4-01 a S4-05 homologadas e carga complementar confirmada por SQL. Consolidados estado atual, evidências, limites e escopo futuro em sprint, requisitos, plano de ação/testes, arquitetura/ADR, perfil público e README operacional. Pendências históricas não representam tarefas atuais; RF19 e configuração de regras permanecem fora desta entrega.

27/09/2026 — Carga revisada do Excel executada pelo Dono do produto. Retorno SQL conferido: 12 perfis com nome confirmado, 11 URLs e Luca com URL nula. Martin fora do escopo para preservar seu preenchimento manual. Pendência de execução remota resolvida; não constitui nova comparação de backup ou conferência visual na aplicação.

27/09/2026 — Primeira carga de perfis abortada pela proteção de nome divergente de Martin. Dono do produto indicou já ter preenchido seu perfil; script revisado para preservá-lo integralmente, importando os outros 12 nomes e 11 links. Sete testes locais aprovados; reexecução remota pendente. Substitui o escopo inicial de 13 nomes/12 links da operação.

27/09/2026 — Dono do produto confirmou Vercel pronta e todos os testes de S4-04/S4-05 aprovados: homologação concluída. Solicitou carga dos nomes públicos e links do Excel MVP nos perfis correspondentes. Preparada operação transacional para 13 nomes e 12 URLs, sem alterar o Excel, com auditoria e abortando identidades ambíguas ou valores manuais divergentes. Sete testes de banco/perfil aprovados; aplicação remota da carga e conferência visual ainda pendentes. [Procedimento](sprints/sprint-4.md).

O Git é a fonte do histórico completo. Este registro resume marcos documentais; a versão do documento não representa versão publicada do software.

| Data | Marco | Referência |
| --- | --- | --- |
| 06/09/2026 | Documentação funcional e descoberta do MVP | Commits `4a8a0f5`, `d5a1437`, `3025267`, `df85f41` |
| 12/09/2026 | Arquitetura Vercel e Supabase | Commit `57e4600` |
| 20/09/2026 | Revisão documental 1.1: Sprint 3 passa a entregar torneio único, lançamento, cálculo e ranking; administração configurável adiada; regras de setembro confirmadas e histórico com carga manual após cadastro | Alterações locais; revisão ainda pendente |

## Prioridades da Sprint 4 — 26/09/2026

Aceite visual da S4-02: Dono do produto aprovou explicitamente a interface em grid compacto de gerenciamento de participantes. Registro da sprint atualizado; aprovação visual distinta dos cenários de homologação funcional ainda não demonstrados.

Revisão visual da S4-02 solicitada pelo Dono do produto: cartões substituídos por grids compactos de participantes e candidatos, datas e ações alinhadas por linha, confirmação no momento da ação. Mesmas operações de servidor e banco, sem migração adicional. Lint/build aprovados e prévia estática com dados fictícios inspecionada no navegador; validação da interação autenticada após publicação pendente.

Validação posterior da S4-02: Dono do produto confirmou inclusão do perfil de testes, conferência da data de ingresso e remoção. Comparação após o ciclo retornou zero diferenças e checksum `3d847140e955fd6feaaffab3b252dbe8`, igual ao backup. Migração remota já confirmada; escopo validado e cenários restantes registrados na [Sprint 4](sprints/sprint-4.md). Os registros abaixo preservam os estados anteriores da entrega.

S4-02 implementada localmente após captura e conferência do backup real. A pedido do Dono do produto, organizador seleciona contas em lista com nome/e-mail, busca e paginação. Incluídos vínculo retroativo, alteração de elegibilidade, remoção, conclusão da preparação histórica e auditoria. Testes sobre cópia local de setembro confirmam que a migração não muda dados nem cálculo de referência; suíte completa com 26 testes aprovada. Aplicação remota e aceite pendentes. [Roteiro](sprints/sprint-4.md).

Aceite funcional da S4-01: Dono do produto demonstrou criação, alteração de nome/período e encerramento, confirmou bloqueio antecipado, persistência após recarregar e ausência de mudanças percebidas no ranking de setembro. Segunda conta exibe lista administrativa vazia e opção de criar torneio próprio. Evidências e limites registrados em [Sprint 4](sprints/sprint-4.md). S4-02 é a próxima atividade; Sprint 4 permanece aberta.

S4-01 iniciada: implementação local de criação, edição e encerramento de torneios, com operações restritas ao organizador, trilha de alterações e congelamento de resultados. Dono do produto definiu encerramento após o último dia e disponibilidade dos dados por uma semana; relatório, envio por e-mail e exclusão registrados como requisito futuro RF19. Migração e publicação remotas pendentes. Ver [Sprint 4](sprints/sprint-4.md).

Por decisão do Dono do produto, S4-01 (torneios), S4-02 (participantes e ingresso retroativo) e S4-03 (lista e detalhes de múltiplos torneios) passam a constituir o escopo principal da Sprint 4. S4-04 (nome público único) e S4-05 (perfil GeoGuessr) ficam como entregas adicionais, remanejáveis para uma sprint posterior ainda não definida se não forem concluídas. Plano de ação e documento de perfil público alinhados; esta decisão substitui a prioridade registrada em 21/09. Datas e estimativas permanecem pendentes.

## Registro operacional — 22/09/2026

Carga real de 11 participantes e 148 pontuações confirmada pelo retorno do SQL enviado pelo Dono do produto. Coluna C do Excel validada como identificação das contas. Luca e Zade aguardam cadastro; Ramiro e Marcelo não participam. Registradas a pontuação complementar de Tales (17.469 em 22/09), a entrada de Bastian em 16/09 e a solicitação de ativação de penalidades, com confirmação remota dos comandos complementares ainda pendente. Correção local do painel exibe “Não inscrito” antes da elegibilidade e desconsidera resultados antigos desse período no ranking e no status diário. Testes direcionados, lint e build aprovados; publicação ainda não confirmada. [Evidências e pendências](sprints/operacao-2026-09-22.md).

## Revisão 1.4 — 21/09/2026

Dono do produto solicitou nome público independente do e-mail e URL do perfil no GeoGuessr. Registrados RF17–RF18, S4-04/S4-05 e CT26–CT31; Dono do produto confirmou nome público único em toda a plataforma; esforço será refinado. Sprint 3 permanece encerrada. Alterações documentais locais, sem implementação nesta revisão.

Complemento de 21/09/2026: unicidade global do nome público confirmada pelo Dono do produto. Planejamento inclui garantia no banco, tratamento de colisões existentes e testes CT32–CT34. Comparação sem distinção de caixa e sem espaços nas extremidades registrada como proposta técnica.

## Registro de encerramento de sprint

21/09/2026 — Sprint 3 concluída, aplicação no commit `8671149`. Dono do produto confirmou os testes remotos e restauração final às `04:34:11.882419+00`, com `history_ready = false`. Onze testes locais aprovados. [Registro completo](sprints/sprint-3-encerramento.md). Cadastros, vínculos e Excel reais seguem como operação.

Os registros seguintes preservam os estados anteriores e suas pendências à época.


21/09/2026 — Ensaio remoto de duas contas concluído pelo Dono do produto: totais de 79.534 e 2.365 conciliados integralmente e confirmados no painel, incluindo empate, ausências e exclusão de feriado/fim de semana. Rollback confirmado às 04:12:40 UTC, com `history_ready = false`. Aplicação publicada no commit `8671149`. Evidências em `plano-de-testes.md` e `sprints/sprint-3-ensaio.md`; carga real e demais verificações de aceite permanecem pendentes.

Avanço da Sprint 3: Dono do produto executou as duas migrações e o seed no Supabase, todos com sucesso. Consulta confirmou o torneio de setembro, regra relativa, penalidade −2.500, segunda a sexta, exclusão de 07/09 e preparação histórica aberta. Publicação da aplicação, vínculos de participantes, carga do Excel e homologação ponta a ponta permanecem pendentes.

Execução da Sprint 3 — 20/09/2026: implementação local de migrações/RLS, provisionamento, carga administrativa, lançamento pessoal, cálculo relativo e painel. Sete testes locais aprovados, lint/build aprovados e inspeção visual de componentes em celular/desktop. Dono do produto esclareceu que fornecerá Excel após cadastro das contas; preparação histórica agora fica provisória e sem penalidades até conclusão da carga. Procedimento em `sprints/sprint-3-operacao.md`. Banco remoto, conta organizadora, Excel real e publicação pendentes; sprint não encerrada.

Revisão documental 1.3 — 20/09/2026: por decisão do Dono do produto, planejamento ampliado de cinco para sete sprints para distribuir o esforço futuro. Sprint 4: torneios/participantes; Sprint 5: regras/calendário; Sprint 6: auditoria por votação (realocada da antiga Sprint 5); Sprint 7: moderação/evolução. Sprint 3 preservada. Backlog, dependências e aceite registrados no plano de ação; equilíbrio sujeito a estimativas e capacidade. Referências atuais alinhadas à Sprint 6; o registro 1.2 abaixo preserva a alocação histórica anterior.

Revisão documental 1.2 — 20/09/2026: Dono do produto solicitou auditoria de pontuações por votação para entrega futura, alocada à Sprint 5. Registrados RF13–RF16, RN10–RN13, fluxo de avaliação, apuração pelo organizador e escolha entre desconsideração e penalidade diária. Efeito limitado ao torneio denunciante, preservando pontuação pessoal e demais torneios. Critérios futuros e pontos de refinamento documentados; Sprint 3 sem ampliação de escopo.

Correção do planejamento em 20/09/2026: cadastro e login reconhecidos explicitamente como concluídos e validados na Sprint 2, com referência ao commit `3f8c614` e confirmação do Dono do produto. A Sprint 3 apenas reutiliza essas funções e verifica regressão e integração com o torneio. Plano de ação, plano da sprint, requisitos e testes alinhados; não há nova implementação de autenticação prevista.

Complemento da revisão de 20/09/2026: período do torneio confirmado pelo Dono do produto como setembro, registrado de 01/09/2026 a 30/09/2026, inclusive; critérios de teste ajustados aos limites do mês.

Calendário confirmado na mesma revisão: segunda a sexta, com 07/09/2026 excluído por feriado. A exclusão prevalece sobre a presença da data no Excel e impede pontos e penalidades também no histórico manual. Planejamento, regras e testes atualizados; implementação ainda pendente.

Ao concluir uma entrega, adicionar data, escopo realmente entregue, hash do commit, evidências de testes e URL do ambiente quando aplicável. Usar branch e revisão por pull request conforme a política do projeto. Uma tag pode identificar o marco após integração; não há tag criada por este replanejamento.

## Atualização S4-03 — 26/09/2026

S4-03 implementada localmente com abas de torneios, seleção por URL, RPC parametrizada e isolamento por torneio. Preferência por abas e homologação conjunta dos três cenários restantes da S4-02 confirmadas pelo Dono do produto. Migração, publicação e aceite das abas pendentes; ver [Sprint 4](sprints/sprint-4.md).

Revisão S4-03 pelo esboço: proposta inicial rejeitada; abas compactas conectadas às regras e resultados diários em ordem decrescente implementados localmente. Prévia atualizada para avaliação antes de qualquer avanço remoto. Testes, lint e build aprovados; aceite pendente.

27/09/2026 — Dono do produto aprovou a interface final da S4-03 e autorizou implantação remota e homologação conjunta. Aceite visual substitui a pendência anterior; migração e publicação ainda não executadas.
27/09/2026 — Dono do produto confirmou na aplicação publicada as abas, alternância entre torneios, persistência da seleção após recarregar, ordem dos dias e ranking intacto. Pontuações dentro do dia e três cenários restantes da S4-02 ainda aguardam confirmação; ver Sprint 4.

27/09/2026 — Homologação pelo Dono do produto: persistência da data, torneio paralelo com outros participantes, conta sem acesso antes do vínculo, visualização sem edição após inclusão e revogação após remoção validadas. Todos os testes descritos satisfatórios. Conclusão histórica e ordenação das pontuações dentro do dia ainda sem confirmação explícita.

27/09/2026 — Confirmação final de ordenação das pontuações dentro do dia e conclusão da preparação histórica. S4-02 e S4-03 homologadas pelo Dono do produto; escopo principal da Sprint 4 aceito. S4-04/S4-05 continuam adicionais remanejáveis. Estados anteriores de homologação pendente substituídos por este aceite.
27/09/2026 — Remoção pontual de “Teste edicao” confirmada pela listagem retornada pelo Dono do produto após execução do SQL: permanecem Aztecas e GeoGuaras, ambos abertos. Evidência e limites registrados na Sprint 4.

## Evolução S4-04/S4-05 — 27/09/2026

27/09/2026 — Dono do produto autorizou S4-04/S4-05 após homologação do escopo principal. Implementados localmente nome público único, confirmação de legado, edição própria, link GeoGuessr e auditoria; 36 testes, lint e build aprovados. Prévia fictícia inspecionada. Execução remota e aceite pendentes.
27/09/2026 — Migração S4-04/S4-05 aplicada pelo Dono do produto antes da comparação prévia planejada. Comparador específico posterior retornou zero diferenças nos campos antigos e checksum igual à referência. Publicação do código e homologação ainda pendentes.

03/10/2026 — S5-05 autorizada: investigar primeira abertura/troca lenta e aviso intermitente. Carregamento, nova tentativa explícita e métricas sem dados pessoais implementados localmente; causa remota não confirmada. Sem migração. Publicação, linha de base e homologação pendentes. Ver seção 11 da Sprint 5 e ADR-005.

Evidência posterior S5-05 em 03/10/2026: Dono do produto confirmou as telas de carregamento na aplicação utilizada. Não houve erro para conferir Tentar novamente; recuperação validada nos testes locais, sem confirmação remota desse cenário. Identificação de versão/URL e aceite global não informados. Análise das amostras permanece acompanhamento posterior.

03/10/2026 — Fora da Sprint 5: ficha de acompanhamento atualizada em cópia DOCX com registros das Sprints 2 a 5 e datas documentadas autorizadas pelo Dono do produto. Original preservado; campos do tutor mantidos; página renderizada e conferida. Ver atualizacao-ficha-acompanhamento-2026-10-03.md.
