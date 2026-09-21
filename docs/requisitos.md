# Levantamento de requisitos

## Alocação para a primeira entrega — Sprint 3

Os requisitos abaixo preservam a visão completa do produto. O escopo vigente está no [plano da Sprint 3](sprints/sprint-3.md).

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

| ID | Requisito |
| --- | --- |
| RF01 | O sistema deve permitir cadastro e autenticação de usuários. |
| RF02 | Qualquer usuário deve poder criar, editar, encerrar e consultar os torneios que organiza. |
| RF03 | O organizador deve gerenciar os jogadores participantes de cada torneio. |
| RF04 | Um torneio deve possuir nome, período de início e fim, fuso horário e regras configuráveis. |
| RF05 | O jogador deve registrar sua pontuação bruta pessoal por dia, independentemente de participar de um torneio. |
| RF06 | O sistema deve calcular a pontuação aplicada segundo as regras vigentes. |
| RF07 | O sistema deve usar as pontuações pessoais dentro do período de cada torneio para exibir ranking diário, resultado do período e ranking acumulado. |
| RF08 | O organizador deve aprovar, corrigir ou invalidar lançamentos associados ao seu torneio. |
| RF09 | O sistema deve guardar o histórico da pontuação bruta, do resultado e da regra aplicada. |
| RF10 | O usuário deve visualizar a lista de todos os torneios dos quais participa e acessar os respectivos detalhes e rankings. |
| RF11 | O organizador deve configurar os dias da semana em que o torneio ocorre, com as opções padrão de segunda a sexta ou segunda a sexta mais domingos. |
| RF12 | O organizador deve excluir datas específicas do calendário do torneio, como feriados. |
| RF13 | O organizador deve poder marcar uma pontuação como sujeita a auditoria no seu torneio, com período de avaliação registrado. |
| RF14 | Os demais usuários elegíveis devem poder votar pela invalidação ou manutenção da pontuação durante o período de avaliação. |
| RF15 | Após o período de avaliação, o organizador deve poder apurar e encerrar a votação; havendo maioria pela invalidez, a pontuação deve ser invalidada apenas no torneio que abriu a auditoria. |
| RF16 | Ao aplicar a decisão de invalidez, o organizador deve escolher entre desconsiderar a pontuação ou aplicar a penalidade do dia, preservando votos, apuração, decisão e punição para consulta histórica. |

| RF17 | O jogador deve escolher e editar um nome público único em toda a plataforma, independente do e-mail, exibido aos competidores sem usar o e-mail como alternativa. |
| RF18 | O jogador deve poder cadastrar, editar e remover a URL opcional do perfil no GeoGuessr, acessível aos participantes e organizadores de torneios em comum. |

RF17–RF18 previstos para a Sprint 4. Ver [Perfil público](perfil-publico.md).

## Requisitos não funcionais

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
- **RN06:** Período, fuso horário e regra de penalidade do torneio determinam quando uma ausência pode ser penalizada.
- **RN07:** O ranking classifica a maior pontuação total em primeiro lugar.
- **RN08:** Uma alteração de regra não pode alterar silenciosamente resultados já consolidados; a regra aplicada deve permanecer registrada.
- **RN09:** Data fora dos dias semanais configurados ou excluída explicitamente não é dia de jogo e não gera pontuação nem penalidade.
- **RN10:** A auditoria identifica o par torneio/pontuação pessoal. Invalidar nesse contexto não apaga nem invalida a pontuação pessoal globalmente e não altera seus efeitos em outros torneios.
- **RN11:** A abertura da auditoria não constitui decisão de invalidez. A apuração é realizada pelo organizador após o período de avaliação; a maioria pela invalidez determina a invalidação no torneio em questão.
- **RN12:** A punição escolhida pelo organizador é alternativa: desconsiderar a contribuição da pontuação sem penalidade, ou substituí-la pela penalidade do dia. Não acumular as duas punições nem aplicar a mesma penalidade novamente ao repetir o processamento.
- **RN13:** O encerramento registra votos, totais apurados, responsável, data, decisão, punição e regra/valor da penalidade aplicada. Alterações de resultados decorrentes da auditoria devem manter rastreabilidade.

## Pendências de validação

- Confirmar se empates na menor pontuação relativa recebem zero para todos os empatados.
- Definir prazo exato para o envio de pontuação e se o organizador pode aceitar lançamento tardio.
- Definir se a pontuação absoluta deve aceitar zero e quais limites de pontuação serão válidos.
- Para a auditoria futura, definir eleitores elegíveis, participação do auditado e do organizador, duração, quórum, base da maioria, empate, ausência de votos, alteração de voto, recurso/reabertura e efeitos provisórios no ranking. Detalhamento em [Auditoria por votação](auditoria-de-pontuacoes.md).
