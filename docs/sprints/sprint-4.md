# Sprint 4 — Torneios e participantes

Iniciada em 26/09/2026. Escopo principal: S4-01, S4-02 e S4-03. Nome público (S4-04) e perfil GeoGuessr (S4-05), inicialmente adicionais remanejáveis, tiveram implementação autorizada em 27/09 após o aceite do escopo principal. Encerrada em 27/09/2026 com as cinco histórias aceitas; não houve estimativa formal de capacidade.

## Situação atual — 27/09/2026

**Sprint 4 encerrada em 27/09/2026**, por confirmação do Dono do produto, com S4-01 a S4-05 entregues, publicadas e aceitas. A carga complementar do Excel também foi executada e conciliada pelo retorno SQL. As seções posteriores preservam a sequência de implementação e não reabrem pendências resolvidas por este encerramento.

| História | Entrega aceita | Evidência |
| --- | --- | --- |
| S4-01 | Criar, editar e encerrar torneios | Aceite funcional do Dono do produto e migração confirmada |
| S4-02 | Participantes, data de ingresso e preparação histórica | Inclusão/remoção, persistência da data, conclusão da preparação e restrição de administração confirmadas |
| S4-03 | Múltiplos torneios em abas | Interface aprovada, alternância, seleção após recarga, ranking preservado e ordem diária confirmadas |
| S4-04 | Nome público único e edição própria | Migração, Vercel pronta e todos os testes de homologação aprovados pelo Dono do produto |
| S4-05 | Perfil GeoGuessr opcional | Mesmo aceite de homologação, com inclusão/edição/remoção e visualização do link |

Documentação consolidada: requisitos RF17/RF18, plano de ação, plano de testes, arquitetura, ADR-002, orientação de perfis, README operacional e histórico. Evidências locais: suíte de 36 testes, lint/build aprovados na implementação, dois casos adicionais direcionados e depois sete testes de banco/perfil aprovados na revisão da carga (incluindo o novo caso de importação). Não houve nova execução completa de testes neste fechamento documental.

Limites registrados, sem bloquear o aceite: não foi fornecido novo checksum após a carga de nomes nem uma inspeção visual específica dos nomes importados; a carga foi conferida pelo resultado SQL. Não alegar ensaio remoto PostgreSQL multiconexão. A referência de backup permanece intacta e diferenças de nomes após a carga são esperadas. RF19 (relatório, envio por e-mail e exclusão automática) permanece fora do escopo, assim como o editor de regras/calendário previsto para a Sprint 5.

S4-01 a S4-05 com aceite funcional concluído pelo Dono do produto. Migrações confirmadas e aplicação publicada na Vercel validada pelo Dono do produto. Em 27/09, após confirmar o deployment, o Dono do produto informou que executou todos os testes de perfil e passaram. Os registros anteriores de pendências ficam preservados como histórico e são substituídos por essas confirmações. A comparação posterior à migração de perfis retornou zero diferenças nos campos antigos. A carga complementar dos nomes e links do Excel foi solicitada após esse aceite: executada pelo Dono do produto, com retorno de 12 nomes confirmados e 11 URLs conferidas. Conferência visual após a carga ainda não relatada.

### Homologação S4-04/S4-05 e carga complementar do MVP — 27/09/2026

**Atualização operacional:** a primeira execução remota abortou com `mvp_profile_name_changed: Martin`, antes da gravação. O Dono do produto informou que provavelmente já havia preenchido seu próprio perfil. Carga revisada para excluir Martin integralmente, preservando nome, URL e confirmação atuais: agora são **12 nomes e 11 URLs**, com retorno esperado de 12 linhas. Os números de 13/12 abaixo descrevem a versão inicial e o conteúdo da fonte. Sete testes locais novamente aprovados, incluindo preservação integral do perfil manual de Martin, auditoria de somente 12 atualizações e proteção dos demais perfis. Reexecução remota confirmada pelo retorno fornecido pelo Dono do produto: 12 linhas, todas com `confirmado=true`, 11 URLs e Luca com URL nula. Martin não consta no escopo da operação. Essa evidência não representa nova comparação de backup ou inspeção visual.

Evidência de aceite: relato do Dono do produto “executei todos os testes e passaram”, após informar Vercel pronta. Abrange o roteiro de edição/persistência do nome, unicidade, URL e sua edição/remoção, visualização pelos participantes e cadastro com nome obrigatório. Não representa execução remota pelo agente nem nova captura de backup.

Por solicitação explícita do Dono do produto, preparada a carga administrativa dos nomes públicos e URLs já presentes em `GeoGuaras.xlsx`, aba `Diario!A2:C16`: coluna B contém o nome e seu hyperlink; A identifica o jogador do MVP e C a conta previamente validada. Fonte SHA256 `e74d1a6560a56ee1f7d3103df641199fbf308b2a5e735a46b6e0082bf93efcc4`, inalterada. São 13 nomes e 12 links. Luca possui nome `Lucacavalhojeo`, sem hyperlink: seu link atual é preservado. Ramiro e Marcelo não possuem os dados/cadastro nessa carga e ficam excluídos. Não há busca externa de links nem comprovação de titularidade GeoGuessr.

Operação: `web/supabase/operations/20260927-import-mvp-profiles.sql`, gerada por `build-mvp-profiles.py`. Identidades reutilizam a regra de correspondência exata da coluna C com a parte local do e-mail, confirmada na carga original, exigindo uma única conta/perfil; Luca/Zade usam os UUIDs já confirmados. Não associa pela semelhança de nomes. Nome atual deve ser o nome legado ou o nome destino da planilha; URL existente diferente da fonte aborta. Qualquer divergência requer análise do retorno antes de ajustar o script, sem sobrescrever uma escolha manual silenciosamente.

