# Sprint 8 — backup, ativação, verificação e recuperação

## Roteiro vigente substituído — Gmail em 24/10/2026

**Para continuar, usar [roteiro Gmail gratuito](sprint-8-gmail-operacao.md).** Migração 001 e comparação originais já concluídas. Não repetir seus scripts nem configurar Resend/webhook conforme as instruções iniciais abaixo, agora históricas. A adaptação SMTP requer somente o novo incremento 002 e seus scripts em gmail-reports, após backup novo. [ADR-014](../decisoes/adr-014-relatorios-gmail-sem-custo.md).

## Registro operacional e roteiro inicial — histórico

24/10/2026 — Localizado registro anterior em docs/sprints/operacao-2026-09-23.md, seção Validação posterior e recuperação entre aparelhos: Dono do produto configurou envio por Gmail e confirmou funcionamento da solicitação/abertura do link de recuperação no Chrome. web/README.md documenta configuração SMTP de autenticação no Supabase. Essa evidência substitui a suposição de inexistência de configuração Gmail no projeto; não comprova validade atual das credenciais nem envio de relatórios. Reaproveitar a conta e o arranjo SMTP como base para RF19, sem criar conta/domínio e sem modificar a recuperação de senha. Credenciais não lidas/expostas. Critério de sucesso SMTP versus entrega externa ainda não confirmado; adaptação de RF19 ainda não implementada. Migração/comparação anteriores permanecem concluídas.

24/10/2026 — Dono do produto informou que já existe uma conta Gmail exclusiva do projeto. Considerar essa conta na avaliação de envio sem domínio próprio/custo monetário adicional; não solicitar criação de outra conta. Endereço e credenciais não foram fornecidos nem registrados. Autenticação e disponibilidade da senha de aplicativo ainda não verificadas. A adoção técnica do Gmail e eventual alteração do critério de sucesso de entrega ainda exigem alinhamento; não dispensar a proteção de retirada. Migração/comparação RF19 já concluídas permanecem válidas; Resend não ativado, nenhum envio real realizado.

24/10/2026 — Dono do produto definiu restrição de custo monetário zero: projeto sem fins lucrativos, sem interesse em investir dinheiro. Não possui conta Resend e informou apenas o endereço geoguaras.vercel.app, que não fornece controle DNS para verificar remetente no Resend. Não contratar plano, comprar domínio ou presumir serviço pago. A ativação de e-mail via Resend fica suspensa enquanto se avalia alternativa gratuita sem domínio próprio; não altera a migração/comparação já concluídas nem autoriza dispensar os relatórios/envios exigidos para retirada. Nenhuma alternativa de provedor ou mudança do critério de sucesso de envio foi confirmada ainda; implementação existente permanece local, sem envio/retirada real.

24/10/2026 — Comparação remota pós-migração RF19 confirmada pelo Dono do produto: business_snapshot=preserved e tournament_reports=installed. As 21 seções foram comparadas à captura before-reports-20261024-v1 na data de referência, com filas/eventos novos vazios. Backup/exportação/validação, migração e comparação concluídos; não repetir os scripts 01–03 nem a migração. Pausa nas gravações pode terminar. Próxima etapa: configurar provedor/remetente, segredos de servidor e webhook, publicar a interface/servidor e ativar agendas conforme roteiro, mantendo geração/envio desabilitados até a configuração conferida. Nenhum envio ou retirada real, configuração remota, publicação ou homologação da Sprint 8 confirmados nesta etapa; nenhuma operação remota realizada pelo agente.

24/10/2026 — Dono do produto informou “Success. No rows returned” após executar 202610240001_tournament_reports.sql. Execução remota da migração RF19 confirmada pelo relato; não reaplicar. Backup/exportação privados e checksums já validados. Próximo passo executar 03-verify-after-install.sql e exigir business_snapshot=preserved e tournament_reports=installed, mantendo pausa nas gravações até a comparação. Preservação pós-migração, configuração/ativação dos serviços, publicação e homologação ainda não confirmadas. Nenhuma operação remota realizada pelo agente.

