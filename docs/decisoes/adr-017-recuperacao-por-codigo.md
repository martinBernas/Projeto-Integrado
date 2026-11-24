# ADR-017 — Recuperação de senha por código de e-mail

Data: 24/11/2026. Decisão funcional confirmada pelo Dono do produto; implementação local, ativação remota e aceite pendentes.

## Contexto

O Dono do produto relatou links já utilizados ao recuperar senha em duas contas corporativas do mesmo domínio. O callback atual valida o token em GET; verificadores de URLs podem consumi-lo antes do jogador. É hipótese compatível com o código e com a [documentação oficial do Supabase](https://supabase.com/docs/guides/auth/auth-email-templates#email-prefetching), sem confirmação nos logs remotos dos casos relatados.

## Decisão

Substituir o link nas novas mensagens por `{{ .Token }}`. Manter `resetPasswordForEmail` como emissor do código de recuperação; não usar login OTP ou cadastro automático. O jogador informa e-mail e código na página `/auth/forgot-password`. A Server Action valida o formato e chama `verifyOtp` com tipo fixo `recovery`. Somente sucesso com sessão e usuário permite redirecionamento fixo para a tela de nova senha. Cookies são persistidos pelo cliente SSR existente; a ação de nova senha continua validando `getUser` antes de `updateUser`.

Escolhas técnicas: dois formulários na mesma tela, com e-mail compartilhado em memória; verificação disponível mesmo sem solicitação naquele navegador; código como texto numérico de 6 a 10 dígitos, preservando zeros iniciais. E-mail/código não vão em URL, storage ou logs. O servidor não confia no estado da interface para autorizar a recuperação. Expiração, uso único e rate limits permanecem no Supabase Auth, sem token ou contador próprio.

## Consequências e limites

Novos e-mails não apresentam URL capaz de consumir o token durante varredura. O UUID da conta, perfil, pontuações e participações não mudam; não há migração de conta ou banco, service role, novo provedor ou custo contratado. SMTP de autenticação e relatórios continuam independentes e preservados. A hipótese sobre o provedor corporativo não se torna confirmação por esta mudança.

Callback GET mantido por compatibilidade com cadastro e mensagens antigas; essas mensagens não ganham a proteção nova. Sessões autenticadas continuam podendo alterar sua senha conforme comportamento anterior. Falha ao salvar a senha após código validado permite tentar novamente enquanto a sessão permanecer válida. Atualizar template remoto é obrigatório; código local sozinho não ativa a solução. Rollback: republicar a versão anterior e restaurar privadamente o template anterior; novos e-mails com código deixam de ter tela compatível após rollback.

## Fluxo

```mermaid
sequenceDiagram
    actor J as Jogador
    participant W as Aplicação / Server Actions
    participant A as Supabase Auth
    participant E as E-mail / SMTP existente
    J->>W: Solicitar recuperação com e-mail
    W->>A: resetPasswordForEmail(email)
    A->>E: Template Reset Password com Token, sem link
    E-->>J: Código de uso único
    J->>W: POST e-mail e código (outro aparelho permitido)
    W->>A: verifyOtp(email, token, recovery)
    alt Código válido
        A-->>W: Sessão e usuário
        W-->>J: Cookies SSR e redirecionamento fixo
        J->>W: Nova senha e confirmação
        W->>A: getUser; updateUser(password)
        A-->>J: Mesma conta e histórico
    else Inválido, expirado ou reutilizado
        A-->>W: Erro
        W-->>J: Orientação sem detalhes internos
    end
```
