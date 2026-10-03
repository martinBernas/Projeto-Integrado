# Plano de testes

Complemento S5 de regra única/período editável: `pnpm test`: 60 aprovados, zero falhas/pulados; `pnpm lint` e `pnpm build` aprovados. Cobertura adicional: migração sem alteração de dados/cálculo, contrato atualizado, regra única nos snapshots, ampliação/redução/restauração, elegibilidade/brutos preservados, exclusões inválidas, token com pontuações de datas acrescentadas, autorização/encerramento, criação e rollback atômico. Scripts 10–12 de captura/exportação/comparação ensaiados localmente. Contagens anteriores abaixo são históricas.

## Sprint 5 — evidências locais de 03/10/2026

Suíte completa da Sprint 5: `pnpm test`, 52 aprovados, zero falhas/pulados. Inclui dez cenários de banco em `versioned-rules.test.mjs`, duas verificações de ações/entrada em `rule-actions.test.mjs` e renderização em `rule-view.test.mjs`, além da regressão anterior. Cobertura: legado/cópia privada, absoluto/zero, sábado/domingo em todos os dias, exclusão/restauração, aviso de lançamento no sábado, versões futuras e precedência, prévia somente leitura/obsoleta, isolamento/RLS/escrita direta, encerrados, repetição de confirmação, rollback e captura/exportação/recuperação antes do uso. Calendário legado que excluía sábado conserva sua semântica. Comparações de SQL usam ordem explícita e datas normalizadas. Substitui a contagem inicial de 51.

Lint/build aprovados; inspeção visual de componentes reais com dados fictícios, gravação desativada, em viewport padrão e 390 px. PGlite serializa a fila: duas confirmações enfileiradas não são ensaio PostgreSQL multiconexão. Nenhum teste remoto/homologação presumido. [Roteiro e limites operacionais](sprints/sprint-5-operacao.md). Após a execução completa, ajustes de compatibilidade do wrapper legado, legenda da prévia e rejeição de exclusão sem separador verificados nos 12 testes direcionados S5, com lint/build final; sem alteração dos demais fluxos.

## Feedback de usabilidade — planejamento de 03/10/2026

FB05/FB06 são candidatos à S7-03, sem implementação ou testes executados. [Critérios e cenários propostos](sprints/sprint-7.md): limites/expansão de resultados, ranking integral, muitos dias/torneios, celular/teclado; feedback de carregamento, navegação rápida e por histórico, rede lenta/falhas, atualização de dados e isolamento/revogação de acesso. Para FB06, estabelecer linha de base e meta mensurável antes de implementar; registrar ambiente, volume e condições de rede. Esses cenários não reabrem o aceite da Sprint 4.

## Estratégia

Planejamento da Sprint 5 em 03/10/2026: CT05–CT10, CT12 e CT14–CT16 relacionados às histórias e aos cenários adicionais de vigência/revisão retroativa, migração/legado, permissões, concorrência e calendário no [plano da sprint](sprints/sprint-5.md). Zero bruto como ausência em ambos os modos e fuso fixo São Paulo confirmados; testar distinção entre zero bruto e zero aplicado válido no relativo, virada do dia e dispositivo em outro fuso. Nenhum teste novo executado nesta etapa documental.

Os testes seguem a lógica de verificação e validação: requisitos são validados por testes de aceitação; fluxos integrados por testes de sistema; integrações entre módulos por testes de integração; e cálculos por testes unitários.

## Casos de teste prioritários

