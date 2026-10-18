# Sprint 7 — Estatísticas do torneio

## Entrega local vigente — 18/10/2026

O Dono do produto autorizou a implementação (“implemente”). S7-00, S7-04a e S7-04b concluídas localmente; Sprint 7 em homologação, sem publicação/aceite confirmados. Isso substitui as referências abaixo a implementação não iniciada e desenhos ainda apenas propostos. Datas de janela/capacidade não foram acordadas e não são inferidas da execução técnica.

Acesso **Estatísticas do torneio** no painel do torneio selecionado; rota `/dashboard/tournaments/[id]/statistics`. Tela destaca média própria e conjunta dos demais, próprias contagens de primeiro/último e gráfico comparativo diário com tabela expansível. Período completo até ontem, sem filtros adicionais. Somente resultados de dias encerrados, dentro de período/elegibilidade, sem excluídos, pendentes ou provisórios. Médias incluem ausência e sanções; contagens apenas jogos positivos válidos, incluindo zero aplicado relativo. Todos os empatados contam; único válido conta nos dois extremos. Sem denominador ou próprio vínculo, não inventar métricas. Organizador sem participação recebe agregado dos participantes.

Escolha técnica: reutilizar `get_tournament_dashboard` com sessão e UUID validados; cálculo no servidor recebe a identidade autenticada, sem aceitar outro perfil por URL. Consulta retorna resultados completos como JSON; sem limite silencioso de 100/1.000 linhas no período. Encerrados usam resultados armazenados, sem reconstrução por bruto atual. Apenas série/contagens próprias e média/quantidade agregadas dos demais são renderizadas. Sem novo SQL, esquema, grant, dependência ou mudança de cálculo do torneio. RPC de leitura mantém seu refresh/transação existente para abertos. [Arquitetura/decisão](../decisoes/adr-009-estatisticas-do-torneio.md) e [fluxo](../diagramas/estatisticas-torneio.md).

S7-00: diagnóstico reproduziu falha `EPERM` de realpath de links pnpm no sandbox Windows, levando a resolução incompleta dos tipos Supabase. TypeScript e build fora dessa restrição passaram **sem alterar código de autenticação, dependências, casts ou opções de validação**. Não era necessário “corrigir” os contratos do cliente. Essa evidência substitui o entendimento anterior de que havia erro de tipagem confirmado do projeto. Manter registros anteriores como diagnóstico histórico.

Validação: **98 testes aprovados**, zero falhas/pulados, lint dos arquivos alterados, TypeScript e build de produção aprovados. Testes incluem exemplo 4.750/4.167, ponderação/elegibilidade, empates/único válido/sem válidos, zero relativo, ausência/sanções, hoje/futuro, vazio/organizador sem participação e sigilo. PGlite pela RPC: período com mais de mil dias, acesso anônimo/revogado negado e resultados congelados preservados após mudança do bruto. Renderização usa identidade da sessão e não inclui nome/id individual dos demais. Prévia visual com dados fictícios inspecionada no navegador, tabela expandida e largura móvel sem transbordamento horizontal; não equivale a homologação autenticada. Sem consulta/operação no ambiente remoto.

Limites: custo de leitura/memória/gráfico/tabela proporcional ao histórico; sem realtime ou filtros adicionais. Comparação pode ter base diferente por dia conforme elegibilidade; média geral é ponderada e não a média simples dos pontos do gráfico. Recarregar após resultados/decisões. Pendências: publicar interface, registrar versão/ambiente e homologar com dados reais, celular/teclado e aceite do Dono do produto conforme [operação S7](sprint-7-operacao.md). Nenhuma migração ou backup novo necessário/executado nesta entrega.

## Planejamento vigente — 18/10/2026

O Dono do produto escolheu **priorizar estatísticas do torneio**. Sprint 6 encerrada; manutenção posterior removeu a preparação histórica e o torneio de teste, com execução e validação relatadas. A Sprint 7 está em planejamento/refinamento; prioridade confirmada não equivale a autorização de implementação, prazo ou capacidade acordados. Os registros antigos abaixo são históricos e não representam o compromisso atual.

