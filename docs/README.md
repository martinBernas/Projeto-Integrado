# GeoGuaras — Wiki do Projeto

Situação atual em 03/10/2026: migração complementar de regra única executada pelo Dono do produto e comparação remota pós-migração aprovada por `16-verify-after-full-period.sql`: `different_sections = 0`, `sections = []`, `checksum_backup = checksum_current = f6c6d78a67309d858fae0e70c4080477`. Dados de negócio, versões/auditorias e cálculo na data de referência preservados. Verificação remota da migração complementar concluída. Publicação da interface correspondente, homologação de período/regra únicos, retirada delimitada de torneios de teste e aceite ainda não confirmados. Não reaplicar migrações. Retomar criação/revisão somente na interface correspondente ao contrato `scope: tournament`.

Registros abaixo preservam a situação de cada etapa; pendências anteriores de aplicação/comparação da migração foram resolvidas pela evidência acima.

Aplicação web para registrar pontuações pessoais de GeoGuessr, administrar torneios e gerar rankings com regras de pontuação auditáveis.

Sprint 3 concluída em 21/09/2026. [Encerramento e evidências](sprints/sprint-3-encerramento.md). Em 22/09, carga real confirmada de 11 participantes e 148 pontuações. Complementos, elegibilidade, penalidades e correção local do painel estão no [registro operacional de 22/09](sprints/operacao-2026-09-22.md).

## Documentação

- [Plano de ação](plano-de-acao.md)
- [Sprint 5 — implementação local e planejamento](sprints/sprint-5.md)
- [Sprint 5 — migração, backup, recuperação e homologação](sprints/sprint-5-operacao.md)
- [Decisão e modelo de regras versionadas](decisoes/adr-003-regras-versionadas.md)
- [Sprint 7 — pré-planejamento de usabilidade e carregamento](sprints/sprint-7.md)
- [Avaliação do escopo pendente e feedback — 27/09/2026](avaliacao-backlog-2026-09-27.md)
- [Sprint 1 — descoberta e documentação](sprints/sprint-1.md)
- [Sprint 2 — fundação, autenticação e publicação](sprints/sprint-2.md)
- [Sprint 3 — MVP utilizável](sprints/sprint-3.md)
- [Sprint 3 — implantação e carga histórica](sprints/sprint-3-operacao.md)
- [Operação de 22/09 — carga real e correção de elegibilidade](sprints/operacao-2026-09-22.md)
- [Sprint 3 — ensaio com duas contas e rollback](sprints/sprint-3-ensaio.md)
- [Histórico da documentação](historico.md)
- [Auditoria de pontuações — Sprint 6](auditoria-de-pontuacoes.md)
- [Documentação funcional](documentacao-funcional.md)
- [Arquitetura e implantação](arquitetura.md)
- [Decisão técnica: Vercel e Supabase](decisoes/adr-001-vercel-e-supabase.md)
- [Requisitos](requisitos.md)
- [Perfil público — Sprint 4](perfil-publico.md)
- [Regras de pontuação](regras-de-pontuacao.md)
- [Plano de testes](plano-de-testes.md)
- [Diagrama de classes](diagramas/classes.md)

## Fonte do MVP

A entrega original da Sprint 3 foi um único torneio pré-instanciado, com lançamento, cálculo e ranking. A Sprint 4 acrescentou administração, participantes, múltiplos torneios e perfis. Configuração de regras pela interface permanece prevista para a Sprint 5. Consulte a avaliação do backlog para as lacunas atuais.

O arquivo `GeoGuaras.xlsx` é a referência inicial do domínio. Ele contém a aba `Diario`, com as pontuações brutas, e a aba `geral`, com os pontos aplicados, resultados mensais e acumulado.

## Stack definida

TypeScript, Next.js, Tailwind CSS e Vercel para a aplicação web. Supabase fornece PostgreSQL, autenticação e autorização via RLS.

## Situação atual

Simplificação S5: regra única e período editável implementados localmente; migração complementar/publicação/homologação pendentes. [ADR-004](decisoes/adr-004-regra-unica-por-torneio.md). Migrações iniciais já executadas/verificadas, edição do Aztecas Outubro confirmada pelo Dono do produto. A descrição seguinte preserva o início da sprint.

Sprint 5 iniciada em 03/10/2026 por autorização do Dono do produto. S5-01–S5-03 implementadas localmente; migração, publicação e homologação pendentes. Fuso fixo São Paulo, zero bruto como ausência, calendário configurável e revisão retroativa explícita com prévia/confirmação. Ver [entrega e evidências](sprints/sprint-5.md).

Sprint 4 encerrada em 27/09/2026, com S4-01 a S4-05 homologadas e carga complementar dos perfis confirmada. Consulte o [registro consolidado de encerramento](sprints/sprint-4.md) para evidências, limites e escopo futuro.


Acréscimo S5-04 aprovado após homologação do núcleo: resultados diários e histórico pessoal exibem cinco itens recentes com expansão/redução independente, mantendo ranking completo e limite atual de 100 lançamentos pessoais consultados. Implementação local, publicação/homologação adicionais pendentes; ver seção 10 da Sprint 5.

03/10/2026 — S5-05 autorizada: investigar primeira abertura/troca lenta e aviso intermitente. Carregamento, nova tentativa explícita e métricas sem dados pessoais implementados localmente; causa remota não confirmada. Sem migração. Publicação, linha de base e homologação pendentes. Ver seção 11 da Sprint 5 e ADR-005.