24/10/2026 — Exportação privada pré-migração RF19 recebida e validada localmente: before-reports-20261024-v1, 21 seções e 72 definições de funções. Validador em PGlite recalculou os MD5 canônicos iguais à captura: snapshot=37569d6c293eae9933e4883f4bfb6535, funções=d824fdd90f677a7ff7c6ef317235799c. Original preservado em backups/tournament-reports/before-reports-20261024-v1-export-original.txt, SHA-256=4f46ce0fbf4d6a87278aab06e2e4526091a032279ebe4c62a1da487e0aa1eacd; JSON normalizado em before-reports-20261024-v1.json na mesma pasta, ambos ignorados pelo Git. Removida apenas a embalagem da exportação (lista/coluna backup), sem alterar seu conteúdo. Captura/exportação/validação concluídas; não repetir nem sobrescrever. Próximo passo aplicar somente 202610240001_tournament_reports.sql e executar comparação 03 antes de retomar gravações. Migração, comparação, ativação e homologação remotas ainda não confirmadas; nenhuma operação remota realizada pelo agente. Nenhum conteúdo pessoal, voto ou segredo reproduzido.

24/10/2026 — Captura pré-migração RF19 confirmada pelo Dono do produto: before-reports-20261024-v1, captured_at=2026-10-24 19:14:49.161879+00 (16:14:49 em São Paulo), as_of=2026-10-24, snapshot_md5=37569d6c293eae9933e4883f4bfb6535, functions_md5=d824fdd90f677a7ff7c6ef317235799c. Preflight relatado: estrutura/fila e tabela de backup ausentes antes da captura; pg_cron 1.6.4 e supabase_vault 0.3.1 instalados, pg_net 0.20.4 disponível e ainda não instalado. Não repetir nem sobrescrever a captura. Próximo passo exportação privada completa e validação antes de migrar; exportação, validação, migração e comparação ainda não confirmadas. Manter pausa nas gravações. Nenhum dado pessoal, voto ou segredo registrado nesta evidência; operações remotas realizadas pelo Dono do produto.

Situação em 24/10/2026: implementação e verificações locais; nenhuma migração remota, configuração de provedor, envio real, retirada de torneio real ou publicação realizada pelo agente. Não executar novamente migrações das sprints anteriores. Este roteiro cobre somente `202610240001_tournament_reports.sql`.

## Preparação e backup

1. Identificar projeto Supabase e ambiente de hospedagem corretos. Conferir disponibilidade/quotas de pg_cron, pg_net e Vault e limite de duração de 60 segundos na hospedagem. Conferir custos e remetente/domínio de e-mail antes de ativar. Nenhuma contratação está autorizada por este roteiro.
2. Manter `TOURNAMENT_REPORTS_ENABLED=false` durante instalação e comparação. Pausar gravações de negócio até a conferência pós-migração.
3. Executar `web/supabase/operations/tournament-reports/01-backup-before-install.sql`. Captura nova `before-reports-20261024-v1`: 20 tabelas de negócio/histórico e resultado calculado na mesma data de referência, totalizando 21 seções, além das definições de funções. Recusa instalação já existente e sobrescrita. Não reutilizar o backup da Sprint 7.
4. Executar `02-export-backup-private.sql` e exportar o JSON completo para `backups/tournament-reports/`, ignorado pelo Git. Não compartilhar o conteúdo no chat: contém dados pessoais e votos secretos. Validar com `node scripts/verify-sprint8-backup.mjs "CAMINHO_PRIVADO_JSON"`, a partir de `web`. O comando imprime apenas resultado e contagens; exige 21 seções e compara os dois MD5 canônicos em PostgreSQL/PGlite. Registrar referência, data e checksums sem conteúdo privado. Preservar também o backup habitual de Supabase/Auth; essa captura não é backup integral da plataforma.
5. Aplicar somente a nova migração `202610240001_tournament_reports.sql`.
6. Executar `03-verify-after-install.sql` antes de qualquer uso. Exigir `business_snapshot=preserved`, `tournament_reports=installed`; filas/eventos devem estar vazios. Diferença exige investigar antes de retomar gravações. Não sobrescrever a referência para fazer uma comparação passar.

## Provedor, variáveis e webhook

Configurar valores reais somente nos gerenciadores de segredos. O arquivo `.env.local.example` contém nomes e valores vazios, nunca credenciais reais.