**Objetivo refinado:** permitir que o jogador acompanhe principalmente seu desempenho no torneio selecionado, comparando sua média aplicada com a média conjunta dos demais participantes, além de suas próprias contagens de primeiro/último lugar, em tela separada do painel.

## Escopo e limites

- RF21 em tela própria, acessível a partir do torneio selecionado; identificar nome, período e regra do torneio.
- Destaque para média aplicada do próprio jogador e comparação com a média conjunta dos demais participantes, excluindo o próprio jogador desse grupo. Médias incluem ausências. Gráfico cronológico e tabela acessível explicam a base de cálculo.
- Próprias contagens de primeiro e último lugar; não expor métricas individuais dos demais jogadores, conforme privacidade já confirmada em RF21.
- Respeitar calendário, datas excluídas, elegibilidade, sanções/decisões de auditoria e resultados congelados dos encerrados. Sem etapa de preparação histórica.
- Médias sem casas decimais, arredondadas somente ao exibir; denominador zero apresenta ausência de dados. Média válida igual a zero continua sendo exibida.
- Empates contam para todos os empatados; participante único conta em primeiro e último. Definição anterior preservada, sujeita à regra de quem integra a classificação diária.
- Somente dias encerrados: datas anteriores a hoje em America/Sao_Paulo, dentro do calendário e período do torneio. Hoje e datas futuras não entram em médias, gráfico ou contagens.
- Primeiro/último considera somente quem tem bruto positivo válido (resultado de jogo, sem invalidação); ausência, bruto zero, contribuição desconsiderada e penalidade por auditoria não concorrem. Zero aplicado válido no relativo permanece na classificação.
- Proposta de primeira entrega: período completo do torneio até ontem, respeitando início/fim e elegibilidade, sem novos filtros de data.

Fora do escopo proposto: aprovação/correção de lançamentos (antiga S7-01/FB02), histórico avançado (antiga S7-02), consulta de estatísticas individuais de terceiros, texto dos cinco jogos e métricas por país/tempo (RF22–RF23), relatório/e-mail/exclusão automática (RF19), integração GeoGuessr e persistência de métricas operacionais (RF24). Permanecem no backlog, sem descarte e sem nova sprint assumida.

Não reimplementar RF20, resultados recentes/expansão ou feedback de carregamento, já entregues nas Sprints 5/6. O histórico pessoal do painel ainda consulta até 100 registros; a consulta integral de RF20 é separada. Limite do painel não deve truncar nem definir as estatísticas do torneio.

## Histórias candidatas e ordem

Estimativas relativas iniciais são propostas técnicas, não horas, prazo ou capacidade confirmada. Selecionar compromisso após o refinamento e a capacidade; não assumir que a soma cabe em uma sprint.

| Ordem / história | Entrega proposta | Estimativa inicial | Dependência |
| --- | --- | --- | --- |
| 1 / S7-00 | Diagnosticar e corrigir erros locais de tipagem do cliente Supabase; obter TypeScript e build aprovados sem dispensar checagens. | 3 pontos, a revisar após diagnóstico | Base de validação; não alterar regras de negócio para contornar os erros. |
| 2 / S7-04a | Cálculo autorizado de RF21: média própria, média conjunta dos demais, séries diárias e próprias contagens, com exemplos conciliados e consulta integral do período. | 5 pontos, a revisar após desenho técnico | Decisões funcionais abaixo; avaliar necessidade de RPC/migração. |
| 3 / S7-04b | Tela do torneio, gráfico/tabela, navegação, mensagens de vazio/erro e homologação. | 5 pontos, a revisar após desenho | S7-04a; inclui integração, testes e documentação. |

