# Documentação funcional — GeoGuaras

24/10/2026 — Dono do produto confirmou para RF19 o critério de sucesso como aceitação de todos os envios pelo Gmail para encaminhamento, sem comprovar entrega/leitura. Implementada adaptação local para a conta Gmail existente via SMTP/TLS e Nodemailer, sem Resend/domínio pago; erros e resultados incertos mantêm bloqueio de retirada, sem reenvio automático de tentativas ambíguas. Migração inicial 001 e comparação já confirmadas permanecem válidas. Novo incremento 202610240002 exige captura/exportação/validação e comparação próprias de 24 seções antes de ativar. SMTP de recuperação de senha preservado, sem acesso a credenciais e sem envio real. [ADR-014](decisoes/adr-014-relatorios-gmail-sem-custo.md), [roteiro Gmail](sprints/sprint-8-gmail-operacao.md). Verificação final: 134 testes, lint e build/TypeScript aprovados; nenhuma execução remota do incremento.

24/10/2026 — Sprint 8 implementada localmente após autorização do Dono do produto: RF19 com captura final atômica, PDF geral (classificação, evolução acumulada e duplas), fila privada, e-mails individuais via Resend e confirmação assinada de entrega; retirada lógica antecipada/automática após 168 horas, bloqueada por geração/envios pendentes, com limpeza do PDF/captura/endereços. Claro/Escuro/Sistema persistido no navegador, em telas e gráficos. RF25 continua futuro. Migração nova 202610240001, configuração de remetente/segredos/webhook/agendas, publicação e homologação ainda pendentes; nenhuma operação remota ou envio real realizado. [Entrega e limites](sprints/sprint-8.md), [arquitetura e decisão](decisoes/adr-013-relatorios-e-retirada-de-torneios.md), [operação](sprints/sprint-8-operacao.md). Esta situação substitui os registros históricos anteriores de implementação não iniciada.

24/10/2026 — Dono do produto confirmou RF19/Sprint 8: após a retirada do torneio, o relatório geral em PDF ficará disponível apenas nos e-mails enviados; sem consulta ou download pela aplicação. Esta decisão resolve a disponibilidade funcional do relatório após retirada, sem estabelecer retenção técnica indefinida ou afirmar remoção física implementada. Ver [regras do relatório](relatorios-de-torneio.md). Revisão documental, sem implementação ou operação remota.

24/10/2026 — Dono do produto confirmou FB01/Sprint 8: opções Claro, Escuro e Sistema, preferência salva no navegador e aplicação a todas as telas e gráficos. Este recorte não prevê sincronização por conta entre dispositivos. Selecionar Sistema deve acompanhar a preferência do sistema; verificar persistência, legibilidade e estados de interface na implementação. A confirmação substitui a condição anterior de proposta do tema. Ver [Sprint 8](sprints/sprint-8.md). Revisão documental, sem implementação ou teste funcional.

24/10/2026 — Dono do produto confirmou proteção de RF19/Sprint 8: permitir nova tentativa e bloquear retirada automática e antecipada pelo organizador enquanto o PDF não for gerado e todos os envios aos participantes não concluírem com sucesso, mesmo após uma semana. Essa regra substitui a proposta anterior ainda não confirmada. Critério técnico de sucesso do envio será definido na integração; não presumir leitura ou entrega em caixa. Ver [regras do relatório](relatorios-de-torneio.md). Revisão documental, sem implementação ou operação remota.

24/10/2026 — Dono do produto confirmou para RF19/Sprint 8 o relatório geral em PDF e envio por e-mail aos participantes logo após sua geração no encerramento. Formato, canal e momento de envio deixam de ser propostas; tratamento de falhas, retenção e alcance da retirada seguem em refinamento. RF25 individual permanece futuro. Ver [regras do relatório](relatorios-de-torneio.md). Atualização documental, sem geração/envio real, implementação ou operação remota.

24/10/2026 — Dono do produto definiu RF19/Sprint 8 com somente relatório geral do torneio, gerado no ato do encerramento, incluindo gráfico de evolução de posições de cada participante e duplas mais disputadas por quantidade de trocas de posições entre si. Criado RF25 para relatórios individuais futuros, sem sprint ou prazo. Fórmula de evolução/trocas e tratamento de empates são propostas para confirmação, conforme [Relatórios de torneio](relatorios-de-torneio.md). Esta decisão substitui a proposta histórica de relatórios individuais em RF19/FB03. Revisão documental, sem implementação ou operação remota.

## Auditoria por votação — Sprint 6 (local em 11/10/2026)

Complemento local solicitado durante homologação: a situação de cada pontuação do dia pode mostrar “Auditoria aberta · Ver votação”, com link direto à avaliação, ou “Punição aplicada · Ver resultado” após invalidação, com link à decisão e resultados antes/depois. Desconsideração e penalidade recebem a legenda de punição aplicada. Pedido não aprovado/rejeitado e pontuação mantida não recebem esses avisos. Aviso de avaliação aberta permanece até a apuração, inclusive após o prazo. Link não concede direito de voto a quem não integra o eleitorado. Atualizar página para consultar novo estado; complemento ainda sem publicação/homologação confirmadas.

No painel do torneio, “Auditoria de pontuações” abre pedidos e decisões. Participante escolhe uma pontuação positiva e informa justificativa de 3 a 1.000 caracteres. Organizador aprova e inicia 48 horas de votação ou rejeita com motivo. Cada integrante da abertura, exceto o auditado, pode votar e alterar seu voto até o prazo; organizador vota se participante. Os votos são secretos: cada jogador consulta apenas seu próprio voto, e o resultado agregado aparece após a apuração.

