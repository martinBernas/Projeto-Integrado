# Fluxo de trabalho do projeto

## Documentação obrigatória

Regra estabelecida pelo Dono do produto: toda implementação deve ser acompanhada da documentação correspondente, incluindo mudanças de arquitetura e decisões tomadas. Esta regra vale para todo o repositório e deve ser seguida nas próximas tarefas.

- Atualizar a documentação como parte da própria entrega, antes de declarar a implementação concluída. Não esperar uma solicitação posterior do usuário.
- Registrar o comportamento implementado, escopo, limitações, testes executados e pendências de migração, publicação e homologação no documento da sprint. Atualizar requisitos, plano de ação, histórico e orientações operacionais quando afetados.
- Quando houver mudanças de arquitetura, atualizar `docs/arquitetura.md` e os diagramas pertinentes para refletir a implementação. Incluir alterações relevantes no modelo de dados, permissões, fluxo entre componentes, transações, integrações e implantação.
- Registrar decisões tomadas, seu contexto, motivo e consequências. Usar `docs/decisoes/` para decisões arquiteturais relevantes e o documento da sprint ou de requisitos para decisões funcionais e operacionais. Distinguir decisões confirmadas pelo usuário de propostas e escolhas técnicas de implementação.
- Manter a situação atual clara, sem apresentar pendências antigas como atuais. Preservar registros históricos identificando quando foram substituídos por decisões ou evidências posteriores.
- Diferenciar implementação local, testes locais, execução no ambiente remoto e aceite do usuário. Não declarar publicação ou homologação sem evidência.
- Documentar o procedimento e as evidências dos backups sem versionar dados pessoais, credenciais ou arquivos de backup ignorados pelo Git.
