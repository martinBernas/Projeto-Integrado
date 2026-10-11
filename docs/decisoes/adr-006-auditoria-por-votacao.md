# ADR-006 — Auditoria por votação restrita ao torneio

Data: 11/10/2026. Situação: escolha técnica implementada localmente na Sprint 6; regras funcionais confirmadas pelo Dono do produto na conversa. Migração e homologação remotas ainda não executadas.

## Contexto

Pontuações pessoais são compartilhadas por vários torneios. Invalidar o bruto globalmente afetaria competições não envolvidas. No modo relativo, retirar o menor positivo exige recalcular os demais resultados do mesmo dia. Votos secretos precisam preservar autoria internamente sem expô-la ao organizador ou a outros jogadores.

## Decisões funcionais confirmadas

Participantes solicitam auditoria com justificativa obrigatória; organizador aprova antes de iniciar 48 horas de votação. Eleitorado definido na abertura, excluindo o auditado; organizador vota se participante. Um voto por eleitor, alterável até o prazo. Maioria simples dos votos recebidos, sem quórum mínimo; empate ou nenhum voto mantém a pontuação. Votos secretos; cada eleitor consulta seu próprio voto. Uma auditoria por pontuação/torneio, sem recurso ou reabertura nesta sprint. Pontuação continua no ranking durante a avaliação. Organizador apura após o prazo e, se inválida, escolhe contribuição zero ou penalidade da regra aplicável à data auditada. Invalidação retira o bruto da referência relativa daquele torneio.

## Escolhas técnicas de implementação

- Quatro tabelas privadas com RLS e sem acesso direto de contas da aplicação: avaliações, eleitorado, votos e eventos. RPCs com SECURITY DEFINER, search_path fixo e validação explícita de identidade/acesso; nenhuma chave de serviço no aplicativo.
- Pedidos registram bruto e data originais. A chave única é torneio/pontuação pessoal, inclusive após rejeição. Rejeição exige motivo e permanece consultável.
- Aprovação, voto e apuração serializam pelo bloqueio da linha do torneio; aprovação fixa eleitorado e prazo. Conta removida perde acesso para novos votos ou alterações; voto emitido enquanto elegível permanece na apuração. Entrada posterior não concede voto nessa avaliação.
- Apuração manual, transacional e idempotente. Guarda totais, responsável, punição, regra/valor da penalidade e resultados completos do dia antes/depois. Eventos internos guardam alterações de voto; a consulta pública retorna apenas voto próprio e totais finais. Totais parciais não são expostos.
- O cálculo canônico, reutilizado pela prévia de regras, exclui a pontuação invalidada antes de obter o menor positivo. Mantém bruto e referência pessoal nos resultados; adiciona situações audit_disregarded/audit_penalty e explicação no snapshot. A penalidade fixada na apuração não muda em revisões posteriores de regras.
- Tokens de prévia incluem o estado das avaliações. Uma alteração entre prévia e confirmação exige nova prévia.
- Proteções de integridade: pedidos/votações pendentes impedem encerramento e revisão de configuração/período do torneio. Remoção ou mudança de elegibilidade do auditado aguarda conclusão; alterações nos demais participantes seguem os contratos existentes. Correção do bruto em avaliação é bloqueada até rejeição/apuração para impedir troca do valor votado ou fuga da política de auditoria única. Essa é uma restrição técnica adicional à correção pessoal do dia atual e deve ser homologada pelo Dono do produto.

## Consequências e limites

Torneios não envolvidos e pontuações pessoais permanecem preservados pela apuração. Histórico da decisão permanece mesmo se uma revisão posterior retirar o dia do calendário; restauração do dia reutiliza a decisão. A interface não oferece reabertura, recurso, tarefa automática de apuração, notificação ou moderação global. Pedidos podem bloquear operações administrativas até o organizador avaliá-los. Um pedido rejeitado também impede outro pedido sobre o mesmo par nesta sprint.

Página dedicada evita aumentar o payload do painel com votos e eventos. A consulta de auditorias ainda não é paginada; validar volume em homologação e refinar paginação no histórico avançado da Sprint 7. Testes locais usam PGlite e não comprovam concorrência real entre conexões do Supabase.

## Implantação

Capturar/exportar referência privada antes de aplicar `202610110001_score_audits.sql`; comparar dados, histórico e cálculo na data capturada antes de uso da interface. Migração não recalcula nem altera dados existentes. Procedimento e recuperação em [operação S6](../sprints/sprint-6-operacao.md); [diagrama](../diagramas/auditoria-votacao.md).
