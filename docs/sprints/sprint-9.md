# Sprint 9 — escopo encaminhado para planejamento

24/11/2026 — RF28: aceite visual do Dono do produto para as duas coleções de medalhas. Substitui a pendência visual desse item; publicação e homologação funcional com contas reais continuam sem evidência. [Registro vigente](sprint-9-medalhas.md).

24/11/2026 — RF28 autorizado: medalhas estéticas por pontuação absoluta, com faixas definidas pelo Dono do produto, no torneio e em todo o histórico pessoal. Implementação local e prévia atualizadas; 171 testes e build com Webpack aprovados. Não inicia os demais requisitos em planejamento. [Escopo, critérios e aceite pendente](sprint-9-medalhas.md).

24/11/2026 — Aceite visual do Dono do produto para o refinamento de ajuda contextual com ícones à direita dos títulos/rótulos. Substitui a pendência de aceite visual desse item, sem confirmar publicação ou homologação funcional em produção. [Evidência e limites](sprint-9-ajuda-contextual.md).

24/11/2026 — Refinamento visual autorizado: explicações complementares em ícones “i”, com balão ao aproximar o mouse e abertura por toque no celular. Implementação local e simulação atualizadas; dados, regras e confirmações preservados. [Escopo, testes e homologação](sprint-9-ajuda-contextual.md).

24/11/2026 — Novo item autorizado pelo Dono do produto: renovação visual em toda a aplicação com referência no GeoGuessr, implementada localmente. Não altera o planejamento funcional dos demais itens. Publicação e aceite visual pendentes. [Escopo, testes e homologação](sprint-9-layout-geoguaras.md).

24/11/2026 — Validação posterior informada pelo Dono do produto: recuperação por código funcionou com uma conta não corporativa. Evidência de funcionamento no ambiente testado; não foram informados URL/versão, teste entre aparelhos ou resultados individuais dos casos negativos. Substitui a ausência de teste real para esse cenário. Teste com a conta corporativa afetada e aceite específico da resolução original continuam pendentes; não presumir publicação ou configuração remota verificadas pelo agente. [Registro detalhado](sprint-9-recuperacao-por-codigo.md).

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
