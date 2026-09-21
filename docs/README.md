# GeoGuaras — Wiki do Projeto

Aplicação web para registrar pontuações pessoais de GeoGuessr, administrar torneios e gerar rankings com regras de pontuação auditáveis.

Sprint 3 concluída em 21/09/2026. [Encerramento e evidências](sprints/sprint-3-encerramento.md). Histórico em preparação para a carga real pelo Dono do produto.

## Documentação

- [Plano de ação](plano-de-acao.md)
- [Sprint 3 — MVP utilizável](sprints/sprint-3.md)
- [Sprint 3 — implantação e carga histórica](sprints/sprint-3-operacao.md)
- [Sprint 3 — ensaio com duas contas e rollback](sprints/sprint-3-ensaio.md)
- [Histórico da documentação](historico.md)
- [Auditoria de pontuações — Sprint 6](auditoria-de-pontuacoes.md)
- [Documentação funcional](documentacao-funcional.md)
- [Arquitetura e implantação](arquitetura.md)
- [Decisão técnica: Vercel e Supabase](decisoes/adr-001-vercel-e-supabase.md)
- [Requisitos](requisitos.md)
- [Regras de pontuação](regras-de-pontuacao.md)
- [Plano de testes](plano-de-testes.md)
- [Diagrama de classes](diagramas/classes.md)

## Fonte do MVP

A entrega atual é um único torneio pré-instanciado, com lançamento, cálculo e ranking. Criação de torneios e configuração de regras pela interface ficam para sprints futuras. Consulte o plano da Sprint 3 para decisões e critérios de aceite.

O arquivo `GeoGuaras.xlsx` é a referência inicial do domínio. Ele contém a aba `Diario`, com as pontuações brutas, e a aba `geral`, com os pontos aplicados, resultados mensais e acumulado.

## Stack definida

TypeScript, Next.js, Tailwind CSS e Vercel para a aplicação web. Supabase fornece PostgreSQL, autenticação e autorização via RLS.
