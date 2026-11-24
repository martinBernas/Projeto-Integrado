# Sprint 9 — Explicações em ícones de informação

**Aceite visual — 24/11/2026:** após conferir a prévia com os ícones à direita dos títulos/rótulos, o Dono do produto respondeu “perfeito”. Alinhamento e apresentação visual aprovados no cenário demonstrado. Este registro substitui a pendência de aceite visual desse refinamento nas seções históricas abaixo; publicação e homologação funcional em produção, smartphone físico e leitor de tela continuam sem evidência.

24/11/2026 — Dono do produto aprovou a direção visual e solicitou reduzir os textos explicativos das telas, com ícone “i”, ajuda ao aproximar o mouse e abertura por toque no smartphone. Aprovação da direção não equivale a aceite final desta implementação ou publicação.

## Comportamento e escopo

Refinamento posterior confirmado pelo Dono do produto em 24/11/2026: o ícone deve ficar à direita do título, rótulo ou controle que explica, na mesma linha visual, sem ícones soltos abaixo de campos. Perfil ajustado junto a “Meu perfil”, “Nome público” e “Perfil no GeoGuessr”; padrão `info-heading`/`info-label` aplicado também às demais telas. Grupos mantêm o ícone ao lado enquanto o texto pode quebrar dentro da largura disponível. Botão de ajuda permanece fora de `<label>`, preservando a associação entre rótulo e campo; campos repetidos de regras usam IDs próprios.

Criado `InfoTip`: ícone circular “i” com botão nomeado, descrição associada e balão em camada superior, sem corte pelos cards/tabelas. No mouse, aproximação abre e movimento acompanha o ponteiro com deslocamento de 16 px. Nas bordas, a posição é limitada à tela, com margem de 12 px. É possível mover o ponteiro para o balão para ler/rolar; fechamento após sair tem tolerância de 180 ms. Clique/toque fixa o balão; segundo clique, Escape ou toque fora fecha. Abrir outro ícone fecha o anterior.

Foco pelo teclado abre a ajuda perto do ícone; Enter/Espaço também ativam o botão. O balão pode receber foco para rolagem de textos extensos. Descrições continuam associadas por `aria-describedby`; botões usam `type=button`, sem enviar formulários. Alvo de toque aumenta para 44 px em dispositivos com ponteiro impreciso. Texto, borda e foco respeitam claro/escuro. Conteúdo limitado ao viewport, com rolagem própria quando necessário.

Recolhidas explicações complementares em painel/lançamento, regras e ranking, histórico pessoal, perfil, estatísticas pessoais e de torneio, gráficos/progressão/Nêmesis, pedidos, denúncias, notificações, período/calendário/exclusões e recuperação de senha. Regras detalhadas do torneio passam ao “i” junto ao nome, preservando datas e situação de encerramento. Os textos foram mantidos nos balões; cálculos e dados não mudam.

Continuam visíveis: rótulos/campos, valores, datas relevantes, legendas de séries, estados vazios/indisponíveis, erros/sucessos, pendências, prazos, avisos operacionais e confirmações de decisões. Encerramento mostra de forma curta que é definitivo e congela resultados; explicações de PDF/envio ficam no ícone. Checkboxes de confirmação e consequências de punição/retirada continuam explícitos. Esse recorte é escolha técnica para manter decisões compreensíveis, alinhada ao pedido de recolher explicações.

## Arquitetura e simulação

`InfoTipController` no layout registra uma única delegação de eventos, com limpeza ao desmontar. `src/lib/info-tips.ts` concentra abertura/fechamento/posicionamento; HTML Popover API mantém o balão acima de áreas com overflow. Sem biblioteca externa. Componente cliente recebe somente textos/valores já autorizados e renderizados nas telas. Não consulta backend, não cria cookies, não altera permissões ou sessões. [ADR-019 e diagrama](../decisoes/adr-019-ajuda-contextual.md).

