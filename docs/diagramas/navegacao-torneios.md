# Navegação entre torneios — S4-03

Situação S5 em 03/10/2026: painel retorna a regra única atual do torneio aberto e seu histórico de alterações; resultados diários guardam snapshots, avisos usam o calendário atual. Edição conjunta de período/regra está em /dashboard/tournaments/id/rules, com prévia e confirmação. Migrações aplicadas/verificadas e cenários relatados conferidos pelo Dono do produto; aceite global pendente. [Fluxo de revisão](regras-versionadas.md). O fluxo aceito de S4-03 abaixo permanece como base.

```mermaid
sequenceDiagram
  actor Conta
  participant Painel as Next.js /dashboard
  participant Banco as Supabase autenticado
  Conta->>Painel: Abrir painel ou aba (?tournament=uuid)
  Painel->>Banco: Listar torneios (RLS) e histórico pessoal
  Banco-->>Painel: Torneios permitidos e pontuações próprias
  Painel->>Banco: get_tournament_dashboard(uuid selecionado)
  Banco->>Banco: Autenticar, autorizar, bloquear torneio e revalidar acesso
  Banco->>Banco: Atualizar resultados do alvo se aberto
  Banco-->>Painel: Torneio, participantes, exclusões, resultados, regra atual e histórico
  Painel-->>Conta: Abas e ranking do torneio selecionado
```

Seleção inválida não chama a RPC pela interface. A RPC também protege chamadas diretas. Encerrados preservam os resultados existentes. Na S4-03 não houve mudança de modelo; a S5 acrescentou histórico de regras/auditoria, conforme o [modelo atualizado](classes.md) e ADR-004. Migração confirmada e aplicação publicada homologada pelo Dono do produto em 27/09/2026.

## S5-04 — Expansão local de dias

```mermaid
sequenceDiagram
  actor Conta
  participant Servidor as TournamentView / servidor
  participant Lista as RecentResults / cliente
  Servidor->>Servidor: Ranking completo e detalhes de todos os dias autorizados
  Servidor->>Lista: Conteúdos diários, chave pelo ID do torneio
  Lista-->>Conta: Cinco dias recentes e Ver todos, quando necessário
  Conta->>Lista: Ver todos / Mostrar menos
  Lista-->>Conta: Alternar apresentação, ranking permanece completo
  Note over Lista: Sem nova consulta ou gravação
  Conta->>Servidor: Selecionar outro torneio pela URL
  Servidor->>Lista: Nova seleção autorizada, nova chave
  Lista-->>Conta: Apresentação reduzida da nova seleção
```

Conteúdos completos continuam transferidos; limite apenas de apresentação. Implementação local, publicação/homologação adicional pendentes.