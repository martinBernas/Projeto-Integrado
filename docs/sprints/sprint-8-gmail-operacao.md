# Sprint 8 — roteiro vigente para Gmail gratuito

24/10/2026 — Adaptação Gmail validada localmente: 134 testes completos aprovados, zero falhas/pulados, lint dos arquivos alterados e build/TypeScript aprovados. Inclui aceitação SMTP, sanitização de falhas, rejeição repetível, quarentena imediata de tentativa interrompida, proteção contra duplicidade e preservação integral da fila no incremento. Validador de backup sintético Gmail confirmou 24 seções e 82 definições; Nodemailer e fonte do PDF presentes no rastreamento de produção. Migração 002, captura/exportação/comparação novas, credenciais SMTP de relatórios, publicação/agendas e homologação ainda pendentes no ambiente remoto; nenhum envio real ou alteração na recuperação de senha. Migração 001 e comparação originais não devem ser repetidas.

Atualização de 24/10/2026. Substitui a configuração Resend/webhook do roteiro inicial. Usar a conta Gmail já existente, sem comprar domínio ou contratar plano. [Decisão e limites](../decisoes/adr-014-relatorios-gmail-sem-custo.md).

## Situação confirmada

Fechamento do avanço de 24/10/2026: Dono do produto confirmou teste e conformidade do modo escuro com o desejado; aceite funcional do tema registrado na sprint. Não permanece pendência geral de homologação do modo escuro. Acompanhamento remoto principal: observar retirada automática do segundo torneio a partir de 31/10 às 17:46 (São Paulo); demais evidências operacionais estão consolidadas no início do documento da sprint.

Referência para observação final: painel do segundo torneio isolado “Torneio Agendadp” apresentado em 24/10 confirma PDF gerado, 2/2 envios aceitos e retirada prevista para 31/10/2026 às 17:46 (São Paulo). Manter esse torneio até o prazo, sem retirada antecipada. Verificar desaparecimento para organizador/participantes após a próxima execução cron posterior ao instante efetivo (painel exibe minutos). Retirada automática continua aguardando evidência; não criar lembrete/monitoramento sem solicitação do Dono do produto.

Resposta HTTP confirmada em 24/10/2026: cinco chamadas pg_net de 20:55 a 21:15 UTC retornaram 200, sem timeout/erro, conforme resultado fornecido pelo Dono do produto. Resolvida a pendência de resposta HTTP do agendamento; funcionamento técnico das duas agendas verificado em conjunto com histórico cron. Não equivale a novo envio em cada chamada nem à retirada efetiva após uma semana, que permanece pendente no novo torneio de teste. Conferir o prazo exibido e PDF/envios desse torneio antes da observação final.

Execuções cron confirmadas pelo Dono do produto em 24/10/2026: retirada `succeeded` de 21:11 a 21:19 UTC e relatórios `succeeded` às 21:15 UTC. Retorno `1 row` não indica quantidade de retiradas/envios. Resposta HTTP do pg_net ainda pendente; sucesso SQL ao enfileirar não comprova HTTP 200 do worker. Retirada após prazo ainda não observada.

Agendas instaladas remotamente em 24/10/2026 conforme tabela fornecida pelo Dono do produto: job 2 de retirada por minuto e job 3 de relatórios a cada cinco minutos, ambos ativos. pg_net habilitado e nomes dos dois segredos Vault apresentados; valores não conferidos. Não repetir a criação das agendas. Verificar execuções cron e status HTTP do worker; agenda ativa não comprova sucesso HTTP nem retirada no prazo. Esta evidência substitui a pendência de instalação dos jobs nos registros anteriores.

Recebimento confirmado em 24/10/2026 pelo Dono do produto nas duas caixas do teste isolado; PDF fornecido também revisado nas três páginas. Fluxo manual de processamento de pendências validado neste cenário, sem comprovar disparo automático em novo encerramento. Próximas etapas: retirada antecipada do torneio de teste e configuração/verificação dos jobs; retirada automática ainda não homologada. Esta evidência resolve a pendência de recebimento do teste anterior.

