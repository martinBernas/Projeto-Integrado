# Regras de pontuação

## Recorte da Sprint 3

A primeira entrega usará um torneio pré-instanciado e uma regra fixa identificada como `mvp-v1`, sem configuração pela interface. O Dono do produto confirmou o bloco de setembro (modo relativo, penalidade −2.500 após a virada do dia). O histórico será inserido manualmente pelo Dono do produto após o cadastro dos usuários; período, elegibilidade e procedimento de carga estão detalhados no [plano da Sprint 3](sprints/sprint-3.md). As opções configuráveis abaixo descrevem a evolução do produto.

A planilha distingue períodos: `geral!C2` trata ausência como zero no bloco de agosto; `geral!S2` consulta a data e a penalidade de `geral!U33` no bloco de setembro. Não aplicar uma regra única a todo o histórico nem importar saldos anteriores sem definição explícita. O prazo para enviar/corrigir pontuações não está comprovado por essas fórmulas.

## Pontuação pessoal

Cada pontuação bruta pertence ao jogador, identificada pela data e hora do lançamento. Ela existe mesmo quando o jogador não participa de torneio. Ao ser incluído em um torneio em andamento, o jogador passa a aparecer no ranking com suas pontuações existentes desde o início daquele torneio.

## Modos configuráveis

Cada torneio define um dos seguintes modos:

- **Absoluto:** a pontuação aplicada é igual à pontuação bruta.
- **Relativo ao menor:** aplica-se a regra observada no MVP abaixo.

## Regra observada no MVP: relativo ao menor

Para cada dia de jogo, o Excel identifica a menor pontuação bruta positiva. Para cada jogador que enviou resultado positivo, o sistema calcula:

```text
pontos aplicados = pontuação bruta − menor pontuação bruta positiva do dia
```

Exemplo: se as pontuações forem 10.000, 12.000 e 15.500, os pontos aplicados serão 0, 2.000 e 5.500 respectivamente.

## Ausência e período

O valor da penalidade por não jogar é uma configuração do torneio. O MVP usa −2.500 no bloco de setembro, mas a aplicação não deve fixar esse número. A ausência só pode ser avaliada dentro do período do torneio e conforme o fuso horário configurado.

## Calendário de jogo

Na Sprint 3, o torneio de 01/09/2026 a 30/09/2026 ocorre de segunda a sexta, excluindo 07/09/2026 por determinação do Dono do produto. Sábados, domingos e o feriado não geram pontos aplicados nem penalidades. A exclusão também vale para pontuações históricas inseridas manualmente, mesmo que a planilha contenha essa data. Os controles configuráveis abaixo ficam para entregas futuras.

O organizador configura os dias recorrentes do torneio: **segunda a sexta** ou **segunda a sexta mais domingos**. Além disso, pode excluir datas específicas, como feriados. Uma data excluída não é considerada dia de jogo, portanto não recebe pontuação e não aplica penalidade de ausência.

## Consolidação

- O resultado do torneio soma as pontuações aplicadas dentro do período configurado.
- O ranking ordena o maior total em primeiro lugar.
- A participação posterior de um jogador não descarta resultados pessoais anteriores que estejam dentro do período do torneio.

## Tratamento obrigatório no sistema

### Auditoria por votação — entrega futura

Na Sprint 6, uma decisão de invalidez após votação poderá desconsiderar a contribuição da pontuação ou substituí-la pela penalidade do dia, a critério do organizador. O efeito será restrito ao torneio que abriu a auditoria: não excluir o lançamento pessoal nem alterar outros torneios. As alternativas não se acumulam; a invalidação simples não deve disparar penalidade de ausência automaticamente. O recálculo do menor positivo após invalidação será definido no refinamento de [Auditoria de pontuações](auditoria-de-pontuacoes.md). Esta regra não é implementada na Sprint 3.

O MVP apresenta erro `#NUM!` quando não existem pontuações positivas para determinar a menor do dia. A aplicação deve considerar esse estado como **dia sem resultados válidos**: não gera diferença, não apresenta ranking diário e aguarda lançamento ou aplicação da penalidade conforme a configuração do torneio.