RF21 recebe S7-04 para preservar o significado das histórias S7-01–S7-03 do planejamento histórico. Não há implementação iniciada. Sem necessidade de novos custos ou serviços assumida. Se capacidade insuficiente, reduzir o compromisso antes da execução, preservando uma entrega funcional e testável.

## Decisões confirmadas em 18/10/2026

O Dono do produto definiu foco principal no desempenho do jogador conectado no torneio selecionado e comparação com a **média conjunta dos demais**, sem médias individuais identificadas de terceiros. Confirmou somente dias encerrados, somente resultados positivos válidos nas contagens de colocação e inclusão de ausências nas duas médias, com pontos aplicados. Exemplo aprovado: 12.000 e −2.500 resultam em média própria de 4.750.

### Fórmulas e exemplos de aceite

- **Média própria:** soma dos pontos aplicados do jogador / quantidade de seus dias elegíveis encerrados no período. Inclui dias de ausência e efeitos de sanções aplicadas, sem reescrever o bruto pessoal.
- **Média conjunta dos demais:** soma dos pontos aplicados dos outros participantes / quantidade total de participações elegíveis por dia desse grupo. Não incluir o jogador conectado na soma ou no denominador. Não usar média simples de médias individuais quando os participantes têm quantidades diferentes de dias elegíveis.
- **Gráfico proposto:** por dia encerrado, série do próprio jogador com seu resultado aplicado e série de referência com a média aplicada dos demais naquele dia. Lacuna sem elegibilidade/base não vira zero fictício. Valor próprio diário é resultado aplicado, enquanto a referência é média do grupo; rotular as duas séries com clareza. Esse desenho das séries é proposta de apresentação, não uma nova confirmação específica do Dono do produto.
- **Primeiro/último:** comparar pontos aplicados apenas entre resultados de jogo com bruto positivo e ainda válidos. Menor positivo relativo com aplicação zero continua válido. Excluir ausência, bruto zero, desconsideração e penalidade por auditoria. Todos os empatados nos extremos recebem contagem; com um único resultado válido, seu jogador conta nas duas; sem válidos, ninguém recebe contagem.
- **Sem denominador:** não exibir média/gráfico fictício. Sem outros participantes com dias elegíveis, informar que não há base de comparação. Organizador sem participação pode acessar média conjunta dos participantes autorizados, mas não recebe média/contagens próprias inventadas.
- **Arredondamento:** médias sem casas decimais, somente após a divisão final. Manter dados originais para cálculos e pontos do gráfico.

Exemplos: próprio jogador com 12.000 e −2.500 tem média 4.750. Outros participantes com resultados A = 10.000 e −2.500 e B = 5.000 em um único dia elegível têm média conjunta 12.500 / 3 = 4.167 ao exibir. Não usar 4.375, que seria média simples das duas médias individuais. Em um dia relativo com brutos válidos 10.000 e 12.000, aplicados 0 e 2.000, o primeiro jogador conta em último e o segundo em primeiro. Um terceiro ausente pode entrar nas médias, mas não nessas contagens.

### Pendências para fechar o compromisso

Fórmulas centrais e privacidade refinadas. Fechar disponibilidade/capacidade e período de trabalho antes do compromisso; datas de início/fim não definidas, sem converter pontos em prazo. Período integral sem filtros adicionais e desenho das duas séries são propostas para a primeira entrega. Diagnóstico técnico e escolha de consulta/RPC podem revisar as estimativas; não iniciar implementação automaticamente por esse refinamento.

## Critérios de aceite propostos