Teste remoto de 24/10/2026: painel do torneio isolado “Teste reporte” apresentado pelo Dono do produto confirmou PDF gerado e aceitação Gmail 2/2. Substitui o estado anterior de falha no processamento. Conferência das caixas/anexos, conteúdo do relatório, retirada antecipada e instalação/execução de agendas ainda pendentes; aceitação SMTP não comprova recebimento. Causa exata do 42501 anterior não confirmada pela configuração, embora o fluxo tenha passado após orientação de conferência da chave.

Atualização de publicação em 24/10/2026: Dono do produto confirmou as variáveis cadastradas em Production, flag `false` e deploy pronto. Evidência informada pelo Dono do produto, sem URL/identificador da versão ou validação dos valores secretos. Próxima etapa: ativar a flag em Production, efetuar novo deployment para incorporar a alteração e testar encerramento em torneio isolado com destinatários de teste. Agendas e envio real ainda não confirmados. Esta atualização substitui a pendência de publicação inicial nos registros anteriores.

Atualização remota de 24/10/2026: migração 002 executada e comparação posterior pelo caminho de reutilização retornou `business_snapshot=preserved`, `report_queues=empty`, `gmail_reports=installed`. Backup original reaproveitado com conferências antes/depois; nova captura dispensada neste caminho. Pausa de gravações liberada. Próxima etapa: variáveis da hospedagem e publicação do código pelo fluxo do Dono do produto, mantendo `TOURNAMENT_REPORTS_ENABLED=false` até concluir a configuração. SMTP real, publicação desta versão, agendas e homologação permanecem pendentes. Esta atualização substitui as pendências de migração/comparação nos registros anteriores deste roteiro.

O Dono do produto executou a migração inicial 001 e a comparação retornou `business_snapshot=preserved`, `tournament_reports=installed`. Captura inicial `before-reports-20261024-v1`, exportação privada e seus checksums já foram validados. **Não repetir esses scripts nem a migração 001.** Gravações foram liberadas depois da comparação.

Incremento Gmail 002 preparado/testado localmente; ainda não aplicado remotamente. Não há SMTP de relatórios, publicação dessa versão, jobs ou envio real homologados. Verificações finais locais registradas na [sprint](sprint-8.md). A mudança do critério foi confirmada: aceitação de todos os envios pelo Gmail libera a condição de envio, sem comprovar entrega/leitura; PDF e demais bloqueios continuam obrigatórios.

## 1. Reutilização do backup original — caminho vigente

Evidência remota posterior em 24/10/2026: Dono do produto executou a migração 002 e informou `Success. No rows returned`. Execução concluída sem erro reportado; próxima etapa é repetir 00 para confirmar `preserved`, `empty`, `installed`. Manter gravações/worker pausados até esse resultado. Esta evidência substitui a pendência de aplicação de 002 nos registros anteriores; não confirma publicação nem envio SMTP.

Evidência remota de 24/10/2026: conferência anterior a 002 executada pelo Dono do produto retornou `preserved`, `empty`, `pending`. Backup original apto ao reaproveitamento neste caminho; próxima etapa é aplicar somente 002 e repetir 00. A pendência de conferência prévia descrita abaixo foi resolvida; comparação posterior e migração continuam pendentes.

24/10/2026 — O Dono do produto confirmou ausência de alterações desde a captura original. Reutilizar `before-reports-20261024-v1`, já exportado e validado (21 seções, 72 definições), mediante conferência SQL. Nova captura/exportação deixam de ser obrigatórias neste caminho; referências abaixo a essas pendências aplicam-se à alternativa.

Pausar gravações e manter relatórios/agendas desativados. Executar `web/supabase/operations/gmail-reports/00-verify-existing-backup.sql`: esperado `business_snapshot=preserved`, `report_queues=empty`, `gmail_reports=pending`. Após confirmação, aplicar somente a migração 002 e repetir esse mesmo script: esperado `preserved`, `empty`, `installed`. Só então liberar gravações. Não executar 03 neste caminho, pois exige a captura nova.

