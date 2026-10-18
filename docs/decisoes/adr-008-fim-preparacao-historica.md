# ADR-008 — Retirar a preparação histórica do fluxo normal

Data: 18/10/2026. Decisão funcional confirmada pelo Dono do produto; escolha técnica implementada localmente, sem migração remota.

## Contexto

`history_ready` suspendia penalidades durante a carga inicial do primeiro torneio. A carga terminou e a aplicação passou a registrar pontuações normalmente. Exigir conclusão manual em cada torneio acrescentava uma etapa sem valor e permitia deixar ausências sem penalidade indefinidamente.

## Decisão

Eliminar a preparação da interface e da Server Action; retirar a RPC pública de conclusão e a condição histórica do cálculo e do encerramento. Ausências e zero seguem a regra do dia encerrado, calendário e elegibilidade, sem ativação manual. Dia atual permanece provisório. Auditorias continuam restritas ao torneio e bloqueiam encerramento quando pendentes.

Escolha técnica: migração incremental substitui as funções vigentes, ajusta valor padrão/criação e preserva `history_ready` como coluna legada sem efeito no cálculo. Não remover fisicamente a coluna nesta entrega: tabelas compostas, migrações antigas, funções administrativas de setembro e snapshots de backup ainda a referenciam. Mantê-la evita exclusão em cascata de dependências e perda de evidência histórica. Novos snapshots de cálculo deixam de conter essa chave; snapshots já gravados permanecem até recálculo normal de torneios abertos.

Migração não modifica linhas de negócio nem dispara recálculo em lote. Torneios abertos com marcador falso passam a aplicar ausências no próximo recálculo; ranking pode mudar. Encerrados permanecem congelados pela proteção existente em `private.refresh_tournament`. A prévia de regras reutiliza o cálculo atualizado. Configuração e períodos, permissões, transações, bloqueios e cálculo das sanções são preservados. RPC de conclusão é removida sem `CASCADE`; dependência inesperada impede migração em vez de ser apagada.

## Consequências e implantação

Preservar backup privado e revisar inventário de torneios abertos em preparação antes de executar `202610180002_retire_history_preparation.sql`; publicar interface atualizada após a migração. Sessão com interface antiga deve ser recarregada. Nenhum procedimento de carga histórica deve ser necessário para novos torneios. Cargas/ensaios antigos permanecem históricos e não devem ser reaplicados como operação atual.

Rollback exige revisar funções e resultados recalculados, preservando novos lançamentos; não basta voltar o frontend para recuperar pontuações derivadas anteriores. Limpeza física futura da coluna exige mapear dependências/retencão e não integra esta entrega. [Escopo, testes e acompanhamento](../sprints/manutencao-pos-sprint-6.md).
