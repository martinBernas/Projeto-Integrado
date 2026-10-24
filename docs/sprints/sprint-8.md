# Sprint 8 — encerramento definitivo de torneios e modo escuro

24/10/2026 — Diagnóstico sanitizado validado localmente: 135 testes aprovados, zero falhas/pulados; lint dos quatro arquivos alterados e build de produção/TypeScript aprovados. Inclui teste que impede exposição de mensagens brutas, credenciais, emails e caminhos. Sem nova migração; publicação da instrumentação e diagnóstico remoto continuam pendentes.

24/10/2026 — Teste remoto em torneio isolado mostrou PDF pendente e 0/2 envios. Flag inicialmente `TRUE` não atendia à comparação literal `true`; após orientação de correção, mensagem mudou para falha genérica de processamento. Dono do produto forneceu requisição POST `/dashboard/tournaments` de 17:23:00 GMT-3, deployment `dpl_BeitYrUSHiu7nPNjwBHrRTKHexhZ`, Production/main, HTTP 200, sem mensagem de erro. HTTP 200 não comprova processamento: a ação captura exceções. Causa ainda não identificada; não presumir falha de senha, PDF ou banco. Adicionado diagnóstico local sanitizado por etapa/código em configuração, RPC, PDF e envio, sem alterar dados ou repetição. Teste de sanitização incluído; publicação desta correção e novo teste remoto pendentes. Nenhum envio/PDF real confirmado.

24/10/2026 — Dono do produto apresentou cadastro das cinco variáveis de relatórios em Production na Vercel, confirmou `TOURNAMENT_REPORTS_ENABLED=false` e informou deploy pronto. Valores secretos não verificados; URL/identificador desta publicação não fornecidos. Publicação informada com processamento desativado; ativação, teste SMTP/PDF, agendas e homologação continuam pendentes. Nenhum envio real confirmado.

24/10/2026 — Comparação remota posterior a 002 executada pelo Dono do produto retornou `business_snapshot=preserved`, `report_queues=empty`, `gmail_reports=installed`. Incremento Gmail confirmado pelo script de conferência: dados comparados preservados, filas vazias e verificações de funções/permissões aprovadas. Backup original reaproveitado; pausa de gravações liberada. Manter `TOURNAMENT_REPORTS_ENABLED=false` até configurar a hospedagem e publicar o código pelo fluxo do Dono do produto. Configuração SMTP, publicação desta versão, agendas e homologação/envio real continuam sem evidência. Este registro substitui as pendências de migração e comparação remotas anteriores.

24/10/2026 — Dono do produto informou execução remota de `202610240002_gmail_report_delivery.sql` com retorno `Success. No rows returned`. Migração 002 executada sem erro reportado; comparação posterior com `gmail-reports/00-verify-existing-backup.sql` ainda pendente. Manter gravações/worker pausados até essa conferência. Não há evidência de configuração SMTP, publicação, agendas ou envio real nesta etapa. Este registro substitui a pendência de execução de 002 nos registros anteriores.

24/10/2026 — Dono do produto executou remotamente `gmail-reports/00-verify-existing-backup.sql` antes de 002: `business_snapshot=preserved`, `report_queues=empty`, `gmail_reports=pending`. Confirmado reaproveitamento do backup original validado, sem nova captura/exportação. Migração Gmail 002 e comparação posterior ainda pendentes; manter gravações/worker pausados até a comparação. Esta evidência substitui a pendência de conferência prévia registrada abaixo.

24/10/2026 — Dono do produto confirmou ausência de alterações desde o backup original. Roteiro ajustado para reutilizá-lo mediante comparação das 21 seções e confirmação de filas vazias, com `gmail-reports/00-verify-existing-backup.sql` antes/depois de 002. Conferência remota pendente. Nova captura de 24 seções passa a alternativa se houver diferenças/fila, substituindo sua obrigatoriedade nos registros anteriores. Backup original contém funções anteriores a 001; essa migração permanece preservada no repositório. Script somente leitura preparado, ainda não executado remotamente; nenhuma mudança de arquitetura nesta atualização.

