# Levantamento de requisitos

## Papéis de usuário

- **Jogador:** autentica-se, registra sua própria pontuação e consulta rankings.
- **Organizador:** qualquer usuário pode criar e administrar seus próprios torneios, incluindo jogadores participantes, período e regras. Um mesmo usuário pode organizar um torneio e jogar em outros.

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

## Pendências de validação

- Confirmar se empates na menor pontuação relativa recebem zero para todos os empatados.
- Definir prazo exato para o envio de pontuação e se o organizador pode aceitar lançamento tardio.
- Definir se a pontuação absoluta deve aceitar zero e quais limites de pontuação serão válidos.