Executar integralmente no SQL Editor como administrador, com a migração de perfis já aplicada. A transação bloqueia alterações concorrentes nas identidades/perfis durante a validação e gravação, aplica as mesmas funções de validação e unicidade da aplicação e marca os nomes importados como confirmados, por autorização do Dono do produto. A versão revisada retorna 12 linhas com nome público, URL e confirmação. Reexecução sem mudanças é neutra. Não requer nova migração ou publicação da aplicação.

Antes/depois dos perfis alterados ficam em `private.profile_changes`, pela trigger existente; ator pode ser nulo no SQL Editor. Essa auditoria permite identificar os valores anteriores, mas não substitui backup completo. O backup `before-s4-02-september-v1` permanece intacto; seu comparador deverá acusar as mudanças de nome legítimas após a carga, não sendo correto exigir checksum antigo igual nem substituir a referência. UUIDs, datas de criação, pontuações, torneios, elegibilidades e resultados não são escritos pela operação.

Validação local: 7 testes do arquivo `public-profiles.test.mjs` aprovados, incluindo carga dos 13 perfis/12 links, Unicode, preservação de URL ausente na fonte, idempotência, auditoria, rollback para nome/URL divergente, conta ausente/ambígua e colisão de nome. Comparação de todas as tabelas públicas exceto perfis e dos perfis fora do escopo sem diferenças. Execução remota desta carga confirmada; visualização no ranking/perfil ainda não relatada; a homologação das funcionalidades S4-04/S4-05 já está concluída.

## S4-03 — Listar e acessar múltiplos torneios

Implementação local em 26/09/2026. Por solicitação explícita do Dono do produto, os torneios são apresentados em abas horizontais, com destaque da seleção e rolagem horizontal em telas estreitas. Na revisão pelo esboço do Dono do produto, cada aba mostra somente o nome; período e encerramento ficam no conteúdo, e o estado também consta na descrição do link. A lista inclui torneios em que a conta participa ou que organiza, respeitando as permissões existentes.

Escolhas técnicas: navegação por links em `/dashboard?tournament=<uuid>`, preservando a seleção ao recarregar, compartilhar o link e usar voltar/avançar. Links têm `aria-current` para identificar a seleção. Sem parâmetro, abre o primeiro torneio aberto por início decrescente (desempate por ID); na ausência de abertos, o mais recente encerrado. Uma seleção inválida ou sem acesso informa indisponibilidade, sem trocar silenciosamente de torneio. Falhas de listagem/resultados e lista vazia têm mensagens próprias.

O ranking, resultados diários, participantes, elegibilidade, preparação histórica e datas excluídas são do torneio selecionado. Removidas as referências fixas a setembro/07 de setembro na visualização. O lançamento e o histórico pessoal permanecem únicos; o mesmo lançamento pode alimentar outros torneios elegíveis. A administração oferece link Ver resultados. Encerrados permanecem acessíveis, inclusive após uma semana, até RF19.

A migração `202609260003_multiple_tournaments.sql` introduz `get_tournament_dashboard(uuid)` e mantém `get_september_dashboard()` como compatibilidade para clientes anteriores. Não muda tabelas, regras de cálculo ou dados durante a aplicação. A consulta autentica, autoriza participante/organizador, bloqueia a linha do torneio, revalida acesso e reutiliza o recálculo existente, que preserva resultados encerrados. Nenhuma chave de serviço é usada.

### Implantação e homologação conjunta

1. Executar a comparação `web/supabase/rehearsal/sprint4/02-verify.sql` e guardar a evidência; preservar a referência existente, sem versionar dados privados.
2. Aplicar somente `202609260003_multiple_tournaments.sql`, integralmente e uma vez. As migrações S4-01/S4-02 já foram aplicadas segundo o Dono do produto; não reaplicá-las.
3. Repetir a comparação antes de navegar pelos resultados e distinguir eventuais lançamentos legítimos desde a referência. Publicar o código dependente após a migração; registrar URL e commit do deployment.
4. Com uma conta vinculada a dois torneios, alternar abas, conferir ranking/participantes/datas próprias, recarregar a segunda aba e usar voltar/avançar. Conferir telas estreitas, navegação por teclado, torneio vazio e encerrado. Validar setembro visualmente e comparar os dados de referência, explicando mudanças legítimas decorrentes de consultas/novos lançamentos.
5. Com outra conta, verificar lista sem torneios e tentativa de abrir um link sem acesso. Uma conta que organiza sem participar deve consultar seus próprios resultados.
6. Concluir junto deste ensaio os três pontos restantes da S4-02: alterar a data de participação e conferir persistência após recarregar; concluir preparação histórica em torneio de teste; comprovar bloqueio da administração de participantes por outra conta.

Decisão confirmada pelo Dono do produto: essas três verificações não bloqueiam o avanço da S4-03 e ficam na homologação conjunta. S4-02 permanece em homologação, com inclusão/remoção, migração, comparação sem diferenças e interface já validadas. A referência acima substitui qualquer indicação anterior de que toda a S4-02 ainda estaria pendente.

