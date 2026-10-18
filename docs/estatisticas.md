# Estatísticas pessoais e de torneio — RF20–RF21

18/10/2026 — RF21 autorizado e implementado localmente na Sprint 7. Tela própria destaca média aplicada pessoal e conjunta dos demais, próprias contagens e gráfico/tabela diária, período integral até ontem, conforme decisões refinadas. Usa resultados aplicados completos da RPC autorizada existente; sem migração e sem acesso a indicadores individuais dos demais. 98 testes, lint, TypeScript e build aprovados; diagnóstico anterior de tipos isolado à restrição de links pnpm no sandbox, sem alteração dos contratos. Publicação, homologação autenticada e aceite pendentes. [Entrega](sprints/sprint-7.md) e [operação](sprints/sprint-7-operacao.md). Registros anteriores de implementação não iniciada são históricos.

## RF21 — refinamento vigente de 18/10/2026

Decisões confirmadas pelo Dono do produto: a tela destaca principalmente o desempenho do jogador conectado no torneio selecionado; comparação com a **média conjunta dos demais participantes**, sem médias individuais identificadas de terceiros. Considerar somente dias encerrados em America/Sao_Paulo. As duas médias usam pontos aplicados e incluem ausências. Exemplo aprovado: 12.000 e −2.500 em dois dias elegíveis produzem média própria de 4.750.

Média própria = soma aplicada / próprios dias elegíveis encerrados. Média conjunta dos demais = soma aplicada dos outros / total de participações elegíveis por dia desses outros, excluindo o próprio jogador da soma e do denominador. Elegibilidade diferente exige ponderação por participações-dia, não média simples de médias individuais. As sanções permanecem nos pontos aplicados usados pelas médias. Regras de arredondamento e denominador zero já confirmadas são preservadas.

Contagens de primeiro/último usam pontos aplicados somente de resultados positivos válidos: ausências, bruto zero e invalidações/sanções não participam da classificação. Escolha técnica de interpretação coerente com o relativo: um jogo com bruto positivo válido e aplicação zero continua concorrendo. Todos os empatados contam; um único jogador com resultado válido conta nos dois extremos; dia sem válidos não gera contagens. Isso não exclui ausências das médias: as bases são diferentes e devem estar explicadas na tela.

Gráfico cronológico permanece no escopo. Proposta de apresentação: série diária do próprio resultado aplicado e média diária conjunta dos demais, com tabela equivalente e lacunas sem dados; período integral do torneio até ontem. Filtros adicionais e desenho específico das séries ainda não foram confirmados. Organizador sem participação não recebe métricas próprias fictícias; mantém acesso autorizado ao agregado. Consulta de médias individuais de terceiros permanece fora deste recorte.

Substitui as pendências anteriores de dia atual, agregação e classificação de ausentes/auditorias, bem como a ideia de apenas uma média agregada que inclua o próprio jogador como comparação. Privacidade de RF20 permanece: dados pessoais fora do torneio são só do titular. [Sprint 7](sprints/sprint-7.md) reúne exemplos e aceite. Planejamento/refinamento documental, sem implementação, migração ou nova operação remota.

18/10/2026 — O Dono do produto priorizou RF21 no planejamento da Sprint 7. Objetivo: média aplicada e gráfico do torneio em tela própria, com próprias contagens e privacidade já confirmada. Agregação, inclusão do dia atual e classificação de ausentes/punidos submetidas a decisão; ainda não alterar fórmulas aprovadas ou tratar propostas como confirmação. RF20 entregue/aceito no contexto do encerramento da Sprint 6; estados anteriores de ausência de aceite são históricos. RF22–RF23 seguem no backlog, fora do recorte proposto. [Planejamento vigente](sprints/sprint-7.md).

## Pedido e situação — 11/10/2026

O Dono do produto solicitou registrar um novo requisito trazido pelos usuários. As métricas e a separação das telas abaixo estão confirmadas como escopo do requisito. RF20 foi posteriormente autorizado e implementado localmente na Sprint 6; veja a entrega S6-04 ao final. RF21 permanece em refinamento futuro. Os registros documentais anteriores são históricos.

## Estatísticas pessoais — RF20

