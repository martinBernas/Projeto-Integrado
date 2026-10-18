# RF24 — Métricas operacionais persistentes

18/10/2026 — RF24 / S7-05 implementado localmente após autorização de continuidade: retenção de 14 datas UTC, teto de 5.000 eventos/dia, lote após resposta e timeout de dois segundos, desativado por padrão. Persistência mínima em duas tabelas privadas; ingestão somente service_role, leitura administrativa, expurgo por job horário separado. Código/etapa/duração/resultado/instante validados, sem IDs/payloads pessoais; data de recebimento derivada pelo banco. Relatório de cobertura, taxa da amostra, mediana/p95 e armazenamento. 102 testes, lint, TypeScript/build e smoke Next simulado aprovados. Migração, backup/preflight, segredo/flag, agenda, publicação e homologação remotos pendentes; quota/plano não verificados, sem contratação paga. Estado anterior de implementação não iniciada substituído. [Entrega](sprints/sprint-7.md), [ADR-010](decisoes/adr-010-metricas-operacionais.md) e [ativação](sprints/sprint-7-metricas-operacao.md).

## RF24 — prioridade adicional confirmada em 18/10/2026

O Dono do produto concordou com a recomendação de priorizar um recorte pequeno de métricas operacionais na Sprint 7, após validar RF21. Confirmada a prioridade de refinamento; retenção, limites, solução de armazenamento e custo não foram aprovados por essa concordância genérica. Não há implementação de RF24 iniciada nesta revisão. RF21 permanece entregue/validado quanto à tela, sem reabrir seu desenho.

### Recorte inicial proposto — S7-05

- Persistir somente instante UTC, etapa, duração, resultado e código de erro normalizado já medidos no servidor do painel. Não incluir nomes, e-mails, IDs de conta/torneio, pontuações, payloads, mensagens livres, cookies ou credenciais.
- Reutilizar o Supabase existente se a avaliação técnica confirmar viabilidade, sem contratar serviço/plano novo. Validar escrita autorizada, limites e expurgo antes de escolher a implementação; não abrir escrita pública anônima ou expor segredo administrativo.
- Proposta inicial de retenção: **14 dias**, permitindo analisar uma semana recente; expurgo automático. Proposta inicial de limite: **5.000 eventos por dia**, até **70.000 eventos** na janela. Valores são propostas para aprovação, não configurações implementadas nem garantia de custo no plano atual.
- Capturar as etapas elegíveis até o limite, sem priorizar só erros; consulta deve informar cobertura/limites e não chamar a taxa observada de taxa de todo o uso se houver perda/amostragem. Planejar como contabilizar descarte sem acrescentar dados pessoais.
- Acesso aos dados e relatórios inicialmente pelo SQL Editor administrativo já utilizado pelo Dono do produto; contas da aplicação, inclusive organizadores comuns, não podem ler métricas operacionais. Sem criar painel administrativo nesta primeira entrega.
- Fornecer consultas por período/etapa: contagem, distribuição de resultados, taxa de erro/exception nos eventos registrados, mediana e p95 de duração. `empty` e `denied` separados, sem contar acesso negado automaticamente como falha técnica. Não somar tempos de consultas paralelas como tempo total.
- Indisponibilidade da coleta não impede consulta/lançamento. Definir envio fora do caminho crítico e orçamento de desempenho verificável antes de implementar, sem prometer entrega garantida de eventos.

Fora deste recorte: contagem de cliques em Tentar novamente, correlação entre requisições, usuários únicos, reconstrução de logs antigos, identificação de contas/torneios e dashboard operacional completo. A coleta nova só permite analisar eventos futuros; não comprova por si a causa das falhas antigas.

### Próximo refinamento

Confirmar retenção/volume e acesso propostos; verificar estrutura de escrita e expurgo disponível no ambiente, impacto/custo e forma de informar cobertura. Estimar S7-05 depois dessa avaliação e revisar capacidade antes de ampliar o compromisso. Implementação, migração, backup, publicação e homologação ainda não realizados para RF24. Não inferir acesso remoto administrativo disponível ao agente.

Registrado em 11/10/2026 por solicitação do Dono do produto. Requisito futuro, sem sprint definida e sem autorização de implementação nesta entrega. Refinar, estimar e priorizar no Sprint Planning conforme a capacidade disponível.

## Problema e objetivo

O Dono do produto relatou uso de Tentar novamente durante a semana e informou que aparentemente a consulta de logs além de uma hora exige pagamento no ambiente utilizado. A disponibilidade e as condições do plano não foram verificadas. As métricas atuais `dashboard_query` são emitidas nos logs, sem persistência própria; não há amostra semanal disponível para concluir a causa das falhas. Ver [diagnóstico de 11/10](diagnosticos/uso-2026-10-11.md).

Como Dono do produto, quero consultar métricas de carregamento e falhas depois de uma semana de uso, para orientar melhorias com evidências, sem depender exclusivamente da janela de logs da hospedagem.

## Escopo proposto para refinamento

Persistir uma amostra mínima das etapas medidas no painel: instante UTC, etapa, duração, resultado e código de erro normalizado quando disponível. Permitir consulta ou exportação por período, etapa e resultado, com contagens, taxa de falhas, mediana e percentil 95 das durações. Definir o denominador da taxa e distinguir eventos amostrados de todo o uso. Etapas paralelas não representam, por soma, o tempo total percebido no navegador.

Os registros devem excluir nomes, e-mails, identificadores de contas e torneios, pontuações, credenciais, cookies, tokens, mensagens livres e conteúdos das requisições. O acesso operacional deve ser restrito aos responsáveis autorizados, com validação dos campos e limites no servidor.

Definir retenção com expurgo automático, limite de volume, amostragem e custo antes da implementação. A falha do armazenamento de métricas não deve impedir carregamento, lançamento ou consulta dos resultados. Documentar eventual perda de eventos e medir o custo adicional da coleta.

Correlação por identificador opaco, identificação de ambiente/versão, eventos de clique em Tentar novamente e medida de recuperação são extensões propostas para refinamento. Os logs atuais não permitem contar exatamente cliques, recuperação ou usuários únicos. Não há recuperação retroativa de eventos que não foram guardados.

## Critérios de aceite propostos

1. Consultar uma amostra que cubra uma semana, dentro da retenção aprovada, e obter contagens e durações por etapa/período com fórmulas documentadas.
2. Verificar que os registros contêm apenas os campos aprovados e rejeitam campos, códigos e valores inválidos.
3. Impedir acesso de contas comuns e anônimas às métricas operacionais; validar o acesso autorizado.
4. Comprovar expurgo ao vencer a retenção, limites de volume e comportamento da amostragem.
5. Simular indisponibilidade da coleta e confirmar que as funções da aplicação continuam operando; validar o orçamento de desempenho definido no planejamento.
6. Documentar consulta/exportação, limitações, custo, retenção e procedimento de diagnóstico, distinguindo validação local e evidência no ambiente publicado.

## Decisões pendentes

Escolher armazenamento e avaliar custo (Supabase existente ou outra solução), necessidade de migração, prazo de retenção que cubra a análise semanal, volume esperado, responsáveis com acesso, forma de consulta/exportação e orçamento de desempenho. Definir se correlação e medição de novas tentativas entram na primeira entrega. Nenhuma contratação paga foi aprovada.

O requisito complementa o acompanhamento de S5-05 e o refinamento de FB06, preservando o aceite da Sprint 5. Esta entrega altera somente documentação; a arquitetura atual permanece vigente.