24/10/2026 — Adaptação Gmail validada localmente: 134 testes completos aprovados, zero falhas/pulados, lint dos arquivos alterados e build/TypeScript aprovados. Inclui aceitação SMTP, sanitização de falhas, rejeição repetível, quarentena imediata de tentativa interrompida, proteção contra duplicidade e preservação integral da fila no incremento. Validador de backup sintético Gmail confirmou 24 seções e 82 definições; Nodemailer e fonte do PDF presentes no rastreamento de produção. Migração 002, captura/exportação/comparação novas, credenciais SMTP de relatórios, publicação/agendas e homologação ainda pendentes no ambiente remoto; nenhum envio real ou alteração na recuperação de senha. Migração 001 e comparação originais não devem ser repetidas.

## Incremento Gmail vigente — 24/10/2026

Critério confirmado pelo Dono do produto: aceitar como sucesso o envio aceito pelo Gmail para encaminhamento. SMTP/TLS com a conta existente substitui Resend; sem domínio/serviço pago, sem modificar recuperação de senha. Resposta negativa comprovada permite repetição; timeout/confirmação perdida vira incerto e bloqueia ambas as retiradas, sem reenvio automático. A migração 001 e sua comparação já foram confirmadas; não reaplicar. Incremento 002 preparado localmente, com nova captura/exportação/validação/comparação de 24 seções ainda pendentes no ambiente remoto. [ADR-014](../decisoes/adr-014-relatorios-gmail-sem-custo.md) e [roteiro vigente](sprint-8-gmail-operacao.md) substituem instruções anteriores de Resend/webhook. Nenhuma credencial lida/configurada nem envio real realizado pelo agente. Verificação final: 134 testes, lint e build/TypeScript aprovados. Registros anteriores de critério pendente foram substituídos pela confirmação atual.

24/10/2026 — Localizado registro anterior em docs/sprints/operacao-2026-09-23.md, seção Validação posterior e recuperação entre aparelhos: Dono do produto configurou envio por Gmail e confirmou funcionamento da solicitação/abertura do link de recuperação no Chrome. web/README.md documenta configuração SMTP de autenticação no Supabase. Essa evidência substitui a suposição de inexistência de configuração Gmail no projeto; não comprova validade atual das credenciais nem envio de relatórios. Reaproveitar a conta e o arranjo SMTP como base para RF19, sem criar conta/domínio e sem modificar a recuperação de senha. Credenciais não lidas/expostas. Critério de sucesso SMTP versus entrega externa ainda não confirmado; adaptação de RF19 ainda não implementada. Migração/comparação anteriores permanecem concluídas.

24/10/2026 — Dono do produto informou que já existe uma conta Gmail exclusiva do projeto. Considerar essa conta na avaliação de envio sem domínio próprio/custo monetário adicional; não solicitar criação de outra conta. Endereço e credenciais não foram fornecidos nem registrados. Autenticação e disponibilidade da senha de aplicativo ainda não verificadas. A adoção técnica do Gmail e eventual alteração do critério de sucesso de entrega ainda exigem alinhamento; não dispensar a proteção de retirada. Migração/comparação RF19 já concluídas permanecem válidas; Resend não ativado, nenhum envio real realizado.

24/10/2026 — Dono do produto definiu restrição de custo monetário zero: projeto sem fins lucrativos, sem interesse em investir dinheiro. Não possui conta Resend e informou apenas o endereço geoguaras.vercel.app, que não fornece controle DNS para verificar remetente no Resend. Não contratar plano, comprar domínio ou presumir serviço pago. A ativação de e-mail via Gmail SMTP fica suspensa enquanto se avalia alternativa gratuita sem domínio próprio; não altera a migração/comparação já concluídas nem autoriza dispensar os relatórios/envios exigidos para retirada. Nenhuma alternativa de provedor ou mudança do critério de sucesso de envio foi confirmada ainda; implementação existente permanece local, sem envio/retirada real.

