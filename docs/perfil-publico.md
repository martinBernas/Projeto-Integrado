# Perfil público — Sprint 4

Solicitação do Dono do produto em 21/09/2026. Planejamento de RF17–RF18, ainda não implementado; Sprint 3 permanece encerrada.

## Escopo

O jogador escolhe e edita um nome público único em toda a plataforma, independente do e-mail, exibido aos competidores nas listas de participantes, resultados e rankings. E-mail não deve ser usado como identificação pública nem como alternativa para nome ausente.

O jogador pode cadastrar, editar e remover uma URL opcional de seu perfil no GeoGuessr. Participantes e organizadores de torneios em comum podem abrir esse link para localizar o jogador, solicitar amizade ou consultar o histórico disponível no serviço externo. Não inclui integração de amizades, importação de histórico ou comprovação automática da titularidade externa.

## Critérios propostos

- Nome obrigatório para novos cadastros; edição do próprio perfil também para contas existentes. Reutilizar o limite atual de 1 a 80 caracteres, remover espaços nas extremidades e rejeitar nome vazio ou endereço de e-mail.
- Não derivar novos nomes do e-mail. Revisar nomes herdados automaticamente antes de exposição; oferecer confirmação/substituição às contas existentes e identificação neutra enquanto pendente.
- URL opcional validada no servidor: HTTPS, domínio oficial e formato de perfil do GeoGuessr, a confirmar na implementação. Rejeitar outros domínios, esquemas executáveis e páginas que não sejam perfis. Campo vazio remove o link.
- Somente o titular edita seu perfil. Competidores e organizadores de torneios em comum recebem apenas nome e URL autorizados, sem acesso ao e-mail ou demais dados privados.
- Alterações preservam UUID, pontuações, vínculos e resultados. Nome global consistente entre torneios; inclusão administrativa de participantes não sobrescreve o nome escolhido.

Decisão confirmada pelo Dono do produto: o nome público deve ser único em toda a plataforma, tanto no cadastro quanto na edição, independentemente dos torneios dos quais o jogador participa.

Critério técnico proposto para comparação: remover espaços nas extremidades e ignorar diferenças entre maiúsculas e minúsculas, preservando a grafia escolhida para exibição. Assim, Martin e martin disputam o mesmo nome. Refinar tratamento de acentos e normalização Unicode na implementação.

Garantir unicidade no banco, inclusive sob requisições simultâneas; a consulta de disponibilidade no formulário não substitui essa restrição. Nome ocupado deve produzir mensagem clara, sem revelar e-mail ou outros dados da conta titular. Manter o próprio nome ao editar outros campos deve ser permitido. Antes de aplicar a restrição a contas existentes, identificar e resolver colisões sem mesclar contas nem alterar seus UUIDs, pontuações ou vínculos.

## Base existente e esforço

O banco já possui profiles.display_name, e o cadastro usa como alternativa a parte do e-mail anterior a @. O formulário não oferece escolha de nome. O ranking usa o nome do perfil; o e-mail no cabeçalho identifica a própria sessão. A função administrativa de vínculo atualmente pode alterar o nome. Ajustar esses caminhos, adicionar a URL e revisar permissões.

Priorizar S4-04 (nome público/edição) e S4-05 (URL/perfil externo) junto de S4-02 (participantes). Estimar migração, formulário, permissões e testes antes de fechar o compromisso. A inclusão aumenta o esforço da Sprint 4; se exceder a capacidade, replanejar S4-03 (navegação entre múltiplos torneios) para entrega posterior e atualizar dependências. O balanceamento anterior não comprova capacidade para as novas histórias.
