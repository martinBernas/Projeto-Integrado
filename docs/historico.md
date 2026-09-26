# Histórico da documentação

O Git é a fonte do histórico completo. Este registro resume marcos documentais; a versão do documento não representa versão publicada do software.

| Data | Marco | Referência |
| --- | --- | --- |
| 06/09/2026 | Documentação funcional e descoberta do MVP | Commits `4a8a0f5`, `d5a1437`, `3025267`, `df85f41` |
| 12/09/2026 | Arquitetura Vercel e Supabase | Commit `57e4600` |
| 20/09/2026 | Revisão documental 1.1: Sprint 3 passa a entregar torneio único, lançamento, cálculo e ranking; administração configurável adiada; regras de setembro confirmadas e histórico com carga manual após cadastro | Alterações locais; commit e revisão ainda pendentes |

## Prioridades da Sprint 4 — 26/09/2026

Revisão visual da S4-02 solicitada pelo Dono do produto: cartões substituídos por grids compactos de participantes e candidatos, datas e ações alinhadas por linha, confirmação no momento da ação. Mesmas operações de servidor e banco, sem migração adicional. Lint/build aprovados e prévia estática com dados fictícios inspecionada no navegador; validação da interação autenticada após publicação pendente.

Validação posterior da S4-02: Dono do produto confirmou inclusão do perfil de testes, conferência da data de ingresso e remoção. Comparação após o ciclo retornou zero diferenças e checksum `3d847140e955fd6feaaffab3b252dbe8`, igual ao backup. Migração remota já confirmada; escopo validado e cenários restantes registrados na [Sprint 4](sprints/sprint-4.md). Os registros abaixo preservam os estados anteriores da entrega.

S4-02 implementada localmente após captura e conferência do backup real. A pedido do Dono do produto, organizador seleciona contas em lista com nome/e-mail, busca e paginação. Incluídos vínculo retroativo, alteração de elegibilidade, remoção, conclusão da preparação histórica e auditoria. Testes sobre cópia local de setembro confirmam que a migração não muda dados nem cálculo de referência; suíte completa com 26 testes aprovada. Aplicação remota e aceite pendentes. [Roteiro](sprints/sprint-4.md).

Aceite funcional da S4-01: Dono do produto demonstrou criação, alteração de nome/período e encerramento, confirmou bloqueio antecipado, persistência após recarregar e ausência de mudanças percebidas no ranking de setembro. Segunda conta exibe lista administrativa vazia e opção de criar torneio próprio. Evidências e limites registrados em [Sprint 4](sprints/sprint-4.md). S4-02 é a próxima atividade; Sprint 4 permanece aberta.

S4-01 iniciada: implementação local de criação, edição e encerramento de torneios, com operações restritas ao organizador, trilha de alterações e congelamento de resultados. Dono do produto definiu encerramento após o último dia e disponibilidade dos dados por uma semana; relatório, envio por e-mail e exclusão registrados como requisito futuro RF19. Migração e publicação remotas pendentes. Ver [Sprint 4](sprints/sprint-4.md).

Por decisão do Dono do produto, S4-01 (torneios), S4-02 (participantes e ingresso retroativo) e S4-03 (lista e detalhes de múltiplos torneios) passam a constituir o escopo principal da Sprint 4. S4-04 (nome público único) e S4-05 (perfil GeoGuessr) ficam como entregas adicionais, remanejáveis para uma sprint posterior ainda não definida se não forem concluídas. Plano de ação e documento de perfil público alinhados; esta decisão substitui a prioridade registrada em 21/09. Datas e estimativas permanecem pendentes.

## Registro operacional — 22/09/2026

Carga real de 11 participantes e 148 pontuações confirmada pelo retorno do SQL enviado pelo Dono do produto. Coluna C do Excel validada como identificação das contas. Luca e Zade aguardam cadastro; Ramiro e Marcelo não participam. Registradas a pontuação complementar de Tales (17.469 em 22/09), a entrada de Bastian em 16/09 e a solicitação de ativação de penalidades, com confirmação remota dos comandos complementares ainda pendente. Correção local do painel exibe “Não inscrito” antes da elegibilidade e desconsidera resultados antigos desse período no ranking e no status diário. Testes direcionados, lint e build aprovados; publicação ainda não confirmada. [Evidências e pendências](sprints/operacao-2026-09-22.md).

## Revisão 1.4 — 21/09/2026

Dono do produto solicitou nome público independente do e-mail e URL do perfil no GeoGuessr. Registrados RF17–RF18, S4-04/S4-05 e CT26–CT31; Dono do produto confirmou nome público único em toda a plataforma; esforço será refinado. Sprint 3 permanece encerrada. Alterações documentais locais, sem commit e sem implementação nesta revisão.