| ID | Requisito | Cenário | Resultado esperado |
| --- | --- | --- | --- |
| CT01 | RF01 | Usuário informado com credenciais válidas | Acesso autenticado e perfil carregado |
| CT02 | RF02/RF04 | Usuário cria torneio com período válido | Torneio é salvo com fuso fixo `America/Sao_Paulo` e o criador torna-se organizador |
| CT03 | RF05/RN01 | Jogador lança 20.000 sem estar em torneio | Lançamento pessoal é salvo, associado ao jogador e à data |
| CT04 | RF03/RN02 | Jogador entra após o torneio iniciar | Pontuações pessoais desde o início do período entram no ranking |
| CT05 | RF06/RN03 | Torneio absoluto e pontuação de 15.500 | Pontuação aplicada é 15.500 |
| CT06 | RF06/RN04 | Resultados 10.000, 12.000 e 15.500 | Pontos relativos: 0, 2.000 e 5.500 |
| CT07 | RF06/RN04 | Dois jogadores empatam com a menor pontuação | Ambos recebem 0 ponto aplicado |
| CT08 | RF06/RN05/RN06 | Jogador sem lançamento após o horário do torneio | Penalidade configurada é aplicada uma única vez |
| CT09 | RN06 | Dia sem pontuação positiva | Sem erro, sem ranking diário e sem cálculo de diferença |
| CT10 | RF07/RN07 | Totais distintos de participantes | Maior total ocupa a primeira posição |
| CT11 | RF08 | Jogador tenta alterar lançamento de outro jogador | Operação é negada |
| CT12 | RF09/RN08 | Regra é alterada após resultado consolidado | Resultado existente e regra aplicada permanecem auditáveis |
| CT13 | RF10 | Usuário participa de dois torneios e não participa de um terceiro | A lista exibe somente os dois torneios participantes, com acesso aos detalhes de cada um |
| CT14 | RF11/RN09 | Torneio configurado de segunda a sexta e lançamento feito no domingo | Domingo não é considerado dia de jogo nem gera resultado |
| CT15 | RF11/RN09 | Torneio configurado para todos os dias | Sábado e domingo são dias de jogo, com pontuação ou ausência conforme a regra; exclusão específica prevalece |
| CT16 | RF12/RN09 | Organizador exclui uma segunda-feira por feriado | A data excluída não gera pontuação nem penalidade |

## Evidências

### Aceite concluído — 21/09/2026

Carga, formulário, sessão e permissões aprovados; restauração final em `2026-09-21 04:34:11.882419+00`, com `history_ready = false`. Consulte o [encerramento](sprints/sprint-3-encerramento.md) para evidências, executor e limites. Suíte local completa reexecutada: `node --test tests/*.test.mjs`, 11 testes aprovados, zero falhas. Lint e build da aplicação já aprovados; esta etapa adicionou scripts, testes e documentação.

Os registros abaixo preservam estados anteriores da execução; as pendências de aceite foram resolvidas conforme o encerramento. A carga real permanece atividade operacional.


### Ensaio remoto concluído e rollback — 21/09/2026

Executado pelo Dono do produto na aplicação publicada da Sprint 3 (commit `8671149`, deployment Ready em Production informado por captura). A consulta de conciliação retornou totais esperados/aplicados de 79.534 e 2.365, com todos os dias corretos para as duas contas. O Dono do produto confirmou no painel o ranking, empate em 02/09, ausência de ambos em 04/09 e exclusão de fim de semana/feriado em 05–07/09. Isso valida esses cenários de carga, cálculo e exibição; não comprova todos os testes de escrita/autorização em produção.

Rollback confirmado por resultado SQL: `history_ready = false`, `rolled_back_at = 2026-09-21 04:12:40.142415+00`. Ensaio encerrado no banco, sem deixar o histórico marcado como concluído. Conferência visual posteriormente confirmada; carga real permanece atividade operacional. Os registros anteriores abaixo descrevem os estados de preparação e validação local anteriores a esse ensaio.

### Ensaio com duas contas e rollback — preparação

A pedido do Dono do produto, preparados `web/supabase/rehearsal/01-load.sql`, `02-verify.sql` e `03-rollback.sql`. Dois testes adicionais em PGlite passaram: carga com conciliação independente e restauração integral das tabelas de negócio ao estado anterior, incluindo dados preexistentes; recusa de rollback quando há pontuação alterada após a carga. O rollback repetido também preservou o estado restaurado. Auditoria interna e backup do ensaio são mantidos. A execução remota posterior está registrada acima. Procedimento em [Ensaio da Sprint 3](sprints/sprint-3-ensaio.md).

### Confirmação do provisionamento remoto pelo Dono do produto

As migrações `202609200001_september_mvp.sql` (com RLS nas tabelas internas de histórico), `202609200002_score_entry.sql` e o seed retornaram `Success. No rows returned`, conforme informado pelo Dono do produto. A consulta posterior retornou: `GeoGuaras — Setembro 2026`, início `2026-09-01`, fim `2026-09-30`, modo `relative_to_lowest`, penalidade `-2500`, calendário `monday_to_friday`, `history_ready = false` e exclusão `2026-09-07`. Evidência fornecida na conversa pelo executor; não equivale à homologação ponta a ponta nem à carga histórica concluída.

### Execução local da Sprint 3 — 20/09/2026

