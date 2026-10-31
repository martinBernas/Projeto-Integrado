# RF26/RF27 — progressão acumulada e Nêmesis nas estatísticas

31/10/2026. Implementação local por solicitação do Dono do produto. Requisitos formalmente registrados antes da entrega, conforme pedido adicional. Publicação e homologação/aceite desta tela ainda pendentes. Incremento separado da correção e do reenvio de PDFs já concluídos.

## Requisitos e comportamento

RF26: incluir na tela de estatísticas do torneio o gráfico completo do PDF, mostrando a pontuação acumulada de todos os participantes por data pontuada. Período integral, sem dividir jogadores ou criar os gráficos parciais de cinco dias; somente datas consolidadas encerradas, anteriores ao `today` de São Paulo retornado pelo banco. Pontos aplicados do próprio torneio incluem ausências, zeros e sanções; encerrados mantêm o estado congelado. Elegibilidade e datas excluídas respeitadas. Eixo ordinal sem espaços de dias inválidos, min/max reais, tratamento de pontuação constante e uma única data. Legenda identificada por nomes/cor/traços, destaque da linha do jogador conectado e tabela expansível completa. Gráfico e tabela têm rolagem local no celular; página não exige rolagem horizontal global.

RF27: mostrar ao jogador os adversários com quem mais inverteu a liderança nos acumulados. Contar inversões da última ordem estrita do par após elegibilidade de ambos. Empates isolados e ordem inicial não somam; mudança causada apenas por um terceiro não conta como inversão entre dois jogadores cuja ordem permaneceu. A > empate > B = 1; A > empate > A = 0. Até cinco adversários com trocas positivas, ordenados por quantidade e depois nome/ID; esse limite e desempate visual são escolhas técnicas, não novo aceite explícito. Líderes empatados visíveis recebem o mesmo destaque. Sem inversões, informar isso; organizador não participante não recebe adversários pessoais fictícios.

O pedido do Dono do produto confirma a exibição de nomes públicos e acumulados identificados nesse contexto autorizado. Não muda a privacidade das médias individuais dos demais, das estatísticas pessoais globais, endereços ou votos. “Nêmesis” usa exclusivamente a identidade da sessão; parâmetros de URL não selecionam outro perfil. Indicadores e comparação diária anteriores de RF21 continuam presentes.

## Implementação e decisões

- Novo núcleo puro `web/src/lib/tournament-progression.ts`, extraído do cálculo do relatório sem mudar suas fórmulas. Retorna todos os pares positivos ordenados, necessários para o recorte pessoal. `tournament-report.ts` mantém apenas as cinco duplas globais na saída do PDF.
- `tournament-statistics.ts` reaproveita o conjunto consolidado filtrado tanto nas métricas anteriores quanto no novo núcleo; Nêmesis filtra o jogador antes do corte de cinco. Isso evita perder adversários que não estejam entre as duplas líderes globais.
- Novos componentes de servidor `cumulative-chart.tsx` e `nemesis.tsx` na página existente; sem dependência/consulta/grant/tabela/RPC nova. Cores para claro/escuro em tokens de `globals.css`.
- Autorização permanece na página/RPC existentes; nada de cálculo com chave privilegiada ou acesso ao histórico pessoal atual. Retirada lógica continua impedindo acesso.
- Decisão arquitetural e consequências em [ADR-016](../decisoes/adr-016-progressao-acumulada-e-nemesis.md); diagrama atualizado em [estatísticas](../diagramas/estatisticas-torneio.md).

## Testes e evidências locais

Suíte completa: 150 testes aprovados. Lint sem erros, com um aviso preexistente em `tests/retroactive-scores.test.mjs`; lint específico dos arquivos alterados sem avisos. Build/TypeScript aprovados.

Testes novos/refinados: mesmos acumulados/classificação do PDF; Nêmesis pessoal fora do top cinco global; inversões diretas/através de empates e ingresso posterior; exclusão de hoje/futuro, datas fora do período, excluídas e provisórias/pendentes; ausência de dados, domínio zero, uma data, organizador sem participação, IDs/brutos não renderizados, sessão obrigatória, acesso negado e erro seguro. A regressão real regenerou somente buffers locais dos dois PDFs congelados e confirmou SHA-256 idêntico: HCM `322ee0cf56597aed808748f6871830fae4346c1f5c4e010f6c5bc1332bf63556`, Aztecas `89d29405d438c35c649996e0fef5f9971bbcae08b8d27acc048d532d79f1d881`. Nenhum arquivo remoto foi substituído e nenhum e-mail enviado por essa verificação.

Revisão visual de HTML renderizado pelos componentes reais com dados sintéticos de 18 participantes e 21 datas, usando CSS do build. Playwright confirmou claro/escuro em 1280 e 375 px: 18 curvas/entradas de legenda, 21 linhas na tabela e largura do documento igual à viewport (1280/375), com rolagem limitada às regiões internas. Cores de tema verificadas. Capturas inspecionadas em `web/tmp/rf26-light-1280.png`, `rf26-dark-1280.png`, `rf26-light-375.png`, `rf26-dark-375.png`, ignoradas pelo Git. A primeira tentativa de lançar navegador foi bloqueada pelo sandbox Windows; execução autorizada fora dele concluiu. Esta revisão usa sessão/RPC simuladas com dados fictícios; não é homologação remota autenticada do Dono do produto.

