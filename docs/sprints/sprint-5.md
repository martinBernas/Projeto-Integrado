# Sprint 5 — Regras e calendário

Registro de 03/10/2026, organizado na sequência dos acontecimentos: planejamento, implementação, migrações, refinamento durante homologação, testes e conferências finais. Horários de captura abaixo estão em UTC, conforme os retornos do Supabase. Quando não há horário comprovado, a ordem segue os relatos e evidências fornecidos pelo Dono do produto.

## 1. Planejamento e definição inicial

O Dono do produto solicitou o planejamento antes do início do desenvolvimento. A Sprint 4 já estava encerrada.

Objetivo: permitir configuração de modo de pontuação, penalidade e calendário, com revisão retroativa explícita e histórico explicável, preservando os torneios existentes.

| História | Escopo planejado | Requisitos |
| --- | --- | --- |
| S5-01 | Modos absoluto/relativo e penalidade configurável | RF04/RF06, RN03–RN07 |
| S5-02 | Segunda a sexta ou todos os dias; exclusões de datas com motivo | RF11/RF12, RN09 |
| S5-03 | Histórico de regras, prévia e confirmação de revisão retroativa | RF09, RN08, RNF05 |

Decisões confirmadas no planejamento:

- Capacidade definida por tokens semanais, com preferência por concluir em 03–04/10 e reservar 05–09/10 para correções menores. Saldo quantitativo não informado; não há conversão comprovada entre pontos e tokens.
- Revisão retroativa explícita permitida, com conferência do impacto.
- Zero bruto representa ausência nos modos absoluto e relativo. Zero aplicado ao menor lançamento positivo no modo relativo é resultado válido.
- Fuso fixo `America/Sao_Paulo`, sem campo de configuração do torneio. A inclusão inicialmente considerada de outros fusos foi retirada pelo Dono do produto.
- Calendário com exatamente duas opções: **segunda a sexta** ou **todos os dias**, incluindo sábado e domingo. Essa é a definição funcional da sprint, não uma correção de decisão do Dono do produto.

Estimativas preliminares: 5 pontos para S5-01 e 5 para S5-02; S5-03 exigia reestimativa. O total inicial de 18 pontos deixou de ser vigente. Estimativas não constituem medição do consumo de tokens.

Fora do escopo: votação/auditoria de pontuações da Sprint 6; moderação/histórico avançado e feedbacks de resultados recentes e navegação da Sprint 7; múltiplos fusos, reabertura de encerrados e edição de pontuações pessoais pela revisão de regras.

## 2. Desenvolvimento autorizado e implementação inicial

Após confirmar zero como ausência e fuso fixo, o Dono do produto autorizou o desenvolvimento.

Entregues inicialmente: criação configurada, calendário/exclusões, revisão com prévia/confirmação, histórico e auditoria. O primeiro desenho técnico permitia versões por intervalos; essa escolha foi posteriormente substituída na etapa 5. Sua documentação histórica está em [ADR-003](../decisoes/adr-003-regras-versionadas.md).

Escolhas técnicas de validação: penalidade inteira de −25.000 a 0; até 366 exclusões por revisão; datas únicas dentro do período; motivos de exclusão de 3–200 caracteres e motivo da revisão de 3–500. Exclusões usam `AAAA-MM-DD | motivo`.

Prévia não grava alterações. Confirmação revalida autorização, estado do torneio e frescor da base; versão, auditoria e recálculo são atômicos. Encerrados rejeitam revisão. Remoção de resultados por calendário é auditada; lançamentos pessoais permanecem compartilhados e intactos.

Verificação inicial: suíte completa com 52 testes aprovados, zero falhas/pulados; lint/build aprovados. A contagem anterior de 51 foi substituída após cobertura de sábado/domingo e compatibilidade do calendário legado. Houve tentativa de build com `EPERM` em arquivo temporário de `.next`; repetição autorizada concluiu sem erro.

Componentes reais foram inspecionados em prévia local com dados fictícios e gravações desativadas, em viewport padrão e 390 px. Não houve rolagem horizontal da página; tabelas tiveram rolagem interna. Isso não representa ensaio autenticado remoto. Cópia privada de setembro e scripts de captura/exportação/comparação/recuperação também foram ensaiados localmente, sem versionar dados privados.

## 3. Backup e migrações iniciais no Supabase

Execução dos comandos no Supabase é responsabilidade do Dono do produto. O agente prepara/revisa scripts, executa testes locais, valida exportações e registra as evidências fornecidas.

