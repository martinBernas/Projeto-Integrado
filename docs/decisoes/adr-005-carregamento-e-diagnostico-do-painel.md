# ADR-005 — Carregamento e diagnóstico do painel

Data: 03/10/2026. Escopo S5-05 autorizado pelo Dono do produto; escolhas técnicas implementadas localmente. Publicação, medição e homologação remotas ainda não confirmadas.

## Contexto

O Dono do produto relata espera principalmente na primeira abertura e ao trocar de torneio, além de indisponibilidade intermitente que desaparece após recarga. Texto exato do aviso não lembrado. O proxy valida claims; a página autentica, consulta torneios/histórico/perfil em paralelo e chama a RPC do selecionado. Esta RPC bloqueia o torneio, revalida autorização e atualiza resultados abertos antes de retornar o conjunto completo. Esse caminho é um candidato a custo/contenção, sem comprovação da causa remota.

## Decisão técnica

Usar loading.tsx para entrada no segmento e TournamentPanel no cliente para navegação por abas com Link/onNavigate e router.push em uma transição React. Enquanto pendente, identificar o torneio solicitado e substituir os resultados anteriores por status acessível; manter abas disponíveis. Links conservam URL, navegação por teclado e abertura em outra aba. Desabilitar prefetch das abas: o endpoint atual pode recalcular, portanto não iniciar essas consultas em segundo plano. Não criar cache privado, pré-carregamento ou nova tentativa automática.

Consultas com erro ou resposta nula no torneio selecionado exibem falha temporária com RetryLoad/router.refresh; respostas access:false ou seleção ausente continuam indisponibilidade por existência/acesso. Falhas não capturadas usam error.tsx e retry() da versão instalada do Next.js para buscar novamente o segmento. Carregamento não transforma uma falha concluída em sucesso nem remove o controle de acesso.

Registrar dashboard_query no servidor com etapa, duração em milissegundos, resultado (success/error/exception/empty/denied) e código de erro estritamente normalizado quando disponível. Etapas: session_claims no proxy apenas para /dashboard; authentication, tournaments, personal_history, profile e tournament_rpc na página. Sem IDs, nomes, e-mails, tokens, pontuações, payloads ou mensagens de erro. Não adiciona tabelas ou consultas de negócio.

## Consequências e limites

Feedback visual melhora a compreensão da espera e a recuperação dispensa recarga manual completa. Não há evidência de redução do tempo de consulta. Logs medem a espera percebida pelo servidor na chamada, incluindo transporte; não isolam execução SQL, espera de bloqueio ou inicialização do processo. Não medem custo de renderização/transferência do navegador nem substituem logs da plataforma para investigar inicialização. Nova tentativa explícita repete as consultas/recálculo existentes.

Somente a instrumentação publicada poderá oferecer linha de base remota. Comparar primeira abertura, repetições e trocas rápidas antes de alterar cálculo/transações. Separar leitura e recálculo depende de um desenho de atualização de ausências, novos lançamentos e regras; não faz parte desta entrega. Sem migração de banco e sem alteração de autenticação, cookies ou permissões.