Responsável pela execução: agente de desenvolvimento. Base do trabalho: commit `7887c29`; implementação ainda local. `pnpm test`: sete testes aprovados, sendo seis de PostgreSQL embarcado/PGlite e um de ranking. Cobertura: provisionamento repetível, 21 dias elegíveis em setembro, exclusão de 07/09/fins de semana, diferenças e empate no menor, ausência, dia aberto, snapshots/revisões, RLS sem recursão, isolamento, escrita direta negada, lançamento autenticado e limites, correção sem duplicidade, carga histórica e sua conclusão. Amostra: 20.002 − 16.668 = 3.334; empate em 12.000 = zero para ambos.

`pnpm lint` e `pnpm build` aprovados. Componentes reais de formulário/torneio renderizados com dados fictícios e inspecionados em navegador headless nas larguras 390 e 1.280 pixels; sem overflow horizontal, detalhes diários abrindo corretamente. Essa inspeção visual não é um teste ponta a ponta de login/salvamento: autenticação no PGlite é simulada. O provisionamento no Supabase foi posteriormente confirmado pelo Dono do produto; login/lançamento/ranking ponta a ponta e publicação na Vercel permanecem pendentes.

Carga histórica incompleta: sem penalidades, resultados provisórios. Carga repetida: sem duplicidade. Conclusão administrativa: habilita penalidades de dias encerrados. Requer conciliação do Excel real quando fornecido pelo Dono do produto. CT01 e S3-CT08 no ambiente publicado continuam pendentes, assim como a evidência de publicação.

### Recorte de aceite da Sprint 3

Cadastro e login já foram concluídos e validados na Sprint 2. A execução de CT01 e do acesso no fluxo S3-CT08 é uma verificação de regressão e integração com o torneio, não uma nova implementação nem reabertura da entrega anterior. Os novos resultados de teste devem ser registrados como evidências da integração da Sprint 3.

Executar CT01, CT03, CT06–CT09 e CT11 no fluxo entregue. CT07 passa a seguir o menor positivo observado no Excel. Adaptar CT10 ao total do torneio único. CT14–CT16 verificam calendário provisionado, sem exigir editor. CT02 será substituído nesta entrega pela verificação de provisionamento abaixo. CT05, CT12 e CT13 completos permanecem para as funções futuras; a identificação da regra fixa é validada separadamente nesta sprint.

| ID | Cenário adicional | Resultado esperado |
| --- | --- | --- |
| S3-CT01 | Executar provisionamento duas vezes | Um único torneio e vínculos sem duplicidade |
| S3-CT02 | Não participante consulta torneio; jogador tenta configurar regra pela API | Acesso negado, sem erro de recursão de RLS |
| S3-CT03 | Mesmo jogador envia duas vezes para a mesma data | Sem duplicidade; alteração somente no prazo autorizado |
| S3-CT04 | Dia corrente, dia encerrado, futuro e data excluída | Penalidade apenas no dia encerrado elegível; repetição de cálculo não duplica valor |
| S3-CT05 | Pontuações de `Diario!C2:C14` | Menor positivo 16.668; para 20.002, resultado 3.334, como `geral!C2` |
| S3-CT06 | Dia sem positivos | Sem erro nem diferenças inválidas; ausência conforme decisão registrada em S3-01 |
| S3-CT07 | Consultar resultado e sua origem | Pontuação bruta ou ausência, data e identificação da regra recuperáveis |
| S3-CT08 | Fluxo publicado com duas contas participantes e uma externa | Login, lançamento e ranking funcionam; escrita de terceiros e leitura externa negadas |
| S3-CT09 | Alteração própria após encerramento; pontuação fora do limite | Operações negadas conforme prazo e limites definidos em S3-01 |
| S3-CT10 | 07/09/2026 com pontuação histórica e sem lançamento, após encerramento | Em ambos os casos, nenhum ponto aplicado ou penalidade; data excluída do ranking do torneio |
| S3-CT11 | Sábado 05/09 e domingo 06/09 com e sem lançamento; terça 08/09 com resultado válido | Fim de semana ignorado; 08/09 calculado normalmente, sem estender a exclusão do feriado |
| S3-CT12 | Executar duas vezes o provisionamento da exclusão de 07/09/2026 | Uma única exclusão persistida para o torneio |