A simulação de 14 rotas em `127.0.0.1:3100` usa o mesmo controlador compilado para módulo de navegador, além dos componentes reais. Ajuda, menu, tema e detalhes nativos funcionam nessa prévia; operações e demais controles React continuam demonstrativos. Atualização do script dispensa qualquer mudança no Supabase. A prévia permanece ligada para revisão do Dono do produto.

## Verificações

- Suíte completa: `pnpm test`, 165/165 aprovados. Cinco testes específicos cobrem associação acessível/IDs, botão sem submit, escape de conteúdo, limites de posicionamento, mouse/movimento/entrada no balão, toque/clique/fora, foco, Escape, rolagem e limpeza de listeners. Após o refinamento de foco, cinco testes específicos novamente aprovados.
- Testes de telas adaptam a dependência visual `InfoTip` sem alterar contratos de Auth/RPC, cálculos ou permissões. Dezesseis testes dirigidos de telas também passaram.
- `pnpm lint` sem erros; aviso preexistente de `ids` não utilizado em `tests/retroactive-scores.test.mjs:107`.
- `node scripts/preview-layout.mjs --check`: 14/14 rotas renderizadas com dados sintéticos.
- `pnpm build --webpack`: compilação, TypeScript e geração de páginas aprovados. `pnpm build` com Turbopack encontrou falha local ao criar o processo de transformação CSS, inclusive fora do sandbox e com cache preservado/movido. Primeira tentativa Webpack no sandbox teve EPERM na criação de segmentos de página; execução autorizada fora do sandbox concluiu. Não foi alterado o bundler padrão do projeto ou presumido sucesso remoto do comando padrão.
- Prévia no navegador: painel compacto, clique abre balão, Escape fecha, Shift+Tab para o ícone abre a ajuda pelo foco e controles continuam presentes. No tema claro em viewport de 390 px, página com 375 px disponíveis e sem overflow horizontal. Ajuste final limita também a largura do balão à área disponível sem contar a barra de rolagem. Inspeção final de alinhamento registrada abaixo. Sem conta real, alteração de senha, envio de formulário real ou mutação do banco.
- Após refinamento de alinhamento, 20 testes dirigidos de telas/ajuda e renderização das 14 rotas da prévia passaram. Testes de tipagem e os cinco testes de ajuda passaram após os ajustes de foco e largura. `git diff --check` aprovado.
- Verificação final no navegador: os três ícones do perfil ficam à direita de seus títulos/rótulos, sem botão dentro de `<label>`. Em viewport de 390 px, largura disponível e largura da página iguais a 375 px; balão do nome público limitado entre x=12 e x=363, preservando as margens. Captura local ignorada em `web/tmp/layout-review/perfil-ajuda-alinhada.jpg`. Lint dirigido aos componentes/controle/testes e build final `pnpm build --webpack` aprovados. A prévia foi reiniciada com o alinhamento final; páginas já abertas precisam ser atualizadas para receber o HTML novo.

## Ativação e aceite pendentes

Somente publicação da aplicação pelo fluxo existente; sem migração de banco, mudança de Auth/SMTP ou backup de dados reais. O cache local gerado foi preservado em `.pnpm-store/next-before-info-tips` (ignorado), não é backup de banco e não deve ser versionado. Não foram capturados dados pessoais ou credenciais. Artefatos visuais de simulação ficam em `web/tmp/layout-review`, ignorados.

Homologar com participante/organizador em navegador de computador e smartphone físico: mouse, toque, rolagem, teclado/leitor de tela, bordas/zoom, ambos os temas, campos/validações e confirmação de encerramento/retirada/punições. Testes simulados e viewport reduzido não equivalem a teste em smartphone físico. Navegador precisa suportar HTML Popover API para a camada superior; clique nativo continua disponível quando o JavaScript não inicializa, mas o acompanhamento do ponteiro depende do controlador. Publicação e aceite final do Dono do produto pendentes.
