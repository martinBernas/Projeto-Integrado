# Sprint 5 — Regras e calendário

Situação atual em 03/10/2026: migração complementar de regra única executada pelo Dono do produto e comparação remota pós-migração aprovada por `16-verify-after-full-period.sql`: `different_sections = 0`, `sections = []`, `checksum_backup = checksum_current = f6c6d78a67309d858fae0e70c4080477`. Dados de negócio, versões/auditorias e cálculo na data de referência preservados. Verificação remota da migração complementar concluída. Publicação da interface correspondente, homologação de período/regra únicos, retirada delimitada de torneios de teste e aceite ainda não confirmados. Não reaplicar migrações. Retomar criação/revisão somente na interface correspondente ao contrato `scope: tournament`.

Registros abaixo preservam a situação de cada etapa; pendências anteriores de aplicação/comparação da migração foram resolvidas pela evidência acima.

## Definição vigente — regra única e período editável (03/10/2026)

Dono do produto definiu durante a homologação: cada torneio tem uma única configuração para todo o período, e início/fim podem mudar. Substitui o desenho técnico de revisões parciais e versões futuras simultâneas. Aztecas Outubro já teve edição confirmada; provas continuam em novos torneios com pontuações reais somente em leitura. A referência `before-s5-tests-v1` permanece preservada.

Complemento implementado localmente: “Configurar período e regras” reúne início/fim, modo, penalidade, calendário, exclusões e motivo. Prévia abrange todo o torneio; confirmação grava período, regra, auditoria e recálculo atomicamente. Última revisão é a única aplicável em torneios abertos; anteriores são histórico imutável. Encerrados continuam protegidos. Nome permanece editável separadamente, e a alteração de datas usa o fluxo com prévia.

Critérios de aceite atuais:

- Uma configuração em todos os dias do período de torneios abertos; mudanças recalculam todo o período alcançado mediante prévia e confirmação retroativa explícita.
- Início/fim editáveis com participantes e resultados. Redução remove resultados fora do período com auditoria; ampliação inclui dias alcançados, sem projetar pontuações futuras.
- Exclusões fora do novo período são rejeitadas; remoção exige edição explícita da lista. Mantidas segunda a sexta ou todos os dias, São Paulo fixo e zero bruto como ausência.
- Brutos, vínculos e elegibilidade preservados. Ampliar o início não antecipa automaticamente a elegibilidade; reduzir o fim pode deixar participantes sem dias elegíveis. Regras de outros torneios não mudam.
- Histórico registra configurações/períodos anteriores, sem vigências simultâneas. Sem programação independente de regra futura, exclusão física de revisões ou reabertura de encerrados.
- Prévia sem gravação; token considera pontuações nos períodos antigo e proposto. Falhas desfazem período, regra, auditoria e recálculo.

Migração complementar `202610030002_single_tournament_rule.sql` preparada, não aplicada remotamente. Não reescreve dados/cálculo; recusa última revisão parcial em torneio aberto e exige escolha explícita para todo o período pelo fluxo anterior antes de migrar. Contrato `scope: tournament` recusa interface antiga para impedir que vigência parcial seja interpretada como alteração de datas. Coordenar migração e interface correspondente antes de retomar edições.

Scripts 10–12 preparados para captura/exportação/comparação atual e comparação pós-migração antes do uso. Capturas anteriores preservadas; nenhuma restauração global ou retirada de torneios de teste executada. Decisão e consequências em [ADR-004](../decisoes/adr-004-regra-unica-por-torneio.md); roteiro em [operação](sprint-5-operacao.md). Validação final: `pnpm test`: 60 aprovados, zero falhas/pulados; `pnpm lint` e `pnpm build` aprovados. Migração complementar, publicação dessa simplificação, homologação funcional e aceite ainda pendentes.

### Captura remota anterior à regra única — 03/10/2026

Dono do produto executou `10-backup-before-single-rule.sql` no Supabase e forneceu o retorno: identificador `before-s5-single-rule-v1`, captura `2026-10-03 15:24:18.739201+00`, data de referência `2026-10-03`, 5 torneios, 290 pontuações pessoais, 978 resultados armazenados e 7 versões de regras. Checksum informado: `b4816f567139b0e06d1fbb8f016804ce`. Captura remota e exportação privada confirmadas; comparação inicial por `12-verify-single-rule.sql` aprovada conforme a evidência seguinte. Migração complementar ainda não executada/confirmada.