Validação local: testes de banco para isolamento da lista e dos resultados, elegibilidade distinta, exclusões por torneio, acesso do organizador sem participação, encerrados, remoção de acesso e negação anônima. Teste de renderização do painel cobre seleção inicial, abas por URL, recarga da seleção, parâmetro inválido/repetido, lista vazia e falhas. O teste sobre cópia privada do backup aplica também a migração S4-03 e compara hashes dos dados e cálculo de referência. `pnpm test`: 28 testes aprovados, sem falhas ou testes pulados; `pnpm lint`, `pnpm build` e `git diff --check` aprovados em 26/09/2026. Inspeção visual local e aceite das abas concluídos posteriormente, conforme registro abaixo. Aplicação remota, publicação e homologação autenticada ainda pendentes; testes de renderização não substituem homologação autenticada.

## S4-02 — Preparação e proteção dos dados

Iniciada pela preparação do backup solicitada pelo Dono do produto. Scripts de captura, comparação e exportação preparados e testados localmente; [roteiro e escopo](sprint-4-backup.md). Backup real executado pelo Dono do produto: 13 participantes, 215 pontuações pessoais e 234 resultados, comparação inicial sem diferenças. Exportação recebida e checksum recalculado localmente com sucesso. Pré-requisito de backup atendido; implementação entregue e ensaio de inclusão/remoção confirmado. Usar a mesma referência para conferir mudanças posteriores.

### Implementação da S4-02

Interface em grid compacto aprovada explicitamente pelo Dono do produto: “perfeito interface aprovada”. Aceite visual registrado. Essa aprovação não acrescenta evidência de execução dos cenários funcionais ainda pendentes na seção de ensaio abaixo.

Revisão de interface solicitada pelo Dono do produto: participantes e usuários disponíveis agora aparecem em grids compactos, com colunas de nome, data de participação e ações. Usuários disponíveis mantêm o e-mail abaixo do nome. A data é editada na própria linha; Salvar fica habilitado quando ela muda, e Remover fica na mesma linha. A inclusão também ocorre por linha. Confirmações de recálculo/remoção passam a aparecer no momento da ação, em diálogo do navegador, em vez de ocupar cada linha com checkboxes e explicações repetidas. Em telas estreitas, as tabelas permitem rolagem horizontal. Busca, paginação e consulta de torneios encerrados são preservadas.

Esta revisão é de apresentação e interação no cliente, usando as mesmas Server Actions e RPCs. Não requer nova migração, não altera cálculo nem permissões e não toca no backup. Lint e build aprovados; prévia estática dos componentes reais inspecionada no navegador com dados fictícios. Essa inspeção valida o layout, não substitui o ensaio das ações autenticadas após publicação.

Situação atual: migração remota e ensaio de inclusão/remoção na interface confirmados pelo Dono do produto, com zero diferenças no backup após o ciclo. Esse retorno atualiza as pendências registradas anteriormente nos parágrafos abaixo.

Implementação concluída; migração remota e ensaio de inclusão/remoção na interface confirmados pelo Dono do produto. Limites e verificações restantes registrados abaixo. Em Administrar torneios, o link Gerenciar participantes abre a lista atual e a seleção de usuários cadastrados, pesquisável por nome ou e-mail e paginada em 25 contas. Por solicitação do Dono do produto, o organizador vê nome e e-mail na seleção; a API exige que ele organize o torneio informado. E-mails não são adicionados ao ranking ou à listagem de participantes para competidores. Contas já vinculadas ficam fora da seleção.

- Inclusão de conta existente pela seleção; sem criar contas, enviar mensagens ou alterar perfis. Data de participação padrão é o início do torneio. A data deve estar dentro do período; o histórico pessoal já registrado conta desde ela, mesmo anterior ao vínculo. Uma data posterior representa elegibilidade individual, como no caso de Bastian.
- Alteração da data e remoção com confirmação dos efeitos. A remoção retira vínculo e contribuição no torneio, preservando todas as pontuações pessoais. Datas e vínculos são auditados, assim como resultados retirados por mudança de elegibilidade. Recalcula somente o torneio alvo; no modo relativo, os resultados de outros participantes desse torneio podem mudar legitimamente.
- Torneio encerrado permite somente consulta. Escritas diretas continuam bloqueadas; as operações validam organizador e estado no banco. Alterações são transacionais e usam o mesmo bloqueio do torneio que os lançamentos.
- Preparação histórica mantém seu estado nas alterações. Se já estiver pronta, ausências são calculadas para os novos participantes desde sua elegibilidade; a tela explica isso e pede confirmação. Se estiver em preparação, não aplica penalidades até o organizador confirmar a conferência pelo botão Concluir preparação do histórico. A conclusão exige participantes e não importa nem inventa pontuações ausentes.

### Implantação e conferência da S4-02

1. Executar novamente `web/supabase/rehearsal/sprint4/02-verify.sql` e guardar o retorno. Corrigir ou explicar eventuais diferenças em relação à referência, sem substituir o backup.
2. Aplicar somente `web/supabase/migrations/202609260002_participant_management.sql`, integralmente, uma vez, após a migração da S4-01. Ela cria operações e auditoria, sem modificar os dados de negócio existentes nem recalcular resultados durante a aplicação.
3. Antes de operar participantes, repetir a comparação e conferir que a migração não introduziu diferenças. Lançamentos legítimos ocorridos desde a captura devem ser distinguidos de alterações indevidas.
4. Publicar a aplicação. Validar preferencialmente em um torneio de teste: buscar uma conta pelo nome/e-mail, incluí-la desde o início, alterar elegibilidade, remover e conferir que o histórico pessoal permanece. Verificar com outra conta que ela não administra o torneio alheio. A navegação do participante entre vários torneios continua na S4-03.
5. Conferir novamente setembro com o mesmo script. Operações realizadas apenas no torneio de teste não devem alterar seus vínculos, brutos ou resultados. O ensaio não exige mudar participantes de setembro.

