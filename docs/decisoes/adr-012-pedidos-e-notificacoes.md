# ADR-012 — Separar pedidos pessoais, gestão e votação

Complemento de 18/10/2026 solicitado pelo Dono do produto: aprovação de ajustes ganha seletor por torneio, com contagem de pendências e botão Consultar ajustes, no mesmo padrão visual das auditorias. Nova RPC get_tournament_score_changes(target,page_number) faz autorização, filtro de solicitações/decisões e prioridade local antes da paginação. Seleção de ajustes usa adjustment_tournament, auditorias mantêm tournament; paginação conserva ambos. Não filtrar apenas a página já carregada, pois isso ocultaria pedidos quando outros torneios ocupassem o limite. Consulta anterior continua compatível. Migração 006 não modifica dados, tabelas ou cálculo; execução remota deste complemento ainda não confirmada. [Roteiro](../sprints/sprint-7-filtro-ajustes-operacao.md).

Data: 18/10/2026. Decisão funcional confirmada pelo Dono do produto; implementação técnica local. Substitui a apresentação conjunta de solicitação e aprovação da ADR-011, preservando seu modelo de dados e transações.

## Contexto e decisão funcional

O Dono do produto distinguiu solicitar de aprovar: jogadores devem ter um botão de acesso aos pedidos, e somente organizadores devem ver o quadro de notificações administrativas. Pediu reunir ajustes retroativos e abertura de denúncias em uma tela pessoal e concentrar aprovações/auditorias em “Gerenciar notificações dos torneios”. Auditorias pendentes também devem notificar o organizador; participantes devem receber aviso enquanto houver votação aberta.

## Implementação

- `/dashboard/requests` (“Meus pedidos”): formulário retroativo, somente ajustes próprios com decisões para consulta, abertura de denúncia por torneio de participação e consulta das próprias denúncias do torneio selecionado. Nenhum controle de aprovação, apuração ou voto.
- `/dashboard/notifications`: acesso exclusivo a organizadores, fila de ajustes dos torneios organizados com pendências primeiro, avaliação das denúncias, acompanhamento das votações e apuração/punição no torneio selecionado. Não contém formulário de solicitação nem voto. Organizadores participantes continuam usando os acessos pessoais para solicitar/votar.
- `/dashboard/tournaments/[id]/audits`: votação e histórico autorizado do torneio, com links para pedidos e gestão conforme o papel. Sem formulários de denúncia ou decisão administrativa. Âncoras existentes dos avisos diários continuam funcionando.
- `/dashboard/score-changes`: redirecionamento para pedidos pessoais, preservando página válida; o caminho anterior deixa de misturar ações.

Notificações são projeções do estado atual, sem novas tabelas de notificação e sem marcação de leitura que possa ocultar uma pendência. A nova RPC `get_tournament_notifications` devolve somente torneios organizados, torneios de participação e votações abertas da conta autenticada. O painel mostra quadro administrativo apenas para organizadores. Contagens distinguem ajustes pendentes, denúncias solicitadas, auditorias em votação e auditorias com prazo vencido aguardando apuração.

Participantes atuais recebem aviso de votação aberta até o prazo, inclusive depois de votar. `has_voted` refere-se somente à própria conta. O auditado ou participante incluído depois da abertura pode acompanhar sem direito a voto; a ausência de eleitorado é explicada. Revogação de vínculo elimina o aviso; prazo vencido retira o aviso de votação e mantém pendência de apuração para o organizador. Nenhum voto alheio, autoria ou total antecipado é exposto.

Novas RPCs `get_personal_score_changes` e `get_managed_score_changes` usam helper privado sem grants ao cliente. Escopo é filtrado no banco antes da paginação, inclusive decisões de pedidos próprios quando consultados pela gestão: somente as decisões dos torneios organizados. A tela pessoal nunca recebe `can_review=true`. A listagem anterior permanece para compatibilidade de publicação, com a autorização que já possuía; novas telas não a usam.

`get_score_audits` passa a devolver somente o booleano `requested_by_me`, sem identidade do solicitante, para a consulta pessoal. Componentes compartilhados recebem modos explícitos para renderizar os controles adequados, mas autorização de mutações continua nos RPCs existentes. Server Actions invalidam o layout do painel para atualizar as três superfícies.

## Consequências e implantação

Migração incremental `202610180005_notification_workspaces.sql`: novas consultas e extensão compatível do JSON de auditoria, sem alterar dados, tabelas, pontos, pedidos, decisões, votos, prazos ou apuração. Nenhum job ou segredo novo. Aplicar antes da nova interface. Captura administrativa nova inclui as 20 seções de negócio, agora com solicitações, decisões e entradas locais de retroativos existentes, e cinco definições anteriores de funções. Comparação integral após a migração não exige tabelas de retroativos vazias.

Sem atualização em tempo real, e-mail, push ou contador de não lidos: avisos refletem a última consulta/recarga. Resumo cresce com o número de torneios e votações abertas; histórico de ajustes segue paginado em 50 itens. O histórico completo de auditorias mantém a consulta autorizada existente para o torneio selecionado. Não consultar todos os dashboards nem recalcular todos os torneios para produzir avisos; a RPC de resumo é somente leitura.

Conferência remota deve usar torneios e contas isolados para auditorias de teste, conforme restrição expressa do Dono do produto. Não abrir auditoria de conta de testes em torneios ativos com participantes legítimos. [Roteiro](../sprints/sprint-7-notificacoes-operacao.md) e [diagrama](../diagramas/notificacoes.md).
