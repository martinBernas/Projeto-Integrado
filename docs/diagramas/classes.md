# Diagrama de classes inicial

O primeiro diagrama preserva o modelo conceitual da descoberta. O diagrama ao final descreve os principais campos e vínculos efetivamente implementados até S4-02.

```mermaid
classDiagram
  class Usuario {
    +UUID id
    +string nome
    +string email
    +Perfil perfil
  }
  class Torneio {
    +UUID id
    +string nome
    +date inicio
    +date fim
    +string fusoHorario
    +decimal penalidadeAusencia
    +ModoPontuacao modoPontuacao
    +CalendarioSemanal calendarioSemanal
    +Status status
  }
  class Participacao {
    +UUID id
    +UUID usuarioId
    +UUID torneioId
    +datetime ingressoEm
  }
  class PontuacaoPessoal {
    +UUID id
    +decimal pontosBrutos
    +datetime ocorridaEm
    +Status status
  }
  class ResultadoTorneio {
    +UUID id
    +decimal pontosAplicados
    +decimal impacto
  }
  class DataExcluida {
    +UUID id
    +date data
    +string motivo
  }
  Usuario "1" --> "*" Participacao
  Torneio "1" --> "*" Participacao
  Usuario "1" --> "*" PontuacaoPessoal
  Torneio "1" --> "*" ResultadoTorneio
  Torneio "1" --> "*" DataExcluida
  Participacao "1" --> "*" ResultadoTorneio
  PontuacaoPessoal "1" --> "*" ResultadoTorneio
```

`PontuacaoPessoal` não pertence a um torneio. `ResultadoTorneio` registra como uma pontuação pessoal foi calculada dentro de determinado torneio, preservando o resultado quando a configuração mudar.

## Modelo implementado até S4-02

```mermaid
classDiagram
  class Perfil {
    +uuid id
    +text display_name
  }
  class TorneioAtual {
    +uuid id
    +uuid organizer_id
    +date starts_at
    +date ends_at
    +text rule_version
    +boolean history_ready
    +timestamptz closed_at nullable
  }
  class Vinculo {
    +uuid tournament_id PK
    +uuid player_id PK
    +timestamptz joined_at
    +date eligible_from
  }
  class PontuacaoAtual {
    +uuid id
    +uuid player_id
    +date played_on
    +integer score
    +text source
  }
  class ResultadoAtual {
    +uuid id
    +uuid tournament_id
    +uuid player_id
    +uuid personal_score_id nullable
    +date played_on
    +integer applied_score
    +text result_kind
    +boolean provisional
    +jsonb applied_rule_snapshot
  }
  Perfil "1" --> "*" TorneioAtual : organiza
  Perfil "1" --> "*" Vinculo
  TorneioAtual "1" --> "*" Vinculo
  Perfil "1" --> "*" PontuacaoAtual
  TorneioAtual "1" --> "*" ResultadoAtual
  Perfil "1" --> "*" ResultadoAtual
  PontuacaoAtual "0..1" --> "*" ResultadoAtual
```

`Perfil` corresponde a `public.profiles`; e-mail pertence a `auth.users` e só é retornado na seleção administrativa autorizada. Ausências podem gerar resultados sem `personal_score_id`. O resultado é único por torneio/jogador/dia; a pontuação pessoal é única por jogador/dia. O diagrama omite campos auxiliares, exclusões de calendário e tabelas privadas de auditoria, detalhadas em [Arquitetura](../arquitetura.md).
