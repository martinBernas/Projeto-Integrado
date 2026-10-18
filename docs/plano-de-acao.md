# Plano de ação

18/10/2026 — Sprint 7 autorizada para implementação pelo Dono do produto. S7-00 resolvida por diagnóstico do sandbox (TypeScript/build passam com acesso normal aos links pnpm, sem alterar contratos). S7-04a/S7-04b implementadas localmente: RF21 com acesso no torneio, médias própria/demais, contagens e gráfico/tabela, sem migração nova. 98 testes e lint/TypeScript/build aprovados; prévia fictícia validada no navegador. Próximas etapas: publicação da interface, homologação real e aceite, sem declarar sprint encerrada. [Entrega e limites](sprints/sprint-7.md), [operação](sprints/sprint-7-operacao.md).

18/10/2026 — RF21 refinado pelo Dono do produto para Sprint 7: destaque ao desempenho próprio no torneio e comparação com média conjunta dos demais (sem médias individuais identificadas). Somente dias encerrados; médias aplicadas incluem ausências, com exemplo 12.000/−2.500 = 4.750 aprovado. Primeiro/último somente entre resultados positivos válidos; zero aplicado válido no relativo preservado, ausências/sanções excluídas das contagens. Fórmulas e exemplos consolidados em [Sprint 7](sprints/sprint-7.md). Desenho das séries/período integral propostos; capacidade e datas ainda não acordadas, implementação não iniciada.

18/10/2026 — Iniciado o planejamento da Sprint 7. O Dono do produto priorizou estatísticas do torneio (RF21), substituindo a prioridade anterior de moderação/histórico. Proposta: S7-00 (tipagem/build), S7-04a (cálculo autorizado) e S7-04b (tela/gráfico/tabela e homologação), estimativas relativas iniciais 3/5/5 sujeitas a refinamento/capacidade. Fórmula de agregação, dia atual e classificação de ausentes/punidos submetidos a decisão; sem prazo ou início de implementação. S7-01/S7-02, RF19 e RF22–RF24 permanecem no backlog. [Planejamento vigente](sprints/sprint-7.md).

18/10/2026 — O Dono do produto confirmou a conferência visual após a exclusão: “agora sim sem o torneio de testes”. Ausência do torneio de teste no painel validada, complementando `test_removed=true`, 428 pontuações pessoais preservadas e checksum igual ao backup exportado. Retirada pontual concluída no banco e validada visualmente; não repetir os scripts. O relato não detalha conferência individual dos demais torneios, cuja preservação foi verificada transacionalmente pelo script. Esta confirmação substitui a pendência anterior de verificar a ausência do teste na interface. Atualização exclusivamente documental, sem nova operação remota.

18/10/2026 — Exclusão remota do torneio de teste confirmada pelo retorno fornecido pelo Dono do produto: `target_id=b46cb818-793a-4eb3-969f-0846010e582a`, `test_removed=true`, `preserved_personal_scores=428`, `backup_checksum=ce110c9b6c99b4492796c276b08be048`. Checksum igual à captura/exportação validada. Operação pontual concluída no banco conforme evidência; não repetir. O script compara transacionalmente a preservação dos demais dados de negócio e mantém logs históricos; o retorno não substitui a conferência visual posterior do painel. Backup/exportação privados já preservados, sem dados pessoais na documentação. Resta conferir na interface ausência do teste e presença do torneio original; não há confirmação desse passo neste retorno. Nenhuma execução remota realizada pelo agente. Este registro substitui as referências anteriores à exclusão remota como pendente.

18/10/2026 — Exportação recebida em arquivo anexado e preservada privadamente em `backups/manutencao-2026-10-18/audit-test-backup-export.txt`, ignorado pelo Git; conteúdo pessoal e votos não reproduzidos na documentação. Validação local: JSON completo com 16 seções; checksum recalculado por `md5(snapshot::jsonb::text)` em PGlite = `ce110c9b6c99b4492796c276b08be048`, igual à captura remota. Alvo confirmado no snapshot: `b46cb818-793a-4eb3-969f-0846010e582a`, nome exato “Teste auditoria Aztecas Outubro”; 428 pontuações pessoais e quatro auditorias do alvo. SHA-256 do arquivo preservado: `6dae851c1d7e1f4b94d1022b011859ef1da8e876941babdfb3e0903d378dec0a`. Captura e exportação/validação concluídas; exclusão remota e conferência posterior ainda não confirmadas. Próxima etapa: `03-remove.sql` completo, que recusa divergência do estado desde a captura. Nenhuma exclusão executada pelo agente.

18/10/2026 — O Dono do produto confirmou que a tela sem preparação histórica passou a funcionar após atualização da interface. Também forneceu o retorno da captura remota: id `before-audit-test-removal-20261018-v1`, horário `2026-10-18 14:54:17.622102+00` (11:54:17 em São Paulo), alvo `b46cb818-793a-4eb3-969f-0846010e582a`, checksum `ce110c9b6c99b4492796c276b08be048`, 428 pontuações pessoais na captura e quatro auditorias do alvo. Captura remota confirmada por esse retorno; exportação privada/validação de integridade e exclusão ainda não confirmadas. Não repetir nem sobrescrever a captura. Próxima etapa: executar `02-export-private.sql`, salvar a exportação completa em armazenamento privado/ignorado e conferir identificação/checksum antes da retirada. Nenhum conteúdo pessoal do snapshot reproduzido na documentação. Referência exata da versão/URL não informada; relato confirma apresentação atualizada, sem comprovar todos os casos de cálculo da manutenção.

