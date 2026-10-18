# Sprint 7 — Filtrar aprovação de ajustes por torneio

18/10/2026 — Dono do produto confirmou comparação pós-006: business_snapshot=preserved, tournament_adjustment_filter=installed. Preservação integral das 20 seções em relação ao backup reutilizado before-notifications-20261018-v1 e instalação da consulta de filtro confirmadas pelo retorno. Migração e comparação concluídas; não repetir scripts ou nova captura. Pausa nas gravações pode terminar e interface está pronta para o fluxo de publicação do Dono do produto. Deployment efetivo e homologação visual/funcional do filtro ainda aguardam evidências. Nenhuma operação remota realizada pelo agente.

18/10/2026 — Dono do produto informou Success. No rows returned após executar 202610180006_tournament_adjustment_filter.sql. Execução remota da migração 006 confirmada pelo relato; não reaplicar. Conforme decisão anterior, referência reutilizada before-notifications-20261018-v1 já exportada/validada, sem novas gravações de negócio relatadas desde a captura. Próximo passo executar 03-verify-after-install.sql de tournament-adjustment-filter, atualizado para comparar as 20 seções a esse backup. Manter pausa nas gravações até comparação. Preservação pós-006, publicação e homologação do filtro ainda não confirmadas. Nenhuma operação remota realizada pelo agente.

18/10/2026 — Dono do produto dispensou nova captura para 006 e confirmou explicitamente não ter havido gravações de negócio desde before-notifications-20261018-v1. Reutilização autorizada desse backup já exportado/validado: captured_at=2026-10-18 21:57:17.688117+00, checksum aa4e6f776d7f92f0bc1aaea2e8545ec0, 20 seções e cinco definições. Não executar nova captura/exportação nem sobrescrever a referência. 03-verify-after-install.sql de tournament-adjustment-filter atualizado para comparar a essa captura anterior; continua verificando integralmente o estado de negócio e recusa divergência. Teste local específico aprovado para uso da referência reutilizada. Substitui a orientação anterior de backup novo para este incremento; migração 006, comparação e publicação do filtro ainda não confirmadas. Próximo passo aplicar somente 202610180006_tournament_adjustment_filter.sql. Nenhuma operação remota realizada pelo agente.

Pedido do Dono do produto em 18/10/2026: usar a mesma distribuição visual das auditorias para aprovar ajustes retroativos. Implementação local na gestão de notificações: seletor Torneio, nome e contagem de ajustes pendentes, botão Consultar ajustes e identificação do torneio consultado. Somente solicitações e decisões daquele torneio são apresentadas. Seletores de ajustes e auditorias são independentes e preservam a seleção um do outro.

O parâmetro `adjustment_tournament` mantém o filtro de ajustes na URL; `tournament` continua selecionando auditorias. Alterar o torneio dos ajustes reinicia a paginação. Alterar auditorias conserva filtro/página dos ajustes; links de paginação preservam as duas seleções. Na abertura sem filtro, priorizar um torneio com ajustes pendentes, depois o primeiro organizado. Seleção inexistente/não organizada mostra indisponibilidade sem consultar pedidos de outro torneio. Meus pedidos permanece pessoal e sem aprovação.

Escolha técnica: nova RPC autenticada `get_tournament_score_changes(target,page_number)`, na migração `202610180006_tournament_adjustment_filter.sql`, filtra o torneio antes de paginar 50 solicitações e limita as decisões ao mesmo torneio. Prioridade de pendências também é local ao torneio escolhido; pendência em outro torneio não desloca um item deste. Permissão exige que a conta organize o torneio; participante sem esse papel não acessa a consulta. Nenhuma mudança de tabela, pontos, decisão, voto ou regras. Consultas anteriores permanecem compatíveis.

## Implantação

A migração 005 e sua comparação foram confirmadas remotamente. Conforme decisão posterior do Dono do produto, reutilizar a captura/exportação já validadas de 005, pois ele confirmou ausência de novas gravações de negócio. Não repetir scripts de captura ou migrações anteriores.

1. Manter a pausa nas gravações de negócio e usar a referência já validada `before-notifications-20261018-v1` (20 seções, cinco definições; checksum `aa4e6f776d7f92f0bc1aaea2e8545ec0`). Dono do produto autorizou reutilização e confirmou nenhuma gravação desde a captura. Arquivos privados já preservados em `backups/notification-workspaces/`. Não sobrescrever ou executar outra captura/exportação para este incremento.
2. Aplicar somente `web/supabase/migrations/202610180006_tournament_adjustment_filter.sql`, completo, uma vez. É uma nova consulta, sem reescrever dados.
3. Executar `03-verify-after-install.sql`, completo. Esperado: `business_snapshot=preserved`, `tournament_adjustment_filter=installed`. Compara todas as 20 seções na data da captura, sem exigir tabelas de retroativos vazias. Investigar qualquer divergência sem restauração automática ou repetição da migração.
4. Depois da comparação, interface pronta para o fluxo de publicação do Dono do produto; registrar deployment/ambiente antes de declarar publicação. Liberar gravações após comparação. Nenhum segredo, job ou extensão novo.

## Homologação

- Selecionar dois torneios organizados e conferir que a lista apresenta somente os ajustes e decisões do selecionado, com contagem de pendências, inclusive vazio e encerrado somente para consulta.
- Escolher torneios diferentes nos dois seletores e confirmar independência. Alterar auditorias não muda os ajustes. Links e recarga/voltar/avançar preservam a URL. Trocar ajuste retorna à primeira página; paginação conserva ambos os filtros.
- Com mais de 50 pedidos em um torneio e poucos em outro, conferir paginação independente sem ocultar pedidos do menor. Pendências aparecem antes dos decididos, apenas dentro do selecionado.
- Aprovar/recusar conserva o efeito somente no torneio correspondente e atualiza contagens pelos RPCs de decisão existentes. Dados anteriores e valores aceitos permanecem preservados. Não criar valores artificiais em contas legítimas nem auditorias de teste nos torneios ativos.
- Verificar celular/teclado, indisponibilidade de consulta sem vazio fictício e tentativa de URL de torneio não organizado. UI e RPC mantêm a autorização.

## Situação e recuperação

Implementação local. Captura/exportação anteriores validadas e reutilizadas por decisão explícita do Dono do produto; execução remota da migração 006, comparação, publicação e homologação deste filtro ainda não confirmadas. Validação local final: 120 testes completos aprovados, zero falhas/pulados, lint dos dois arquivos de aplicação alterados e build com TypeScript aprovados. Evidências registradas na Sprint 7. Os scripts de backup/comparação foram exercitados localmente com dados de ajustes já existentes. Sem alterações do modelo e das transações de aprovação da ADR-011; complementa a consulta administrativa da ADR-012.

Se for necessário suspender a nova apresentação, as consultas anteriores continuam disponíveis. Não remover dados ou restaurar snapshot antigo para reverter apenas o filtro. Nenhuma execução remota realizada pelo agente.
