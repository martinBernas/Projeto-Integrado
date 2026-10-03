# ADR-003 — Regras por data e revisão explícita

Situação: o desenho de intervalos independentes foi substituído para novas edições pelo [ADR-004 — regra única por torneio](adr-004-regra-unica-por-torneio.md). Este documento preserva a decisão técnica inicial e sua migração já executada.

Data: 03/10/2026. Registro histórico da entrega inicial da Sprint 5: migração executada e verificada remotamente. Desenho por intervalos substituído pelo ADR-004; descrição de implantação/ensaio abaixo preserva o contexto original.

## Contexto e decisões funcionais

Definição funcional da Sprint 5: calendário oferece segunda a sexta ou todos os dias, incluindo sábado/domingo. A configuração de todos os dias usa `every_day`; o calendário legado de segunda a sexta mais domingos fica restrito à compatibilidade histórica. A migração preparatória do enum termina antes da principal, por exigência do PostgreSQL. Valores históricos antigos mantêm sua semântica; não transformar implicitamente um calendário antigo em todos os dias. Migrações iniciais posteriormente executadas e verificadas pelo Dono do produto, conforme a Sprint 5.

O cálculo anterior usa modo, penalidade e calendário únicos do torneio. Editá-los diretamente reescreveria a explicação de dias anteriores. O Dono do produto confirmou revisão retroativa explícita, zero bruto como ausência nos dois modos e fuso fixo `America/Sao_Paulo`, retirado da configuração. Essas decisões funcionais não autorizam reabrir encerrados ou editar pontuações pessoais.

## Escolha técnica de implementação

`public.tournament_rule_versions` armazena configuração completa, intervalo inclusivo, versão, motivo, ator e instante. Inclui modo, penalidade, semana e exclusões com motivos. Não contém fuso configurável. Cada data seleciona a revisão de maior ID que cobre a data. Intervalos registrados podem se cruzar, mas existe uma única regra efetiva por dia; a referência inicial cobre todo o período. Nenhuma revisão substitui fisicamente as anteriores. Corrigir/cancelar uma mudança futura exige nova revisão explícita do intervalo, preservando o histórico.

Essa seleção por precedência evita dividir e reescrever registros antigos quando uma revisão cobre parcialmente outras vigências. Consequência: o histórico mostra intervalos originais, que podem ter sido parcialmente superados; interface explica a precedência e resultado diário mostra a versão realmente aplicada. Datas fora do intervalo revisado mantêm suas configurações.

Migração copia parâmetros e exclusões existentes para uma referência com a versão legada, sem atualizar resultados, pontuações, perfis ou vínculos. `calculate_tournament` conserva assinatura e formato dos snapshots; novos cálculos escolhem a regra por data. Campos antigos em `tournaments` e a tabela original de exclusões são mantidos por compatibilidade e referência inicial, sem representar necessariamente a configuração após revisões. Fonte canônica é a versão por data. Não editar parâmetros/calendário diretamente pelo SQL operacional antigo após a migração.

Criação configurada estabelece a primeira versão dentro da mesma transação. A RPC antiga de criação segue com os padrões do MVP e também recebe referência inicial por trigger. Edição do período vazio só é permitida com uma versão e pelas restrições existentes; nessa exceção, os limites da referência inicial são ajustados. Depois de revisões, período fica bloqueado. São as únicas alterações da referência inicial; versões publicadas de revisão permanecem sem update/delete pela aplicação.

## Prévia, transação e concorrência

`preview_tournament_rules` autentica o organizador de torneio aberto, bloqueia o torneio, normaliza a proposta e compara resultados armazenados com cálculo simulado. Retorna totais antes/depois, diferenças por jogador/data, intervalo, motivo e indicação de retroatividade. Prévia não atualiza resultados ou versões. Mudanças futuras mostram impacto atual zero quando ainda não existem dias afetados; prévia não é projeção de pontuações futuras.

O token MD5 representa proposta canônica, data atual de São Paulo, torneio, versões, vínculos, pontuações relevantes e resultados armazenados. É controle de frescor, não assinatura, segredo ou substituto de autorização. `apply_tournament_rules` revalida autorização/encerramento, adquire o mesmo bloqueio e reconstrói a prévia. Token diferente exige nova conferência. Os fluxos existentes de lançamento e participantes bloqueiam o torneio antes de escrever; não implementar escrita paralela que dispense esse protocolo.

Confirmação grava versão, auditoria privada do impacto e recálculo em uma transação. Versão identifica snapshots novos; remoção de dia gera delete auditado pelo trigger existente. Repetir o token depois do sucesso falha sem duplicar efeitos; falha no recálculo desfaz versão, auditoria e resultados. Recálculo normal pode atualizar pendências do dia/valores legitimamente alterados desde a última leitura; a prévia inclui essas diferenças para não ocultá-las.

`rule_revision_changes` preserva ator, proposta e impacto; `result_changes` preserva valores/snapshots anteriores, inclusive exclusões. Leitura pública de versões usa RLS de participação/organização; escrita direta e RPC por outra conta são negadas. Auditorias privadas não são expostas à aplicação. Encerrados consultam regras, mas preservam resultados e rejeitam revisão.

## Limites escolhidos tecnicamente

Penalidade inteira de −25.000 a 0, alinhada à faixa de pontuação pessoal, inclusive zero. Até 366 exclusões por versão; data única dentro da vigência e motivo de 3–200 caracteres. Motivo da revisão tem 3–500 caracteres. São escolhas de validação desta implementação, distintas das decisões expressas pelo Dono do produto. Fuso é constante global, permanece nos snapshots como evidência, e constraint rejeita valores diferentes. Migração falha se encontrar fuso legado inesperado, sem convertê-lo silenciosamente.

## Verificação e consequências operacionais

Testes locais cobrem equivalência dos dados/cálculo legados, inclusive cópia privada de setembro, isolamento, zero, calendário, vigência futura, prévia expirada, transação e recuperação antes do uso. PGlite serializa chamadas; duas confirmações enfileiradas não comprovam comportamento PostgreSQL multiconexão. Ensaiar bloqueio/concorrência em ambiente controlado antes de declarar essa evidência remota.

Migração deve preceder aplicação nova; clientes antigos usam RPCs preservadas, mas textos antigos não conhecem as novas regras. Publicar o código atualizado antes de liberar configurações/revisões. Captura S5 é referência atual de dados de negócio e funções alteradas; não substitui backup completo de Auth/configuração do Supabase. Recuperação automática só antes de uso e com referência idêntica; após alterações legítimas, preferir correção incremental preservando auditoria, com plano específico.
