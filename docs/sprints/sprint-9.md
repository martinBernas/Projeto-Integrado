# Sprint 9 — escopo encaminhado para planejamento

24/11/2026 — Exceção posterior ao planejamento abaixo: o Dono do produto autorizou implementar a recuperação por código de e-mail para corrigir falhas relatadas em contas corporativas. Este item está implementado localmente; publicação, template remoto e aceite pendentes. Os demais itens continuam em planejamento. [Escopo, validação e ativação](sprint-9-recuperacao-por-codigo.md).

31/10/2026 — Após o encerramento da Sprint 8, o Dono do produto determinou que os itens pendentes apresentados ficam para a próxima sprint. Encaminhamento confirmado; implementação ainda não iniciada. Ordem, capacidade, prazo e critérios detalhados serão definidos no planejamento, sem presumir que todos caibam na mesma entrega.

## Itens encaminhados

| Item | Escopo a detalhar |
| --- | --- |
| RF22 — detalhamento dos cinco jogos | Entrada alternativa por texto com país, pontos, distância, tempo e passos, preservando lançamento simples e validações. |
| RF23 — estatísticas por país e tempo | Métricas derivadas dos detalhes de RF22; definir fórmulas, cobertura e tratamento de dados incompletos. |
| RF25 — relatórios individuais | Conteúdo e entrega por participante, distintos do relatório geral já entregue. |
| FB04 — integração GeoGuessr | Investigação de viabilidade de importação; não há integração ou acesso externo confirmado. |
| Histórico avançado e moderação | Refinar ampliação de RF09 e restante de RF08, preservando os fluxos já aceitos. |
| Desempenho e acompanhamento operacional | Analisar métricas acumuladas RF24 e eventuais gargalos de troca de torneios/FB06 antes de definir melhorias. |

## Situação e próximos passos

Sprint 8 permanece encerrada, com publicação/aceite e retirada do torneio de ensaio registrados. Os itens acima passam a compor o planejamento da Sprint 9 por decisão do Dono do produto; a recomendação anterior de priorizar RF22/RF23 não foi confirmada como ordem de execução.

Próxima etapa: refinar prioridades, dependências, critérios de aceite e capacidade com o Dono do produto. Não há autorização inferida para iniciar implementação, integração externa, alteração de dados ou nova migração nesta atualização. Decisões arquiteturais e procedimentos serão definidos conforme o escopo refinado.

Registro exclusivamente documental, verificado por `git diff --check`; testes da aplicação não se aplicam.
