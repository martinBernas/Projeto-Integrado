# Ensaio de carga e rollback — duas contas

Solicitado pelo Dono do produto para validar a plataforma publicada antes da carga real. Não executado remotamente pelo agente. Executar no SQL Editor, como administrador, com a aplicação em pausa para novos lançamentos durante o ensaio.

## Resultado do ensaio — 21/09/2026

Execução remota realizada pelo Dono do produto e evidências fornecidas na conversa. A conciliação retornou 79.534 pontos para `martin.bernasconi` e 2.365 para `mbernasconi333`, com `todos_os_dias_corretos = true` para ambos. O Dono do produto confirmou no painel os totais, o empate de 02/09, as penalidades de 04/09 e a exclusão de 05, 06 e 07/09 dos resultados do torneio.

Rollback executado com retorno `history_ready = false` e `rolled_back_at = 2026-09-21 04:12:40.142415+00` (01:12:40 em São Paulo). O banco voltou ao estado de preparação histórica. Backup e auditoria do ensaio permanecem conforme previsto. O aviso foi posteriormente confirmado em captura durante os testes do formulário; a carga real permanece atividade operacional.

## Execução guiada

1. Executar `web/supabase/rehearsal/01-load.sql`. O script exige exatamente duas contas Auth com perfil, incluindo o UUID do organizador já informado. Se encontrar outra composição de contas ou torneios, aborta sem aplicar a carga. Não é preciso adivinhar o UUID da segunda conta.
2. O script salva pontuações, vínculos, resultados e o estado do histórico em `private.sprint3_rehearsal`, com RLS e sem acesso dos clientes. Substitui temporariamente os dados de setembro dessas duas contas por dados fictícios e conclui o histórico para testar penalidades. Contas, nomes e senhas não são alterados.
3. Executar `02-verify.sql`. Os totais esperados são calculados independentemente a partir dos dados fictícios salvos; as duas linhas devem apresentar `todos_os_dias_corretos = true`.
4. Atualizar o painel da plataforma e conferir ranking, resultados diários e acesso com cada uma das contas. Durante o ensaio, o aviso de histórico em preparação deixa de aparecer. Não cadastrar novos participantes nem salvar/editar pontuações enquanto a carga está sendo inspecionada.
5. Após validação, executar `03-rollback.sql`. Isso restaura o estado anterior e `history_ready = false`, preservando quaisquer pontuações e vínculos que já existiam. Atualizar o painel e confirmar o aviso de histórico em preparação. Se não havia participantes antes, o ranking voltará a ficar vazio.

O rollback recusa prosseguir se pontuações ou vínculos tiverem mudado após a carga: nesse caso, conciliar as alterações, sem forçar a exclusão. O backup e os registros internos de auditoria do ensaio são mantidos; não representam pontuações ativas nem aparecem no ranking. O ensaio só pode ser carregado uma vez com esse identificador. Rollback repetido não altera novamente os dados.

## Casos específicos

“A” é o Dono do produto; “B” é a segunda conta. Demais dias úteis já decorridos recebem inteiros pseudoaleatórios reproduzíveis de 5.000 a 25.000. Não são lançados resultados de datas futuras.

| Data | Bruta A / B | Aplicada A / B após conclusão |
| --- | --- | --- |
| 01/09 | 20.002 / 16.668 | 3.334 / 0 |
| 02/09 | 12.000 / 12.000 | 0 / 0 (empate no menor) |
| 03/09 | 15.000 / ausente | 0 / −2.500 |
| 04/09 | Ambos ausentes | −2.500 / −2.500; sem classificação diária de diferenças |
| 05/09 e 06/09 | Valores fictícios no histórico pessoal | Nenhum resultado de torneio: fim de semana |
| 07/09 | Valores fictícios no histórico pessoal | Nenhum resultado de torneio: feriado |
| 08/09 | 0 / 18.000 | −2.500 / 0 |
| 09/09 | 25.000 / 1 | 24.999 / 0 |

Os casos acima verificam o cálculo e a integração visual. Não comprovam sozinhos todas as regras: autenticação, isolamento, prazo de lançamento, concorrência e limites de entrada exigem seus próprios testes. Os testes locais existentes cobrem parte dessas condições; o ensaio não encerra automaticamente a sprint.

## Formulário e restauração final

Scripts 04, 05 e 06 executados pelo Dono do produto. Permissões APROVADAS; restauração final em `2026-09-21 04:34:11.882419+00`, com `history_ready = false`. Consulte o [encerramento e evidências](sprint-3-encerramento.md).