Exportação `before-s5-single-rule-v1` recebida e validada integralmente em 03/10/2026: 5 torneios, 59 vínculos, 17 perfis, 290 pontuações pessoais, 1 exclusão legada, 978 resultados armazenados, 968 linhas calculadas, 7 versões de regras, 2 auditorias de revisão e definições das sete funções esperadas. Barras escapadas de tabela Markdown (`\|`) foram decodificadas para preservar os operadores SQL no JSON salvo. Checksum PostgreSQL/PGlite recalculado e reconfirmado após salvar/reler: `b4816f567139b0e06d1fbb8f016804ce`. Cópia privada em `backups/sprint-5/before-s5-single-rule-v1.json`, ignorada pelo Git; SHA-256 do JSON salvo: `bacdff87d06f80865b25d2bf25f45975dd76e83a0102490316b2c7148bbc54b0`; anexo de origem: `aa9887cb0287355f2c4c050ea7311eadd745f0288850ce5b3194fb08367017f6`. Comparação remota inicial aprovada conforme a evidência seguinte; migração complementar ainda não confirmada.

Comparação remota anterior à migração de regra única executada pelo Dono do produto por `12-verify-single-rule.sql`, retorno fornecido em 03/10/2026: `different_sections = 0`, `sections = []` e `checksum_backup = checksum_current = b4816f567139b0e06d1fbb8f016804ce`. Captura, exportação privada e equivalência pré-migração confirmadas. Próxima etapa: aplicar somente `202610030002_single_tournament_rule.sql`, depois repetir `12-verify-single-rule.sql` antes de usar o painel/gravar. Migração complementar e comparação posterior ainda não confirmadas.

Tentativa remota da migração complementar recusada em 03/10/2026 por `single_rule_migration_requires_full_period`, conforme retorno do Dono do produto. A exceção ocorre antes das alterações de funções/trigger na transação; não houve confirmação de aplicação da migração. Exportação verificada identifica TESTE S5 com período 01/09/2026–31/10/2026 e última revisão 01/10/2026–31/10/2026 (absoluto, penalidade −2.000). Diagnóstico somente leitura preparado em `13-diagnose-partial-rules.sql`. Selecionar explicitamente no fluxo anterior a configuração desejada para todo o período do torneio envolvido; após confirmação, capturar nova referência com identificador novo e comparar antes de tentar a migração novamente. Preservar backups anteriores, torneios originais, brutos e auditoria. Não modificar diretamente a vigência da versão já publicada nem remover a guarda da migração.

Normalização explícita do TESTE S5 confirmada por imagem fornecida pelo Dono do produto: mensagem “Revisão aplicada. Resultados atualizados e histórico preservado.” e versão `s5-8`, período 01/09/2026–31/10/2026, absoluto, penalidade −2.000, segunda a sexta, exclusão 12/10/2026 (Feriado), motivo “Aplicar configuração única a todo o torneio”, registro exibido 03/10/2026 às 12:33 São Paulo. Versões `s5-7` parcial e `s5-6` inicial preservadas no histórico. A interface da imagem corresponde ao fluxo anterior à simplificação; não comprova aplicação da migração complementar. Preparados scripts 14–16, equivalentes aos scripts 10–12 com novo identificador `before-s5-single-rule-v2`, para captura/exportação/comparação depois da normalização. Não sobrescrever v1 nem usar sua comparação como referência de igualdade após a revisão. Captura v2 confirmada conforme a evidência seguinte; nova tentativa de migração ainda não confirmada.

Captura remota após normalização do período executada pelo Dono do produto por `14-backup-after-full-period.sql`: `before-s5-single-rule-v2`, horário `2026-10-03 15:34:41.263588+00`, data de referência `2026-10-03`, 5 torneios, 290 pontuações pessoais, 842 resultados armazenados e 8 versões de regras; checksum informado `f6c6d78a67309d858fae0e70c4080477`. Captura e exportação confirmadas; comparação inicial por `16-verify-after-full-period.sql` aprovada conforme a evidência seguinte; nova tentativa da migração complementar ainda não confirmada. Referência v1 preservada como estado anterior à normalização; redução da contagem de resultados não é prova isolada de equivalência e deve ser conferida contra a referência v2.

