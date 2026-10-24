# ADR-013 — Relatório final, entrega confirmada e retirada de torneios

24/10/2026 — Transporte Resend, webhook de entrega e repetição por chave/janela foram substituídos pela [ADR-014 — Gmail existente sem custo](adr-014-relatorios-gmail-sem-custo.md), conforme novo critério confirmado pelo Dono do produto. Captura, PDF e retirada lógica continuam válidos. Migração 001 já instalada/comparada; adaptação incremental 002 ainda não aplicada remotamente. A descrição Resend abaixo é histórica.

24/10/2026 — Localizado registro anterior em docs/sprints/operacao-2026-09-23.md, seção Validação posterior e recuperação entre aparelhos: Dono do produto configurou envio por Gmail e confirmou funcionamento da solicitação/abertura do link de recuperação no Chrome. web/README.md documenta configuração SMTP de autenticação no Supabase. Essa evidência substitui a suposição de inexistência de configuração Gmail no projeto; não comprova validade atual das credenciais nem envio de relatórios. Reaproveitar a conta e o arranjo SMTP como base para RF19, sem criar conta/domínio e sem modificar a recuperação de senha. Credenciais não lidas/expostas. Critério de sucesso SMTP versus entrega externa ainda não confirmado; adaptação de RF19 ainda não implementada. Migração/comparação anteriores permanecem concluídas.

24/10/2026 — Dono do produto informou que já existe uma conta Gmail exclusiva do projeto. Considerar essa conta na avaliação de envio sem domínio próprio/custo monetário adicional; não solicitar criação de outra conta. Endereço e credenciais não foram fornecidos nem registrados. Autenticação e disponibilidade da senha de aplicativo ainda não verificadas. A adoção técnica do Gmail e eventual alteração do critério de sucesso de entrega ainda exigem alinhamento; não dispensar a proteção de retirada. Migração/comparação RF19 já concluídas permanecem válidas; Resend não ativado, nenhum envio real realizado.

24/10/2026 — Dono do produto definiu restrição de custo monetário zero: projeto sem fins lucrativos, sem interesse em investir dinheiro. Não possui conta Resend e informou apenas o endereço geoguaras.vercel.app, que não fornece controle DNS para verificar remetente no Resend. Não contratar plano, comprar domínio ou presumir serviço pago. A ativação de e-mail via Resend fica suspensa enquanto se avalia alternativa gratuita sem domínio próprio; não altera a migração/comparação já concluídas nem autoriza dispensar os relatórios/envios exigidos para retirada. Nenhuma alternativa de provedor ou mudança do critério de sucesso de envio foi confirmada ainda; implementação existente permanece local, sem envio/retirada real.

Data: 24/10/2026. Situação: escolhas técnicas implementadas localmente na Sprint 8; migração, ativação remota e homologação pendentes.

## Contexto e decisões do Dono do produto

Encerrar e congelar já existem. O Dono do produto selecionou RF19 e modo escuro para a Sprint 8. Confirmou relatório geral em PDF gerado no encerramento e enviado imediatamente aos participantes; gráfico de evolução das posições e duplas com mais inversões, ignorando empates intermediários sem inversão; retirada automática após uma semana, antecipável pelo organizador somente depois de encerrar; bloqueio de qualquer retirada até gerar o relatório e concluir todos os envios; depois da retirada, PDF apenas nos e-mails. Relatórios individuais são RF25 futuro.

## Escolhas técnicas da implementação

### Captura e processamento

A transação existente de encerramento recalcula e congela resultados. Um trigger `AFTER UPDATE OF closed_at` chama `private.prepare_tournament_report`, gravando uma única captura imutável com nome público, elegibilidade e resultados finais por participante/data. Captura e destinatários são atômicos com o encerramento: falha da captura desfaz a transação. O PDF é gerado no servidor logo após a confirmação do banco e antes do retorno normal da ação; falha operacional mantém encerramento e fila para recuperação, sem declarar PDF concluído.

`private.tournament_reports` guarda captura, PDF base64 temporário, `generated_at`, prazo, lease/token, próxima tentativa, erro normalizado e retirada. `private.tournament_report_deliveries` guarda um destinatário por participante, endereço privado, estado, primeira tentativa e ID do provedor. Endereços e captura não são retornados às contas da aplicação. O organizador consulta apenas contadores e estado do próprio torneio.