Testes locais incluem aplicação da migração sobre a cópia privada do backup real e comparação integral dos dados e do cálculo de referência; esse teste é pulado quando o arquivo local ignorado pelo Git não existe. Testes sintéticos cobrem diretório restrito, busca/paginação, inclusão retroativa, duplicidade, datas inválidas, histórico em preparação/pronto, retirada de resultados fora da elegibilidade, isolamento de outro torneio, preservação dos brutos/perfis, auditoria e bloqueio após encerramento. Testes das ações cobrem sessão, seleção, confirmação, datas e mensagens de erro.

Validação local: 26 testes aprovados, sem testes pulados neste ambiente, incluindo a cópia local do backup real. Build de produção aprovado. Ensaio posterior na interface realizado pelo Dono do produto, conforme registro abaixo; nenhum dado real foi alterado pelo agente.

### Confirmação da migração pelo Dono do produto

O Dono do produto informou a execução de `202609260002_participant_management.sql` no Supabase e forneceu as comparações anterior e posterior. Ambas retornaram `diferencas = 0`, `detalhes = []` e checksums do backup/estado atual iguais a `3d847140e955fd6feaaffab3b252dbe8`, para `before-s4-02-september-v1` (captura em `2026-09-26 13:56:45.612398+00`). A comparação confirma preservação dos dados abrangidos pelo backup após a migração. Na ocasião desse retorno, o ensaio na interface ainda estava pendente; foi confirmado posteriormente abaixo. Não reaplicar a migração.

### Ensaio de participantes confirmado pelo Dono do produto

O Dono do produto informou que adicionou o perfil de testes ao torneio, verificou a data de ingresso e removeu o participante. Após o ensaio, `02-verify.sql` retornou novamente zero diferenças, detalhes vazios e checksums iguais a `3d847140e955fd6feaaffab3b252dbe8`. Inclusão, consulta da data e remoção estão validadas pelo relato; os dados abrangidos pelo backup de setembro permanecem iguais à referência após o ciclo.

O relato não identifica qual torneio recebeu o perfil, URL ou commit publicado. Não confirma separadamente alteração e persistência de uma nova data de elegibilidade, conclusão da preparação histórica ou acesso com outra conta nesta tela. Esses cenários têm cobertura local, mas ainda não foram demonstrados no ensaio remoto. A comparação valida os dados abrangidos pelo backup, não a ausência de novos registros de auditoria, que são esperados. S4-02 permanece em homologação dos cenários restantes.

## S4-01 — Administração de torneios

Situação atual: aceite funcional concluído em 26/09/2026, com testes locais e validação pelo Dono do produto descrita abaixo. S4-02 permanece em homologação e S4-03 tem implementação local descrita acima; a Sprint 4 continua aberta.

Implementação local de criação, edição e encerramento em `/dashboard/tournaments`, acessível pelo painel. Qualquer conta autenticada pode criar torneios; somente o organizador administra os seus. A lista administrativa serve para localizar os torneios que organiza; a navegação e os resultados de múltiplos torneios para participantes continuam em S4-03.

- Criação: nome de 3 a 100 caracteres e período válido. Regra fixa `mvp-v1`: relativo ao menor positivo, ausência −2.500, segunda a sexta e fuso `America/Sao_Paulo`. Não copia o feriado específico de setembro. Começa sem participantes e com preparação histórica aberta, para não gerar ausências antes da conferência; gerenciamento de participantes é S4-02.
- Edição: nome e período. Período só muda sem participantes, resultados ou exclusões, evitando invalidar elegibilidade e histórico. Não permite trocar organizador ou regras pela API.
- Encerramento: ação do organizador após a virada do último dia, com confirmação na tela. Exige histórico conferido quando há participantes, consolida resultados e impede edições e novos recálculos. Repetir a operação mantém o mesmo encerramento. Pontuações pessoais continuam disponíveis para outros torneios.
- Rastreabilidade: registro privado da criação e alterações, com ator, data e valores anteriores/novos. Escrita direta e exclusão pela API continuam bloqueadas.

Decisão do Dono do produto: dados disponíveis por uma semana após o encerramento. Relatório, envio aos participantes por e-mail e exclusão para retirada da interface serão planejados posteriormente em RF19. Até sua implementação, encerrados permanecem visíveis também após essa semana. O encerramento nesta entrega é manual; automação futura não foi definida.

## Publicação e aceite

Aplicar `web/supabase/migrations/202609260001_tournament_management.sql` depois das três migrações existentes, antes de publicar a aplicação. Nenhuma execução remota foi realizada nesta implementação. A migração mantém os torneios existentes abertos e preserva seus dados.

Validar com duas contas: criar um torneio, editar nome/período vazio, verificar isolamento entre organizadores, rejeitar encerramento antes do fim, encerrar um torneio passado e conferir persistência dos resultados e bloqueio de edição. Validar o painel de setembro após a migração. Não usar o torneio real para ensaiar encerramento.

Testes locais de banco cobrem regras fixas, validação, autenticação, isolamento, escrita direta, auditoria, bloqueio de período com participantes, histórico pendente, encerramento idempotente e resultados congelados sem afetar outro torneio. Publicação e aceite remoto permanecem pendentes; S4-01 não está encerrada.

Verificação local em 26/09: suíte completa com 20 testes aprovada, seguida de um teste adicional das ações do formulário também aprovado (21 no total). `pnpm lint`, `pnpm build` e `git diff --check` aprovados. A regressão de banco do MVP aplica também a nova migração. Ainda não houve inspeção visual autenticada nem homologação no ambiente publicado.

