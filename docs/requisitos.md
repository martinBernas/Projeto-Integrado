# Levantamento de requisitos

18/10/2026 — RF21 implementado localmente após autorização do Dono do produto: média própria aplicada comparada à conjunta dos demais, gráfico/tabela e próprias contagens em tela do torneio, apenas dias encerrados. Sem nova migração; regras/privacidade refinadas preservadas. 98 testes, lint, TypeScript e build aprovados. Publicação/homologação/aceite ainda não confirmados. [Sprint 7](sprints/sprint-7.md).

18/10/2026 — Refinamento vigente de RF21: prioridade ao desempenho próprio no torneio selecionado, comparado à média conjunta dos demais participantes, sem médias individuais de terceiros. Somente dias encerrados; médias sobre pontos aplicados incluindo ausências. Contagens próprias de primeiro/último somente entre resultados positivos válidos (zero aplicado válido do relativo incluído), com empates/participante único preservados. Decisões substituem pendências anteriores correspondentes; fórmulas e limites em [Estatísticas](estatisticas.md#rf21--refinamento-vigente-de-18102026) e [Sprint 7](sprints/sprint-7.md). Implementação não iniciada.

18/10/2026 — Planejamento da Sprint 7 prioriza RF21 por escolha do Dono do produto. Agregação, dia atual e conjunto da classificação seguem em refinamento, sem implementação iniciada. RF08/FB02 e histórico avançado mantidos no backlog; RF20 não será reimplementado. [Escopo e critérios propostos](sprints/sprint-7.md).

18/10/2026 — Decisão do Dono do produto: preparação histórica removida do fluxo normal. Ausência/zero seguem a regra em dias elegíveis encerrados sem conclusão manual; dia atual permanece provisório. Criação/participação e encerramento deixam de exigir preparação. Substitui as regras anteriores que condicionavam penalidades a histórico pronto. Implementação local e migração incremental preparadas, sem execução remota. Retirada pontual do torneio de teste também autorizada. Ver [manutenção após Sprint 6](sprints/manutencao-pos-sprint-6.md).

11/10/2026 — RF13–RF16 implementados localmente após aprovação das regras: pedido por participante, aprovação pelo organizador, votação secreta de 48 horas, apuração manual e punição/recálculo restritos ao torneio. Eleitorado da abertura exclui auditado; maioria dos votos recebidos sem quórum; empate/nenhum voto mantém pontuação. [Sprint 6](sprints/sprint-6.md) e [ADR-006](decisoes/adr-006-auditoria-por-votacao.md). Migração remota, publicação, homologação e aceite pendentes.

Definição funcional vigente S5: um torneio aberto tem uma única regra aplicada a todo o período. Início/fim podem mudar juntamente com a configuração, mediante prévia de impacto e confirmação. Versões anteriores são histórico, sem revisões parciais nem programação independente de regra futura. Encerrados não permitem edição; brutos permanecem intactos. Migração executada/verificada e cenários relatados homologados pelo Dono do produto. Identificação formal da versão publicada não fornecida. [ADR-004](decisoes/adr-004-regra-unica-por-torneio.md).

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
| RF13 | Qualquer jogador participante do torneio deve poder solicitar auditoria de uma pontuação daquele torneio, com justificativa obrigatória. O sistema registra solicitante, data, justificativa, torneio e pontuação. O organizador aprova o pedido antes de abrir a votação; o período de avaliação de 48 horas começa na abertura. |
| RF14 | Os demais usuários elegíveis devem poder votar pela invalidação ou manutenção da pontuação durante o período de avaliação. Os votos são secretos: cada eleitor consulta seu próprio voto, sem exposição da autoria dos outros votos a jogadores ou organizador. O sistema preserva autoria internamente para rastreabilidade e permite consultar o resultado agregado da apuração. |
| RF15 | Após o período de avaliação, o organizador deve poder consultar os totais para invalidar/manter e o resultado antes de escolher punição e confirmar o encerramento. A consulta não altera o ranking; havendo maioria pela invalidez, a confirmação invalida a pontuação apenas no torneio que abriu a auditoria. Empate ou nenhum voto mantém a pontuação sem punição. |
| RF16 | Ao aplicar a decisão de invalidez, o organizador deve escolher entre desconsiderar a pontuação ou aplicar a penalidade do dia, preservando votos, apuração, decisão e punição para consulta histórica. |

| RF17 | O jogador deve escolher e editar um nome público único em toda a plataforma, independente do e-mail, exibido aos competidores sem usar o e-mail como alternativa. |
| RF18 | O jogador deve poder cadastrar, editar e remover a URL opcional do perfil no GeoGuessr, acessível aos participantes e organizadores de torneios em comum. |
| RF20 | O jogador deve consultar estatísticas pessoais com pontuação bruta média diária, média por jogo e gráfico de desempenho ao longo do tempo, em tela separada do painel principal. |
| RF21 | Em tela própria do torneio autorizado, o jogador deve consultar principalmente seu desempenho: média aplicada própria, comparação com média conjunta dos demais, gráfico de evolução e próprias contagens de primeiro/último. Somente dias encerrados; médias incluem ausências, contagens consideram apenas resultados positivos válidos. Não expor médias individuais identificadas de terceiros. |

RF17–RF18 são entregas adicionais remanejáveis da Sprint 4. Ver [Perfil público](perfil-publico.md).

### Encerramento e ciclo posterior — decisão de 26/09/2026

Na S4-01, o organizador pode encerrar o torneio após o último dia, no fuso do torneio. O encerramento congela os resultados e bloqueia a edição. Os dados devem permanecer disponíveis por uma semana após o encerramento.

RF19 — requisito futuro, sem sprint definida: gerar relatório do torneio encerrado, enviá-lo aos participantes por e-mail e excluir o torneio para que deixe de aparecer na aplicação, respeitando a semana de disponibilidade. Refinar formato do relatório, destinatários, momento de execução, tratamento de falhas de envio e alcance da exclusão antes de implementar. Preservar pontuações pessoais compartilhadas com outros torneios. Até esse fluxo ser entregue, S4-01 mantém os torneios encerrados visíveis, inclusive depois da semana; não há envio nem exclusão automática nesta entrega.

## Requisitos não funcionais

### Estatísticas pessoais e de torneio — pedido de 11/10/2026

RF20–RF21 registrados por solicitação do Dono do produto, a partir de pedidos dos usuários. Escopo confirmado: métricas pessoais, métricas do torneio e telas separadas, sem acrescentar indicadores ou gráficos ao painel principal. Requisitos futuros, sem sprint de implementação definida. Detalhamento e critérios em [Estatísticas](estatisticas.md); candidato a refinamento na [Sprint 7](sprints/sprint-7.md). Independentes do relatório por e-mail de RF19.

Cada pontuação diária é composta por cinco jogos, cada um de 0 a 5.000 pontos, totalizando de 0 a 25.000 pontos brutos. Para N dias considerados, a média bruta diária é a soma dos totais brutos dividida por N; a média por jogo é a mesma soma dividida por 5 × N. A média por jogo pode ser derivada do total diário, sem exigir lançamento individual dos cinco jogos. Definições confirmadas pelo Dono do produto em 11/10/2026: dropdown pessoal com “últimos 5 dias”, “últimos 30 dias” e “desde o início”, aplicado às médias e ao gráfico; médias pessoais consideram somente dias com bruto positivo, excluindo zero/ausências; média do torneio usa sempre pontuação aplicada e inclui ausências no denominador; médias exibidas sem casas decimais com arredondamento aritmético padrão apenas no resultado final. Seleção inicial: “últimos 5 dias”, correspondendo aos cinco dias mais recentes com bruto positivo. “Últimos 30 dias” abrange hoje e os 29 dias anteriores em America/Sao_Paulo. Contagens pela pontuação aplicada incluem todos os empatados nos extremos e participante único nas duas estatísticas. Agregação do torneio e classificação de ausentes/auditorias permanecem em refinamento conforme o documento de estatísticas.

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
- Refinamento de auditoria concluído em 11/10/2026: eleitorado, prazo, maioria, sigilo e efeitos definidos pelo Dono do produto; recurso/reabertura excluídos desta sprint. Homologar fluxo completo e restrições técnicas adicionais no remoto. [Auditoria por votação](auditoria-de-pontuacoes.md).

## Situação S4-02/S4-03 — 27/09/2026

RF10 — S4-03 publicada e aceita funcionalmente pelo Dono do produto em 27/09/2026: abas de torneios acessíveis, seleção persistida na URL, resultados próprios e ordenação diária decrescente. S4-02 também aceita após confirmação de persistência da data, ciclo de inclusão/remoção, restrições de acesso/edição e conclusão histórica. Ver [Sprint 4](sprints/sprint-4.md).

## Evolução S4-04/S4-05 — 27/09/2026

RF17/RF18 implementados, migrados, publicados e homologados pelo Dono do produto: nome público único, confirmação/edição pelo titular, link GeoGuessr opcional e exposição restrita ao torneio. Sprint 4 encerrada em 27/09/2026 com S4-01 a S4-05 aceitas. Carga complementar do Excel confirmada para 12 nomes e 11 URLs, preservando Martin. Critérios técnicos na ADR-002 e evidências na Sprint 4. RF19 permanece futuro e não integra este encerramento.

## Feedback em avaliação — 27/09/2026

O Dono do produto confirmou a prioridade de concluir o escopo planejado antes de acrescentar evoluções. Modo escuro (FB01), lançamento tardio com controle do organizador (FB02), métricas de desempenho para RF19 (FB03) e integração GeoGuessr (FB04) estão registrados na [avaliação do backlog](avaliacao-backlog-2026-09-27.md), com dependências, riscos e definições propostas. São candidatos sem compromisso de implementação ou sprint; o relatório amplia o detalhamento de RF19, sem duplicá-lo.


Complemento aprovado S5-04 (RF07/RF10, RNF04): resultados diários exibem inicialmente cinco dias disponíveis mais recentes, com Ver todos/Mostrar menos quando excederem cinco. Ranking considera todo o período elegível; expansão não altera totais, regras ou permissões. Nova seleção de torneio começa reduzida. Histórico pessoal também exibe cinco lançamentos recentes com expansão/redução independente, dentro dos até 100 registros consultados. Lista de torneios fora desse recorte. Implementação local e funcionamento de S5-04 confirmado pelo Dono do produto; identificação da versão/ambiente não informada.

03/10/2026 — S5-05 autorizada: investigar primeira abertura/troca lenta e aviso intermitente. Carregamento, nova tentativa explícita e métricas sem dados pessoais implementados localmente; causa remota não confirmada. Sem migração. Publicação, linha de base e homologação pendentes. Ver seção 11 da Sprint 5 e ADR-005.

11/10/2026 — Decisões adicionais confirmadas pelo Dono do produto para RF20–RF21: opção inicial “últimos 5 dias”; média pessoal somente dos dias jogados (bruto positivo); contagens de colocação pela pontuação aplicada, com todos os empatados na primeira/última recebendo a contagem e participante único contando nas duas; denominador zero não exibe dados da métrica. Estatísticas individuais restritas ao próprio perfil, inclusive próprias contagens na tela de torneio; média agregada permanece disponível conforme acesso ao torneio. Visualização de estatísticas de outros jogadores é requisito futuro, sem sprint definida. Substitui pendências anteriores correspondentes; limites temporais do filtro e classificação de ausentes/auditorias ainda exigem refinamento. Ver [Estatísticas](estatisticas.md). Entrega documental, sem implementação ou operação remota; revisão e git diff --check.

11/10/2026 — Dono do produto definiu “últimos 5 dias” de RF20 como os cinco dias mais recentes com valor, isto é, bruto positivo conforme a regra confirmada de zero como ausência. Não são cinco dias corridos: ignorar zero e dias sem lançamento, buscando os cinco dias jogados mais recentes; se houver menos de cinco, usar todos os disponíveis. Seleção aplicada às médias e ao gráfico pessoal. Substitui a pendência anterior sobre esse período; definição de “último mês” permanece em refinamento. Critério futuro: validar intervalos sem jogo, zeros e menos de cinco registros positivos. Entrega documental, sem implementação ou execução remota; revisão e git diff --check. Ver [Estatísticas](estatisticas.md).

11/10/2026 — Dono do produto definiu o período antes chamado “último mês” como “últimos 30 dias”, substituindo o rótulo e encerrando essa pendência. Janela de 30 dias corridos (hoje e os 29 dias anteriores, em America/Sao_Paulo), aplicada às médias e ao gráfico pessoal; apenas dias jogados entram nas médias. Opções vigentes: “últimos 5 dias”, “últimos 30 dias” e “desde o início”. Registros anteriores com “último mês” são históricos e substituídos por esta definição. Critérios futuros incluem limites de inclusão/exclusão, viradas de mês/ano e zero/ausências. Ver [Estatísticas](estatisticas.md). Revisão documental local; git diff --check, sem implementação, teste funcional ou operação remota.

## RF20 — incluído e implementado na Sprint 6 em 11/10/2026

O Dono do produto autorizou incluir RF20 na Sprint 6 (S6-04). Implementação local concluída: acesso “Minhas estatísticas” no painel, tela própria `/dashboard/statistics`, médias bruta diária e por jogo, gráfico cronológico e tabela acessível. RF21 permanece futuro, em refinamento. Este registro substitui as referências anteriores a RF20 sem sprint/entrega apenas documental, que passam a ser históricas. Publicação, homologação e aceite de RF20 ainda não confirmados; não há migração adicional.

Períodos aprovados: cinco dias positivos mais recentes (padrão), últimos 30 dias corridos (hoje e 29 anteriores em São Paulo) e histórico até hoje. Médias e gráfico usam somente bruto positivo; zero e ausência não contam como jogos. Cada dia equivale a cinco jogos; cada média é arredondada apenas após sua própria divisão. Auditorias de torneio não alteram a fonte pessoal. Sem positivos: mensagem, sem indicadores ou gráfico fictício. Erro de qualquer página: tentar novamente, sem médias parciais.

Consulta no servidor restrita à identidade autenticada e às políticas RLS existentes; nenhum parâmetro permite escolher outro perfil. Paginação por cursor na data única por jogador até página vazia, sem limite total de 100 registros; últimos cinco para ao completar cinco positivos. Tamanho solicitado de até 200 registros, tolerando teto remoto inferior. Sem novas tabelas, RPCs, permissões, dependências ou mutações. Gráfico SVG com escala diária 0–25.000 e distâncias proporcionais às datas; tabela completa expansível e rolagem horizontal acessível. Estratégia de consulta e apresentação são escolhas técnicas; fórmulas e períodos foram confirmados pelo Dono do produto.

Validação local: suíte de 86 testes aprovada; RLS real em PGlite, 257 positivos sob teto remoto de 37 por página, últimos cinco sob teto de dois, médias/arredondamento, fronteiras de 30 dias/ano bissexto, isolamento entre contas/anônimo, erro intermediário e renderização. Lint e build aprovados; apresentação revalidada após corrigir títulos dos pontos SVG. Homologação visual de RF20 no computador/celular/teclado ainda pendente. Não houve operação remota de RF20.

Limitações: custo de consultas, memória e renderização proporcional ao histórico; leitura paginada não é snapshot transacional e correções concorrentes podem exigir recarga. Sem atualização em tempo real. A apuração das auditorias mantém seu prazo e roteiro; não há aceite global da Sprint 6.

## Novo requisito — detalhamento dos jogos (11/10/2026)

RF22 — O jogador deve poder fornecer, como alternativa ao total bruto de RF05, o texto dos cinco jogos e do Total com país, pontos, distância, tempo e passos, conforme exemplo em [Estatísticas](estatisticas.md). Manter lançamento simples e permissões/prazo vigentes.

RF23 — O jogador deve consultar nas estatísticas pessoais países de melhor e pior desempenho e estatísticas de tempo médio, a partir dos jogos detalhados de RF22. Fórmulas, empates, cobertura e tratamento de dados incompletos/divergentes permanecem em refinamento; propostas em [Estatísticas](estatisticas.md).

Pedido relatado pelo Dono do produto; requisitos futuros sem sprint definida. RF23 amplia RF20, sem alterar o escopo já implementado. Dados antigos sem detalhes não permitem derivar essas métricas. O exemplo contém distância total de 6.164 km versus soma de 6.165 km; definir tratamento explícito antes de implementar.

## RF24 — métricas operacionais persistentes (11/10/2026)

O sistema deve guardar uma amostra mínima de tempos e falhas do painel para análise posterior ao uso semanal, com consulta/exportação restrita, retenção e volume limitados e coleta cuja falha não impeça as funções da aplicação. Pedido do Dono do produto registrado para futuras sprints; armazenamento, custo, retenção e critérios finais dependem de refinamento. [Escopo e critérios propostos](metricas-operacionais.md). Entrega exclusivamente documental, sem implementação ou alteração da arquitetura atual.