- Pontuação bruta média diária do próprio jogador.
- Média de pontuação por jogo.
- Gráfico de desempenho ao longo do tempo, com datas e pontuação bruta diária identificadas.
- Tela própria de estatísticas pessoais, separada do painel principal, com seletor dropdown de opções fixas: “últimos 5 dias”, “últimos 30 dias” e “desde o início”. A opção inicial é “últimos 5 dias”: os cinco dias mais recentes com valor bruto positivo (dias jogados), desconsiderando zero e dias sem lançamento; não são cinco dias corridos. Se houver menos de cinco dias com valor, considerar todos os disponíveis. “Últimos 30 dias” corresponde à janela dos 30 dias corridos mais recentes, incluindo a data atual e os 29 dias anteriores, no fuso America/Sao_Paulo. Médias e gráfico usam os lançamentos desse intervalo; zero e ausências continuam excluídos das médias. “Desde o início” contempla todo o histórico pessoal disponível. O período selecionado se aplica às médias e ao gráfico pessoal; a média considera somente dias jogados (bruto positivo).

Cada dia reúne cinco jogos de 0 a 5.000 pontos cada. O total bruto diário varia de 0 a 25.000. Para N dias com pontuação bruta positiva no período selecionado, média diária = soma dos totais brutos / N; média por jogo = soma dos totais brutos / (5 × N), equivalente à média diária / 5. Exemplo: totais de 20.000 e 15.000 produzem média diária de 17.500 e média por jogo de 3.500. Não é necessário registrar as cinco pontuações individuais para obter essa média; distribuição ou desempenho de cada jogo individual não integram o pedido.

Decisão confirmada pelo Dono do produto em 11/10/2026: zero representa ausência e é excluído da soma e do denominador das médias pessoais. Dias sem lançamento ou sem jogo também não representam jogos realizados e não entram nessas médias. Se não houver pontuações positivas, não calcular média por divisão por zero nem exibir dados numéricos ou pontos de gráfico para a métrica sem dados; não substituir por zero. Exemplo: 20.000, 15.000 e zero continuam resultando em 17.500 por dia e 3.500 por jogo.

As estatísticas pessoais se baseiam nas pontuações brutas pessoais, independentes do torneio (RN01). Invalidações e penalidades restritas a um torneio não alteram o histórico pessoal global (RN10).

## Estatísticas de torneio — RF21

- Pontuação média aplicada do torneio, acompanhada de gráfico de sua evolução ao longo do tempo. A média usa sempre pontos aplicados pelas regras do torneio, e o denominador inclui ausências.
- Quantidade de dias com maior pontuação, por participante.
- Quantidade de dias em última colocação, por participante.
- Tela própria de estatísticas do torneio, separada do painel principal e respeitando o acesso vigente ao torneio.

As contagens de colocação usam a pontuação aplicada. Todos os jogadores empatados na primeira colocação recebem a contagem daquele dia na estatística de maior pontuação; todos os empatados na última recebem a contagem na estatística de última colocação. Um dia com um único participante conta nas duas estatísticas desse participante. Se todos estiverem empatados, cada um conta nas duas estatísticas. A seleção deve identificar o torneio consultado. Calendário, elegibilidade, auditorias e congelamento de resultados de torneios encerrados precisam ser respeitados conforme as regras vigentes.

## Decisões confirmadas — 11/10/2026

O Dono do produto definiu as três opções fixas do dropdown pessoal, a exclusão de zero/ausência das médias pessoais, o uso exclusivo de pontuação aplicada na média do torneio com ausências no denominador e a exibição das médias sem casas decimais, com arredondamento aritmético padrão. Calcular as médias a partir dos valores originais e arredondar somente o resultado final exibido; derivar a média por jogo antes do arredondamento da média diária. Essas decisões substituem as pendências anteriores correspondentes.

### Privacidade e ausência de dados

Estatísticas pessoais são visíveis somente ao titular autenticado. Nesta entrega futura inicial, não expor estatísticas individuais entre perfis, inclusive as contagens individuais de colocação de outros jogadores na tela de torneio. Essa tela permite consultar a média agregada do torneio e as próprias contagens, conforme autorização vigente. A consulta de estatísticas de outros jogadores é requisito futuro, fora de RF20–RF21 neste recorte, sem sprint definida; suas permissões precisam ser refinadas antes da implementação.

Quando o denominador for zero, não exibir dados da métrica correspondente: nem média zero, nem NaN/infinito, nem ponto fictício no gráfico. Isso não impede exibir uma média efetivamente calculada cujo resultado válido seja zero.

## Pendências de RF21; RF20 resolvido na entrega S6-04

