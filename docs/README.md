# GeoGuaras — Wiki do Projeto

31/10/2026 — Captura Aztecas recebida e validada; PDF v5 gerado pelo mesmo código aprovado do HCM (6 jogadores, 21 datas, 8 páginas, 126 células conferidas). Inventário atual confirmou hashes originais dos dois alvos, envios 6/6 e 18/18 e ausência de lease/retirada. Dono do produto informou que a v5 ainda não foi publicada e que fará a publicação após finalizar os arquivos. Backup/exportação e verificador offline dos dois alvos preparados; nenhuma substituição remota executada. [Entrega/evidências](sprints/sprint-8-correcao-grafico.md), [operação após publicar](sprints/sprint-8-correcao-grafico-operacao.md).

31/10/2026 — Dono do produto aprovou explicitamente a versão v5 do PDF e autorizou avançar com publicação e regeneração dos relatórios HCM e Aztecas. Aceite visual/funcional desta versão concluído; não confundir com publicação ou substituição remota, ainda sem evidência. Preparada consulta somente leitura dos dois alvos e exportação da captura Aztecas. [Aceite e próximos passos](sprints/sprint-8-correcao-grafico.md), [procedimento operacional](sprints/sprint-8-correcao-grafico-operacao.md).

31/10/2026 — RF19 v5 implementado no gerador compartilhado da plataforma, por solicitação do Dono do produto: panorama e intervalos de cinco datas pontuadas, sobra final de uma data incorporada ao anterior, mínimo/máximo locais e uma página por gráfico. Até cinco duplas por quantidade de trocas, com ordem alfabética para empates de apresentação. Anexo com nomes de jogadores, sem “Série”/“S1”. Regras automáticas para qualquer captura de torneio, sem nome, calendário ou quantidade de jogadores fixados. [Entrega/testes](sprints/sprint-8-correcao-grafico.md), [operação](sprints/sprint-8-correcao-grafico-operacao.md), [ADR-015](decisoes/adr-015-correcao-pontos-acumulados.md). Prévia HCM v5 gerada; publicação, aceite do PDF e substituições remotas ainda pendentes.

31/10/2026 — Plano de correção de RF19 aprovado pelo Dono do produto e implementado localmente: gráfico/tabela de pontos acumulados, panorama do período completo, detalhes e legenda por página. Prévia real do HCM gerada a partir da captura congelada, com conferência dos 18 totais finais; aceite visual ainda pendente. CLI offline e substituição administrativa por ID/checksums preparados, sem reset de envios ou prazo. [Entrega](sprints/sprint-8-correcao-grafico.md), [operação e inventário](sprints/sprint-8-correcao-grafico-operacao.md), [ADR-015](decisoes/adr-015-correcao-pontos-acumulados.md). Publicação e substituição remota ainda não executadas; sem reenvio de e-mails. Este estado substitui o registro anterior de entrega exclusivamente documental.

31/10/2026 — Correção de RF19 solicitada pelo Dono do produto: o gráfico deve mostrar **pontuações acumuladas por data**, substituindo a interpretação anterior de posições. Planejado validar o PDF corrigido com o HCM encerrado (18 participantes) antes de regenerar os relatórios correspondentes na plataforma. [Plano, critérios e cuidados operacionais](sprints/sprint-8-correcao-grafico.md). Entrega documental; correção, prévia, publicação e regeneração ainda não executadas. Reenvio de e-mails não definido. Registros anteriores sobre gráfico de posições ficam como histórico substituído por esta decisão.

## Referência atual — 24/10/2026

Sprint 7 encerrada em 18/10/2026; consultar [entregas e evidências](sprints/sprint-7.md). [Sprint 8](sprints/sprint-8.md) implementada localmente: PDF geral, envio aceito pelo Gmail, retirada lógica protegida e Claro/Escuro/Sistema. Migração inicial instalada/comparada; adaptação Gmail local, com incremento/configuração/publicação e homologação ainda pendentes. O Dono do produto não identificou ganho no histórico avançado a partir do uso observado; essa ampliação foi retirada da proposta de prioridade. Relatórios individuais ficam no RF25 futuro; nenhuma retirada ou envio real nesta entrega. RF24 e homologação complementar permanecem acompanhamentos da Sprint 7, sem nova evidência remota nesta atualização. Os estados cronológicos anteriores abaixo são históricos e devem ser lidos à luz dos encerramentos posteriores.

