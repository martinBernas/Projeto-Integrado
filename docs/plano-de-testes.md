# Plano de testes

24/10/2026 — Adaptação Gmail validada localmente: 134 testes completos aprovados, zero falhas/pulados, lint dos arquivos alterados e build/TypeScript aprovados. Inclui aceitação SMTP, sanitização de falhas, rejeição repetível, quarentena imediata de tentativa interrompida, proteção contra duplicidade e preservação integral da fila no incremento. Validador de backup sintético Gmail confirmou 24 seções e 82 definições; Nodemailer e fonte do PDF presentes no rastreamento de produção. Migração 002, captura/exportação/comparação novas, credenciais SMTP de relatórios, publicação/agendas e homologação ainda pendentes no ambiente remoto; nenhum envio real ou alteração na recuperação de senha. Migração 001 e comparação originais não devem ser repetidas.

24/10/2026 — Dono do produto confirmou para RF19 o critério de sucesso como aceitação de todos os envios pelo Gmail para encaminhamento, sem comprovar entrega/leitura. Implementada adaptação local para a conta Gmail existente via SMTP/TLS e Nodemailer, sem Resend/domínio pago; erros e resultados incertos mantêm bloqueio de retirada, sem reenvio automático de tentativas ambíguas. Migração inicial 001 e comparação já confirmadas permanecem válidas. Novo incremento 202610240002 exige captura/exportação/validação e comparação próprias de 24 seções antes de ativar. SMTP de recuperação de senha preservado, sem acesso a credenciais e sem envio real. [ADR-014](decisoes/adr-014-relatorios-gmail-sem-custo.md), [roteiro Gmail](sprints/sprint-8-gmail-operacao.md). Verificações finais locais em consolidação; nenhuma execução remota do incremento.

24/10/2026 — Verificação final local da Sprint 8: 129 testes completos aprovados, zero falhas/pulados, lint dos arquivos de aplicação alterados e build/TypeScript aprovados; build fora do sandbox após bloqueio de limpeza de .next no Windows. Backup/exportação/comparação testados com dados sintéticos e validador CLI confirmou 21 seções/68 definições. PDF sintético de três páginas revisado visualmente; início/login revisados em Claro/Escuro, incluindo largura móvel sem rolagem horizontal. Migração/ativação/publicação/homologação remotas continuam pendentes; nenhum envio ou retirada real. [Evidências e limites](sprints/sprint-8.md).

24/10/2026 — Sprint 8 implementada localmente após autorização do Dono do produto: RF19 com captura final atômica, PDF geral (classificação, evolução acumulada e duplas), fila privada, e-mails individuais via Resend e confirmação assinada de entrega; retirada lógica antecipada/automática após 168 horas, bloqueada por geração/envios pendentes, com limpeza do PDF/captura/endereços. Claro/Escuro/Sistema persistido no navegador, em telas e gráficos. RF25 continua futuro. Migração nova 202610240001, configuração de remetente/segredos/webhook/agendas, publicação e homologação ainda pendentes; nenhuma operação remota ou envio real realizado. [Entrega e limites](sprints/sprint-8.md), [arquitetura e decisão](decisoes/adr-013-relatorios-e-retirada-de-torneios.md), [operação](sprints/sprint-8-operacao.md). Esta situação substitui os registros históricos anteriores de implementação não iniciada.

24/10/2026 — Dono do produto confirmou RF19/Sprint 8: após a retirada do torneio, o relatório geral em PDF ficará disponível apenas nos e-mails enviados; sem consulta ou download pela aplicação. Esta decisão resolve a disponibilidade funcional do relatório após retirada, sem estabelecer retenção técnica indefinida ou afirmar remoção física implementada. Ver [regras do relatório](relatorios-de-torneio.md). Revisão documental, sem implementação ou operação remota.

