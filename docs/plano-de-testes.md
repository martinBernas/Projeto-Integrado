# Plano de testes

## Estratégia

Os testes seguem a lógica de verificação e validação: requisitos são validados por testes de aceitação; fluxos integrados por testes de sistema; integrações entre módulos por testes de integração; e cálculos por testes unitários.

## Casos de teste prioritários

| ID | Requisito | Cenário | Resultado esperado |
| --- | --- | --- | --- |
| CT01 | RF01 | Usuário informado com credenciais válidas | Acesso autenticado e perfil carregado |
| CT02 | RF02/RF04 | Usuário cria torneio com período e fuso válidos | Torneio é salvo e o criador torna-se organizador |
| CT03 | RF05/RN01 | Jogador lança 20.000 sem estar em torneio | Lançamento pessoal é salvo, associado ao jogador e à data |
| CT04 | RF03/RN02 | Jogador entra após o torneio iniciar | Pontuações pessoais desde o início do período entram no ranking |
| CT05 | RF06/RN03 | Torneio absoluto e pontuação de 15.500 | Pontuação aplicada é 15.500 |
| CT06 | RF06/RN04 | Resultados 10.000, 12.000 e 15.500 | Pontos relativos: 0, 2.000 e 5.500 |
| CT07 | RF06/RN04 | Dois jogadores empatam com a menor pontuação | Ambos recebem 0 ponto aplicado |
| CT08 | RF06/RN05/RN06 | Jogador sem lançamento após o horário do torneio | Penalidade configurada é aplicada uma única vez |
| CT09 | RN06 | Dia sem pontuação positiva | Sem erro, sem ranking diário e sem cálculo de diferença |
| CT10 | RF07/RN07 | Totais distintos de participantes | Maior total ocupa a primeira posição |
| CT11 | RF08 | Jogador tenta alterar lançamento de outro jogador | Operação é negada |
| CT12 | RF09/RN08 | Regra é alterada após resultado consolidado | Resultado existente e regra aplicada permanecem auditáveis |
| CT13 | RF10 | Usuário participa de dois torneios e não participa de um terceiro | A lista exibe somente os dois torneios participantes, com acesso aos detalhes de cada um |
| CT14 | RF11/RN09 | Torneio configurado de segunda a sexta e lançamento feito no domingo | Domingo não é considerado dia de jogo nem gera resultado |
| CT15 | RF11/RN09 | Torneio configurado de segunda a sexta mais domingos | Domingo é considerado dia de jogo e pode receber pontuação ou penalidade |
| CT16 | RF12/RN09 | Organizador exclui uma segunda-feira por feriado | A data excluída não gera pontuação nem penalidade |

## Evidências

Para cada execução, registrar identificador do caso, data, responsável, dados usados, resultado obtido, resultado esperado e evidência (captura de tela ou saída do teste automatizado).

## Automação planejada

- Testes unitários do motor de pontuação com Vitest.
- Testes de integração do banco e das permissões.
- Testes ponta a ponta dos fluxos de login, lançamento, participação em torneio e ranking com Playwright.
