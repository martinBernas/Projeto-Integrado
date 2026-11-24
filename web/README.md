# GeoGuaras — Aplicação web

Medalhas (RF28): faixas e consultas em `src/lib/medals.ts`, SVGs/contadores em `dashboard/medal-collection.tsx`. Coleção por torneio usa bruto válido da RPC; pessoal usa quatro HEAD counts exatos de todo o histórico, filtrados por conta/data, sem migração. Falha não vira zero/parcial. A prévia local contém exemplos das quatro categorias e registros fora do torneio. [Entrega, testes e publicação](../docs/sprints/sprint-9-medalhas.md).

Ajuda contextual: `src/app/info-tip.tsx` renderiza o botão “i” e sua descrição; `InfoTipController` no layout inicializa `src/lib/info-tips.ts`, também usado pela prévia local. Use `InfoTip` com `label` contextual para explicações complementares; não coloque botões dentro de `<label>` nem recolha alertas/checkboxes de confirmação. Um `id` explícito é opcional para associar campos por `aria-describedby` e deve ser único. [Comportamento, testes e limites](../docs/sprints/sprint-9-ajuda-contextual.md).

Posicionamento confirmado pelo Dono do produto: ícone à direita do título, rótulo ou controle explicado, na mesma linha visual. Use `info-heading` ou `info-label` para agrupar texto e ajuda, sem deixar o ícone solto abaixo do campo. Em campos repetidos, gere IDs próprios com `useId`.

Layout geral de 24/11/2026: cabeçalho e navegação em `src/app/app-header.tsx`, composição em `layout.tsx` e tokens/regras visuais em `globals.css`. Temas claro/escuro/sistema preservados; sem dependência ou mídia externa nova. Publicação pelo fluxo existente, sem migração ou ajuste de Supabase. [Escopo, validação e homologação](../docs/sprints/sprint-9-layout-geoguaras.md).

## Executar localmente