18/10/2026 — O Dono do produto informou que executou a nova migração de retirada da preparação histórica (`202610180002_retire_history_preparation.sql`). Execução relatada; retorno SQL, ambiente e horário exato não fornecidos. Não reaplicar. Publicação e homologação do fluxo sem preparação ainda não confirmadas. Retirada do torneio de teste ainda não executada/confirmada; orientação iniciada pela captura de backup. Este registro substitui a pendência anterior de execução dessa migração, sem presumir backup novo ou exclusão remota.

18/10/2026 — Manutenção autorizada após encerramento da Sprint 6: retirar preparação histórica e eliminar somente “Teste auditoria Aztecas Outubro”. Implementação local concluída; 92 testes e lint dos arquivos alterados aprovados. TypeScript mantém erros anteriores do cliente Supabase; build não executado. Migração nova e scripts de captura/exportação/exclusão preparados, sem execução remota; publicação e homologação pendentes. Não reabre Sprint 6 nem inicia Sprint 7. [Entrega, efeitos e procedimento](sprints/manutencao-pos-sprint-6.md).

18/10/2026 — Sprint 6 encerrada por encaminhamento do Dono do produto (“podemos encerrar a sprint entao?”), após confirmar clareza da tela e funcionamento dos testes de punição e recálculo. Encerramento baseado nas validações relatadas e nas evidências locais, sem presumir execução de todos os cenários remotos. S6-01–S6-04 entregues; RF21 continua fora do escopo. Migração incremental confirmada; aplicação atualizada exercitada pelo Dono do produto, sem identificação de URL/versão. Casos remotos não detalhados no roteiro, referência do ambiente e novo backup não confirmado ficam como acompanhamento posterior, sem manter a sprint aberta. Permanecem registrados os erros de tipagem do Supabase observados na checagem TypeScript de 18/10; build deste incremento não executado. Última suíte local: 88 testes aprovados; lint dos arquivos alterados aprovado. Este encerramento substitui os registros históricos de sprint em homologação e aceite global pendente. Atualização exclusivamente documental, sem nova execução remota.

18/10/2026 — O Dono do produto confirmou: “os testes de punicao e recalculo funcionaram”. Registrado funcionamento de punição e recálculo nos testes realizados na aplicação, complementando a validação anterior da tela e do fluxo em duas etapas. Este relato substitui a ausência de confirmação geral desses efeitos. Não foram detalhados tipo de punição, modo de cálculo, valores esperados/obtidos, ambiente ou dispositivo; não presumir cobertura individual das duas sanções, cálculo absoluto/relativo, empate/nenhum voto, idempotência, isolamento ou concorrência. Casos específicos ainda sem evidência permanecem no roteiro; não há aceite global da Sprint 6 neste relato. Atualização documental, sem nova operação remota ou teste da aplicação pelo agente.

18/10/2026 — O Dono do produto relatou, após testar o ajuste: “agora testei e faz sentido a tela”. Registrada validação da clareza da tela e do fluxo de apuração em duas etapas na aplicação utilizada. Substitui a pendência de validação geral da apresentação deste incremento. Ambiente/versão, dispositivo e casos executados não informados; o relato não comprova separadamente aplicação das duas punições, recálculo, empate/nenhum voto, concorrência, celular/teclado nem aceite global da Sprint 6. Migração incremental já confirmada pelo retorno anterior; não reaplicar. Atualização exclusivamente documental, sem nova operação remota ou teste da aplicação pelo agente.

18/10/2026 — O Dono do produto informou o retorno “Success. No rows returned” após executar a migração incremental `202610180001_audit_tally.sql`. Execução remota da migração confirmada por esse relato; não reaplicar. Ambiente/identificador e horário exato não informados. Publicação da interface, uso da nova consulta, homologação e aceite deste incremento ainda não confirmados. Novo backup/exportação não confirmado. Este registro substitui as referências anteriores à migração deste incremento como pendente; preserva os demais registros como históricos.

18/10/2026 — A pedido do Dono do produto, apuração em duas etapas implementada localmente: consultar votos, depois escolher punição quando cabível e confirmar encerramento. Suíte de 88 testes e lint dos arquivos alterados aprovados; TypeScript permanece com erros de tipagem do Supabase já observados anteriormente. Aplicar nova migração `202610180001_audit_tally.sql` antes de publicar esta interface e homologar o fluxo; não reaplicar a migração original. Nenhuma operação remota deste incremento realizada. [Entrega e limites](sprints/sprint-6.md), [procedimento](sprints/sprint-6-operacao.md) e [ADR-007](decisoes/adr-007-apuracao-em-duas-etapas.md).

