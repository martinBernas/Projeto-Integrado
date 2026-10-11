# Sprint 6 — Auditoria por votação

## Situação em 11/10/2026

O Dono do produto solicitou planejar e executar a próxima sprint e aprovou as regras após o refinamento nesta conversa. S6-01–S6-03 implementadas localmente com migração incremental, ações, página de auditorias e integração ao painel/cálculo. Verificação final local aprovada: 82 testes, lint e build. Migração remota, publicação, homologação e aceite pendentes; sprint não encerrada. Sprint 5 permanece aceita e encerrada.

## Objetivo e backlog

Entregar RF13–RF16 de ponta a ponta: solicitação justificada por participante, aprovação pelo organizador antes da abertura da votação, votação dos eleitores elegíveis, apuração pelo organizador após o prazo e decisão rastreável restrita ao torneio denunciante.

| História | Entrega e critérios | Estimativa relativa preliminar |
| --- | --- | --- |
| S6-01 | Solicitar auditoria com justificativa obrigatória; registrar solicitante e abrir avaliação com prazo conforme fluxo confirmado; votar com autorização no banco; consultar avaliação e situação do voto. Rejeitar solicitante/eleitor inelegível, duplicidade e voto fora do prazo. | 5 pontos, a reavaliar conforme fluxo do pedido |
| S6-02 | Apurar após o prazo pelo organizador; manter ou invalidar conforme regra confirmada; escolher desconsideração ou penalidade somente quando houver invalidez. Apuração repetida não duplica efeitos. | 5 pontos |
| S6-03 | Recalcular e registrar decisão e resultados anteriores/posteriores; preservar bruto e outro torneio; exibir histórico e explicação do resultado. | 8 pontos |

Estimativas técnicas preliminares incluem implementação, testes locais, documentação e preparação dos procedimentos remotos; não representam horas, tokens consumidos ou capacidade confirmada. Publicação e homologação exigem execução e evidências próprias. Não há prazo de conclusão assumido. O fluxo completo é a unidade de entrega; não disponibilizar punição isolada antes da votação e apuração.

## Refinamento e aprovação funcional

Decisão posterior do Dono do produto em 11/10/2026: qualquer participante do torneio pode pedir auditoria, com justificativa obrigatória. O organizador aprova o pedido antes de abrir a votação; o prazo de 48 horas começa na abertura, e não no pedido. Substitui iniciativa exclusiva do organizador. Motivo obrigatório passa a ser decisão confirmada, aplicado ao pedido.

Em 11/10/2026, o Dono do produto confirmou o primeiro conjunto: eleitorado na abertura excluindo o auditado, organizador participante apto a votar, prazo de 48 horas, maioria simples dos votos recebidos sem quórum mínimo, manutenção em empate/nenhum voto e alteração do voto até o prazo. Confirmou posteriormente votos secretos: cada eleitor consulta seu próprio voto; os demais jogadores e o organizador não recebem autoria individual na aplicação; o sistema a preserva internamente para rastreabilidade. O resultado agregado da apuração pode ser consultado sem nomes de votantes. Motivo obrigatório também confirmado. Efeito provisório, unicidade de auditoria e recálculo/punição continuam propostos, aguardando resposta.

- Eleitores: participantes no momento da abertura, excluindo o auditado; organizador participa da votação se também for participante.
- Prazo de 48 horas a partir da abertura, armazenado como instante; apresentação em America/Sao_Paulo.
- Maioria simples dos votos recebidos, sem quórum mínimo; empate ou nenhum voto mantém a pontuação.
- Um voto por eleitor, alterável até o prazo; uma auditoria por par torneio/pontuação, sem recurso ou reabertura nesta sprint.
- Pontuação permanece no ranking durante a avaliação; motivo obrigatório; autoria dos votos oculta dos demais jogadores, preservada internamente para rastreabilidade.
- Punição escolhida na apuração; invalidação exclui o bruto da referência relativa do dia. Desconsideração gera contribuição zero, sem transformá-la em ausência; penalidade usa a regra aplicável à data auditada.

Também verificar os contratos de encerramento, edição de pontuação, revisão de regra e remoção de participantes: operações concorrentes não podem tornar a votação ou decisão incoerente. Restrições adicionais que afetem o comportamento funcional devem ser registradas no refinamento, sem presumir aprovação.

## Execução técnica prevista

1. Confirmar o refinamento e registrar decisões e critérios de aceite.
2. Preparar migração incremental com avaliações, eleitorado, votos, apuração e políticas de acesso. Autorizar mutações por RPCs com identidade autenticada e transações no torneio alvo.
3. Integrar decisão ao cálculo canônico e à prévia de regras. Preservar a pontuação pessoal e a auditoria anterior/posterior; documentar arquitetura e diagrama.
4. Implementar telas e ações de abertura, voto, apuração e histórico com mensagens de prazo, resultado e punição.
5. Executar testes de banco, autorização, concorrência, cálculo absoluto/relativo, isolamento e regressão; lint e build.
6. Preparar backup, comparação anterior/posterior e roteiro de homologação. Registrar separadamente execução local, migração remota, publicação e aceite.

## Inspeção e riscos conhecidos

A migração vigente de regra única é `202610030002_single_tournament_rule.sql`. O cálculo `private.calculate_versioned_tournament` também atende às prévias de revisão; a integração da auditoria precisa preservar os dois caminhos. O menor positivo é calculado antes da contribuição diária: invalidar apenas a contribuição final deixaria a referência relativa incorreta. Resultados hoje usam os estados score/absence/pending; o contrato de apresentação precisa explicar desconsideração e penalidade de auditoria sem confundi-las com ausência comum.

