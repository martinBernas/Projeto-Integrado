# Sprint 4 — Torneios e participantes

Iniciada em 26/09/2026. Escopo principal: S4-01, S4-02 e S4-03. Nome público (S4-04) e perfil GeoGuessr (S4-05) são adicionais remanejáveis. Datas de entrega e capacidade ainda não estimadas.

## S4-02 — Preparação e proteção dos dados

Iniciada pela preparação do backup solicitada pelo Dono do produto. Scripts de captura, comparação e exportação preparados e testados localmente; [roteiro e escopo](sprint-4-backup.md). Backup real executado pelo Dono do produto: 13 participantes, 215 pontuações pessoais e 234 resultados, comparação inicial sem diferenças. Exportação recebida e checksum recalculado localmente com sucesso. Pré-requisito de backup atendido; implementação de gerenciamento de participantes ainda pendente. Usar a mesma referência para conferir mudanças posteriores.

### Implementação da S4-02

Implementação local concluída; migração remota confirmada pelo Dono do produto, publicação e homologação da interface ainda pendentes de confirmação. Em Administrar torneios, o link Gerenciar participantes abre a lista atual e a seleção de usuários cadastrados, pesquisável por nome ou e-mail e paginada em 25 contas. Por solicitação do Dono do produto, o organizador vê nome e e-mail na seleção; a API exige que ele organize o torneio informado. E-mails não são adicionados ao ranking ou à listagem de participantes para competidores. Contas já vinculadas ficam fora da seleção.

- Inclusão de conta existente pela seleção; sem criar contas, enviar mensagens ou alterar perfis. Data de participação padrão é o início do torneio. A data deve estar dentro do período; o histórico pessoal já registrado conta desde ela, mesmo anterior ao vínculo. Uma data posterior representa elegibilidade individual, como no caso de Bastian.
- Alteração da data e remoção com confirmação dos efeitos. A remoção retira vínculo e contribuição no torneio, preservando todas as pontuações pessoais. Datas e vínculos são auditados, assim como resultados retirados por mudança de elegibilidade. Recalcula somente o torneio alvo; no modo relativo, os resultados de outros participantes desse torneio podem mudar legitimamente.
- Torneio encerrado permite somente consulta. Escritas diretas continuam bloqueadas; as operações validam organizador e estado no banco. Alterações são transacionais e usam o mesmo bloqueio do torneio que os lançamentos.
- Preparação histórica mantém seu estado nas alterações. Se já estiver pronta, ausências são calculadas para os novos participantes desde sua elegibilidade; a tela explica isso e pede confirmação. Se estiver em preparação, não aplica penalidades até o organizador confirmar a conferência pelo botão Concluir preparação do histórico. A conclusão exige participantes e não importa nem inventa pontuações ausentes.

### Implantação e conferência da S4-02

1. Executar novamente `web/supabase/rehearsal/sprint4/02-verify.sql` e guardar o retorno. Corrigir ou explicar eventuais diferenças em relação à referência, sem substituir o backup.
2. Aplicar somente `web/supabase/migrations/202609260002_participant_management.sql`, integralmente, uma vez, após a migração da S4-01. Ela cria operações e auditoria, sem modificar os dados de negócio existentes nem recalcular resultados durante a aplicação.
3. Antes de operar participantes, repetir a comparação e conferir que a migração não introduziu diferenças. Lançamentos legítimos ocorridos desde a captura devem ser distinguidos de alterações indevidas.
4. Publicar a aplicação. Validar preferencialmente em um torneio de teste: buscar uma conta pelo nome/e-mail, incluí-la desde o início, alterar elegibilidade, remover e conferir que o histórico pessoal permanece. Verificar com outra conta que ela não administra o torneio alheio. A navegação do participante entre vários torneios continua na S4-03.
5. Conferir novamente setembro com o mesmo script. Operações realizadas apenas no torneio de teste não devem alterar seus vínculos, brutos ou resultados. O ensaio não exige mudar participantes de setembro.

Testes locais incluem aplicação da migração sobre a cópia privada do backup real e comparação integral dos dados e do cálculo de referência; esse teste é pulado quando o arquivo local ignorado pelo Git não existe. Testes sintéticos cobrem diretório restrito, busca/paginação, inclusão retroativa, duplicidade, datas inválidas, histórico em preparação/pronto, retirada de resultados fora da elegibilidade, isolamento de outro torneio, preservação dos brutos/perfis, auditoria e bloqueio após encerramento. Testes das ações cobrem sessão, seleção, confirmação, datas e mensagens de erro.

Validação local: 26 testes aprovados, sem testes pulados neste ambiente, incluindo a cópia local do backup real. Build de produção aprovado. Ainda não houve inspeção visual autenticada da nova tela ou homologação remota das operações da S4-02; nenhum dado real foi alterado pelo agente.

### Confirmação da migração pelo Dono do produto

O Dono do produto informou a execução de `202609260002_participant_management.sql` no Supabase e forneceu as comparações anterior e posterior. Ambas retornaram `diferencas = 0`, `detalhes = []` e checksums do backup/estado atual iguais a `3d847140e955fd6feaaffab3b252dbe8`, para `before-s4-02-september-v1` (captura em `2026-09-26 13:56:45.612398+00`). A comparação confirma preservação dos dados abrangidos pelo backup após a migração. Publicação e ensaio de gerenciamento na interface ainda precisam ser confirmados; não reaplicar a migração.

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
