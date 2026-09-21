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

### Aceite concluído — 21/09/2026

Carga, formulário, sessão e permissões aprovados; restauração final em `2026-09-21 04:34:11.882419+00`, com `history_ready = false`. Consulte o [encerramento](sprints/sprint-3-encerramento.md) para evidências, executor e limites. Suíte local completa reexecutada: `node --test tests/*.test.mjs`, 11 testes aprovados, zero falhas. Lint e build da aplicação já aprovados; esta etapa adicionou scripts, testes e documentação.

Os registros abaixo preservam estados anteriores da execução; as pendências de aceite foram resolvidas conforme o encerramento. A carga real permanece atividade operacional.


### Ensaio remoto concluído e rollback — 21/09/2026

Executado pelo Dono do produto na aplicação publicada da Sprint 3 (commit `8671149`, deployment Ready em Production informado por captura). A consulta de conciliação retornou totais esperados/aplicados de 79.534 e 2.365, com todos os dias corretos para as duas contas. O Dono do produto confirmou no painel o ranking, empate em 02/09, ausência de ambos em 04/09 e exclusão de fim de semana/feriado em 05–07/09. Isso valida esses cenários de carga, cálculo e exibição; não comprova todos os testes de escrita/autorização em produção.

Rollback confirmado por resultado SQL: `history_ready = false`, `rolled_back_at = 2026-09-21 04:12:40.142415+00`. Ensaio encerrado no banco, sem deixar o histórico marcado como concluído. Conferência visual posteriormente confirmada; carga real permanece atividade operacional. Os registros anteriores abaixo descrevem os estados de preparação e validação local anteriores a esse ensaio.

### Ensaio com duas contas e rollback — preparação

A pedido do Dono do produto, preparados `web/supabase/rehearsal/01-load.sql`, `02-verify.sql` e `03-rollback.sql`. Dois testes adicionais em PGlite passaram: carga com conciliação independente e restauração integral das tabelas de negócio ao estado anterior, incluindo dados preexistentes; recusa de rollback quando há pontuação alterada após a carga. O rollback repetido também preservou o estado restaurado. Auditoria interna e backup do ensaio são mantidos. A execução remota posterior está registrada acima. Procedimento em [Ensaio da Sprint 3](sprints/sprint-3-ensaio.md).

### Confirmação do provisionamento remoto pelo Dono do produto

As migrações `202609200001_september_mvp.sql` (com RLS nas tabelas internas de histórico), `202609200002_score_entry.sql` e o seed retornaram `Success. No rows returned`, conforme informado pelo Dono do produto. A consulta posterior retornou: `GeoGuaras — Setembro 2026`, início `2026-09-01`, fim `2026-09-30`, modo `relative_to_lowest`, penalidade `-2500`, calendário `monday_to_friday`, `history_ready = false` e exclusão `2026-09-07`. Evidência fornecida na conversa pelo executor; não equivale à homologação ponta a ponta nem à carga histórica concluída.

### Execução local da Sprint 3 — 20/09/2026

Responsável pela execução: agente de desenvolvimento. Base do trabalho: commit `7887c29`; implementação ainda local. `pnpm test`: sete testes aprovados, sendo seis de PostgreSQL embarcado/PGlite e um de ranking. Cobertura: provisionamento repetível, 21 dias elegíveis em setembro, exclusão de 07/09/fins de semana, diferenças e empate no menor, ausência, dia aberto, snapshots/revisões, RLS sem recursão, isolamento, escrita direta negada, lançamento autenticado e limites, correção sem duplicidade, carga histórica e sua conclusão. Amostra: 20.002 − 16.668 = 3.334; empate em 12.000 = zero para ambos.

`pnpm lint` e `pnpm build` aprovados. Componentes reais de formulário/torneio renderizados com dados fictícios e inspecionados em navegador headless nas larguras 390 e 1.280 pixels; sem overflow horizontal, detalhes diários abrindo corretamente. Essa inspeção visual não é um teste ponta a ponta de login/salvamento: autenticação no PGlite é simulada. O provisionamento no Supabase foi posteriormente confirmado pelo Dono do produto; login/lançamento/ranking ponta a ponta e publicação na Vercel permanecem pendentes.

Carga histórica incompleta: sem penalidades, resultados provisórios. Carga repetida: sem duplicidade. Conclusão administrativa: habilita penalidades de dias encerrados. Requer conciliação do Excel real quando fornecido pelo Dono do produto. CT01 e S3-CT08 no ambiente publicado continuam pendentes, assim como a evidência de publicação e o commit final de implementação.

### Recorte de aceite da Sprint 3

Cadastro e login já foram concluídos e validados na Sprint 2. A execução de CT01 e do acesso no fluxo S3-CT08 é uma verificação de regressão e integração com o torneio, não uma nova implementação nem reabertura da entrega anterior. Os novos resultados de teste devem ser registrados como evidências da integração da Sprint 3.

Executar CT01, CT03, CT06–CT09 e CT11 no fluxo entregue. CT07 passa a seguir o menor positivo observado no Excel. Adaptar CT10 ao total do torneio único. CT14–CT16 verificam calendário provisionado, sem exigir editor. CT02 será substituído nesta entrega pela verificação de provisionamento abaixo. CT05, CT12 e CT13 completos permanecem para as funções futuras; a identificação da regra fixa é validada separadamente nesta sprint.

