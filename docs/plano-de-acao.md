# Plano de ação

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
