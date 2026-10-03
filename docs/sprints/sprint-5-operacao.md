# Sprint 5 — Migração e homologação

Procedimento preparado em 03/10/2026. Implementação e ensaios locais; nenhum passo remoto executado pelo agente. Aplicar em ambiente controlado antes de produção. Não reaplicar migrações anteriores.

Execução dos comandos no Supabase é responsabilidade do Dono do produto. O agente prepara e revisa os scripts, executa testes locais e confere as evidências fornecidas pelo Dono do produto antes de orientar a próxima etapa remota.

## Preparação e backup

1. Reservar janela sem lançamentos, alterações de participantes ou configurações. Conferir ambiente e executor. Capturar também backup completo adequado ao ambiente, incluindo estratégia de recuperação de Auth/configuração; os scripts abaixo são captura de dados de negócio e funções alteradas, não um backup integral do Supabase.
2. Executar `web/supabase/rehearsal/sprint5/01-backup.sql` antes da S5. Captura todos os torneios, vínculos, perfis, pontuações pessoais, exclusões, resultados e cálculo de referência em data fixa; guarda definições das três funções substituídas. Transação com bloqueio de escrita nas tabelas e timeout. Referência `before-s5-v1` não é sobrescrita. Recusa S5 já instalada ou fuso legado diferente de São Paulo.
3. Executar `03-export.sql`; salvar o JSON completo em `backups/sprint-5/`, ignorado pelo Git, e guardar cópia protegida fora do repositório. Contém dados pessoais; não anexar ao histórico versionado. Conferir parse, contagens e checksum MD5 do snapshot; usar checksum de arquivo separado se necessário para integridade do arquivo exportado.
4. Executar `02-verify.sql`; exigir zero seções diferentes e checksums iguais antes de migrar. Não usar o backup antigo da Sprint 4 como captura atual. Registrar apenas identificador, horário, contagens e checksums, sem dados pessoais.

Evidência local: captura/exportação/comparação com dados fictícios, bloqueio de acesso pelas contas da aplicação, preservação da referência e recuperação das funções antigas aprovados em `versioned-rules.test.mjs`. Cópia privada real de setembro também migrada e comparada, sem alteração de dados/cálculo. São evidências locais, não captura/recuperação remotas atuais nem restauração integral de Auth.

### Evidência de captura remota — 03/10/2026

Dono do produto executou `01-backup.sql` no SQL Editor do Supabase e forneceu o retorno: identificador `before-s5-v1`, captura `2026-10-03 14:25:55.292019+00`, data de referência `2026-10-03`, 4 torneios, 289 pontuações pessoais e 434 resultados armazenados. Checksum do snapshot informado: `801fcd595c5e747cf5a92cfbcb85cb57`.

Exportação fornecida pelo Dono do produto e validada integralmente em 03/10/2026: JSON com sete seções, 4 torneios, 42 vínculos, 17 perfis, 289 pontuações pessoais, 1 exclusão, 434 resultados armazenados, 424 linhas calculadas e definições das três funções. Checksum recalculado com PostgreSQL/PGlite (`md5(snapshot::jsonb::text)`) e reconfirmado após salvar/reler: `801fcd595c5e747cf5a92cfbcb85cb57`. Cópia privada salva em `backups/sprint-5/before-s5-v1.json`, ignorada pelo Git; SHA-256 do JSON salvo: `1a3ebf4db49eed74f89c2ec379211796d0084c4ffdfb51a02e50174ef76a4a04`. SHA-256 do anexo de origem: `1ddeb8e5e6cd78e460a66d7514c2c0d2481607df5ac24f9e53aa7ee79f60af09`. Cópia protegida fora do repositório e backup integral do ambiente/Auth ainda não confirmados; comparação pós-migração aprovada; publicação da aplicação ainda não confirmada.

Comparação remota anterior à migração executada pelo Dono do produto por `02-verify.sql`, com retorno fornecido em 03/10/2026: `different_sections = 0`, `sections = []` e `checksum_backup = checksum_current = 801fcd595c5e747cf5a92cfbcb85cb57`. Captura, exportação privada e equivalência dos dados/cálculo na data de referência verificadas. Após as migrações, repetir a comparação antes de uso/gravação pela aplicação.