Exportação `before-s5-single-rule-v2` recebida e validada integralmente: 5 torneios, 59 vínculos, 17 perfis, 290 pontuações pessoais, 1 exclusão legada, 842 resultados armazenados, 832 linhas calculadas, 8 versões de regras, 3 auditorias de revisão e sete definições de funções. Escapes de tabela Markdown decodificados como na v1. Checksum PostgreSQL/PGlite recalculado e reconfirmado após salvar/reler: `f6c6d78a67309d858fae0e70c4080477`. Cópia privada em `backups/sprint-5/before-s5-single-rule-v2.json`, ignorada pelo Git; SHA-256 do JSON salvo `c73cffcf3a20383d0ed82693ee72f3cec6dd67b70b77884c290a2b4b8a0db960`, anexo de origem `a9f2fcdbe98c693edde47f527420c24386744d6846f2e0b9a9a90deb1e36f435`. Comparação remota v2 aprovada conforme a evidência seguinte; nova tentativa da migração complementar ainda não confirmada.

Comparação remota v2 anterior à nova tentativa da migração executada pelo Dono do produto por `16-verify-after-full-period.sql`: `different_sections = 0`, `sections = []`, `checksum_backup = checksum_current = f6c6d78a67309d858fae0e70c4080477`. Captura, exportação e equivalência pós-normalização confirmadas. Próximo passo: executar novamente somente `202610030002_single_tournament_rule.sql`; a tentativa anterior foi recusada antes das alterações. Após sucesso, repetir 16 antes de usar o painel/gravar. Nova tentativa, comparação posterior e publicação do complemento ainda não confirmadas.

Migração complementar `202610030002_single_tournament_rule.sql` executada novamente pelo Dono do produto após normalização do TESTE S5 e comparação v2 aprovada. Retorno fornecido em 03/10/2026: “Success. No rows returned”. Aplicação remota confirmada pelo retorno. Comparação pós-migração por `16-verify-after-full-period.sql`, publicação da interface correspondente, homologação da edição conjunta de período/regra e aceite ainda não confirmados. Não reaplicar a migração nem usar o painel antes da comparação pós-migração.

Contagens atuais diferem da referência de testes anterior (4 torneios, 289 pontuações, 434 resultados, 5 versões). O retorno resumido não identifica a origem dessas diferenças; não presumir que a pontuação adicional seja experimental. Preservar lançamentos legítimos posteriores e identificar os IDs dos torneios de teste antes da retirada; não restaurar globalmente uma referência anterior. A referência atual protege o estado anterior à migração complementar, não constitui procedimento automático de retirada dos testes.

Os blocos abaixo preservam etapas anteriores. Critérios sobre intervalos, precedência por dia, versões futuras e bloqueio do período foram substituídos pela definição acima.

## Situação vigente — desenvolvimento iniciado em 03/10/2026

Execução dos comandos no Supabase é responsabilidade do Dono do produto. O agente prepara e revisa os scripts, executa testes locais e confere as evidências fornecidas pelo Dono do produto antes de orientar a próxima etapa remota.

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

### Definição funcional do calendário — S5-02

O calendário da Sprint 5 oferece exatamente duas opções:

- **Segunda a sexta:** sábado e domingo não são dias de jogo.
- **Todos os dias:** inclui segunda a domingo, inclusive sábado e domingo.

Exclusões de datas específicas prevalecem sobre a opção escolhida. Essa é a definição funcional do escopo da sprint.

Interface, propostas de regras, cálculo, avisos e testes seguem essa definição. O valor `every_day` entra na migração preparatória `202610030000_all_days_calendar.sql`, concluída em transação separada antes da migração principal. O enum antigo permanece apenas para preservar o significado de eventual histórico legado, não como opção de criação/revisão. Migrações remotas confirmadas conforme as evidências acima; publicação da aplicação ainda não confirmada.

Verificação local: suíte completa com 52 testes aprovados, zero falhas/pulados; lint e build aprovados. Cobertura inclui sábado com pontuação e ausência, domingo, exclusão específica, aviso de lançamento no sábado e equivalência do calendário legado. Comparações de SQL usam ordem explícita e datas normalizadas. Essas evidências substituem a contagem inicial de 51.

Dono do produto autorizou iniciar o desenvolvimento após confirmar zero como ausência e retirar configuração de fuso. S5-01–S5-03 implementadas localmente: criação configurada, calendário/exclusões e versões por intervalo com prévia/confirmação de revisão retroativa. Fuso fixo São Paulo, fora dos campos editáveis. Sprint em andamento; captura e migrações remotas realizadas pelo Dono do produto; comparação pós-migração aprovada; publicação da aplicação, demais ensaios remotos e aceite ainda não confirmados. Os blocos de pré-planejamento abaixo preservam propostas e situação anterior quando substituídas por esta seção.