24/10/2026 — Dono do produto confirmou FB01/Sprint 8: opções Claro, Escuro e Sistema, preferência salva no navegador e aplicação a todas as telas e gráficos. Este recorte não prevê sincronização por conta entre dispositivos. Selecionar Sistema deve acompanhar a preferência do sistema; verificar persistência, legibilidade e estados de interface na implementação. A confirmação substitui a condição anterior de proposta do tema. Ver [Sprint 8](sprints/sprint-8.md). Revisão documental, sem implementação ou teste funcional.

24/10/2026 — Dono do produto confirmou proteção de RF19/Sprint 8: permitir nova tentativa e bloquear retirada automática e antecipada pelo organizador enquanto o PDF não for gerado e todos os envios aos participantes não concluírem com sucesso, mesmo após uma semana. Essa regra substitui a proposta anterior ainda não confirmada. Critério técnico de sucesso do envio será definido na integração; não presumir leitura ou entrega em caixa. Ver [regras do relatório](relatorios-de-torneio.md). Revisão documental, sem implementação ou operação remota.

24/10/2026 — Dono do produto confirmou em RF19/Sprint 8 o tratamento de empates na contagem de trocas entre duplas: inversão direta ou A à frente → empate → B à frente conta uma troca; A à frente → empate → A à frente conta zero. Preservar a última ordem estrita nos empates. Esse ponto substitui sua condição anterior de proposta, sem implicar aceite dos demais aspectos ainda em refinamento. Ver [regras do relatório](relatorios-de-torneio.md). Revisão documental, sem implementação ou teste funcional.

18/10/2026 — Sprint 7 encerrada conforme encaminhamento solicitado pelo Dono do produto, após aceites de RF21, validação operacional inicial RF24, homologação do fluxo principal de retroativos e aceite da organização/filtro das telas. Evidências finais: 120 testes completos, lint e build/TypeScript aprovados; migrações/comparações e backups privados registrados. Sem defeito bloqueador relatado ou implementação restante identificada no recorte entregue. Continuam como acompanhamento: relatório RF24 após uma semana e homologação complementar em torneio isolado (auditorias/notificações, autoraprovação, encerramento com pendência, celular/teclado e concorrência PostgreSQL real); não declarar esses cenários homologados remotamente. Histórico avançado, restante de RF08 e RF19/RF22/RF23 ficam no backlog, sem sprint nova assumida. Uso/aceite da aplicação atual relatado, sem URL/versão formal do deployment. Esta consolidação substitui pendências históricas já resolvidas; ver seção Encerramento de docs/sprints/sprint-7.md. Atualização exclusivamente documental, git diff --check; nenhum novo teste da aplicação ou operação remota.

18/10/2026 — Dono do produto confirmou visualmente a distribuição das auditorias com seletor de torneio e pediu a mesma apresentação na aprovação de ajustes retroativos. Implementado localmente em Gerenciar notificações: seletor Torneio com contagem de ajustes pendentes, botão Consultar ajustes, nome do torneio e somente suas solicitações/decisões. Filtro de ajustes independente do filtro de auditorias; ambos preservados na paginação/URL, troca de ajustes reinicia página. Nova consulta get_tournament_score_changes na migração 202610180006 filtra antes de paginar e prioriza pendências do torneio escolhido; exige organizador desse torneio. Nenhuma mudança de pontos, pedidos, decisões ou tabelas. Validação final: 120 testes completos aprovados, zero falhas/pulados, lint dos dois arquivos de aplicação alterados e build com TypeScript aprovados (build final isolado e fora do sandbox pela resolução de caminhos Windows). Testes incluem mais de 50 pedidos em outro torneio, escopo de decisões do mesmo pedido, permissão, prioridade local, seleções independentes, paginação e preservação das 20 seções por backup/comparação. Migração 005 e sua comparação já confirmadas; incremento 006 ainda requer captura/exportação nova, migração, comparação, publicação e homologação. Nenhuma operação remota realizada pelo agente. Roteiro atual: docs/sprints/sprint-7-filtro-ajustes-operacao.md. Não repetir scripts 004/005.