Evolução remota vigente S6 em 11/10/2026: backup capturado/exportado e validado; migração executada pelo Dono do produto; comparação posterior aprovada com `preserved = true` e checksums iguais. Banco preparado para a interface S6. Publicação, homologação e aceite permanecem pendentes. [Evidências](sprints/sprint-6-operacao.md). Estados anteriores de migração pendente são históricos.

Situação vigente em 11/10/2026: regras da Sprint 6 aprovadas pelo Dono do produto; S6-01–S6-03 implementadas localmente, com pedidos justificados, aprovação, votação secreta, apuração e recálculo/histórico isolados por torneio. Verificação local aprovada: 82 testes, lint e build; migração, publicação, homologação e aceite pendentes. [Entrega](sprints/sprint-6.md) e [operação](sprints/sprint-6-operacao.md). O registro de início/refinamento abaixo é histórico e foi substituído por esta evolução. Sprint 5 permanece encerrada.

11/10/2026 — Por solicitação do Dono do produto, iniciado o [planejamento da Sprint 6](sprints/sprint-6.md), próxima entrega após o aceite da Sprint 5. S6-01–S6-03 cobrem abertura/votação, apuração/punição e recálculo/histórico. Estimativas relativas preliminares e sequência técnica registradas; regras de eleitorado, prazo e maioria submetidas ao Dono do produto. Implementação funcional aguarda esse refinamento; nenhuma operação remota realizada.

Aceite e encerramento em 03/10/2026: Dono do produto declarou explicitamente “está aceita a sprint”. Sprint 5 concluída, incluindo S5-01–S5-05. Aceite considera as evidências e limites registrados: carregamento confirmado na aplicação utilizada; Tentar novamente validado localmente, sem falha observada para homologação remota. Análise de amostras, diagnóstico da demora e eventuais melhorias permanecem acompanhamento posterior. Versão/URL do deployment não informadas; nenhum novo SQL necessário para S5-04/S5-05.

Os estados anteriores abaixo são registros históricos; o aceite acima é a situação vigente.

## Situação consolidada

Situação consolidada em 03/10/2026: S5-01–S5-03 implementadas, migrações executadas/verificadas e cenários relatados homologados; TESTE S5 retirado, quatro torneios originais e lançamentos legítimos preservados. S5-04 (resultados recentes e histórico pessoal) teve funcionamento confirmado pelo Dono do produto. S5-05 (carregamento, recuperação e métricas) implementada localmente, com 69 testes, lint e build aprovados; telas de carregamento confirmadas pelo Dono do produto na aplicação utilizada; nenhuma falha ocorreu para conferir Tentar novamente. Versão/URL não informadas. Análise das amostras e otimização posterior ficam como acompanhamento, conforme orientação do Dono do produto, sem prometer redução de latência. Sprint 5 aceita e encerrada pelo Dono do produto em 03/10/2026; análise de logs e melhorias posteriores ficam como acompanhamento. A situação detalhada e cronológica está em docs/sprints/sprint-5.md.

## Registros das etapas anteriores

Os registros abaixo preservam as evidências de cada etapa. Pendências descritas em etapas anteriores não prevalecem sobre a situação consolidada; os acréscimos S5-04/S5-05 ao final complementam esse histórico.

03/10/2026 — Dono do produto aprovou S5-04 (recorte de FB05): cinco dias recentes com Ver todos/Mostrar menos e ranking completo. Implementação local e requisitos/arquitetura/testes atualizados; sem migração de banco. Histórico pessoal incluído com cinco lançamentos recentes e expansão dos até 100 registros carregados. Lista de torneios, acesso a registros anteriores ao limite e FB06 permanecem no backlog futuro. Publicação e homologação do acréscimo ainda não confirmadas.

Conferência direta final fornecida pelo Dono do produto via `21-check-preserved-score.sql`: data 03/10/2026, valor anterior/atual 13.943, `score_present = true`, `unchanged_from_cleanup_backup = true`. Lançamento legítimo do Feyh preservado integralmente. Conferência visual dos quatro torneios originais já confirmada; TESTE S5 retirado e captura anterior à retirada exportada/validada. Cenários funcionais relatados pelo Dono do produto aprovados: regra única, ranking igual à prévia, persistência, alteração/restauração do período, calendário semanal, exclusão/restauração de data, absoluto/relativo e isolamento dos originais. Testes locais de autorização/encerrados/concorrência e rollback constam nas evidências anteriores; não equivalem a homologação remota desses cenários. Conferências finais de preservação concluídas. Aceite global e encerramento da Sprint 5 ainda não confirmados explicitamente pelo Dono do produto.