Homologação funcional iniciada pelo Dono do produto: informou estar editando as regras do torneio Aztecas Outubro para excluir 12/10/2026 (feriado) e alterar a penalidade para −2.000. Edição relatada não comprova confirmação/aplicação da revisão nem resultado dos testes. URL e versão do deployment não fornecidas. Conferir vigência explícita, prévia, aplicação, persistência, isolamento e permissões conforme o roteiro operacional; aceite ainda não confirmado.

### Referência remota anterior às provas e escopo confirmado

Dono do produto confirmou que a edição do Aztecas Outubro funcionou. Captura `before-s5-tests-v1` executada no Supabase em `2026-10-03 14:51:48.563374+00`, data de referência `2026-10-03`: 4 torneios, 289 pontuações pessoais, 434 resultados armazenados e 5 versões de regras; checksum informado `7678323756186bab0637d992c8d9e42e`. Essa referência é posterior à edição do Aztecas Outubro, portanto sua configuração editada integra o estado a preservar; detalhes de prévia/ranking ainda não fornecidos.

Escopo confirmado: criar novos torneios com os jogadores atuais e testar revisões de regras nesses torneios, reutilizando pontuações brutas existentes, sem criar/editar/excluir pontuações pessoais. Exportação privada validada conforme a evidência seguinte; comparação inicial por `09-verify-before-tests.sql` aprovada conforme a evidência seguinte. Referência de testes não deve ser sobrescrita. Scripts 07–09 validados conjuntamente em teste local direcionado PGlite: captura, exportação, comparação sem diferenças e recusa de sobrescrita aprovadas; não substitui a execução remota de exportação/comparação.

Ao concluir as provas, retirar somente torneios de teste e dependências delimitadas por seus IDs, preservando os quatro torneios da referência (inclusive a edição confirmada do Aztecas Outubro), pontuações pessoais e alterações legítimas posteriores. Preparar a retirada a partir de inventário real de dependências, com captura atual e conferência antes/depois; script de retirada ainda não preparado/executado, pois os IDs de teste não foram fornecidos. Não restaurar a base inteira nem remover migrações S5. Testar lançamento bruto zero/valores específicos somente quando já existirem dados adequados; não alterar pontuações reais para completar cenários. Aceite global da Sprint 5 ainda não confirmado.

Exportação `before-s5-tests-v1` recebida e validada integralmente: 4 torneios, 42 vínculos, 17 perfis, 289 pontuações pessoais, 1 exclusão legada, 434 resultados armazenados, 424 linhas calculadas, 5 versões de regras e 1 auditoria de revisão. Definições de funções vazias conforme o script de captura pós-migração; definições anteriores permanecem em `before-s5-v1`. Checksum PostgreSQL/PGlite recalculado e reconfirmado após salvar/reler: `7678323756186bab0637d992c8d9e42e`. Cópia privada em `backups/sprint-5/before-s5-tests-v1.json`, ignorada pelo Git. SHA-256 do JSON salvo: `43949d941ad8b128fda6ee81acc46abd654ee5c9b8ddc0490f65ef4be214deb7`; do anexo de origem: `96e0017eba73b79a5aa10a79daa4e121762608235a2d237c4281d0e17e0760ee`. Comparação remota inicial aprovada conforme a evidência seguinte.

Comparação remota inicial da referência de testes executada pelo Dono do produto por `09-verify-before-tests.sql`, retorno fornecido em 03/10/2026: `different_sections = 0`, `sections = []`, `checksum_backup = checksum_current = 7678323756186bab0637d992c8d9e42e`. Captura atual, exportação privada e equivalência anterior aos testes confirmadas. Próxima etapa: novos torneios identificados como TESTE S5, com jogadores e pontuações existentes; registrar IDs e resultados de criação/revisão. Preservar os quatro torneios originais e não editar pontuações brutas. Retirada posterior dos torneios de teste ainda não executada; essa referência não constitui restauração automática da base.

### Uso dos jogadores atuais com reversão delimitada — preparação anterior

Dono do produto definiu posteriormente que usará dados e jogadores atuais nos testes, com intenção de reverter os efeitos experimentais. Substitui a recomendação de limitar a homologação a contas exclusivas de teste. Não autoriza restauração global nem perda de lançamentos legítimos posteriores.

Preparado `07-backup-before-tests.sql`: captura nova referência `before-s5-tests-v1`, mantendo `before-s5-v1`; inclui estado atual dos dados/cálculo, versões de regras e auditoria de revisões. Não contém backup integral de Auth nem todas as tabelas de auditoria do ambiente; não é procedimento automático de restauração. Teste local direcionado PGlite aprovado: captura de versões e recusa de sobrescrita. Execução remota e exportação ainda não confirmadas.