PDFKit e fonte Ubuntu Regular incorporada geram o documento sem serviço remoto de renderização; fonte e licença acompanham o repositório. Gráficos vetoriais por até 20 datas novas por página (a página seguinte repete uma data para continuidade), todas as séries, classificação e tabela equivalente por grupos de seis participantes. Primeiro lugar no topo. Pontos aplicados são acumulados por data sobre o estado final, e não sobre antigas telas anteriores às correções. Os participantes são os vínculos presentes no encerramento; não reconstruir participantes removidos cujo resultado já foi retirado pelo fluxo existente. Todas as duplas empatadas na maior contagem positiva são apresentadas. Esses são recortes técnicos de apresentação, sujeitos à homologação do Dono do produto, e não confirmações adicionais inferidas.

### E-mail, concorrência e confirmação

Integração escolhida: API HTTPS Resend, uma mensagem por destinatário com PDF anexado, sem expor os demais endereços. Credenciais exclusivamente servidor e remetente verificado, a configurar. Nenhuma conta, contratação ou envio real realizado pelo agente.

O worker reserva uma fila por `FOR UPDATE SKIP LOCKED`, token e lease de cinco minutos. Cada execução gera o PDF se necessário e tenta até cinco envios, com orçamento de 35 segundos antes de iniciar outro e timeouts de oito segundos por chamada. Persistência do PDF precede qualquer envio. Envio serial com intervalo de 600 ms. Processamento com erro adia a próxima seleção automática em 30 minutos, permitindo que outras filas avancem; tentativa explícita do organizador pode antecipar, sem quebrar lease ou estados não repetíveis.

Estados: `pending` → `sending` → `accepted` → `sent`. `accepted` significa API aceitou, ainda bloqueando retirada. Somente webhook assinado `email.delivered` confirma `sent`; significa aceitação no servidor destinatário conforme o provedor, sem comprovar leitura ou caixa de entrada. `email.bounced`/`email.failed` levam a `uncertain` e bloqueiam retirada. O esquema reserva `failed` para recuperação operacional; o worker conserva tentativas ambíguas como `sending`, sem fingir rejeição definitiva.

Assinatura Svix HMAC-SHA256 é verificada sobre corpo bruto, ID e timestamp, tolerância de cinco minutos e comparação constante. Corpo recebido é limitado a 64 KB durante a leitura. Nenhum corpo, destinatário ou segredo entra na tabela de eventos: apenas ID do provedor, tipo e datas. Eventos anteriores à resposta HTTP ficam em `private.tournament_mail_events`; advisory lock por provedor serializa associação e webhook, evitando perder uma confirmação nessa corrida. Eventos repetidos são idempotentes; evento mais antigo não substitui mais recente.

Chave de idempotência por ID de destinatário e reutilização do mesmo PDF evitam repetir mensagens ao recuperar falhas na janela documentada de 24 horas do provedor. `sending` com mais de 23 horas vira `uncertain`, sem reenvio automático: requer conciliação administrativa. Não há promessa de exatamente uma entrega em todos os cenários externos. Não ignorar destinatário com endereço ausente/inválido para liberar retirada.

### Prazo, retirada e acesso

Semana definida tecnicamente como 168 horas desde `closed_at`. Retirada automática executada por pg_cron a cada minuto, em lotes de até 100, após prazo e condições de entrega; atraso normal até a execução seguinte, acrescido de backlog/falhas do agendador. Organizador usa `withdraw_tournament` para antecipar, com confirmação na interface. Banco bloqueia linhas de torneio/fila/destinatários e verifica organizador, encerramento, PDF gerado, todas as entregas e ausência de lease ativo; a interface não é a autoridade desses bloqueios.

Retirada lógica escolhida para preservar relações e histórico já existentes. `withdrawn_at` na fila bloqueia `private.can_view_tournament`, portanto RLS e consulta de dashboard. Uma view privada `available_tournaments` filtra retirados em oito consultas/helpers existentes explicitamente enumerados na migração, inclusive endpoints de notificações e decisões que usam `SECURITY DEFINER` e não dependem de RLS. Definições são recompiladas com a relação filtrada, preservando contratos e grants; funções de cálculo/mutação não são reescritas. Novas consultas privilegiadas deverão usar o mesmo filtro ou `can_view_tournament`. Telas já abertas refletem a retirada na próxima navegação/recarga; não há atualização em tempo real. View/fila não têm grants às contas comuns.

