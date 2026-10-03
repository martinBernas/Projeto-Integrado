# Avaliação do escopo pendente e feedback — 27/09/2026

03/10/2026 — Dono do produto aprovou S5-04 (recorte de FB05): cinco dias recentes com Ver todos/Mostrar menos e ranking completo. Implementação local e requisitos/arquitetura/testes atualizados; sem migração de banco. Histórico pessoal incluído com cinco lançamentos recentes e expansão dos até 100 registros carregados. Lista de torneios, acesso a registros anteriores ao limite e FB06 permanecem no backlog futuro. Publicação e homologação do acréscimo ainda não confirmadas.

## Diretriz e evidências

Diretriz confirmada pelo Dono do produto: garantir primeiro o escopo já planejado e avaliar os pedidos dos usuários para evolução posterior. Esta revisão não autoriza implementação nem altera o compromisso das sprints. As recomendações abaixo são propostas para refinamento, sem datas ou estimativas fechadas.

Base: requisitos, plano de ação, encerramento da Sprint 4 e inspeção do formulário de torneios, lançamento pessoal, estilos e migrações locais. O aceite remoto da Sprint 4 é o registrado no seu encerramento; nesta avaliação não houve nova verificação do ambiente publicado.

## O que falta no escopo planejado

Situação posterior em 03/10/2026: S5-01–S5-03 implementadas localmente, incluindo revisão retroativa explícita; implantação e aceite pendentes. [Sprint 5](sprints/sprint-5.md). As lacunas abaixo descrevem a avaliação de 27/09, anterior a essa implementação.

Atualização de 03/10/2026: a lacuna de fuso configurável mencionada na avaliação histórica abaixo foi retirada do requisito pelo Dono do produto. Fuso fixo `America/Sao_Paulo`, zero como ausência em ambos os modos e revisão retroativa explícita são as decisões vigentes no [planejamento da Sprint 5](sprints/sprint-5.md).

| Escopo | Situação e trabalho restante |
| --- | --- |
| RF01, RF02, RF03, RF05, RF07, RF10, RF17 e RF18 | Fluxos básicos entregues nas sprints 2–4, dentro dos recortes aceitos: autenticação, torneios, participantes, lançamento diário, rankings, navegação e perfis. Não reabrir como novas entregas. |
| Sprint 5 — RF04, RF06, RF11, RF12; RN03, RN08 | Cálculo relativo e calendário fixo já usados; faltam configuração de modos absoluto/relativo, penalidade, calendário/exclusões e versões/vigência das regras. A criação atual fixa modo relativo, −2.500, segunda a sexta e `mvp-v1`. Refinar também o fuso configurável previsto em RF04: criação e lançamento atuais adotam São Paulo, e uma pontuação pessoal pode alimentar vários torneios. |
| Sprint 6 — RF13–RF16 | Implementar abertura, votação, apuração, punição local, recálculo e histórico. Antes, definir elegibilidade, duração, quórum, maioria, empate, ausência de votos, recurso e efeito sobre o menor positivo. |
| Sprint 7 — RF08 e ampliação de RF09 | Aprovação/correção administrativa, consulta de histórico avançado e melhorias priorizadas. Rastreabilidade mínima já existe; falta o fluxo completo. Correções restritas ao torneio e sem contornar a votação de invalidez. |
| RF19 — futuro, sem sprint | Relatório, envio por e-mail e exclusão posterior ainda não entregues. Torneios encerrados continuam visíveis e congelados. O pedido de desempenho detalha o conteúdo do relatório; não cria compromisso automático para Sprint 5. |

Ordem recomendada: refinar e concluir Sprint 5, depois Sprint 6 e o núcleo de moderação/histórico da Sprint 7. Melhorias adicionais só entram após priorização e capacidade explícitas. RNF01–RNF06 continuam sendo critérios transversais, não uma entrega já dispensada para os fluxos futuros.

## Avaliação dos pedidos

Complemento de 03/10/2026: FB05 (excesso de informações, resultados recentes e expansão por botão) e FB06 (espera ao trocar de torneio e sugestão de pré-carregar antes do login) constam no [pré-planejamento da Sprint 7](sprints/sprint-7.md), como candidatos à S7-03. Medir o gargalo antes de escolher a solução; dados privados exigem autenticação/autorização. A diretriz anterior permanece: pedidos não ampliam automaticamente o compromisso das sprints 5–7.

| Referência de feedback | Pedido | Avaliação | Encaminhamento proposto |
| --- | --- | --- | --- |
| FB01 | Modo escuro | Melhoria útil de conforto, sem impacto nas regras. Esforço relativamente menor, mas há cores claras fixas nos componentes. | Backlog de usabilidade; após o núcleo planejado, considerar primeira melhoria independente. Tema claro/escuro/sistema, preferência persistida e contraste em formulários, tabelas e estados. |
| FB02 | Lançar valores esquecidos | Relacionado a RF05/RF08 e à moderação. Risco e esforço maiores: altera ausência, menor positivo, classificação e possivelmente vários torneios. | Refinar junto da Sprint 7, sem assumir inclusão. Solicitação com justificativa/evidência, aprovação por organizador e trilha de auditoria; definir prazo e notificação. |
| FB03 | Relatório individual ao concluir torneio | Alto alinhamento com RF19 e reutilização dos resultados, mas depende de métricas inequívocas e resultados finais estáveis. | Detalhar RF19; propor entrega de relatório consultável antes de envio/exclusão, sujeita à decisão do Dono do produto. |
| FB04 | Integração com GeoGuessr | Potencial para reduzir digitação, com maior incerteza externa. Link de perfil já entregue não importa resultados nem comprova identidade. | Manter como investigação futura; não colocar dependência externa no caminho das sprints 5–7. |

