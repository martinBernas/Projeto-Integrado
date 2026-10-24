# Relatórios de torneio — RF19 e RF25

24/10/2026 — Critério vigente confirmado pelo Dono do produto: PDF gerado e todos os envios aceitos pelo Gmail para encaminhamento, sem comprovar entrega/leitura. Adaptação SMTP gratuita implementada localmente, conforme [ADR-014](decisoes/adr-014-relatorios-gmail-sem-custo.md). Substitui confirmação por webhook Resend; erros e resultados incertos continuam bloqueando retirada. Nova migração incremental ainda pendente, sem repetir a inicial já executada.

## Implementação vigente local — 24/10/2026

RF19 implementado localmente na Sprint 8 por autorização do Dono do produto. Captura na transação de encerramento, PDF geral gerado no servidor, evolução das posições acumuladas dos resultados finais por data e todas as duplas empatadas na maior quantidade positiva de inversões. Vínculos presentes no encerramento definem participantes/elegibilidade. Escolhas de cálculo/apresentação não explicitamente confirmadas foram adotadas como escolhas técnicas do incremento, sujeitas à homologação.

Fila privada e integração Resend com PDF anexado por destinatário, confirmação de entrega por webhook assinado e retirada lógica condicionada à geração e a todas as entregas. Prazo técnico de 168 horas; antecipação pelo organizador. Retirada limpa PDF/captura/endereços da fila e bloqueia visibilidade/acesso pela aplicação, preservando dados originais e pontuações pessoais. PDF depois da retirada somente nos e-mails, sem rota de download. RF25 permanece futuro.

[Arquitetura e limites](decisoes/adr-013-relatorios-e-retirada-de-torneios.md), [entrega/testes](sprints/sprint-8.md), [ativação/recuperação](sprints/sprint-8-operacao.md). Migração e todas as operações remotas ainda pendentes. Os registros abaixo descrevem o refinamento anterior; referências à ausência de implementação ou aos testes futuros foram substituídas pela entrega vigente e suas evidências na sprint.

## Registro inicial de refinamento — histórico

## Situação e decisões confirmadas — 24/10/2026

O Dono do produto definiu que a Sprint 8 contempla somente um relatório geral por torneio, gerado no ato do encerramento sobre os resultados congelados. O relatório geral deve conter gráfico de evolução de cada participante para visualizar as trocas de posições e apresentar as duplas mais disputadas: pares com mais trocas de posições entre si durante o torneio.

Relatórios individuais ficam em requisito separado, RF25, para implementação futura, sem sprint ou prazo. Essa decisão substitui a proposta histórica de incluir relatórios individuais em RF19/FB03. Não altera a privacidade das estatísticas pessoais de RF20/RF23 nem autoriza expor votos ou dados pessoais de terceiros.

O ciclo confirmado de RF19 inclui retirada automática do torneio uma semana após encerrar e retirada antecipada pelo organizador durante essa semana. Encerramento/congelamento já existem; não há autorização para encerrar antes da data final. Formato PDF e envio por e-mail aos participantes logo após a geração no encerramento confirmados pelo Dono do produto. Proteção contra falhas confirmada: bloquear retirada automática e antecipada até o PDF ser gerado e todos os envios serem concluídos com sucesso, permitindo nova tentativa. Após a retirada, o PDF fica disponível somente nos e-mails enviados, sem consulta ou download pela aplicação, conforme decisão do Dono do produto. Alcance da retirada sobre os demais dados e política técnica de limpeza permanecem em refinamento. Nenhuma geração, envio ou exclusão implementados nesta revisão.

## Formato e envio confirmados — 24/10/2026

Relatório geral em PDF. Enviar por e-mail aos participantes logo após a geração no ato do encerramento. A confirmação define o comportamento pretendido, sem implicar infraestrutura de envio implementada ou garantia de entrega instantânea. Em caso de falha, permitir nova tentativa e bloquear a retirada automática e antecipada até a geração do PDF e conclusão de todos os envios com sucesso. O critério técnico de sucesso do envio deverá ser definido na integração, sem confundir aceitação pelo provedor com leitura ou entrega comprovada na caixa do destinatário; não incluir e-mails de outros destinatários no conteúdo público do relatório.