24/10/2026 — Comparação remota pós-migração RF19 confirmada pelo Dono do produto: business_snapshot=preserved e tournament_reports=installed. As 21 seções foram comparadas à captura before-reports-20261024-v1 na data de referência, com filas/eventos novos vazios. Backup/exportação/validação, migração e comparação concluídos; não repetir os scripts 01–03 nem a migração. Pausa nas gravações pode terminar. Próxima etapa: configurar provedor/remetente, segredos de servidor e webhook, publicar a interface/servidor e ativar agendas conforme roteiro, mantendo geração/envio desabilitados até a configuração conferida. Nenhum envio ou retirada real, configuração remota, publicação ou homologação da Sprint 8 confirmados nesta etapa; nenhuma operação remota realizada pelo agente.

24/10/2026 — Dono do produto informou “Success. No rows returned” após executar 202610240001_tournament_reports.sql. Execução remota da migração RF19 confirmada pelo relato; não reaplicar. Backup/exportação privados e checksums já validados. Próximo passo executar 03-verify-after-install.sql e exigir business_snapshot=preserved e tournament_reports=installed, mantendo pausa nas gravações até a comparação. Preservação pós-migração, configuração/ativação dos serviços, publicação e homologação ainda não confirmadas. Nenhuma operação remota realizada pelo agente.

24/10/2026 — Exportação privada pré-migração RF19 recebida e validada localmente: before-reports-20261024-v1, 21 seções e 72 definições de funções. Validador em PGlite recalculou os MD5 canônicos iguais à captura: snapshot=37569d6c293eae9933e4883f4bfb6535, funções=d824fdd90f677a7ff7c6ef317235799c. Original preservado em backups/tournament-reports/before-reports-20261024-v1-export-original.txt, SHA-256=4f46ce0fbf4d6a87278aab06e2e4526091a032279ebe4c62a1da487e0aa1eacd; JSON normalizado em before-reports-20261024-v1.json na mesma pasta, ambos ignorados pelo Git. Removida apenas a embalagem da exportação (lista/coluna backup), sem alterar seu conteúdo. Captura/exportação/validação concluídas; não repetir nem sobrescrever. Próximo passo aplicar somente 202610240001_tournament_reports.sql e executar comparação 03 antes de retomar gravações. Migração, comparação, ativação e homologação remotas ainda não confirmadas; nenhuma operação remota realizada pelo agente. Nenhum conteúdo pessoal, voto ou segredo reproduzido.

24/10/2026 — Captura pré-migração RF19 confirmada pelo Dono do produto: before-reports-20261024-v1, captured_at=2026-10-24 19:14:49.161879+00 (16:14:49 em São Paulo), as_of=2026-10-24, snapshot_md5=37569d6c293eae9933e4883f4bfb6535, functions_md5=d824fdd90f677a7ff7c6ef317235799c. Preflight relatado: estrutura/fila e tabela de backup ausentes antes da captura; pg_cron 1.6.4 e supabase_vault 0.3.1 instalados, pg_net 0.20.4 disponível e ainda não instalado. Não repetir nem sobrescrever a captura. Próximo passo exportação privada completa e validação antes de migrar; exportação, validação, migração e comparação ainda não confirmadas. Manter pausa nas gravações. Nenhum dado pessoal, voto ou segredo registrado nesta evidência; operações remotas realizadas pelo Dono do produto.

## Implementação local — 24/10/2026

Implementação iniciada por autorização explícita do Dono do produto e concluída localmente no recorte abaixo. Migração, configuração de e-mail/webhook/agendas, publicação e homologação remotas ainda pendentes; nenhum envio ou retirada real realizado. Esta seção substitui as referências anteriores de implementação não iniciada; o planejamento e refinamento abaixo preservam o histórico.