1. Consultar RF21 a partir do torneio autorizado e retornar mantendo a seleção; contas externas, revogadas ou anônimas não acessam seus dados.
2. Conciliar média própria e conjunta dos demais com os exemplos confirmados/refinados, números negativos, zero real, denominador zero e diferentes datas de elegibilidade. Excluir o próprio jogador da comparação e explicar unidade, período e base de cálculo.
3. Não incluir datas fora do calendário, excluídas ou anteriores à elegibilidade; excluir o dia atual de todos os indicadores de RF21. Não criar pontos fictícios em dias sem base de cálculo.
4. Conciliar contagens com empate parcial/total, participante único válido e dia sem válidos. Excluir ausências, bruto zero e ambas as sanções das contagens; manter zero aplicado de resultado positivo válido no relativo. Exibir somente as próprias contagens; organizador sem participação não recebe contagens inventadas.
5. Resultados de auditorias abertas mantêm valores vigentes do ranking; após decisão, usar pontos aplicados atualizados. Encerrados usam resultados preservados, sem recálculo de estatísticas a partir de brutos atuais que altere o estado congelado.
6. Consulta cobre todo o período autorizado, sem limite silencioso de linhas. Falha intermediária não produz média parcial; mostrar erro e nova tentativa.
7. Gráfico com ordem cronológica, tabela textual equivalente, uso em celular e teclado; estados vazio, carregamento e erro claros. Evitar transferir indicadores para o painel principal.
8. TypeScript, lint, build e testes pertinentes aprovados. Se necessário, migração incremental acompanhada de backup, comparação e roteiro; documentação de fórmulas, arquitetura e limites atualizada antes da entrega. Publicação e aceite distinguem evidência local e remota.

## Evidências e situação

Planejamento documental em 18/10/2026. Base da manutenção anterior: 92 testes e lint aprovados; TypeScript com erros de tipagem Supabase já registrados, build não executado naquela entrega. Esses resultados não são execução de testes da Sprint 7. Nesta revisão não houve código, migração, nova operação remota ou teste da aplicação; verificação documental por `git diff --check`. Arquitetura vigente permanece; solução de consulta e necessidade de migração serão definidas na implementação autorizada.

Referências: [estatísticas RF21](../estatisticas.md), [requisitos](../requisitos.md), [backlog](../avaliacao-backlog-2026-09-27.md), [plano de ação](../plano-de-acao.md) e [manutenção posterior à Sprint 6](manutencao-pos-sprint-6.md).

## Histórico de planejamento anterior — substituído pelo foco vigente

## Pré-planejamento — 03/10/2026

Sprint futura, não iniciada. O Dono do produto solicitou registrar os feedbacks e planejar seu encaixe pelo fluxo Scrum. A alocação abaixo é proposta para refinamento, sem compromisso de entrega ou autorização de implementação. Sprint 4 permanece encerrada; sprints 5 e 6 preservam regras/calendário e auditoria como prioridades.

O objetivo previsto permanece S7-01 (aprovação/correção de lançamentos), S7-02 (histórico avançado) e S7-03 (ranking e usabilidade). Datas, capacidade e estimativas não foram definidas. Selecionar histórias no Sprint Planning após estimar o conjunto; o que não couber permanece no Product Backlog para uma sprint posterior.

## Candidatos à S7-03

| Item | História | Encaixe proposto |
| --- | --- | --- |
| FB05 — resultados recentes e expansão | Como jogador, quero ver inicialmente os resultados recentes e ampliar por um botão, para consumir o painel sem excesso de informações conforme crescem os dias e torneios. | S7-03a; evolução de RF07/RF10 e RNF04, coordenada com S7-02. |
| FB06 — troca de torneio responsiva | Como jogador, quero resposta imediata ao trocar de torneio e menor espera pelos dados, para continuar usando o painel durante o carregamento. O relato sugere pré-carregar informações antes do login. | S7-03b; evolução de RF10/RNF04, com investigação antes de escolher a solução. |

Prioridade relativa proposta entre as melhorias: FB05, depois FB06, preservando o núcleo S7-01/S7-02 e a diretriz de concluir o escopo planejado. Se a medição comprovar impedimento de um fluxo essencial, o Dono do produto poderá repriorizar no planejamento; não antecipar automaticamente para Sprint 5.

## Critérios de aceite propostos

### FB05 / S7-03a