### 3.1 Captura e comparação anteriores à migração

Referência `before-s5-v1`, capturada em **2026-10-03 14:25:55.292019+00**, data de referência 03/10/2026:

| Torneios | Vínculos | Perfis | Pontuações pessoais | Exclusões legadas | Resultados armazenados | Linhas calculadas |
| --- | --- | --- | --- | --- | --- | --- |
| 4 | 42 | 17 | 289 | 1 | 434 | 424 |

Captura por `01-backup.sql`; exportação por `03-export.sql`, com sete seções e definições de três funções; comparação por `02-verify.sql`. Exportação validada integralmente e após salvar/reler em `backups/sprint-5/before-s5-v1.json`, ignorado pelo Git.

Checksum do snapshot: `801fcd595c5e747cf5a92cfbcb85cb57`. Comparação remota anterior à migração: zero seções diferentes, lista vazia e checksums iguais.

### 3.2 Aplicação e verificação

Dono do produto executou, separadamente:

1. `202610030000_all_days_calendar.sql`: acrescentou `every_day`, concluindo sua transação antes da principal.
2. `202610030001_versioned_rules.sql`: criou referências de regras, RLS/auditoria e substituiu cálculo/refresh.

Ambas retornaram “Success. No rows returned”. A comparação posterior por `02-verify.sql` também retornou zero diferenças e o mesmo checksum.

Conferência estrutural: nove indicadores de esquema/permissões verdadeiros por `05-check-migration.sql`; consulta isolada `06-check-initial-versions.sql` confirmou **4 torneios, 4 versões e zero inconsistências**. Esses indicadores de catálogo não substituem testes de autorização com contas da aplicação.

## 4. Início da homologação e referência de testes

Dono do produto editou Aztecas Outubro para excluir **12/10/2026** e usar penalidade **−2.000**, e confirmou que a edição funcionou. Essa edição passou a integrar o estado original a preservar.

Foi inicialmente recomendado testar com contas exclusivas. O Dono do produto definiu posteriormente que criaria novos torneios com jogadores atuais e usaria seus lançamentos existentes, **sem alterar pontuações brutas**. Retirada posterior deveria atingir apenas os torneios de teste, preservando alterações legítimas feitas pelos jogadores.

Referência `before-s5-tests-v1`, capturada em **2026-10-03 14:51:48.563374+00** por `07-backup-before-tests.sql`:

| Torneios | Vínculos | Perfis | Pontuações | Resultados | Calculados | Versões | Auditorias de revisão |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 4 | 42 | 17 | 289 | 434 | 424 | 5 | 1 |

Exportação por `08-export-before-tests.sql` validada e salva privadamente. Comparação por `09-verify-before-tests.sql`: zero diferenças; checksum `7678323756186bab0637d992c8d9e42e`. Definições de funções vazias conforme esse roteiro de captura pós-migração; funções anteriores permanecem na referência inicial.

## 5. Refinamento durante homologação: regra única e período editável

Dono do produto observou complexidade na edição por intervalos e definiu:

- Cada torneio deve ter **uma única regra para todo o período**.
- Início e fim devem poder ser alterados, mesmo com participantes e resultados.
- Configurações anteriores são histórico, sem regras simultaneamente aplicáveis.

Essa definição substituiu o desenho técnico inicial, conforme [ADR-004](../decisoes/adr-004-regra-unica-por-torneio.md).

Implementação complementar: tela **Configurar período e regras**, com início/fim, configuração completa e motivo. A prévia simula todo o período; confirmação grava revisão, período/parâmetros atuais do torneio, auditoria e recálculo na mesma transação. Última revisão governa todos os dias dos torneios abertos. Nome permanece editável separadamente; mudança de datas usa o fluxo com prévia.

Critérios vigentes:

- Reduzir o período retira resultados fora dele com auditoria; ampliar inclui dias já alcançados, sem projetar pontuações futuras.
- Exclusões fora do novo período são rejeitadas; remoção exige edição explícita.
- Brutos, vínculos, elegibilidade e regras de outros torneios preservados. Ampliar o início não antecipa automaticamente a elegibilidade; reduzir o fim pode deixar participantes sem dias elegíveis.
- Sem programação independente de regra futura, exclusão física de revisões ou reabertura de encerrados.
- Prévia sem gravação; base alterada exige nova prévia. Token inclui pontuações nos períodos antigo e proposto. Falhas revertem período, versão, auditoria e recálculo.
- Contrato `scope: tournament` rejeita propostas da interface anterior, evitando interpretar vigência parcial como alteração das datas do torneio.

