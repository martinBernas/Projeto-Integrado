# Sprint 6 — Auditoria por votação e estatísticas pessoais

## Situação atual — 11/10/2026

Sprint em homologação, sem aceite global ou encerramento. S6-01–S6-04 implementadas; testes locais, lint e build aprovados. Backup/exportação, migração e comparação remota concluídos. Deployment pronto relatado pelo Dono do produto; URL/versão não informadas. Fluxos de auditoria exercitados na aplicação e tela de RF20 validada visualmente, sem problemas relatados.

| História | Requisitos e entrega | Situação atual |
| --- | --- | --- |
| S6-01 | RF13–RF14: pedido justificado, aprovação/rejeição, eleitorado fixo e voto secreto alterável até o prazo. | Implementada; cenários principais homologados pelo relato. Restrições adicionais abaixo ainda a conferir. |
| S6-02 | RF15: apuração pelo organizador após 48 horas, manutenção ou invalidação e escolha da punição. | Implementada e testada localmente; apuração remota pendente do prazo. |
| S6-03 | RF16: recálculo somente no torneio alvo, histórico antes/depois, preservação do bruto e aviso clicável de punição. | Implementada e testada localmente; efeitos remotos e aviso após punição pendentes. Aviso de votação aberta validado. |
| S6-04 | RF20: estatísticas pessoais em tela própria, médias, gráfico, tabela e períodos aprovados. | Implementada; tela validada visualmente pelo Dono do produto. Casos específicos não detalhados no relato. |

RF21 permanece fora da Sprint 6, em refinamento futuro. Sprint 5 encerrada. Não há nova implementação pendente identificada no escopo entregue; a conclusão depende da homologação restante e do aceite do Dono do produto.

## Objetivo e decisões confirmadas

Entregar auditoria rastreável de ponta a ponta e estatísticas pessoais, preservando pontuação bruta e dados de outros torneios.

Regras de auditoria aprovadas pelo Dono do produto em 11/10/2026:

- Qualquer participante do torneio pode solicitar auditoria com justificativa obrigatória. O organizador aprova antes de abrir a votação ou rejeita com motivo.
- Eleitorado fixado na abertura, excluindo o auditado; organizador participante pode votar. Ingressos posteriores não geram direito de voto.
- Prazo de 48 horas a partir da abertura. Um voto por eleitor, alterável até o prazo. Cada eleitor consulta seu próprio voto; escolhas/autoria dos demais permanecem secretas, inclusive perante o organizador.
- Maioria simples dos votos recebidos, sem quórum mínimo. Empate ou nenhum voto mantém a pontuação. Apuração realizada pelo organizador após o prazo; sem apuração automática.
- Uma auditoria por pontuação/torneio, incluindo pedido rejeitado, sem recurso ou reabertura. Ranking permanece inalterado durante a avaliação.
- Invalidação retira o bruto da referência relativa do dia. Organizador escolhe desconsideração (contribuição zero, distinta de ausência) ou penalidade da regra aplicável à data. Penalidade fixada na apuração permanece após revisão de regras.
- Avisos clicáveis: “Auditoria aberta · Ver votação” e, após invalidação, “Punição aplicada · Ver resultado”, com âncora para a avaliação correta. Prazo vencido mantém aviso aberto até apuração. Pedidos pendentes/rejeitados e pontuação mantida não recebem esses avisos.

RF20: próprio perfil, médias sobre bruto positivo, cinco jogos por dia, arredondamento somente no resultado de cada divisão. Períodos: cinco dias positivos mais recentes (padrão, não consecutivos), hoje e 29 dias anteriores em São Paulo, ou histórico até hoje. Zero/ausência não contam como jogos. Médias e gráfico usam o mesmo período. Sem positivos: mensagem sem métricas/pontos fictícios. Auditorias de torneio não alteram estatísticas pessoais.

## Implementação e arquitetura

- Migração `202610110001_score_audits.sql`: avaliações, eleitorado, votos e eventos privados sob RLS; RPCs autenticadas para pedido, revisão, voto, apuração e consulta. Transações no torneio alvo, recálculo canônico/prévia e snapshots antes/depois.
- Rota `/dashboard/tournaments/[id]/audits`: pedidos, revisão, voto próprio, apuração e histórico. Torneios encerrados permitem consulta.
- Dashboard consulta `get_score_audits` em paralelo e projeta somente identificador, pontuação e estado para os avisos. Erro independente com nova tentativa, sem ocultar os resultados carregados. Sem SQL adicional para os avisos.
- Rota `/dashboard/statistics`: leitura no servidor de personal_scores sob RLS, identidade da sessão, sem aceitar outro perfil por URL. Paginação por data única por jogador até página vazia, tolerando teto remoto menor que 200; últimos cinco para ao completar cinco positivos. Sem limite total de 100, nova tabela, RPC, dependência ou migração.
- Gráfico SVG diário com escala 0–25.000, espaçamento proporcional às datas e tabela completa expansível. Rolagem horizontal acessível. Falha de qualquer página impede métricas parciais.

Escolhas técnicas de integridade: pedido/votação pendente bloqueia encerramento/revisão de regras, mudança de vínculo do auditado e correção do bruto avaliado. Eleitor removido perde acesso, mas voto anterior permanece. Bloqueio da revisão de regras já confirmado na aplicação; demais restrições seguem no roteiro.

