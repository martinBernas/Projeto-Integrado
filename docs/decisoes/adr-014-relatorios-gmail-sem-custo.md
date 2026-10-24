# ADR-014 — Relatórios pelo Gmail existente, sem domínio ou serviço pago

Data: 24/10/2026. Situação: decisão funcional confirmada pelo Dono do produto; adaptação implementada localmente, migração incremental/configuração/homologação remotas pendentes.

## Contexto

O Dono do produto definiu custo monetário zero e informou conta Gmail exclusiva, já usada no SMTP de recuperação de senha. O registro de 23/09 confirma configuração Gmail e funcionamento da solicitação/abertura do link; não comprova validade atual das credenciais. A escolha inicial Resend não considerou esse recurso e dependia de domínio verificável inexistente no projeto. O endereço geoguaras.vercel.app continua sendo o site, sem necessidade de comprar domínio para este envio.

A migração inicial `202610240001_tournament_reports.sql` e sua comparação já foram executadas e confirmadas pelo Dono do produto. Não editar/reaplicar essa migração para trocar o transporte. Esta ADR substitui as partes de e-mail, confirmação e repetição da [ADR-013](adr-013-relatorios-e-retirada-de-torneios.md); captura, PDF, permissões de organizador, tema, prazo e retirada lógica continuam válidos.

## Decisão confirmada

O Dono do produto aceitou considerar concluído o envio quando o Gmail aceitar a mensagem para encaminhamento. Não equivale a entrega na caixa de entrada ou leitura, e falhas posteriores podem gerar devoluções. PDF gerado e todos os destinatários com envio aceito continuam sendo condições obrigatórias para retirar; erros e resultados incertos bloqueiam retirada automática e antecipada.

## Implementação

- Nodemailer, SMTP fixo `smtp.gmail.com:465`, TLS desde a conexão, certificado verificado e TLS mínimo 1.2. Sem serviço externo de geração do PDF, Resend, domínio próprio ou webhook de entrega.
- Remetente/envelope é a própria conta `GMAIL_SMTP_USER` (@gmail.com/@googlemail.com). `GMAIL_SMTP_APP_PASSWORD` é segredo somente servidor, sem senha normal, autenticação de jogador ou captura de credencial no código. O transporte aceita apenas o servidor Gmail, evitando enviar credenciais a host arbitrário por configuração.
- Cada destinatário recebe uma mensagem individual com PDF em memória, sem buscar anexos por URL/arquivo. Logs/debug SMTP desativados; erros são reduzidos a categoria segura, sem endereço, resposta SMTP livre ou credenciais.
- Timeout de conexão/DNS de oito segundos, inatividade de dez e limite total de doze por envio, fechando o transporte na conclusão/falha. Lote e orçamento de processamento existentes permanecem; a configuração de 60 segundos da hospedagem deve ser conferida no plano atual, sem contratar plano automaticamente.

`202610240002_gmail_report_delivery.sql` cria RPCs exclusivas de `service_role`: início, conclusão SMTP e falha. Aceitação positiva para o único destinatário e Message-ID retornado permitem `complete_gmail_tournament_delivery` registrar `sent`/`sent_at`; esses campos passam a significar aceitação pelo Gmail. Não converter estados `accepted` do desenho antigo automaticamente em sucesso.

### Estados e duplicidade

Fluxo normal: `pending` → `sending` → `sent`. Falha comprovadamente anterior à submissão ou rejeição SMTP explícita leva a `failed`, permitindo tentativa posterior. Erro de autenticação/conexão antes de DATA, rejeição de destinatário ou resposta negativa 4xx/5xx em DATA são casos repetíveis. Timeout durante DATA, perda de confirmação, estado contraditório ou erro sem fase comprovada leva a `uncertain`, bloqueando nova tentativa automática.

SMTP não oferece a chave idempotente do Resend. Message-ID estável é apenas referência de conciliação, sem garantia de deduplicação pelo Gmail. Ao recuperar uma fila após lease expirado, todo `sending` remanescente vira imediatamente `uncertain`; a janela antiga de 23/24 horas deixa de autorizar repetição. Isso evita reenviar após o Gmail ter aceitado uma mensagem cuja confirmação se perdeu.

Se o Gmail aceitou e a gravação no banco falhou, manter incerto e conciliar pelos Enviados/Message-ID com evidência privada. Se a conclusão já foi gravada mas o retorno se perdeu, a marcação posterior de falha não desfaz `sent`. Nenhuma dispensa automática de participante ou sucesso fictício para liberar retirada.

### Compatibilidade e implantação

Migração incremental modifica apenas funções/grants; preserva dados de negócio, filas, PDF e eventos existentes. RPCs antigas de início/conclusão Resend e recepção de evento perdem execução para `service_role`, fazendo versões antigas falharem antes de enviar. A rota legada de webhook retorna 410 e não modifica estado; a tabela antiga de eventos permanece interna, sem novas escritas pelo fluxo atual.

O scheduler continua com dois jobs: processamento via endpoint com bearer/Vault e retirada SQL. Não há endpoint/segredo Resend a cadastrar. Script 04 agora exige também a migração SMTP antes de criar os jobs. A flag permanece desligada até aplicar/comparar o incremento e configurar o Gmail. Uma nova captura inclui 24 seções: as 21 anteriores e as três tabelas da fila/eventos. Não reutilizar nem sobrescrever a captura inicial já validada.

Não alterar o SMTP de Supabase Auth, templates, redirecionamentos ou senha usada na recuperação existente. O backend dos relatórios precisa de configuração própria na hospedagem, mesmo usando a mesma conta. Se necessário, o Dono do produto pode gerar uma senha de aplicativo separada para relatórios, sem revogar a de Auth. Revalidar recuperação de senha e envio em contas de teste na homologação.

## Limites

Conta gratuita tem quotas e restrições antispam; o funcionamento histórico do SMTP Auth não garante aceitação do novo servidor de hospedagem. Gmail pode bloquear origem, exceder quota ou devolver e-mail depois de aceitá-lo. Custo zero significa não contratar serviço/domínio para este fluxo; observar também os limites dos planos já usados de hospedagem/Supabase.

Falhas definitivas podem ser repetidas; ambíguas exigem conciliação administrativa com evidência, preservando bloqueio. Sem garantia de exatamente uma entrega, chegada à caixa ou leitura. A migração inicial instalada não torna a versão Gmail operacional sem o novo incremento e variáveis.

## Evidências locais

134 testes completos aprovados, sem falhas/pulados; lint e build/TypeScript aprovados. Testes cobrem SMTP simulado (sem rede/credenciais reais), incremento SQL em PGlite, preservação da fila e cenários de repetição/incerteza. Exportação/validador de captura sintética confirmaram 24 seções e 82 definições. Inclusão de Nodemailer/fonte no rastreamento de produção verificada. Não há envio real, configuração de conta ou execução remota da migração 002; homologação SMTP no servidor real e concorrência PostgreSQL real permanecem pendentes.

## Referências

- [SMTP e senhas de aplicativo do Google](https://support.google.com/accounts/answer/185833?hl=pt-BR)
- [Gmail: SMTP](https://developers.google.com/workspace/gmail/imap/imap-smtp)
- [Limites da conta Gmail](https://support.google.com/mail/answer/22839?hl=pt-BR)
- [Nodemailer: transporte, TLS, timeouts e restrição de anexos](https://nodemailer.com/smtp)
- [Roteiro vigente](../sprints/sprint-8-gmail-operacao.md)