Retirada remota de TESTE S5 executada pelo Dono do produto por `19-remove-confirmed-test.sql`, retorno fornecido: backup `before-s5-test-cleanup-v1`, captura `2026-10-03 16:16:36.107219+00`, checksum `44cff88b18d169d00ec550aede25017a`, `test_removed = true`, 4 torneios restantes e 291 pontuações pessoais preservadas. Script concluído com sua comparação transacional dos demais torneios/dados/cálculo e pontuações pessoais aprovada, caso contrário teria revertido. Lançamentos legítimos posteriores aos backups anteriores preservados; nenhuma restauração global ou exclusão de contas/brutos. Exportação privada dessa captura preparada em `20-export-test-cleanup.sql`, ainda não fornecida/validada. Conferência visual final dos quatro torneios e aceite global do Dono do produto ainda não confirmados.

Situação atual em 03/10/2026: migração complementar de regra única executada pelo Dono do produto e comparação remota pós-migração aprovada por `16-verify-after-full-period.sql`: `different_sections = 0`, `sections = []`, `checksum_backup = checksum_current = f6c6d78a67309d858fae0e70c4080477`. Dados de negócio, versões/auditorias e cálculo na data de referência preservados. Verificação remota da migração complementar concluída. Publicação da interface correspondente, homologação de período/regra únicos, retirada delimitada de torneios de teste e aceite ainda não confirmados. Não reaplicar migrações. Retomar criação/revisão somente na interface correspondente ao contrato `scope: tournament`.

Registros abaixo preservam a situação de cada etapa; pendências anteriores de aplicação/comparação da migração foram resolvidas pela evidência acima.

Situação mais recente S5: Dono do produto definiu regra única por torneio e período editável durante homologação. Complemento local e ADR-004; `pnpm test`: 60 aprovados, zero falhas/pulados; `pnpm lint` e `pnpm build` aprovados. Migração complementar, publicação e homologação pendentes. Registros anteriores abaixo descrevem entrega inicial e verificação já concluída de suas migrações.

Situação atual da Sprint 5 em 03/10/2026: backup capturado/exportado e verificado; ambas as migrações executadas pelo Dono do produto no Supabase. Comparação pós-migração sem diferenças, nove indicadores de esquema/permissões verdadeiros e 4 referências iniciais equivalentes aprovados. Verificação remota da migração concluída; publicação da aplicação atualizada, testes funcionais e aceite ainda não confirmados. Evidências na [Sprint 5](sprints/sprint-5.md). Registros anteriores abaixo preservam a situação de cada momento.

## Objetivo

Situação vigente em 03/10/2026: Sprint 5 iniciada por autorização do Dono do produto; S5-01–S5-03 implementadas localmente, com testes/documentação e implantação/homologação remotas pendentes. [Sprint 5](sprints/sprint-5.md) e [operação](sprints/sprint-5-operacao.md). O fechamento de 27/09 abaixo permanece como histórico anterior ao início.

Situação consolidada em 27/09/2026: Sprint 4 encerrada com S4-01 a S4-05 homologadas e carga complementar dos perfis executada. Revisões de escopo e pendências registradas abaixo são históricas quando substituídas pelo encerramento. Próximo escopo previsto: Sprint 5, regras e calendário; implementação ainda não iniciada neste fechamento.

Entregar incrementalmente uma aplicação que substitua a planilha do campeonato GeoGuaras, preservando as regras de negócio e tornando lançamentos, cálculos e rankings rastreáveis.

## Método de trabalho

Definição funcional do calendário da Sprint 5: calendário oferece segunda a sexta ou todos os dias, incluindo sábado e domingo. O escopo contempla essas duas opções, sem seleção livre de dias. [Registro atualizado](sprints/sprint-5.md).

Sprint Planning de 03/10/2026: Dono do produto confirmou capacidade por tokens semanais, meta preferencial de concluir em 03–04/10 com semana seguinte para correções, revisão retroativa explícita e zero como ausência em ambos os modos. Fuso fixo `America/Sao_Paulo`, sem configuração, substitui a decisão anterior de múltiplos fusos. Em seguida autorizou desenvolvimento; entrega local registrada na Sprint 5, com aceite/publicação pendentes. Estimativas preliminares não representam consumo de tokens; saldo quantitativo não informado.

Atualização de 03/10/2026: FB05 (resultados recentes com expansão) e FB06 (troca de torneio responsiva e investigação de pré-carregamento) registrados como candidatos à S7-03. [Pré-planejamento da Sprint 7](sprints/sprint-7.md) contém histórias, critérios propostos e condições de capacidade. Sprints 5 e 6 preservadas; seleção no Sprint Planning depende de refinamento, estimativas e prioridade do Dono do produto. Nenhuma implementação iniciada.

Revisão de 27/09/2026: por orientação do Dono do produto, preservar a prioridade do escopo planejado das sprints 5–7. Os pedidos de modo escuro, lançamento tardio, relatório de desempenho e integração GeoGuessr permanecem em avaliação, sem ampliação automática das sprints. Consulte a [avaliação do escopo pendente e feedback](avaliacao-backlog-2026-09-27.md) para situação por requisito, recomendações e investigação inicial de API.

Usaremos sprints curtas, backlog versionado no GitHub e revisão por pull request. Cada história concluída precisa atender aos critérios de aceite e aos casos de teste correspondentes.

## Sprints

