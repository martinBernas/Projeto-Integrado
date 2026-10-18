# Manutenção após a Sprint 6 — 18/10/2026

18/10/2026 — O Dono do produto informou que executou a nova migração de retirada da preparação histórica (`202610180002_retire_history_preparation.sql`). Execução relatada; retorno SQL, ambiente e horário exato não fornecidos. Não reaplicar. Publicação e homologação do fluxo sem preparação ainda não confirmadas. Retirada do torneio de teste ainda não executada/confirmada; orientação iniciada pela captura de backup. Este registro substitui a pendência anterior de execução dessa migração, sem presumir backup novo ou exclusão remota.

## Autorização e escopo

Após encerrar a Sprint 6, o Dono do produto solicitou remover a preparação de histórico, útil apenas na carga inicial, e eliminar o torneio “Teste auditoria Aztecas Outubro”. Manutenção autorizada fora da sprint encerrada; não reabre a Sprint 6 nem inicia a Sprint 7. Implementação e ensaios locais; execução remota, publicação e homologação ainda não realizadas.

## Preparação histórica removida

Removidos aviso do painel, seção/botão na administração de participantes, opção `complete` da Server Action e mensagem de bloqueio de encerramento. Confirmações de participação passam a informar ausências dos dias elegíveis encerrados. `TournamentData` e a consulta da página de participantes deixam de depender de `history_ready`.

Migração incremental `202610180002_retire_history_preparation.sql`: substitui cálculo canônico para aplicar ausência/zero em dias elegíveis anteriores à data de referência sem consultar a preparação; mantém o dia atual provisório, calendário, exclusões, elegibilidade, regra absoluta/relativa, auditorias e penalidades já fixadas. Remove exigência de histórico pronto do encerramento e a RPC `complete_tournament_history`. Criação simples/configurada segue disponível e novos registros usam o valor legado verdadeiro. Sem alterações de permissões de criação/encerramento.

Não apaga pontuações, resultados ou registros históricos nem atualiza linhas de negócio na migração. Mantém a coluna legada e os snapshots anteriores para compatibilidade e preservação; seu valor deixa de controlar o cálculo atual. Antigas migrações, cargas e ensaios continuam como registros históricos; não são o procedimento de novos torneios. [ADR-008](../decisoes/adr-008-fim-preparacao-historica.md).

**Efeito operacional:** torneios abertos ainda marcados como em preparação recebem a regra de ausência no próximo recálculo normal, inclusive leitura do painel. Isso pode alterar ranking, resultados derivados e histórico de recálculo desses torneios, conforme a remoção solicitada. Torneios encerrados não são recalculados; permanecem congelados. Correção de lançamentos, criação de participantes e auditorias preservam seus contratos. A migração não força atualização em lote.

Antes da execução, obter backup privado atual pelo procedimento do ambiente e inventariar torneios abertos com `history_ready=false`. Aplicar apenas a nova migração após as anteriores e publicar a interface atualizada. Não reaplicar migrações antigas. Homologar novo torneio sem preparação, torneio aberto legado, ausência/zero, dia atual, elegibilidade, encerramento, auditorias e resultados congelados. Backup remoto novo não executado/confirmado nesta manutenção. Rollback funcional requer revisão das funções anteriores e dos resultados recalculados; não presumir reversão do ranking apenas por restaurar a interface.

## Retirada do torneio de teste

Preparados scripts operacionais em `web/supabase/operations/audit-test-cleanup/`, separados da migração funcional. Sem conexão administrativa ao Supabase nesta sessão; configuração local disponibiliza apenas acesso público da aplicação. Exclusão remota não executada.

Alvo resolvido pelo nome exato, exigindo uma única correspondência. Backup privado registra o UUID real; exclusão exige o mesmo UUID/nome e estado sem alterações desde a captura. Captura inclui pontuações, perfis, torneios, participantes, resultados, regras, auditorias, eleitorado, votos, eventos e logs. Não presumir ID a partir do nome. O script recusa ambiguidades, dependências desconhecidas e backup desatualizado. Preserva o original e todos os demais dados de negócio por comparação transacional; nenhuma exclusão de pontuação pessoal. Remove votos primeiro (FK sem cascata), avaliações e depois o torneio, evitando bloqueio de participação por auditoria de teste pendente. Votos/eventos do teste saem das tabelas ativas e permanecem no backup privado. Logs de mudança existentes são preservados e novos eventos de exclusão são registrados.

Procedimento: [retirada do torneio de teste](../../web/supabase/operations/audit-test-cleanup/README.md). Captura é backup de negócio no mesmo banco, não backup integral de Supabase/Auth; exportar privadamente antes da exclusão. Nenhum conteúdo pessoal ou arquivo real de backup incluído no repositório. Retorno da captura/exportação/exclusão e identificador real do alvo ainda não recebidos.

## Verificação e situação

Testes locais específicos aprovados em PGlite: migração sem alteração de linhas armazenadas, congelamento de encerrados, ausência automática com marcador legado falso, zero, dia atual, elegibilidade, calendário, modo absoluto configurado, sanção por auditoria e bloqueio de encerramento com avaliação pendente. Ensaiada exclusão de teste com voto e auditoria pendentes, preservação do original/perfis/brutos, backup de votos/eventos, rejeição de nomes duplicados, backup desatualizado e repetição após exclusão. Server Action rejeita operação `complete`; renderização do painel não mostra preparação mesmo com valor legado falso.

Lint dos oito arquivos de aplicação alterados aprovado. Suíte completa com **92 testes aprovados**, zero falhas ou pulados. TypeScript executado, sem aprovação devido aos erros anteriores do cliente Supabase em várias rotas; sem novo erro específico da retirada da preparação. Build não executado nesta entrega. `git diff --check` aprovado. Testes locais não comprovam execução remota ou concorrência real. Publicação, migração, backup/exportação e retirada remotos e aceite desta manutenção permanecem pendentes.
