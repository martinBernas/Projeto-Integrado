# Levantamento de requisitos

Definição funcional vigente S5: um torneio aberto tem uma única regra aplicada a todo o período. Início/fim podem mudar juntamente com a configuração, mediante prévia de impacto e confirmação. Versões anteriores são histórico, sem revisões parciais nem programação independente de regra futura. Encerrados não permitem edição; brutos permanecem intactos. Complemento local; migração/publicação pendentes. [ADR-004](decisoes/adr-004-regra-unica-por-torneio.md).

## Alocação para a primeira entrega — Sprint 3

Os requisitos abaixo preservam a visão completa do produto. A alocação desta seção é histórica; a Sprint 4 foi encerrada e o próximo escopo previsto é a Sprint 5. Consulte a [avaliação atual do backlog e feedback](avaliacao-backlog-2026-09-27.md). O recorte original está no [plano da Sprint 3](sprints/sprint-3.md).

| Requisitos | Recorte da Sprint 3 |
| --- | --- |
| RF01 | Cadastro e login concluídos e validados na Sprint 2; reutilização e verificação de regressão/integração na Sprint 3 |
| RF05 | Implementar lançamento pessoal; prazo e limites precisam ser fechados em S3-01 |
| RF04, RF11, RF12 | Configuração inicial fixa por provisionamento, sem editor na interface |
| RF03 | Participantes iniciais provisionados pela equipe, sem gerenciamento pela interface |
| RF06, RF07 | Modo relativo, penalidade e resultados diários/acumulados do torneio único |
| RF09 | Rastreabilidade mínima dos dados, alterações permitidas e regra aplicada |
| RF10 | Acesso direto ao único torneio para seus participantes; lista de múltiplos torneios adiada |
| RF02, RF08 | Administração de torneios e moderação pela interface adiadas |
| RF17–RF18 | Perfil público e URL do GeoGuessr planejados para a Sprint 4 |
| RF13–RF16 | Auditoria por votação prevista para a Sprint 6; fora da Sprint 3 |

RN02 aplica-se ao histórico inserido manualmente: pontuações dentro do período contam mesmo quando anteriores ao cadastro ou vínculo. Fluxos de ingresso pela interface ficam para evolução. RN03 contempla apenas modo relativo nesta sprint. RNF01–RNF06 permanecem aplicáveis ao fluxo entregue.

## Papéis de usuário

- **Jogador:** autentica-se, registra sua própria pontuação e consulta rankings.
- **Organizador:** qualquer usuário pode criar e administrar seus próprios torneios, incluindo jogadores participantes, período e regras. Um mesmo usuário pode organizar um torneio e jogar em outros.

Neste documento, gerente do torneio e organizador designam o mesmo papel.

## Requisitos funcionais

Atualização S5 em 03/10/2026: RF04/RF06/RF09/RF11/RF12 implementados localmente nos recortes de modos/penalidade, calendário e versões/revisão explícita. Fuso fixo; encerrados preservados. Migração e homologação remotas pendentes. [Escopo e limitações](sprints/sprint-5.md), [ADR-003](decisoes/adr-003-regras-versionadas.md). RF09 histórico avançado e moderação continuam na Sprint 7; auditoria por votação na Sprint 6.

| ID | Requisito |
| --- | --- |
| RF01 | O sistema deve permitir cadastro e autenticação de usuários. |
| RF02 | Qualquer usuário deve poder criar, editar, encerrar e consultar os torneios que organiza. |
| RF03 | O organizador deve gerenciar os jogadores participantes de cada torneio. |
| RF04 | Um torneio deve possuir nome, período de início e fim editáveis e uma única regra configurável para todo o período, com histórico das alterações; seu fuso é fixo em `America/Sao_Paulo`, sem configuração pelo organizador. |
| RF05 | O jogador deve registrar sua pontuação bruta pessoal por dia, independentemente de participar de um torneio. |
| RF06 | O sistema deve calcular a pontuação aplicada segundo as regras vigentes. |
| RF07 | O sistema deve usar as pontuações pessoais dentro do período de cada torneio para exibir ranking diário, resultado do período e ranking acumulado. |
| RF08 | O organizador deve aprovar, corrigir ou invalidar lançamentos associados ao seu torneio. |
| RF09 | O sistema deve guardar o histórico da pontuação bruta, do resultado e da regra aplicada. |
| RF10 | O usuário deve visualizar a lista de todos os torneios dos quais participa e acessar os respectivos detalhes e rankings. |
| RF11 | O organizador deve configurar os dias da semana em que o torneio ocorre, com as opções padrão de segunda a sexta ou todos os dias. |
| RF12 | O organizador deve excluir datas específicas do calendário do torneio, como feriados. |
| RF13 | O organizador deve poder marcar uma pontuação como sujeita a auditoria no seu torneio, com período de avaliação registrado. |
| RF14 | Os demais usuários elegíveis devem poder votar pela invalidação ou manutenção da pontuação durante o período de avaliação. |
| RF15 | Após o período de avaliação, o organizador deve poder apurar e encerrar a votação; havendo maioria pela invalidez, a pontuação deve ser invalidada apenas no torneio que abriu a auditoria. |
| RF16 | Ao aplicar a decisão de invalidez, o organizador deve escolher entre desconsiderar a pontuação ou aplicar a penalidade do dia, preservando votos, apuração, decisão e punição para consulta histórica. |

