# Navegação entre torneios — S4-03

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
  Banco-->>Painel: Torneio, participantes, exclusões e resultados
  Painel-->>Conta: Abas e ranking do torneio selecionado
```

Seleção inválida não chama a RPC pela interface. A RPC também protege chamadas diretas. Encerrados preservam os resultados existentes. Sem mudanças no modelo de dados; o diagrama de classes da S4-02 permanece válido. Migração e publicação da S4-03 ainda pendentes.
