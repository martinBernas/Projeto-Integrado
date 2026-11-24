# Sprint 8 — encerramento e aceite

**Situação: encerrada em 31/10/2026 por decisão do Dono do produto.**

Aceite explícito: “agora sim podemos dar a sprint como encerrada”, após o refinamento da navegação do gráfico com mouse. Este registro substitui os estados anteriores de sprint aberta e aceite pendente, incluindo RF26/RF27 e seus refinamentos. A confirmação posterior identifica o deployment de produção efetivamente testado, conforme evidência abaixo.

## Entregas aceitas

- Relatórios de encerramento e envio individual por Gmail, com retirada lógica protegida; modo Claro/Escuro/Sistema.
- Correção genérica do PDF: pontuações acumuladas, panorama integral e detalhes de cinco datas pontuadas, sobra unitária incorporada ao anterior, mínimo/máximo locais, uma página por gráfico, até cinco duplas mais disputadas e identificação por nomes.
- PDFs HCM/Aztecas corrigidos e substituídos após backup validado, com captura, horários e contadores preservados. Reenvio pontual concluído: HCM 18/18 e Aztecas 6/6 `sent`, sem pendências/falhas/incertos no retorno fornecido. Não repetir essas operações.
- Estatísticas do torneio com panorama acumulado e Nêmesis pessoal, seleção de jogadores, zoom no cursor pela roda do mouse, arrasto da área ampliada e controles acessíveis alternativos.
- Requisitos, decisões arquiteturais, diagramas, testes e procedimentos operacionais correspondentes registrados.

## Evidências e limites

31/10/2026 — Dono do produto esclareceu que seu teste e aceite se referem ao deploy **Production / Ready**, branch `main`, commit `ec3afb5`, título “S8: Navegacao pelo grafico com o mouse”. Captura da lista Project Deployments da Vercel apresentada na conversa confirma esses identificadores. Também mostra as revisões anteriores Ready `737c29a` (zoom) e `40a31c4` (estatísticas). Publicação da última revisão e teste/aceite pelo Dono do produto em produção confirmados; sem inspeção direta de logs/URL pelo agente e sem inferir execução de cada cenário do roteiro remoto. Resolve o acompanhamento anterior de publicação não confirmada.

Modo escuro, recebimento dos relatórios no primeiro ensaio e retirada antecipada foram confirmados anteriormente pelo Dono do produto. Publicação do gerador v5, substituição e reenvio dos dois torneios têm evidências específicas já registradas. `sent` comprova aceitação SMTP, não leitura nas caixas.

Última suíte completa local: 154 testes aprovados antes da navegação por mouse. Para o último incremento: sete testes pertinentes aprovados, incluindo ancoragem e limites; build/TypeScript e lint específico aprovados. Navegador com dados fictícios verificou roda, arrasto, soltura, zoom/reset e seleção. A suíte completa não foi repetida após esse incremento. [Evidências detalhadas](sprint-8-estatisticas-progressao-nemesis.md).

## Acompanhamento posterior ao encerramento

O Dono do produto encerra a sprint sem transformar ausência de evidência em execução comprovada:

- Acompanhamento da retirada automática encerrado: em 31/10/2026, o Dono do produto informou que o torneio de ensaio pendente foi removido e não consta mais nas suas telas de gestão. Evidência funcional relatada para a conta do organizador; sem consulta direta ao banco, horário exato de execução ou nova confirmação de visibilidade pela conta de participante. Não implica eliminação física de todos os registros internos.
- Cenários remotos detalhados não relatados e observação operacional permanecem acompanhamento, sem manter a sprint aberta ou presumir homologação individual de cada caso.

Não há migração adicional para RF26/RF27 ou navegação com mouse. Backups privados anteriores permanecem fora do versionamento. Nenhuma nova operação remota, envio ou alteração de dados foi realizada para encerrar a sprint. Próxima sprint depende de definição de escopo pelo Dono do produto.

Atualização exclusivamente documental; verificação por `git diff --check`, sem repetição de testes da aplicação.