- Mostrar quantidade limitada dos dias mais recentes em ordem decrescente, preservando ranking acumulado de todo o período elegível.
- Oferecer botão de expansão e retorno à apresentação reduzida, sem botão de expansão quando não houver mais itens. No recorte aprovado S5-04: cinco dias e expansão integral. Outros alcances continuam dependentes de refinamento.
- Resultados diários e histórico pessoal foram incluídos em S5-04. Refinar alcance sobre seleção de torneios e acesso ao histórico anterior ao limite. Não apresentar os 100 lançamentos hoje consultados como histórico completo; coordenar acesso a registros anteriores com S7-02.
- Manter todos os torneios autorizados acessíveis, inclusive encerrados, com seleção por URL, recarga e voltar/avançar. Refinar se a lista de torneios também exige apresentação reduzida.
- Validar lista vazia, quantidade abaixo/no/acima do limite, muitos dias e torneios, celular e teclado. Expandir não altera totais, ordenação dos jogadores ou permissões.

### FB06 / S7-03b

- Mostrar indicação acessível de carregamento ao selecionar outro torneio, mantendo a interface responsiva e identificando a seleção solicitada. Não apresentar resultados antigos como pertencentes ao novo torneio.
- Medir tempo até o feedback visual e até os dados completos, com e sem aquecimento, registrando ambiente, volume, rede e repetições. Definir meta mensurável após a linha de base e antes da implementação.
- Pré-carregar dados privados somente após autenticação e autorização; antes do login, avaliar apenas recursos públicos da interface. Não compartilhar cache privado entre contas nem dispensar autorização vigente.
- Limitar consultas em segundo plano e validar atualização após lançamento, expiração de sessão, saída/troca de conta e revogação de vínculo.
- Validar trocas rápidas, última seleção, voltar/avançar, rede lenta, falha/nova tentativa, torneio encerrado e sem acesso.

## Investigação e decisões pendentes

Inspeção local em 03/10/2026: o painel renderiza todos os dias disponíveis e até 100 lançamentos pessoais. Navegação por links com parâmetro de torneio; a RPC `get_tournament_dashboard` bloqueia a linha do torneio e aciona o recálculo existente. Pré-carregar vários torneios pode aumentar trabalho e contenção. Isso não comprova a causa da lentidão relatada; nenhuma medição ou investigação remota foi realizada.

Investigar servidor/banco, transferência e renderização; avaliar pré-carregamento limitado após login, indicação de carregamento e eventual separação de leitura e recálculo. São alternativas técnicas, não decisões arquiteturais aprovadas. Caso a implementação altere transações, cache ou fluxo entre componentes, atualizar arquitetura/diagramas e registrar ADR na entrega.

Antes do Sprint Planning: definir alcance e limite de FB05, linha de base/meta de FB06; estimar desenvolvimento, testes, documentação, publicação e homologação; confrontar capacidade com S7-01/S7-02 e demais feedbacks. Prioridade e aceite cabem ao Dono do produto.

## Situação e evidências

Entrega de 03/10/2026 exclusivamente documental: feedbacks, histórias, critérios e encaixe propostos. Verificação: revisão de referências e `git diff --check`. Nenhum teste da aplicação executado, código alterado ou operação remota realizada. Implementação, publicação e homologação não realizadas; necessidade de migração ainda não definida, dependente da solução futura.

03/10/2026 — S5-05 autorizada: investigar primeira abertura/troca lenta e aviso intermitente. Carregamento, nova tentativa explícita e métricas sem dados pessoais implementados localmente; causa remota não confirmada. Sem migração. Publicação, linha de base e homologação pendentes. Ver seção 11 da Sprint 5 e ADR-005.

## Novo candidato — estatísticas (11/10/2026)

RF20–RF21 / FB07: como jogador, quero consultar minha média bruta diária, média por jogo e evolução temporal; como participante ou organizador autorizado, quero consultar a média do torneio com gráfico de sua evolução ao longo do tempo e, por participante, os dias de maior pontuação e última colocação. O Dono do produto confirmou telas separadas do painel principal para evitar excesso de informação. Cada dia representa cinco jogos de 0 a 5.000 pontos; média por jogo = média bruta diária / 5.