| Variável | Uso |
| --- | --- |
| `SUPABASE_REPORTS_SECRET_KEY` | Chave exclusivamente servidor do mesmo projeto, com papel `service_role`, para RPCs privadas de processamento. Cliente separado de cookies e da métrica RF24. |
| `RESEND_API_KEY` | Chave de envio do provedor Resend. |
| `TOURNAMENT_REPORT_FROM` | Remetente no domínio verificado; manter estável durante tentativas de uma mesma mensagem. |
| `RESEND_WEBHOOK_SECRET` | Segredo `whsec_...` do endpoint de webhook. |
| `CRON_SECRET` | Segredo aleatório com pelo menos 32 caracteres para o worker agendado. |
| `TOURNAMENT_REPORTS_ENABLED` | Ativar `true` somente depois da migração e da configuração conferidas. |

Criar no Resend o webhook HTTPS `/api/tournament-reports/webhook`, inscrito em `email.delivered`, `email.bounced` e `email.failed`. A assinatura e o timestamp são obrigatórios; chamadas sem autenticação recebem 401, configuração ausente recebe 503. Não utilizar envio de teste a participantes legítimos para homologar. A flag false mantém a coleta de relatórios do banco, mas desliga geração/envio do worker; não desativa o job SQL de retirada de filas já entregues.

Publicar a interface e servidor pelo fluxo do ambiente; registrar URL/versão. Nenhuma publicação é presumida pelo sucesso da migração. Sem chave/remetente/webhook funcionais, o torneio pode encerrar com fila pendente, mas a retirada permanece bloqueada. Ativar a flag e validar em torneio isolado, com contas e caixas de e-mail de teste.

## Agendamento

Habilitar pg_cron e pg_net se disponíveis no projeto, preservando extensões/jobs de RF24. No Vault, criar exatamente um segredo de cada nome:

- `geoguaras_report_worker_url`: URL HTTPS do deployment seguida de `/api/tournament-reports`.
- `geoguaras_report_worker_secret`: mesmo valor de `CRON_SECRET`.

Não versionar valores nem capturas da tela de segredos. Executar `04-schedule.sql` após a comparação e configuração. Recusa jobs existentes; não substitui silenciosamente agendas. Cria:

- `geoguaras-tournament-withdrawal`: a cada minuto, SQL local, até 100 torneios vencidos elegíveis.
- `geoguaras-tournament-reports`: a cada cinco minutos, pg_net chama worker protegido, uma fila e até cinco destinatários por execução.

O retorno de `net.http_get` é um ID de requisição assíncrona, não prova de processamento. Conferir respostas HTTP de pg_net, estado do job e evolução de contadores. Falha deve permanecer observável em `05-status.sql`; consultar logs técnicos de hospedagem/provedor sem divulgar payloads ou segredos. Jobs por minuto/cinco minutos geram histórico próprio de execuções: acompanhar crescimento e política de retenção do ambiente. Nenhum expurgo de histórico de outros jobs é incluído.

## Homologação obrigatória em ambiente isolado

1. Encerrar torneio de teste após o último dia, sem pendências. Conferir congelamento e captura única; repetir chamada não deve gerar outra fila.
2. Receber o PDF anexado em cada caixa de teste: classificação final, gráfico por data, empates e todas as duplas líderes. Conferir a tabela numérica e nomes com acentos. O exemplo local usa somente dados sintéticos.
3. Validar que aceitação HTTP do provedor ainda não libera retirada; webhook `email.delivered` deve aumentar o contador de entregas. Falha/ausência de confirmação bloqueia ambos os caminhos de retirada. Confirmar evento repetido e fora de ordem sem duplicar destinatários.
4. Solicitar nova tentativa como organizador: não reenvia entregas já concluídas. Perfil comum/anônimo/outro organizador não consegue processar, consultar status alheio ou retirar. Não há download do PDF por rota da aplicação.
5. Retirar antecipadamente um torneio de teste com entregas concluídas. Conferir ausência nas listas, notificações e URLs diretas; comparar pontuações pessoais, outros torneios e dados compartilhados com a referência. Fila deve ter `snapshot=null`, `pdf_base64=null` e endereços nulos.
6. Validar o prazo automático de 168 horas em ambiente controlado, sem mudar relógio/dados de torneios reais. Conferir job SQL retirando somente vencidos com todas as entregas e sem lease ativo. Testar duas sessões PostgreSQL reais de worker/retirada/webhook; PGlite não comprova esse cenário.
7. Claro/Escuro/Sistema: testar em computador/celular/teclado, persistência após recarregar e troca entre abas, preferência do sistema e contraste de rankings/gráficos/avisos/formulários. Testar áreas autenticadas com contas de teste. A revisão visual local de início/login não substitui homologação de todas as telas.

