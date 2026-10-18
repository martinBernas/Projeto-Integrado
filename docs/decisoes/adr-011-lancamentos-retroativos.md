# ADR-011 — Valores aceitos por torneio para lançamentos retroativos

Data: 18/10/2026. Situação: escolha técnica para implementação local da S7-01, baseada nas regras funcionais confirmadas pelo Dono do produto. Migração remota/publicação não confirmadas.

## Contexto

Uma pontuação pessoal é compartilhada por vários torneios. O Dono do produto definiu atualização pessoal imediata e aprovação independente em cada torneio aberto, mantendo resultados anteriores até aprovação ou após recusa. Atualizar apenas `personal_scores` faria o recálculo normal aplicar a alteração em todos os torneios, contrariando essa decisão.

## Decisão

Criar `private.retroactive_score_changes` como solicitação pessoal imutável e `private.score_change_decisions` como decisões independentes por torneio. O log existente `private.score_changes` continua registrando alterações do pessoal; não reutilizar esse log técnico como fila de aprovação.

Criar `private.tournament_score_inputs`, chave torneio/jogador/data, que guarda o bruto aceito nesse contexto e sua referência pessoal. Antes de alterar o pessoal, capturar o bruto efetivo e sua referência em cada torneio afetado. NULL explícito conserva uma ausência sem lançamento; a escolha entre fonte pessoal/local depende da existência da linha, não de COALESCE do bruto.

O cálculo canônico `calculate_versioned_tournament` escolhe a fonte aceita antes de calcular o menor positivo e aplicar a regra. Isso integra ranking, prévias e RF21 pelo caminho existente, sem duplicar fórmulas. Ausência, zero e sanções continuam com suas precedências vigentes. Encerrados continuam usando resultados armazenados e não são recalculados.

RPCs autenticadas e SECURITY DEFINER, com search_path vazio, validam identidade e autorização. As três tabelas privadas têm RLS sem acesso direto para clientes. Resumo expõe somente contagens próprias; listagem paginada restringe solicitações e decisões ao jogador e ao organizador pertinente. Justificativas não são enviadas aos logs operacionais.

Envio toma advisory lock por jogador/data, depois bloqueia todos os torneios abertos em ordem de UUID e só então a linha pessoal. Essa escolha conservadora estabiliza alterações concorrentes de calendário, vínculos e encerramento, reaproveitando a ordem torneio-antes-pessoal do lançamento atual. O custo é contenção entre torneios sem relação durante o envio retroativo; reavaliar com volume real. Aprovação toma a linha do torneio e depois a decisão, sem tomar advisory lock ou atualizar o pessoal, evitando inverter a ordem. Não há chamada externa na transação.

Triggers recusam encerramento/revisão de configuração e alterações de vínculo quando há solicitações pendentes. Aprovação, mudança do bruto aceito, decisão e recálculo são atômicos. Recusa grava somente decisão. Repetição idêntica não duplica efeitos; decisão oposta falha.

Auditoria solicitada/aberta bloqueia aprovação, preservando o bruto sob avaliação. O guard antigo de alteração pessoal mantém o bloqueio para o dia atual; datas passadas podem ser atualizadas porque os torneios elegíveis já receberam seus valores explícitos. Abertura de auditoria usa o bruto efetivo do torneio em vez do pessoal global. Sanções já decididas continuam vinculadas à mesma pontuação/torneio e não são anuladas pela aprovação retroativa.

## Consequências

Dados antigos permanecem intactos e usam a fonte pessoal até a primeira alteração retroativa. Rejeições sobrevivem a refresh, revisão de regra e remoção/reinclusão de vínculo, pois a fonte local não é descartada. Novas participações posteriores à solicitação usam o histórico pessoal atual quando ainda não possuem fonte local; não recebem pedidos antigos automaticamente.

Migração do banco deve preceder publicação das telas. Backup novo e comparação de todas as seções de negócio são obrigatórios no roteiro, com exportação privada e sem credenciais/dados pessoais versionados. Não restaurar um snapshot anterior sobre lançamentos legítimos para desativar a interface. Sem teste local que comprove concorrência entre sessões PostgreSQL remotas: PGlite verifica transações e chamadas enfileiradas; a homologação deve incluir duas sessões simultâneas.