### FB02 — lançamento tardio e prevenção de fraude

Hoje, o banco permite ao jogador enviar/corrigir apenas o dia atual em `America/Sao_Paulo`, com inteiro entre 0 e 25.000; a interface informa zero como ausência. Carga administrativa de histórico é uma operação distinta, não um mecanismo disponível ao jogador para recuperar esquecimentos.

A preocupação do Dono do produto com notificação foi registrada. Recomendação técnica ainda não aprovada: a solicitação ficar pendente, sem efeito no ranking até a aprovação. Notificação isolada dá visibilidade, mas não comprova que o jogo ocorreu na data declarada. Registrar solicitante, data de jogo, instante da solicitação, valor, motivo, evidência, decisão e responsável; notificar também o jogador sobre a decisão.

Como a pontuação é pessoal e compartilhada, não basta liberá-la globalmente após aceite de um único organizador. Refinar aprovação/efeito por torneio afetado, preservando os demais e os encerrados. Distinguir inclusão de valor ausente de correção de valor existente. Definir limite retroativo, canal da notificação, tratamento do organizador que também joga e da solicitação sem decisão. A aprovação não equivale a garantia antifraude e não substitui a auditoria por votação. Nenhum desenho de dados foi aprovado nesta revisão.

Teste de aceite futuro essencial: um valor tardio abaixo do menor positivo muda a base relativa de todos os participantes daquele dia apenas nos torneios autorizados; rejeição, repetição da aprovação e torneio encerrado não podem gerar efeitos indevidos.

### FB03 — definições propostas para as métricas

| Métrica solicitada | Definição proposta, sujeita a aceite |
| --- | --- |
| Vezes com maior pontuação do dia | Contar dias elegíveis em que o jogador empatou ou liderou a maior pontuação bruta válida. Mostrar quantidade de empates. |
| Vezes com menor pontuação do dia | Contar dias elegíveis em que o jogador empatou ou teve a menor pontuação bruta válida; no comportamento atual, somente positivos são resultados jogados. Ausência/penalidade não é uma menor pontuação jogada. |
| Média absoluta | Soma das pontuações brutas válidas dividida pelo número de dias com resultado válido; exibir esse denominador e a quantidade de ausências separadamente. |
| Média relativa | Em torneios relativos, soma dos pontos relativos válidos dividida pelos dias com resultado válido, incluindo os zeros relativos dos menores positivos. Não confundir esse zero com bruto zero/ausência. |

Proposta: excluir penalidades das médias de desempenho e apresentar, separadamente, total competitivo e penalidades. Se desejada média competitiva por todos os dias elegíveis, rotulá-la como outra métrica. Sem resultados válidos, mostrar “sem dados”, não média zero. Um dia com apenas um resultado válido conta simultaneamente como maior e menor; confirmar se o produto prefere exigir dois competidores para essas contagens. Fixar arredondamento, tratamento de invalidações e modo/regra vigente em cada dia, inclusive se a Sprint 5 permitir mudanças de modo durante o período.

O relatório deve usar o estado final congelado do torneio, preservando a explicação de regras e decisões. Definir resolução de solicitações/auditorias pendentes antes do encerramento. Para RF19 completo, ainda refinar destinatários, formato, falhas de envio, retenção e alcance da exclusão, preservando pontuações pessoais compartilhadas. A proposta de entrega por etapas não substitui a decisão vigente de disponibilidade por uma semana nem autoriza exclusão automática.

### FB04 — investigação inicial de API

Pesquisa em 27/09/2026: não foi localizada documentação pública oficial de API para integrar resultados, com autenticação de terceiros, limites e suporte definidos. Isso não demonstra inexistência de uma API privada ou parceria.

Há um [catálogo comunitário de endpoints](https://github.com/teamcoltra/geoguessr-api-docs), mantido pelo próprio autor como trabalho em andamento, incluindo rotas de resultados. É evidência de documentação comunitária, não de contrato oficial, autorização de uso ou funcionamento validado nesta aplicação.

Os [termos oficiais do GeoGuessr](https://www.geoguessr.com/terms) tratam de confidencialidade das credenciais, acesso não autorizado e restrições a programas automatizados. Sua existência exige esclarecer o uso pretendido com o fornecedor antes de assumir uma integração suportada; esta pesquisa não conclui que toda integração seja proibida ou autorizada.

Critérios para uma investigação posterior: confirmar canal oficial e permissão de integração, autenticação sem compartilhar senha/cookie pessoal, vínculo verificável entre contas, identificação do desafio e data, limites/custos, disponibilidade de pontuação final e prevenção de importação duplicada. Não foram feitas chamadas autenticadas, coleta de dados de jogadores ou contato com o fornecedor. Por ora, manter lançamento manual e URL de perfil existentes.

## Validação desta revisão

Entrega exclusivamente documental. Requisitos confrontados com planejamento, encerramento e pontos relevantes do código local; fontes externas identificadas acima. Revisão do diff e `git diff --check`; testes da aplicação não executados, pois não houve alteração de código. Sem migração, publicação ou homologação funcional nova. O aceite das propostas e a capacidade das sprints futuras permanecem por definir; a prioridade do escopo já planejado foi confirmada pelo Dono do produto.
