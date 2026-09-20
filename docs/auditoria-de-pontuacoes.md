# Auditoria de pontuações por votação

Situação: requisito futuro solicitado pelo Dono do produto, previsto para refinamento e desenvolvimento na Sprint 6. Não integra o escopo nem o aceite da Sprint 3. Requisitos RF13–RF16 e regras RN10–RN13.

## Fluxo definido

1. O gerente do torneio (organizador) marca uma pontuação como sujeita a auditoria naquele torneio. O sistema registra a pontuação, o torneio, quem abriu a auditoria e o período de avaliação.
2. Durante o período de avaliação, os demais usuários elegíveis votam pela invalidação ou manutenção da pontuação.
3. Após o término do período, o organizador contabiliza os votos e encerra a auditoria. Não se trata de uma invalidação automática ao abrir a denúncia ou receber um voto.
4. Se a maioria optar pela invalidez, a pontuação fica inválida para o torneio que abriu a auditoria. A escolha do organizador é sobre a punição, sem substituir o resultado majoritário da votação.
5. O organizador escolhe entre desconsiderar a pontuação, sem penalidade adicional, ou aplicar a penalidade do dia em substituição à contribuição original.
6. O sistema registra a apuração e a punição e atualiza os resultados afetados somente nesse torneio, preservando o histórico anterior e a explicação da alteração. Uma maioria pela manutenção preserva a validade da pontuação.

## Isolamento e rastreabilidade

A auditoria deve referenciar `torneio_id` e `pontuacao_pessoal_id`. A decisão pertence a essa associação, não a um estado global de `PontuacaoPessoal`. A pontuação bruta original permanece disponível para rastreabilidade e para os outros torneios do jogador.

Exemplo: a mesma pontuação é usada nos torneios A e B. Uma votação em A determina invalidez. A desconsidera sua contribuição ou aplica a penalidade escolhida pelo organizador de A. O resultado em B e a pontuação pessoal permanecem inalterados.

Registrar votos e sua autoria, datas da avaliação, totais apurados, responsável pelo encerramento, decisão, punição, valor/regra da penalidade e resultados anteriores/posteriores. A visibilidade da autoria dos votos ainda será definida; rastreabilidade interna não implica votação pública.

Repetir uma apuração não pode duplicar punição. A alternativa de desconsiderar a pontuação não pode ser convertida inadvertidamente em ausência penalizada pelo motor de cálculo. Controles de acesso devem validar no servidor e no banco tanto o torneio administrado quanto a elegibilidade para votar.

## Refinamento antes da implementação

- Eleitores: confirmar se somente participantes do torneio podem votar, e se o auditado e o organizador podem participar. Não conceder acesso a usuários externos por interpretação do termo “outros usuários”.
- Votação: definir duração e fuso, quórum, se maioria significa votos válidos ou eleitores elegíveis, tratamento de empate, abstenções e nenhuma participação. Esses casos não autorizam invalidação por padrão.
- Integridade: definir um voto por eleitor/auditoria, possibilidade de alteração do voto, auditorias duplicadas, recurso e reabertura.
- Período de análise: decidir se a pontuação permanece no ranking ou fica provisoriamente suspensa enquanto a auditoria está aberta.
- Penalidade: decidir quando o organizador escolhe a alternativa e qual versão/valor da penalidade vale para a data auditada.
- Modo relativo: definir o recálculo quando a pontuação invalidada era o menor positivo do dia. Isso pode afetar resultados dos demais participantes do mesmo torneio; jamais os de outros torneios.
- Registrar motivo/evidências da denúncia e regras de visibilidade, se exigidos pelo Dono do produto.

## Critérios de aceite futuros

- Organizador abre e encerra auditorias somente de seu torneio, respeitando o período de avaliação.
- Votação respeita elegibilidade, prazo e política de unicidade definidos no refinamento.
- Maioria pela invalidez produz a punição selecionada; maioria pela manutenção preserva a pontuação.
- Empate, quórum insuficiente e ausência de votos seguem política explícita, com testes próprios.
- Pontuação usada em dois torneios é afetada somente no torneio denunciante; valor bruto pessoal preservado.
- As duas alternativas de punição são testadas separadamente, incluindo repetição do processamento sem duplicidade.
- Apuração, decisão e alterações no ranking são rastreáveis, inclusive no caso de mudança do menor positivo.
