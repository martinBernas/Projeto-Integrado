# Coleta operacional — RF24 / S7-05

Implementação local; [ADR-010](../decisoes/adr-010-metricas-operacionais.md). Sem coleta remota ativa confirmada.

```mermaid
sequenceDiagram
    participant Conta
    participant App as Proxy e página no servidor
    participant Consulta as Consulta autenticada existente
    participant After as Callback após resposta
    participant RPC as RPC somente service_role
    participant Banco as Tabelas privadas de métricas
    App->>Consulta: Medir consultas mantendo identidade/permissões existentes
    Consulta-->>App: Resultado ou erro original
    App->>App: Log mínimo e buffer isolado da requisição
    App-->>Conta: Resposta do painel ou redirecionamento
    App->>After: Lote sem identificadores ou payloads
    After->>RPC: Cliente separado, segredo somente servidor, timeout de 2s
    RPC->>RPC: Validar campos e serializar quota/expurgo
    RPC->>Banco: Aceitar até 5000 por data UTC, contar descarte
    RPC-->>After: Quantidades ou erro
    Note over After: Falha não altera a resposta já enviada
```

```mermaid
flowchart LR
    Cron[Job administrativo horário] --> Purga[Expurgo de métricas e contadores antigos]
    Purga --> Tabelas[Tabelas privadas com RLS sem acesso de contas comuns]
    Admin[SQL Editor administrativo] --> Relatorio[Relatório por etapa e cobertura]
    Tabelas --> Relatorio
    Cron --> Logs[Limpar apenas histórico antigo deste job]
```

Retenção de 14 datas UTC, teto de 70.000 eventos e até 14 contadores. Sem nova UI, coleta de cliques, identificação de jogadores, alteração de ranking ou acesso de organizadores comuns aos relatórios. Migração e ativação são etapas distintas.