### Validação posterior pelo Dono do produto — 26/09/2026

As pendências acima representam o estado anterior às capturas fornecidas pelo Dono do produto. A primeira captura mostra a criação de “Teste final de semana”, aberto, de 26 a 27/09/2026. A segunda mostra o torneio renomeado para “Teste edicao”, com período de 21 a 25/09/2026, estado Encerrado e sem controles de edição. O Dono do produto informou que, a princípio, deu certo. Criação, alteração de nome/período e encerramento foram assim demonstrados na interface. O torneio GeoGuaras — Setembro 2026 permanece listado como Aberto.

As imagens não identificam URL ou commit publicado nem comprovam separadamente a rejeição de encerramento antecipado, a persistência após recarregar, o isolamento com outra conta ou a conferência do ranking real de setembro. Esses pontos continuam pendentes de homologação; isolamento e congelamento de resultados têm cobertura local. Não houve execução direta no Supabase pelo agente. S4-01 permanece em validação final.

### Aceite funcional — confirmação complementar em 26/09/2026

O Dono do produto confirmou que o encerramento antecipado foi bloqueado, o estado persistiu após recarregar e não observou alterações no ranking de setembro. A captura da segunda conta, informada como não participante de setembro, mostra o formulário de criação e a lista “Torneios que organizo” vazia. Isso confirma a separação da listagem administrativa na interface; qualquer usuário autenticado pode criar seus próprios torneios, independentemente de participação em setembro.

Com essas confirmações, criação, edição, encerramento e verificações funcionais solicitadas estão aceitos. O teste remoto não incluiu tentativa direta de alterar torneio alheio pela API nem encerramento de torneio com resultados reais; essas proteções foram verificadas nos testes locais. A observação do ranking é uma conferência visual do Dono do produto, não uma nova conciliação numérica. URL e hash do deployment não foram identificados nas capturas e continuam sem registro neste aceite. Os estados pendentes nas seções anteriores ficam preservados como histórico, substituídos por este aceite funcional.

### Prévia local da S4-03 — 26/09/2026

A pedido do Dono do produto, disponibilizada prévia em `http://127.0.0.1:3103/dashboard`, com três torneios fictícios (aberto, histórico em preparação e encerrado). Renderiza os componentes reais do painel, formulário e resultados com dependências simuladas e CSS do build. Alternância entre abas verificada no navegador e aparência inspecionada no painel lateral. Formulários desativados; não usa sessão, credenciais nem conexão com Supabase. Servidor temporário em `web/out/preview-s4.mjs`, ignorado pelo Git; execução com `node web/out/preview-s4.mjs` enquanto o arquivo e o build existirem. Esta inspeção substitui a pendência de primeira inspeção visual local indicada acima, mas não constitui aceite do Dono do produto nem homologação autenticada. Migração e publicação remotas continuam pendentes.

### Revisão pelo esboço do Dono do produto — 26/09/2026

A primeira proposta visual foi rejeitada pelo Dono do produto. Implementada localmente uma faixa de abas compactas conectada diretamente ao painel de regras, sem o cartão “Meus torneios” e sem repetir o nome como título do conteúdo. A aba ativa usa o mesmo fundo do painel. Ranking e resultados diários seguem logo abaixo. Mantidos links por URL, foco visível e rolagem horizontal quando necessária.

Também solicitada ordenação dos resultados de cada dia da maior pontuação para a menor. Escolha técnica: pontuação aplicada decrescente, empates por nome/ID, registros “Aguardando” após as pontuações e “Não inscrito” ao final. No modo relativo atual, a ordem dos resultados positivos coincide com a pontuação bruta. Não muda cálculo, banco ou RPC; nenhuma migração adicional além da S4-03 já preparada.

Verificação: suíte existente de 28 testes, lint e build aprovados; teste adicional de ordenação aprovado (inclui empate, ausência, pendência e preservação da entrada). Prévia local atualizada e inspecionada no navegador, com dia expandido. O Dono do produto pediu visualizar antes de prosseguir remotamente: aplicação da migração, publicação e aceite seguem pendentes, aguardando sua avaliação visual. Nenhuma operação remota realizada.

### Agrupamento completo na aba — 26/09/2026

A pedido do Dono do produto, lançamento, regras, ranking e resultados diários passam a ficar no mesmo painel visual delimitado e conectado à faixa de abas. Somente o histórico pessoal permanece como seção independente abaixo (além do cabeçalho global). O posicionamento do formulário é visual: a pontuação continua pessoal, sem vínculo exclusivo com a aba selecionada e reutilizada nos torneios elegíveis. Sem mudança em banco, cálculo ou permissões. Prévia local atualizada para avaliação; publicação remota continua aguardando aprovação.
Validação deste agrupamento: lint e build aprovados; prévia com dados fictícios inspecionada no navegador. Histórico pessoal permanece fora do painel delimitado.

### Ajuste final de posição — 26/09/2026

Por correção explícita do Dono do produto, “Resultado de hoje” volta a ficar fora das abas, acima delas. Dentro do painel da aba permanecem regras, preparação histórica, ranking e resultados diários; o histórico pessoal permanece separado abaixo. Esta decisão substitui apenas o posicionamento do lançamento descrito no agrupamento anterior. Sem alteração funcional, de cálculo ou banco. Prévia local atualizada; aceite e implantação remota continuam pendentes.
Verificação do ajuste final: lint e build aprovados; prévia recarregada no navegador e posição do lançamento acima das abas confirmada.

### Aceite visual e autorização de implantação — 27/09/2026