| RF17 | O jogador deve escolher e editar um nome público único em toda a plataforma, independente do e-mail, exibido aos competidores sem usar o e-mail como alternativa. |
| RF18 | O jogador deve poder cadastrar, editar e remover a URL opcional do perfil no GeoGuessr, acessível aos participantes e organizadores de torneios em comum. |

RF17–RF18 são entregas adicionais remanejáveis da Sprint 4. Ver [Perfil público](perfil-publico.md).

### Encerramento e ciclo posterior — decisão de 26/09/2026

Na S4-01, o organizador pode encerrar o torneio após o último dia, no fuso do torneio. O encerramento congela os resultados e bloqueia a edição. Os dados devem permanecer disponíveis por uma semana após o encerramento.

RF19 — requisito futuro, sem sprint definida: gerar relatório do torneio encerrado, enviá-lo aos participantes por e-mail e excluir o torneio para que deixe de aparecer na aplicação, respeitando a semana de disponibilidade. Refinar formato do relatório, destinatários, momento de execução, tratamento de falhas de envio e alcance da exclusão antes de implementar. Preservar pontuações pessoais compartilhadas com outros torneios. Até esse fluxo ser entregue, S4-01 mantém os torneios encerrados visíveis, inclusive depois da semana; não há envio nem exclusão automática nesta entrega.

## Requisitos não funcionais

Feedback de 03/10/2026, ainda em refinamento: FB05 detalha evolução de RF07/RF10 para resultados recentes e expansão por botão; FB06 detalha navegação de RF10/RNF04, indicação de carregamento e redução de espera a medir. Limites de exibição, alcance e meta de desempenho serão definidos antes da implementação. Pré-carregamento privado deve respeitar autenticação/autorização, inclusive revogação de acesso. Não altera o aceite das entregas anteriores. Histórias e critérios propostos em [Sprint 7](sprints/sprint-7.md).

| ID | Requisito |
| --- | --- |
| RNF01 | Somente usuários autenticados podem registrar resultados. |
| RNF02 | Jogadores só podem alterar lançamentos próprios dentro do prazo configurado. |
| RNF03 | Senhas devem ser tratadas pelo provedor de autenticação, sem armazenamento pela aplicação. |
| RNF04 | A interface deve funcionar em celular e computador. |
| RNF05 | Cálculos e alterações devem ser auditáveis. |
| RNF06 | O sistema não deve gerar ranking inválido quando um dia ainda não possuir pontuações válidas. |

## Regras de negócio

- **RN01:** A pontuação pessoal pertence ao jogador e não depende de participação em torneio.
- **RN02:** Ao incluir um jogador em um torneio em andamento, o sistema deve considerar suas pontuações pessoais desde o início do período do torneio, inclusive as anteriores à data de ingresso.
- **RN03:** O torneio pode usar pontuação absoluta (pontuação bruta) ou relativa ao menor resultado positivo do dia.
- **RN04:** Na modalidade relativa, pontos aplicados = pontuação bruta − menor pontuação bruta positiva do dia; a menor recebe zero.
- **RN05:** A penalidade por não jogar é configurável por torneio, inclusive podendo ser zero.
- **RN06:** Período, fuso fixo `America/Sao_Paulo` e regra de penalidade do torneio determinam quando uma ausência pode ser penalizada. Zero bruto representa ausência nos modos absoluto e relativo; zero aplicado ao menor resultado positivo é resultado válido.
- **RN07:** O ranking classifica a maior pontuação total em primeiro lugar.
- **RN08:** Uma alteração de regra não pode alterar silenciosamente resultados já consolidados; a regra aplicada deve permanecer registrada.
- **RN09:** Data fora dos dias semanais configurados ou excluída explicitamente não é dia de jogo e não gera pontuação nem penalidade.
- **RN10:** A auditoria identifica o par torneio/pontuação pessoal. Invalidar nesse contexto não apaga nem invalida a pontuação pessoal globalmente e não altera seus efeitos em outros torneios.
- **RN11:** A abertura da auditoria não constitui decisão de invalidez. A apuração é realizada pelo organizador após o período de avaliação; a maioria pela invalidez determina a invalidação no torneio em questão.
- **RN12:** A punição escolhida pelo organizador é alternativa: desconsiderar a contribuição da pontuação sem penalidade, ou substituí-la pela penalidade do dia. Não acumular as duas punições nem aplicar a mesma penalidade novamente ao repetir o processamento.
- **RN13:** O encerramento registra votos, totais apurados, responsável, data, decisão, punição e regra/valor da penalidade aplicada. Alterações de resultados decorrentes da auditoria devem manter rastreabilidade.

