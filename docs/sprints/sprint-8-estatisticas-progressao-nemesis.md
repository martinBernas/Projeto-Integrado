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
