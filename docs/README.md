# GeoGuaras — Wiki do Projeto

Aplicação web para registrar pontuações pessoais de GeoGuessr, administrar torneios e gerar rankings com regras de pontuação auditáveis.

## Documentação

- [Plano de ação](plano-de-acao.md)
- [Documentação funcional](documentacao-funcional.md)
- [Arquitetura e implantação](arquitetura.md)
- [Decisão técnica: Vercel e Supabase](decisoes/adr-001-vercel-e-supabase.md)
- [Requisitos](requisitos.md)
- [Regras de pontuação](regras-de-pontuacao.md)
- [Plano de testes](plano-de-testes.md)
- [Diagrama de classes](diagramas/classes.md)

## Fonte do MVP

O arquivo `GeoGuaras.xlsx` é a referência inicial do domínio. Ele contém a aba `Diario`, com as pontuações brutas, e a aba `geral`, com os pontos aplicados, resultados mensais e acumulado.

## Stack definida

TypeScript, Next.js, Tailwind CSS e Vercel para a aplicação web. Supabase fornece PostgreSQL, autenticação e autorização via RLS.