Migração preparatória `202610030000_all_days_calendar.sql` executada pelo Dono do produto no SQL Editor em 03/10/2026, em execução separada; retorno fornecido: “Success. No rows returned”. Valor `every_day` adicionado ao enum e transação concluída conforme o script. A migração principal também foi confirmada conforme a evidência seguinte; comparação posterior aprovada conforme a evidência seguinte.

Migração principal `202610030001_versioned_rules.sql` executada pelo Dono do produto no SQL Editor em 03/10/2026; retorno fornecido: “Success. No rows returned”. Execução remota do esquema S5 confirmada pelo retorno. Comparação pós-migração aprovada conforme a evidência seguinte; referências/RLS aprovadas conforme as evidências seguintes; publicação da aplicação e homologação funcional ainda não confirmadas. Antes de uso/gravação pela aplicação, repetir `02-verify.sql` e exigir zero diferenças e checksums iguais ao backup.

Comparação remota pós-migração executada pelo Dono do produto por `02-verify.sql`, com retorno fornecido em 03/10/2026: `different_sections = 0`, `sections = []` e ambos os checksums iguais a `801fcd595c5e747cf5a92cfbcb85cb57`. Dados de negócio e cálculo na data de referência preservados após ambas as migrações. Próxima etapa: conferência estrutural somente leitura por `05-check-migration.sql`; indicadores de esquema/permissões aprovados conforme a evidência seguinte; referências iniciais aprovadas conforme a evidência seguinte; publicação da aplicação e homologação funcional ainda não confirmadas.

Conferência estrutural adicional validada localmente em PGlite por `post-migration read-only structural checklist`: um cenário direcionado aprovado, verificando referência inicial equivalente e todos os indicadores de esquema/permissões. Essa execução adicional não representa uma nova execução da suíte completa nem teste remoto de autorização por contas da aplicação.

Conferência estrutural remota por `05-check-migration.sql`: Dono do produto forneceu em 03/10/2026 a linha `schema_and_permissions`, com todos os nove indicadores verdadeiros (enum, constraint de fuso, RLS, política de leitura, leitura autenticada, bloqueio de escrita direta e acessos de anônimo/autenticado à aplicação de regras). Essa parte aprovada. O primeiro retorno não incluiu `initial_versions`; a consulta separada foi posteriormente executada e aprovada conforme a evidência seguinte. `06-check-initial-versions.sql` isola a primeira consulta já validada de `05-check-migration.sql` para obter esse retorno separadamente, somente leitura. Os indicadores de catálogo não substituem os testes funcionais de autorização com contas da aplicação.

Referências iniciais conferidas remotamente pelo Dono do produto em 03/10/2026 via `06-check-initial-versions.sql`: `tournaments = 4`, `versions = 4`, `inconsistent_tournaments = 0`. Uma referência equivalente por torneio confirmada. Verificação remota da migração concluída: preservação dos dados/cálculo de referência, esquema/permissões e referências iniciais aprovados. Publicação da aplicação atualizada, testes funcionais no ambiente e aceite do Dono do produto ainda não confirmados.

A referência deve ser preservada, sem reexecutar a captura para sobrescrevê-la.

## Migração e publicação

1. Após a captura/comparação e a migração de perfis da Sprint 4, aplicar `web/supabase/migrations/202610030000_all_days_calendar.sql` para acrescentar `every_day`. A transação deve terminar antes de usar o enum novo. Depois aplicar uma vez `202610030001_versioned_rules.sql`: adiciona versões/RLS/auditoria, valida fuso e substitui cálculo/refresh, preservando tabelas e RPCs legadas. Ambas foram confirmadas remotamente em 03/10/2026; não reaplicar a principal se já estiver instalada.
2. Antes de usar o painel ou editar regras, repetir `02-verify.sql`; exigir zero seções diferentes. A migração não recalcula nem reescreve dados. Se houver divergência, interromper e investigar; não assumir que é esperada nem substituir a referência.
3. Executar `web/supabase/rehearsal/sprint5/05-check-migration.sql` (somente leitura): exigir `inconsistent_tournaments = 0`, uma versão por torneio e todos os indicadores de esquema/permissões verdadeiros. Conferir uma referência inicial por torneio, modo/penalidade/calendário/exclusões iguais aos antigos e ausência de revisões aplicadas. Conferir constraint do fuso e RLS. Publicar a aplicação atualizada em seguida e registrar URL, versão efetivamente publicada e resultado do deployment.
4. Não liberar revisão/configuração nova com interface antiga: seus textos representam somente o MVP. `create_tournament` antiga continua disponível com defaults; a interface nova usa `create_configured_tournament` para configuração inicial atômica.

