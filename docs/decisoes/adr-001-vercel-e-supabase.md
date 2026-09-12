# ADR-001 — Hospedagem na Vercel e backend no Supabase

| Campo | Registro |
| --- | --- |
| Status | Aceita |
| Data | 2026-09-12 |
| Decisão | Hospedar a aplicação Next.js na Vercel e utilizar Supabase para PostgreSQL, autenticação e autorização. |

## Contexto

O GeoGuaras é uma aplicação acadêmica, com necessidade de login, dados relacionais, controle de acesso por jogador e organizador, implantação pública e baixo custo de operação.

## Decisão

O frontend e as rotas de servidor serão desenvolvidos em Next.js com TypeScript e implantados na Vercel. O Supabase será a plataforma de backend, fornecendo banco PostgreSQL, Supabase Auth e políticas RLS.

## Consequências

### Positivas

- Deploy e versões de preview integrados ao GitHub.
- Menos infraestrutura para a equipe administrar.
- Autenticação e banco relacional já disponíveis.
- RLS permite proteger pontuações pessoais e permissões de torneios no próprio banco.
- Os planos gratuitos são suficientes para desenvolvimento e apresentação do MVP.

### Atenções

- A Vercel Hobby é destinada a uso pessoal e não comercial; isso é adequado ao projeto acadêmico atual.
- O Supabase gratuito pode pausar projetos após uma semana sem atividade.
- Limites dos planos gratuitos devem ser acompanhados caso o número de usuários ou os arquivos armazenados aumente.
- Chaves e segredos devem permanecer fora do repositório Git.

## Ações decorrentes na Sprint 2

- Criar o projeto Next.js com TypeScript e Tailwind CSS.
- Criar o projeto Supabase e versionar as migrações SQL no repositório.
- Modelar tabelas e habilitar RLS com políticas de acesso.
- Configurar Supabase Auth.
- Conectar o repositório GitHub à Vercel e configurar variáveis de ambiente em desenvolvimento, preview e produção.
- Validar login, permissões RLS e deploy de preview antes de iniciar o módulo de torneios.

## Referências

- https://vercel.com/docs/plans/hobby
- https://vercel.com/docs/environment-variables
- https://supabase.com/pricing
- https://supabase.com/docs/guides/database/postgres/row-level-security