18/10/2026 — Correção de organização de S7-01 e auditorias solicitada e autorizada pelo Dono do produto, implementada localmente: Meus pedidos (/dashboard/requests) reúne somente solicitações pessoais retroativas, suas decisões para consulta e abertura/acompanhamento de denúncias; sem aprovações, apuração ou voto. Gerenciar notificações dos torneios (/dashboard/notifications) é exclusiva de organizadores e concentra ajustes, denúncias e apuração apenas de seus torneios; quadro administrativo aparece somente a organizadores. Participantes recebem aviso enquanto houver votação aberta, inclusive depois de votar; auditado/ingressante sem eleitorado acompanha sem voto; prazo vencido vira apuração pendente para o organizador. URL antiga de retroativos redireciona a Meus pedidos; rota de auditoria fica para votação/histórico. Escopos filtrados no banco antes da paginação, pendências administrativas primeiro, indicador requested_by_me sem expor solicitantes/votos alheios. Novas consultas na migração 202610180005_notification_workspaces.sql, sem mutação de dados ou regras; antiga consulta mista mantida para compatibilidade. Verificação final local: 119 testes completos aprovados, zero falhas/pulados, lint dos arquivos de aplicação afetados e build com TypeScript aprovados (build fora do sandbox pela restrição de realpath Next/pnpm no Windows). Testes de isolamento, interfaces separadas, persistência do aviso após voto, prazo/eleitorado/revogação, erros e backup/exportação/comparação das 20 seções com dados de retroativos existentes. Migração 005, backup/exportação novos, comparação, publicação e homologação desta correção ainda não executados remotamente. A migração 004 e o fluxo principal de retroativos já foram validados remotamente; não repetir seus scripts de tabelas vazias. Conforme orientação do Dono do produto, testar auditorias somente em torneios isolados com contas de teste, sem expor auditorias artificiais aos participantes dos torneios ativos. Referências: docs/decisoes/adr-012-pedidos-e-notificacoes.md e docs/sprints/sprint-7-notificacoes-operacao.md. A apresentação conjunta anterior fica substituída por esta separação; evidências funcionais anteriores de retroativos continuam históricas e válidas para os cenários relatados.

18/10/2026 — S7-01/FB02 implementada localmente após autorização do Dono do produto: inclusão/correção retroativa com justificativa, pessoal imediato, entrada aceita independente por torneio, notificação no painel e decisões com histórico em /dashboard/score-changes. Pedidos pendentes bloqueiam nova alteração do dia, encerramento e revisão de configuração/eligibilidade pertinente. Autoraprovação permitida; auditoria pendente bloqueia aprovação, sanções e encerrados preservados. Sem limite retroativo; pedidos somente para torneios abertos e datas elegíveis no momento do envio. Validação final: 112 testes completos aprovados, zero falhas/pulados, lint dos arquivos de aplicação alterados e build com TypeScript aprovados; build precisou executar fora do sandbox por restrição de realpath do Next/pnpm no Windows. Testes incluem comparação integral de 17 seções antes/depois da migração, exportação de backup, isolamento, ausência explícita, decisão independente, repetição/decisão oposta, rollback atômico de falha do recálculo, proteção de auditoria do dia atual e retroativa, paginação e formulários/erros. PGlite enfileira chamadas: concorrência real entre sessões PostgreSQL e revisão visual em celular/teclado dependem de homologação. Migração nova 202610180004_retroactive_scores.sql ainda não executada remotamente; backup novo/exportação, comparação, publicação e aceite desta funcionalidade pendentes. RF24 já tem ativação inicial remota confirmada; não repetir seus scripts. Detalhamento em docs/lancamentos-retroativos.md, ADR-011 e docs/sprints/sprint-7-retroativos-operacao.md. Este registro substitui as referências anteriores à implementação de S7-01 não iniciada; não declara entrega integral de RF08 nem do histórico avançado.