| Sprint | Objetivo | Entregas |
| --- | --- | --- |
| 1 — Descoberta | Documentar o MVP e definir o escopo | Wiki, requisitos, regras, diagrama e plano de testes |
| 2 — Fundação | Criar a base técnica e o acesso de usuários | Next.js/TypeScript, Supabase (PostgreSQL e Auth), políticas RLS, perfis, GitHub → Vercel e ambientes de implantação |
| 3 — MVP utilizável | Entregar o primeiro torneio pronto para os clientes | Torneio pré-instanciado, participantes provisionados, lançamento pessoal, cálculo relativo, penalidade, ranking, testes e publicação |
| 4 — Torneios e participantes | Administrar competições com a regra existente | Criar, editar e encerrar torneios; gerenciar participantes; listar e acessar múltiplos torneios; ingresso retroativo; nome público e perfil GeoGuessr |
| 5 — Regras e calendário | Configurar competições com rastreabilidade | Modo absoluto/relativo, penalidade, calendário e exclusões; versões e vigência das regras |
| 6 — Auditoria por votação | Avaliar pontuações dentro de cada torneio | Abertura, votação, apuração, punição local e recálculo rastreável; testes de isolamento |
| 7 — Moderação e evolução | Completar a operação e melhorar a experiência | Aprovação/correção de lançamentos, consulta de histórico avançado e melhorias de ranking priorizadas pelo retorno dos clientes |

## Sprints concluídas

| Sprint | Situação | Registro |
| --- | --- | --- |
| 1 — Descoberta e documentação do MVP | Concluída em 06/09/2026 | [Encerramento da Sprint 1](sprints/sprint-1.md) |
| 2 — Fundação | Concluída em 12/09/2026 | [Encerramento da Sprint 2](sprints/sprint-2.md) |
| 3 — MVP utilizável | Concluída em 21/09/2026 | [Encerramento da Sprint 3](sprints/sprint-3-encerramento.md) |
| 4 — Torneios e participantes | Concluída em 27/09/2026, incluindo S4-04/S4-05 | [Encerramento da Sprint 4](sprints/sprint-4.md) |

## Situação e revisão de escopo — 20/09/2026

A Sprint 2 entregou cadastro e login concluídos e validados, conforme confirmado pelo Dono do produto e registrado no commit `3f8c614` (autenticação validada). A base Next.js/Supabase e a migração inicial também estão implementadas. Cadastro e login não serão reimplementados nem reabertos como entregas da Sprint 3. Nesta sprint, sua verificação será apenas de regressão e integração com o torneio no ambiente publicado. A Sprint 3 foi concluída em 21/09/2026. Ver [encerramento](sprints/sprint-3-encerramento.md).

Por solicitação dos clientes, a primeira versão utilizável passa a ser a entrega da Sprint 3. Antecipamos o fluxo essencial de pontuação e ranking e adiamos a criação de torneios e a configuração de regras pela interface. As regras de setembro estão confirmadas; o cadastro será disponibilizado e o Dono do produto inserirá manualmente o histórico após o cadastro das contas. Não haverá importador automático nesta sprint. A mudança de escopo está definida; os parâmetros operacionais pendentes estão listados no [plano da Sprint 3](sprints/sprint-3.md).

A execução da Sprint 3 foi planejada para 20/09/2026, conforme informado pelo Dono do produto. A capacidade em horas não foi informada. A sequência abaixo representa prioridade e dependências, não uma garantia de duração. As sprints futuras serão refinadas após a entrega do MVP.

O torneio inicial terá período de 01/09/2026 a 30/09/2026, inclusive. O histórico inserido manualmente e o ranking serão limitados aos dias elegíveis desse período, sem saldos de agosto.

Calendário confirmado: segunda a sexta, excluindo 07/09/2026 por feriado. Fins de semana e essa data não geram pontuação nem penalidade, inclusive para o histórico manual.

## Backlog da Sprint 3

### Mudança em relação ao plano anterior

Para atender à solicitação dos clientes de uma versão utilizável ao final da Sprint 3, o foco mudou de administração de torneios para um torneio pré-instanciado de setembro. Lançamento, cálculo, ranking e publicação, antes previstos nas sprints 4 e 5, foram antecipados. Criação de torneios e configuração de regras pela interface foram adiadas. Cadastro e login são entregas concluídas da Sprint 2 e entram somente como funcionalidades reutilizadas. A validação de acesso em S3-06 verifica a integração nova, sem contabilizar autenticação como novo desenvolvimento.

| ID | Entrega obrigatória | Dependência | Situação |
| --- | --- | --- | --- |
| S3-01 | Fechar regras do MVP, período, participantes e critérios de aceite | Decisões operacionais do plano detalhado | Concluído; configuração e critérios registrados |
| S3-02 | Ajustar banco/RLS, provisionar o torneio único e documentar carga manual do histórico | S3-01 | Concluído; provisionamento e carga de amostra validados |
| S3-03 | Registrar e consultar pontuação própria por dia | S3-02 | Concluído; formulário e isolamento validados remotamente |
| S3-04 | Calcular diferença diária, ausência e total com rastreabilidade | S3-01, S3-02 | Concluído; regras e totais conciliados na amostra |
| S3-05 | Exibir torneio, regras, resultados diários e ranking acumulado | S3-03, S3-04 | Concluído; painel publicado e conferido pelo Dono do produto |
| S3-06 | Validar com exemplos do Excel, testar acesso e publicar | S3-02 a S3-05 | Concluído; publicação, aceite e restauração registrados |

