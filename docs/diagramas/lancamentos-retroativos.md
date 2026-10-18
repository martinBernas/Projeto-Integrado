# Lançamentos retroativos

```mermaid
flowchart TD
    J[Jogador: data, bruto e justificativa] --> A[Server Action autenticada]
    A --> R[RPC submit_retroactive_score]
    R --> L[Bloquear jogador/data e torneios abertos]
    L --> P{Há pedido pendente no dia?}
    P -->|Sim| E[Recusar nova alteração]
    P -->|Não| B[Preservar bruto aceito em cada torneio elegível]
    B --> H[Atualizar histórico pessoal e registrar solicitação]
    H --> D[Criar decisão pendente por torneio]
    D --> N[Painel do organizador: contagem e justificativa]
    N --> V[RPC review_score_change]
    V --> T{Torneio aberto e organizador autorizado?}
    T -->|Não| E
    T -->|Sim| C{Decisão}
    C -->|Recusar| X[Preservar bruto local e registrar recusa]
    C -->|Aprovar| Q{Auditoria pendente?}
    Q -->|Sim| E
    Q -->|Não| U[Atualizar bruto local e registrar aprovação]
    U --> F[Recalcular somente este torneio na mesma transação]
    F --> S[Sanções continuam prevalecendo]
    X --> G[Todos os torneios decidiram: liberar nova alteração do dia]
    S --> G
    Z[Torneios encerrados] --> K[Resultados congelados, sem novas decisões]
```

O pessoal muda imediatamente; os torneios usam entradas locais explícitas até decisão. Sem linha local, o cálculo usa o pessoal. Nenhuma alteração é propagada aos resultados armazenados de encerrados. Pedidos pendentes bloqueiam encerramento e revisão de configuração/eligibilidade correspondente. A representação de envio e decisão são duas transações distintas; dentro de cada uma, suas escritas são atômicas.

```mermaid
erDiagram
    PERSONAL_SCORES ||--o{ RETROACTIVE_SCORE_CHANGES : origina
    RETROACTIVE_SCORE_CHANGES ||--o{ SCORE_CHANGE_DECISIONS : solicita
    TOURNAMENTS ||--o{ SCORE_CHANGE_DECISIONS : decide
    TOURNAMENTS ||--o{ TOURNAMENT_SCORE_INPUTS : conserva
    PROFILES ||--o{ RETROACTIVE_SCORE_CHANGES : envia
    PROFILES ||--o{ TOURNAMENT_SCORE_INPUTS : possui
    RETROACTIVE_SCORE_CHANGES {
        uuid id PK
        uuid personal_score_id FK
        date played_on
        int old_score
        int new_score
        text reason
    }
    SCORE_CHANGE_DECISIONS {
        uuid id PK
        uuid change_id FK
        uuid tournament_id FK
        int old_score
        text status
        uuid decided_by FK
        timestamptz decided_at
    }
    TOURNAMENT_SCORE_INPUTS {
        uuid tournament_id PK,FK
        uuid player_id PK,FK
        date played_on PK
        uuid personal_score_id FK
        int raw_score
    }
```

`old_score` e `raw_score` podem ser NULL para representar ausência anterior; `new_score` é obrigatório. A decisão conserva bruto anterior por torneio, enquanto a solicitação conserva bruto anterior pessoal. `decided_by` referencia o perfil responsável e só existe após a decisão. As tabelas novas ficam no schema privado.