Para revisar telas internas sem conta real, após `pnpm build` execute `node scripts/preview-layout.mjs` nesta pasta e abra `http://127.0.0.1:3100/dashboard`. São 14 rotas com componentes reais e dados fictícios, em servidor separado, sem acesso ao Supabase. Menu, temas e detalhes das tabelas funcionam; formulários e controles de gráficos são demonstrativos e não gravam dados. `node scripts/preview-layout.mjs --check` valida a renderização sem abrir servidor. Encerre com `Ctrl+C`; após mudar CSS, gere novo build e reinicie. [Escopo e limites](../docs/sprints/sprint-9-layout-geoguaras.md#simulação-navegável-solicitada-posteriormente--24112026).

1. Copie `.env.local.example` para `.env.local`.
2. Crie um projeto no Supabase e preencha URL e chave pública.
3. Execute as migrações de `supabase/migrations/` em ordem, uma única vez por ambiente. Em ambientes existentes, aplique apenas as ainda não executadas, incluindo as de `20260926` para torneios e participantes.
4. Em Authentication > URL Configuration, inclua `http://localhost:3000/auth/callback` como URL de redirecionamento.
5. Execute `pnpm dev` nesta pasta e acesse `http://localhost:3000`.

## Implantação

Conecte este repositório à Vercel, selecionando a pasta `web` como diretório raiz. Cadastre as mesmas variáveis de ambiente para Preview e Production e ajuste `NEXT_PUBLIC_SITE_URL` para a URL publicada.

Nunca registre `.env.local` ou `SUPABASE_SERVICE_ROLE_KEY` no Git.

## Recuperação de senha

O login oferece “Esqueci minha senha”: solicitar código, informar e-mail/código na própria tela e escolher uma nova senha após validação. A Server Action chama `verifyOtp({ email, token, type: 'recovery' })`, estabelece a sessão via cookies e redireciona para `/auth/reset-password`. O Supabase controla expiração, uso único e limites de tentativas/envio. A interface aceita códigos numéricos de 6 a 10 dígitos, conforme a configuração do Auth, preservando zeros iniciais. Não depende dos cookies do navegador que solicitou o e-mail. O identificador da conta e as pontuações permanecem iguais.

Ativação: primeiro publique a aplicação. Depois, no Supabase > Authentication > Email Templates > Reset Password, substitua o conteúdo pelo arquivo [recovery.html](supabase/templates/recovery.html). O template exibe `{{ .Token }}` e não contém link, `{{ .ConfirmationURL }}` ou `{{ .TokenHash }}`. Isso evita o consumo do token por verificadores que visitam URLs de mensagens corporativas. Salvar o arquivo local não altera o template remoto. Solicite um novo e-mail após salvar; mensagens antigas não mudam. A tela de código permanece disponível sem nova solicitação, permitindo continuar em outro aparelho com o mesmo e-mail. Nunca compartilhe códigos ou registre-os em logs/evidências.

Mantenha Site URL `https://geoguaras.vercel.app` e os redirecionamentos existentes `/auth/callback` e `/auth/callback?next=/auth/reset-password` na lista autorizada: o callback permanece para cadastro e links legados, que ainda podem sofrer consumo automático. SMTP Auth existente não muda. Confira no painel a validade, o tamanho do código e os limites de envio/verificação; não desative proteções para contornar erros. Não é necessária migração de banco nem chave de serviço. Para testes isolados, use outro projeto Supabase.

Validação remota necessária após publicar e atualizar o template: testar conta corporativa e conta pessoal; receber mensagem somente com código; solicitar no computador e digitar em outro navegador sem sessão; salvar nova senha, sair e entrar novamente; verificar senha antiga recusada, código incorreto/expirado/reutilizado, e-mail diferente, reenvio e senhas divergentes. Conferir mesmo perfil, histórico e participações antes/depois, sem exportar dados pessoais para o repositório. Testes locais simulam o serviço Auth e não comprovam entrega, limites, uso único real ou configuração remota. [Decisão e diagrama](../docs/decisoes/adr-017-recuperacao-por-codigo.md), [entrega e homologação](../docs/sprints/sprint-9-recuperacao-por-codigo.md).

## Inclusão de Luca e Zade

O SQL incremental `supabase/seeds/september-new-players-2026-09-23.sql` inscreve as duas contas confirmadas desde 01/09 e importa 29 resultados até 22/09. Execute integralmente no SQL Editor. A carga é transacional e repetível, preserva a configuração anterior de preparação/penalidades e não altera as pontuações dos demais. Após a orientação de execução, o Dono do produto confirmou o retorno `history_ready = true`; o resumo individual de 14 resultados para Luca e 15 para Zade não foi enviado. Veja o [registro de 23/09](../docs/sprints/operacao-2026-09-23.md).

## Sprint 3

Administração da Sprint 4: consulte [escopo, backup e implantação](../docs/sprints/sprint-4.md). Para S4-02, aplique `supabase/migrations/202609260002_participant_management.sql` após a migração de administração de torneios e antes da publicação. Compare os dados com o backup privado antes/depois usando `supabase/rehearsal/sprint4/02-verify.sql`.

A S4-03 oferece lançamento bruto pessoal, histórico separado, abas de torneios acessíveis e rankings específicos, com resultados diários em ordem decrescente de pontuação aplicada. Antes de publicar esta versão, aplique somente `supabase/migrations/202609260003_multiple_tournaments.sql` após as migrações S4-01/S4-02 já confirmadas. Execute `supabase/rehearsal/sprint4/02-verify.sql` antes e depois, preservando o backup original. Consulte [implantação e carga histórica](../docs/sprints/sprint-3-operacao.md) para provisionar o organizador, vincular contas e carregar o Excel pelo SQL Editor. O script `supabase/seeds/september.sql` exige UUID real antes de executar.

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

## Perfil público — S4-04/S4-05 (homologadas)

Sprint 4 encerrada em 27/09/2026: S4-01 a S4-05 migradas, publicadas na Vercel e homologadas pelo Dono do produto. A página `/dashboard/profile` edita nome público único e link opcional; cadastro exige nome explícito. As instruções anteriores de implantação são referência para ambientes novos, não orientação para reaplicar migrações em produção.

Migração de perfis `supabase/migrations/202609270001_public_profiles.sql` já aplicada. Preflight confirmado: 14 contas, zero colisões e zero nomes sinalizados para substituição. Comparação posterior com `supabase/operations/20260927-profile-verify.sql` retornou zero diferenças nos campos antigos. Preservar o backup original; o comparador exclui somente as duas colunas novas e detecta alterações legítimas de nome.

Carga pontual `supabase/operations/20260927-import-mvp-profiles.sql` também executada: 12 nomes confirmados e 11 URLs, com Martin fora do escopo para preservar o perfil manual e Luca sem URL. Não reaplicar para sobrescrever edições posteriores. Antes/depois ficam na auditoria privada; nomes alterados produzirão diferenças esperadas na comparação com o backup antigo. A carga não requer deploy adicional.

Roteiro, evidências e limites em [Sprint 4](../docs/sprints/sprint-4.md); decisões na [ADR-002](../docs/decisoes/adr-002-perfil-publico.md).