Detalhamento, limites e encerramento: [Sprint 3 — MVP utilizável](sprints/sprint-3.md).

## Distribuição de esforço — revisão de 20/09/2026

Por decisão do Dono do produto, o planejamento passa de cinco para sete sprints. A antiga Sprint 4 foi dividida entre administração (Sprint 4) e regras (Sprint 5); a auditoria ganhou uma sprint própria (Sprint 6), e moderação e melhorias ficaram na Sprint 7. O MVP acordado da Sprint 3 permanece inalterado.

Esta divisão reduz a concentração de trabalho, mas ainda não comprova equilíbrio de esforço. Antes de iniciar cada sprint, estimar as histórias, registrar a capacidade disponível, incluir testes e publicação na estimativa e limitar o compromisso à capacidade. A Sprint 3 foi encerrada em 21/09/2026. As próximas sprints ainda exigem estimativas e capacidade confirmadas.

## Inclusão no planejamento — 21/09/2026

Por solicitação do Dono do produto em 21/09, RF17–RF18 foram incluídos na Sprint 4 junto do gerenciamento de participantes. Ver [Perfil público](perfil-publico.md). O nome público será único em toda a plataforma, por decisão do Dono do produto. Incluir restrição de unicidade e tratamento de colisões existentes na estimativa. A prioridade dessa inclusão foi revista em 26/09, conforme abaixo. Sprint 3 permanece encerrada.

## Prioridades da Sprint 4 — revisão de 26/09/2026

Por decisão do Dono do produto, o foco da Sprint 4 passa a ser S4-01 (criar, editar e encerrar torneios), S4-02 (gerenciar participantes e ingresso retroativo) e S4-03 (listar e acessar múltiplos torneios). Essas três histórias constituem o escopo principal, com testes, documentação e publicação incluídos no esforço.

S4-04 (nome público único e edição) e S4-05 (URL do perfil GeoGuessr) ficam como entregas adicionais, a executar conforme a capacidade restante. Se não forem concluídas, podem ser remanejadas para uma sprint posterior, a definir, sem retirar S4-03 do foco. Esta decisão substitui a orientação anterior de priorizar os perfis e adiar a navegação entre torneios. Datas e estimativas continuam pendentes.

## Backlog das próximas sprints

Nota de atualização: o parágrafo e a linha da Sprint 4 abaixo preservam o planejamento histórico; as cinco histórias foram concluídas conforme o encerramento ao final deste documento. O backlog pendente começa na Sprint 5.

Sprint 4 iniciada em 26/09/2026 pela S4-01, com aceite funcional concluído na mesma data após validação pelo Dono do produto. S4-02, gerenciamento de participantes e ingresso retroativo, implementada após backup validado; migração remota e ensaio de inclusão/remoção confirmados, com zero diferenças no backup após o ciclo. Homologação dos demais cenários ainda pendente. Inclui seleção de contas cadastradas por nome/e-mail a pedido do Dono do produto. Implementação e evidências em [Sprint 4](sprints/sprint-4.md). Relatório, envio por e-mail e exclusão posterior ao encerramento registrados como RF19 futuro, sem sprint definida.

| Sprint | Histórias previstas | Dependências e aceite |
| --- | --- | --- |
| 4 | Escopo principal: S4-01: criar/editar/encerrar torneio com a regra existente; S4-02: gerenciar participantes e ingresso retroativo; S4-03: lista e detalhes de múltiplos torneios. Adicionais remanejáveis: S4-04: nome público único e edição; S4-05: URL do GeoGuessr | Base da Sprint 3; isolamento entre organizadores, pontuações pessoais reutilizadas e ranking correto por torneio. Sem editor de regras nesta etapa. |
| 5 | S5-01: configurar modos e penalidade; S5-02: calendário e exclusões; S5-03: versões e vigência de regras | Sprint 4; regras configuradas alteram somente o contexto previsto e preservam a explicação dos resultados consolidados. |
| 6 | S6-01: abrir avaliação e votar; S6-02: apurar e escolher punição; S6-03: recálculo e histórico da decisão | Sprints 4 e 5; fluxo completo de RF13–RF16, punição restrita ao torneio denunciante e testes de votação, prazo e isolamento. |
| 7 | S7-01: aprovação/correção de lançamentos; S7-02: consulta de histórico avançado; S7-03: melhorias de ranking e usabilidade | Base das sprints anteriores; alterações administrativas rastreáveis e restritas ao torneio. Refinar RF08 e as melhorias com o Dono do produto, sem permitir contornar a votação de invalidez. |

Na Sprint 6, refinar elegibilidade, prazo, maioria/quórum, empates e recálculo antes de implementar. O organizador apura após o prazo e, havendo maioria pela invalidez, escolhe desconsiderar a pontuação ou aplicar a penalidade diária. Ver [Auditoria de pontuações](auditoria-de-pontuacoes.md).