Antes de novas gravações experimentais, executar e exportar essa captura; informar se já houve confirmação de regras ou criação/edição de pontuações. A referência nova preserva o estado na captura, não reconstrói alterações anteriores. Delimitar IDs de torneios e alterações por jogador/data. Reverter regras por nova revisão explícita com configuração anterior, preservando histórico; retirar eventual torneio de teste por procedimento específico. Alterações de pontuação pessoal exigem comparação e tratamento individual, pois afetam outros torneios e podem conflitar com lançamentos legítimos. Não usar `04-recover-before-use.sql` para desfazer testes funcionais: ele recupera o esquema anterior à S5 e recusa uso posterior. Plano de reversão final depende do escopo dos testes e das diferenças efetivamente observadas; ainda não executado.

### Isolamento e retirada dos dados de homologação — orientação anterior

Dono do produto definiu que criará torneio para as provas e, ao concluir, pretende manter somente os torneios originais para evitar impactos nos usuários. Ainda não foram fornecidos identificador do torneio de teste ou resultados dessas provas; retirada não executada.

Usar contas exclusivas de teste, sem vínculo com torneios reais. Pontuações pessoais são compartilhadas por jogador/data; criar apenas um torneio separado não isola lançamentos feitos por contas reais. Revisões experimentais devem ocorrer no torneio de teste. A alteração de feriado/penalidade no Aztecas Outubro só deve ser confirmada se for a regra efetivamente desejada pelo Dono do produto; não há evidência de confirmação até aqui.

A aplicação atual permite criar, editar e encerrar, mas não excluir torneios. Encerramento preserva o torneio e resultados, não atende à retirada completa dos dados de teste. Após as provas, preparar roteiro SQL específico para execução pelo Dono do produto, delimitado pelos IDs efetivamente criados, com conferência prévia de vínculos/dependências, captura atual, transação e verificação posterior. Preservar torneios originais, revisões legítimas, auditoria e lançamentos reais feitos desde o backup. Não restaurar globalmente `before-s5-v1` nem desfazer as migrações S5 para retirar dados de homologação.

### Comportamento e escolhas de implementação

- Criação escolhe absoluto/relativo, penalidade inteira de −25.000 a 0 e semana (segunda a sexta ou todos os dias). Exclusões informadas por linha `AAAA-MM-DD | motivo`, até 366 por versão, sem repetição e dentro da vigência. Limites de penalidade/exclusões são escolhas técnicas da entrega, não decisões funcionais expressas anteriormente.
- Administração tem “Configurar regras” para abertos e “Consultar regras” para encerrados. Revisão informa intervalo inclusivo, configuração completa e motivo; exclusões vazias removem as exclusões naquele intervalo. Configuração de referência exibida usa a data atual limitada ao período do torneio. Datas fora da revisão mantêm sua regra.
- Prévia não grava; mostra totais antes/depois e diferenças de valor/situação/calendário. Confirmação explícita recalcula o torneio autorizado e registra auditoria. Inputs alterados desde a prévia ou virada do dia exigem nova conferência; repetição de confirmação não duplica efeitos. Dias futuros não têm previsão de pontuação na prévia.
- Última revisão que cobre a data prevalece, sem apagar versões anteriores. Intervalos históricos podem se cruzar, mas só uma versão é efetiva por dia. Alterar/cancelar versão futura exige nova revisão do intervalo. Sem exclusão física de revisões, reabertura de encerrados ou edição de pontuações pessoais.
- Excluir um antigo dia de jogo retira o resultado e preserva seu conteúdo na auditoria privada existente. Resultado zero relativo continua válido; zero bruto é ausência nos dois modos. Dia aberto/preparação histórica não gera penalidade.
- Migração cria referência equivalente por torneio, sem escrever dados legados. Campos/tabela antigos ficam como referência de compatibilidade; versões são a fonte canônica. Exceção: edição de período vazio ajusta a única referência inicial; período depois de revisões fica bloqueado.

Decisões, permissões, bloqueios e consequências em [ADR-003](../decisoes/adr-003-regras-versionadas.md), arquitetura e [diagrama](../diagramas/regras-versionadas.md). Documentação operacional e roteiro de aceite em [Sprint 5 — operação](sprint-5-operacao.md).

### Verificação local e limites

