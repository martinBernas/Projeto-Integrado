# Plano de ação

## Objetivo

Entregar incrementalmente uma aplicação que substitua a planilha do campeonato GeoGuaras, preservando as regras de negócio e tornando lançamentos, cálculos e rankings rastreáveis.

## Método de trabalho

Usaremos sprints curtas, backlog versionado no GitHub e revisão por pull request. Cada história concluída precisa atender aos critérios de aceite e aos casos de teste correspondentes.

## Sprints

| Sprint | Objetivo | Entregas |
| --- | --- | --- |
| 1 — Descoberta | Documentar o MVP e definir o escopo | Wiki, requisitos, regras, diagrama e plano de testes |
| 2 — Fundação | Criar a base técnica e o acesso de usuários | Next.js/TypeScript, Supabase (PostgreSQL e Auth), políticas RLS, perfis, GitHub → Vercel e ambientes de implantação |
| 3 — MVP utilizável | Entregar o primeiro torneio pronto para os clientes | Torneio pré-instanciado, participantes provisionados, lançamento pessoal, cálculo relativo, penalidade, ranking, testes e publicação |
| 4 — Torneios e participantes | Administrar competições com a regra existente | Criar, editar e encerrar torneios; gerenciar participantes; listar e acessar múltiplos torneios; ingresso retroativo |
| 5 — Regras e calendário | Configurar competições com rastreabilidade | Modo absoluto/relativo, penalidade, calendário e exclusões; versões e vigência das regras |
| 6 — Auditoria por votação | Avaliar pontuações dentro de cada torneio | Abertura, votação, apuração, punição local e recálculo rastreável; testes de isolamento |
| 7 — Moderação e evolução | Completar a operação e melhorar a experiência | Aprovação/correção de lançamentos, consulta de histórico avançado e melhorias de ranking priorizadas pelo retorno dos clientes |

## Situação e revisão de escopo — 20/09/2026

A Sprint 2 entregou cadastro e login concluídos e validados, conforme confirmado pelo Dono do produto e registrado no commit `3f8c614` (autenticação validada). A base Next.js/Supabase e a migração inicial também estão implementadas. Cadastro e login não serão reimplementados nem reabertos como entregas da Sprint 3. Nesta sprint, sua verificação será apenas de regressão e integração com o torneio no ambiente publicado. A Sprint 3 está em execução, com implementação local e validações descritas no backlog abaixo; implantação e aceite remoto ainda pendentes.

Por solicitação dos clientes, a primeira versão utilizável passa a ser a entrega da Sprint 3. Antecipamos o fluxo essencial de pontuação e ranking e adiamos a criação de torneios e a configuração de regras pela interface. As regras de setembro estão confirmadas; o cadastro será disponibilizado e o Dono do produto inserirá manualmente o histórico após o cadastro das contas. Não haverá importador automático nesta sprint. A mudança de escopo está definida; os parâmetros operacionais pendentes estão listados no [plano da Sprint 3](sprints/sprint-3.md).

A execução da Sprint 3 está prevista para hoje, 20/09/2026, conforme informado pelo Dono do produto. A capacidade em horas não foi informada. A sequência abaixo representa prioridade e dependências, não uma garantia de duração. As sprints futuras serão refinadas após a entrega do MVP.

O torneio inicial terá período de 01/09/2026 a 30/09/2026, inclusive. O histórico inserido manualmente e o ranking serão limitados aos dias elegíveis desse período, sem saldos de agosto.

Calendário confirmado: segunda a sexta, excluindo 07/09/2026 por feriado. Fins de semana e essa data não geram pontuação nem penalidade, inclusive para o histórico manual.

## Backlog da Sprint 3

### Mudança em relação ao plano anterior

Para atender à solicitação dos clientes de uma versão utilizável ao final da Sprint 3, o foco mudou de administração de torneios para um torneio pré-instanciado de setembro. Lançamento, cálculo, ranking e publicação, antes previstos nas sprints 4 e 5, foram antecipados. Criação de torneios e configuração de regras pela interface foram adiadas. Cadastro e login são entregas concluídas da Sprint 2 e entram somente como funcionalidades reutilizadas. A validação de acesso em S3-06 verifica a integração nova, sem contabilizar autenticação como novo desenvolvimento.

| ID | Entrega obrigatória | Dependência | Situação |
| --- | --- | --- | --- |
| S3-01 | Fechar regras do MVP, período, participantes e critérios de aceite | Decisões operacionais do plano detalhado | Em planejamento |
| S3-02 | Ajustar banco/RLS, provisionar o torneio único e documentar carga manual do histórico | S3-01 | Migrações e torneio aplicados no Supabase; configuração confirmada pelo Dono do produto |
| S3-03 | Registrar e consultar pontuação própria por dia | S3-02 | Implementado localmente; homologação remota pendente |
| S3-04 | Calcular diferença diária, ausência e total com rastreabilidade | S3-01, S3-02 | Testes locais aprovados; Excel real ainda será fornecido |
| S3-05 | Exibir torneio, regras, resultados diários e ranking acumulado | S3-03, S3-04 | Implementado; inspeção visual local em celular/desktop |
| S3-06 | Validar com exemplos do Excel, testar acesso e publicar | S3-02 a S3-05 | Testes/lint/build locais aprovados; publicação e aceite remoto pendentes |

Detalhamento, limites e encerramento: [Sprint 3 — MVP utilizável](sprints/sprint-3.md).

## Distribuição de esforço — revisão de 20/09/2026

Por decisão do Dono do produto, o planejamento passa de cinco para sete sprints. A antiga Sprint 4 foi dividida entre administração (Sprint 4) e regras (Sprint 5); a auditoria ganhou uma sprint própria (Sprint 6), e moderação e melhorias ficaram na Sprint 7. O MVP acordado da Sprint 3 permanece inalterado.

Esta divisão reduz a concentração de trabalho, mas ainda não comprova equilíbrio de esforço. Antes de iniciar cada sprint, estimar as histórias, registrar a capacidade disponível, incluir testes e publicação na estimativa e limitar o compromisso à capacidade. A Sprint 3 continua com execução prevista em um dia e viabilidade não confirmada; criar sprints futuras não reduz sua carga obrigatória.

## Backlog das próximas sprints

| Sprint | Histórias previstas | Dependências e aceite |
| --- | --- | --- |
| 4 | S4-01: criar/editar/encerrar torneio com a regra existente; S4-02: gerenciar participantes e ingresso retroativo; S4-03: lista e detalhes de múltiplos torneios | Base da Sprint 3; isolamento entre organizadores, pontuações pessoais reutilizadas e ranking correto por torneio. Sem editor de regras nesta etapa. |
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