Não há estimativas em horas ou pontos nem datas confirmadas para as sprints 4–7. A Sprint 6 concentra maior incerteza e deve ser reavaliada após o refinamento. Se exceder a capacidade, ajustar a previsão antes de assumir a entrega; não liberar punição sem votação, apuração e testes completos. Testes, documentação e publicação acompanham cada incremento, não ficam adiados à Sprint 7. Importador automático e relatórios extras continuam no backlog sem compromisso de sprint.

## Backlog inicial da Sprint 1

- Documentar regras extraídas do Excel.
- Definir requisitos funcionais, não funcionais e regras de negócio.
- Criar diagrama de classes inicial.
- Definir casos de teste ligados aos requisitos.
- Registrar decisões técnicas e pendências de validação do grupo.

## Critério de encerramento da Sprint 1

A documentação deve permitir que outro integrante compreenda as entidades do sistema, as regras atuais de cálculo e os comportamentos que precisam ser validados antes da implementação.

## Situação S4-02/S4-03 — 27/09/2026

S4-01, S4-02 e S4-03 aceitas funcionalmente pelo Dono do produto em 27/09/2026: escopo principal da Sprint 4 concluído. S4-04/S4-05 permanecem adicionais remanejáveis; sua execução ou transferência de sprint ainda deve ser definida. Ver [Sprint 4](sprints/sprint-4.md).

## Evolução S4-04/S4-05 — 27/09/2026

Revisão operacional posterior: carga reduzida a 12 nomes/11 links, preservando o perfil de Martin já preenchido. Primeira tentativa abortou sem gravação; reexecução confirmada pelo retorno de 12 perfis com nome confirmado e 11 URLs. Essa revisão substitui a contagem inicial abaixo.

S4-04/S4-05 autorizadas, implementadas, migradas, publicadas na Vercel e homologadas pelo Dono do produto em 27/09/2026. Aceite substitui as pendências anteriores. Carga complementar revisada de 12 nomes e 11 links executada e conciliada pelo retorno SQL; conferência visual após a carga ainda não relatada, conforme Sprint 4.

03/10/2026 — S5-05 autorizada: investigar primeira abertura/troca lenta e aviso intermitente. Carregamento, nova tentativa explícita e métricas sem dados pessoais implementados localmente; causa remota não confirmada. Sem migração. Publicação, linha de base e homologação pendentes. Ver seção 11 da Sprint 5 e ADR-005.

Evidência posterior S5-05 em 03/10/2026: Dono do produto confirmou as telas de carregamento na aplicação utilizada. Não houve erro para conferir Tentar novamente; recuperação validada nos testes locais, sem confirmação remota desse cenário. Identificação de versão/URL e aceite global não informados. Análise das amostras permanece acompanhamento posterior.

## Novo requisito — estatísticas (11/10/2026)

RF20–RF21 registrados: médias pessoais bruta diária e por jogo, gráfico temporal e estatísticas do torneio (média com gráfico de evolução temporal e contagens por participante de dias com maior pontuação/última colocação), em telas separadas do painel principal. Cada dia reúne cinco jogos de 0 a 5.000; média por jogo = média bruta diária / 5. Escopo solicitado pelo Dono do produto; implementação sem sprint definida. Refinar fórmulas do torneio, empates, ausências, período e acesso antes de estimar/priorizar. Candidato à Sprint 7, sem ampliar automaticamente seu compromisso. Ver [detalhamento](estatisticas.md). Entrega exclusivamente documental; sem alteração de arquitetura ou operação remota.

11/10/2026 — Refinamento de RF20–RF21 confirmado pelo Dono do produto: dropdown pessoal com “últimos 5 dias”, “último mês” e “desde o início”; zero/ausências excluídos das médias pessoais; média do torneio sempre sobre pontos aplicados, incluindo ausências no denominador; médias sem casas decimais, com arredondamento aritmético padrão no resultado final. Substitui as pendências anteriores desses pontos. Seleção inicial/limites temporais, agregação do torneio, empates e efeitos de auditoria ainda exigem refinamento; ver [Estatísticas](estatisticas.md). Entrega exclusivamente documental, sem implementação ou execução remota; revisão e git diff --check.

11/10/2026 — Decisões adicionais confirmadas pelo Dono do produto para RF20–RF21: opção inicial “últimos 5 dias”; média pessoal somente dos dias jogados (bruto positivo); contagens de colocação pela pontuação aplicada, com todos os empatados na primeira/última recebendo a contagem e participante único contando nas duas; denominador zero não exibe dados da métrica. Estatísticas individuais restritas ao próprio perfil, inclusive próprias contagens na tela de torneio; média agregada permanece disponível conforme acesso ao torneio. Visualização de estatísticas de outros jogadores é requisito futuro, sem sprint definida. Substitui pendências anteriores correspondentes; limites temporais do filtro e classificação de ausentes/auditorias ainda exigem refinamento. Ver [Estatísticas](estatisticas.md). Entrega documental, sem implementação ou operação remota; revisão e git diff --check.