Após a migração, não editar `scoring_mode`, `absence_penalty`, `weekly_schedule` ou a tabela antiga de exclusões diretamente para mudar regras. Usar configuração/versionamento pela aplicação/RPC, com prévia e confirmação. Campos/tabela antigos permanecem como referência de compatibilidade; versões por data são a fonte canônica.

## Recuperação antes do uso

Se a implantação falhar antes de qualquer uso/gravação S5 e os dados forem idênticos à referência, `04-recover-before-use.sql` restaura funções anteriores, nome/grants da RPC de painel e remove os objetos da migração. Recusa recuperação se houve revisão, configuração de novo torneio ou qualquer mudança de dados/cálculo. Mantém a referência de backup. Comparação final ocorre dentro da transação; falha reverte a recuperação.

Executar somente após identificar a falha e conferir que essas condições são atendidas. Repor a versão compatível da aplicação. O valor adicional `every_day` permanece no enum, sem uso pelo código antigo; a recuperação não reescreve o tipo nem dados legados. Após uso real, preservar versões/auditorias e preparar correção incremental ou recuperação específica. A recuperação de esquema local foi ensaiada, mas o backup completo do ambiente remoto e seu restauro têm procedimento próprio.

## Roteiro de homologação

- Criar torneios absoluto e relativo com os mesmos participantes/lançamentos positivos: 10.000/12.000/15.500 produzem 10.000/12.000/15.500 e 0/2.000/5.500. Conferir empate no menor como resultado válido, mesmo com zero aplicado.
- Registrar zero e deixar outro jogador sem lançamento: pendentes durante o dia/preparação; após fechamento e histórico concluído, ausência conforme penalidade. Validar penalidade zero, valores inválidos e impossibilidade de configurar fuso; dispositivo em outro fuso mantém São Paulo.
- Conferir segunda a sexta, sábado e domingo habilitados em todos os dias e feriado excluído. Datas duplicadas/fora da vigência/motivo vazio são rejeitadas. Criar regras com exclusões e verificar preservação ao revisar intervalo parcial.
- Gerar prévia retroativa sem confirmar: dados não mudam. Conferir totais e diferenças por dia, confirmar e comparar aplicação à prévia. Verificar modo/versão de cada dia e histórico; regra fora do intervalo permanece igual.
- Excluir e depois restaurar um dia por novas revisões: ranking acompanha a mudança, pontuação pessoal permanece e auditoria guarda o resultado retirado. Conferir outro torneio que compartilha a pontuação, sem alteração de regra/total indevida.
- Programar mudança futura: resultado anterior preservado, impacto atual pode ser zero. Revisar um intervalo de uma versão futura com nova confirmação; última revisão prevalece apenas onde cobre.
- Gerar prévia, alterar lançamento/participante/preparação por outro fluxo, tentar confirmar: exigir nova prévia. Confirmar duas vezes não duplica efeitos. Em ambiente de ensaio PostgreSQL com duas conexões, disputar confirmação e lançamento/revisão para verificar bloqueios; não executar disputa sobre dados reais sem roteiro e recuperação definidos.
- Jogador vinculado consulta versões, mas não edita; organizador de outro torneio, conta sem acesso e sessão anônima são negados por chamada direta. Revogação de vínculo retira leitura. Encerrado preserva resultados e rejeita revisão.
- Conferir celular, teclado, mensagens de erro, abertura de detalhes, URL/recarga/voltar e seleção entre torneios.

Registrar executor, ambiente, versão publicada, cenários, resultados e aceite do Dono do produto na Sprint 5. Testes locais não encerram a sprint; publicação e homologação ainda pendentes.
