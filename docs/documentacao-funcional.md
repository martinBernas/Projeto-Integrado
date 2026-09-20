# Documentação funcional — GeoGuaras

## 1. Identificação do projeto

| Campo | Descrição |
| --- | --- |
| Nome | GeoGuaras |
| Objetivo | Registrar pontuações pessoais de GeoGuessr e administrar torneios configuráveis. |
| Público-alvo | Jogadores de GeoGuessr e usuários que organizam torneios. |
| Plataforma | Aplicação web responsiva. |
| Versão do documento | 1.3 — Redistribuição em sete sprints (20/09/2026) |

## 2. Visão funcional

**Recorte da primeira entrega:** a Sprint 3 entrega um torneio GeoGuaras pré-instanciado, participantes provisionados, pontuação pessoal, cálculo relativo e ranking. Criação/administração de torneios, configuração de regras e demais funções de organização descritas abaixo representam a visão futura do produto, não o aceite desta sprint. O [plano da Sprint 3](sprints/sprint-3.md) define o escopo vigente e as decisões operacionais pendentes.

O GeoGuaras permite que cada usuário mantenha seu histórico pessoal de pontuações. Os torneios usam esse histórico para formar seus rankings dentro de um período definido. Assim, quando um jogador entra em um torneio já iniciado, suas pontuações anteriores ao ingresso, mas pertencentes ao período do torneio, também são consideradas.

Qualquer usuário pode criar e organizar torneios. O organizador define participantes, período, fuso horário, calendário de dias de jogo, modo de cálculo e penalidade de ausência. Participantes visualizam os torneios de que fazem parte e seus rankings.

## 3. Módulos do sistema

| Módulo | Finalidade | Funções principais | Usuários |
| --- | --- | --- | --- |
| Autenticação e perfil | Identificar e proteger o acesso dos usuários. | Cadastro, login, encerramento de sessão e perfil. | Todos os usuários. |
| Pontuações pessoais | Registrar o histórico individual, independente de torneios. | Criar, consultar e alterar pontuação própria dentro do prazo permitido. | Jogador. |
| Torneios | Criar e administrar competições. | Criar, editar, encerrar e consultar torneio. | Organizador. |
| Participantes | Controlar quem participa de cada torneio. | Adicionar, remover e listar participantes. | Organizador; visualização para participante. |
| Configuração de regras | Definir como o torneio calcula resultados. | Escolher pontuação absoluta ou relativa, penalidade, período, fuso e calendário. | Organizador. |
| Calendário | Determinar os dias válidos de jogo. | Selecionar segunda a sexta ou segunda a sexta mais domingos; excluir feriados. | Organizador. |
| Cálculo e ranking | Transformar resultados em classificação. | Aplicar regras, calcular totais e ordenar maior pontuação primeiro. | Sistema; visualização para participantes. |
| Auditoria | Preservar a explicação dos resultados. | Registrar pontuação bruta, regra aplicada, resultado e alterações. | Organizador. |
| Auditoria por votação (Sprint 6) | Avaliar a validade de uma pontuação em um torneio. | Abrir avaliação, votar, apurar e aplicar invalidação ou penalidade restrita ao torneio. | Organizador e eleitores elegíveis. |

## 4. Fluxos funcionais principais

### 4.1 Registrar pontuação pessoal

1. O usuário autenticado informa sua pontuação e a data/hora do resultado.
2. O sistema valida se o lançamento pertence ao usuário e está no prazo permitido.
3. O sistema salva a pontuação no histórico pessoal.
4. Torneios dos quais o usuário participa recalculam ou atualizam seus resultados conforme as regras vigentes.

### 4.2 Criar e configurar torneio

1. O usuário cria um torneio e se torna seu organizador.
2. Informa nome, início, fim e fuso horário.
3. Escolhe o calendário: segunda a sexta ou segunda a sexta mais domingos.
4. Opcionalmente exclui datas, como feriados.
5. Escolhe o modo absoluto ou relativo ao menor resultado positivo do dia.
6. Define a penalidade por ausência.
7. Adiciona os participantes.

### 4.3 Consultar torneios e ranking

1. O usuário acessa sua lista de torneios participantes.
2. Seleciona um torneio.
3. O sistema exibe período, regras, participantes, resultados e ranking.
4. A classificação posiciona a maior pontuação total em primeiro lugar.

## 5. Regras funcionais resumidas

### Auditoria futura por votação

O organizador marca uma pontuação para avaliação no seu torneio. Os demais usuários elegíveis votam pela invalidação ou manutenção. Após o período de avaliação, o organizador apura os votos; se a maioria optar pela invalidez, escolhe desconsiderar a pontuação ou aplicar a penalidade do dia. A decisão não altera a pontuação pessoal nem seus efeitos em outros torneios. O fluxo, os critérios de aceite e as decisões ainda abertas estão em [Auditoria de pontuações](auditoria-de-pontuacoes.md). Esta funcionalidade está prevista para a Sprint 6 e não integra a Sprint 3.

| ID | Regra |
| --- | --- |
| RN01 | A pontuação pertence ao jogador, não ao torneio. |
| RN02 | Participante incluído depois tem pontuações do início do período consideradas. |
| RN03 | O modo do torneio pode ser absoluto ou relativo ao menor. |
| RN04 | No modo relativo, menor pontuação positiva recebe zero e as demais recebem a diferença. |
| RN05 | Penalidade de ausência é configurável por torneio. |
| RN06 | Período e fuso horário determinam o momento de avaliação da ausência. |
| RN07 | Maior total ocupa a primeira posição no ranking. |
| RN09 | Datas fora do calendário ou excluídas não geram pontuação nem penalidade. |

As regras completas estão em [Regras de pontuação](regras-de-pontuacao.md) e os requisitos rastreáveis em [Requisitos](requisitos.md).

## 6. Controle de versão da documentação

A revisão 1.3 redistribui o escopo futuro: Sprint 4 para torneios e participantes, Sprint 5 para regras e calendário, Sprint 6 para auditoria por votação e Sprint 7 para moderação e evolução. O escopo da Sprint 3 permanece inalterado. A distribuição ainda depende de estimativas e capacidade para confirmar o equilíbrio de esforço.

A revisão 1.1 registra o novo recorte de entrega e não significa que o software já foi implementado. O [histórico da documentação](historico.md) resume os marcos; os commits do Git preservam as diferenças completas. Ao encerrar a sprint, registrar o hash efetivamente entregue e as evidências, sem antecipar aprovação ou publicação.

A revisão 1.2 acrescenta auditoria por votação ao escopo futuro, conforme solicitado pelo Dono do produto, preservando o escopo da Sprint 3.

A documentação deve permanecer no repositório Git junto com o código. Cada alteração deve ser feita em uma branch, revisada por pull request e registrada com mensagem de commit clara. Isso preserva o histórico de decisões, permite recuperar versões anteriores e mantém toda a equipe alinhada com os requisitos e regras vigentes.

## 7. Documentos relacionados

- [Plano de ação](plano-de-acao.md)
- [Requisitos](requisitos.md)
- [Regras de pontuação](regras-de-pontuacao.md)
- [Plano de testes](plano-de-testes.md)
- [Diagrama de classes](diagramas/classes.md)

