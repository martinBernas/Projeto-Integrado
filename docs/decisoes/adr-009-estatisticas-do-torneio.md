# ADR-009 — Estatísticas do torneio a partir dos resultados aplicados

Data: 18/10/2026. Situação: escolha técnica implementada localmente na Sprint 7, após o Dono do produto solicitar “implemente”. Regras de RF21 confirmadas no refinamento; publicação e aceite pendentes.

## Contexto e decisão

RF21 deve destacar a média do jogador no torneio e compará-la à média conjunta dos demais, incluindo ausências e sanções. Contagens próprias de primeiro/último consideram somente jogos positivos válidos. Estatísticas usam dias encerrados; resultados congelados não podem ser reconstruídos com pontuações pessoais atuais. Médias individuais identificadas de terceiros não integram a tela.

Reutilizar a RPC autorizada `get_tournament_dashboard`, que retorna o conjunto completo de resultados do torneio como JSON, sem paginação/limite de linhas no agregado. A página de servidor `/dashboard/tournaments/[id]/statistics` valida sessão/UUID, chama a RPC com o torneio selecionado e usa exclusivamente a identidade da sessão para destacar dados próprios. Nenhum parâmetro permite selecionar outro jogador. Sem nova RPC, tabela, grant, dependência ou migração.

`tournamentStatistics` filtra datas no período, antes de hoje segundo o `today` de São Paulo fornecido pelo banco, respeita elegibilidade/exclusões e ignora resultados pendentes/provisórios. Não reconstrói calendário ou valores a partir dos brutos atuais: os resultados aplicados existentes são a fonte. Nos encerrados, a RPC preserva resultados pela proteção transacional vigente; nos abertos, mantém o refresh já existente, com os mesmos bloqueios/efeitos sobre resultados derivados. Não introduzimos um caminho de leitura separado nem novo cache privado.

Soma própria / próprios dias elegíveis encerrados; soma dos demais / participações elegíveis por dia dos demais, excluindo o próprio jogador. Sanções e ausências integram as médias. Classificação para contagens usa `result_kind=score` e bruto positivo, ordenada por aplicação; zero relativo válido participa. Ausências e resultados invalidados não participam das contagens. Empates contam para todos; único válido conta nos dois extremos; nenhum válido não gera contagens. Denominador zero gera ausência de dados; zero real permanece zero.

Agregação e identidade ficam no servidor. Somente valores próprios e média/quantidade agregadas dos demais são renderizados. Nome/id/média individual dos demais não são passados ao gráfico. Organizador sem participação recebe o agregado dos participantes e nenhum indicador próprio fictício. Permissões da RPC são preservadas.

## Apresentação e limites

Tela separada com período completo do torneio até ontem, sem filtros adicionais. Gráfico SVG compara resultado próprio diário e média diária dos demais, em escala que inclui valores negativos e intervalos proporcionais às datas. Símbolos/linhas distinguem séries além da cor; tabela expansível apresenta valores e base diária. Média geral é ponderada por participações-dia e pode diferir da média simples dos pontos do gráfico. Arredondar apenas ao exibir. Lacunas não viram zeros inventados.

Consulta transfere todos os resultados autorizados ao servidor; processamento/memória e conteúdo do gráfico/tabela crescem com o histórico. Sem atualização em tempo real, métricas de outros jogadores identificados ou filtros adicionais. Usuário deve recarregar após alterações. Nenhuma consulta privada ao ambiente remoto realizada na implementação. Prévia visual usa somente dados fictícios.

## Validação e operação

98 testes locais aprovados, incluindo 1.201 resultados em cálculo, período real de mais de mil dias em PGlite via RPC, anonimato/revogação, congelamento após mudança do bruto e renderização com identidade da sessão. Lint, TypeScript e build aprovados. A causa dos erros anteriores de tipagem foi isolada à restrição de `realpath` dos links pnpm no sandbox Windows; executar TypeScript/build fora dessa restrição passou sem alterar tipos, dependências ou opções de checagem. Não adicionar casts de escape nem desabilitar validação para mascarar falhas.

Publicar a interface pelo fluxo vigente e homologar conforme [operação da Sprint 7](../sprints/sprint-7-operacao.md). Sem novo SQL ou backup de migração nesta entrega; backups históricos permanecem privados e preservados. Reversão da interface não exige restaurar dados de banco, pois não há novo formato persistido. Evidências locais não equivalem a publicação/aceite do Dono do produto.
