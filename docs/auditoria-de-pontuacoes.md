# Auditoria de pontuações por votação

18/10/2026 — Integração local com S7-01: a restrição de correção pessoal sob auditoria continua para o dia atual; dias passados podem ser corrigidos com justificativa porque os torneios mantêm seus valores locais. Auditoria solicitada/aberta bloqueia aprovação retroativa naquele torneio, mas permite recusa. Pedido de auditoria captura o bruto efetivo do torneio, que pode divergir do histórico pessoal. Aprovação posterior não elimina sanção nem permite nova auditoria para a mesma pontuação/torneio. Regras de voto, prazo, eleitorado e sigilo não mudam. Migração incremental/publicação/homologação ainda pendentes. [ADR-011](decisoes/adr-011-lancamentos-retroativos.md).

Situação em 11/10/2026: regras aprovadas pelo Dono do produto e RF13–RF16/RN10–RN13 implementados localmente na Sprint 6. 82 testes, lint e build aprovados; migração remota, publicação, homologação e aceite pendentes. Não integra o aceite histórico da Sprint 3. [Entrega](sprints/sprint-6.md), [operação](sprints/sprint-6-operacao.md) e [ADR-006](decisoes/adr-006-auditoria-por-votacao.md).

## Fluxo definido

1. Qualquer jogador participante do torneio pode solicitar auditoria de uma pontuação daquele torneio, com justificativa obrigatória, conforme decisão do Dono do produto em 11/10/2026. O sistema registra pontuação, torneio, solicitante, justificativa e data do pedido. O organizador aprova o pedido antes de abrir a votação; as 48 horas começam na abertura, quando o eleitorado é definido. Esta decisão substitui a restrição anterior de iniciativa exclusiva do organizador.
2. Durante o período de avaliação, os demais usuários elegíveis votam pela invalidação ou manutenção da pontuação.
3. Após o término do período, o organizador contabiliza os votos e encerra a auditoria. Não se trata de uma invalidação automática ao abrir a denúncia ou receber um voto.
4. Se a maioria optar pela invalidez, a pontuação fica inválida para o torneio que abriu a auditoria. A escolha do organizador é sobre a punição, sem substituir o resultado majoritário da votação.
5. O organizador escolhe entre desconsiderar a pontuação, sem penalidade adicional, ou aplicar a penalidade do dia em substituição à contribuição original.
6. O sistema registra a apuração e a punição e atualiza os resultados afetados somente nesse torneio, preservando o histórico anterior e a explicação da alteração. Uma maioria pela manutenção preserva a validade da pontuação.

## Isolamento e rastreabilidade

A auditoria deve referenciar `torneio_id` e `pontuacao_pessoal_id`. A decisão pertence a essa associação, não a um estado global de `PontuacaoPessoal`. A pontuação bruta original permanece disponível para rastreabilidade e para os outros torneios do jogador.

Exemplo: a mesma pontuação é usada nos torneios A e B. Uma votação em A determina invalidez. A desconsidera sua contribuição ou aplica a penalidade escolhida pelo organizador de A. O resultado em B e a pontuação pessoal permanecem inalterados.

Registrar votos e sua autoria, datas da avaliação, totais apurados, responsável pelo encerramento, decisão, punição, valor/regra da penalidade e resultados anteriores/posteriores. Por decisão do Dono do produto em 11/10/2026, os votos são secretos: cada eleitor consulta apenas seu próprio voto; jogadores e organizador não recebem a associação entre outros eleitores e seus votos na aplicação. A autoria é preservada internamente para rastreabilidade. O resultado agregado da apuração é consultável sem nomes de votantes. As respostas das consultas e as permissões do banco devem preservar esse sigilo.

Repetir uma apuração não pode duplicar punição. A alternativa de desconsiderar a pontuação não pode ser convertida inadvertidamente em ausência penalizada pelo motor de cálculo. Controles de acesso devem validar no servidor e no banco tanto o torneio administrado quanto a elegibilidade para votar.

## Registro histórico do refinamento

Refinamento concluído: Dono do produto aprovou também manter pontuação durante a avaliação, uma auditoria por pontuação/torneio sem recurso/reabertura, votos secretos e recálculo sem inválido na referência relativa. Punição escolhida na apuração; regra/valor da data auditada preservados na decisão. Motivo obrigatório no pedido. O levantamento abaixo preserva as perguntas anteriores, substituídas pelas decisões atuais, e não é lista de pendências funcionais.

Decisões confirmadas em 11/10/2026: eleitores são os participantes na abertura, excluindo o auditado; organizador vota se participante; votação dura 48 horas; maioria simples dos votos recebidos, sem quórum mínimo; empate ou ausência de votos mantém a pontuação; voto alterável até o prazo. Os itens abaixo que tratam dessas definições preservam o levantamento anterior e não representam pendências atuais.

- Solicitação por jogador confirmada: restrita aos participantes do torneio, com justificativa obrigatória e aprovação prévia do organizador para abertura da votação.

- Eleitores: confirmar se somente participantes do torneio podem votar, e se o auditado e o organizador podem participar. Não conceder acesso a usuários externos por interpretação do termo “outros usuários”.
- Votação: definir duração e fuso, quórum, se maioria significa votos válidos ou eleitores elegíveis, tratamento de empate, abstenções e nenhuma participação. Esses casos não autorizam invalidação por padrão.
- Integridade: definir um voto por eleitor/auditoria, possibilidade de alteração do voto, auditorias duplicadas, recurso e reabertura.
- Período de análise: decidir se a pontuação permanece no ranking ou fica provisoriamente suspensa enquanto a auditoria está aberta.
- Penalidade: decidir quando o organizador escolhe a alternativa e qual versão/valor da penalidade vale para a data auditada.
- Modo relativo: definir o recálculo quando a pontuação invalidada era o menor positivo do dia. Isso pode afetar resultados dos demais participantes do mesmo torneio; jamais os de outros torneios.
- Registrar motivo/evidências da denúncia e regras de visibilidade, se exigidos pelo Dono do produto.

## Critérios de aceite da Sprint 6

- Participante solicita com justificativa; organizador aprova/rejeita e apura somente seu torneio, respeitando o período de avaliação.
- Votação respeita elegibilidade, prazo e política de unicidade definidos no refinamento.
- Maioria pela invalidez produz a punição selecionada; maioria pela manutenção preserva a pontuação.
- Empate e ausência de votos mantêm a pontuação; não há quórum mínimo. Cenários possuem testes próprios.
- Pontuação usada em dois torneios é afetada somente no torneio denunciante; valor bruto pessoal preservado.
- As duas alternativas de punição são testadas separadamente, incluindo repetição do processamento sem duplicidade.
- Apuração, decisão e alterações no ranking são rastreáveis, inclusive no caso de mudança do menor positivo.