Aceite e encerramento em 03/10/2026: Dono do produto declarou explicitamente “está aceita a sprint”. Sprint 5 concluída, incluindo S5-01–S5-05. Aceite considera as evidências e limites registrados: carregamento confirmado na aplicação utilizada; Tentar novamente validado localmente, sem falha observada para homologação remota. Análise de amostras, diagnóstico da demora e eventuais melhorias permanecem acompanhamento posterior. Versão/URL do deployment não informadas; nenhum novo SQL necessário para S5-04/S5-05.

Os estados anteriores abaixo são registros históricos; o aceite acima é a situação vigente.

Situação consolidada em 03/10/2026: S5-01–S5-03 implementadas, migrações executadas/verificadas e cenários relatados homologados; TESTE S5 retirado, quatro torneios originais e lançamentos legítimos preservados. S5-04 (resultados recentes e histórico pessoal) teve funcionamento confirmado pelo Dono do produto. S5-05 (carregamento, recuperação e métricas) implementada localmente, com 69 testes, lint e build aprovados; telas de carregamento confirmadas pelo Dono do produto na aplicação utilizada; nenhuma falha ocorreu para conferir Tentar novamente. Versão/URL não informadas. Análise das amostras e otimização posterior ficam como acompanhamento, conforme orientação do Dono do produto, sem prometer redução de latência. Sprint 5 aceita e encerrada pelo Dono do produto em 03/10/2026; análise de logs e melhorias posteriores ficam como acompanhamento. A situação detalhada e cronológica está em docs/sprints/sprint-5.md.

Aplicação web para registrar pontuações pessoais de GeoGuessr, administrar torneios e gerar rankings com regras de pontuação auditáveis.

Sprint 3 concluída em 21/09/2026. [Encerramento e evidências](sprints/sprint-3-encerramento.md). Em 22/09, carga real confirmada de 11 participantes e 148 pontuações. Complementos, elegibilidade, penalidades e correção local do painel estão no [registro operacional de 22/09](sprints/operacao-2026-09-22.md).

## Documentação

- [Roteiro vigente — Gmail gratuito, incremento SMTP](sprints/sprint-8-gmail-operacao.md)
- [ADR-014 — Gmail existente e sucesso por aceitação SMTP](decisoes/adr-014-relatorios-gmail-sem-custo.md)

- [Sprint 8 — backup, configuração, ativação e recuperação](sprints/sprint-8-operacao.md)
- [ADR-013 — relatório final e retirada lógica](decisoes/adr-013-relatorios-e-retirada-de-torneios.md)
- [Diagrama de dados e sequência da Sprint 8](diagramas/relatorios-e-retirada.md)

- [Relatório geral da Sprint 8 e relatórios individuais futuros — RF19/RF25](relatorios-de-torneio.md)