| Entrega | Comportamento implementado |
| --- | --- |
| S8-01 / RF19 | Captura final atômica no encerramento existente; PDF geral gerado no servidor com classificação, evolução das posições acumuladas por data, tabela equivalente e todas as duplas líderes por inversões. Empates intermediários preservam a última ordem estrita. PDF anexado individualmente por participante via Gmail SMTP, sem serviço externo de renderização. |
| S8-02 / RF19 | Retirada lógica automática a partir de 168 horas, job SQL por minuto; ação antecipada do organizador. Ambos bloqueados até PDF gerado e aceitação SMTP de todos os destinatários pelo Gmail, sem worker ativo. Retirada limpa PDF/captura/endereços da fila e oculta acesso por RLS e consultas privilegiadas. |
| Falhas e recuperação | Fila privada, token/lease e registro por destinatário. Aceitação pelo Gmail conclui o envio; falhas seguras podem ser repetidas e resultados incertos exigem conciliação imediata, sem reenvio automático. Organizador acompanha contadores e pode solicitar nova tentativa. |
| S8-03 / FB01 | Claro/Escuro/Sistema em todas as páginas pelo layout; preferência no navegador, sincronização entre abas, acompanhamento do sistema somente em Sistema, inicialização antes da pintura e paleta central com ajustes de SVG/contraste. PDF usa apresentação clara para impressão. |

Escolhas técnicas detalhadas na [ADR-013](../decisoes/adr-013-relatorios-e-retirada-de-torneios.md) e no [diagrama de dados/fluxo](../diagramas/relatorios-e-retirada.md). Prazo de 168 horas, acumulado final por data, elegibilidade pelo vínculo presente no encerramento, todas as duplas líderes e retirada lógica são escolhas da implementação, sujeitas à homologação; não foram registradas como novas decisões explícitas do Dono do produto.

### Limites e situação operacional

- Migração nova: `202610240001_tournament_reports.sql`. Instalação não altera resultados antigos nem inscreve encerrados existentes; helper privado permite inclusão administrativa explícita por ID, com prazo original e possível retirada logo após entregar se a semana já venceu. Nenhuma inclusão realizada.
- Retirada significa sumir da aplicação, não exclusão física de dados originais. Referências de negócio permanecem internas, preservando outros torneios e pontuações pessoais; o PDF e os endereços temporários são limpos. RF25 permanece futuro, sem implementação.
- Credenciais Gmail de servidor e dois jobs devem ser configurados antes de ativar. Provedor e agendamento introduzem quotas/custo a conferir no ambiente. Flags falsas não suspendem retirada SQL de relatórios já aptos; roteiro explica suspensão dos dois jobs separadamente.
- Cada execução processa uma fila/até cinco destinatários; atrasos/falhas podem manter torneio visível além da semana, conforme proteção confirmada. Aceitação HTTP não equivale a entrega; aceitação SMTP comprova encaminhamento pelo Gmail, não entrega/leitura.
- PDF limitado a 8 MB, paginado sem truncar datas/participantes. Cálculo de duplas cresce com datas e quadrado de participantes; fonte incorporada não cobre todo Unicode/emoji. Erro mantém retirada bloqueada.
- Testes SQL em PGlite não comprovam concorrência de sessões PostgreSQL reais nem operação de cron, pg_net, Vault e Resend. Homologar em torneio isolado com contas de teste; não abrir testes artificiais com participantes legítimos.

### Verificações locais