Validação local do complemento: **60 testes aprovados**, zero falhas/pulados; lint/build aprovados. Cobertura de migração equivalente, regra única, ampliação/redução/restauração, brutos/elegibilidade preservados, exclusões inválidas, frescor, autorização/encerrados, criação e rollback. Scripts de captura/exportação/comparação também ensaiados.

## 6. Migração complementar, bloqueio e normalização explícita

### 6.1 Primeira referência e tentativa

Referência `before-s5-single-rule-v1`, captura **2026-10-03 15:24:18.739201+00**, scripts 10–12:

| Torneios | Vínculos | Perfis | Pontuações | Resultados | Calculados | Versões | Auditorias |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | 59 | 17 | 290 | 978 | 968 | 7 | 2 |

Exportação validada com sete definições de funções; comparação anterior sem diferenças. Checksum: `b4816f567139b0e06d1fbb8f016804ce`.

A tentativa de `202610030002_single_tournament_rule.sql` foi recusada por `single_rule_migration_requires_full_period`, antes das alterações de funções/trigger. TESTE S5 abrangia 01/09–31/10, mas sua última revisão abrangia somente 01/10–31/10. A guarda evitou escolher uma regra automaticamente. Diagnóstico somente leitura: `13-diagnose-partial-rules.sql`.

### 6.2 Normalização e segunda referência

Dono do produto confirmou na interface anterior a revisão **s5-8** para todo o TESTE S5: 01/09–31/10, absoluto, penalidade −2.000, segunda a sexta e exclusão 12/10 (Feriado). Motivo: “Aplicar configuração única a todo o torneio”. Registro exibido em 03/10 às 12:33 São Paulo; revisões anteriores preservadas.

Referência `before-s5-single-rule-v2`, captura **2026-10-03 15:34:41.263588+00**, scripts 14–16:

| Torneios | Vínculos | Perfis | Pontuações | Resultados | Calculados | Versões | Auditorias |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 5 | 59 | 17 | 290 | 842 | 832 | 8 | 3 |

Exportação validada com sete funções; comparação anterior sem diferenças. Checksum: `f6c6d78a67309d858fae0e70c4080477`. Referências anteriores preservadas, sem sobrescrita.

### 6.3 Aplicação e comparação posterior

Dono do produto repetiu somente `202610030002_single_tournament_rule.sql`, que retornou “Success. No rows returned”. Comparação posterior por `16-verify-after-full-period.sql`: **zero diferenças**, lista vazia e checksums iguais à v2. Dados/cálculo de referência e histórico preservados.

Migrações iniciais e complementar estão aplicadas e verificadas. Não devem ser reaplicadas. A interface correspondente foi posteriormente exercitada pelo Dono do produto; URL e identificação formal do deployment não foram fornecidas, portanto não há registro de versão específica publicada na Vercel.

## 7. Homologação funcional da regra única

### 7.1 Prévia e ranking

Recebida prévia para 01/09–31/10: absoluto, penalidade proposta **−1.000**, segunda a sexta, exclusão 12/10 e motivo “Atualizacao regras”. Conferência integral do anexo:

- 121 alterações, todas de ausência −2.000 para −1.000.
- 17 totais com aritmética antes/depois/diferença correta.
- Soma das diferenças **+121.000**, equivalente a 121 × 1.000.

Após aplicação, Dono do produto forneceu ranking explicitamente identificado como TESTE S5: os **17 totais coincidiram com a coluna Depois**, com ordem decrescente e posições corretas, sem empate nessa amostra.

### 7.2 Cenários confirmados pelo Dono do produto

| Cenário | Evidência/resultado |
| --- | --- |
| Recarga | Mesmos totais e penalidade −1.000 persistentes |
| Redução do período | Início em 01/10, fim 31/10; prévia e confirmação retiraram setembro |
| Restauração do período | Início voltou a 01/09, mesma regra; totais conferidos restaurados |
| Isolamento | Regras dos quatro torneios originais permaneceram iguais |
| Dias semanais | Alternância segunda a sexta/todos os dias e restauração aprovadas |
| Exclusão de data passada | Retirada e restauração de resultados/ranking aprovadas |
| Modo de pontuação | Alternância absoluto/relativo e restauração aprovadas |

Durante as provas, jogador real fez lançamento legítimo de 03/10. Imagem mostrou dia provisório no relativo: **13.943 − 9.081 = 4.862**; menor positivo recebeu zero aplicado válido. Esse lançamento deveria ser preservado na retirada. Novos lançamentos legítimos podem alterar totais em relação aos backups anteriores.