- [Sprint 6 — auditoria por votação: escopo e implementação local](sprints/sprint-6.md)
- [Sprint 6 — backup, migração e homologação](sprints/sprint-6-operacao.md)
- [ADR-006 — auditoria por votação e sigilo](decisoes/adr-006-auditoria-por-votacao.md)
- [Plano de ação](plano-de-acao.md)
- [Sprint 5 — implementação local e planejamento](sprints/sprint-5.md)
- [Sprint 5 — migração, backup, recuperação e homologação](sprints/sprint-5-operacao.md)
- [Decisão e modelo de regras versionadas](decisoes/adr-003-regras-versionadas.md)
- [Sprint 8 — encerramento definitivo e modo escuro](sprints/sprint-8.md)
- [Sprint 7 — encerramento, estatísticas, métricas e retroativos](sprints/sprint-7.md)
- [Avaliação do escopo pendente e feedback — 27/09/2026](avaliacao-backlog-2026-09-27.md)
- [Sprint 1 — descoberta e documentação](sprints/sprint-1.md)
- [Sprint 2 — fundação, autenticação e publicação](sprints/sprint-2.md)
- [Sprint 3 — MVP utilizável](sprints/sprint-3.md)
- [Sprint 3 — implantação e carga histórica](sprints/sprint-3-operacao.md)
- [Operação de 22/09 — carga real e correção de elegibilidade](sprints/operacao-2026-09-22.md)
- [Sprint 3 — ensaio com duas contas e rollback](sprints/sprint-3-ensaio.md)
- [Histórico da documentação](historico.md)
- [Auditoria de pontuações — Sprint 6](auditoria-de-pontuacoes.md)
- [Documentação funcional](documentacao-funcional.md)
- [Arquitetura e implantação](arquitetura.md)
- [Decisão técnica: Vercel e Supabase](decisoes/adr-001-vercel-e-supabase.md)
- [Requisitos](requisitos.md)
- [Perfil público — Sprint 4](perfil-publico.md)
- [Regras de pontuação](regras-de-pontuacao.md)
- [Plano de testes](plano-de-testes.md)
- [Diagrama de classes](diagramas/classes.md)

## Fonte do MVP

A entrega original da Sprint 3 foi um único torneio pré-instanciado, com lançamento, cálculo e ranking. A Sprint 4 acrescentou administração, participantes, múltiplos torneios e perfis. A Sprint 5 entregou configuração de regras pela interface, regra única e período editável, com evidências no documento da sprint. Consulte a avaliação do backlog para as lacunas atuais.

O arquivo `GeoGuaras.xlsx` é a referência inicial do domínio. Ele contém a aba `Diario`, com as pontuações brutas, e a aba `geral`, com os pontos aplicados, resultados mensais e acumulado.

## Stack definida

TypeScript, Next.js, Tailwind CSS e Vercel para a aplicação web. Supabase fornece PostgreSQL, autenticação e autorização via RLS.

## Situação atual

Situação consolidada em 03/10/2026: S5-01–S5-03 implementadas, migrações executadas/verificadas e cenários relatados homologados; TESTE S5 retirado, quatro torneios originais e lançamentos legítimos preservados. S5-04 (resultados recentes e histórico pessoal) teve funcionamento confirmado pelo Dono do produto. S5-05 (carregamento, recuperação e métricas) implementada localmente, com 69 testes, lint e build aprovados; telas de carregamento confirmadas pelo Dono do produto na aplicação utilizada; nenhuma falha ocorreu para conferir Tentar novamente. Versão/URL não informadas. Análise das amostras e otimização posterior ficam como acompanhamento, conforme orientação do Dono do produto, sem prometer redução de latência. Sprint 5 aceita e encerrada pelo Dono do produto em 03/10/2026; análise de logs e melhorias posteriores ficam como acompanhamento. A situação detalhada e cronológica está em docs/sprints/sprint-5.md.

A análise das amostras ocorrerá após utilização pelos usuários, conforme orientação do Dono do produto. Isso não equivale a confirmação de deployment ou de resolução da causa da demora.

- [Sprint 5 — escopo, evidências e aceite](sprints/sprint-5.md)
- [ADR-004 — regra única](decisoes/adr-004-regra-unica-por-torneio.md)
- [ADR-005 — carregamento e diagnóstico](decisoes/adr-005-carregamento-e-diagnostico-do-painel.md)

Evidência posterior S5-05 em 03/10/2026: Dono do produto confirmou as telas de carregamento na aplicação utilizada. Não houve erro para conferir Tentar novamente; recuperação validada nos testes locais, sem confirmação remota desse cenário. Identificação de versão/URL e aceite global não informados. Análise das amostras permanece acompanhamento posterior.

- [Estatísticas pessoais e de torneio — RF20–RF21](estatisticas.md): RF20 implementado localmente na Sprint 6; RF21 em refinamento futuro.

- [Métricas operacionais persistentes — RF24](metricas-operacionais.md): requisito futuro para análise semanal, sujeito a refinamento e seleção de sprint.
