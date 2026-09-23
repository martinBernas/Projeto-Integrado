# GeoGuaras — Aplicação web

## Executar localmente

1. Copie `.env.local.example` para `.env.local`.
2. Crie um projeto no Supabase e preencha URL e chave pública.
3. Execute as migrações de `supabase/migrations/` em ordem, uma única vez por ambiente. Se a migração da Sprint 2 já estiver aplicada, execute somente as duas de `20260920`.
4. Em Authentication > URL Configuration, inclua `http://localhost:3000/auth/callback` como URL de redirecionamento.
5. Execute `pnpm dev` nesta pasta e acesse `http://localhost:3000`.

## Implantação

Conecte este repositório à Vercel, selecionando a pasta `web` como diretório raiz. Cadastre as mesmas variáveis de ambiente para Preview e Production e ajuste `NEXT_PUBLIC_SITE_URL` para a URL publicada.

Nunca registre `.env.local` ou `SUPABASE_SERVICE_ROLE_KEY` no Git.

## Recuperação de senha

O login oferece “Esqueci minha senha”, envio de link por e-mail e definição de nova senha após validação da sessão. No Supabase, em Authentication > URL Configuration, autorize `${NEXT_PUBLIC_SITE_URL}/auth/callback?next=/auth/reset-password` (substitua pela URL real do site) e o equivalente local quando necessário. Mantenha o template de recuperação usando o link padrão `{{ .ConfirmationURL }}`. O fluxo PKCE exige solicitar e abrir o link no mesmo navegador. Um link inválido, expirado ou sem o verificador local leva à solicitação de novo link.

Validação remota necessária após publicar: solicitar recuperação de uma conta de teste, abrir o e-mail no mesmo navegador, salvar nova senha, sair e entrar novamente; verificar senha antiga recusada, link reutilizado/expirado e senhas divergentes. Testes locais simulam o serviço de Auth; não comprovam entrega de e-mail ou configuração remota.

## Inclusão de Luca e Zade

O SQL incremental `supabase/seeds/september-new-players-2026-09-23.sql` inscreve as duas contas confirmadas desde 01/09 e importa 29 resultados até 22/09. Execute integralmente no SQL Editor. A carga é transacional e repetível, preserva a configuração anterior de preparação/penalidades e não altera as pontuações dos demais. Após a orientação de execução, o Dono do produto confirmou o retorno `history_ready = true`; o resumo individual de 14 resultados para Luca e 15 para Zade não foi enviado. Veja o [registro de 23/09](../docs/sprints/operacao-2026-09-23.md).

## Sprint 3

O painel oferece lançamento bruto pessoal, histórico, torneio de setembro, cálculo relativo e ranking. Consulte [implantação e carga histórica](../docs/sprints/sprint-3-operacao.md) para provisionar o organizador, vincular contas e carregar o Excel pelo SQL Editor. O script `supabase/seeds/september.sql` exige UUID real antes de executar.

Histórico incompleto mantém o ranking provisório e não gera penalidades. Após a conferência pelo Dono do produto, `private.complete_september_history()` habilita o cálculo de faltas nos dias encerrados. A aplicação usa somente a chave pública e a sessão do usuário; não requer chave de serviço.

Validação local: `pnpm test` (Node.js 24, testes de banco com PGlite e ranking), `pnpm lint` e `pnpm build`. Os testes não acessam o banco remoto nem substituem a validação com Supabase Auth em ambiente publicado.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