## 8. Retirada do torneio de teste e preservação dos dados

Inventário somente leitura, scripts 17–18, confirmou o alvo TESTE S5 (`ffb35af7-e582-49b8-bc74-05906df651ca`): 01/09–31/10, aberto, 17 participantes, 544 resultados, 9 versões e zero exclusões legadas. Participantes, exclusões, resultados e versões tinham FK com cascata; pontuações pessoais e auditorias privadas não deveriam ser removidas.

Script `19-remove-confirmed-test.sql` validou alvo/contagens, capturou estado atual, retirou somente esse ID e comparou integralmente o estado esperado dos demais dados/cálculo. Divergência reverteria a transação. Teste local direcionado aprovado: recusa de contagens divergentes, retirada isolada, lançamento novo, torneio original e auditoria preservados. Esse teste adicional não constitui nova execução da suíte completa de 60.

Execução remota pelo Dono do produto retornou:

| Resultado | Valor |
| --- | --- |
| Captura anterior à retirada | `before-s5-test-cleanup-v1` |
| Horário | `2026-10-03 16:16:36.107219+00` |
| Checksum | `44cff88b18d169d00ec550aede25017a` |
| Torneio de teste removido | `true` |
| Torneios restantes | **4** |
| Pontuações pessoais preservadas | **291** |

A exportação por `20-export-test-cleanup.sql` foi validada e salva privadamente. Ela retrata o estado **anterior** à retirada: 5 torneios, 59 vínculos, 17 perfis, 291 pontuações, 1 exclusão legada, 978 resultados, 968 linhas calculadas, 14 versões e 9 auditorias; definições de funções vazias conforme o roteiro.

Dono do produto confirmou visualmente os torneios originais preservados. O lançamento do Feyh não aparecia nos torneios ativos porque 03/10 era sábado e nenhum deles incluía fim de semana. Consulta direta `21-check-preserved-score.sql` confirmou **13.943 antes e depois**, `score_present = true` e `unchanged_from_cleanup_backup = true`.

Retirada e conferências finais concluídas. Nenhuma restauração global, exclusão de contas ou remoção de lançamentos brutos foi executada.

## 9. Revisão documental e evidências privadas

Após as conferências finais, o Dono do produto solicitou revisão de toda a arquitetura. Foram alinhados arquitetura, ADR-003/004, classes, regras e navegação à regra única e às evidências remotas. Desenho antigo identificado como histórico. Pendências antigas do ADR-002/diagrama de perfil foram conciliadas com o encerramento comprovado da Sprint 4.

Documentos relacionados:

- [Arquitetura](../arquitetura.md) e [ADR-004 vigente](../decisoes/adr-004-regra-unica-por-torneio.md).
- [Classes](../diagramas/classes.md), [regra única](../diagramas/regras-versionadas.md) e [navegação](../diagramas/navegacao-torneios.md).
- [Operação e scripts](sprint-5-operacao.md), [requisitos](../requisitos.md), [regras](../regras-de-pontuacao.md) e [plano de testes](../plano-de-testes.md).

Todas as exportações foram conferidas integralmente, com `md5(snapshot::jsonb::text)` recalculado em PostgreSQL/PGlite e reconfirmado após salvar/reler. Escapes de tabela Markdown foram decodificados quando presentes. Arquivos em `backups/sprint-5/` são ignorados pelo Git; não contêm material a versionar.

| Referência | SHA-256 do JSON salvo | SHA-256 do anexo de origem |
| --- | --- | --- |
| `before-s5-v1` | `1a3ebf4db49eed74f89c2ec379211796d0084c4ffdfb51a02e50174ef76a4a04` | `1ddeb8e5e6cd78e460a66d7514c2c0d2481607df5ac24f9e53aa7ee79f60af09` |
| `before-s5-tests-v1` | `43949d941ad8b128fda6ee81acc46abd654ee5c9b8ddc0490f65ef4be214deb7` | `96e0017eba73b79a5aa10a79daa4e121762608235a2d237c4281d0e17e0760ee` |
| `before-s5-single-rule-v1` | `bacdff87d06f80865b25d2bf25f45975dd76e83a0102490316b2c7148bbc54b0` | `aa9887cb0287355f2c4c050ea7311eadd745f0288850ce5b3194fb08367017f6` |
| `before-s5-single-rule-v2` | `c73cffcf3a20383d0ed82693ee72f3cec6dd67b70b77884c290a2b4b8a0db960` | `a9f2fcdbe98c693edde47f527420c24386744d6846f2e0b9a9a90deb1e36f435` |
| `before-s5-test-cleanup-v1` | `5712ce9b2057a3d4a6f09a2ff2822877944410fe8ee1ce97350a668493dad1be` | `06e8850fe40aa30b565a9a9641ede8e94b9cebdf90ca1d3a5d4346f97314a5f6` |