`pnpm test`: 52 aprovados, zero falhas/pulados; `pnpm lint` e `pnpm build` aprovados. Ajustes finais de compatibilidade do wrapper, legenda da prévia e validação do separador de exclusões verificados nos testes direcionados S5, com lint/build do código final. `git diff --check` sem erros. Contagens e limites em [plano de testes](../plano-de-testes.md).

Build final teve tentativa com `EPERM` em arquivo temporário de `.next`; repetição autorizada fora do sandbox concluiu compilação, TypeScript e geração de rotas sem erro. Não houve instalação de dependência ou alteração de ambiente remoto.

Testes de banco incluem equivalência dos resultados/snapshots legados, cópia privada real de setembro, zero/modos/calendário, vigências, prévia obsoleta, isolamento, RLS/escrita direta, encerrados, falha transacional, confirmação repetida e captura/exportação/recuperação antes do uso. A contagem final e comandos estão no plano de testes; testes embarcados serializam chamadas e não comprovam concorrência PostgreSQL multiconexão.

Prévia local com componentes reais e dados fictícios em `http://127.0.0.1:3105/rules`, `/create` e `/dashboard`, gravações desativadas; inspeção de formulário, prévia, expansão de alterações e resultados no navegador em viewport padrão e 390 px. Sem rolagem horizontal da página nas telas verificadas; tabelas têm rolagem interna. Não representa ensaio autenticado ou aceite. Harness `web/out/preview-s5.mjs` ignorado pelo Git.

Backup antigo da Sprint 4 foi usado apenas como cópia privada em teste, sem modificação do arquivo. Captura atual S5 e recuperação integral do ambiente remoto ainda não realizadas. Scripts locais de captura/exportação/comparação e recuperação de esquema antes do uso ensaiados com dados fictícios; captura não inclui credenciais/Auth e não substitui backup completo do Supabase. Nenhum dado pessoal ou backup adicionado ao Git.

Meta permanece conclusão preferencial no fim de semana, seguida de correções menores na semana. Não há medida de saldo de tokens ou conversão de estimativas em tokens nesta entrega; nenhum compromisso de duração comprovado. Encerramento depende de implantação e aceite, separados da implementação local.

## Registro de planejamento — 03/10/2026 (anterior ao início)

Solicitação confirmada pelo Dono do produto: planejar a próxima sprint antes de iniciar. Sprint 4 encerrada; Sprint 5 ainda não iniciada. Este documento é uma proposta de Sprint Planning. Objetivo e histórias vêm do backlog vigente; estimativas, recorte funcional e capacidade precisam ser fechados antes do compromisso. Não há autorização de implementação nesta etapa.

## Objetivo proposto

Permitir ao organizador configurar pontuação e calendário do torneio, com versões e vigência explícitas, mantendo os resultados anteriores explicáveis e preservando torneios existentes.

Incremento demonstrável: criar uma competição absoluta e outra relativa, configurar penalidade e calendário, consultar a regra de cada período e executar uma revisão retroativa explícita com impacto conferido e histórico preservado. Todos os torneios e lançamentos usam o fuso fixo `America/Sao_Paulo`.

## Sprint Backlog candidato

| História | Valor e escopo | Requisitos | Estimativa preliminar |
| --- | --- | --- | --- |
| S5-01 — modos e penalidade | Como organizador, quero escolher absoluto/relativo e penalidade, para configurar a competição. Formulário, validação no servidor/banco, cálculo e apresentação coerentes; fuso fixo sem campo de configuração. | RF04/RF06, RN03–RN07 | 5 pontos |
| S5-02 — calendário e exclusões | Como organizador, quero escolher segunda a sexta ou todos os dias e excluir datas com motivo, para aplicar resultados apenas nos dias elegíveis. | RF11/RF12, RN09 | 5 pontos |
| S5-03 — versões, vigência e revisão retroativa | Como participante, quero identificar regras e revisões de cada período, para entender mudanças. Versões, vigência, responsável, consulta e revisão retroativa explícita, com proteção dos encerrados. | RF09, RN08, RNF05 | Reestimar |

Estimativa revisada preliminar: S5-01 e S5-02 com 5 pontos cada; S5-03 precisa de reestimativa por incluir revisão retroativa com prévia e confirmação. O total inicial de 18 pontos não é a estimativa vigente. A inclusão anterior de múltiplos fusos foi revogada pelo Dono do produto. Pontos não representam tokens ou velocidade observada. A capacidade será determinada pelo orçamento semanal de tokens, incluindo implementação, testes, documentação e homologação.