11/10/2026 — Dono do produto definiu “últimos 5 dias” de RF20 como os cinco dias mais recentes com valor, isto é, bruto positivo conforme a regra confirmada de zero como ausência. Não são cinco dias corridos: ignorar zero e dias sem lançamento, buscando os cinco dias jogados mais recentes; se houver menos de cinco, usar todos os disponíveis. Seleção aplicada às médias e ao gráfico pessoal. Substitui a pendência anterior sobre esse período; definição de “último mês” permanece em refinamento. Critério futuro: validar intervalos sem jogo, zeros e menos de cinco registros positivos. Entrega documental, sem implementação ou execução remota; revisão e git diff --check. Ver [Estatísticas](estatisticas.md).

11/10/2026 — Dono do produto definiu o período antes chamado “último mês” como “últimos 30 dias”, substituindo o rótulo e encerrando essa pendência. Janela de 30 dias corridos (hoje e os 29 dias anteriores, em America/Sao_Paulo), aplicada às médias e ao gráfico pessoal; apenas dias jogados entram nas médias. Opções vigentes: “últimos 5 dias”, “últimos 30 dias” e “desde o início”. Registros anteriores com “último mês” são históricos e substituídos por esta definição. Critérios futuros incluem limites de inclusão/exclusão, viradas de mês/ano e zero/ausências. Ver [Estatísticas](estatisticas.md). Revisão documental local; git diff --check, sem implementação, teste funcional ou operação remota.

## RF20 — incluído e implementado na Sprint 6 em 11/10/2026

O Dono do produto autorizou incluir RF20 na Sprint 6 (S6-04). Implementação local concluída: acesso “Minhas estatísticas” no painel, tela própria `/dashboard/statistics`, médias bruta diária e por jogo, gráfico cronológico e tabela acessível. RF21 permanece futuro, em refinamento. Este registro substitui as referências anteriores a RF20 sem sprint/entrega apenas documental, que passam a ser históricas. Publicação, homologação e aceite de RF20 ainda não confirmados; não há migração adicional.

Períodos aprovados: cinco dias positivos mais recentes (padrão), últimos 30 dias corridos (hoje e 29 anteriores em São Paulo) e histórico até hoje. Médias e gráfico usam somente bruto positivo; zero e ausência não contam como jogos. Cada dia equivale a cinco jogos; cada média é arredondada apenas após sua própria divisão. Auditorias de torneio não alteram a fonte pessoal. Sem positivos: mensagem, sem indicadores ou gráfico fictício. Erro de qualquer página: tentar novamente, sem médias parciais.

Consulta no servidor restrita à identidade autenticada e às políticas RLS existentes; nenhum parâmetro permite escolher outro perfil. Paginação por cursor na data única por jogador até página vazia, sem limite total de 100 registros; últimos cinco para ao completar cinco positivos. Tamanho solicitado de até 200 registros, tolerando teto remoto inferior. Sem novas tabelas, RPCs, permissões, dependências ou mutações. Gráfico SVG com escala diária 0–25.000 e distâncias proporcionais às datas; tabela completa expansível e rolagem horizontal acessível. Estratégia de consulta e apresentação são escolhas técnicas; fórmulas e períodos foram confirmados pelo Dono do produto.

Validação local: suíte de 86 testes aprovada; RLS real em PGlite, 257 positivos sob teto remoto de 37 por página, últimos cinco sob teto de dois, médias/arredondamento, fronteiras de 30 dias/ano bissexto, isolamento entre contas/anônimo, erro intermediário e renderização. Lint e build aprovados; apresentação revalidada após corrigir títulos dos pontos SVG. Homologação visual de RF20 no computador/celular/teclado ainda pendente. Não houve operação remota de RF20.

Limitações: custo de consultas, memória e renderização proporcional ao histórico; leitura paginada não é snapshot transacional e correções concorrentes podem exigir recarga. Sem atualização em tempo real. A apuração das auditorias mantém seu prazo e roteiro; não há aceite global da Sprint 6.

## RF22–RF23 — evolução futura (11/10/2026)

Novo pedido: entrada alternativa do texto dos cinco jogos e Total; estatísticas pessoais por país (melhor/pior desempenho) e tempo médio. Preservar entrada simples e métricas atuais de RF20. Sem sprint definida; candidato ao refinamento da evolução, sujeito à priorização e capacidade. Definir fórmulas, validação/reconciliação e persistência antes de estimar; [detalhamento](estatisticas.md). Entrega documental, sem mudança de arquitetura ou operação remota.

## RF24 — candidato a planejamento futuro (11/10/2026)

Refinar métricas operacionais persistentes para analisar tempos e falhas após uma semana de utilização. Avaliar armazenamento/custo, retenção, volume, acesso e impacto de desempenho antes de estimar e selecionar uma sprint. Relacionado ao diagnóstico de carregamento de FB06; sem compromisso de Sprint 7 ou ampliação de sprint em andamento. [Detalhamento](metricas-operacionais.md).
