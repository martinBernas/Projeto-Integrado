# Sprint 7 — Moderação e evolução

## Pré-planejamento — 03/10/2026

Sprint futura, não iniciada. O Dono do produto solicitou registrar os feedbacks e planejar seu encaixe pelo fluxo Scrum. A alocação abaixo é proposta para refinamento, sem compromisso de entrega ou autorização de implementação. Sprint 4 permanece encerrada; sprints 5 e 6 preservam regras/calendário e auditoria como prioridades.

O objetivo previsto permanece S7-01 (aprovação/correção de lançamentos), S7-02 (histórico avançado) e S7-03 (ranking e usabilidade). Datas, capacidade e estimativas não foram definidas. Selecionar histórias no Sprint Planning após estimar o conjunto; o que não couber permanece no Product Backlog para uma sprint posterior.

## Candidatos à S7-03

| Item | História | Encaixe proposto |
| --- | --- | --- |
| FB05 — resultados recentes e expansão | Como jogador, quero ver inicialmente os resultados recentes e ampliar por um botão, para consumir o painel sem excesso de informações conforme crescem os dias e torneios. | S7-03a; evolução de RF07/RF10 e RNF04, coordenada com S7-02. |
| FB06 — troca de torneio responsiva | Como jogador, quero resposta imediata ao trocar de torneio e menor espera pelos dados, para continuar usando o painel durante o carregamento. O relato sugere pré-carregar informações antes do login. | S7-03b; evolução de RF10/RNF04, com investigação antes de escolher a solução. |

Prioridade relativa proposta entre as melhorias: FB05, depois FB06, preservando o núcleo S7-01/S7-02 e a diretriz de concluir o escopo planejado. Se a medição comprovar impedimento de um fluxo essencial, o Dono do produto poderá repriorizar no planejamento; não antecipar automaticamente para Sprint 5.

## Critérios de aceite propostos

### FB05 / S7-03a

- Mostrar quantidade limitada dos dias mais recentes em ordem decrescente, preservando ranking acumulado de todo o período elegível.
- Oferecer botão de expansão e retorno à apresentação reduzida, sem botão de expansão quando não houver mais itens. No recorte aprovado S5-04: cinco dias e expansão integral. Outros alcances continuam dependentes de refinamento.
- Resultados diários e histórico pessoal foram incluídos em S5-04. Refinar alcance sobre seleção de torneios e acesso ao histórico anterior ao limite. Não apresentar os 100 lançamentos hoje consultados como histórico completo; coordenar acesso a registros anteriores com S7-02.
- Manter todos os torneios autorizados acessíveis, inclusive encerrados, com seleção por URL, recarga e voltar/avançar. Refinar se a lista de torneios também exige apresentação reduzida.
- Validar lista vazia, quantidade abaixo/no/acima do limite, muitos dias e torneios, celular e teclado. Expandir não altera totais, ordenação dos jogadores ou permissões.

### FB06 / S7-03b

- Mostrar indicação acessível de carregamento ao selecionar outro torneio, mantendo a interface responsiva e identificando a seleção solicitada. Não apresentar resultados antigos como pertencentes ao novo torneio.
- Medir tempo até o feedback visual e até os dados completos, com e sem aquecimento, registrando ambiente, volume, rede e repetições. Definir meta mensurável após a linha de base e antes da implementação.
- Pré-carregar dados privados somente após autenticação e autorização; antes do login, avaliar apenas recursos públicos da interface. Não compartilhar cache privado entre contas nem dispensar autorização vigente.
- Limitar consultas em segundo plano e validar atualização após lançamento, expiração de sessão, saída/troca de conta e revogação de vínculo.
- Validar trocas rápidas, última seleção, voltar/avançar, rede lenta, falha/nova tentativa, torneio encerrado e sem acesso.

## Investigação e decisões pendentes

Inspeção local em 03/10/2026: o painel renderiza todos os dias disponíveis e até 100 lançamentos pessoais. Navegação por links com parâmetro de torneio; a RPC `get_tournament_dashboard` bloqueia a linha do torneio e aciona o recálculo existente. Pré-carregar vários torneios pode aumentar trabalho e contenção. Isso não comprova a causa da lentidão relatada; nenhuma medição ou investigação remota foi realizada.

Investigar servidor/banco, transferência e renderização; avaliar pré-carregamento limitado após login, indicação de carregamento e eventual separação de leitura e recálculo. São alternativas técnicas, não decisões arquiteturais aprovadas. Caso a implementação altere transações, cache ou fluxo entre componentes, atualizar arquitetura/diagramas e registrar ADR na entrega.

Antes do Sprint Planning: definir alcance e limite de FB05, linha de base/meta de FB06; estimar desenvolvimento, testes, documentação, publicação e homologação; confrontar capacidade com S7-01/S7-02 e demais feedbacks. Prioridade e aceite cabem ao Dono do produto.

## Situação e evidências

Entrega de 03/10/2026 exclusivamente documental: feedbacks, histórias, critérios e encaixe propostos. Verificação: revisão de referências e `git diff --check`. Nenhum teste da aplicação executado, código alterado ou operação remota realizada. Implementação, publicação e homologação não realizadas; necessidade de migração ainda não definida, dependente da solução futura.
