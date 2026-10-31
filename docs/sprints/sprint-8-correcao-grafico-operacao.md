# Correção de pontuações acumuladas — operação

## Pronto para a etapa de publicação — estado atual

31/10/2026 — Aprovação v5 e regeneração HCM/Aztecas confirmadas. Os dois PDFs e scripts privados estão preparados; Aztecas agora foi recebido/gerado/conferido. O Dono do produto informou que a versão ainda não foi publicada e que publicará após finalizar os arquivos. Não executar a substituição antes da publicação e do backup. Não pedir novamente autorização geral já concedida.

| Alvo | Diretório privado de arquivo/evidência/scripts | SHA-256 do PDF | MD5 do texto base64 novo |
| --- | --- | --- | --- |
| HCM | `backups/report-score-correction/hcm-preview-v5-final/` | `322ee0cf56597aed808748f6871830fae4346c1f5c4e010f6c5bc1332bf63556` | `df9f8c21ab263beb92bb942d2b783a04` |
| Aztecas | `backups/report-score-correction/aztecas-preview-v5/` | `89d29405d438c35c649996e0fef5f9971bbcae08b8d27acc048d532d79f1d881` | `359473d39308e759d7b6c0a2f2b9479b` |

### Sequência após a publicação

1. Confirmar que a publicação da v5 concluiu. Executar `03-backup-approved-targets.sql` no SQL Editor, imediatamente antes da manutenção. Deve retornar exatamente duas linhas. Exportar o resultado como JSON para `backups/report-score-correction/before-replacement-v5.json`. Contém endereços e PDFs antigos: não colar na conversa nem versionar. Se não retornar dois alvos, interromper e reconsultar estado/hashes; não alterar os checksums para forçar passagem.
2. Na pasta `web`, executar o verificador offline abaixo, ou informar o caminho do arquivo local para verificação. Ele compara com as duas capturas já fornecidas, não conecta ao banco nem imprime endereços. Saída precisa ser `verified=true`, dois alvos, 18 e 6 destinatários `sent`. Evidência em arquivo adjacente `.verified.json`; a gravação é exclusiva para preservar uma evidência anterior. Se repetir a exportação, usar nome novo. Erro exige investigar, sem substituir o backup original.

```powershell
node scripts/verify-report-replacement-backup.mjs ../backups/report-score-correction/before-replacement-v5.json ../backups/report-score-correction/hcm-frozen-export.json ../backups/report-score-correction/aztecas-frozen-export.json
```

3. Só com backup completo validado, executar os `replace-reviewed-report.sql` de HCM e Aztecas nos diretórios privados da tabela acima, registrando cada resultado. Scripts são individuais: sucesso de um não prova sucesso do outro. São repetíveis para o mesmo PDF; comparam snapshot/PDF anterior, recusam lease/retirada e trocam apenas `pdf_base64`. Não limpar fila ou redefinir geração/prazo/envios.
4. Executar `04-verify-replaced-targets.sql`. Esperado: duas linhas, todos os indicadores verdadeiros, contadores HCM 18/18 e Aztecas 6/6. Preservação de `generated_at` e `due_at` usa os instantes exatos do inventário recebido. Diferença não autoriza ignorar destinatário, reiniciar prazo ou confirmar sucesso manualmente. Complementar com exportação privada da fila e comparação de destinatários contra o backup quando necessário; não colar endereços na conversa.
5. Registrar evidências de publicação, backup/hash, resultados de cada substituição e comparação. O torneio de ensaio de retirada não é alvo. Esta manutenção não altera anexos já enviados nem dispara reenvio. Reenvio de retificação exige definição própria do Dono do produto.

Arquivos de PDF para revisão: `web/output/pdf/hcm-outubro-relatorio-v5.pdf` e `web/output/pdf/aztecas-outubro-relatorio-v5.pdf`, ignorados pelo Git. Aprovação do desenho já recebida; Aztecas foi conferido pelo mesmo código e regras. Nenhum backup imediatamente anterior à escrita ou alteração remota foi executado nesta etapa. As instruções e pendências antigas abaixo são históricas e subordinadas a esta sequência atual.


