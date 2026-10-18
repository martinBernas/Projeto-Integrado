# Sprint 7 — Publicação e homologação de RF21

18/10/2026: implementação local autorizada pelo Dono do produto, sem publicação ou homologação remota desta entrega. **Sem migração nova**: reutiliza `get_tournament_dashboard` e a base já migrada nas entregas anteriores. Não reaplicar SQL antigo. Nenhum backup novo foi executado nesta implementação; não existe mudança de dados/esquema que exija backup de migração. Capturas e exportações históricas continuam privadas/ignoradas.

## Publicação

1. Validar a versão local: suíte com 98 testes, lint, TypeScript e build aprovados na entrega. Em Windows, a restrição do sandbox aos links pnpm pode produzir falsos erros de resolução de tipos. Executar com acesso normal às dependências; não desabilitar checagem nem alterar tipos para contornar esse ambiente.
2. Publicar a interface atualizada pelo fluxo vigente e registrar referência da versão/ambiente. Nenhuma publicação realizada pelo agente. A rota dinâmica nova é `/dashboard/tournaments/[id]/statistics`.
3. Acessar o torneio pelo painel e clicar **Estatísticas do torneio**, ao lado de Auditoria de pontuações. Link de retorno deve manter o torneio selecionado.

## Homologação pelo Dono do produto

- Conferir média própria e conjunta dos demais, excluindo o próprio jogador da comparação. Exemplo próprio: 12.000 e −2.500 em dois dias = 4.750. Comparação com A = 10.000/−2.500 e B = 5.000 em um dia elegível: 12.500/3 = 4.167 ao exibir.
- Conferir que hoje e dias futuros não entram, nem dias excluídos/fora de calendário/elegibilidade. Ausências e sanções entram nas médias, inclusive valores negativos/zero.
- Primeiro/último só entre resultados de jogo com bruto positivo válido. Testar zero relativo válido, empates, um único válido, dia sem válidos e exclusão de ausência e das duas sanções das contagens.
- Conferir gráfico: resultado próprio diário e média diária dos demais, tabela com valores e quantidade de participantes da comparação; não confundir média do período com média simples da série diária quando muda o número de participantes.
- Conferir sem dias encerrados, sem próprios dias elegíveis, sem demais participantes, média real zero e organizador sem participação; não exibir estatísticas fictícias.
- Confirmar que nenhuma média individual identificada dos demais aparece. Conta sem acesso, revogada ou anônima não deve consultar a tela; conta comum só consulta próprios indicadores e agregado autorizado.
- Conferir torneio encerrado após mudança de lançamento pessoal: seus resultados congelados devem permanecer a fonte. Em abertos, decisão de auditoria deve aparecer após recarga; a consulta mantém o refresh existente da RPC.
- Validar tela/gráfico/tabela em computador e celular, rolagem apenas dentro das regiões previstas e uso por teclado. A prévia local com dados fictícios cobriu apresentação, expansão da tabela e largura móvel sem transbordamento; não substitui teste autenticado real.
- Registrar resultados, ambiente/versão e aceite. Não encerrar a sprint apenas pela aprovação dos testes locais.

## Limites e recuperação

Sem realtime, novos filtros de período ou indicadores individuais de terceiros. Leitura/transferência/memória proporcionais ao período inteiro. Falha de consulta mostra erro e nova tentativa sem apresentar médias parciais. Não expor mensagens livres do banco. A RPC mantém suas transações/permissões; não há nova coleta de dados ou integração.

Se houver problema de apresentação, voltar a interface anterior não exige restauração de dados: nenhuma migração foi introduzida. Não restaurar backups antigos sobre lançamentos legítimos. Não criar torneio real apenas para testes sem identificar e combinar seu uso com o Dono do produto.