As operações existentes bloqueiam a linha do torneio e preservam torneios encerrados. A implementação deverá manter essa consistência. Não há integração remota acessada nem backup novo capturado nesta etapa; não armazenar dados pessoais ou credenciais na documentação.

## Evidências desta etapa

Leitura do planejamento, encerramento S5, requisitos, auditoria funcional, arquitetura, migrações de regras, tipos do painel e infraestrutura de testes PGlite. Árvore de trabalho inicialmente limpa. Nesta etapa documental, não foram executados testes da aplicação; verificação de formatação por `git diff --check`.

## Pendências atuais

Situação remota vigente em 11/10/2026: backup/exportação validados, migração aplicada e comparação remota aprovada por retorno do Dono do produto: `preserved = true`, checksums anterior/atual iguais a `99a06d73cc74acb813732eca01f03bc9`. Dados, históricos e cálculo preservados na referência. Pendências atuais: publicação da interface compatível, homologação dos cenários/restrições e aceite. Registros de migração/comparação pendentes abaixo são históricos e substituídos por esta evidência. Não reaplicar a migração.

Evidência posterior em 11/10/2026: migração `202610110001_score_audits.sql` executada pelo Dono do produto no Supabase, com retorno `Success. No rows returned`. Execução remota da migração confirmada; comparação de preservação, publicação, homologação e aceite permanecem pendentes. Substitui a pendência de migração nos registros anteriores. Não reaplicar.

Evidência posterior em 11/10/2026: exportação privada recebida e validada localmente, com 13 seções, 4 torneios, 362 pontuações e duas definições de funções; checksum recalculado igual à captura. Backup/exportação concluídos. Migração remota, comparação anterior ao uso, publicação e homologação ainda pendentes. Substitui a pendência de exportação nos registros anteriores.

Evolução remota em 11/10/2026: captura `before-s6-v1` executada pelo Dono do produto e confirmada pelo retorno, com 4 torneios, 362 pontuações e checksum `99a06d73cc74acb813732eca01f03bc9`. Detalhes em [operação](sprint-6-operacao.md). Captura concluída; exportação/validação ainda pendente. Esse retorno substitui apenas a pendência de captura descrita nos registros da entrega local; migração, comparação, publicação e homologação não confirmadas.

Regras funcionais confirmadas, implementação e testes locais concluídos. Pendências: execução e validação do backup/exportação privados no ambiente remoto; migração/comparação antes do uso; publicação da aplicação compatível; homologação e aceite pelo Dono do produto. Os registros de propostas acima são históricos e foram resolvidos pela aprovação abaixo.

## Verificação final local — 11/10/2026

`pnpm test`: 82 aprovados, zero falhas/pulados; `pnpm lint` e `pnpm build` aprovados; `git diff --check` sem erros de whitespace. Testes cobrem sigilo/permissões, eleitorado/prazo, duplicidade, duas punições, empate/nenhum voto, isolamento/bruto preservado, revisão para absoluto, penalidade histórica, idempotência e rollback por falha forçada. Captura e comparação S6 ensaiadas em PGlite com dados fictícios; sintaxe do script de captura corrigida e revalidada. Renderização estática confere página e formulários por papel/estado. Detalhes no [plano de testes](../plano-de-testes.md).

## Aprovação e implementação — 11/10/2026

Após esclarecer o sigilo dos votos, o Dono do produto declarou “regras aprovadas”, confirmando as propostas restantes: manutenção da pontuação durante a avaliação, uma auditoria por pontuação/torneio sem recurso/reabertura, recálculo sem o inválido na referência relativa e punição alternativa escolhida pelo organizador. Não há pendência de refinamento dessas regras.

S6-01 foi reestimada tecnicamente em 8 pontos pela inclusão do fluxo pedido/aprovação; S6-02/S6-03 permanecem 5/8. São estimativas relativas, sem capacidade quantitativa ou data de conclusão assumidas.

- Migração `202610110001_score_audits.sql`: avaliações, eleitorado, votos e eventos privados com RLS; RPCs autenticadas de pedido, revisão, voto, apuração e consulta autorizada.
- Página `/dashboard/tournaments/[id]/audits`, acessível pelo painel: solicitação justificada, aprovação/rejeição, voto próprio secreto, apuração e histórico do impacto diário. Encerrados permitem consulta.
- Cálculo canônico e prévia incorporam invalidação antes da referência relativa. Painel distingue desconsideração e penalidade por auditoria. Brutos e outros torneios preservados; snapshots antes/depois guardados na decisão. Penalidade fixada na apuração permanece após revisões de regras.
- Scripts de captura/exportação/comparação preparados e exercitados localmente com dados fictícios. Nenhum backup novo capturado no remoto. [Operação](sprint-6-operacao.md), [ADR-006](../decisoes/adr-006-auditoria-por-votacao.md) e [diagrama](../diagramas/auditoria-votacao.md).

Escolhas técnicas adicionais de integridade, a homologar: pedido/votação pendente bloqueia encerramento/revisão de regras e mudança de vínculo do auditado; correção do bruto em avaliação também aguarda conclusão para impedir troca do valor votado. Eleitor removido perde acesso, mas seu voto anterior permanece válido; novos integrantes não entram no eleitorado fixado. A chave única inclui pedidos rejeitados. Essas escolhas não são apresentadas como decisões funcionais especificamente confirmadas pelo Dono do produto.

Limites: sem apuração automática, notificações, atualização em tempo real, paginação de avaliações, recurso ou nova solicitação após rejeição do mesmo par. Atualizar página para consultar novos estados. PGlite/renderização estática não comprovam concorrência real entre conexões Supabase ou homologação visual em navegador/mobile.