## RF19 — conteúdo do relatório geral

- Identificação do torneio e período, encerramento e classificação final: base proposta para contextualizar o relatório.
- Gráfico com uma série por participante, mostrando a evolução de sua posição na classificação acumulada ao longo do torneio. Eixo horizontal por data de jogo e vertical por posição, com primeiro lugar no topo: apresentação proposta para atender ao pedido de visualizar ultrapassagens, ainda sujeita a confirmação.
- Duplas mais disputadas, ordenadas pela quantidade de inversões da ordem entre os dois participantes. A dupla é um par sem ordem: A/B e B/A não são entradas diferentes. Não significa proximidade de pontos nem quantidade de vezes em primeiro lugar.
- Legenda com nomes públicos e identificação das séries além de cor; tabela equivalente ao gráfico e contagem explícita por dupla são propostas de acessibilidade e conferência.

Usar somente resultados aceitos no torneio e seus pontos aplicados, incluindo efeitos de ausência, penalidade e auditoria conforme as regras finais congeladas. Não substituir esses valores pelo histórico pessoal corrigido que tenha sido recusado pelo torneio. A curva reconstruída a partir do estado final representa o acumulado final por data; não afirmar que reproduz a tela que as pessoas viram naquele dia antes de correções ou decisões posteriores. Confirmar essa interpretação antes de implementar.

## Cálculo — tratamento de empates confirmado em 24/10/2026

O Dono do produto confirmou o tratamento apresentado: inversão direta conta uma troca; A à frente → empate → B à frente conta uma troca; A à frente → empate → A à frente não conta. Empates intermediários preservam a última ordem estrita e não geram trocas isoladamente. Esse ponto deixou de ser proposta. A apresentação de todas as duplas líderes empatadas foi incluída na proposta anterior; a confirmação recebida foi específica ao tratamento dos empates nas inversões, sem novo aceite explícito dos demais pontos.

1. Percorrer cronologicamente as datas elegíveis do torneio, com resultado consolidado por dia. Acumular pontos aplicados até cada data e calcular posições decrescentes por total acumulado.
2. Manter o tratamento atual de empate do ranking: totais iguais compartilham posição, com saltos posteriores (1, 1, 3). Nome/ID ordenam somente a apresentação, sem criar ultrapassagem em empate.
3. Para cada par de participantes, comparar os totais acumulados nas datas em que ambos já são elegíveis. O primeiro resultado não empatado estabelece a ordem inicial; não conta como troca.
4. Contar uma troca quando a liderança estrita do par se inverte. Empate não conta; conservar a última ordem estrita durante empates. Assim, A à frente → empate → B à frente conta uma troca; A à frente → empate → A à frente conta zero.
5. Exibir todas as duplas empatadas na maior contagem positiva como “mais disputadas”, com quantidade de trocas. Se nenhuma dupla teve inversão, informar que não houve troca de posições entre pares; não escolher dupla arbitrária. Quantidade de duplas a apresentar além das líderes ainda a definir.
6. Antes da elegibilidade de um participante, não atribuir posição nem contar troca. Datas excluídas não criam novos resultados; ingresso posterior inicia a comparação quando ambos forem elegíveis. Confirmar os casos de participantes removidos e composição histórica do relatório antes do desenho.

Exemplo para validação futura:

| Data | Acumulado A | Acumulado B | Relação e contagem |
| --- | --- | --- | --- |
| Dia 1 | 100 | 80 | A à frente; ordem inicial, zero trocas |
| Dia 2 | 150 | 170 | B à frente; primeira troca |
| Dia 3 | 220 | 220 | Empate; mantém uma troca |
| Dia 4 | 300 | 280 | A à frente; segunda troca |

