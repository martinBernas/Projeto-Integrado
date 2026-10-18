# Lançamentos retroativos — S7-01 / FB02

18/10/2026 — Evolução local da gestão: ajustes retroativos passam a ter seletor de torneio, contagem de pendências e botão Consultar ajustes, independente do seletor de auditorias. Somente solicitações e decisões daquele torneio aparecem, com filtro no banco antes de paginar. Dados existentes e regras de aprovação preservados. 120 testes, lint e build com TypeScript aprovados; migração 006/publicação/homologação deste filtro ainda pendentes. [Roteiro atual](sprints/sprint-7-filtro-ajustes-operacao.md).

## Regras confirmadas em 18/10/2026

O Dono do produto aprovou inclusão na Sprint 7. O jogador pode incluir ou corrigir seu resultado bruto de qualquer data passada, sem limite de dias, com justificativa textual obrigatória. O histórico e as estatísticas pessoais passam a usar imediatamente esse valor. O lançamento de hoje continua no formulário existente, com suas regras e proteção contra alteração durante auditoria.

Cada torneio aberto afetado recebe um pedido independente no painel de seu organizador. São afetados os torneios em que o jogador está vinculado, elegível e com a data dentro do período e do calendário vigente, incluindo exclusões. Sem torneio aberto elegível, a operação altera somente o histórico pessoal. Novos vínculos criados depois da solicitação usam o histórico pessoal então vigente, sem gerar aprovação retroativa para uma solicitação anterior ao vínculo.

Até aprovação, cada torneio conserva seu próprio bruto anterior, inclusive ausência sem lançamento. A aprovação aceita o novo bruto e recalcula o torneio inteiro, pois o menor positivo pode alterar os resultados de outros participantes. A recusa conserva o bruto anterior, inclusive nos recálculos futuros. Nenhuma decisão desfaz o histórico pessoal ou altera outro torneio. Zero continua sendo ausência; as regras existentes de pontuação e calendário continuam valendo.

Uma nova alteração do mesmo jogador/dia fica bloqueada enquanto qualquer torneio envolvido tiver pedido pendente. Após todas as decisões, outra alteração pode gerar novos pedidos. O valor anterior pessoal e o valor anterior em cada torneio podem ser diferentes e são apresentados separadamente. Enviar valor igual ao atual histórico pessoal é recusado para evitar pedidos duplicados sem alteração.

O organizador que também joga pode decidir sua própria solicitação. Auditoria solicitada ou votação aberta para a pontuação bloqueia aprovação naquele torneio; a recusa permanece disponível. Atualizar o histórico pessoal não muda o bruto avaliado pela auditoria. Sanções já decididas continuam prevalecendo mesmo após aprovar um novo bruto. A política existente de uma auditoria por pontuação/torneio não foi ampliada.

Pedidos pendentes impedem encerramento. Como proteção técnica de consistência, também impedem revisão do período/regras/calendário e mudança/remoção da elegibilidade do jogador envolvido até decisão. Renomear o torneio permanece possível. Torneios encerrados não recebem pedidos e seus resultados armazenados permanecem congelados; aprovação posterior ao encerramento é recusada no banco.

## Interface e acesso

Após correção de organização solicitada em 18/10/2026, o botão “Meus pedidos” abre `/dashboard/requests`: formulário retroativo, histórico somente próprio em páginas de 50 pedidos e abertura/acompanhamento das próprias denúncias por torneio de participação, sem controles administrativos. Somente organizadores recebem quadro no painel e acesso a “Gerenciar notificações dos torneios” (`/dashboard/notifications`), com decisões de ajustes e auditorias dos torneios que organizam. A rota antiga `/dashboard/score-changes` redireciona a Meus pedidos. Avisos de votação aberta são apresentados aos participantes até o prazo, inclusive após votar. Sem e-mail, push ou atualização em tempo real. [ADR-012](decisoes/adr-012-pedidos-e-notificacoes.md).

O jogador consulta suas próprias solicitações e todas as decisões correspondentes. O organizador consulta somente solicitações e decisões dos torneios que organiza, além das próprias como jogador. A página mostra justificativa, bruto anterior pessoal, novo bruto, bruto anterior por torneio, estado, responsável e data da decisão em São Paulo. Nomes seguem a política vigente de nome público, sem usar e-mail como alternativa.

Justificativa de 3 a 1.000 caracteres após remover espaços nas extremidades; bruto inteiro de 0 a 25.000; datas reais anteriores a hoje em São Paulo. Formulários pedem confirmação e anunciam envio/erro/sucesso. O banco é a autoridade final para datas, acesso, pendências, auditoria e encerramento. Repetir a mesma decisão é idempotente; tentar substituí-la pela decisão oposta é recusado.

## Implementação e limites

Migração incremental `202610180004_retroactive_scores.sql`, sem reescrever linhas de negócio existentes. Três tabelas privadas sob RLS e sem grants diretos para clientes: `retroactive_score_changes`, `score_change_decisions` e `tournament_score_inputs`. O log preexistente `private.score_changes` continua separado e preservado. [Decisão arquitetural](decisoes/adr-011-lancamentos-retroativos.md) e [fluxo](diagramas/lancamentos-retroativos.md).

O cálculo canônico, suas prévias e estatísticas de torneio usam o bruto aceito localmente quando existe um registro explícito; caso contrário, usam o pessoal. O registro explícito pode conter NULL, que representa ausência anterior, sem cair no valor pessoal recém-inserido. A solicitação de auditoria lê o bruto efetivo do torneio, preservando evidências anteriores mesmo quando o pessoal já mudou.

Por simplicidade e consistência com o volume atual, o envio retroativo bloqueia as linhas de todos os torneios abertos em ordem de UUID antes de alterar o pessoal; isso estabiliza calendário, elegibilidade e encerramento e pode aumentar contenção. O bloqueio por jogador/data também serializa alterações sem torneios. A revisão bloqueia somente seu torneio e a decisão; aprovação e recálculo são uma transação. A leitura/listagem não bloqueia os demais torneios. Escala e contenção remotas ainda não medidas.

Histórico usa paginação por deslocamento e pode mudar de página se chegarem pedidos entre consultas; recarregar quando necessário. Sem cancelamento/reabertura de decisões, sem notificações externas, sem atualização automática de torneios encerrados e sem novo mecanismo de auditoria por votação. O recorte não conclui todo o RF08 nem o histórico avançado de RF09.

## Situação

O fluxo principal foi homologado pelo Dono do produto nos cenários relatados: pessoal imediato, decisões independentes, bloqueio até todas as decisões e correções sucessivas com valores diferentes de 23.000/25.000 por torneio. Migração 004 e comparação remota concluídas; apresentação em aplicação utilizada confirmada, sem identificação formal de URL/versão. Esses registros não comprovam todos os cenários de auditoria/encerramento ou concorrência real.

A separação de telas e avisos da migração 005 está concluída localmente: 119 testes completos, lint dos arquivos de aplicação afetados e build com TypeScript aprovados. Backup novo de 20 seções, migração 005, comparação, publicação e homologação desta correção ainda pendentes; não repetir a 004. [Roteiro atual](sprints/sprint-7-notificacoes-operacao.md). Auditorias de teste somente em torneios isolados, conforme orientação do Dono do produto.