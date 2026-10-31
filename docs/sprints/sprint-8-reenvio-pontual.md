# Reenvio administrativo pontual dos PDFs corrigidos

## Reenvio pontual concluído tecnicamente — 31/10/2026

Dono do produto apresentou o acompanhamento SQL após reativar os envios. Aztecas: 6 destinatários/6 `sent`; HCM: 18 destinatários/18 `sent`. Ambos com `pending=0`, `sending=0`, `failed=0`, `uncertain=0`, `lease_until=null` e `withdrawn_at=null`. Horários originais de geração e prazo de retirada mantidos.

Com a reativação 6/18 pendentes anteriormente apresentada, confirma aceitação SMTP dos 24 novos envios pelo fluxo existente, usando os PDFs corrigidos armazenados e conferidos. Não interpretar `sent` como prova de recebimento/leitura nas caixas. Nenhum novo teste de anexo recebido foi informado. Não repetir a reativação nem reexecutar envios concluídos.

Operação excepcional solicitada pelo Dono do produto atendida, sem nova funcionalidade, schema ou publicação. Correção, substituição de PDFs e reenvio técnico dos dois torneios concluídos. Evidência é o retorno SQL fornecido, sem consulta direta do agente. O primeiro resultado de `06-resend-status.sql` (identificação/contagem do backup operacional) não foi apresentado nesta mensagem; a preservação em `private.sprint8_backups` decorre da mesma transação do script de reativação executado e foi testada localmente, sem alegar nova conferência remota desse registro ou exportação privada adicional. Backups/evidências anteriores permanecem privados e fora do Git.

Não restam ações necessárias para disparar este reenvio. Eventual confirmação de recebimento/leitura e o ensaio independente de retirada automática são evidências distintas, não inferidas nem encerradas por esta consulta. Registros antigos abaixo de reenvio ainda não executado/aceitação pendente são históricos substituídos por esta conclusão. Nesta rodada somente atualização documental e `git diff --check`, sem alteração de código, novo envio ou repetição de testes funcionais.


## Reenvio reativado — 24 registros pendentes

31/10/2026 — Retorno SQL apresentado pelo Dono do produto confirma operação administrativa executada: Aztecas `34727be9-2447-4e7c-af41-e685b6db290b`, 6 destinatários, 6 pendentes e 0 `sent`; HCM `93c7e3c5-a676-42d4-83ca-05284cce0fff`, 18 destinatários, 18 pendentes e 0 `sent`. Geração mantida em `2026-10-31 03:21:13.879956+00`/`2026-10-31 03:22:45.052714+00` e retirada prevista em `2026-11-07 03:21:12.691942+00`/`2026-11-07 03:22:43.681343+00`, respectivamente.

Reativação dos 24 registros confirmada, sem alegar novo e-mail aceito ou recebido. O resumo é emitido dentro da transação antes do commit; o worker pode já ter avançado depois desse instante. Não executar novamente `05-force-resend-approved.sql`. Usar o botão existente “Processar envios pendentes” ou aguardar a agenda; processamento em lotes de até cinco destinatários por execução, com lease para exclusão mútua. Conferir `06-resend-status.sql`: operação/24 registros anteriores preservados no primeiro resultado e estados atuais dos dois torneios no segundo. O backup é gravado na mesma transação pelo script; o resultado de acompanhamento ainda precisa confirmar sua identificação/contagem, sem exportar endereços para a conversa.

Conclusão técnica do reenvio ainda pendente: Aztecas 6/6 e HCM 18/18 `sent`, sem pendentes/em envio/falhas/incertos. Erros/estados incertos exigem conciliação pelo procedimento existente, sem nova reativação em massa. Nenhuma alteração funcional nesta rodada, somente documentação e `git diff --check`. As pendências anteriores de executar a reativação estão resolvidas por este retorno; aceitação SMTP dos novos envios e eventual confirmação de recebimento/anexo são evidências separadas.


31/10/2026 — Solicitado explicitamente pelo Dono do produto após concluir a substituição dos PDFs. Decisão confirmada: forçar o reenvio de HCM e Aztecas pelo fluxo existente, sem implementar funcionalidade de reenvio. A operação ainda não foi executada remotamente nesta entrega.

## Escopo e decisão técnica

