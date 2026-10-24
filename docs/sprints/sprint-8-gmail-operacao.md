# Sprint 8 — roteiro vigente para Gmail gratuito

24/10/2026 — Adaptação Gmail validada localmente: 134 testes completos aprovados, zero falhas/pulados, lint dos arquivos alterados e build/TypeScript aprovados. Inclui aceitação SMTP, sanitização de falhas, rejeição repetível, quarentena imediata de tentativa interrompida, proteção contra duplicidade e preservação integral da fila no incremento. Validador de backup sintético Gmail confirmou 24 seções e 82 definições; Nodemailer e fonte do PDF presentes no rastreamento de produção. Migração 002, captura/exportação/comparação novas, credenciais SMTP de relatórios, publicação/agendas e homologação ainda pendentes no ambiente remoto; nenhum envio real ou alteração na recuperação de senha. Migração 001 e comparação originais não devem ser repetidas.

Atualização de 24/10/2026. Substitui a configuração Resend/webhook do roteiro inicial. Usar a conta Gmail já existente, sem comprar domínio ou contratar plano. [Decisão e limites](../decisoes/adr-014-relatorios-gmail-sem-custo.md).

## Situação confirmada

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