18/10/2026 — RF24/S7-05: suíte completa com 102 testes, zero falhas/pulados; lint e build com TypeScript aprovados. Novos testes validam bloqueio anon/authenticated e leitura direta service_role, payload estrito sem dados pessoais, rejeição atômica, quota/descarte, retenção por ocorrência/recebimento, taxa amostral e percentis, batching pós-resposta, timeout e isolamento de falhas. Smoke em Next produção local com fetch interceptado confirma gravação após redirecionamento das etapas session_claims/authentication sem segredo no evento. Pg_cron indisponível no PGlite: teste comprova recusa de agendamento sem extensão; execução real e concorrência de conexões dependem de homologação. Fixture de RLS pessoal atualizada com papel service_role existente no Supabase real. [Roteiro RF24](sprints/sprint-7-metricas-operacao.md).

18/10/2026 — Sprint 7 / RF21: 98 testes completos aprovados, zero falhas/pulados; lint dos arquivos alterados, TypeScript e build aprovados. Cobertura nova: médias ponderadas 4.750/4.167, ausências/sanções, zero relativo, empates, dias sem válidos/único válido, elegibilidade/período/exclusões/hoje, vazios e organizador sem participação. PGlite comprova RPC com mais de mil dias, negação anônimo/revogado e congelamento após bruto alterado; renderização comprova identidade da sessão, ausência de nomes/ids de terceiros e gráfico/tabela. Prévia fictícia revisada no navegador com tabela expandida e largura móvel sem transbordamento. Diagnóstico TypeScript isolado à restrição de realpath pnpm do sandbox; não reduzir checagens. Homologação remota e publicação pendentes conforme [roteiro S7](sprints/sprint-7-operacao.md).

18/10/2026 — Manutenção após Sprint 6: suíte completa local com 92 testes aprovados, zero falhas/pulados; lint dos oito arquivos alterados aprovado. Cobertura nova: fim da preparação sem mutação de dados na migração, ausências/zero automáticos, hoje provisório, elegibilidade/calendário, modo absoluto configurado, encerrados preservados e auditorias; limpeza do teste com backup de votos/eventos, original/brutos preservados, nomes duplicados, backup desatualizado e repetição recusados. Testes antigos de preparação continuam verificando migrações históricas. TypeScript não aprovado pelos erros anteriores do cliente Supabase; build não executado. Nenhuma migração/exclusão/publicação remota confirmada; [roteiro da manutenção](sprints/manutencao-pos-sprint-6.md).

11/10/2026 — Confirmações remotas adicionais do Dono do produto: ranking e pontuações preservados durante avaliação; alteração das regras bloqueada com auditoria aberta; pedido sem justificativa recusado. Esses cenários deixam de ser pendências de homologação. Remoção do auditado e cenários de apuração/punições após prazo ainda sem confirmação específica.

Homologação parcial S6 relatada pelo Dono do produto em 11/10/2026: troca de voto, novo pedido após rejeição bloqueado, aviso clicável funcionando, verificação em celular/teclado e auditado impedido de votar. Somam-se a pedido/rejeição/aprovação, voto do organizador, sigilo e participante incluído após abertura sem voto já relatados. Apuração/punições/aviso de punição e demais cenários remotos continuam pendentes. Correção de pontuação de dia passado recusada pelo contrato de dia atual não basta para homologar bloqueio específico de auditoria.

Complemento S6 de avisos diários em 11/10/2026: suíte completa com 83 testes aprovados para aviso de auditoria aberta; após acréscimo do aviso de punição, os 7 testes afetados de renderização/navegação passaram. Cobertura: pontuação exata, link com âncora existente, ambas as punições, remoção do aviso aberto após invalidação, ausência de votos no painel, ranking preservado e falha isolada da consulta com recuperação. Lint/build finais aprovados. Erro EPERM no cache gerado resolvido com preservação do cache anterior e nova saída; não houve alteração de esquema ou configuração. Homologação remota dos avisos ainda pendente; voto secreto confirmado pelo Dono do produto.