## Situação vigente — v5 aprovada em 31/10/2026

Aceite explícito do Dono do produto recebido para publicar a correção e regenerar HCM/Aztecas. Não pedir novamente essa autorização geral. O PDF HCM aprovado tem SHA-256 `322ee0cf56597aed808748f6871830fae4346c1f5c4e010f6c5bc1332bf63556`; os scripts correspondentes estão em `backups/report-score-correction/hcm-preview-v5-final/`. Falta obter a captura Aztecas e comprovar publicação, backup e substituição remotas. Registros inferiores sobre v5 aguardando aceite são históricos substituídos.

Executar agora `web/supabase/operations/report-score-correction/02-approved-targets-and-aztecas-export.sql` no SQL Editor. Primeiro resultado: estado/checksums atuais dos dois alvos. Segundo: uma captura Aztecas com hashes, sem endereços. Exportar o segundo resultado como JSON em `backups/report-score-correction/aztecas-frozen-export.json`. A consulta é somente leitura; nenhum worker, envio ou retirada será chamado. Não usar captura de HCM para Aztecas nem ampliar a lista dos alvos para torneios de teste. Conferir o MD5 atual HCM contra a exportação original antes de usar seus scripts; divergência exige reexportação/investigação.

Ao receber a exportação, usar o CLI `preview-tournament-report.mjs` com diretório novo e `--prepare-replacement`, renderizar/conferir o PDF de Aztecas e preparar seus scripts de backup/substituição. A autorização de regenerar esse torneio já foi concedida. Não solicitar credenciais na conversa. Manter os backups completos com endereços fora da conversa e do Git; a exportação da captura de prévia não contém esses endereços e não substitui o backup imediatamente anterior à escrita. Procedimento de publicação/substituição/validação abaixo continua aplicável após obter as evidências necessárias.


**Versão atual preparada: v5.** O Dono do produto autorizou implementar as regras no PDF para todos os torneios. Código compartilhado alterado; prévia final HCM em `web/output/pdf/hcm-outubro-relatorio-v5.pdf`, SHA-256 `322ee0cf56597aed808748f6871830fae4346c1f5c4e010f6c5bc1332bf63556`. Usar somente os arquivos correspondentes em `backups/report-score-correction/hcm-preview-v5-final/` após aceite do PDF e backup completo validado. Os bloqueios e referências v2/v3/v4 abaixo são históricos; seus SQLs não correspondem à versão atual. Não houve publicação ou substituição remota.

Após publicar, o gerador comum aplicará automaticamente os blocos de cinco datas/sobra unitária unida, min/max local, gráfico por página, cinco duplas e cabeçalhos com nomes a qualquer novo PDF. O arquivo existente na fila não se atualiza só com a publicação: continuar o procedimento de substituição por ID/checksums, sem reabrir torneio, reiniciar prazo ou reenviar e-mails. [Entrega e testes gerais](sprint-8-correcao-grafico.md).

**Operação remota ainda não liberada pelo aceite visual.** O Dono do produto rejeitou v4 e solicitou simulação PNG de intervalos temporais de cinco dias, com mínimo/máximo próprios em Y, antes de gerar outro PDF. Imagem preparada e aguardando avaliação; não usar os SQLs de substituição v2/v3/v4. Depois de aprovar o desenho, implementar/testar/gerar nova revisão, conferir novo PDF e preparar scripts que correspondam ao seu checksum. Captura original permanece a referência congelada. [Situação e simulação](sprint-8-correcao-grafico.md).

**Revisão v4 histórica, rejeitada visualmente.** Usar o PDF `web/output/pdf/hcm-outubro-pontos-acumulados-v4.pdf` e os arquivos de `backups/report-score-correction/hcm-preview-v4/`, SHA-256 `6094fd3b236afc3017364fc5a0c8fc7264b0f2af5e8baadbb964843421468e4b`. Mantém panorama e amplia cinco faixas do eixo Y do HCM, sem detalhes por grupos. Captura/checksums originais continuam válidos; scripts de revisões anteriores são históricos. Aceite, backup anterior à manutenção e substituição remota continuam pendentes.