CT04 será adaptado à carga manual: cadastrar uma conta, vinculá-la ao torneio e carregar pontuações anteriores ao cadastro, mas dentro do período. Elas devem compor o ranking. Repetir uma carga não pode duplicar jogador/data; preservar autoria, origem e regra. Validar ausência antes da data de cadastro segundo a elegibilidade definida, e não segundo a idade da conta.

Esta tabela define os casos planejados; execução e adaptações estão registradas nas evidências e no encerramento. Fixar a data de referência nos testes da penalidade, pois os valores salvos no Excel podem refletir outro dia de cálculo.

Período confirmado do torneio: 01/09/2026 a 30/09/2026, inclusive. Testar os limites: 31/08 e 01/10 não entram no ranking nem geram penalidade neste torneio; 01/09 e 30/09 entram conforme calendário e encerramento do dia. Em uma execução com data de referência 20/09, não aplicar antecipadamente penalidades aos dias restantes de setembro.

Para cada execução, registrar identificador do caso, data, responsável, dados usados, resultado obtido, resultado esperado e evidência (captura de tela ou saída do teste automatizado).

## Perfil público — casos planejados da Sprint 4

Ainda não executados. Ver [Perfil público](perfil-publico.md).

| ID | Requisito | Cenário e aceite |
| --- | --- | --- |
| CT26 | RF17 | Cadastrar/editar nome; outra conta vê o nome escolhido em participantes/resultados/ranking, sem e-mail como alternativa |
| CT27 | RF17 | Conta existente confirma/substitui nome herdado; UUID, pontuações e vínculos preservados |
| CT28 | RF18 | Incluir/alterar/remover URL; competidor autorizado abre o link; ausência de URL não impede uso |
| CT29 | RF17/RF18 | Nome vazio/e-mail e URL inválida, domínio estranho ou esquema executável rejeitados no servidor, inclusive por chamada direta |
| CT30 | RF17/RF18 | Outra conta não edita o perfil; leitura restrita ao recorte autorizado, sem e-mail nas respostas |
| CT31 | RF17 | Inclusão em outro torneio preserva nome escolhido pelo titular; nome já usado por outra conta é rejeitado no cadastro e na edição |
| CT32 | RF17 | Duas contas tentam reservar simultaneamente o mesmo nome; somente uma operação é aceita e a outra recebe mensagem de nome indisponível |
| CT33 | RF17 | Conforme normalização proposta, nomes com diferença apenas de caixa ou espaços nas extremidades colidem; editar outros campos mantendo o próprio nome é permitido |
| CT34 | RF17 | Migração identifica colisões preexistentes e exige resolução antes da restrição, sem mesclar contas ou alterar pontuações/vínculos |

## Automação planejada

### Auditoria por votação — casos futuros da Sprint 6

Casos planejados, não executados e fora do aceite da Sprint 3. Refinar as políticas abertas em [Auditoria de pontuações](auditoria-de-pontuacoes.md) antes de implementar.

| ID | Requisito | Cenário | Resultado esperado |
| --- | --- | --- | --- |
| CT17 | RF13/RF15 | Organizador tenta abrir/encerrar auditoria de outro torneio ou encerrar antes do prazo | Operação negada |
| CT18 | RF14 | Votos pela manutenção e pela invalidação durante o período | Votos registrados segundo elegibilidade e unicidade; voto após prazo negado |
| CT19 | RF15/RF16 | Maioria pela invalidez; organizador escolhe desconsiderar | Contribuição removida no torneio denunciante, sem penalidade automática |
| CT20 | RF15/RF16 | Maioria pela invalidez; organizador escolhe penalidade do dia | Contribuição substituída pela penalidade; reapuração não duplica punição |
| CT21 | RN10 | Mesma pontuação usada nos torneios A e B; decisão de invalidez em A | Somente A afetado; pontuação bruta e resultado em B preservados |
| CT22 | RN11 | Maioria pela manutenção | Pontuação permanece válida |
| CT23 | RN13 | Consultar auditoria encerrada | Votos, apuração, responsável, decisão, punição e alterações rastreáveis conforme acesso autorizado |
| CT24 | RF15 | Empate, nenhum voto ou quórum insuficiente | Resultado conforme política a definir; não presumir invalidação |
| CT25 | RN04/RN10 | Pontuação invalidada era o menor positivo | Recálculo conforme política a definir, restrito ao torneio denunciante e com histórico preservado |

### Ferramentas previstas