## Pendências de validação

Refinamento vigente da Sprint 5 em 03/10/2026: Dono do produto confirmou revisão retroativa explícita (RF09/RN08), zero como ausência também no absoluto e fuso fixo em São Paulo (RF04/RN06), retirando a configuração de fuso do requisito. A decisão substitui a inclusão anterior de múltiplos fusos e resolve as pendências de zero/datas entre fusos. [Planejamento](sprints/sprint-5.md) detalha propostas técnicas de prévia/confirmação, penalidade e calendário. Revisão de regras não concede edição de pontuação pessoal nem reabertura de encerrados.

- No recorte entregue, empates no menor positivo recebem zero relativo; envio/correção próprios são limitados ao dia atual em São Paulo, e o bruto aceita inteiros de 0 a 25.000, com zero tratado como ausência. Esses pontos não são pendências do MVP encerrado.
- Zero e fuso da Sprint 5 definidos em 03/10/2026: zero representa ausência e data/prazo pessoal permanecem em São Paulo, no mesmo fuso fixo de todos os torneios.
- Aceitação de lançamento tardio permanece futura; ver FB02 na avaliação abaixo.
- Para a auditoria futura, definir eleitores elegíveis, participação do auditado e do organizador, duração, quórum, base da maioria, empate, ausência de votos, alteração de voto, recurso/reabertura e efeitos provisórios no ranking. Detalhamento em [Auditoria por votação](auditoria-de-pontuacoes.md).

## Situação S4-02/S4-03 — 27/09/2026

RF10 — S4-03 publicada e aceita funcionalmente pelo Dono do produto em 27/09/2026: abas de torneios acessíveis, seleção persistida na URL, resultados próprios e ordenação diária decrescente. S4-02 também aceita após confirmação de persistência da data, ciclo de inclusão/remoção, restrições de acesso/edição e conclusão histórica. Ver [Sprint 4](sprints/sprint-4.md).

## Evolução S4-04/S4-05 — 27/09/2026

RF17/RF18 implementados, migrados, publicados e homologados pelo Dono do produto: nome público único, confirmação/edição pelo titular, link GeoGuessr opcional e exposição restrita ao torneio. Sprint 4 encerrada em 27/09/2026 com S4-01 a S4-05 aceitas. Carga complementar do Excel confirmada para 12 nomes e 11 URLs, preservando Martin. Critérios técnicos na ADR-002 e evidências na Sprint 4. RF19 permanece futuro e não integra este encerramento.

## Feedback em avaliação — 27/09/2026

O Dono do produto confirmou a prioridade de concluir o escopo planejado antes de acrescentar evoluções. Modo escuro (FB01), lançamento tardio com controle do organizador (FB02), métricas de desempenho para RF19 (FB03) e integração GeoGuessr (FB04) estão registrados na [avaliação do backlog](avaliacao-backlog-2026-09-27.md), com dependências, riscos e definições propostas. São candidatos sem compromisso de implementação ou sprint; o relatório amplia o detalhamento de RF19, sem duplicá-lo.


Complemento aprovado S5-04 (RF07/RF10, RNF04): resultados diários exibem inicialmente cinco dias disponíveis mais recentes, com Ver todos/Mostrar menos quando excederem cinco. Ranking considera todo o período elegível; expansão não altera totais, regras ou permissões. Nova seleção de torneio começa reduzida. Histórico pessoal e lista de torneios fora desse recorte. Implementação local, publicação/homologação pendentes.