Meta operacional confirmada: preferencialmente concluir o plano atual no fim de semana de 03–04/10/2026 e reservar a semana de 05–09/10 para correções menores. É uma meta, não garantia de duração; saldo quantitativo de tokens e reserva para correções ainda não informados. Monitorar consumo e trabalho restante nos checkpoints do incremento; não reduzir testes ou rastreabilidade para caber no orçamento. Se houver insuficiência, registrar a situação e acordar o remanejamento com o Dono do produto.

Se o conjunto exceder a capacidade, propor um incremento menor: configuração versionada de novos torneios e consulta da regra, adiando edição de regras em torneios em andamento. Esse recorte exige decisão do Dono do produto e registro explícito do restante no Product Backlog; não entregar edição que reescreva o histórico silenciosamente.

## Decisões para fechar o planejamento

| Tema | Proposta para decisão do Dono do produto | Situação |
| --- | --- | --- |
| Duração e capacidade | Capacidade por tokens semanais; preferência por conclusão em 03–04/10 e semana seguinte para correções menores. Quantidade disponível e reserva ainda não registradas. | Diretriz confirmada em 03/10 |
| Vigência de mudanças | Permitir revisão retroativa explícita, além de mudanças futuras. Refinar intervalo afetado, conferência do impacto e confirmação. | Inclusão confirmada em 03/10 |
| Zero no modo absoluto | Zero representa ausência, assim como no relativo; bruto positivo no absoluto usa seu valor integral. | Confirmado pelo Dono do produto em 03/10 |
| Fuso | Fixo em `America/Sao_Paulo` para torneios e lançamentos; não faz parte da configuração do torneio. | Confirmado em 03/10; substitui a inclusão anterior de outros fusos |
| Limite da penalidade | Inteiro de −25.000 a 0, inclusive zero; mostrar sinal e efeito no formulário. | Proposta a validar no refinamento |
| Exclusões e calendário | Aplicar política explícita de vigência/revisão também ao calendário; excluir data fora do período ou duplicada é rejeitado. | Proposta a validar no refinamento |

Histórico das decisões: a proposta de somente mudanças futuras foi substituída pela revisão retroativa explícita; a inclusão de fusos configuráveis foi posteriormente revogada em favor do fuso fixo. Para revisão retroativa, propõe-se informar intervalo e motivo, apresentar impacto antes da confirmação e preservar versões/resultados anteriores na auditoria. Proposta técnica: aplicar atomicamente somente ao torneio aberto autorizado, rejeitando confirmação cuja base mudou desde a prévia. Isso não autoriza corrigir pontuações pessoais nem reabrir torneios encerrados. Definir substituição/cancelamento de versões futuras e concorrência no desenho técnico.

Data pessoal, prazo de lançamento e virada do dia dos torneios permanecem em São Paulo. Uma pontuação pessoal continua alimentando vários torneios elegíveis. A decisão elimina o conflito de datas entre fusos; não exige configuração de fuso nem conversão da identidade do lançamento. Zero bruto representa ausência em ambos os modos; zero aplicado por empate no menor positivo continua sendo resultado válido, não ausência.

## Critérios de aceite candidatos

### S5-01

- Somente organizador configura seu torneio; participante, outra conta e sessão anônima não podem editar, inclusive por chamada direta.
- Absoluto: 10.000, 12.000 e 15.500 geram esses mesmos valores. Relativo: geram 0, 2.000 e 5.500; empate no menor recebe zero.
- Ausência só recebe a penalidade configurada após o fim do dia elegível e com preparação histórica concluída; dia aberto ou histórico em preparação permanece pendente. Penalidade zero é válida.
- Dia sem positivos não falha; zero bruto representa ausência também no absoluto, com penalidade somente após o fechamento do dia elegível e preparação histórica concluída. Zero aplicado ao menor positivo no relativo permanece resultado válido.
- Painel e administração mostram modo, penalidade e versão efetivamente aplicáveis, substituindo textos hoje fixos. O lançamento pessoal continua compartilhado, com efeitos próprios por torneio.
- Não oferecer configuração de fuso. Validar criação e edição para preservar `America/Sao_Paulo`, inclusive em chamada direta; horários do dispositivo não alteram o dia de lançamento nem a avaliação de ausência.

### S5-02

- Segunda a sexta exclui sábado/domingo; todos os dias inclui sábado e domingo.
- Exclusão prevalece sobre dia semanal e lançamento existente: a data não gera pontos nem ausência na vigência correspondente.
- Registrar motivo da exclusão; validar período, duplicidade e autorização. Remover exclusão segue a política de vigência acordada.
- Calendário do torneio selecionado orienta os avisos de lançamento e resultados; torneio encerrado não admite edição.