Validação final: **129 testes completos aprovados**, zero falhas/pulados, lint dos arquivos de aplicação alterados e build de produção com TypeScript aprovados. Build executado fora do sandbox após bloqueio de limpeza de arquivos gerados pelo Next.js no Windows. Inclui captura/preservação e isolamento, empates, PDF, fila/repetição parcial, assinatura/timestamp/limite do webhook, autenticação do worker e ações, retirada automática/antecipada e persistência/sistema/armazenamento bloqueado do tema. Scripts SQL de backup/exportação/comparação exercitados com dados sintéticos; validador CLI confirmou 21 seções e 68 definições. Revisão visual das três páginas do PDF sintético após correção de rodapé que criava páginas extras, e início/login nos temas; largura móvel efetiva de 375 px sem rolagem horizontal na tela de acesso. Áreas autenticadas, todos os cenários remotos e contraste com participantes reais ainda exigem homologação. Confirmada inclusão da fonte, PDFKit e métricas de fonte no rastreamento de produção. `git diff --check` aprovado.

### Procedimento e pendências remotas

[Roteiro completo](sprint-8-operacao.md): backup novo/exportação privada e validação de 21 seções, migração e comparação, configurar servidor/remetente/webhook, agendar recuperação a cada cinco minutos e retirada a cada minuto, publicar e homologar com evidências. Scripts de backup/exportação/comparação exercitados localmente com dados sintéticos. Nenhuma captura de dados reais ou execução remota foi realizada.

## Planejamento e decisões anteriores — histórico

## Situação e decisões — 24/10/2026

O Dono do produto definiu como foco da próxima sprint o encerramento definitivo de torneios e o modo escuro. Prioridades selecionadas para planejamento; regras detalhadas, capacidade, datas e início da implementação ainda não confirmados. Sprint 7 permanece encerrada conforme suas [evidências](sprint-7.md).

O histórico avançado foi retirado da proposta porque o Dono do produto não identificou ganho no uso observado. A proposta inicial de ampliar RF09 e refinar RF08 não integra esta sprint; não remove consultas ou rastreabilidade existentes. RF22/RF23 e integração GeoGuessr continuam fora do recorte.

## Regras confirmadas — refinamento de 24/10/2026

- Retirada automática do torneio após uma semana do encerramento.
- Organizador pode antecipar somente a retirada durante a semana após o encerramento, conforme esclarecimento explícito do Dono do produto. Não há encerramento antecipado: permanece a regra atual de encerrar após o último dia do torneio.
- Somente relatório geral nesta sprint, gerado no ato do encerramento sobre os resultados congelados, com gráfico da evolução de posições de cada participante e duplas mais disputadas por quantidade de trocas de posições. Relatórios individuais registrados separadamente em RF25 para implementação futura, sem sprint definida. PDF e envio por e-mail aos participantes logo após a geração no encerramento confirmados. Proteção contra falhas confirmada: permitir nova tentativa e bloquear retirada automática e antecipada até gerar o PDF e concluir todos os envios com sucesso.
- Modo escuro confirmado: opções Claro/Escuro/Sistema, preferência salva no navegador e aplicação a todas as telas e gráficos. Não há sincronização entre dispositivos prevista neste recorte.
- Após a retirada, o PDF ficará disponível apenas nos e-mails enviados; a aplicação não oferecerá consulta ou download do relatório.
- Encerrar/congelar já existe; a nova entrega complementa esse fluxo, sem tratá-lo como funcionalidade por implementar.

## Objetivo

Completar o ciclo de vida dos torneios após o encerramento e oferecer uma apresentação confortável em ambientes claros e escuros.

## Base existente e limites

- O encerramento atual congela resultados e bloqueia edição. Pedidos retroativos pendentes impedem encerrar; preservar essa proteção e o fluxo de auditorias.
- RF19 já prevê relatório enviado por e-mail aos participantes e exclusão posterior do torneio, com retirada automática após uma semana do encerramento ou retirada antecipada pelo organizador, conforme refinamento de 24/10. Até a implementação desse fluxo, os encerrados continuam visíveis além da semana.
- Preservar contas, pontuações pessoais e dados compartilhados com outros torneios. O alcance da exclusão sobre vínculos, resultados locais, auditorias, pedidos e relatórios ainda precisa ser definido.
- O CSS global atual possui cores claras; não há seleção de tema identificada nos arquivos globais consultados. A avaliação anterior do backlog também identifica cores claras fixas nos componentes; modo escuro exige revisão das telas, não apenas do fundo.