## 10. Acréscimo aprovado — S5-04: resultados recentes e expansão

Após homologação e conferências do núcleo, Dono do produto informou margem de 33% no primeiro intervalo de cinco horas e propôs um requisito adicional. Selecionou explicitamente resultados recentes e expansão, incluindo resultados diários e histórico pessoal de FB05, antes candidato à Sprint 7. Cota informada não é estimativa de esforço nem medição independente.

Escopo aprovado e implementado localmente:

- Exibir os **cinco dias com resultados mais recentes**, em ordem decrescente, não cinco datas corridas.
- “Ver todos” mostra todos os dias disponíveis e muda para “Mostrar menos”, retornando aos cinco recentes. Até cinco dias não há botão; lista vazia mantém explicação.
- Ranking acumulado usa todos os resultados elegíveis, mesmo quando dias não estão na apresentação reduzida. Ordenação, snapshots e detalhes diários preservados.
- Nova seleção de torneio começa reduzida, assim como recarga. Controle por teclado, foco visível, `aria-expanded`, `aria-controls` e anúncio da contagem.
- Histórico pessoal também exibe cinco lançamentos recentes, com expansão/redução independente. A consulta mantém o limite existente de 100 lançamentos; Ver todos mostra os registros carregados, inclusive dias sem torneio elegível. Lista de torneios e FB06 permanecem fora desse recorte.

Escolha técnica: `RecentResults` é componente de cliente com estado de apresentação. `TournamentView` monta ranking e detalhes no servidor e fornece os conteúdos diários; chave pelo ID do torneio separa a expansão entre seleções. Sem cache privado, consulta adicional ou alteração de autorização. Dados completos continuam consultados/transferidos: não é paginação nem prova de redução da latência de troca.

Sem migração SQL, backup novo ou novas gravações de negócio. Arquitetura/navegação/requisitos e backlog atualizados. Validação: 65 testes aprovados, sem falhas ou cenários ignorados; lint e build de produção aprovados em 03/10/2026.

Homologação adicional após disponibilizar a versão:

1. Em torneio com mais de cinco dias, conferir cinco mais recentes e ranking completo.
2. Expandir/reduzir: acesso aos dias antigos e retorno aos recentes, ranking inalterado.
3. Trocar de torneio após expandir e recarregar: apresentação reduzida.
4. Até cinco dias: sem botão; lista vazia: explicação.
5. No histórico pessoal, conferir cinco lançamentos recentes, expandir/reduzir sem alterar a expansão do torneio e incluir dias sem torneio elegível. Validar vazio/até cinco e a informação do limite de 100.
6. Conferir celular/teclado e detalhes diários.

Publicação/homologação remotas de S5-04 ainda não confirmadas. Cenários do núcleo já aprovados permanecem como evidência; sem reabertura automática.

## 11. Situação para aceite

**Núcleo S5-01–S5-03 implementado, migrado/verificado e homologado nos cenários relatados; conferências finais de preservação concluídas. S5-04 implementada localmente, com publicação/homologação adicionais pendentes. Aceite global e encerramento aguardam manifestação explícita do Dono do produto após esse acréscimo.**

Limites das evidências:

- Testes locais de autorização, encerrados, frescor, confirmação repetida e rollback aprovados; não foram relatados todos esses cenários com contas no ambiente remoto.
- Ensaios embarcados serializados não comprovam disputa PostgreSQL com múltiplas conexões. Nenhum novo ensaio multiconexão remoto foi apresentado.
- Inspeção local em celular/teclado não equivale a homologação remota desses aspectos.
- URL/versão formal do deployment não fornecidas, embora a interface tenha sido exercitada pelo Dono do produto.
- Capturas de negócio não substituem backup integral do Supabase/Auth. Backup integral/restauro e cópia protegida fora do repositório não foram confirmados.

Critério de encerramento: decisão do Dono do produto sobre o aceite do incremento, considerando as evidências e os limites acima. Não registrar aceite ou publicação de versão específica sem comprovação.