O Dono do produto aprovou a interface final (“perfeito agora podemos continuar com a implementacao remota, e testes de validacao e homologacao”). Aceite visual concluído: lançamento acima das abas, regras/ranking/resultados dentro do painel do torneio e histórico pessoal separado abaixo. Autorizada a continuidade da implantação e homologação; isso não comprova execução remota.

Preparação de implantação: conferidos os scripts de comparação e a migração incremental S4-03. Neste ambiente não há CLI Supabase/Vercel disponível e `.env.local` contém somente configuração pública da aplicação, sem credencial administrativa de banco. Ainda não foi confirmada uma sessão administrativa utilizável. A migração depende da execução pelo Dono do produto no SQL Editor ou da disponibilização de sua sessão. Não publicar o código dependente antes dessa confirmação. Primeiro executar `02-verify.sql` e analisar o retorno; depois aplicar a migração S4-03 uma vez e repetir a comparação. Não recriar o backup e não reaplicar migrações anteriores. Registrar apenas resumo das evidências, sem dados pessoais.
Conferência final em 27/09/2026: suíte completa com 29 testes aprovados, sem falhas ou testes pulados. Lint/build da interface final já aprovados; diff sem erros. Nenhuma migração ou publicação remota executada nesta conferência.

### Comparação remota anterior à S4-03 — 27/09/2026

O Dono do produto executou `02-verify.sql` e forneceu o retorno: backup `before-s4-02-september-v1`, capturado em `2026-09-26 13:56:45.612398+00`, referência `2026-09-26`, `diferencas = 0`, `detalhes = []`, checksums do backup e do estado atual iguais a `3d847140e955fd6feaaffab3b252dbe8`. A comparação confirma preservação dos dados abrangidos pela referência antes da migração S4-03. Próximo passo: aplicar somente `202609260003_multiple_tournaments.sql`, uma vez, e repetir a comparação. Migração, publicação e homologação ainda não confirmadas.

### Nova comparação fornecida pelo Dono do produto — 27/09/2026

Após a orientação de aplicar a migração S4-03 e repetir a comparação, o Dono do produto forneceu novamente `diferencas = 0`, `detalhes = []` e checksums iguais a `3d847140e955fd6feaaffab3b252dbe8`, para o mesmo backup e referência. Dados abrangidos preservados. O retorno de sucesso da migração não acompanhou a tabela; confirmação solicitada antes de publicar o código dependente. Esta evidência não deve ser tratada isoladamente como comprovação da aplicação da migração.

### Migração S4-03 confirmada — 27/09/2026

O Dono do produto confirmou explicitamente que `202609260003_multiple_tournaments.sql` terminou com sucesso antes da nova comparação. Migração remota aplicada pelo Dono do produto; comparação posterior com zero diferenças e checksum igual à referência. A confirmação resolve a pendência do registro anterior. Não reaplicar a migração. Publicação do código e homologação funcional conjunta ainda pendentes.

### Validação da navegação publicada — relato do Dono do produto em 27/09/2026

Após informar que a Vercel concluiu a build do último commit, o Dono do produto confirmou na aplicação: abas presentes, alternância entre torneios funcionando, aba selecionada preservada após recarregar, dias na ordem esperada e ranking intacto. Esses cenários estão validados pelo relato do Dono do produto. A conferência do ranking é visual, não uma nova conciliação numérica. O relato sobre a ordem dos dias não confirma separadamente a ordenação das pontuações dentro de cada dia; esse ponto continua a confirmar.

Pendências de homologação: confirmar pontuações diárias da maior para a menor; na S4-02, alterar data de participação e verificar persistência após recarregar, concluir preparação histórica em torneio de teste e verificar bloqueio da administração de participantes por outra conta. Não encerrar formalmente a S4-02 com base apenas na navegação. Validação remota relatada pelo Dono do produto, sem execução autenticada direta pelo agente.

### Homologação de participantes e acesso — 27/09/2026

O Dono do produto informou que todos os testes realizados foram satisfatórios e descreveu:

- Alteração da data de participação com persistência correta.
- Criação de outro torneio no mesmo intervalo, com outros participantes, aparentemente correto segundo sua conferência visual.
- Conta sem participação não conseguiu acessar torneios.
- Organizador incluiu a conta de teste; ao entrar novamente, ela visualizou o torneio, mas não conseguiu alterar suas configurações.
- Organizador removeu a conta de teste; ela desapareceu da lista de participantes e, ao entrar novamente, voltou a constar sem torneio.

O relato valida o ciclo de concessão/revogação de acesso e a restrição de edição pela interface, além da persistência da data. Não identifica tentativa direta de RPC nem acesso específico à administração de participantes por URL; proteções de banco seguem cobertas localmente. Não confirma explicitamente o acionamento e sucesso de “Concluir preparação do histórico” nem a ordem das pontuações dentro de um dia expandido. Solicitadas apenas essas duas confirmações para completar os pontos funcionais ainda em aberto. A declaração de satisfação se refere aos testes descritos, sem presumir execução de cenários não mencionados. Nenhuma nova operação remota realizada pelo agente.

### Encerramento funcional S4-02 e S4-03 — 27/09/2026

O Dono do produto confirmou que a ordenação dentro de cada dia funciona e que a conclusão da preparação histórica também funcionou. Essas confirmações resolvem os dois pontos funcionais restantes. Com os relatos anteriores de persistência da data, inclusão/remoção, restrição de acesso e edição, navegação entre torneios e preservação visual do ranking, S4-02 e S4-03 ficam homologadas e aceitas funcionalmente.