## Sprint 6 — evidências locais de 11/10/2026

`pnpm test`: 82 aprovados, zero falhas/pulados. `pnpm lint` e `pnpm build` aprovados. `git diff --check` sem erros de whitespace. Cobertura nova: pedido justificado e aprovação exclusiva do organizador, sigilo no banco/resposta inclusive ao organizador, voto próprio alterável, prazo de 48 horas, auditado excluído, eleitorado fixo e revogação de acesso, pedidos duplicados enfileirados, empate/nenhum voto/maioria pela manutenção, duas punições, referência relativa recalculada, bruto e outro torneio preservados, penalidade estável após revisão para absoluto, apuração idempotente e rollback integral após falha forçada no recálculo. Captura e comparação S6 exercitadas com dados fictícios; migração preserva dados/histórico/cálculo antes do uso. Ações validam sessão e campos; renderização estática confere pedidos, voto, apuração, histórico e consulta sem formulários em encerrados.

Testes PGlite não equivalem a concorrência real entre conexões Supabase. Sem homologação visual em navegador/mobile, publicação ou execução remota nesta entrega. Roteiro de testes remotos e evidências requeridas em [operação S6](sprints/sprint-6-operacao.md). Contagens das sprints anteriores abaixo são históricas.

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


S5-04: lista vazia/curta/limite, expansão integral e redução com controle acessível, ordenação das datas, ranking de todos os resultados e chave por torneio cobertos em recent-results.test.mjs. Teste de visualização de regras ajustado para a fronteira de cliente. Validação final: 65 testes aprovados, sem falhas ou cenários ignorados; lint e build de produção aprovados em 03/10/2026. Homologação remota adicional pendente.

S5-04 — histórico pessoal incluído: teste de lista vazia/até cinco, contagem de lançamentos, expansão/redução e informação do limite existente de 100 registros. Teste de navegação do painel carrega também o componente real de expansão. Homologação remota deste alcance ainda pendente.

## S5-05 — Carregamento e diagnóstico

Testes novos em dashboard-loading.test.mjs: transições simuladas com status da seleção solicitada, ocultação do ranking anterior, trocas rápidas e URLs; nova tentativa explícita, status acessível e retry() da fronteira Next; medição simulada, códigos/outcomes e exclusão de conteúdo privado; sessão do proxy, preservação dos cookies e instrumentação restrita ao painel. dashboard-navigation.test.mjs cobre RPC nula, falta de acesso e erro temporário, mantendo seleção/listas/encerrados.

Validação: 69 testes aprovados, sem falhas ou cenários ignorados; lint sem avisos e build de produção aprovados em 03/10/2026. Simulação de hooks/roteador não comprova comportamento end-to-end do Next, corrida de respostas, rede lenta ou voltar/avançar real. Esses cenários e a linha de base da primeira abertura/troca estão no procedimento da Sprint 5. Sem migração ou operação remota.

Aceite Sprint 5 em 03/10/2026: Dono do produto aceitou explicitamente o incremento; 69 testes locais, lint e build aprovados. Carregamento confirmado na aplicação utilizada; recuperação por Tentar novamente testada localmente e não observada em falha remota. Sprint encerrada com esse limite documentado e acompanhamento posterior pelos logs.

## RF20–RF21 — estatísticas (planejamento em 11/10/2026)

Cenários futuros, não executados nesta revisão: médias pessoais de 20.000 e 15.000 devem resultar em 17.500/dia e 3.500/jogo; conferir limites de 25.000/dia e 5.000/jogo, período vazio e zero/ausências conforme refinamento. Validar gráfico cronológico e alternativa textual, histórico acima de 100 registros, isolamento de contas/torneios e revogação de acesso. Validar o gráfico de evolução da média do torneio, com datas em ordem cronológica, valores conciliados com a métrica exibida e alternativa textual acessível. Conciliar média do torneio e contagens por participante com empates, um único participante, dias sem resultados, calendário excluído, elegibilidade, penalidades, auditorias e encerramento após aprovação das fórmulas. Validar telas separadas, navegação, celular/teclado, carregamento e falhas. Critérios e definições pendentes em [Estatísticas](estatisticas.md). Verificação desta entrega apenas documental: revisão de referências e `git diff --check`.