Complemento de 21/09/2026: unicidade global do nome público confirmada pelo Dono do produto. Planejamento inclui garantia no banco, tratamento de colisões existentes e testes CT32–CT34. Comparação sem distinção de caixa e sem espaços nas extremidades registrada como proposta técnica.

## Registro de encerramento de sprint

21/09/2026 — Sprint 3 concluída, aplicação no commit `8671149`. Dono do produto confirmou os testes remotos e restauração final às `04:34:11.882419+00`, com `history_ready = false`. Onze testes locais aprovados. [Registro completo](sprints/sprint-3-encerramento.md). Cadastros, vínculos e Excel reais seguem como operação. Documentação e scripts adicionais aguardam commit.

Os registros seguintes preservam os estados anteriores e suas pendências à época.


21/09/2026 — Ensaio remoto de duas contas concluído pelo Dono do produto: totais de 79.534 e 2.365 conciliados integralmente e confirmados no painel, incluindo empate, ausências e exclusão de feriado/fim de semana. Rollback confirmado às 04:12:40 UTC, com `history_ready = false`. Aplicação publicada no commit `8671149`. Evidências em `plano-de-testes.md` e `sprints/sprint-3-ensaio.md`; carga real e demais verificações de aceite permanecem pendentes.

Avanço da Sprint 3: Dono do produto executou as duas migrações e o seed no Supabase, todos com sucesso. Consulta confirmou o torneio de setembro, regra relativa, penalidade −2.500, segunda a sexta, exclusão de 07/09 e preparação histórica aberta. Publicação da aplicação, vínculos de participantes, carga do Excel e homologação ponta a ponta permanecem pendentes.

Execução da Sprint 3 — 20/09/2026: implementação local de migrações/RLS, provisionamento, carga administrativa, lançamento pessoal, cálculo relativo e painel. Sete testes locais aprovados, lint/build aprovados e inspeção visual de componentes em celular/desktop. Dono do produto esclareceu que fornecerá Excel após cadastro das contas; preparação histórica agora fica provisória e sem penalidades até conclusão da carga. Procedimento em `sprints/sprint-3-operacao.md`. Banco remoto, conta organizadora, Excel real e publicação pendentes; sprint não encerrada.

Revisão documental 1.3 — 20/09/2026: por decisão do Dono do produto, planejamento ampliado de cinco para sete sprints para distribuir o esforço futuro. Sprint 4: torneios/participantes; Sprint 5: regras/calendário; Sprint 6: auditoria por votação (realocada da antiga Sprint 5); Sprint 7: moderação/evolução. Sprint 3 preservada. Backlog, dependências e aceite registrados no plano de ação; equilíbrio sujeito a estimativas e capacidade. Referências atuais alinhadas à Sprint 6; o registro 1.2 abaixo preserva a alocação histórica anterior. Alterações locais, ainda sem commit.

Revisão documental 1.2 — 20/09/2026: Dono do produto solicitou auditoria de pontuações por votação para entrega futura, alocada à Sprint 5. Registrados RF13–RF16, RN10–RN13, fluxo de avaliação, apuração pelo organizador e escolha entre desconsideração e penalidade diária. Efeito limitado ao torneio denunciante, preservando pontuação pessoal e demais torneios. Critérios futuros e pontos de refinamento documentados; Sprint 3 sem ampliação de escopo. Alterações locais, sem commit nesta revisão.

Correção do planejamento em 20/09/2026: cadastro e login reconhecidos explicitamente como concluídos e validados na Sprint 2, com referência ao commit `3f8c614` e confirmação do Dono do produto. A Sprint 3 apenas reutiliza essas funções e verifica regressão e integração com o torneio. Plano de ação, plano da sprint, requisitos e testes alinhados; não há nova implementação de autenticação prevista.

Complemento da revisão de 20/09/2026: período do torneio confirmado pelo Dono do produto como setembro, registrado de 01/09/2026 a 30/09/2026, inclusive; critérios de teste ajustados aos limites do mês.

Calendário confirmado na mesma revisão: segunda a sexta, com 07/09/2026 excluído por feriado. A exclusão prevalece sobre a presença da data no Excel e impede pontos e penalidades também no histórico manual. Planejamento, regras e testes atualizados; implementação ainda pendente.

Ao concluir uma entrega, adicionar data, escopo realmente entregue, hash do commit, evidências de testes e URL do ambiente quando aplicável. Usar branch e revisão por pull request conforme a política do projeto. Uma tag pode identificar o marco após integração; não há tag criada por este replanejamento.