- Agregação e classificação do torneio permanecem em refinamento conforme os itens abaixo. Os períodos pessoais já estão definidos: cinco dias mais recentes com valor, últimos 30 dias corridos e desde o início; datas livres não fazem parte do pedido atual.
- RF20: dias positivos, estado vazio, navegação e consulta integral resolvidos na implementação S6-04 descrita ao final; sem pendência funcional desses pontos.
- Agregação da média do torneio e de cada ponto do gráfico: definir média por participante/dia ou outra agregação, elegibilidade e tratamento de contribuições desconsideradas por auditoria. Pontos aplicados e inclusão de ausências no denominador já estão confirmados; penalidades seguem os valores aplicados vigentes, sem alterar regras do torneio. Não confundir pontuação média diária com média dos totais acumulados.
- Contagens em dias sem resultado válido e tratamento de ausentes/penalizados e contribuições desconsideradas: definir quais participantes integram a classificação do dia. Pontuação aplicada, empates e participante único já estão confirmados.
- Apresentação de períodos sem dados; divisão por zero não deve produzir indicador numérico enganoso. Arredondamento aritmético padrão, sem casas decimais, já confirmado.
- Navegação das telas e estratégia de consulta: volume de dados, paginação/agregação e acesso ao histórico completo do período escolhido. Privacidade inicial já confirmada: estatísticas individuais somente do próprio perfil; dados agregados do torneio apenas para contas autorizadas.

Estas definições são pendências de refinamento, não decisões já aprovadas. Não usar o limite atual de até 100 lançamentos do painel como histórico completo para as novas estatísticas sem informar e definir o alcance.

## Critérios de aceite (RF20 implementado localmente; RF21 futuro)

1. Validar que “últimos 5 dias” seleciona os cinco dias mais recentes com bruto positivo, mesmo com intervalos sem lançamento ou lançamentos zero; com menos de cinco dias jogados, usar os disponíveis. Validar seleção inicial “últimos 5 dias”, as três opções fixas do dropdown e a atualização conjunta de médias/gráfico. Excluir zero e dias sem lançamento das médias pessoais. Conciliar as médias pessoais com dados conhecidos, incluindo o exemplo de 17.500 por dia e 3.500 por jogo; manter escalas distintas de 25.000/dia e 5.000/jogo.
2. Validar “últimos 30 dias” na fronteira do intervalo: incluir hoje e a data de 29 dias atrás, excluir a data de 30 dias atrás; conferir viradas de mês/ano, dias sem jogo, zero e atualização conjunta das médias e do gráfico. Exibir o gráfico com datas em ordem cronológica, distinguindo ausência de dados de pontuação efetiva conforme o refinamento; oferecer representação textual acessível dos valores.
3. Exibir gráfico da evolução da média do torneio com datas em ordem cronológica, valores consistentes com a métrica de média e representação textual acessível. Conciliar média e contagens do torneio com um conjunto conhecido após aprovação das fórmulas, incluindo empates, calendário excluído, ingresso/elegibilidade, penalidades e auditoria.
4. Confirmar contagens pela pontuação aplicada, todos os empatados nos extremos e participante único nas duas estatísticas. Exemplos: aplicados 100, 100 e 50 contam primeira colocação para os dois primeiros e última para o terceiro; um único resultado conta primeira e última para seu titular.
5. Manter os indicadores e gráficos nas telas de estatísticas; o painel principal fornece somente o acesso necessário para navegar até elas.
6. Validar celular, computador, teclado, período vazio, carregamento, falha e histórico superior a 100 registros, sem truncamento silencioso.
7. Validar arredondamento aritmético padrão sem casas decimais (por exemplo, 3.500,4 → 3.500 e 3.500,5 → 3.501), sem arredondamento intermediário; testar média aplicada do torneio com ausência no denominador e penalidade vigente no numerador.
8. Validar isolamento entre contas/torneios, revogação de acesso e preservação dos resultados congelados de torneios encerrados. Confirmar que não é possível consultar estatísticas individuais de outro perfil por navegação ou consulta direta, incluindo contagens de colocação; média agregada do torneio permanece acessível conforme autorização.
9. Denominador zero não apresenta dados numéricos da métrica nem pontos fictícios no gráfico; resultado zero com denominador positivo continua sendo dado válido.

## Evidências históricas do refinamento documental

