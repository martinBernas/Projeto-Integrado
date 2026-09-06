# Regras de pontuação

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

O organizador configura os dias recorrentes do torneio: **segunda a sexta** ou **segunda a sexta mais domingos**. Além disso, pode excluir datas específicas, como feriados. Uma data excluída não é considerada dia de jogo, portanto não recebe pontuação e não aplica penalidade de ausência.

## Consolidação

- O resultado do torneio soma as pontuações aplicadas dentro do período configurado.
- O ranking ordena o maior total em primeiro lugar.
- A participação posterior de um jogador não descarta resultados pessoais anteriores que estejam dentro do período do torneio.

## Tratamento obrigatório no sistema

O MVP apresenta erro `#NUM!` quando não existem pontuações positivas para determinar a menor do dia. A aplicação deve considerar esse estado como **dia sem resultados válidos**: não gera diferença, não apresenta ranking diário e aguarda lançamento ou aplicação da penalidade conforme a configuração do torneio.
