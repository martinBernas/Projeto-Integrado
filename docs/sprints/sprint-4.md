# Sprint 4 — Torneios e participantes

Iniciada em 26/09/2026. Escopo principal: S4-01, S4-02 e S4-03. Nome público (S4-04) e perfil GeoGuessr (S4-05) são adicionais remanejáveis. Datas de entrega e capacidade ainda não estimadas.

## S4-01 — Administração de torneios

Implementação local de criação, edição e encerramento em `/dashboard/tournaments`, acessível pelo painel. Qualquer conta autenticada pode criar torneios; somente o organizador administra os seus. A lista administrativa serve para localizar os torneios que organiza; a navegação e os resultados de múltiplos torneios para participantes continuam em S4-03.

- Criação: nome de 3 a 100 caracteres e período válido. Regra fixa `mvp-v1`: relativo ao menor positivo, ausência −2.500, segunda a sexta e fuso `America/Sao_Paulo`. Não copia o feriado específico de setembro. Começa sem participantes e com preparação histórica aberta, para não gerar ausências antes da conferência; gerenciamento de participantes é S4-02.
- Edição: nome e período. Período só muda sem participantes, resultados ou exclusões, evitando invalidar elegibilidade e histórico. Não permite trocar organizador ou regras pela API.
- Encerramento: ação do organizador após a virada do último dia, com confirmação na tela. Exige histórico conferido quando há participantes, consolida resultados e impede edições e novos recálculos. Repetir a operação mantém o mesmo encerramento. Pontuações pessoais continuam disponíveis para outros torneios.
- Rastreabilidade: registro privado da criação e alterações, com ator, data e valores anteriores/novos. Escrita direta e exclusão pela API continuam bloqueadas.

Decisão do Dono do produto: dados disponíveis por uma semana após o encerramento. Relatório, envio aos participantes por e-mail e exclusão para retirada da interface serão planejados posteriormente em RF19. Até sua implementação, encerrados permanecem visíveis também após essa semana. O encerramento nesta entrega é manual; automação futura não foi definida.

## Publicação e aceite

Aplicar `web/supabase/migrations/202609260001_tournament_management.sql` depois das três migrações existentes, antes de publicar a aplicação. Nenhuma execução remota foi realizada nesta implementação. A migração mantém os torneios existentes abertos e preserva seus dados.

Validar com duas contas: criar um torneio, editar nome/período vazio, verificar isolamento entre organizadores, rejeitar encerramento antes do fim, encerrar um torneio passado e conferir persistência dos resultados e bloqueio de edição. Validar o painel de setembro após a migração. Não usar o torneio real para ensaiar encerramento.

Testes locais de banco cobrem regras fixas, validação, autenticação, isolamento, escrita direta, auditoria, bloqueio de período com participantes, histórico pendente, encerramento idempotente e resultados congelados sem afetar outro torneio. Publicação e aceite remoto permanecem pendentes; S4-01 não está encerrada.

Verificação local em 26/09: suíte completa com 20 testes aprovada, seguida de um teste adicional das ações do formulário também aprovado (21 no total). `pnpm lint`, `pnpm build` e `git diff --check` aprovados. A regressão de banco do MVP aplica também a nova migração. Ainda não houve inspeção visual autenticada nem homologação no ambiente publicado.
