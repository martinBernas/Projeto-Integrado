# Sprint 3 — implantação e carga histórica

## Estado da entrega

Atualização de 22/09/2026: carga real de 11 contas e 148 pontuações confirmada. Ver [registro operacional](operacao-2026-09-22.md) para participantes pendentes, complemento de Tales, início de Bastian em 16/09, penalidades e correção local da tela.

Sprint 3 concluída em 21/09/2026, publicada no commit `8671149`. Testes e restauração confirmados pelo Dono do produto; histórico permanece em preparação. Consulte o [encerramento e evidências](sprint-3-encerramento.md). Cadastro, vínculos e carga real são atividades operacionais.

## Implantar a estrutura

1. Fazer backup do banco antes da migração e conferir se existem pontuações duplicadas por jogador/data no fuso `America/Sao_Paulo` ou fora de 0–25.000. As novas restrições interrompem a migração nesses casos, sem descartar dados automaticamente.
2. No SQL Editor do Supabase, executar em ordem os arquivos de `web/supabase/migrations/`: a migração inicial da Sprint 2 somente se ainda não aplicada, seguida de `202609200001_september_mvp.sql` e `202609200002_score_entry.sql`. Cada migração deve ser aplicada uma vez. Seeds e funções de carga são repetíveis; as migrações não são.
3. Confirmar a conta do organizador em Authentication e localizar seu UUID em `public.profiles`. Conferir o UUID já preenchido no script `web/supabase/seeds/september.sql` e executar. O script sem UUID aborta intencionalmente. Não criar contas ou senhas fictícias em produção.
4. Conferir o torneio `20260900-0000-4000-8000-000000000001`: 01–30/09/2026, segunda a sexta, 07/09 excluído, modo relativo, penalidade −2.500, regra `mvp-v1`. A preparação do histórico começa pendente.
5. Na Vercel, usar diretório raiz `web`, comando de build `pnpm build` e as variáveis públicas do Supabase e URL do site. Não é necessária chave de serviço para a aplicação. Manter o callback de autenticação já validado na Sprint 2 e conferir a URL do novo ambiente.

O vínculo ao torneio não é automático ao cadastrar uma conta. O organizador pode consultar o torneio, mas só aparece no ranking se também for vinculado como participante.

## Vincular participantes cadastrados

Executar como administrador no SQL Editor, substituindo o UUID e o nome pelos dados conferidos da conta:

```sql
select private.add_september_participant('UUID-DA-CONTA'::uuid, 'Nome do jogador');
```

A função valida a existência da conta, evita vínculos duplicados e define início de elegibilidade em 01/09. Vincular novo participante reabre a preparação do histórico. Não inferir identidade por nomes semelhantes: conferir UUID/e-mail antes da carga. O nome informado será exibido aos participantes no ranking.

## Carregar o Excel quando o Dono do produto o fornecer

O arquivo foi fornecido em 22/09 e a primeira carga real foi executada conforme o registro operacional. Não há importação automática pela interface. Nas próximas cargas, preparar os comandos SQL a partir das pontuações brutas do Excel e do mapeamento validado de contas; não carregar os pontos relativos como se fossem resultados brutos. Conferir a data efetiva de entrada de cada participante antes de concluir a preparação.

```sql
begin;
select private.load_september_score('UUID-DA-CONTA'::uuid, date '2026-09-01', 18500);
-- Demais registros conferidos do Excel.
commit;
```

A função aceita somente participantes vinculados, datas de setembro já alcançadas e inteiros de 0 a 25.000. Repetir jogador/data/valor não duplica o lançamento; corrigir um valor preserva a mudança em `private.score_changes`. Carga usa origem `manual_history`; não depende do prazo de lançamento do jogador. Datas de fim de semana e 07/09 podem permanecer no histórico pessoal, mas não entram no torneio.

Enquanto a carga está aberta, todos os resultados são provisórios e faltas ainda não geram penalidades. Conferir cobertura de todos os participantes e dias decorridos antes de concluir. Uma célula sem carga não pode ser presumida falta até essa revisão. Zero é tratado como ausência, não como resultado positivo.

Depois de conferir o arquivo, os vínculos, a cobertura e as amostras de cálculo:

```sql
select private.complete_september_history();
```

Essa ação ativa as penalidades de dias elegíveis encerrados sem resultado positivo, desde 01/09, e recalcula os totais. É repetível. Uma nova carga reabre a preparação e exige nova conclusão. A aplicação mostra essa preparação explicitamente. A decisão operacional de concluir a carga deve ser do Dono do produto, após conciliar os dados.

## Cálculo e rastreabilidade

- O formulário grava a pontuação bruta pessoal; o motor calcula a diferença para o menor positivo dos participantes do dia. A menor pontuação e seus empates recebem zero.
- Ausência ou zero gera −2.500 somente após fechamento do dia e conclusão da preparação histórica. Sem positivos, não há classificação diária de diferenças.
- O dia usa `America/Sao_Paulo`. Lançamento/correção próprios limitados ao dia atual; carga administrativa pode preencher datas anteriores.
- Resultados são atualizados ao salvar um lançamento, carregar histórico, concluir a carga ou abrir o painel. Não há job noturno: a primeira leitura após a virada fecha os dias anteriores. Usuários devem atualizar o painel para ver novos resultados de outros participantes.
- A função de cálculo usa uma data interna para testes; a API pública não permite escolher a data de fechamento nem a identidade do jogador.
- Resultados e penalidades têm unicidade por torneio/jogador/data. A ausência usa referência nula ao lançamento, sem fabricar uma pontuação pessoal.
- `private.result_changes` preserva revisões e snapshots da regra, incluindo alterações administrativas em dias encerrados. Não há editor de regras nem auditoria por votação nesta sprint.
- Clientes autenticados não escrevem diretamente em lançamentos, torneios, participantes, exclusões ou resultados. O lançamento passa pela função validada; funções administrativas ficam restritas ao proprietário do banco. Dados pessoais de terceiros não são expostos fora do torneio.

## Verificação e encerramento

Em `web`, executar `pnpm test`, `pnpm lint` e `pnpm build`. Os testes de banco usam funções de autenticação simuladas e papéis PostgreSQL reais em PGlite, não uma instância Supabase remota.

Roteiro original de aceite: no ambiente de entrega, validar cadastro/login reutilizados, duas contas participantes e uma externa, lançamento/correção, bloqueio de datas passadas, histórico, ranking e carga administrativa de uma amostra. Conferir 07/09 e fins de semana sem pontos/penalidade. Testar chamadas diretas à API, além das telas. Registrar data, responsável, ambiente, commit e evidência. Só então encerrar S3-06.

O aceite foi concluído em etapas, conforme o encerramento: permissões verificadas por papéis no SQL Editor remoto, sem requisições HTTP diretas; a segunda conta sem vínculo representou o acesso externo após o rollback.