Uma mudança da posição absoluta causada por um terceiro participante não conta como troca entre A e B se a ordem relativa entre eles permanecer igual. O cruzamento de linhas no desenho não deve ser usado como algoritmo de contagem.

## Proteção da retirada — confirmada em 24/10/2026

O Dono do produto confirmou: permitir nova tentativa em caso de falha e bloquear tanto retirada automática quanto antecipada pelo organizador enquanto o relatório não for gerado e todos os envios não forem concluídos com sucesso. Completar uma semana não dispensa essa condição. O torneio permanece encerrado/congelado durante o tratamento da falha. A geração no encerramento é o fluxo pretendido; falha operacional deve ficar identificada, sem afirmar geração ou envio concluídos.

Na implementação, registrar resultados por destinatário e evitar duplicar envios já concluídos ao tentar novamente; esses mecanismos são escolhas técnicas para cumprir a proteção. Definir o critério verificável de sucesso na integração de e-mail. Falha persistente de endereço/serviço não autoriza ignorar destinatário ou retirar por exceção sem nova decisão do Dono do produto.

## Disponibilidade após retirada — confirmada em 24/10/2026

Após a retirada automática ou antecipada do torneio, o relatório geral ficará disponível somente nos e-mails enviados. A aplicação não oferecerá consulta, histórico ou download desse PDF após a retirada. A solução de envio deve permitir acesso pelo próprio e-mail sem depender de um link da aplicação que deixe de funcionar após a retirada; o mecanismo de transporte será definido no desenho técnico.

Esta decisão define a disponibilidade funcional, sem afirmar remoção física já implementada ou estabelecer retenção indefinida em armazenamento interno. A política de limpeza de eventuais arquivos temporários, metadados de envio e dados exclusivos do torneio deverá ser definida no desenho. RF25 futuro não autoriza manter o PDF acessível na aplicação após retirada.

## RF25 — relatórios individuais futuros

O sistema deverá oferecer relatórios individuais de desempenho por participante no contexto de um torneio. Requisito solicitado pelo Dono do produto em 24/10/2026, para implementação futura, fora da Sprint 8, sem sprint ou prazo definidos.

Conteúdo, métricas, formato, destinatários, permissões, canal/momento de entrega e disponibilidade após retirada do torneio serão refinados antes da implementação. Não transportar automaticamente as propostas históricas de médias e contagens de FB03 para critérios aprovados de RF25. Avaliar a preservação de dados necessária ao requisito futuro antes de decidir remoção física em RF19; isso não autoriza retenção indefinida ou mudança silenciosa da retirada já confirmada.

## Critérios planejados e pendências

Tratamento dos empates nas inversões confirmado. Confirmar os demais pontos da evolução (acumulado final por data e elegibilidade), todas as duplas líderes versus quantidade limitada e participantes removidos. Formato PDF e envio por e-mail aos participantes logo após a geração no encerramento confirmados. Tratamento de falha confirmado: nova tentativa e bloqueio de qualquer retirada enquanto geração ou algum envio não concluir com sucesso. Acesso após retirada confirmado: somente nos e-mails enviados, sem download pela aplicação. Nenhuma dessas decisões em aberto altera a geração no ato do encerramento já confirmada.

Testes futuros (empates nas inversões já têm regra confirmada; demais propostas dependem do refinamento): última posição do gráfico igual à classificação final; acumulados com ausências, sanções e valores divergentes entre torneios; inversões diretas e através de empates; empate sem inversão; múltiplas duplas líderes; zero inversões, zero/um participante e ausência de resultados; ingresso posterior, datas excluídas e participantes removidos conforme definição; isolamento, sigilo e renderização legível do gráfico no formato escolhido. Os exemplos documentais não foram executados como testes da aplicação.

Entrega atual exclusivamente documental. Arquitetura e modelo de dados vigentes não alterados. Desenho técnico, eventual migração/backup, testes locais, publicação e homologação permanecem etapas futuras da implementação.
