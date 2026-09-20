# Sprint 3 — MVP utilizável

Data do planejamento e execução: 20/09/2026, conforme informado pelo Dono do produto. Meta: primeira versão ao fim da execução de hoje. Situação: planejamento revisado; desenvolvimento pendente. Capacidade em horas da equipe: não informada.

## Objetivo e demonstração final

Um cliente entra com sua conta, acessa o torneio GeoGuaras já cadastrado, registra sua pontuação e vê o resultado diário e o ranking acumulado calculados segundo as regras do MVP. O torneio deve existir no ambiente publicado antes da entrega.

## Decisões confirmadas pelo Dono do produto

- Executar a Sprint 3 em 20/09/2026.
- Período do torneio: 01/09/2026 a 30/09/2026, inclusive. Histórico e ranking deste torneio consideram somente datas elegíveis de setembro; agosto, outubro e saldos prévios ficam fora.
- Calendário: segunda a sexta, com exclusão explícita de 07/09/2026 por feriado. Sábados, domingos e esse feriado não geram pontos nem penalidades, inclusive na carga histórica.
- Aplicar as regras de setembro: cálculo relativo ao menor positivo e penalidade de −2.500 para ausência após a virada do dia.
- Reutilizar o cadastro e o login concluídos e validados na Sprint 2. Após o cadastro, o Dono do produto inserirá manualmente o histórico de cada jogador. Não desenvolver importador de Excel nesta sprint.
- A carga histórica será uma operação administrativa documentada, vinculada às contas cadastradas, e não ficará sujeita ao prazo do formulário de lançamento diário. Validar jogador, data, período e duplicidade; registrar origem da carga e recalcular os dias afetados.

## Escopo obrigatório

- Reutilizar cadastro, login e sessão existentes. Cadastro e login foram concluídos e validados na Sprint 2 (`3f8c614`, com confirmação do Dono do produto); não são novas entregas de desenvolvimento. Em S3-06, verificar apenas regressão e integração do acesso com o torneio no ambiente publicado.
- Provisionar um único torneio, com identificador estável, período, fuso, calendário e regra identificada como `mvp-v1`. A configuração fica nos dados de implantação; não haverá editor de torneios ou regras nesta entrega.
- Associar a lista inicial de participantes a contas reais por procedimento administrativo documentado e repetível, sem duplicar torneio ou vínculos e sem criar senhas no código. Cadastro público não concede participação automaticamente.
- Registrar pontuação própria, consultar histórico e impedir duplicidade de jogador/data de jogo. Validar limites, data e prazo no servidor e no banco conforme decisões abaixo.
- Calcular pontos relativos ao menor positivo, penalidades dos dias encerrados e total do torneio. Mostrar o dia corrente como provisório.
- Exibir regras, período, participantes, resultados diários e ranking acumulado em celular e computador.
- Preservar dados brutos e identificação da regra aplicada; registrar alterações permitidas. Recalcular não pode duplicar penalidades nem modificar silenciosamente resultados encerrados.
- Publicar, executar os testes essenciais e registrar evidências e o commit entregue.

## Referência do Excel e regra fixa

Fonte: `GeoGuaras.xlsx`, lido sem alterações. Os valores salvos não representam uma nova execução das fórmulas dependentes de `TODAY()`.

| Evidência | Regra observada | Aplicação proposta |
| --- | --- | --- |
| `Diario!C17` | Menor valor estritamente positivo de `C2:C14` | Buscar o menor positivo entre os participantes do dia; empate no menor produz zero para todos os empatados |
| `geral!C2` | Resultado positivo menos o menor; ausência vale zero nesse bloco | Agosto é uma regra histórica distinta; não aplicar a penalidade de setembro retroativamente |
| `geral!S2` e `geral!U33` | Resultado positivo menos o menor; ausência recebe −2.500 quando a data é anterior a hoje | Aplicar a regra confirmada de setembro: penalizar somente após o encerramento do dia no fuso do torneio |
| `geral!AO2` | Soma dos resultados de setembro | Somar os dias elegíveis do período do torneio, incluindo o histórico carregado manualmente |
| `geral!R2` e `geral!AS2` | Agosto inclui saldo prévio; acumulado soma agosto e setembro | Histórico será carregado manualmente pelo Dono do produto; saldos prévios e períodos com outra regra não entram automaticamente |
| `Diario!V17` | `#NUM!` em dia sem positivos | Tratar ausência de positivos sem erro e sem ranking diário de diferenças |

O modo relativo, a penalidade −2.500 e o calendário de segunda a sexta estão confirmados. O Dono do produto determinou a exclusão de 07/09/2026 por feriado, mesmo que a data exista no Excel. Essa decisão prevalece sobre a planilha: qualquer pontuação pessoal nessa data não entra no cálculo do torneio e nenhuma ausência é penalizada. Provisionar a exclusão de forma idempotente. O fuso `America/Sao_Paulo` permanece como proposta operacional.

Em dia encerrado sem nenhum positivo, aplicar a penalidade de setembro aos participantes elegíveis, mantendo a indicação de ausência de resultados válidos. Dias futuros, fora do período ou excluídos não geram penalidade. A elegibilidade dos participantes deve ser fechada em S3-01 antes de consolidar resultados reais.