### S5-03

- Toda configuração possui versão e vigência inequívocas; resultado referencia a versão da data e preserva os parâmetros necessários para explicar o cálculo.
- Mudança futura de modo, penalidade ou calendário não muda resultados anteriores. Cada data tem uma única versão efetiva e cobertura por referência inicial; intervalos históricos podem se cruzar, com precedência da revisão mais recente, conforme ADR-003.
- Revisão retroativa informa período, motivo e impacto sobre resultados/totais antes da confirmação; após aplicação, registra responsável, versões anteriores/novas e diferenças. Recalcular somente o intervalo/contexto aprovado e preservar os demais torneios e pontuações pessoais.
- Prévia sem confirmação não grava mudanças. Base alterada entre prévia e confirmação exige nova conferência; falha na aplicação não deixa revisão parcial. Torneio encerrado rejeita revisão.
- Repetir uma atualização não duplica efeitos; solicitações concorrentes não produzem versões ambíguas nem gravação parcial. Validar no banco, além da interface.
- Registrar ator, instante e alterações. Exibir regra vigente e mudanças futuras sem atribuir a regra atual a todos os dias históricos.
- Migração cria referência equivalente à regra existente, preservando pontuações pessoais, elegibilidades, resultados e encerrados; comparar antes/depois e verificar o cálculo de referência.

## Sequência de execução proposta

1. Fechar decisões, capacidade e compromisso no Sprint Planning; estabelecer amostras de aceite.
2. Desenhar versões/vigência e compatibilidade de dados de S5-03; registrar ADR e atualizar arquitetura/diagramas antes de concluir a implementação.
3. Preparar migração, validações transacionais e motor com testes de equivalência do legado.
4. Integrar S5-01 e S5-02 aos formulários e à visualização; concluir consulta de versões e rastreabilidade de S5-03.
5. Executar regressão local, revisar incremento e preparar implantação com backup, comparação e recuperação.
6. Aplicar/publicar conforme autorização operacional e evidências; realizar Sprint Review e registrar aceite do Dono do produto e retrospectiva.

## Testes e Definition of Done

Cobertura: CT05–CT10, CT12 e CT14–CT16, acrescidos de vigência, zero bruto como ausência em ambos os modos, zero aplicado válido no relativo, penalidade zero, exclusões, permissões, concorrência, isolamento e legado. Validar celular/teclado, virada do dia em São Paulo, dispositivo em outro fuso, rejeição de configuração de fuso, data pessoal compartilhada, revisão retroativa com prévia/confirmação/base alterada/rollback, preparação histórica, ingresso retroativo e encerrados.

Cada história concluída exige critérios acordados atendidos, testes locais pertinentes, lint/build, documentação funcional e de sprint, arquitetura/ADR/diagramas quando afetados e procedimento de migração com backup/recuperação. Separar evidências locais, execução remota, publicação e homologação. Não declarar entrega publicada ou aceita sem comprovação. Ensaios embarcados serializados não substituem teste PostgreSQL multiconexão quando houver garantia concorrente nova.

Antes de migração remota, capturar backup atualizado e comprovar recuperabilidade conforme o procedimento operacional; o backup histórico da Sprint 4 não é uma captura atual. Não versionar dados pessoais, credenciais ou arquivos de backup. Definir compatibilidade e ordem entre migração e aplicação e plano de recuperação de falha.

## Fora do compromisso candidato

Auditoria/votação permanece na Sprint 6; moderação/histórico avançado e FB05/FB06 na Sprint 7 em refinamento. Modo escuro, lançamento tardio, relatórios/envio/exclusão e integração GeoGuessr não entram automaticamente nesta sprint. Configuração de fuso foi retirada do requisito pelo Dono do produto; revisão retroativa explícita integra o escopo. Reabertura de encerrados e edição de pontuações pessoais não estão incluídas nessa decisão.

## Situação e evidências

Planejamento documental em 03/10/2026, baseado nos requisitos, backlog, regras, formulários e migrações locais. Nenhuma implementação, migração, publicação ou homologação nova. Verificação por revisão cruzada e `git diff --check`; testes da aplicação não executados. Diretriz de capacidade, revisão retroativa, zero como ausência e fuso fixo confirmados. Pendências funcionais de zero/fuso resolvidas; reestimativa de S5-03 e saldo quantitativo de tokens permanecem para avaliação da capacidade. Sprint ainda não iniciada.
