# Diagrama de classes inicial

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
  Usuario "1" --> "*" Participacao
  Torneio "1" --> "*" Participacao
  Usuario "1" --> "*" PontuacaoPessoal
  Torneio "1" --> "*" ResultadoTorneio
  Participacao "1" --> "*" ResultadoTorneio
  PontuacaoPessoal "1" --> "*" ResultadoTorneio
```

`PontuacaoPessoal` não pertence a um torneio. `ResultadoTorneio` registra como uma pontuação pessoal foi calculada dentro de determinado torneio, preservando o resultado quando a configuração mudar.