| ID | Cenário adicional | Resultado esperado |
| --- | --- | --- |
| S3-CT01 | Executar provisionamento duas vezes | Um único torneio e vínculos sem duplicidade |
| S3-CT02 | Não participante consulta torneio; jogador tenta configurar regra pela API | Acesso negado, sem erro de recursão de RLS |
| S3-CT03 | Mesmo jogador envia duas vezes para a mesma data | Sem duplicidade; alteração somente no prazo autorizado |
| S3-CT04 | Dia corrente, dia encerrado, futuro e data excluída | Penalidade apenas no dia encerrado elegível; repetição de cálculo não duplica valor |
| S3-CT05 | Pontuações de `Diario!C2:C14` | Menor positivo 16.668; para 20.002, resultado 3.334, como `geral!C2` |
| S3-CT06 | Dia sem positivos | Sem erro nem diferenças inválidas; ausência conforme decisão registrada em S3-01 |
| S3-CT07 | Consultar resultado e sua origem | Pontuação bruta ou ausência, data e identificação da regra recuperáveis |
| S3-CT08 | Fluxo publicado com duas contas participantes e uma externa | Login, lançamento e ranking funcionam; escrita de terceiros e leitura externa negadas |
| S3-CT09 | Alteração própria após encerramento; pontuação fora do limite | Operações negadas conforme prazo e limites definidos em S3-01 |
| S3-CT10 | 07/09/2026 com pontuação histórica e sem lançamento, após encerramento | Em ambos os casos, nenhum ponto aplicado ou penalidade; data excluída do ranking do torneio |
| S3-CT11 | Sábado 05/09 e domingo 06/09 com e sem lançamento; terça 08/09 com resultado válido | Fim de semana ignorado; 08/09 calculado normalmente, sem estender a exclusão do feriado |
| S3-CT12 | Executar duas vezes o provisionamento da exclusão de 07/09/2026 | Uma única exclusão persistida para o torneio |

CT04 será adaptado à carga manual: cadastrar uma conta, vinculá-la ao torneio e carregar pontuações anteriores ao cadastro, mas dentro do período. Elas devem compor o ranking. Repetir uma carga não pode duplicar jogador/data; preservar autoria, origem e regra. Validar ausência antes da data de cadastro segundo a elegibilidade definida, e não segundo a idade da conta.

Esta tabela define os casos planejados; execução e adaptações estão registradas nas evidências e no encerramento. Fixar a data de referência nos testes da penalidade, pois os valores salvos no Excel podem refletir outro dia de cálculo.

Período confirmado do torneio: 01/09/2026 a 30/09/2026, inclusive. Testar os limites: 31/08 e 01/10 não entram no ranking nem geram penalidade neste torneio; 01/09 e 30/09 entram conforme calendário e encerramento do dia. Em uma execução com data de referência 20/09, não aplicar antecipadamente penalidades aos dias restantes de setembro.

Para cada execução, registrar identificador do caso, data, responsável, dados usados, resultado obtido, resultado esperado e evidência (captura de tela ou saída do teste automatizado).

## Automação planejada

### Auditoria por votação — casos futuros da Sprint 6

Casos planejados, não executados e fora do aceite da Sprint 3. Refinar as políticas abertas em [Auditoria de pontuações](auditoria-de-pontuacoes.md) antes de implementar.

| ID | Requisito | Cenário | Resultado esperado |
| --- | --- | --- | --- |
| CT17 | RF13/RF15 | Organizador tenta abrir/encerrar auditoria de outro torneio ou encerrar antes do prazo | Operação negada |
| CT18 | RF14 | Votos pela manutenção e pela invalidação durante o período | Votos registrados segundo elegibilidade e unicidade; voto após prazo negado |
| CT19 | RF15/RF16 | Maioria pela invalidez; organizador escolhe desconsiderar | Contribuição removida no torneio denunciante, sem penalidade automática |
| CT20 | RF15/RF16 | Maioria pela invalidez; organizador escolhe penalidade do dia | Contribuição substituída pela penalidade; reapuração não duplica punição |
| CT21 | RN10 | Mesma pontuação usada nos torneios A e B; decisão de invalidez em A | Somente A afetado; pontuação bruta e resultado em B preservados |
| CT22 | RN11 | Maioria pela manutenção | Pontuação permanece válida |
| CT23 | RN13 | Consultar auditoria encerrada | Votos, apuração, responsável, decisão, punição e alterações rastreáveis conforme acesso autorizado |
| CT24 | RF15 | Empate, nenhum voto ou quórum insuficiente | Resultado conforme política a definir; não presumir invalidação |
| CT25 | RN04/RN10 | Pontuação invalidada era o menor positivo | Recálculo conforme política a definir, restrito ao torneio denunciante e com histórico preservado |

### Ferramentas previstas

- Testes unitários do motor de pontuação com Vitest.
- Testes de integração do banco e das permissões.
- Testes ponta a ponta dos fluxos de login, lançamento, participação em torneio e ranking com Playwright.
