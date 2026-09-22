# Sprint 2 — Fundação técnica, autenticação e publicação

| Campo | Registro |
| --- | --- |
| Status | Concluída |
| Período | 12/09/2026 |
| Objetivo | Criar a base web do GeoGuaras, integrar autenticação e publicar uma versão protegida do sistema. |

## Escopo entregue

- Aplicação web em Next.js, TypeScript e Tailwind CSS na pasta `web/`.
- Integração com Supabase PostgreSQL e Supabase Auth.
- Cadastro, login, logout, confirmação por callback e painel protegido.
- Migração inicial do banco para perfis, pontuações pessoais, torneios, participantes, datas excluídas e resultados de torneio.
- Políticas iniciais de Row Level Security (RLS) para restringir pontuações ao titular e a gestão de torneios ao organizador.
- Configuração por variáveis de ambiente, sem segredos no Git.
- Publicação da aplicação na Vercel.

## Arquitetura aplicada

O frontend e as rotas de servidor usam Next.js. O Supabase fornece banco relacional, autenticação e autorização no banco por RLS. A Vercel hospeda a aplicação e produz versões de preview e produção a partir do repositório GitHub.

Detalhes da decisão e da arquitetura estão em [Arquitetura e implantação](../arquitetura.md) e na [ADR-001](../decisoes/adr-001-vercel-e-supabase.md).

## Artefatos técnicos

- [Guia de execução e implantação](../../web/README.md)
- [Modelo de variáveis de ambiente](../../web/.env.local.example)
- [Migração inicial e políticas RLS](../../web/supabase/migrations/202609120001_initial_schema.sql)
- [Ações de autenticação](../../web/src/app/auth/actions.ts)
- [Painel protegido](../../web/src/app/dashboard/page.tsx)

## Evidências

| Evidência | Resultado |
| --- | --- |
| Commit de implementação | `3f8c614` — “Sprint 2” |
| Decisão de infraestrutura | `57e4600` — Vercel e Supabase documentados |
| Validação de qualidade | `pnpm lint` e `pnpm build` concluídos sem falhas |
| Validação local | Cadastro, login e acesso ao painel protegido confirmados com Supabase Auth |
| Validação de produção | Login e painel protegido confirmados em https://geoguaras.vercel.app |

## Critério de aceite atingido

Um usuário consegue criar conta, autenticar-se, acessar a área protegida e encerrar a sessão. O mesmo fluxo foi validado no ambiente local e no ambiente publicado. A aplicação está conectada ao Supabase e publicada na Vercel.

## Limite temporário conhecido

A confirmação de e-mail está desativada temporariamente para permitir os testes do projeto acadêmico. Antes da entrega final, a equipe deve reativá-la ou configurar um serviço SMTP próprio.