## Histórias para refinamento

Os identificadores abaixo substituem o recorte inicial de histórico, que não chegou a ser selecionado ou implementado.

| História | Entrega proposta | Critérios e decisões pendentes |
| --- | --- | --- |
| S8-01 — relatório final (RF19/FB03) | Gerar no ato do encerramento somente o relatório geral, com classificação final, gráfico da evolução de posições dos participantes e duplas com mais inversões de posição entre si; formato PDF, enviado por e-mail aos participantes logo após a geração no encerramento. | Conteúdo principal confirmado; formato PDF e envio aos participantes logo após a geração confirmados; refinar demais aspectos do cálculo; tratamento de empates nas inversões confirmado. Ver [detalhamento](../relatorios-de-torneio.md). Relatórios individuais são RF25 futuro; médias e contagens históricas de FB03 não foram aprovadas para esta entrega. Relatório deve refletir valores aceitos e sanções do torneio; dados pessoais de terceiros e votos secretos não podem ser expostos. Validar ausência de resultados e empates. |
| S8-02 — conclusão definitiva (RF19) | Retirar automaticamente uma semana após o encerramento, permitindo retirada antecipada pelo organizador, com tratamento seguro dos dados exclusivos e compartilhados. | Execução automática e antecipação pelo organizador confirmadas. Envio confirmado logo após a geração no encerramento. Definir significado de excluir e critério técnico verificável de sucesso do envio. Confirmado: bloquear retirada automática e antecipada enquanto PDF ou algum envio não concluir com sucesso; permitir nova tentativa, evitando duplicação de envios concluídos. Não remover pontuações pessoais nem afetar outros torneios. |
| S8-03 — modo escuro (FB01) | Seletor Claro/Escuro/Sistema e preferência persistida, cobrindo as telas da aplicação. | Claro/Escuro/Sistema e persistência no navegador confirmados pelo Dono do produto, com aplicação a todas as telas e gráficos. Sincronização entre dispositivos fora deste recorte. Cobrir formulários, rankings, estatísticas/gráficos, pedidos, notificações, login, erros, carregamento e foco por teclado; preservar contraste e legibilidade em celular. |

## Fluxo de conclusão definitiva — regras confirmadas e pontos em aberto

1. Organizador resolve pendências e encerra pelo fluxo existente; resultados ficam congelados.
2. No ato do encerramento, o sistema gera em PDF o relatório geral do estado final congelado e o envia por e-mail aos participantes logo após a geração.
3. Torneio permanece disponível por até uma semana após o encerramento; organizador pode antecipar a retirada.
4. Retirada ocorre automaticamente após uma semana ou antes por ação do organizador. Ambas as retiradas ficam bloqueadas até gerar o PDF e concluir todos os envios com sucesso, mesmo após a semana; permitir nova tentativa em caso de falha.
5. Torneio deixa de aparecer na aplicação; dados pessoais compartilhados permanecem íntegros. PDF disponível somente nos e-mails enviados, sem consulta ou download na aplicação.

A seleção do foco não autoriza apagar torneios reais nesta etapa de planejamento. Após a retirada, o PDF fica disponível somente nos e-mails enviados, sem acesso pela aplicação. Arquivamento lógico versus remoção física dos demais dados e limpeza técnica de arquivos/metadados ainda não foram decididos. Retirada automática foi confirmada; mecanismo técnico e contagem exata do prazo ainda serão definidos. Tratamento de falhas confirmado pelo Dono do produto: nova tentativa e bloqueio de qualquer retirada enquanto geração ou algum envio não concluir com sucesso. Tratar torneios já encerrados antes da nova versão explicitamente, evitando exclusão retroativa em massa na ativação.