Se houver diferença ou fila preenchida, interromper o reaproveitamento e seguir a alternativa abaixo, sem sobrescrever o backup original. A conferência remota permanece pendente. A captura original contém funções anteriores a 001; a migração 001 preservada registra a etapa intermediária, mas não integra esse backup.

### Alternativa: backup novo se houver diferenças ou fila

1. Manter `TOURNAMENT_REPORTS_ENABLED=false` e pausar gravações durante captura, exportação, migração e comparação. Não reativar fila/agendas durante essa etapa.
2. No mesmo projeto Supabase, executar **somente** `web/supabase/operations/gmail-reports/01-backup-before-install.sql`. Referência nova: `before-gmail-reports-20261024-v1`. Inclui 24 seções (21 anteriores + filas/eventos) e definições de funções. O script recusa recaptura e incremento já instalado; não sobrescrever capturas existentes.
3. Executar `gmail-reports/02-export-backup-private.sql`. Salvar JSON completo em `backups/gmail-reports/`, ignorado pelo Git. Se houver embalagem de lista/coluna `backup`, preservar o original e normalizar somente a embalagem para obter o objeto. Pode conter PDF, endereços e votos: não publicar o conteúdo.
4. A partir de `web`, validar: `node scripts/verify-sprint8-backup.mjs "CAMINHO_PRIVADO_JSON"`. Exigir `verified=true`, 24 seções e ambos os MD5 canônicos iguais à captura. Registrar apenas ID/datas/checksums/contagens e SHA-256 do original.

## 2. Migração e comparação

Após exportação e validação, aplicar somente `web/supabase/migrations/202610240002_gmail_report_delivery.sql`. Não alterar a migração 001 já executada. Em seguida executar `gmail-reports/03-verify-after-install.sql`.

Retorno esperado: `business_snapshot=preserved`, `gmail_reports=installed`. Compara negócio e fila/eventos integralmente, sem exigir que a fila esteja vazia; verifica grants de conclusão SMTP e bloqueio do receptor antigo. Só depois retomar gravações. Diferença ou erro exige investigar, sem substituir a referência para obter sucesso.

## 3. Conta Gmail e variáveis da hospedagem

Reutilizar o endereço da conta exclusiva já usada no SMTP de Supabase Auth. Não modificar as configurações de recuperação de senha. A senha SMTP configurada no Supabase não aparece automaticamente no backend da aplicação.

Configurar na hospedagem, sem colar valores no chat ou no repositório:

| Variável | Valor/uso |
| --- | --- |
| `GMAIL_SMTP_USER` | Endereço Gmail/Googlemail exclusivo do projeto. |
| `GMAIL_SMTP_APP_PASSWORD` | Senha de aplicativo Google, nunca senha normal da conta. |
| `SUPABASE_REPORTS_SECRET_KEY` | Segredo somente servidor do mesmo projeto, com papel `service_role`, para RPCs de fila. |
| `CRON_SECRET` | Segredo aleatório com pelo menos 32 caracteres para o worker. |
| `TOURNAMENT_REPORTS_ENABLED` | Inicialmente `false`. Ativar somente após conferir migração/configuração. |

Senhas de aplicativo exigem verificação em duas etapas e podem não estar disponíveis em algumas contas. Se a senha SMTP existente não estiver disponível para uso seguro, gerar outra senha de aplicativo com nome específico para os relatórios, sem revogar a de recuperação. O Dono do produto realiza o login e a criação do segredo. Não criar conta nova nem comprar domínio. Não é necessário configurar remetente Resend, DNS ou webhook.

## 4. Publicação, teste e agendamento

Publicar a versão do servidor/tema pelo fluxo vigente e registrar URL/versão; não presumir publicação apenas pela migração. Conferir limite de duração de 60 segundos no plano atual, sem contratação automática. Ativar a flag somente no ambiente configurado e testar em torneio isolado, com contas e caixas de teste, preservando torneios legítimos.