Retirada zera captura, PDF temporário e endereços de envio na fila. Não existe rota pública de download. Torneio, vínculos, resultados e auditorias originais são conservados internamente; não há exclusão física nem promessa de liberação proporcional de espaço. Metadados privados de envio e eventos mínimos permanecem para rastreabilidade operacional. Pontuações pessoais, contas e outros torneios não são alterados. RF25 futuro não torna o PDF acessível novamente.

### Implantação e temas

Migração cria a infraestrutura sem popular fila para torneios já encerrados, sem retirar, recalcular ou editar dados existentes. Inclusão de legado é administrativa e explícita por ID via helper privado, após conferência e backup; seu prazo continua ancorado no encerramento original e pode estar vencido. O relatório legado é gerado agora sobre o estado congelado disponível, nunca declarado gerado no passado.

Scheduler: job de retirada SQL por minuto e job de recuperação de relatórios a cada cinco minutos via pg_net para endpoint com bearer `CRON_SECRET`; URL/segredo ficam no Supabase Vault. Flags/segredos, remetente, assinatura do webhook, extensões e agendamento são configuração remota pendente. Endpoint do worker e webhook dispensam cookies de jogador e ficam fora do proxy de sessão; suas próprias autenticações continuam obrigatórias. Rotas de aplicação mantêm autenticação normal.

Tema claro/escuro/sistema usa `localStorage` por origem/navegador. Script inicial escolhe a aparência antes da pintura; `useSyncExternalStore` evita divergência da seleção na hidratação. Mudança do sistema atualiza somente a opção Sistema; evento storage sincroniza abas da mesma origem. Falha de armazenamento não bloqueia a troca na aba. Tokens centrais e correções de contraste cobrem fundos, texto, formulários, estados e SVGs; PDF mantém paleta clara de impressão, independente do tema do navegador. Sem tabela ou sincronização de tema por conta.

## Consequências e limites

Serviço de e-mail e agendadores passam a ser dependências operacionais, com quotas/custos a conferir no projeto real. Falha mantém torneio congelado e visível além da semana, de acordo com a proteção confirmada. Sem monitorar a agenda/webhook não se comprova automação efetiva. O endpoint processa uma fila por execução; grandes grupos exigem mais ciclos.

Custo do cálculo das duplas é proporcional às datas e ao quadrado dos participantes; PDF é paginado sem descarte de dados, limitado a 8 MB por segurança. Excesso de tamanho bloqueia geração/retirada; nomes com glifos não cobertos pela fonte exigem revisão visual na homologação. Fonte cobre os caracteres suportados pelo Ubuntu, não todo Unicode/emoji. PGlite valida transações e permissões localmente, mas não comprova concorrência de sessões PostgreSQL reais, entrega externa ou funcionamento de pg_cron/pg_net/Vault no ambiente remoto.

## Evidências locais

129 testes completos aprovados, lint dos arquivos de aplicação alterados e build/TypeScript aprovados. Captura/preservação, RLS, consultas privilegiadas após retirada, fila, assinatura e proteção das rotas exercitados localmente; PDF sintético revisado em três páginas e fonte confirmada no rastreamento de produção. Scripts de backup/exportação/comparação e validador CLI verificados com dados sintéticos (21 seções, 68 definições). Nenhuma migração, envio ou retirada real; testes de concorrência PostgreSQL real, integrações e aceite remoto continuam pendentes. [Registro detalhado](../sprints/sprint-8.md).

## Referências

- [Modelo e sequência](../diagramas/relatorios-e-retirada.md)
- [Roteiro operacional](../sprints/sprint-8-operacao.md)
- [Resend: anexos e envio](https://resend.com/docs/api-reference/emails/send-email), [idempotência de 24 horas](https://resend.com/docs/dashboard/emails/idempotency-keys), [webhooks](https://resend.com/docs/webhooks/introduction)
- [Svix: assinatura manual](https://docs.svix.com/receiving/verifying-payloads/how-manual)
- [PDFKit](https://pdfkit.org/docs/text.html)