Evidência: execução remota e aceite relatados pelo Dono do produto, separados dos 29 testes locais aprovados e de lint/build. As confirmações não representam uma nova conciliação numérica do banco, teste remoto direto das RPCs nem ensaio concorrente. Essas limitações não são pendências de aceite dos cenários acordados. Comparações anterior/posterior à migração S4-03 já confirmadas sem diferenças; nenhuma alegação de backup atualizado após a homologação. Nenhum dado ou configuração remota foi alterado pelo agente neste encerramento documental.

### Remoção pontual de torneio de teste — 27/09/2026

Dono do produto solicitou excluir somente “Teste edicao” e confirmou o ID `de088fbd-6b81-4f4d-a3c5-b4e8683ee73e`, período 21–25/09/2026 e encerramento `2026-09-26 13:45:59.445227+00`. Preparado `web/supabase/operations/20260927-remove-test-tournament.sql` para SQL Editor, separado das migrações. Valida identidade/período/encerramento sob bloqueio e exclui em transação. FKs removem vínculos, exclusões de calendário e resultados apenas desse torneio; não remove pontuações pessoais, perfis, outros torneios ou auditorias. Registra a exclusão em `private.tournament_changes`; ator pode ser nulo na sessão administrativa, com papel do banco registrado. Não implementa RF19 nem rotina geral de exclusão. Revisão estática das FKs e triggers realizada; execução remota e conferência ainda pendentes. Nenhum novo backup foi capturado por esta operação.

### Retorno da remoção de “Teste edicao” — 27/09/2026

Após executar o SQL orientado, o Dono do produto forneceu a listagem contendo apenas “Aztecas - Setembro 2026” (`1e7e0238-fd89-49f2-bb2b-4efb99f6db44`) e “GeoGuaras — Setembro 2026” (`20260900-0000-4000-8000-000000000001`), ambos de 01 a 30/09/2026 e sem encerramento. A ausência do ID de “Teste edicao” confirma a remoção na listagem retornada. Execução realizada pelo Dono do produto; não pelo agente. O retorno não constitui nova comparação de pontuações pessoais ou backup, nem confirmação de atualização visual das abas. A pendência anterior de execução desta operação fica resolvida.

## S4-04 e S4-05 — Perfil público e GeoGuessr

Em 27/09/2026, após confirmar a remoção correta de “Teste edicao” o Dono do produto solicitou executar os requisitos restantes na capacidade disponível da sprint. Implementação local concluída; nenhuma migração, publicação ou edição remota de perfil realizada pelo agente.

### Comportamento e decisões

- “Meu perfil”, acessível pelo painel, edita nome público global e URL opcional. Campo vazio remove a URL. Mensagens indicam nome ocupado, dados inválidos ou sessão expirada. Salvar revalida as páginas do painel.
- Cadastro exige nome explícito; não deriva nome do e-mail. O banco garante unicidade com índice, inclusive quando duas tentativas disputam o mesmo nome. Feedback após erro de cadastro reconsulta disponibilidade sem exibir erro interno de Auth.
- Nome de 1 a 80 caracteres, trim ASCII e normalização NFC; sem @/controles, comparação sem distinção de caixa. Acentos e espaços internos distinguem nomes. Colisões preexistentes impedem a migração, sem alterar identidades. A grafia escolhida aparece em todos os torneios.
- Contas existentes confirmam/substituem o nome no formulário. Até salvar, RPCs exibem identificação neutra “Jogador ” + prefixo do UUID, sem e-mail como alternativa. Nomes legados são preservados e reservados até alteração. Aviso no painel encaminha ao formulário. A seleção administrativa por nome/e-mail mantém a exceção já autorizada da S4-02, mas não expõe URL de candidatos sem vínculo.
- Links GeoGuessr aparecem junto ao jogador no ranking, resultados diários e lista administrativa de participantes. URL restrita a HTTPS e host oficial exato, caminho `/user/<id>`; não consulta o serviço externo, não importa resultados nem comprova titularidade. Abrir em nova aba preserva isolamento com `noopener noreferrer`. Conferir formato com link real durante homologação.
- Políticas de escrita direta de perfis removidas; RPC só edita `auth.uid()`. Leitura direta de perfil continua restrita ao titular, e os dados de competidores são entregues apenas pelo torneio autorizado. Alterações registradas em auditoria privada. Inclusão administrativa antiga não sobrescreve nome do titular.

Decisões e consequências em [ADR-002](../decisoes/adr-002-perfil-publico.md). UUID, pontuações e vínculos são preservados. Atualizar nome muda a identificação exibida também em torneios encerrados, sem alterar os totais; desempates visuais por nome podem mudar de ordem.

### Verificação local

`pnpm test`: 36 testes aprovados, sem falhas ou testes pulados, incluindo cópia privada do backup real. `pnpm lint` e `pnpm build` aprovados. Testes de banco cobrem rejeição de colisões legadas com rollback, nomes/URLs inválidos, cadastro sem nome, duas tentativas concorrentes na fila do PGlite, unicidade, edição do próprio nome, remoção da URL, escrita direta bloqueada, isolamento de leitura, auditoria e não sobrescrita pela inclusão administrativa antiga. PGlite serializa as chamadas; não equivale a ensaio remoto com múltiplas conexões PostgreSQL. A garantia concorrente é o índice único do banco.

A comparação da cópia privada confirma preservação de nomes existentes, UUIDs, vínculos, pontuações, resultados e cálculo. Novos campos de perfil são excluídos dessa comparação de campos antigos; seus defaults são testados separadamente. Nenhum conteúdo privado do backup foi adicionado ao Git.