11/10/2026 — Refinamento de RF20–RF21 confirmado pelo Dono do produto: dropdown pessoal com “últimos 5 dias”, “último mês” e “desde o início”; zero/ausências excluídos das médias pessoais; média do torneio sempre sobre pontos aplicados, incluindo ausências no denominador; médias sem casas decimais, com arredondamento aritmético padrão no resultado final. Substitui as pendências anteriores desses pontos. Seleção inicial/limites temporais, agregação do torneio, empates e efeitos de auditoria ainda exigem refinamento; ver [Estatísticas](estatisticas.md). Entrega exclusivamente documental, sem implementação ou execução remota; revisão e git diff --check.

11/10/2026 — Decisões adicionais confirmadas pelo Dono do produto para RF20–RF21: opção inicial “últimos 5 dias”; média pessoal somente dos dias jogados (bruto positivo); contagens de colocação pela pontuação aplicada, com todos os empatados na primeira/última recebendo a contagem e participante único contando nas duas; denominador zero não exibe dados da métrica. Estatísticas individuais restritas ao próprio perfil, inclusive próprias contagens na tela de torneio; média agregada permanece disponível conforme acesso ao torneio. Visualização de estatísticas de outros jogadores é requisito futuro, sem sprint definida. Substitui pendências anteriores correspondentes; limites temporais do filtro e classificação de ausentes/auditorias ainda exigem refinamento. Ver [Estatísticas](estatisticas.md). Entrega documental, sem implementação ou operação remota; revisão e git diff --check.

11/10/2026 — Dono do produto definiu “últimos 5 dias” de RF20 como os cinco dias mais recentes com valor, isto é, bruto positivo conforme a regra confirmada de zero como ausência. Não são cinco dias corridos: ignorar zero e dias sem lançamento, buscando os cinco dias jogados mais recentes; se houver menos de cinco, usar todos os disponíveis. Seleção aplicada às médias e ao gráfico pessoal. Substitui a pendência anterior sobre esse período; definição de “último mês” permanece em refinamento. Critério futuro: validar intervalos sem jogo, zeros e menos de cinco registros positivos. Entrega documental, sem implementação ou execução remota; revisão e git diff --check. Ver [Estatísticas](estatisticas.md).

11/10/2026 — Dono do produto definiu o período antes chamado “último mês” como “últimos 30 dias”, substituindo o rótulo e encerrando essa pendência. Janela de 30 dias corridos (hoje e os 29 dias anteriores, em America/Sao_Paulo), aplicada às médias e ao gráfico pessoal; apenas dias jogados entram nas médias. Opções vigentes: “últimos 5 dias”, “últimos 30 dias” e “desde o início”. Registros anteriores com “último mês” são históricos e substituídos por esta definição. Critérios futuros incluem limites de inclusão/exclusão, viradas de mês/ano e zero/ausências. Ver [Estatísticas](estatisticas.md). Revisão documental local; git diff --check, sem implementação, teste funcional ou operação remota.

## RF20 — incluído e implementado na Sprint 6 em 11/10/2026

O Dono do produto autorizou incluir RF20 na Sprint 6 (S6-04). Implementação local concluída: acesso “Minhas estatísticas” no painel, tela própria `/dashboard/statistics`, médias bruta diária e por jogo, gráfico cronológico e tabela acessível. RF21 permanece futuro, em refinamento. Este registro substitui as referências anteriores a RF20 sem sprint/entrega apenas documental, que passam a ser históricas. Publicação, homologação e aceite de RF20 ainda não confirmados; não há migração adicional.