**Revisão visual v3 — histórica, substituída pela v4.** A prévia v2 não foi aceita pelo Dono do produto. Usar `backups/report-score-correction/hcm-preview-v3/` para evidência/scripts correspondentes ao novo PDF `web/output/pdf/hcm-outubro-pontos-acumulados-v3.pdf`, SHA-256 `466997af3ac10e170bead7463f9d699712e24ba4cacd18958662203bad2ff299`. Legenda lateral e classificação tabular ajustadas; todos os totais preservados. Referências v2 abaixo são históricas. A captura original e seus checksums continuam válidos; ainda não executar a substituição remota antes do aceite.

31/10/2026. Código e procedimento locais; substituição remota somente após aceite da prévia HCM. Decisão técnica: [ADR-015](../decisoes/adr-015-correcao-pontos-acumulados.md).

## Inventário recebido do Dono do produto

| Torneio | ID | Evidência | Tratamento |
| --- | --- | --- | --- |
| HCM - Outubro | 93c7e3c5-a676-42d4-83ca-05284cce0fff | Captura/PDF presentes, 18/18 sent, sem lease | Prévia real gerada; candidato à substituição após aceite |
| Aztecas Outubro | 34727be9-2447-4e7c-af41-e685b6db290b | Captura/PDF presentes, 6/6 sent, sem lease | Candidato; exportação e PDF corrigido ainda pendentes |
| Torneio Agendadp | 1d4b0936-6b47-439a-9c47-b0a9de45506d | Captura/PDF presentes, 2/2 sent, retirada prevista em 31/10 às 17:46 | Preservar ensaio de retirada automática; fora da correção |
| Torneios de teste já retirados | ac25a7db-6888-4026-b58b-ac002cfad92c e 971a598b-5c6a-4a69-b61e-7470d90b13b9 | Captura/PDF ausentes | Fora da correção; não reativar |
| HCM Games 2026 | c3758840-3f82-443a-bea1-d63733c94acb | Encerrado sem fila/captura/PDF | Não é regeneração de um PDF existente; análise separada se solicitada |

Horários em São Paulo. Retirada prevista do HCM: 07/11/2026 às 00:22:43; Aztecas: 07/11/2026 às 00:21:12. Inventário é evidência fornecida nesta conversa, não monitoramento contínuo. Reconsultar imediatamente antes da manutenção. HCM e Aztecas são os candidatos reais identificados, sem tratar a observação como substituição já autorizada antes da validação.

## Exportação e prévia

Executar `web/supabase/operations/report-score-correction/01-inventory-and-export.sql`. A consulta não grava nem reivindica lease. Exportar o segundo resultado como JSON para `backups/report-score-correction/`. Se o SQL Editor exportar array de uma linha com coluna `snapshot`, o CLI aceita diretamente; também aceita captura JSON pura para prévia, mas a preparação de substituição exige os hashes do banco. Não incluir e-mails/credenciais na conversa nem versionar exportações.

Na pasta `web`, executar:

```powershell
node scripts/preview-tournament-report.mjs ../backups/report-score-correction/hcm-frozen-export.json ../backups/report-score-correction/hcm-preview-nova --prepare-replacement
```

O diretório de saída precisa ser novo: o CLI recusa sobrescrever evidências. Gera `report.pdf`, `evidence.json` e, com a opção, `backup-before-replacement.sql` e `replace-reviewed-report.sql`. Todos são privados. Não conecta ao banco nem chama worker/SMTP. Valida estrutura, IDs, datas, valores inteiros, duplicidades e consolidação; não comprova sozinho que uma captura avulsa veio do banco. Confirmar ID e checksum da exportação e conferir totais contra o PDF original. Renderizar com Poppler e conferir todas as páginas. Entregar somente o PDF ao Dono do produto para aceite.

Para Aztecas, usar o ID identificado no inventário em uma consulta equivalente à segunda, exportar captura e ambos os hashes; não reutilizar a captura ou o SQL do HCM.

## Substituição após aceite