Após o prazo, o organizador apura. Maioria simples dos votos recebidos pela invalidez determina a invalidação; empate ou ausência de votos mantém o resultado. Na invalidação, escolhe contribuição zero sem penalidade ou penalidade da data auditada. O dia é recalculado sem essa pontuação como referência relativa; bruto pessoal e outros torneios são preservados. Histórico exibe resultados antes/depois e o painel distingue a punição de uma ausência comum.

Há uma auditoria por pontuação/torneio nesta sprint, inclusive pedido rejeitado; sem recurso/reabertura. Atualizar página para consultar mudanças. Pedido/votação pendente impede encerramento/revisão de regras, mudança do vínculo do auditado e correção do bruto em avaliação. Encerrados permitem consulta. Implementação local testada; migração/publicação/homologação pendentes. [Detalhes e decisões](sprints/sprint-6.md).

Definição vigente S5: organizador edita início/fim e uma única regra para todo o período em “Configurar período e regras”. Prévia mostra impacto no conjunto do torneio; confirmação registra histórico e recalcula. Encerrados são somente consulta. Testes experimentais usam TESTE S5, sem alterar brutos reais. Migração complementar/publicação dessa simplificação ainda pendentes.

## Evolução vigente — Sprint 5 (local em 03/10/2026)

Criar torneio permite escolher modo absoluto/relativo, penalidade e calendário, com exclusões por data/motivo. Fuso fixo São Paulo, sem configuração. Zero bruto representa ausência nos dois modos; zero aplicado ao menor positivo permanece resultado válido. Administração oferece revisão de regras por intervalo: configuração completa, motivo, prévia de totais/alterações e confirmação explícita. A revisão mais recente prevalece por data, inclusive retroativamente, com histórico preservado; encerrados só permitem consulta. Pontuação pessoal continua compartilhada e não é alterada pela revisão. Dias e painel mostram as versões correspondentes.

Limites, decisões e evidências em [Sprint 5](sprints/sprint-5.md), [ADR-003](decisoes/adr-003-regras-versionadas.md) e [operação](sprints/sprint-5-operacao.md). Migração/publicação/homologação pendentes; esta seção não declara entrega remota. As seções seguintes preservam a visão e os recortes anteriores quando superados por esta evolução.

## 1. Identificação do projeto

| Campo | Descrição |
| --- | --- |
| Nome | GeoGuaras |
| Objetivo | Registrar pontuações pessoais de GeoGuessr e administrar torneios configuráveis. |
| Público-alvo | Jogadores de GeoGuessr e usuários que organizam torneios. |
| Plataforma | Aplicação web responsiva. |
| Versão do documento | 1.4 — Perfil público e URL do GeoGuessr (21/09/2026) |

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
| Calendário | Determinar os dias válidos de jogo. | Selecionar segunda a sexta ou todos os dias; excluir datas específicas. | Organizador. |
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
3. Escolhe o calendário: segunda a sexta ou todos os dias, incluindo sábado e domingo.
4. Opcionalmente exclui datas, como feriados.
5. Escolhe o modo absoluto ou relativo ao menor resultado positivo do dia.
6. Define a penalidade por ausência.
7. Adiciona os participantes.

### 4.3 Consultar torneios e ranking

1. O usuário acessa sua lista de torneios participantes.
2. Seleciona um torneio.
3. O sistema exibe período, regras, participantes, resultados e ranking.
4. A classificação posiciona a maior pontuação total em primeiro lugar.

### 4.4 Perfil público — Sprint 4

O jogador escolhe seu nome público, único em toda a plataforma, e pode informar a URL do perfil no GeoGuessr. Competidores e organizadores de torneios em comum veem o nome e podem abrir o link, sem acesso ao e-mail cadastrado. A edição pertence ao titular e preserva pontuações e vínculos. Ver [Perfil público](perfil-publico.md).

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

A revisão 1.4 acrescenta RF17–RF18 à Sprint 4, com reestimativa de esforço antes do compromisso. A Sprint 3 permanece encerrada.

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



Complemento aprovado S5-04 (RF07/RF10, RNF04): resultados diários exibem inicialmente cinco dias disponíveis mais recentes, com Ver todos/Mostrar menos quando excederem cinco. Ranking considera todo o período elegível; expansão não altera totais, regras ou permissões. Nova seleção de torneio começa reduzida. Histórico pessoal também exibe cinco lançamentos recentes com expansão/redução independente, dentro dos até 100 registros consultados. Lista de torneios fora desse recorte. Implementação local e funcionamento de S5-04 confirmado pelo Dono do produto; identificação da versão/ambiente não informada.

03/10/2026 — S5-05 autorizada: investigar primeira abertura/troca lenta e aviso intermitente. Carregamento, nova tentativa explícita e métricas sem dados pessoais implementados localmente; causa remota não confirmada. Sem migração. Publicação, linha de base e homologação pendentes. Ver seção 11 da Sprint 5 e ADR-005.

## Minhas estatísticas — RF20

No painel, abra “Minhas estatísticas”. Inicialmente a tela considera os cinco dias jogados mais recentes, mesmo separados por dias sem jogo. Escolha últimos 30 dias ou desde o início e pressione “Aplicar período” para atualizar médias e gráfico. Os 30 dias incluem hoje e os 29 dias anteriores no horário de São Paulo. Cada dia representa cinco jogos; zero e dias sem lançamento são excluídos. As médias usam pontuação bruta pessoal e arredondamento final, independentemente de punições de torneio. Abra “Ver valores do gráfico” para consultar todas as datas e pontuações; em telas pequenas, há rolagem horizontal. Sem positivos: mensagem sem métricas. Se o carregamento falhar, tente novamente. Cada conta consulta somente suas próprias estatísticas.