Limitações: sem notificações, atualização em tempo real, apuração automática, paginação de avaliações ou recurso. Estatísticas integrais têm custo proporcional ao histórico; páginas sequenciais não são snapshot transacional e correções concorrentes podem exigir recarga.

Referências: [arquitetura](../arquitetura.md), [ADR-006](../decisoes/adr-006-auditoria-por-votacao.md), [auditoria](../diagramas/auditoria-votacao.md), [estatísticas](../estatisticas.md) e [fluxo RF20](../diagramas/estatisticas-pessoais.md).

## Evidências consolidadas

### Preservação e ambiente

- Captura `before-s6-v1`: 2026-10-11 13:53:51.711585+00, referência 2026-10-11, quatro torneios e 362 pontuações; checksum `99a06d73cc74acb813732eca01f03bc9`.
- Exportação recebida e validada privadamente: 13 seções e duas definições de funções; checksum recalculado igual. Arquivos em backups/sprint-6 ignorados pelo Git, sem dados pessoais na documentação.
- Migração remota confirmada pelo retorno “Success. No rows returned”. Comparação posterior: preserved=true, checksums anterior/atual iguais. Não reaplicar a migração.
- Deployment pronto relatado e funcionalidades exercitadas; versão/URL não fornecidas. RF20 não requer SQL adicional. Não inferir execução remota de casos não relatados.

### Homologação relatada pelo Dono do produto

Torneio de teste separado: `Teste auditoria Aztecas Outubro`, criado como cópia de `Aztecas Outubro`.

- Pedido rejeitado por falta de comprovação; outro pedido aprovado e voto do organizador registrado.
- Sigilo do voto, troca do próprio voto, auditado impedido de votar e participante incluído após abertura sem direito a voto.
- Novo pedido recusado para pontuação com auditoria rejeitada; pedido sem justificativa recusado.
- Aviso clicável de votação aberta; verificação da auditoria em celular e teclado.
- Ranking e pontuações inalterados durante avaliação; revisão de regras bloqueada enquanto há auditoria aberta.
- RF20: “validei a tela parece ok”. Validação visual geral sem problemas relatados; dispositivos, versão e casos específicos não informados. Não extrapolar a verificação celular/teclado da auditoria para RF20.

### Verificação local

Suíte completa com 86 testes aprovados, zero falhas/pulados; lint e build aprovados. Cobertura de banco PGlite/RLS, sigilo/permissões, eleitorado/prazo, duplicidade, duas punições, empate/nenhum voto, isolamento/bruto, referência relativa, penalidade histórica, idempotência e rollback. Captura/comparação ensaiadas com dados fictícios. RF20 cobre 257 positivos sob teto de 37 por página, últimos cinco sob teto de dois, fronteiras temporais/ano bissexto, médias/arredondamento, vazio, isolamento, erro intermediário e renderização.

Testes de apresentação afetados revalidados após ajustes finais. Build final aprovado após preservar saída .next bloqueada por EPERM em cache ignorado e gerar nova saída, sem alterar configuração. Contagens de 82/83 testes pertencem às etapas anteriores e foram substituídas por 86. Esta atualização documental verificada com git diff --check; sem novos testes da aplicação ou ações remotas.

## Pendências reais para concluir a sprint

Prazo da votação de teste: **13/10/2026 às 11:15, São Paulo**, informado com precisão de minutos (segundos não fornecidos). Após o instante efetivo, atualizar a página e executar a apuração pelo organizador. Nenhuma automação ou apuração realizada por esta atualização.

1. Após o prazo: confirmar recusa de novo voto/alteração e executar apuração; homologar manutenção, empate/nenhum voto e maioria pela invalidez em cenários próprios.
2. Conferir separadamente desconsideração e penalidade, recálculo absoluto/relativo (incluindo menor positivo), resultados antes/depois e isolamento do bruto pessoal/torneio original.
3. Repetir apuração para verificar idempotência; conferir penalidade preservada após revisão e aviso “Punição aplicada” clicável para o resultado correto.
4. Demais cenários sem confirmação específica: bloqueio de encerramento e mudança do vínculo/correção do bruto do auditado, conta externa/revogação, apuração antes do prazo, consultas de encerrados e concorrência real entre sessões.
5. RF20: registrar resultados específicos do roteiro, sobretudo filtros/fronteiras, médias conhecidas, histórico superior a 100, vazio/privacidade e celular/teclado, se ainda não exercitados. A validação visual geral já está registrada.
6. Registrar referência do ambiente/versão usada e aceite global do Dono do produto após avaliar os resultados e eventuais limitações.

Roteiro detalhado e recuperação em [operação da Sprint 6](sprint-6-operacao.md). Backup, migração, comparação, regras aprovadas, sigilo, aviso aberto e validação visual geral de RF20 não são pendências atuais.

## Histórico de planejamento

Planejamento inicial: S6-01/S6-02/S6-03 estimadas em 5/5/8 pontos; S6-01 reestimada tecnicamente em oito após incluir pedido/aprovação. Estimativas relativas, sem capacidade ou data de conclusão assumida. RF20 acrescentado por autorização posterior do Dono do produto como S6-04, sem estimativa quantitativa confirmada. Propostas funcionais anteriores foram resolvidas por “regras aprovadas”. A sequência de backup, migração, publicação e relatos de homologação é preservada no documento operacional; seu resumo atual prevalece sobre pendências históricas.