Prévia local em `http://127.0.0.1:3104/dashboard/profile`, componentes reais com dados fictícios, CSS do build e gravações desativadas. Tela inspecionada no navegador; não representa aceite do Dono do produto nem teste real de Auth. Script temporário em `web/out/preview-profile.mjs`, ignorado pelo Git.

### Roteiro original de migração, publicação e homologação (histórico concluído)

1. Antes de publicar, executar `web/supabase/operations/20260927-profile-preflight.sql` no SQL Editor. A consulta de colisões deve retornar zero linhas; se houver, acordar a resolução antes de prosseguir. Não renomear automaticamente. Comparar também a referência com `02-verify.sql` e explicar diferenças legítimas desde o backup original.
2. Preservar o backup privado original. Aplicar somente `202609270001_public_profiles.sql`, uma vez, depois da S4-03. A migração não altera campos antigos de perfis nem dados de jogo; acrescenta dois campos e objetos de validação/auditoria.
3. Executar `web/supabase/operations/20260927-profile-verify.sql` antes de editar perfis. Compara campos antigos, excluindo apenas `public_name_confirmed` e `geoguessr_url`; não altera a captura original. O comparador anterior, sem essa projeção, mostrará diferenças pela adição das colunas. Registrar evidências sem dados pessoais.
4. Publicar o novo código logo após a migração, pois o cadastro antigo sem nome ficará bloqueado. Comunicar que os nomes existentes passam a neutros até confirmação pelo titular. Não tratar migração aplicada como deployment concluído.
5. Homologar cadastro com nome novo, nome repetido/caixa/espaços, duas tentativas disputando o mesmo nome; confirmar/alterar nome de conta existente e verificar em outro torneio sem mudança nos totais. Testar manter o próprio nome ao mudar somente URL.
6. Incluir, editar e remover link real do GeoGuessr; verificar abertura por conta participante/organizadora e ausência de acesso por conta sem torneio comum. Testar URL inválida e tentativa de edição de outro perfil. Conferir o link no ranking, no dia expandido e na lista de participantes.
7. Registrar URL/commit publicados, retorno da migração e aceite. S4-04/S4-05 continuam pendentes de implantação e homologação; o aceite de S4-01/S4-02/S4-03 permanece válido.

### Conferência complementar de S4-04/S4-05 — 27/09/2026

Após o pedido de continuidade, acrescentados e aprovados testes de renderização de links (host/caminho permitido, nova aba protegida, rejeição de links inseguros) e do script operacional de comparação. O comparador ignora somente as duas colunas novas, detecta alteração posterior do nome e mantém intacta a captura original. São 38 testes no conjunto: suíte anterior de 36 aprovada e dois casos adicionais aprovados em execução direcionada, com regressão dos seis testes de banco de perfis. Não houve alteração de código de aplicação desde lint/build aprovados. Preflight de colisões é o próximo passo remoto; migração não aplicada, código não publicado e nenhum aceite visual presumido.

### Preflight de perfis — retorno parcial em 27/09/2026

O Dono do produto forneceu o resumo `existing_accounts = 14` e `names_requiring_replacement = 0` do script `20260927-profile-preflight.sql`. Isso confirma a contagem de contas e ausência de nomes sinalizados pelo critério dessa consulta; não comprova ausência de colisões de nomes normalizados. A primeira consulta do script, que agrupa duplicidades por caixa/espaços/NFC, ainda não teve seu resultado confirmado. Confirmar que retornou zero linhas antes de aplicar a migração. Nenhuma execução remota da migração de perfis foi confirmada.

### Preflight de perfis concluído — 27/09/2026

O Dono do produto confirmou “Success. No rows returned” ao executar separadamente a primeira consulta de `20260927-profile-preflight.sql`. Nenhuma colisão de nomes normalizados foi encontrada. Com o resumo anterior (14 contas, zero nomes sinalizados para substituição), o preflight está concluído. O registro parcial anterior fica substituído por esta confirmação. Próxima etapa: comparar a referência antes da migração, aplicar `202609270001_public_profiles.sql` uma vez e usar o comparador específico de perfis depois; não reaplicar migrações anteriores. Migração de perfis e publicação ainda não confirmadas.

### Migração de perfis e comparação posterior — 27/09/2026

O Dono do produto esclareceu que executou primeiro a migração `202609270001_public_profiles.sql`, cujo retorno foi “Success. No rows returned”. A comparação imediatamente anterior prevista no roteiro não foi realizada nesta etapa; não presumir essa evidência. Após a orientação, forneceu o retorno de `20260927-profile-verify.sql`: backup `before-s4-02-september-v1`, captura `2026-09-26 13:56:45.612398+00`, referência `2026-09-26`, zero diferenças, detalhes vazios e checksums iguais a `3d847140e955fd6feaaffab3b252dbe8`. Isso confirma preservação dos campos antigos abrangidos pela referência após a migração; o comparador exclui somente `public_name_confirmed` e `geoguessr_url`. Não equivale a validar os valores novos nem a homologar a interface.

Migração de perfis aplicada pelo Dono do produto; não reaplicar. Registros anteriores de execução pendente ficam substituídos por esta confirmação. Código novo ainda precisa de deployment; homologação S4-04/S4-05 permanece pendente.

### Consolidação final

As pendências descritas nos registros cronológicos anteriores foram resolvidas pelas confirmações de deployment, homologação e carga registradas no início deste documento. A situação vigente é Sprint 4 encerrada; não reaplicar migrações nem repetir a carga por causa de instruções históricas.
