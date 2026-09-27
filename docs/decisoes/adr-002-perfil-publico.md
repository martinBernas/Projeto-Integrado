# ADR-002 — Perfil público confirmado e unicidade global

Data: 27/09/2026. Estado: escolha técnica implementada localmente, pendente de migração/publicação e homologação. Unicidade global e edição pelo titular foram confirmadas pelo Dono do produto; os detalhes de transição e normalização abaixo são escolhas técnicas.

## Contexto

`profiles.display_name` pode conter nomes herdados do e-mail ou fornecidos na antiga carga administrativa. UUIDs são compartilhados com pontuações e vínculos e devem permanecer intactos. RF17 exige identificação independente do e-mail; RF18 limita o link externo ao contexto autorizado do torneio.

## Decisão

Preservar `display_name` e acrescentar `public_name_confirmed` (false nas contas existentes) e `geoguessr_url` opcional. Nenhum nome legado é confirmado automaticamente. Até o titular salvar, as consultas de torneios exibem “Jogador ” seguido dos oito primeiros caracteres do UUID. O titular pode ler seu nome antigo no próprio formulário. A seleção administrativa continua mostrando e-mail por decisão anterior do Dono do produto; isso não é identificação pública nos rankings.

Índice único sobre a chave do nome: retirar espaços ASCII nas extremidades, normalizar Unicode NFC e aplicar `lower` no banco. Acentos e espaços internos permanecem significativos. Grafia de exibição é preservada após trim/NFC. Nomes de 1 a 80 caracteres, sem @ nem controles. Migração detecta colisões legadas e aborta integralmente; resolução deve ser acordada com titulares, sem mesclar ou renomear automaticamente. Nomes legados não vazios continuam reservados durante a confirmação.

Retirar políticas de escrita direta de perfis. `update_my_profile` usa somente `auth.uid()`, valida campos, confirma o nome e registra auditoria privada na mesma transação. O trigger de cadastro exige nome explícito e a restrição única garante exclusividade mesmo se consultas anteriores indicarem disponibilidade. A RPC anônima de disponibilidade retorna apenas booleano, sem identidade/e-mail. Essa informação permite consultar se um nome está reservado; é necessária ao feedback de cadastro. Não implementa reserva temporária ou limpeza de contas não confirmadas.

URL aceita: HTTPS, host exato `geoguessr.com` ou `www.geoguessr.com`, caminho `/user/` com identificador de 1 a 100 caracteres alfanuméricos, hífen ou sublinhado e barra final opcional; sem porta, credenciais, parâmetros ou fragmento. Persistir com www e sem barra final. É validação sintática do formato adotado, sem verificar existência ou titularidade. A consulta web nesta implementação não forneceu confirmação primária acessível do formato; conferir um link real na homologação e ajustar a regra se necessário, sem ampliar domínios arbitrariamente.

RLS continua permitindo somente leitura direta do próprio perfil. Nome/URL de competidores são retornados pelas RPCs de resultados e participantes com autorização por torneio. Candidatos ainda sem vínculo não expõem URL. Links abrem nova aba com `noopener noreferrer`. A operação privada antiga de inclusão em setembro mantém sua assinatura para compatibilidade, mas deixa de sobrescrever nomes.

## Consequências e implantação

Pontuações, vínculos, regras e resultados não mudam. Nomes atuais (incluindo de torneios encerrados) refletem a edição do perfil; totais não são recalculados por editar perfil, mas desempates visuais por nome podem mudar de ordem. Auditoria de perfis preserva a rastreabilidade; não há snapshot de nome por resultado.

Aplicar após S4-03 e publicar logo depois: a migração impede cadastro sem nome, portanto o formulário antigo não poderá criar contas até o código novo estar publicado. Nomes legados aparecerão neutros até a confirmação. Confirmar esse efeito ao preparar a janela de implantação. Sem alterações remotas nesta implementação.

A comparação antiga inclui todo o JSON de profiles e passa a detectar os dois campos novos. O script específico de verificação exclui somente essas duas chaves da comparação, preserva os demais campos e não reescreve o backup. Edições legítimas de `display_name` após a migração continuarão produzindo diferenças, que devem ser documentadas.