## Preparação operacional e decisões restantes

1. Disponibilidade em horas da equipe para a execução de hoje (20/09/2026), reservando tempo para validação/publicação.
2. Período confirmado: 01/09/2026 a 30/09/2026, inclusive. A carga manual deve respeitar esse intervalo e não incluir datas futuras como resultados já jogados.
3. Organizador responsável, participantes e contas correspondentes; confirmar fuso. Calendário e exclusão de 07/09/2026 já estão definidos.
4. Reproduzir a regra confirmada de setembro também em dia encerrado sem positivos: aplicar a penalidade sem calcular diferença ou exibir ranking diário de diferenças.
5. Limites da pontuação e tratamento de zero. A fórmula trata valores não positivos como ausência; o formulário não deve confundir ausência com resultado válido.
6. Confirmar prazo: proposta de envio e correção próprios até a virada do dia no fuso do torneio, sem lançamento tardio pela interface do jogador nesta entrega. A carga administrativa de histórico é uma operação separada e permitida. O Excel não comprova esse prazo de envio.
7. Associar manualmente as contas cadastradas aos participantes do torneio. O histórico dentro do período deve contar mesmo quando anterior ao cadastro/vínculo. Confirmar se todos participam desde o início ou se há datas individuais de elegibilidade para penalidades; a data de cadastro não define automaticamente essa elegibilidade.

## Execução e aceite por entrega

| ID | Trabalho | Aceite |
| --- | --- | --- |
| S3-01 | Fechar decisões acima e registrar a configuração inicial | Dados operacionais e regras sem ambiguidades para provisionamento e testes |
| S3-02 | Migração incremental, seed idempotente, revisão de RLS e procedimento de carga manual | Executar provisionamento duas vezes mantém um torneio e os mesmos vínculos; não participante não lê resultados; jogador não administra o torneio; carga manual associa histórico à conta correta e não duplica jogador/data |
| S3-03 | Formulário e histórico pessoal | Usuário salva/consulta resultado próprio; duplicidade, data inválida, prazo vencido e alteração de terceiro são negados |
| S3-04 | Motor de cálculo e rastreabilidade mínima | Exemplos reconciliados; empate, dia vazio, exclusão, virada de dia e repetição de cálculo cobertos; regra aplicada identificável |
| S3-05 | Página do torneio e classificação | Participante vê suas regras, resultados e total; maior total primeiro; empate de total preserva mesma posição, sem inventar desempate competitivo |
| S3-06 | Testes, publicação e documentação | Fluxo completo com contas distintas no ambiente publicado; evidências, URL, commit e procedimento de provisionamento registrados |

Antes de implementar S3-04, ajustar a representação de ausência: a tabela inicial de resultados exige `personal_score_id`, mas ausência não tem lançamento. Não fabricar pontuações brutas para representar penalidades. Também revisar as políticas que consultam torneios e participantes reciprocamente e verificar que não ocorra recursão de RLS.

O cálculo coletivo deve executar em contexto autorizado, sem expor pontuações pessoais de terceiros fora do torneio. Um resultado ainda aberto pode mudar com novos lançamentos; resultados encerrados devem manter sua explicação e não ser reescritos silenciosamente.

## Adiado para entregas futuras

- Auditoria por votação, apuração pelo organizador e punição restrita ao torneio denunciante (RF13–RF16), prevista para a Sprint 6. Ver [fluxo futuro](../auditoria-de-pontuacoes.md).

- Criar, editar e encerrar torneios pela interface; múltiplos torneios e navegação entre eles.
- Gerenciar participantes pela interface, incluindo fluxos autônomos de ingresso tardio. O vínculo manual e o cômputo de histórico anterior ao cadastro são necessários no MVP.
- Configurar modos absoluto/relativo, penalidades, calendário e feriados pela interface.
- Editor e histórico completo de versões de regras, moderação e aprovação de lançamentos.
- Importador automático de Excel, saldos prévios agregados, relatórios avançados e filtros de períodos arbitrários. A carga manual de pontuações históricas pelo Dono do produto faz parte da operação do MVP.

O banco pode manter entidades preparadas para essas evoluções. As permissões de criação/alteração devem acompanhar o escopo: esconder botões não basta para impedir configuração pela API.

## Critério de encerramento

Todas as entregas obrigatórias aceitas, carga histórica manual validada com uma amostra, torneio provisionado no ambiente publicado e fluxo login → lançamento → cálculo → ranking demonstrado. Testes de cálculo e acesso executados, sem falhas bloqueadoras. Documentação atualizada com limitações reais e referência ao commit entregue. Não declarar encerramento apenas porque as telas estão prontas.

Com execução concentrada em 20/09/2026 e sem capacidade em horas informada, a viabilidade deve ser reavaliada ao concluir o primeiro fluxo integrado. Priorizar S3-01 e S3-02, depois entregar lançamento → cálculo → ranking e reservar a etapa final para S3-06. Se houver pressão de prazo, reduzir acabamento visual e relatórios extras; login, isolamento de dados, lançamento, cálculo correto, ranking e publicação formam o mínimo inseparável.
