# Sprint 6 — Backup, migração e homologação

Situação em 11/10/2026: scripts preparados e exercitados localmente com dados fictícios/PGlite. Nenhum backup novo capturado no Supabase, migração remota aplicada, publicação ou homologação confirmada.

## Sequência operacional

1. Programar pausa de gravações na aplicação durante captura, migração e comparação. O bloqueio SQL existe apenas durante cada transação e não substitui a pausa entre scripts. Confirmar ambiente alvo e disponibilidade de backup integral da plataforma; a captura desta sprint cobre dados de negócio e definições alteradas, sem exportar Auth, credenciais ou toda a infraestrutura.
2. Executar `web/supabase/rehearsal/sprint6/01-backup.sql` no SQL Editor. Guarda `before-s6-v1` em tabela privada, com data de referência, dados, históricos, cálculo e definições anteriores. Registrar apenas identificador, horário, contagens e checksum como evidência. Não sobrescreve a captura nem aceita executar após S6 instalada.
3. Executar `02-export.sql`. Salvar o retorno completo em arquivo privado em `backups/sprint-6/`, diretório ignorado pelo Git. Conferir que snapshot e definições estão completos e que o checksum é igual ao da captura. Não colar dados pessoais no chat, documentação ou repositório. Exportação privada real e sua validação ainda pendentes.
4. Aplicar uma única vez `web/supabase/migrations/202610110001_score_audits.sql`, após todas as migrações S5. Não reaplicar migrações antigas. Transação com lock_timeout de 10 segundos; falha exige diagnosticar antes de reexecutar.
5. Executar `03-verify.sql` antes de usar a nova interface, ainda com gravações pausadas. Exige backup presente, ausência de avaliações e igualdade integral dos dados/histórico/cálculo, além de conferir RLS e permissões selecionadas. Esperado: `preserved = true` e checksums iguais. Divergência aborta o procedimento; não publicar nem restaurar dados globalmente por iniciativa automática.
6. Publicar a aplicação compatível somente após a comparação aprovada e confirmar a versão/URL usada. Liberar acesso e executar o roteiro abaixo em torneios e contas de teste separados, sem alterar lançamentos legítimos.

## Roteiro de homologação

- Participante solicita auditoria de bruto positivo com justificativa; justificativa vazia e conta externa são rejeitadas. Organizador não participante não solicita pelo papel de organizador; administra os pedidos recebidos.
- Organizador rejeita com motivo e consulta o registro; um novo pedido para o mesmo par é recusado. Aprovar outro pedido inicia prazo de 48 horas, sem retroagir ao instante da solicitação.
- Auditado não vota; organizador participante e demais integrantes da abertura votam. Participante incluído depois não vota; removido perde acesso, mas voto anterior permanece contabilizado.
- Jogador vê seu próprio voto e pode alterá-lo até o prazo. Outros jogadores e organizador não veem autoria ou escolhas individuais alheias. Antes da apuração, não há totais parciais. Conferir também as respostas de rede, sem limitar a inspeção à tela.
- Antes do prazo, apuração é recusada; após o prazo, novo voto/alteração é recusado. Para teste acelerado, usar apenas uma cópia local; não encurtar avaliações reais nem criar uma RPC pública para relógio de teste. No remoto, aguardar as 48 horas.
- Empate, nenhum voto ou maioria pela manutenção mantêm os resultados; escolha de punição não contorna esse resultado.
- Maioria pela invalidez: testar separadamente contribuição zero e penalidade do dia, nos modos absoluto e relativo. Invalidar o menor positivo recalcula o dia. Comparar o mesmo bruto usado em outro torneio, que deve permanecer inalterado; pontuação pessoal não é apagada/reescrita pela apuração.
- Repetir apuração preserva decisão e não duplica punição. Consultar resultados antes/depois, totais finais, valor da penalidade e indicação de auditoria no painel. Revisão posterior da regra não modifica a penalidade já aplicada.
- Durante pedido/votação pendente: encerramento/revisão de regras e remoção/alteração de elegibilidade do auditado bloqueados; correção de seu bruto bloqueada. Após conclusão, fluxos retomados conforme regras existentes.
- Verificar duas sessões reais simultâneas: pedidos para o mesmo par, alteração de voto próxima ao prazo, apuração repetida e apuração concorrente com revisão/encerramento. Testes PGlite exercitam atomicidade e requisições enfileiradas, não múltiplas conexões reais.
- Celular, teclado, mensagens de erro/nova tentativa, consulta de torneio encerrado e ausência de avaliações. Atualizar a página para obter novo estado/prazo; não há atualização em tempo real nesta entrega.

## Recuperação e preservação

Falha dentro da migração reverte a própria transação. Se a comparação divergir após sua conclusão, manter gravações pausadas, preservar a captura e o estado atual e diagnosticar a diferença. As definições anteriores são exportadas para recuperação orientada; não há script genérico de restauração global. Antes do uso, retorno técnico exige restaurar definições/contratos anteriores e remover apenas objetos S6 numa operação revisada em cópia, com comparação posterior. Depois do uso, não remover tabelas de votos/decisões nem restaurar a captura antiga: isso perderia avaliações ou lançamentos legítimos. Preferir correção incremental, preservando histórico e votos secretos.

## Evidências a registrar

11/10/2026 — Dono do produto executou `03-verify.sql` após a migração e forneceu retorno: `id = before-s6-v1`, `checksum_backup = checksum_current = 99a06d73cc74acb813732eca01f03bc9`, `preserved = true`. Comparação remota anterior ao uso aprovada: dados, históricos e cálculo na data capturada preservados; verificações de RLS/permissões selecionadas do script concluídas sem exceção. Backup/exportação, migração e comparação concluídos. Publicação da aplicação compatível, homologação e aceite ainda pendentes. Registros anteriores de comparação pendente são históricos.

11/10/2026 — Dono do produto relatou execução da migração `202610110001_score_audits.sql` no Supabase com retorno `Success. No rows returned`. Migração remota confirmada pelo relato; comparação `03-verify.sql` ainda pendente. Manter pausa até a comparação anterior ao uso; publicação/homologação não confirmadas. Não reaplicar a migração.

11/10/2026 — Exportação fornecida pelo Dono do produto como tabela em texto, preservada privadamente em `backups/sprint-6/backup-before-s6-original.txt` e convertida para `backup-before-s6.json`, ambos ignorados pelo Git. Validação local: JSON completo, 13 seções esperadas, 4 torneios, 362 pontuações e duas definições de funções. Checksum recalculado a partir da representação textual canônica de JSONB: `99a06d73cc74acb813732eca01f03bc9`, igual à captura e ao checksum da exportação. Exportação privada recebida e validada; conteúdo pessoal não reproduzido na documentação. Migração/comparação ainda não confirmadas.

11/10/2026 — Dono do produto executou `01-backup.sql` no Supabase e forneceu o retorno: identificador `before-s6-v1`, captura `2026-10-11 13:53:51.711585+00` (10:53:51 em São Paulo), referência `2026-10-11`, checksum `99a06d73cc74acb813732eca01f03bc9`, 4 torneios e 362 pontuações pessoais. Captura remota confirmada por esse retorno; exportação privada/validação, migração e comparação ainda pendentes. Nenhum conteúdo pessoal do snapshot registrado aqui.

Identificador/horário/checksum/contagens da captura; exportação validada em armazenamento privado; retorno da migração; `preserved` e checksums da comparação; versão/URL da aplicação; cenários e resultados da homologação; aceite explícito do Dono do produto. Não apresentar os testes locais como evidência remota.