- Testes unitários do motor de pontuação com Vitest.
- Testes de integração do banco e das permissões.
- Testes ponta a ponta dos fluxos de login, lançamento, participação em torneio e ranking com Playwright.

## S4-03 — Abas de torneios

Cobertura local: `web/tests/multiple-tournaments.test.mjs` valida listagem RLS, resultados e exclusões por torneio, elegibilidade diferente para a mesma conta, organizador sem participação, encerrados e negação após remoção/sem sessão. `web/tests/dashboard-navigation.test.mjs` renderiza o painel com dependências simuladas e verifica seleção por URL, aba ativa, recarga, parâmetros inválidos/repetidos, lista vazia e mensagens de erro. O teste de backup de participantes aplica também a migração S4-03, comparando hashes dos dados e cálculo da referência privada.

Suíte de 28 testes, lint e build aprovados localmente em 26/09/2026. A renderização automatizada não verifica aparência no navegador nem sessão remota. Homologação pendente: alternância real entre abas, voltar/avançar, teclado/celular, isolamento entre contas, setembro e os três cenários restantes da S4-02, conforme [roteiro da sprint](sprints/sprint-4.md).

Revisão visual S4-03: teste adicional em `ranking.test.mjs` verifica ordem diária por pontuação aplicada decrescente, empate por nome, ausência antes das pendências e entrada não modificada. Aprovado após a suíte de 28 testes. Prévia revisada inspecionada com um dia expandido; aprovação do Dono do produto pendente.

## Aceite remoto S4-02/S4-03 — 27/09/2026

Dono do produto confirmou todos os cenários funcionais acordados: abas e persistência da seleção, ranking preservado visualmente, ordenação diária decrescente, persistência de elegibilidade, ciclo de inclusão/remoção com concessão/revogação de acesso, restrição de edição por conta não organizadora e conclusão histórica. Homologação funcional concluída por relato do Dono do produto. Não implica teste remoto direto de RPCs ou nova comparação numérica após o último ensaio; evidências e limites em [Sprint 4](sprints/sprint-4.md).

## Evolução S4-04/S4-05 — 27/09/2026

**Resultado final:** Dono do produto confirmou Vercel pronta e todos os testes de homologação aprovados. S4-01 a S4-05 aceitas; Sprint 4 encerrada em 27/09/2026. A confirmação funcional não equivale a ensaio remoto direto de RPCs ou concorrência PostgreSQL multiconexão; essas garantias têm a cobertura local descrita abaixo.

Carga complementar: sete testes do arquivo `public-profiles.test.mjs` aprovados na revisão final, incluindo importação de 12 nomes/11 URLs, Unicode, preservação integral de Martin, URL ausente de Luca, idempotência, auditoria e rollback para conflitos de identidade/nome/URL. Todas as demais tabelas públicas e os perfis fora da carga preservados no teste. Execução remota confirmada pelo retorno SQL de 12 linhas com `confirmado=true`, 11 URLs e Luca com URL nula. Não houve nova comparação remota de backup nem relato específico de inspeção visual após essa carga. Não houve novo lint/build ou suíte completa neste fechamento exclusivamente documental.

S4-04/S4-05: `public-profiles.test.mjs` cobre CT26–CT34 em banco local, incluindo cópia privada do backup, rollback de colisões, nomes/URLs inválidos, permissões e preservação de dados. `profile-actions.test.mjs` cobre sessão, validação, edição sem ID fornecido pelo cliente e feedback de nome ocupado no cadastro. Duas tentativas são enfileiradas pelo PGlite; ensaio PostgreSQL multiconexão e abertura de link real continuam remotos. Suíte completa: 36 aprovados, zero pulados, em 27/09/2026. Prévia local não substitui os passos de homologação da Sprint 4.

Complemento S4-04/S4-05: dois testes adicionais aprovados para renderização segura de links e comparação do backup excluindo apenas colunas novas; a comparação continua detectando alteração de nome sem modificar a referência. Total de 38 casos no conjunto, 36 na execução completa anterior e dois adicionais verificados na execução direcionada.


S5-04: lista vazia/curta/limite, expansão integral e redução com controle acessível, ordenação das datas, ranking de todos os resultados e chave por torneio cobertos em recent-results.test.mjs. Teste de visualização de regras ajustado para a fronteira de cliente. Validação final: 64 testes aprovados, sem falhas ou cenários ignorados; lint e build de produção aprovados em 03/10/2026. Homologação remota adicional pendente.