Registro local de requisitos, plano de ação, backlog, Sprint 7, plano de testes e histórico. Verificação documental por revisão das referências e `git diff --check`. Nenhum teste funcional da aplicação ou operação remota faz parte desta revisão. Implementação, necessidade de migração, publicação, homologação e aceite da funcionalidade dependem da entrega futura. A arquitetura permanece a vigente; decisões arquiteturais serão documentadas quando a solução for definida.

## RF20 — incluído e implementado na Sprint 6 em 11/10/2026

O Dono do produto autorizou incluir RF20 na Sprint 6 (S6-04). Implementação local concluída: acesso “Minhas estatísticas” no painel, tela própria `/dashboard/statistics`, médias bruta diária e por jogo, gráfico cronológico e tabela acessível. RF21 permanece futuro, em refinamento. Este registro substitui as referências anteriores a RF20 sem sprint/entrega apenas documental, que passam a ser históricas. Publicação, homologação e aceite de RF20 ainda não confirmados; não há migração adicional.

Períodos aprovados: cinco dias positivos mais recentes (padrão), últimos 30 dias corridos (hoje e 29 anteriores em São Paulo) e histórico até hoje. Médias e gráfico usam somente bruto positivo; zero e ausência não contam como jogos. Cada dia equivale a cinco jogos; cada média é arredondada apenas após sua própria divisão. Auditorias de torneio não alteram a fonte pessoal. Sem positivos: mensagem, sem indicadores ou gráfico fictício. Erro de qualquer página: tentar novamente, sem médias parciais.

Consulta no servidor restrita à identidade autenticada e às políticas RLS existentes; nenhum parâmetro permite escolher outro perfil. Paginação por cursor na data única por jogador até página vazia, sem limite total de 100 registros; últimos cinco para ao completar cinco positivos. Tamanho solicitado de até 200 registros, tolerando teto remoto inferior. Sem novas tabelas, RPCs, permissões, dependências ou mutações. Gráfico SVG com escala diária 0–25.000 e distâncias proporcionais às datas; tabela completa expansível e rolagem horizontal acessível. Estratégia de consulta e apresentação são escolhas técnicas; fórmulas e períodos foram confirmados pelo Dono do produto.

Validação local: suíte de 86 testes aprovada; RLS real em PGlite, 257 positivos sob teto remoto de 37 por página, últimos cinco sob teto de dois, médias/arredondamento, fronteiras de 30 dias/ano bissexto, isolamento entre contas/anônimo, erro intermediário e renderização. Lint e build aprovados; apresentação revalidada após corrigir títulos dos pontos SVG. Homologação visual de RF20 no computador/celular/teclado ainda pendente. Não houve operação remota de RF20.

Limitações: custo de consultas, memória e renderização proporcional ao histórico; leitura paginada não é snapshot transacional e correções concorrentes podem exigir recarga. Sem atualização em tempo real. A apuração das auditorias mantém seu prazo e roteiro; não há aceite global da Sprint 6.


## RF20 — validação da tela pelo Dono do produto

11/10/2026 — O Dono do produto relatou: “validei a tela parece ok”. Registrada validação visual da tela de estatísticas pessoais na aplicação utilizada, sem problemas relatados. Esta evidência substitui a ausência anterior de homologação visual geral de RF20. O relato não identifica ambiente/versão, dispositivos ou casos específicos; não comprova separadamente todos os cenários do roteiro nem constitui aceite global da Sprint 6. Apuração e efeitos das auditorias permanecem pendentes conforme prazo de 13/10/2026 às 11:15 (São Paulo).

## RF22–RF23 — lançamento detalhado e novas métricas pessoais (11/10/2026)

Novo requisito relatado pelo Dono do produto a partir de comentários dos usuários: além do lançamento do total bruto, aceitar o texto com os cinco jogos e a linha Total, contendo país, pontos, distância, tempo e passos. RF22 cobre essa entrada alternativa; RF23 amplia as estatísticas pessoais com países de melhor/pior desempenho e tempo médio. Requisitos futuros, sem sprint de implementação definida. O escopo atual implementado de RF20 permanece baseado no total diário; a exclusão anterior do desempenho individual refere-se à entrega original e é ampliada por este pedido.

### Exemplo fornecido

```text
1. Uganda: 590 pts., 3.189 km, 3 min, 17 passos
2. Costa Rica: 4.604 pts., 123 km, 3 min, 20 passos
3. Montenegro: 1.412 pts., 1.886 km, 2 min, 52 seg, 41 passos
4. Tailândia: 4.320 pts., 218 km, 2 min, 12 seg, 31 passos
5. Rússia: 3.027 pts., 749 km, 2 min, 28 seg, 34 passos
Total: 13.953 pts., 6.164 km, 13 min, 32 seg, 143 passos
```

