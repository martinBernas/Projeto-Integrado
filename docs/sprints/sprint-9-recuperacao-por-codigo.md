# Sprint 9 — Correção de recuperação de senha por código

24/11/2026 — Dono do produto confirmou a adoção de código por e-mail após relato de links já utilizados em contas corporativas. Implementação local autorizada para este item; demais itens do planejamento da Sprint 9 não são iniciados por esta decisão.

## Escopo implementado

- Solicitação por e-mail com resposta sem confirmar a existência da conta; reenvio pelo mesmo formulário, sujeito aos limites do Auth.
- Formulário de e-mail/código disponível desde o início, inclusive em outro navegador sem cookies da solicitação. Validação ocorre somente em POST pela Server Action, com tipo `recovery` fixo; código nunca entra na URL.
- Após sessão válida, tela existente de nova senha/confirmacão, validação do usuário pelo servidor e atualização da mesma conta. Erros de formato, verificação e atualização apresentados sem resposta interna do provedor.
- Template Reset Password exibe somente `{{ .Token }}`, instrução de uso, validade limitada e aviso de não compartilhar. Sem link de verificação.
- Sem alteração de pontuações, migração, privilégios ou SMTP. Callback legado preservado para cadastro e mensagens antigas.

Decisão funcional confirmada: código por e-mail. Escolhas técnicas e consequências: [ADR-017 e diagrama](../decisoes/adr-017-recuperacao-por-codigo.md). Não há diagnóstico remoto confirmado da causa nos casos relatados.

## Validação local

Testes de autenticação simulam Supabase Auth: entrada inválida não chama o provedor; tipo recovery fixo; código com zero inicial; e-mail incorreto/código inválido/reutilizado; erro/ausência de sessão/usuário impedem sucesso; template sem URL; validação de senha/sessão e compatibilidade do callback. Simulações não comprovam entrega, expiração/uso único real, rate limits ou sessão remota.

Resultados locais em 24/11/2026: `node --test tests/password-recovery.test.mjs` passou 7/7; `pnpm test` passou 158/158; `pnpm lint` terminou sem erros e com um aviso em `tests/retroactive-scores.test.mjs:107` (variável `ids` não utilizada, arquivo não alterado nesta tarefa); `pnpm build` concluiu compilação, TypeScript e geração de páginas; `git diff --check` passou. Não houve teste visual em navegador ou teste com e-mail real nesta implementação.

## Ativação e homologação pendentes

1. Publicar a aplicação com a tela de código.
2. Preservar cópia privada do template remoto anterior, sem incluir códigos, credenciais ou dados pessoais no Git. Não foi realizado backup remoto nesta implementação; não há alteração do banco que exija migração ou restauração de dados.
3. No Supabase, atualizar Authentication > Email Templates > Reset Password com `web/supabase/templates/recovery.html`. Conferir validade/tamanho do código e limites Auth sem relaxar proteções. SMTP e demais templates não mudam.
4. Solicitar mensagem nova e testar conta corporativa afetada e conta pessoal, incluindo solicitação em um aparelho e verificação em outro. Conferir ausência de link na mensagem; rejeição de código errado, expirado, reutilizado e de outro e-mail; reenvio; senhas divergentes; falha e nova tentativa de salvar; acesso com nova senha e recusa da antiga.
5. Conferir preservação do perfil, pontuações e participações. Registrar evidências sem e-mail/código/senha/sessão. Aceite do Dono do produto permanece pendente.

Publicação, configuração do template, envio real e homologação não foram executados pelo agente. Mensagens antigas continuam com o comportamento anterior e exigem nova solicitação para obter o código. Procedimento de rollback na ADR-017; operação vigente no [README web](../../web/README.md#recuperação-de-senha).
