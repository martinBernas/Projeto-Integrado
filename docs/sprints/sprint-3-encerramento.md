# Sprint 3 — encerramento em 21/09/2026

Sprint concluída: MVP publicado, regras e carga de amostra conciliadas, lançamento e acesso validados, dados de teste restaurados. S3-01 a S3-06 concluídos no escopo do torneio único. As execuções remotas foram realizadas pelo Dono do produto, com resultados e capturas fornecidos na conversa.

Entrega publicada: commit `8671149` (Sprint 3), deployment Production com estado Ready. [Aplicação validada](https://geoguaras-6rkyp46cb-martin-bernas.vercel.app/).

## Evidências de aceite

| Verificação | Resultado |
| --- | --- |
| Provisionamento | Setembro de 2026, segunda a sexta, exclusão de 07/09, regra relativa e penalidade −2.500 confirmados no Supabase |
| Carga e cálculo | Totais esperados/aplicados de 79.534 e 2.365; todos os dias corretos para ambas as contas; ranking, empate, ausências e exclusões confirmados no painel |
| Restauração da carga | `rolled_back_at = 2026-09-21 04:12:40.142415+00`; `history_ready = false` |
| Persistência do lançamento | Primeira conta lançou 10.000 pelo celular; histórico consultado no computador confirmou o valor |
| Isolamento e correção | Segunda conta salvou 15.000 sem visualizar o histórico pessoal da primeira; primeira corrigiu para 12.000, sem duplicidade e sem alterar os 15.000 da segunda |
| Validação do formulário | −1, 25.001 e 12,5 rejeitados com mensagem de erro |
| Sessão | Após sair, acesso direto a `/dashboard` solicitou login |
| Permissões no banco remoto | `05-check-permissions.sql` retornou APROVADO: isolamento, escrita/exclusão de terceiro, datas, limites inteiros, função administrativa e acesso anônimo; transação revertida, pontuações preservadas |
| Limpeza final | `06-restore-form.sql`: `test_day = 2026-09-21`, `restored_at = 2026-09-21 04:34:11.882419+00`, `history_ready = false` |

O backup do teste de formulário registrou zero pontuações preexistentes em 21/09 e foi criado às 04:21:39.414177 UTC. A restauração final removeu os lançamentos temporários e preservou contas e vínculos anteriores. Backups e registros internos de auditoria permanecem. O aviso de histórico em preparação e o ranking sem participantes foram confirmados por captura durante os testes de formulário.

Os testes de permissões usaram papéis autenticado/anônimo e identidades simuladas no SQL Editor do banco remoto; não foram requisições HTTP maliciosas em sessões reais. O aceite integrado foi realizado em etapas: duas contas vinculadas durante a carga e a segunda conta sem vínculo após o rollback, sem criar uma terceira conta. Login, persistência e correção foram testados na aplicação publicada. Essa combinação cobre o recorte de aceite; não representa um teste automatizado único de ponta a ponta nem uma avaliação exaustiva de segurança.

Testes locais de banco/ranking, lint, build e inspeção visual estão registrados no [plano de testes](../plano-de-testes.md). Scripts de ensaio e restauração possuem testes de reversibilidade. Nenhuma falha bloqueadora permanece nos cenários executados.

## Operação após a entrega

O parágrafo seguinte registra a situação no encerramento de 21/09. A carga real e as decisões posteriores estão no [registro de 22/09](operacao-2026-09-22.md).

O torneio permanece com `history_ready = false`, aguardando os cadastros reais, o vínculo administrativo dos participantes e o Excel fornecido pelo Dono do produto. Após carregar e conciliar o histórico real, concluir sua preparação explicitamente para habilitar penalidades. Essas atividades são operação da versão entregue; não impedem o encerramento do desenvolvimento da Sprint 3.

Próxima sprint planejada: Sprint 4, administração de torneios e participantes. Regras configuráveis continuam na Sprint 5, auditoria por votação na Sprint 6 e moderação/evolução na Sprint 7.

Este registro e os scripts adicionais de validação são alterações locais para o próximo commit; o commit de produção acima identifica a aplicação efetivamente validada.
