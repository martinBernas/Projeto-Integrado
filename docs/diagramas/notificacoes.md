# Pedidos, notificações e votações

```mermaid
flowchart TD
    P[Painel autenticado] --> R[Meus pedidos]
    R --> C[Solicitar ajuste retroativo]
    R --> D[Abrir denúncia no torneio de participação]
    R --> H[Consultar pedidos próprios e decisões]
    C --> S[RPC de retroativos existente]
    D --> A[RPC de auditoria existente]
    P --> Q[RPC get_tournament_notifications]
    Q --> O{Organiza algum torneio?}
    O -->|Sim| N[Quadro administrativo]
    N --> G[Gerenciar notificações dos torneios]
    G --> L[Ajustes somente dos torneios organizados]
    G --> M[Denúncias, votação em curso e apuração]
    L --> U[RPC de decisão retroativa existente]
    M --> B[RPCs de revisão e resolução de auditoria existentes]
    Q --> V{Participante com votação aberta?}
    V -->|Sim| E[Aviso até o prazo, mesmo após votar]
    E --> T[Votação e histórico por torneio]
    T --> F[Voto próprio secreto se elegível]
    F --> W[RPC de voto existente]
```

O resumo lê as tabelas de estado e não recalcula rankings. Consultas pessoais e administrativas filtram antes da paginação no banco. O quadro administrativo não aparece a contas sem torneios organizados; o aviso de votação depende da participação atual, e a permissão de voto também exige o eleitorado fixado na abertura. Vencido o prazo, a votação deixa de ser oferecida ao participante e vira apuração pendente para o organizador. Nenhum novo armazenamento de notificações ou mudança no modelo de pontuação da ADR-011.
