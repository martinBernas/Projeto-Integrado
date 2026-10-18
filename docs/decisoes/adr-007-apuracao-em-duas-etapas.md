# ADR-007 — Consultar votos antes de escolher a punição

18/10/2026 — O Dono do produto informou o retorno “Success. No rows returned” após executar a migração incremental `202610180001_audit_tally.sql`. Execução remota da migração confirmada por esse relato; não reaplicar. Ambiente/identificador e horário exato não informados. Publicação da interface, uso da nova consulta, homologação e aceite deste incremento ainda não confirmados. Novo backup/exportação não confirmado. Este registro substitui as referências anteriores à migração deste incremento como pendente; preserva os demais registros como históricos.

Data: 18/10/2026. Situação: implementada localmente, com autorização funcional do Dono do produto; migração e publicação deste incremento não realizadas.

## Contexto e decisão funcional

O fluxo anterior pedia uma punição condicional sem mostrar o resultado da votação. O Dono do produto solicitou visualizar os votos antes de decidir a punição. A interface passa a oferecer “Apurar votos” e, após mostrar totais e resultado, “Aplicar punição e encerrar” ou “Manter pontuação e encerrar”. Empate e nenhum voto mantêm a pontuação. A escolha da punição fica disponível apenas para maioria pela invalidação, sem seleção inicial.

## Escolha técnica

Adicionar `preview_score_audit(uuid)` por migração incremental `202610180001_audit_tally.sql`. A RPC reutiliza `private.require_audit` para autenticar, exigir organizador e torneio aberto e bloquear torneio/avaliação; exige estado `open` e prazo vencido. Retorna somente contagens agregadas, sem identidades ou eventos. Não grava decisão, não recalcula e não modifica a avaliação. Os votos já estão bloqueados pelo prazo; a contagem permanece estável. Não há nova tabela ou estado persistido.

Server Action retorna a contagem ao componente cliente `AuditResolution`. O resultado fica na memória da tela e é perdido ao recarregar; a consulta pode ser repetida. Não é uma decisão final registrada. A projeção geral continua exibindo totais somente após encerramento. Enquanto isso, participantes veem espera pela apuração e o ranking continua com os valores originais.

A confirmação reutiliza `resolve_score_audit`, que verifica autorização, prazo e votos no banco, exige punição para maioria pela invalidação e grava decisão, sanção, snapshots e recálculo em transação idempotente. Não confia nos totais enviados pelo navegador. A RPC antiga permanece compatível; a separação de etapas é um contrato da interface, não uma exigência de token de prévia. Contas com permissão de organizador continuam capazes de chamar a resolução diretamente, respeitando as validações existentes. Reabertura, votos fora do prazo e acesso direto às tabelas continuam indisponíveis.

## Consequências e implantação

Complementa ADR-006: consulta agregada pelo organizador passa a existir após o prazo, antes da decisão final. Sigilo durante votação e sigilo de autoria permanecem. Sem alteração das regras de cálculo ou das proteções de avaliações pendentes. Apenas o encerramento confirmado gera o evento histórico `resolved`; a consulta não gera novo evento.

Aplicar somente a nova migração após as migrações existentes e antes de publicar a interface. Preservar backup privado e registrar evidências conforme [operação S6](../sprints/sprint-6-operacao.md). A função não altera dados existentes. Falha/ausência da função mostra erro e permite repetir a consulta, sem recorrer à escolha de punição às cegas. Em rollback da interface, a função adicional pode permanecer instalada sem modificar o comportamento anterior.

Testes e situação da entrega na [Sprint 6](../sprints/sprint-6.md). Homologar duas sessões reais, recarga, celular e teclado após publicação. Testes PGlite não comprovam concorrência remota.
