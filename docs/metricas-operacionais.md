# RF24 — Métricas operacionais persistentes

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
