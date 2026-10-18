# ADR-010 — Persistência limitada de métricas operacionais

Data: 18/10/2026. Situação: implementada localmente em S7-05 após o Dono do produto autorizar continuidade. Retenção/limites são escolhas técnicas do recorte proposto, não uma contratação ou garantia de quota do plano. Migração, configuração, agendamento e publicação remotos não realizados.

## Contexto

Os logs de `dashboard_query` não garantem histórico suficiente para diagnóstico semanal. A coleta não deve carregar dados de contas/pontuações nem tornar o funcionamento do painel dependente de telemetria. Não foram obtidos logs históricos nem acesso administrativo remoto para verificar quota/uso/custo do projeto.

## Decisão e fluxo

Reutilizar Supabase e as sete etapas já medidas: `session_claims`, `authentication`, `tournaments`, `personal_history`, `profile`, `tournament_rpc`, `audit_status`. `measureDashboardQuery` mantém resultados/exceções e logs existentes; um coletor opcional recebe somente etapa, duração, resultado e código. A página e o proxy de `/dashboard` criam coletores separados por requisição, sem estado global compartilhado entre contas.

`createDashboardMetrics` agenda um único callback `after` por contexto; a página agrega suas consultas em um lote e o proxy agrega sua etapa. Em operação normal são até duas chamadas de ingestão por abertura do painel, sem chamadas por indicador individual. Sem I/O de persistência aguardado no caminho da resposta. O callback é limitado por timeout de fetch de dois segundos, sem retries/fila durável. Falha de agendamento/escrita/configuração produz aviso constante sem payload/credencial; não muda o resultado original da aplicação. Logs normais continuam disponíveis. Medidas são de consultas/etapas, não tempo total percebido, usuários únicos ou cliques em Tentar novamente.

Persistência desativada por padrão (`OPERATIONAL_METRICS_ENABLED=false`). Quando habilitada, o módulo `server-only` usa um cliente Supabase independente, com chave secreta `SUPABASE_METRICS_SECRET_KEY`, sem cookies, persistência ou refresh de sessão. Não encaminha o token do jogador. Uma chave secreta corresponde a acesso privilegiado e nunca deve ser pública: [documentação oficial de chaves](https://supabase.com/docs/guides/getting-started/api-keys). Não solicitar, copiar para documentação ou versionar a chave real. O código usa o cliente somente para a RPC de ingestão.

## Dados, permissões e limites

Migração aditiva `202610180003_operational_metrics.sql` cria:

- `private.operational_metrics`: identidade técnica, instante UTC de conclusão, data UTC de recebimento derivada pelo banco, etapa, duração, resultado e código normalizado opcional. Sem identidades de conta/torneio, nomes, e-mails, pontuações, texto livre, cookies ou credenciais.
- `private.operational_metrics_days`: data de recebimento, total válido recebido, aceito e descartado pelo teto. Não conta transportes que não chegaram, configurações desativadas ou lotes rejeitados.
- `public.record_operational_metrics(jsonb)`: execução somente por `service_role`, sem concessão a `anon`/`authenticated`. `SECURITY DEFINER` com caminho fixo; valida array de 1–32 itens, chaves exatas, enumerações, código SQLSTATE/PGRST permitido, duração inteira 0–3.600.000 ms e instante UTC ISO dentro da janela, com tolerância de cinco minutos para relógio adiantado. Duração maior é limitada no adaptador; códigos não normalizados são omitidos. Campos extras rejeitam o lote inteiro.
- `private.purge_operational_metrics()`: somente acesso administrativo; remove exclusivamente dados dessas duas tabelas fora da retenção.

Tabelas com RLS e sem acesso direto para papéis clientes, inclusive `service_role`; apenas a função autorizada grava. Administrador pelo SQL Editor consulta. Nenhuma nova tela administrativa ou grant de leitura para organizadores comuns. A migração não altera dados/tabelas de negócio existentes.

Teto de **5.000 eventos aceitos por data UTC de recebimento**, prefixo de chegada sem preferência por erro/sucesso. Contadores e ingestão serializam por advisory lock transacional; `lock_timeout=250ms` limita espera por bloqueio. Saturação não aplica sanções nem interfere em dados de negócio. Contabiliza descartes pelo teto; falhas de transporte/timeout ficam sem contagem completa no banco e podem inclusive ter commit concluído sem confirmação. Sem garantia de entrega exata, deduplicação ou replay.

Retenção de **14 datas UTC**, incluindo hoje e as 13 anteriores. Data interna de recebimento alinha quota/expurgo e impede timestamps adiantados de ultrapassarem o teto de **70.000 eventos**, mais até 14 contadores. Expurgo por evento antigo ou recebimento antigo também ocorre antes de cada ingestão. Job horário de Supabase Cron necessário para expurgar sem tráfego; expiração pode aguardar a próxima execução (até cerca de uma hora, se job saudável). Exclusão física/vacuum e execução de jobs dependem do ambiente.

Script separado agenda somente `geoguaras-operational-metrics-purge`, recusa sobrescrever job existente e exige `pg_cron` habilitado. Também limpa registros de execução com mais de 14 dias **somente desse job**, preservando os demais. [Instalação](https://supabase.com/docs/guides/cron/install) e [agendamento/manutenção de histórico](https://supabase.com/docs/guides/cron/quickstart) oficiais. Não ativar coleta antes de confirmar agendamento.

## Consulta, custo e limitações

Relatório SQL administrativo das sete datas UTC recentes: contagem por etapa/resultado/código, taxa `(error+exception)/eventos gravados`, mediana/p95 em milissegundos e contadores de cobertura. `denied`/`empty` são separados. Taxa refere-se ao conjunto gravado, não a todo o uso; quota/perdas podem enviesar o conjunto. Não somar durações paralelas. Tamanho real de relações/índices informado no relatório.

Reutilizar o projeto não comprova custo zero: quota do plano, armazenamento, egress, computação, volume de chamadas e disponibilidade de Cron precisam ser conferidos pelo Dono do produto. Limite de linhas não é limite financeiro nem impede chamadas após atingir o teto. Sem serviço/plano novo contratado ou contratação paga autorizada. Eventos atuais só existem depois da ativação; não recuperam dados antigos.

## Verificação e implantação

Testes PGlite de permissões/validação, atomicidade do lote, quota/descarte, retenção e relatório; testes do adaptador para batching após resposta, payload mínimo, timeout, isolamento de falhas e desativação. Smoke de Next em produção local com fetch externo interceptado confirmou gravação das etapas do proxy e da autenticação após redirecionamento sem credenciais no evento. Cron real e efeito no desempenho/quota da produção ainda exigem homologação.

Procedimento de backup, comparação, migração, agenda, variáveis, relatório e reversão em [operação RF24](../sprints/sprint-7-metricas-operacao.md). Não há dados pessoais/versionamento de backup nesta entrega. Desligar a flag impede novas tentativas; não apagar dados de negócio ou remover a extensão Cron para reverter a coleta.
