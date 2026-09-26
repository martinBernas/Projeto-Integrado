# Sprint 4 — Torneios e participantes

Iniciada em 26/09/2026. Escopo principal: S4-01, S4-02 e S4-03. Nome público (S4-04) e perfil GeoGuessr (S4-05) são adicionais remanejáveis. Datas de entrega e capacidade ainda não estimadas.

## S4-02 — Preparação e proteção dos dados

Iniciada pela preparação do backup solicitada pelo Dono do produto. Scripts de captura, comparação e exportação preparados e testados localmente; [roteiro e escopo](sprint-4-backup.md). Backup real executado pelo Dono do produto: 13 participantes, 215 pontuações pessoais e 234 resultados, comparação inicial sem diferenças. Exportação recebida e checksum recalculado localmente com sucesso. Pré-requisito de backup atendido; implementação de gerenciamento de participantes ainda pendente. Usar a mesma referência para conferir mudanças posteriores.

## S4-01 — Administração de torneios

Situação atual: aceite funcional concluído em 26/09/2026, com testes locais e validação pelo Dono do produto descrita abaixo. S4-02 e S4-03 permanecem pendentes; a Sprint 4 continua aberta.

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

### Validação posterior pelo Dono do produto — 26/09/2026

As pendências acima representam o estado anterior às capturas fornecidas pelo Dono do produto. A primeira captura mostra a criação de “Teste final de semana”, aberto, de 26 a 27/09/2026. A segunda mostra o torneio renomeado para “Teste edicao”, com período de 21 a 25/09/2026, estado Encerrado e sem controles de edição. O Dono do produto informou que, a princípio, deu certo. Criação, alteração de nome/período e encerramento foram assim demonstrados na interface. O torneio GeoGuaras — Setembro 2026 permanece listado como Aberto.

As imagens não identificam URL ou commit publicado nem comprovam separadamente a rejeição de encerramento antecipado, a persistência após recarregar, o isolamento com outra conta ou a conferência do ranking real de setembro. Esses pontos continuam pendentes de homologação; isolamento e congelamento de resultados têm cobertura local. Não houve execução direta no Supabase pelo agente. S4-01 permanece em validação final.

### Aceite funcional — confirmação complementar em 26/09/2026

O Dono do produto confirmou que o encerramento antecipado foi bloqueado, o estado persistiu após recarregar e não observou alterações no ranking de setembro. A captura da segunda conta, informada como não participante de setembro, mostra o formulário de criação e a lista “Torneios que organizo” vazia. Isso confirma a separação da listagem administrativa na interface; qualquer usuário autenticado pode criar seus próprios torneios, independentemente de participação em setembro.

Com essas confirmações, criação, edição, encerramento e verificações funcionais solicitadas estão aceitos. O teste remoto não incluiu tentativa direta de alterar torneio alheio pela API nem encerramento de torneio com resultados reais; essas proteções foram verificadas nos testes locais. A observação do ranking é uma conferência visual do Dono do produto, não uma nova conciliação numérica. URL e hash do deployment não foram identificados nas capturas e continuam sem registro neste aceite. Os estados pendentes nas seções anteriores ficam preservados como histórico, substituídos por este aceite funcional.