Alterar os 18 registros de envio HCM e os 6 de Aztecas de `sent` para `pending`, mantendo os PDFs v5 já armazenados, capturas, participantes, horários de geração e prazo de retirada. O gerador da aplicação e a interface não são alterados. Não há migração, nova tabela/RPC, grant ou necessidade de novo deployment. Esta solicitação é posterior e separada da correção já concluída; não reabre suas pendências.

Antes da alteração, a mesma transação grava as duas filas completas e os 24 registros anteriores em `private.sprint8_backups`, existente e protegida, sob ID `force-corrected-report-resend-20261031-v1`. Preserva IDs antigos, Message-IDs/provider IDs, datas e estados `sent`, com PDFs/capturas atuais. Não criar a tabela se estiver ausente. É backup operacional privado, não um novo histórico na interface. Dados e exportações permanecem fora do Git; a documentação contém apenas identificação da operação e contagens.

O remetente atual deriva o `Message-ID` do UUID do registro de envio. Renovar esses UUIDs evita reutilizar a identidade da mensagem anterior; preservar jogador/e-mail/torneio e limpar `first_attempt_at`, `sent_at` e `provider_id` somente nos registros ativos recolocados em fila. Assunto e texto do e-mail continuam os existentes; o anexo será o PDF corrigido v5. Não acrescentar funcionalidade nem alterar o template para retificação nesta operação.

## Execução autorizada

1. Executar uma única vez `web/supabase/operations/report-score-correction/05-force-resend-approved.sql` como administrador no SQL Editor. Não é necessário pedir novamente autorização geral: o Dono do produto já solicitou o reenvio dos dois torneios.
2. A transação bloqueia torneios, filas e destinatários; recusa PDF/captura divergentes, ausência de relatório, retirada, lease ativo, contagens diferentes de 18/6, e-mail ausente ou estado diferente de `sent`. Salva backup antes de recolocar os envios em fila. Qualquer erro impede alterações parciais; se o editor mantiver transação aberta, finalizar rollback antes de investigar.
3. Resumo dentro da transação deve mostrar HCM com 18 pendentes e Aztecas com 6 pendentes, ambos com zero `sent`. Geração/PDF/prazo não são redefinidos. Não repetir o script: a chave do backup bloqueia rearmar o mesmo reenvio mesmo depois de terminar ou durante progresso parcial.
4. Após commit, a agenda existente pode começar imediatamente na execução seguinte. O organizador também pode usar “Processar envios pendentes” na plataforma. Cada execução envia até cinco destinatários; repetir o processamento normal ou aguardar as próximas execuções, sem repetir a reativação administrativa. O lease mantém a exclusão mútua entre botão/worker.
5. Acompanhar `06-resend-status.sql`, somente leitura. Primeiro resultado deve registrar a operação e 24 envios anteriores preservados; segundo mostra os estados atuais. Conclusão técnica esperada: HCM 18/18 e Aztecas 6/6 `sent`, zero pendentes/em envio/falhas/incertos. `sent` significa aceitação SMTP, não recebimento/leitura. Conferência de caixa/anexo é evidência separada.

Envio incerto continua bloqueado pelo tratamento SMTP existente e exige conciliação, não nova reativação em massa. Retirada permanece bloqueada enquanto os novos envios não concluírem; `due_at` original não muda. Outros torneios e o ensaio de retirada não são alvos. O script não executa chamada HTTP/SMTP diretamente: habilita a fila que já é processada pela aplicação publicada.

## Verificações locais e situação

Dois testes SQL em PGlite aprovados: backup dos 24 registros/IDs antigos, preservação integral das filas e de outro torneio, novos IDs/estados/timestamps corretos, reconhecimento pelo `claim_tournament_report` já publicado, conclusão simulada de uma nova mensagem e recusa de reexecutar a operação. Cenários de falha verificam atomicidade quando mudam PDF, captura, estado de envio, endereço, retirada ou lease. Testes não enviam e-mails reais. Lint do teste sem erros/avisos; `git diff --check` aprovado.

Código funcional, template e integrações não alterados; build/suíte da aplicação já registrados na correção anterior não foram repetidos sem alteração desses componentes. Execução administrativa remota, progresso e aceitação dos 24 novos envios ainda pendentes de evidência. A documentação será atualizada com o retorno do Dono do produto, sem endereços ou conteúdo de backup.
