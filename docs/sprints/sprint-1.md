# Sprint 1 — Descoberta e documentação do MVP

| Campo | Registro |
| --- | --- |
| Status | Concluída |
| Período | 06/09/2026 |
| Objetivo | Transformar o MVP em planilha em documentação que permita implementar o sistema de forma incremental. |

## Escopo entregue

- Análise do arquivo `GeoGuaras.xlsx` como fonte inicial das regras de negócio.
- Wiki do projeto e plano de ação incremental.
- Levantamento de requisitos funcionais, não funcionais e regras de negócio.
- Documentação do cálculo relativo à menor pontuação positiva, consolidação de resultados e tratamento de ausência.
- Diagrama de classes inicial.
- Plano de testes com rastreabilidade entre requisitos e cenários.
- Documentação funcional com módulos e fluxos principais.

## Resultados da descoberta

O MVP confirmou que as pontuações pertencem ao jogador e podem ser usadas em torneios dentro do período aplicável. Foram definidos os dois modos de cálculo previstos para evolução: absoluto e relativo à menor pontuação positiva. Também foram registrados o ranking por maior total, a penalidade configurável, o fuso horário, o calendário de dias elegíveis e a exclusão de feriados.

As decisões que ainda exigiam validação do grupo foram mantidas como pendências nos requisitos, evitando que suposições fossem transformadas em implementação.

## Artefatos produzidos

- [Plano de ação](../plano-de-acao.md)
- [Levantamento de requisitos](../requisitos.md)
- [Regras de pontuação](../regras-de-pontuacao.md)
- [Plano de testes](../plano-de-testes.md)
- [Diagrama de classes](../diagramas/classes.md)
- [Documentação funcional](../documentacao-funcional.md)

## Evidências

| Evidência | Referência |
| --- | --- |
| Inclusão da documentação inicial do MVP | Commit `4a8a0f5` — registrado historicamente como “Sprint 0” |
| Correções do levantamento e das regras | Commit `d5a1437` |
| Resposta da atividade sobre controle de versão | Commit `3025267` |
| Ajuste da documentação funcional | Commit `df85f41` |

## Critério de aceite atingido

A equipe possui documentação suficiente para identificar as entidades do sistema, os papéis de jogador e organizador, as regras de pontuação, os casos de teste prioritários e o caminho de implementação. A Sprint 2 pôde iniciar sem depender de regras implícitas na planilha.

## Observação de nomenclatura

Os primeiros commits utilizam o nome “Sprint 0”. Para o planejamento atual, esse trabalho corresponde à **Sprint 1 — Descoberta e documentação do MVP**; esta página preserva a rastreabilidade entre as duas nomenclaturas.

