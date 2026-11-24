# Sprint 9 — Medalhas por pontuação absoluta

**Aceite visual — 24/11/2026:** após a entrega e a prévia das duas coleções, o Dono do produto respondeu “perfeito”. Apresentação das medalhas aprovada no cenário demonstrado. Substitui a pendência de aceite visual nos registros anteriores abaixo; publicação e homologação funcional com contas/dados reais continuam sem evidência. Não interpretar o aceite visual como confirmação de testes remotos, desempenho das contagens ou execução de migração.

24/11/2026 — Dono do produto solicitou medalhas estéticas em duas coleções: na participação de cada torneio e no histórico pessoal completo. Faixas confirmadas por ele; implementação local, publicação e aceite visual/funcional desta entrega pendentes.

## Faixas confirmadas

| Medalha | Pontuação absoluta por resultado |
| --- | --- |
| Bronze | 5.000 a 14.999 |
| Prata | 15.000 a 22.499 |
| Ouro | 22.500 a 24.999 |
| Platina | 25.000 |

Uma medalha por resultado, na categoria correspondente; platina não acumula ouro/prata/bronze. Abaixo de 5.000, zero/ausência e valores inválidos não concedem medalha. A pontuação é a bruta, nunca o valor relativo aplicado no ranking. Medalhas não acrescentam pontos nem modificam classificação ou critérios de empate.

## Coleções implementadas

- **Torneio:** coleção do jogador autenticado junto ao torneio selecionado. Usa `raw_score` dos resultados autorizados/preservados do próprio torneio, respeitando início/fim, elegibilidade individual, calendário e exclusões. Apenas `result_kind=score`; pendências, ausências e resultados invalidados por auditoria não concedem medalha nesse torneio. Zero aplicado válido no modo relativo pode conceder medalha pelo bruto. Resultado válido de hoje pode contar, com aviso se for provisório. Quem apenas organiza sem participar vê essa situação, sem contadores falsos de jogador.
- **Histórico pessoal:** coleção dentro de “Meu histórico pessoal”, antes dos lançamentos recentes. Conta todos os registros pessoais até hoje (São Paulo), incluindo cargas históricas e dias fora de torneios/calendários. Não deriva do limite de 100 lançamentos, do limite visual de cinco dias ou da soma de torneios. Um mesmo lançamento em vários torneios conta uma vez no pessoal. Auditoria/penalidade restrita a um torneio não altera o bruto pessoal.

Correção do bruto pode trocar a categoria. Ajuste retroativo muda a coleção pessoal imediatamente; a do torneio usa o bruto aceito localmente, preservado enquanto há decisão pendente e nos torneios encerrados. Não há livro permanente de conquistas: contadores derivados refletem os dados atuais aceitos em cada escopo. Esses critérios complementares são escolhas técnicas alinhadas às regras existentes, não novas decisões expressas do Dono do produto.

## Apresentação

Quatro ícones SVG próprios com fita violeta, acabamento bronze/prata/ouro/platina e quantidades rotuladas; platina recebe desenho de diamante. Sem mídia/fonte/biblioteca externa. Contadores zero continuam visíveis para apresentar todas as categorias. Legendas e nomes acessíveis distinguem categorias sem depender só de cor. Faixas e critérios ficam no “i” à direita do título, conforme padrão aprovado. Layout responsivo e temas claro/escuro existentes.

Falha da contagem pessoal mostra indisponibilidade com orientação de atualizar, sem exibir zero ou total parcial e sem bloquear histórico/ranking. Organizadores sem participação são diferenciados de erro de carregamento.

## Consulta e arquitetura

Contagem do torneio feita em memória sobre a resposta autorizada existente, sem consulta adicional. Total pessoal usa quatro consultas HEAD de contagem exata em `personal_scores`, por faixa e `player_id` da sessão, com data até hoje. Nenhuma linha histórica precisa ser baixada para esses contadores. RLS existente permanece aplicada, sem service role, RPC/tabela/grant novo ou migração. [Contrato oficial da contagem](https://supabase.com/docs/reference/javascript/select#querying-with-count-option), [ADR-020 e diagrama](../decisoes/adr-020-medalhas-derivadas.md).

As quatro contagens são paralelas e exigem sucesso integral. Representam consultas independentes; durante alteração concorrente de pontuação, uma atualização da página pode ser necessária para reconciliar a visualização. Não se apresentam como captura transacional de conquistas. Quatro requisições adicionais são o custo da leitura pessoal; desempenho remoto ainda não medido. Instrumentação RF24 e seu schema não foram ampliados.

## Testes e evidências

Seis testes específicos cobrem limites/faixas exclusivas e valores inválidos, bruto versus aplicado zero, identidade/período/elegibilidade/calendário/exclusões, auditorias/ausências/pendências/futuro, aviso provisório, ausência de participação, totais pessoais acima de mil linhas, filtros por identidade/data, falha sem parcial e rótulos das quatro medalhas. Não substituem validação de RLS/PostgREST real ou prova de integração remota.

A simulação local foi ampliada com exemplos das quatro categorias e dois registros fora do período do torneio. Totais esperados: torneio 2 bronze, 1 prata, 2 ouro, 1 platina; pessoal 3 bronze, 1 prata, 2 ouro, 2 platina. Diferença deliberada para demonstrar os escopos. Continuam dados fictícios e operações sem gravação.

Resultados: seis testes específicos e `pnpm test` 171/171 aprovados; `pnpm lint` sem erros e com aviso preexistente de `ids` não utilizado em `tests/retroactive-scores.test.mjs:107`; `pnpm build --webpack` aprovou compilação, TypeScript e geração de páginas. Usa a alternativa local já documentada para a falha do Turbopack; bundler padrão não alterado. `node scripts/preview-layout.mjs --check` renderizou as 14 rotas. `git diff --check` aprovado. Prévia no navegador confirmou os totais esperados e a diferença entre escopos, com capturas em `web/tmp/layout-review/medalhas-torneio.jpg` e `medalhas-pessoais.jpg`. Inspeção em tema claro e viewport de 390 px confirmou quatro categorias legíveis por coleção: largura da página igual à disponível (375 px), sem overflow; conteúdo das coleções contido em seus cards. Tema escuro e largura normal restaurados ao final. Prévia local permanece ligada para revisão solicitada; não equivale à homologação com conta real.

## Ativação e homologação pendentes

Publicar somente a aplicação, sem operação SQL ou alteração de Supabase. Conferir em participante real: limites das quatro categorias, histórico acima de 100 lançamentos, troca de torneio, início da elegibilidade, exclusões/fins de semana, modo relativo com zero aplicado, hoje provisório, ajuste retroativo antes/depois da decisão, auditoria invalidada e torneio encerrado. Conferir organizador sem participação, falha de leitura, contadores zero, ambos os temas e smartphone físico. Aceite do Dono do produto para as medalhas ainda pendente.

Sem mutação de dados, envio de e-mails ou backup de banco nesta implementação de apresentação/leitura. Não foram lidas credenciais nem capturados dados pessoais. Evidências visuais sintéticas ficam em `web/tmp/layout-review`, ignorado pelo Git. Rollback somente da aplicação, sem restauração de dados.
