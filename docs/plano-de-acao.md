# Plano de ação

## Objetivo

Entregar incrementalmente uma aplicação que substitua a planilha do campeonato GeoGuaras, preservando as regras de negócio e tornando lançamentos, cálculos e rankings rastreáveis.

## Método de trabalho

Usaremos sprints curtas, backlog versionado no GitHub e revisão por pull request. Cada história concluída precisa atender aos critérios de aceite e aos casos de teste correspondentes.

## Sprints

| Sprint | Objetivo | Entregas |
| --- | --- | --- |
| 1 — Descoberta | Documentar o MVP e definir o escopo | Wiki, requisitos, regras, diagrama e plano de testes |
| 2 — Fundação | Criar a base técnica e o acesso de usuários | Projeto Next.js, banco, autenticação e perfis |
| 3 — Torneios | Administrar campeonatos | Torneio, participantes, período, fuso horário e regras versionadas |
| 4 — Pontuação | Registrar e calcular resultados | Lançamento, validação, cálculo, penalidade e histórico |
| 5 — Ranking | Exibir resultados e finalizar qualidade | Rankings por torneio e período, testes e publicação |

## Backlog inicial da Sprint 1

- Documentar regras extraídas do Excel.
- Definir requisitos funcionais, não funcionais e regras de negócio.
- Criar diagrama de classes inicial.
- Definir casos de teste ligados aos requisitos.
- Registrar decisões técnicas e pendências de validação do grupo.

## Critério de encerramento da Sprint 1

A documentação deve permitir que outro integrante compreenda as entidades do sistema, as regras atuais de cálculo e os comportamentos que precisam ser validados antes da implementação.