Se os jobs ainda não existem, habilitar pg_net (disponível 0.20.4 segundo preflight); pg_cron e Vault já foram confirmados instalados. Configurar no Vault `geoguaras_report_worker_url` com URL HTTPS do deployment + `/api/tournament-reports` e `geoguaras_report_worker_secret` igual a `CRON_SECRET`. Executar o script atualizado `tournament-reports/04-schedule.sql` após o incremento 002 e sua comparação. Cria recuperação a cada cinco minutos e retirada SQL por minuto; não cria webhook.

Se os jobs já existirem, conferir os dois pelo nome e preservar a agenda, em vez de repetir 04; esse script recusa duplicação. Não alterar jobs/extensões de RF24. HTTP 200 do worker não prova envio de todos: conferir contadores por torneio, Enviados do Gmail e PDF recebido nas caixas de teste.

## 5. Homologação e recuperação

Diagnóstico: publicar a versão que registra `tournament_report_failure` e consultar Messages/Logs da requisição POST ao processar pendências. Cada entrada contém apenas etapa e código filtrado; não copiar segredos nem registrar erros brutos. HTTP 200 da Server Action pode acompanhar erro mostrado no formulário. `server_config` indica configuração do cliente Supabase; `gmail_config` indica validação local do endereço/senha presentes, sem testar autenticação SMTP; nome de RPC identifica erro do banco, `render_pdf` a renderização e `delivery` uma falha de envio/conclusão. Código `unclassified` exige investigação adicional e não prova erro de credencial. Estado remoto atual: teste com PDF pendente, 0/2, causa ainda indeterminada; nova publicação diagnóstica pendente.

- Conferir geração no encerramento, arquivo anexado, conteúdo, gráfico, empates e duplas. Mesma regra de destinatários: participantes presentes no encerramento, uma mensagem por participante.
- O contador “Envios aceitos pelo Gmail” aumenta apenas após resposta positiva para o destinatário e persistência da conclusão. Não corresponde a entrega/leitura. Todos os envios aceitos + PDF gerado + ausência de lease ativo continuam necessários à retirada.
- Falha comprovada antes de submeter a mensagem ou rejeição SMTP explícita pode ser repetida. Conexão/auth bloqueados mantêm o torneio e o erro normalizado; não divulgar erro SMTP bruto, pois pode conter endereço/credencial.
- Timeout durante DATA, confirmação perdida, estado contraditório ou lease interrompido tornam a tentativa `uncertain`, sem reenvio automático nem janela de 24h. Message-ID não deduplica SMTP.
- Para conciliar incerto, conferir mensagem pelo ID nos Enviados da conta do projeto e preservar evidência privada. Confirmado que foi aceita/enviada, ajustar somente a linha pertinente administrativamente com evidência e data. Ausência nos Enviados, isoladamente, não prova que não foi submetida. Não marcar sucesso ou reenviar para liberar retirada sem esclarecer a situação.
- Caso a gravação da conclusão tenha sido confirmada no banco mas a resposta se perca, a marcação de falha posterior não desfaz `sent`. Destinatários já concluídos não voltam à fila.
- Conferir retirada antecipada/automática e preservação de pontuações pessoais/outros torneios. Torneios anteriores à primeira migração continuam exigindo inclusão explícita, conforme roteiro inicial; não inscrever em lote.
- Confirmar que recuperação de senha continua funcionando e que Claro/Escuro/Sistema permanecem coerentes; não alterar SMTP Auth, templates ou redirecionamentos para testar relatórios.

Parar envios: flag false e pausar só o job `geoguaras-tournament-reports`. Isso não para retirada SQL de filas aptas: para suspender retiradas também, pausar `geoguaras-tournament-withdrawal`. Não remover extensões nem restaurar backup antigo sobre lançamentos novos.

## Evidências e pendências

Registrar captura/exportação/validação novas, migração 002/comparação, configuração sem valores secretos, URL/versão, execução dos jobs, envios em contas de teste e aceite. Estado inicial deste incremento: tudo remoto acima ainda pendente. Migração 001 e comparação originais continuam concluídas e válidas.
