# Histórico da documentação

O Git é a fonte do histórico completo. Este registro resume marcos documentais; a versão do documento não representa versão publicada do software.

| Data | Marco | Referência |
| --- | --- | --- |
| 06/09/2026 | Documentação funcional e descoberta do MVP | Commits `4a8a0f5`, `d5a1437`, `3025267`, `df85f41` |
| 12/09/2026 | Arquitetura Vercel e Supabase | Commit `57e4600` |
| 20/09/2026 | Revisão documental 1.1: Sprint 3 passa a entregar torneio único, lançamento, cálculo e ranking; administração configurável adiada; regras de setembro confirmadas e histórico com carga manual após cadastro | Alterações locais; commit e revisão ainda pendentes |

## Registro de encerramento de sprint

Avanço da Sprint 3: Dono do produto executou as duas migrações e o seed no Supabase, todos com sucesso. Consulta confirmou o torneio de setembro, regra relativa, penalidade −2.500, segunda a sexta, exclusão de 07/09 e preparação histórica aberta. Publicação da aplicação, vínculos de participantes, carga do Excel e homologação ponta a ponta permanecem pendentes.

Execução da Sprint 3 — 20/09/2026: implementação local de migrações/RLS, provisionamento, carga administrativa, lançamento pessoal, cálculo relativo e painel. Sete testes locais aprovados, lint/build aprovados e inspeção visual de componentes em celular/desktop. Dono do produto esclareceu que fornecerá Excel após cadastro das contas; preparação histórica agora fica provisória e sem penalidades até conclusão da carga. Procedimento em `sprints/sprint-3-operacao.md`. Banco remoto, conta organizadora, Excel real e publicação pendentes; sprint não encerrada.

Revisão documental 1.3 — 20/09/2026: por decisão do Dono do produto, planejamento ampliado de cinco para sete sprints para distribuir o esforço futuro. Sprint 4: torneios/participantes; Sprint 5: regras/calendário; Sprint 6: auditoria por votação (realocada da antiga Sprint 5); Sprint 7: moderação/evolução. Sprint 3 preservada. Backlog, dependências e aceite registrados no plano de ação; equilíbrio sujeito a estimativas e capacidade. Referências atuais alinhadas à Sprint 6; o registro 1.2 abaixo preserva a alocação histórica anterior. Alterações locais, ainda sem commit.

Revisão documental 1.2 — 20/09/2026: Dono do produto solicitou auditoria de pontuações por votação para entrega futura, alocada à Sprint 5. Registrados RF13–RF16, RN10–RN13, fluxo de avaliação, apuração pelo organizador e escolha entre desconsideração e penalidade diária. Efeito limitado ao torneio denunciante, preservando pontuação pessoal e demais torneios. Critérios futuros e pontos de refinamento documentados; Sprint 3 sem ampliação de escopo. Alterações locais, sem commit nesta revisão.

Correção do planejamento em 20/09/2026: cadastro e login reconhecidos explicitamente como concluídos e validados na Sprint 2, com referência ao commit `3f8c614` e confirmação do Dono do produto. A Sprint 3 apenas reutiliza essas funções e verifica regressão e integração com o torneio. Plano de ação, plano da sprint, requisitos e testes alinhados; não há nova implementação de autenticação prevista.

Complemento da revisão de 20/09/2026: período do torneio confirmado pelo Dono do produto como setembro, registrado de 01/09/2026 a 30/09/2026, inclusive; critérios de teste ajustados aos limites do mês.

Calendário confirmado na mesma revisão: segunda a sexta, com 07/09/2026 excluído por feriado. A exclusão prevalece sobre a presença da data no Excel e impede pontos e penalidades também no histórico manual. Planejamento, regras e testes atualizados; implementação ainda pendente.

Ao concluir uma entrega, adicionar data, escopo realmente entregue, hash do commit, evidências de testes e URL do ambiente quando aplicável. Usar branch e revisão por pull request conforme a política do projeto. Uma tag pode identificar o marco após integração; não há tag criada por este replanejamento.
