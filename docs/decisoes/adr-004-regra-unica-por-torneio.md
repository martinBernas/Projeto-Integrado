# ADR-004 — Uma regra por torneio e edição conjunta do período

Situação consolidada em 03/10/2026: migrações S5 aplicadas pelo Dono do produto, com comparação pós-migração de regra única sem diferenças. Interface exercitada e cenários relatados aprovados: regra única, ranking, recarga, alteração/restauração do período, calendário, exclusões e modos. TESTE S5 retirado; quatro torneios originais e lançamentos legítimos preservados, com capturas privadas exportadas/validadas. URL e identificação formal do deployment não fornecidas. Aceite global/encerramento da Sprint 5 ainda não confirmados.

Registros abaixo preservam a situação de cada etapa; pendências anteriores de aplicação/comparação da migração foram resolvidas pela evidência acima.

Data: 03/10/2026. Definição funcional confirmada pelo Dono do produto durante a homologação da Sprint 5. Migração complementar aplicada e verificada remotamente; interface e cenários funcionais conferidos pelo Dono do produto, sem registro formal de URL/versão de deployment. Aceite global pendente. Substitui a escolha técnica de vigências independentes de ADR-003 para novas edições de torneios abertos.

## Contexto e definição

A edição por intervalos tornou o fluxo complexo. O torneio deve ter uma única configuração válida para todo o seu período, e início/fim devem poder mudar mesmo após inclusão de participantes. Histórico de alterações continua necessário, sem representar regras simultaneamente aplicáveis.

## Implementação

Período e regra são editados na mesma tela, com uma prévia e uma confirmação. Datas `from`/`to` das RPCs agora representam o início/fim do próprio torneio, sem vigência independente. `scope: tournament` distingue o contrato novo: chamadas da interface antiga são rejeitadas antes de qualquer gravação, evitando interpretar uma antiga revisão parcial como redução do torneio. A interface nova também é incompatível com a validação anterior; coordenar migração/publicação antes de retomar edições.

Para torneios abertos, `private.rule_on_day` escolhe a revisão mais recente para todas as datas do período atual. Revisões antigas permanecem imutáveis como histórico, com o período que existia quando registradas. Encerrados mantêm cálculo/snapshots e consulta histórica, sem reabertura. A migração não muda linhas de negócio, versões nem resultados; recusa torneio aberto cuja última versão não cubra exatamente todo o período. Se houver revisão parcial, o Dono do produto deve escolher explicitamente uma configuração para todo o torneio usando o fluxo anterior, conferir e aplicar antes de migrar. Não converter silenciosamente regras parciais.

Confirmação grava versão, período e parâmetros atuais de `tournaments`, auditoria e recálculo numa transação. Retira resultados fora do período/calendário e registra auditoria existente; ampliações calculam somente dias já alcançados. Pontuações brutas e vínculos não mudam. Elegibilidade existente é preservada: ampliar o início não antecipa automaticamente a inscrição do jogador, e quem tem elegibilidade posterior ao novo fim fica sem resultados nesse período. Exclusões fora do novo período são rejeitadas; sua remoção exige edição explícita. Nome continua editável pela administração; datas somente pelo fluxo com prévia, inclusive em chamada direta à RPC antiga de edição.

Token de frescor inclui pontuações no conjunto dos períodos antigo e proposto, versões, vínculos, torneio, resultados e data São Paulo. Lançamento em dia acrescentado após a prévia invalida a confirmação. Falha de recálculo desfaz período, versão e auditoria. Autorização/RLS e fuso fixo permanecem.

## Migração e recuperação

Aplicar somente `202610030002_single_tournament_rule.sql` depois de nova captura/exportação/comparação do estado atual. Não reexecutar as migrações já aplicadas. Backup de dados de negócio não equivale a backup integral de Supabase/Auth. `04-recover-before-use.sql` não é reversão desta entrega após utilização de S5. Correções após uso precisam de migração incremental específica, preservando dados e auditorias.

Após aplicar, comparar dados/cálculo na data de referência antes de usar o painel. Publicar a interface correspondente e homologar edição do período completo, prévia, confirmação, recarga, restrição de encerrados e isolamento. Retirada de torneios TESTE S5 continua tarefa separada, por IDs, sem restauração global.

## Verificação local

Testes cobrem equivalência antes/depois da migração, rejeição de contrato antigo e de conversão parcial, regra única em todos os snapshots, ampliação/redução/restauração do período, preservação de brutos/elegibilidade, auditoria de remoções, token de pontuação acrescentada, exclusões inválidas, autorização/encerrados, criação configurada e rollback atômico. Evidências e contagem final na Sprint 5.
