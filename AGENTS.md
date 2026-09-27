# Fluxo de trabalho do projeto

## Papel do interlocutor

Referir-se ao responsável pelas decisões e pelo aceite como **Dono do produto**, nunca como usuário. O termo usuário permanece válido para as contas e os atores da aplicação.

## Commit e push

Decisão do Dono do produto em 27/09/2026: ele próprio realiza os commits e pushes do projeto.

- Não executar `git commit` ou `git push`, nem solicitar aprovação para executá-los, salvo pedido explícito posterior do Dono do produto para aquela operação.
- Não preparar o staging com `git add` por iniciativa própria. Entregar as alterações locais, testes e documentação para o Dono do produto revisar e versionar.
- Consultas de leitura, como `git status`, `git diff` e `git log`, continuam permitidas.
- Não registrar commit/push como pendência, etapa de aceite ou lembrete nas entregas, na documentação ou nas respostas. Essas operações são responsabilidade do Dono do produto e ocorrerão no fluxo de publicação. Referências a commits efetivamente publicados podem ser mantidas como evidência técnica. Não presumir deployment sem evidência.

## Documentação obrigatória

Regra estabelecida pelo Dono do produto: toda implementação deve ser acompanhada da documentação correspondente, incluindo mudanças de arquitetura e decisões tomadas. Esta regra vale para todo o repositório e deve ser seguida nas próximas tarefas.

- Atualizar a documentação como parte da própria entrega, antes de declarar a implementação concluída. Não esperar uma solicitação posterior do Dono do produto.
- Registrar o comportamento implementado, escopo, limitações, testes executados e pendências de migração, publicação e homologação no documento da sprint. Atualizar requisitos, plano de ação, histórico e orientações operacionais quando afetados.
- Quando houver mudanças de arquitetura, atualizar `docs/arquitetura.md` e os diagramas pertinentes para refletir a implementação. Incluir alterações relevantes no modelo de dados, permissões, fluxo entre componentes, transações, integrações e implantação.
- Registrar decisões tomadas, seu contexto, motivo e consequências. Usar `docs/decisoes/` para decisões arquiteturais relevantes e o documento da sprint ou de requisitos para decisões funcionais e operacionais. Distinguir decisões confirmadas pelo Dono do produto de propostas e escolhas técnicas de implementação.
- Manter a situação atual clara, sem apresentar pendências antigas como atuais. Preservar registros históricos identificando quando foram substituídos por decisões ou evidências posteriores.
- Diferenciar implementação local, testes locais, execução no ambiente remoto e aceite do Dono do produto. Não declarar publicação ou homologação sem evidência.
- Documentar o procedimento e as evidências dos backups sem versionar dados pessoais, credenciais ou arquivos de backup ignorados pelo Git.