1. Registrar o aceite do layout HCM, publicar o renderizador corrigido pelo fluxo do projeto e delimitar HCM/Aztecas. Preparar e conferir o PDF de cada alvo. Não executar scripts de reinstalação das migrações 001/002.
2. Reconsultar inventário. Torneio retirado, captura ausente, lease ativo ou divergência de hash exige interromper esse alvo e investigar, sem apagar fila, alterar prazo ou forçar sucesso. Se a retirada estiver próxima, coordenar preservação privada antes do prazo; os scripts não suspendem agendas nem alteram retenção.
3. Executar `backup-before-replacement.sql` gerado para o alvo. Exportar a única linha como JSON privado. Verificar que contém o ID correto, captura, PDF original, metadados da fila e todos os destinatários; conferir MD5 do texto de `report.pdf_base64` contra `previous_pdf_md5` e igualdade estrutural da captura com a exportação. Registrar SHA-256 do arquivo, contagens/estados e prazo. Zero linhas não é backup válido. Nenhum backup imediatamente anterior à substituição foi executado nesta entrega.
4. Executar apenas o `replace-reviewed-report.sql` correspondente ao PDF validado. A transação troca somente o arquivo, com locks e comparação dos hashes; recusa fila indisponível/ocupada e original alterado. Em erro, reverter a transação se o editor mantiver sessão aberta; investigar antes de repetir. Não limpar `generated_at`, destinatários, estados de envio ou lease para contornar erro.
5. Registrar ID, revisão, SHA-256 local e `corrected_pdf_md5` retornado, conferindo-o com o MD5 da string base64 do PDF local. Exportar novamente a linha privada e confirmar igualdade byte a byte do PDF, preservação dos demais campos/destinatários e dos dados de negócio afetados. Registrar sucesso/falha por torneio; repetir o mesmo script é inócuo se o PDF já for exatamente o corrigido.
6. Não chamar “processar pendências” para distribuir a correção. A substituição não reenvia anexos. Se o Dono do produto solicitar retificação por e-mail, planejar rastreamento separado das entregas anteriores e resolver resultados incertos antes de reenviar.

Recuperação: usar exclusivamente o PDF original do backup desse alvo, com os mesmos locks e uma comparação que aceite substituir somente o checksum da versão corrigida conhecida. Não restaurar backup completo antigo sobre novos lançamentos nem reativar torneios retirados. Preparar e revisar SQL de recuperação somente se necessário, usando o backup validado; depois comparar os campos preservados. Backup do snapshot recebido para prévia não substitui o backup completo imediatamente anterior à manutenção.

## Evidência da prévia HCM

Exportação recebida como tabela colada; JSON extraído sem alterar os valores e guardado privadamente em `backups/report-score-correction/hcm-frozen-export.json`, com original colado preservado. MD5 da captura, recalculado via conversão `jsonb::text` em PGlite: `ab7951e112207aaf37ef5c2d482b5ad3`, igual ao fornecido pelo banco. Arquivo recebido SHA-256: `2882ef29b646ea3851c51fb7cda84570777a9660067682860698ee89e9a9944f`. Não foram recebidos e-mails ou credenciais nessa exportação.

Prévia revisada em `backups/report-score-correction/hcm-preview-v2-reviewed/`: 18 participantes, 371 resultados, 21 datas. Os 18 totais finais conferem com o PDF original; Evelyn/Zader permanece com 8 trocas. PDF corrigido tem panorama e três detalhes de seis séries com período completo, negativos e tabela de pontos. Revisão/checagem visual e evidência final registradas na [entrega](sprint-8-correcao-grafico.md). A prévia não altera banco nem comprova homologação do Dono do produto.

PDF entregue em `web/output/pdf/hcm-outubro-pontos-acumulados.pdf` (ignorado pelo Git), SHA-256 `fd4b00b11e4248498dbc198a1d066e3a556ee5d23a572f765a3a9b3a5d1d0720`. Todas as 378 células do anexo foram conferidas independentemente contra as somas da captura. O diretório privado da prévia revisada também contém os scripts de backup e substituição correspondentes exatamente a esse arquivo. Estão preparados, não executados.
