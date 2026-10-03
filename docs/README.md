# GeoGuaras — Wiki do Projeto

Aceite e encerramento em 03/10/2026: Dono do produto declarou explicitamente “está aceita a sprint”. Sprint 5 concluída, incluindo S5-01–S5-05. Aceite considera as evidências e limites registrados: carregamento confirmado na aplicação utilizada; Tentar novamente validado localmente, sem falha observada para homologação remota. Análise de amostras, diagnóstico da demora e eventuais melhorias permanecem acompanhamento posterior. Versão/URL do deployment não informadas; nenhum novo SQL necessário para S5-04/S5-05.

Os estados anteriores abaixo são registros históricos; o aceite acima é a situação vigente.

Situação consolidada em 03/10/2026: S5-01–S5-03 implementadas, migrações executadas/verificadas e cenários relatados homologados; TESTE S5 retirado, quatro torneios originais e lançamentos legítimos preservados. S5-04 (resultados recentes e histórico pessoal) teve funcionamento confirmado pelo Dono do produto. S5-05 (carregamento, recuperação e métricas) implementada localmente, com 69 testes, lint e build aprovados; telas de carregamento confirmadas pelo Dono do produto na aplicação utilizada; nenhuma falha ocorreu para conferir Tentar novamente. Versão/URL não informadas. Análise das amostras e otimização posterior ficam como acompanhamento, conforme orientação do Dono do produto, sem prometer redução de latência. Sprint 5 aceita e encerrada pelo Dono do produto em 03/10/2026; análise de logs e melhorias posteriores ficam como acompanhamento. A situação detalhada e cronológica está em docs/sprints/sprint-5.md.

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

A entrega original da Sprint 3 foi um único torneio pré-instanciado, com lançamento, cálculo e ranking. A Sprint 4 acrescentou administração, participantes, múltiplos torneios e perfis. A Sprint 5 entregou configuração de regras pela interface, regra única e período editável, com evidências no documento da sprint. Consulte a avaliação do backlog para as lacunas atuais.

O arquivo `GeoGuaras.xlsx` é a referência inicial do domínio. Ele contém a aba `Diario`, com as pontuações brutas, e a aba `geral`, com os pontos aplicados, resultados mensais e acumulado.

## Stack definida

TypeScript, Next.js, Tailwind CSS e Vercel para a aplicação web. Supabase fornece PostgreSQL, autenticação e autorização via RLS.

## Situação atual

Situação consolidada em 03/10/2026: S5-01–S5-03 implementadas, migrações executadas/verificadas e cenários relatados homologados; TESTE S5 retirado, quatro torneios originais e lançamentos legítimos preservados. S5-04 (resultados recentes e histórico pessoal) teve funcionamento confirmado pelo Dono do produto. S5-05 (carregamento, recuperação e métricas) implementada localmente, com 69 testes, lint e build aprovados; telas de carregamento confirmadas pelo Dono do produto na aplicação utilizada; nenhuma falha ocorreu para conferir Tentar novamente. Versão/URL não informadas. Análise das amostras e otimização posterior ficam como acompanhamento, conforme orientação do Dono do produto, sem prometer redução de latência. Sprint 5 aceita e encerrada pelo Dono do produto em 03/10/2026; análise de logs e melhorias posteriores ficam como acompanhamento. A situação detalhada e cronológica está em docs/sprints/sprint-5.md.

A análise das amostras ocorrerá após utilização pelos usuários, conforme orientação do Dono do produto. Isso não equivale a confirmação de deployment ou de resolução da causa da demora.

- [Sprint 5 — escopo, evidências e aceite](sprints/sprint-5.md)
- [ADR-004 — regra única](decisoes/adr-004-regra-unica-por-torneio.md)
- [ADR-005 — carregamento e diagnóstico](decisoes/adr-005-carregamento-e-diagnostico-do-painel.md)

Evidência posterior S5-05 em 03/10/2026: Dono do produto confirmou as telas de carregamento na aplicação utilizada. Não houve erro para conferir Tentar novamente; recuperação validada nos testes locais, sem confirmação remota desse cenário. Identificação de versão/URL e aceite global não informados. Análise das amostras permanece acompanhamento posterior.
