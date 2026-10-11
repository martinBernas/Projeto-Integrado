# Auditoria por votação — Sprint 6

Implementação local de 11/10/2026; migração remota pendente. Decisões e restrições na [ADR-006](../decisoes/adr-006-auditoria-por-votacao.md).

```mermaid
stateDiagram-v2
    [*] --> Pedido: Participante solicita com justificativa
    Pedido --> Rejeitado: Organizador rejeita com motivo
    Pedido --> Votacao: Organizador aprova e fixa eleitorado e 48h
    Votacao --> Mantida: Organizador apura após prazo e não há maioria pela invalidez
    Votacao --> Invalidada: Organizador apura após prazo e há maioria pela invalidez
    Invalidada --> ContribuicaoZero: Desconsiderar
    Invalidada --> Penalidade: Substituir pela penalidade do dia
```

```mermaid
flowchart LR
    Tela[Participante ou organizador] --> Acao[Server Action com sessão e validação]
    Acao --> RPC[RPC autoriza e bloqueia torneio]
    RPC --> Avaliacoes[(Avaliações privadas)]
    RPC --> Eleitores[(Eleitorado da abertura)]
    RPC --> Votos[(Votos secretos e eventos privados)]
    RPC --> Apuracao[Apuração manual após prazo]
    Apuracao --> Decisao[(Decisão e resultados antes/depois)]
    Apuracao --> Calculo[Cálculo do torneio e menor positivo sem inválido]
    Calculo --> Resultados[(Resultados e histórico existente)]
    Consulta[Consulta autorizada] --> Projecao[Pedido, decisão, voto próprio e totais finais]
    Projecao --> Tela
```

A pontuação pessoal original continua compartilhada; decisão usa o par torneio/pontuação. As tabelas privadas não recebem permissões diretas para papéis clientes. Bloqueio do torneio coordena votos, apuração e mutações existentes; encerramento/configuração e alteração do auditado aguardam avaliações pendentes. Correção do bruto em avaliação é bloqueada. A autoria dos demais votos não aparece na projeção nem nos resultados anteriores/posteriores.