Encaixe na evolução S7-03 é proposta para Sprint Planning, sem sprint de implementação definida, estimativa ou autorização de implementação nesta revisão. Refinar período, denominadores, brutos/aplicados, empates, zero/ausências, auditorias e permissões conforme [Estatísticas](../estatisticas.md), que reúne critérios de aceite futuros. RF19 continua independente: este pedido é de consulta na aplicação, não de relatório por e-mail.

Entrega local exclusivamente documental em 11/10/2026. Revisão das referências e `git diff --check`; testes funcionais não executados. Nenhuma tela, consulta ou cálculo implementado; nenhuma operação remota. Necessidade de migração a avaliar na solução futura; publicação, homologação e aceite da funcionalidade ainda não realizados.

11/10/2026 — Complemento do Dono do produto: RF21 também deve apresentar gráfico da evolução da pontuação média do torneio, na tela separada de estatísticas. Requisito detalhado, planejamento, backlog e critérios de aceite/testes atualizados. Revisão exclusivamente documental; implementação sem sprint definida. Verificação: revisão das referências e git diff --check; nenhum teste funcional ou operação remota.

11/10/2026 — Refinamento de RF20–RF21 confirmado pelo Dono do produto: dropdown pessoal com “últimos 5 dias”, “último mês” e “desde o início”; zero/ausências excluídos das médias pessoais; média do torneio sempre sobre pontos aplicados, incluindo ausências no denominador; médias sem casas decimais, com arredondamento aritmético padrão no resultado final. Substitui as pendências anteriores desses pontos. Seleção inicial/limites temporais, agregação do torneio, empates e efeitos de auditoria ainda exigem refinamento; ver [Estatísticas](../estatisticas.md). Entrega exclusivamente documental, sem implementação ou execução remota; revisão e git diff --check.

11/10/2026 — Decisões adicionais confirmadas pelo Dono do produto para RF20–RF21: opção inicial “últimos 5 dias”; média pessoal somente dos dias jogados (bruto positivo); contagens de colocação pela pontuação aplicada, com todos os empatados na primeira/última recebendo a contagem e participante único contando nas duas; denominador zero não exibe dados da métrica. Estatísticas individuais restritas ao próprio perfil, inclusive próprias contagens na tela de torneio; média agregada permanece disponível conforme acesso ao torneio. Visualização de estatísticas de outros jogadores é requisito futuro, sem sprint definida. Substitui pendências anteriores correspondentes; limites temporais do filtro e classificação de ausentes/auditorias ainda exigem refinamento. Ver [Estatísticas](../estatisticas.md). Entrega documental, sem implementação ou operação remota; revisão e git diff --check.

11/10/2026 — Dono do produto definiu “últimos 5 dias” de RF20 como os cinco dias mais recentes com valor, isto é, bruto positivo conforme a regra confirmada de zero como ausência. Não são cinco dias corridos: ignorar zero e dias sem lançamento, buscando os cinco dias jogados mais recentes; se houver menos de cinco, usar todos os disponíveis. Seleção aplicada às médias e ao gráfico pessoal. Substitui a pendência anterior sobre esse período; definição de “último mês” permanece em refinamento. Critério futuro: validar intervalos sem jogo, zeros e menos de cinco registros positivos. Entrega documental, sem implementação ou execução remota; revisão e git diff --check. Ver [Estatísticas](../estatisticas.md).

11/10/2026 — Dono do produto definiu o período antes chamado “último mês” como “últimos 30 dias”, substituindo o rótulo e encerrando essa pendência. Janela de 30 dias corridos (hoje e os 29 dias anteriores, em America/Sao_Paulo), aplicada às médias e ao gráfico pessoal; apenas dias jogados entram nas médias. Opções vigentes: “últimos 5 dias”, “últimos 30 dias” e “desde o início”. Registros anteriores com “último mês” são históricos e substituídos por esta definição. Critérios futuros incluem limites de inclusão/exclusão, viradas de mês/ano e zero/ausências. Ver [Estatísticas](../estatisticas.md). Revisão documental local; git diff --check, sem implementação, teste funcional ou operação remota.