Conciliação documental: pontos = 13.953; distâncias = 6.165 km nas linhas, enquanto o Total informado é 6.164 km; tempos = 812 segundos (13 min 32 seg); passos = 143. A divergência de distância exige uma regra de validação a refinar, considerando eventual arredondamento na origem. Não corrigir silenciosamente o texto nem considerar a discrepância evidência de fraude.

### Escopo solicitado e propostas de refinamento

- Manter o lançamento por total bruto como alternativa; históricos sem detalhamento continuam disponíveis às métricas atuais. Não inferir países, tempos ou passos a partir do total.
- Interpretar os cinco jogos com seus países e medidas; pontos por jogo entre 0 e 5.000, total entre 0 e 25.000. No exemplo, ponto é separador de milhar; tempo pode omitir segundos, como em “3 min”. Preservar nomes com espaços e acentos.
- Exibir as novas métricas na tela pessoal existente, somente ao titular, preservando a independência das regras/auditorias de torneio. A entrada detalhada deve respeitar os prazos e permissões do lançamento pessoal vigente.
- Proposta técnica/funcional, ainda não confirmada: melhor/pior país pela média de pontos brutos dos jogos detalhados daquele país, com quantidade de jogos e todos os empatados; evitar comparar somas quando países têm quantidades diferentes de jogos.
- Proposta ainda não confirmada: tempo médio por jogo = soma dos tempos / número de jogos com tempo válido; tempo médio diário = soma dos tempos dos dias completos / número desses dias. Calcular em segundos e formatar em minutos/segundos, com arredondamento somente ao exibir. Para o exemplo: média por jogo de 162,4 segundos, ou 2 min 42 seg se arredondada ao segundo; média diária de 13 min 32 seg.
- Proposta ainda não confirmada: aplicar os períodos de RF20 às novas métricas e informar quantos dias/jogos têm detalhamento. Histórico sem detalhes não entra nos denominadores dessas métricas; zero pontos em um jogo detalhado não é automaticamente ausência, pois pode integrar um dia efetivamente jogado.
- Distância e passos constam da entrada; indicadores próprios dessas medidas não foram solicitados neste pedido.

### Decisões pendentes antes da implementação

Definir com o Dono do produto: critério de melhor/pior país (média ou outro), empates e amostra mínima; tempo médio por jogo, por dia ou ambos e sua apresentação; abrangência dos filtros; aceitação de detalhes incompletos e de formatos/idiomas alternativos; normalização dos países; tratamento de divergências entre linhas e Total (especialmente distância arredondada); prévia/confirmação da importação; correção posterior e substituição de lançamento detalhado por total simples. Detalhamento não pode ficar associado a um total corrigido sem reconciliação explícita.

A arquitetura vigente não é alterada nesta entrega documental. A implementação futura exige definir persistência dos cinco jogos, vínculo com a pontuação diária, validação e gravação consistente do conjunto, RLS, correções e migração; registrar a solução em arquitetura/diagramas e decisão técnica quando definida. Sem criar dados detalhados fictícios para lançamentos antigos.

### Critérios de aceite futuros

1. Importar o exemplo identificando cinco países, pontos, tempos e passos; conciliar pontos/tempo/passos e tratar explicitamente a diferença de 1 km conforme a regra aprovada.
2. Validar separadores de milhar, acentos, nomes compostos e segundos omitidos; rejeitar ou informar linhas inválidas, duplicadas, faltantes, valores negativos e pontos acima dos limites, conforme formatos aprovados. Uma falha não deve deixar gravação parcial.
3. Preservar lançamento simples, prazos, isolamento entre contas e uso do total diário nos torneios, sem alterar rankings por distância, tempo ou passos.
4. Conciliar melhor/pior país com países repetidos, quantidades desiguais, empates e jogos de zero pontos; conciliar tempo médio e filtros com histórico misto, sem dados e fronteiras de período.
5. Correção/substituição não duplica jogos nem mantém detalhes incompatíveis; verificar celular, teclado, mensagens de validação e alternativa textual das métricas.

Situação: registro e revisão documental local; cenários acima ainda não executados. Sem implementação, migração, operação remota, publicação ou homologação deste incremento. RF20 já entregue não implica entrega de RF22–RF23.