## Torneios encerrados antes da migração

Não são inscritos automaticamente. Sua tela informa ausência de relatório. Para incluir um torneio legado, conferir explicitamente ID, estado, vínculos, resultados e caixas destinatárias, obter decisão do Dono do produto para aquele torneio real e preservar backup/exportação privados. Somente então o acesso administrativo pode executar:

```sql
select private.prepare_tournament_report('UUID_CONFIRMADO_DO_TORNEIO'::uuid);
```

O helper privado exige encerrado, bloqueia a linha e é idempotente. Não altera `closed_at` nem recalcula resultados. O prazo permanece `closed_at + 168 horas`: se vencido, a retirada poderá ocorrer assim que todas as entregas forem confirmadas e não houver worker ativo. O relatório legado será gerado no processamento atual; não declarar geração no encerramento original. Não executar em lote nem registrar esse passo como realizado sem evidência.

## Falhas e recuperação operacional

- `pending`: ainda não tentou; endereço ausente mantém bloqueio e sinaliza erro, sem omitir participante.
- `sending`: chamada pode ter sido aceita sem retorno/persistência. Repetir apenas dentro da janela de idempotência e com o mesmo destinatário/PDF/remetente. Após 23 horas, passa a `uncertain` e deixa de ser reenviado automaticamente.
- `accepted`: API aceitou, aguardando evento de entrega. Não reenviar. Conferir webhook e, se necessário, solicitar replay do evento no provedor.
- `sent`: evento de entrega confirmado. Não reenviar nem tentar inferir leitura.
- `uncertain`: erro de entrega ou tentativa ambígua fora da janela. Conferir no provedor usando ID/chave de idempotência, preservar evidência privada e conciliar administrativamente. Não marcar sucesso para liberar a retirada sem evidência.

Se houve entrega comprovada, corrigir associação com o ID do provedor e solicitar replay assinado de `email.delivered`. Para falha definitiva comprovada que exija corrigir endereço e enviar novamente, conferir conta destinatária, registrar motivo/evidência e realizar nova tentativa administrativa com novo ID de entrega, zerando ID de provedor e primeira tentativa apenas naquela linha não concluída. Essa intervenção não tem botão de dispensa; revisar efeitos e autorização antes de atuar. Manter o torneio visível enquanto não resolvido.

Configuração indisponível, quota excedida, PDF acima de 8 MB também bloqueia a retirada. A fonte não cobre todo Unicode: conferir nomes/glifos durante homologação. Worker retoma o PDF já salvo e não recalcula sobre dados pessoais posteriores. Nova tentativa na interface não é prova de entrega: conferir os contadores e o webhook.

Para parar novas gerações/envios, desativar a flag e pausar somente `geoguaras-tournament-reports`. Para suspender também retiradas já aptas, pausar somente `geoguaras-tournament-withdrawal`; a flag não o interrompe. Não remover pg_cron, pg_net ou jobs de RF24. Tema independe dessas configurações.

Não restaurar backup antigo sobre lançamentos legítimos posteriores. Recuperação deve respeitar o estado atual e referências compartilhadas. A retirada lógica preserva dados originais internamente; reativação excepcional exige procedimento administrativo e decisão específica, sem disponibilizar novamente PDF limpo nem fingir reversão de e-mails já enviados.

## Evidências a registrar

Referência/checksums e validação do backup, resultado da migração/comparação, jobs ativos e execuções, URL/versão, remetente/domínio verificados sem segredo, eventos de teste/contadores, PDF conferido, preservação após retirada e aceite do Dono do produto. Situação inicial desta entrega: todos os itens remotos pendentes; nenhuma evidência remota nova foi fornecida.