## RF20 — incluído e implementado na Sprint 6 em 11/10/2026

O Dono do produto autorizou incluir RF20 na Sprint 6 (S6-04). Implementação local concluída: acesso “Minhas estatísticas” no painel, tela própria `/dashboard/statistics`, médias bruta diária e por jogo, gráfico cronológico e tabela acessível. RF21 permanece futuro, em refinamento. Este registro substitui as referências anteriores a RF20 sem sprint/entrega apenas documental, que passam a ser históricas. Publicação, homologação e aceite de RF20 ainda não confirmados; não há migração adicional.

Períodos aprovados: cinco dias positivos mais recentes (padrão), últimos 30 dias corridos (hoje e 29 anteriores em São Paulo) e histórico até hoje. Médias e gráfico usam somente bruto positivo; zero e ausência não contam como jogos. Cada dia equivale a cinco jogos; cada média é arredondada apenas após sua própria divisão. Auditorias de torneio não alteram a fonte pessoal. Sem positivos: mensagem, sem indicadores ou gráfico fictício. Erro de qualquer página: tentar novamente, sem médias parciais.

Consulta no servidor restrita à identidade autenticada e às políticas RLS existentes; nenhum parâmetro permite escolher outro perfil. Paginação por cursor na data única por jogador até página vazia, sem limite total de 100 registros; últimos cinco para ao completar cinco positivos. Tamanho solicitado de até 200 registros, tolerando teto remoto inferior. Sem novas tabelas, RPCs, permissões, dependências ou mutações. Gráfico SVG com escala diária 0–25.000 e distâncias proporcionais às datas; tabela completa expansível e rolagem horizontal acessível. Estratégia de consulta e apresentação são escolhas técnicas; fórmulas e períodos foram confirmados pelo Dono do produto.

Validação local: suíte de 86 testes aprovada; RLS real em PGlite, 257 positivos sob teto remoto de 37 por página, últimos cinco sob teto de dois, médias/arredondamento, fronteiras de 30 dias/ano bissexto, isolamento entre contas/anônimo, erro intermediário e renderização. Lint e build aprovados; apresentação revalidada após corrigir títulos dos pontos SVG. Homologação visual de RF20 no computador/celular/teclado ainda pendente. Não houve operação remota de RF20.

Limitações: custo de consultas, memória e renderização proporcional ao histórico; leitura paginada não é snapshot transacional e correções concorrentes podem exigir recarga. Sem atualização em tempo real. A apuração das auditorias mantém seu prazo e roteiro; não há aceite global da Sprint 6.

## RF22–RF23 — candidatos futuros (11/10/2026)

Registrar entrada alternativa do texto dos cinco jogos (país, pontos, distância, tempo e passos) e Total, preservando lançamento bruto simples; ampliar estatísticas pessoais com melhor/pior país e tempo médio. Dependências: refinamento das fórmulas/validação, persistência dos jogos e integração com RF05/RF20. Sem compromisso de Sprint 7 ou autorização de implementação nesta revisão. [Escopo, exemplo, decisões pendentes e critérios](../estatisticas.md).

Entrega exclusivamente documental. Arquitetura vigente preservada; migração, implementação, testes funcionais, publicação, homologação e aceite deste incremento dependem da entrega futura. Verificação local: revisão do exemplo e `git diff --check`.

## RF24 — candidato futuro (11/10/2026)

Registrar persistência mínima de métricas operacionais para análise semanal, relacionada ao acompanhamento de FB06. Refinamento deve definir armazenamento, custo, retenção, acesso, limites e impacto da coleta. Sem sprint definida ou compromisso de entrega na Sprint 7. [História e critérios propostos](../metricas-operacionais.md).
