# Estatísticas do torneio — RF21 / Sprint 7

Implementação local de 18/10/2026, publicação/aceite pendentes. Sem nova migração. [ADR-009](../decisoes/adr-009-estatisticas-do-torneio.md).

```mermaid
sequenceDiagram
    actor Jogador
    participant Painel
    participant Pagina as Página de estatísticas no servidor
    participant Banco as RPC get_tournament_dashboard
    participant Calculo as tournamentStatistics
    Jogador->>Painel: Selecionar torneio e Estatísticas do torneio
    Painel->>Pagina: Navegar com UUID do torneio
    Pagina->>Pagina: Validar sessão e UUID
    Pagina->>Banco: Consultar torneio com sessão autenticada
    Banco->>Banco: Autorizar e bloquear torneio; refresh existente se aberto
    Banco-->>Pagina: Resultados aplicados completos e hoje em São Paulo
    Pagina->>Calculo: Resultados e identidade da sessão
    Calculo->>Calculo: Somente dias encerrados, elegibilidade e dados válidos
    Calculo-->>Pagina: Média própria, agregado dos demais, contagens próprias e séries
    Pagina-->>Jogador: Indicadores, gráfico e tabela sem médias individuais dos demais
```

Encerrados retornam resultados armazenados, preservando congelamento. Gráfico/tabela só recebem valores próprios e dados agregados. Sem seleção de outro perfil por parâmetro. Os dados pessoais brutos globais usados por RF20 permanecem em fluxo separado.