Períodos aprovados: cinco dias positivos mais recentes (padrão), últimos 30 dias corridos (hoje e 29 anteriores em São Paulo) e histórico até hoje. Médias e gráfico usam somente bruto positivo; zero e ausência não contam como jogos. Cada dia equivale a cinco jogos; cada média é arredondada apenas após sua própria divisão. Auditorias de torneio não alteram a fonte pessoal. Sem positivos: mensagem, sem indicadores ou gráfico fictício. Erro de qualquer página: tentar novamente, sem médias parciais.

Consulta no servidor restrita à identidade autenticada e às políticas RLS existentes; nenhum parâmetro permite escolher outro perfil. Paginação por cursor na data única por jogador até página vazia, sem limite total de 100 registros; últimos cinco para ao completar cinco positivos. Tamanho solicitado de até 200 registros, tolerando teto remoto inferior. Sem novas tabelas, RPCs, permissões, dependências ou mutações. Gráfico SVG com escala diária 0–25.000 e distâncias proporcionais às datas; tabela completa expansível e rolagem horizontal acessível. Estratégia de consulta e apresentação são escolhas técnicas; fórmulas e períodos foram confirmados pelo Dono do produto.

Validação local: suíte de 86 testes aprovada; RLS real em PGlite, 257 positivos sob teto remoto de 37 por página, últimos cinco sob teto de dois, médias/arredondamento, fronteiras de 30 dias/ano bissexto, isolamento entre contas/anônimo, erro intermediário e renderização. Lint e build aprovados; apresentação revalidada após corrigir títulos dos pontos SVG. Homologação visual de RF20 no computador/celular/teclado ainda pendente. Não houve operação remota de RF20.

Limitações: custo de consultas, memória e renderização proporcional ao histórico; leitura paginada não é snapshot transacional e correções concorrentes podem exigir recarga. Sem atualização em tempo real. A apuração das auditorias mantém seu prazo e roteiro; não há aceite global da Sprint 6.

## RF22–RF23 — cenários futuros (11/10/2026)

Validar importação dos cinco jogos e Total do [exemplo](estatisticas.md): 13.953 pontos, 812 segundos e 143 passos; soma de distância de 6.165 km diverge dos 6.164 km informados. Validar tratamento conforme regra a aprovar, separadores de milhar, acentos, segundos omitidos, limites, linhas inválidas/duplicadas/incompletas e gravação sem resultados parciais. Conferir lançamento simples, correções consistentes, prazos, isolamento, rankings pelo bruto, histórico misto, filtros, denominadores sem dados e jogo individual com zero. Testar países repetidos, amostras desiguais, empates e médias de tempo após aprovação das fórmulas; celular e teclado. Cenários não executados: entrega atual documental, verificada por revisão e `git diff --check`.

## RF24 — validação futura de métricas operacionais

Casos propostos para a sprint que selecionar RF24: cobertura semanal dentro da retenção; agregações com denominador e amostragem definidos; exclusão de dados pessoais e rejeição de campos inválidos; acesso autorizado e negação a contas comuns/anônimas; expurgo e limites de volume; indisponibilidade da coleta sem falha nas funções da aplicação; impacto de desempenho dentro do orçamento aprovado. [Critérios e decisões pendentes](metricas-operacionais.md). Testes de implementação ainda não executados: requisito somente documentado.

## Sprint 8 — relatório geral (cenários planejados, não executados)

Validar gráfico de posições acumuladas até a classificação final, pontos aceitos por torneio e sanções; inversões entre pares diretas e através de empates, empate sem inversão, duplas líderes empatadas e nenhuma troca; zero/um participante, ingresso posterior, datas excluídas e participantes removidos conforme regra a definir. Conferir legibilidade, tabela equivalente e sigilo de dados. Fórmulas ainda propostas; [exemplos e refinamento](relatorios-de-torneio.md). RF25 individual é futuro e não integra o aceite da Sprint 8. Nenhum teste funcional executado nesta revisão documental.