`git diff --check` aprovado. Nenhuma alteração de esquema ou de dados; backup de migração não se aplica. Backups privados anteriores preservados. Não houve publicação nem nova operação remota.

## Pendências e operação

Publicar o incremento pelo fluxo do projeto; não há SQL adicional a aplicar. Após publicar, abrir as estatísticas de um torneio autorizado e conferir panorama, próprios adversários/contagens, temas, celular e tabela. Validar com jogador participante e organizador não participante. Registrar aceite e evidência remota separadamente. Reversão consiste em restaurar a versão anterior da interface/cálculo, sem restaurar banco ou interferir nas filas de e-mail.

Limites: processamento/renderização crescem com histórico/elenco; sem benchmark remoto ou atualização em tempo real. O gráfico reconstrói os acumulados dos valores aceitos atualmente por data, não versões históricas vistas antes de correções/auditorias. A disponibilidade continua limitada pelo acesso ao torneio e sua retirada.

## Incremento RF26 — zoom e seleção, 31/10/2026

Pedidos explícitos do Dono do produto registrados em RF26: zoom in/out e marcar/desmarcar jogadores para isolar dados. Implementação local concluída: todos selecionados inicialmente, caixas na legenda com cores/traços estáveis, ações Marcar todos/Desmarcar todos/Somente você; escala pelos acumulados selecionados e reset de zoom ao mudar seleção. Sem selecionados, gráfico substituído por orientação. Zoom de 100% a 800%, deslocamento horizontal/vertical limitado aos dados e botão Visão completa. Tabela mantém todos os participantes/datas. Não altera cálculos do PDF, Nêmesis ou resultados. Escolhas técnicas: botões nativos por teclado/toque, sem gestos de roda/pinça ou persistência entre navegações; eixo X mantém pelo menos um intervalo pontuado.

Substitui a decisão anterior de SVG somente no servidor: `CumulativePlot` recebe projeção mínima (nomes públicos, próprio, datas, acumulados elegíveis), sem IDs/brutos. Tabela, autenticação, consolidação e Nêmesis continuam no servidor. Helper puro de domínio/zoom/pan; sem nova dependência, consulta, permissão, banco ou migração. ADR-016, arquitetura e diagrama atualizados.

Validação local: 154 testes aprovados, incluindo limites de zoom/pan, seleção, negativos/zero, elegibilidade, ausência de seleção, uma data e domínio constante; build/TypeScript aprovados. Playwright com componentes reais e dados sintéticos (18 jogadores/21 datas) confirmou seleção individual, nenhuma seleção, Somente você, todos, teclado Space/Enter, zoom 150%/800%/reset, deslocamento e tabela integral após filtrar. Claro/escuro em 1280/375 px sem overflow global ou erros de JavaScript. Capturas `web/tmp/rf26-interactive-{light,dark}-{1280,375}.png` ignoradas pelo Git; revisão visual local não equivale a aceite remoto. Navegador executado fora do sandbox com autorização devido à restrição Windows já constatada.

Pendências: publicação pelo fluxo do projeto e homologação autenticada do Dono do produto de zoom/filtro nos torneios. Sem SQL adicional, novos envios, alteração de PDFs ou operação remota. Backup de banco não se aplica; backups privados anteriores preservados.

Verificação final: lint sem erros, com o aviso preexistente de variável não usada em `retroactive-scores.test.mjs`; `git diff --check` aprovado. Artefatos auxiliares de compilação da simulação removidos após a verificação; capturas locais preservadas fora do versionamento.

## Navegação direta com mouse — 31/10/2026

31/10/2026 — RF26 refinado pelo Dono do produto: navegação direta com mouse implementada localmente. Roda sobre a área de curvas amplia/reduz ancorada no cursor; após ampliar, arrasto com botão esquerdo move datas e pontos, limitado aos dados. Captura de ponteiro mantém o arrasto ao sair do SVG e termina ao soltar/cancelar. Roda fora da área de curvas mantém rolagem normal; botões e seleção continuam disponíveis. Substitui a limitação anterior de navegação somente por botões. Sem pinça em toque, novas consultas, gravações ou migração. Publicação/aceite pendentes.

Validação deste incremento: sete testes de viewport/interface aprovados, incluindo novo teste de ancoragem no cursor e limites; build/TypeScript e lint específico sem erros/avisos. Browser Edge com componente real/dados fictícios verificou roda in/out, arrasto, soltura, reset e nova interação após selecionar jogador, sem erros JavaScript. A primeira execução do roteiro deixou o cursor sobre a caixa após clicar, fora do gráfico; roteiro corrigido para retornar o mouse à área de curvas e aprovado. Não é homologação remota. Suíte completa de 154 testes pertence ao incremento anterior; não foi repetida integralmente nesta alteração. Sem mudança em cálculos, PDF, banco ou permissões. Sem migração/backup de banco; artefatos auxiliares locais de compilação removidos. Publicação e aceite pendentes.
