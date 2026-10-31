# Sprint 8 — relatório final e retirada

31/10/2026 — V5 local: todos os encerramentos e o worker usam o mesmo renderizador. `tournamentReport` calcula acumulados e até cinco duplas; `scoreChartPanels` divide automaticamente em cinco datas pontuadas, unindo sobra unitária e calculando domínios locais. Panorama e cada intervalo ocupam página própria. Sem alteração de schema/fluxo de fila. Publicação, aceite do PDF e substituição remota pendentes; diagramas de captura/envio/manutenção continuam válidos. [ADR-015 atual](../decisoes/adr-015-correcao-pontos-acumulados.md).

31/10/2026 — Evolução por pontos acumulados e substituição administrativa local conforme [ADR-015](../decisoes/adr-015-correcao-pontos-acumulados.md). Sem mudança no modelo de dados. Prévia HCM gerada; aceite, publicação e substituição remota pendentes. O fluxo de manutenção abaixo complementa o fluxo normal; não chama SMTP.

```mermaid
sequenceDiagram
  actor D as Dono do produto / administrador
  participant B as PostgreSQL privado
  participant L as CLI local offline
  participant F as Arquivos privados
  D->>B: Inventário e exportação da captura + hashes (leitura)
  B-->>D: Captura congelada e checksums do alvo
  D->>F: Salvar exportação fora do Git
  F->>L: Captura exportada
  L->>F: PDF v2, evidência, SQL de backup e substituição
  D->>F: Validar PDF real do HCM
  Note over D,B: Somente após aceite e publicação da correção
  D->>B: Exportar backup completo do alvo (leitura)
  B-->>F: Fila, PDF original e destinatários
  D->>F: Validar backup/checksums
  D->>B: Executar substituição delimitada
  Note over B: Transação: lock torneio e fila; recusar retirada/lease ativo;<br/>comparar hashes; trocar somente pdf_base64
  B-->>D: Checksum do PDF corrigido
  D->>B: Conferir arquivo e preservação dos demais campos
  Note over B: Sem reenvio, alteração do prazo ou reativação
```

Versão Gmail local em 24/10/2026, conforme ADR-014. Migração inicial instalada/comparada; incremento SMTP e ativação remota ainda pendentes. A tabela MAIL_EVENTS pertence ao desenho legado Resend, sem novas escritas no fluxo atual. Complementa o [modelo existente](classes.md), sem alterar pontuações pessoais ou fórmulas dos torneios.

```mermaid
erDiagram
  TOURNAMENTS ||--o| TOURNAMENT_REPORTS : captura_no_encerramento
  TOURNAMENT_REPORTS ||--o{ REPORT_DELIVERIES : destinatarios
  PROFILES ||--o{ TOURNAMENT_PARTICIPANTS : participa
  TOURNAMENTS ||--o{ TOURNAMENT_PARTICIPANTS : vinculos_preservados
  TOURNAMENTS ||--o{ SCORE_RESULTS : resultados_congelados
  REPORT_DELIVERIES }o--o| MAIL_EVENTS : provider_id
  TOURNAMENT_REPORTS {
    uuid tournament_id PK
    jsonb snapshot
    text pdf_base64
    timestamptz generated_at
    timestamptz due_at
    uuid lease_token
    timestamptz lease_until
    timestamptz next_attempt_at
    timestamptz withdrawn_at
  }
  REPORT_DELIVERIES {
    uuid id PK
    uuid tournament_id FK
    uuid player_id
    text email
    text state
    timestamptz first_attempt_at
    text provider_id
    timestamptz sent_at
  }
  MAIL_EVENTS {
    text provider_id PK
    text event
    timestamptz event_at
    timestamptz received_at
  }
```

Esquema `private` nas três entidades novas; `provider_id` é associação operacional, sem FK para aceitar evento anterior à resposta do envio. Snapshot/PDF e endereços tornam-se nulos na retirada. Os registros originais do torneio permanecem internos, sem visibilidade pelas contas da aplicação.

```mermaid
sequenceDiagram
  actor O as Organizador
  participant A as Next.js
  participant DB as PostgreSQL
  participant P as Gmail SMTP
  participant C as Cron / pg_net
  O->>A: Encerrar pelo fluxo existente
  A->>DB: close_tournament
  Note over DB: Mesma transação: bloquear pendências, recalcular,<br/>congelar, capturar dados e destinatários
  DB-->>A: Encerrado + fila durável
  A->>DB: claim com token e lease
  A->>A: Gerar PDF com classificação, evolução e duplas
  A->>DB: Persistir PDF antes de enviar
  loop Até cinco destinatários por execução
    A->>P: E-mail individual + PDF por SMTP/TLS
    P-->>A: Aceitação positiva do envio para o destinatário
    A->>DB: sent + Message-ID (encaminhamento aceito)
  end
  C->>A: A cada cinco minutos: recuperar fila (bearer)
  alt PDF gerado + todos os envios aceitos pelo Gmail
    O->>DB: Retirada antecipada via ação autenticada
    C->>DB: A cada minuto: retirar vencidos há 168h
    Note over DB: Marcar withdrawn_at; limpar PDF/captura/endereços;<br/>RLS e consultas privilegiadas ocultam torneio
  else Pendência ou envio incerto
    Note over DB: Preservar encerrado e bloquear toda retirada
  end
```

Sem webhook de entrega. Timeout/resultado incerto bloqueia retirada e repetição automática; Message-ID não é garantia de deduplicação SMTP. Falhas comprovadas antes de submeter ou rejeições explícitas permitem nova tentativa. Rotas técnicas têm autenticação própria; o tema continua independente do envio/PDF. [ADR-014](../decisoes/adr-014-relatorios-gmail-sem-custo.md).
