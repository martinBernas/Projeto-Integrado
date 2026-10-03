# Sprint 5 — Regras e calendário

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