## Decisões para fechar o recorte

1. Definir contagem exata da semana e comportamento de ativação para torneios já encerrados. Antecipação limitada à retirada após encerrar, retirada automática após uma semana e geração de relatórios no encerramento já estão confirmadas.
2. Tratamento das inversões através de empates confirmado: contar somente mudança da última liderança estrita. Confirmar propostas de classificação acumulada por data e exibição das duplas líderes empatadas; PDF e envio aos participantes logo após a geração no encerramento confirmados; proteção contra falhas confirmada: nova tentativa e bloqueio de ambas as retiradas até PDF e todos os envios concluírem com sucesso. Disponibilidade do PDF após retirada confirmada: somente nos e-mails enviados. Definir critério verificável de sucesso do envio e alcance da retirada/limpeza dos demais dados.
3. Modo escuro refinado: Claro/Escuro/Sistema com preferência neste navegador, em todas as telas e gráficos. Implementação deverá respeitar a preferência do sistema quando essa opção estiver selecionada.
4. Confirmar capacidade e duração desejada antes de estimar. RF19 concentra a maior incerteza por envolver envio, retenção e dados relacionados; modo escuro é independente e pode avançar após seu refinamento.

## Validação e sequência técnica planejadas

Após refinamento: inventariar relações/permissões, desenhar estados de conclusão e integração de e-mail, atualizar arquitetura/diagramas e registrar decisão arquitetural pertinente. Preparar migração, backup privado/exportação validada e comparação de preservação se necessários. Para o tema, centralizar cores e preferência e revisar componentes e gráficos.

Verificações previstas: autorização do organizador, prazo da semana e retirada automática, antecipação pelo organizador, geração no encerramento, pendências, resultados congelados, preservação de outros torneios/pontuações pessoais, falha/repetição de envio, concorrência e repetição de conclusão. Para tema: persistência, preferência do sistema, renderização inicial, troca sem perder formulários, contraste e revisão visual em computador/celular/teclado. Executar testes pertinentes, lint e build na implementação; registrar evidências separadas de publicação e homologação.

## Acompanhamentos separados da Sprint 7

- RF24: relatório após aproximadamente uma semana da ativação de 18/10, referência aproximada 25/10, conforme [roteiro](sprint-7-metricas-operacao.md). Não há relatório novo nem automação criada.
- Homologação complementar de auditorias/notificações, autoraprovação, encerramento com pendência, celular/teclado e concorrência PostgreSQL real, somente em torneio isolado com contas de teste. Não há evidências novas desses cenários nesta revisão.

## Refinamento do relatório geral e requisito futuro

Conteúdo e propostas de cálculo em [Relatórios de torneio — RF19/RF25](../relatorios-de-torneio.md). Gráfico de posições e duplas mais disputadas foram solicitados pelo Dono do produto; tratamento de empates nas inversões confirmado pelo Dono do produto: inversão direta ou através de empate conta uma troca; empate com manutenção da liderança não conta. Acumulado final por data, elegibilidade e apresentação dos pares líderes ainda aguardam confirmação. RF25 fica fora desta sprint. Avaliar retenção necessária a relatórios futuros antes de escolher remoção física; nenhuma política nova de retenção está aprovada.

## Evidência desta revisão

Atualizados planejamento, requisitos, plano de ação, backlog, índice e histórico conforme a escolha do Dono do produto. Inspeção documental de RF19/FB01 e leitura do CSS global. Nenhuma implementação, migração, envio de e-mail, exclusão ou operação remota realizada. Arquitetura vigente não alterada. Verificação documental por `git diff --check`; testes funcionais não executados nesta revisão sem alteração de aplicação. Publicação e homologação da Sprint 8 ainda não se aplicam.
