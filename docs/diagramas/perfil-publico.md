# Perfil público — S4-04/S4-05

```mermaid
sequenceDiagram
  actor Titular
  participant Formulario as Meu perfil / Cadastro
  participant Servidor as Next.js Server Action
  participant Banco as Supabase PostgreSQL
  Titular->>Formulario: Nome e URL opcional
  Formulario->>Servidor: Salvar perfil autenticado
  Servidor->>Banco: update_my_profile(nome, url)
  Banco->>Banco: Identificar auth.uid, validar, aplicar índice único
  Banco->>Banco: Confirmar nome e registrar auditoria privada
  Banco-->>Servidor: Sucesso ou erro sem dados de terceiros
  Servidor-->>Titular: Feedback e revalidação do painel
  Titular->>Banco: Consultar torneio via RPC autenticada
  Banco->>Banco: Autorizar participação/organização
  Banco-->>Titular: Nomes confirmados e links dos participantes
```

Cadastro usa Supabase Auth e trigger de criação, com validação e índice único. Leitura direta de perfis é limitada ao próprio usuário. Link GeoGuessr é navegação externa do navegador, sem busca ou importação no servidor. Implementação local, implantação e homologação pendentes.
