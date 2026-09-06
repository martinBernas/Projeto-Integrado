# GeoGuaras — Wiki do Projeto

Aplicação web para registrar pontuações pessoais de GeoGuessr, administrar torneios e gerar rankings com regras de pontuação auditáveis.

## Documentação

- [Plano de ação](plano-de-acao.md)
- [Requisitos](requisitos.md)
- [Regras de pontuação](regras-de-pontuacao.md)
- [Plano de testes](plano-de-testes.md)
- [Diagrama de classes](diagramas/classes.md)

## Fonte do MVP

O arquivo `GeoGuaras.xlsx` é a referência inicial do domínio. Ele contém a aba `Diario`, com as pontuações brutas, e a aba `geral`, com os pontos aplicados, resultados mensais e acumulado.

## Stack proposta

TypeScript, Next.js, PostgreSQL/Supabase e Tailwind CSS. Essa combinação permite uma aplicação web responsiva, autenticação, persistência relacional e regras de acesso por usuário.
