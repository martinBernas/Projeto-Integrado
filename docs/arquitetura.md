# Arquitetura e implantação

## Stack definida

| Camada | Tecnologia | Responsabilidade |
| --- | --- | --- |
| Interface e servidor web | Next.js com TypeScript | Páginas, componentes, validações de interface e rotas de servidor quando necessárias. |
| Estilos | Tailwind CSS | Interface responsiva para celular e computador. |
| Hospedagem | Vercel | Build, deploy automático e versões de preview conectadas ao GitHub. |
| Banco de dados | Supabase PostgreSQL | Dados de usuários, pontuações, torneios, participantes, regras e resultados. |
| Autenticação | Supabase Auth | Cadastro, login e sessão do usuário. |
| Autorização | Supabase Row Level Security (RLS) | Restringe acesso aos dados conforme usuário, participação e organização do torneio. |

## Estrutura de segurança

- O navegador usa somente as variáveis públicas `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- A chave privilegiada `SUPABASE_SERVICE_ROLE_KEY`, quando indispensável, fica apenas em rotas executadas no servidor e nas variáveis protegidas da Vercel.
- Toda tabela exposta no schema público deve ter RLS habilitado e políticas explícitas de leitura e escrita.
- Pontuação pessoal só pode ser criada ou alterada pelo respectivo jogador, salvo fluxos administrativos definidos para um torneio.
- Organizador só pode administrar torneios que criou e seus participantes.

## Ambientes e publicação

| Ambiente | Finalidade | Origem |
| --- | --- | --- |
| Desenvolvimento | Trabalho local dos integrantes. | Branch de funcionalidade. |
| Preview | Revisar uma alteração antes de integrá-la. | Pull request. |
| Produção | Versão publicada para uso. | Branch `main`. |

O repositório GitHub será conectado à Vercel. Cada pull request gera uma versão de preview; alterações aprovadas e integradas à `main` geram o deploy de produção. Segredos e chaves não devem ser incluídos no Git: ficam configurados como variáveis de ambiente por ambiente na Vercel.

## Limites do plano gratuito

O plano gratuito da Vercel é compatível com o caráter acadêmico e não comercial do projeto. O plano gratuito do Supabase atende ao MVP, mas o projeto pode ser pausado após uma semana sem atividade. Antes de demonstrações ou entregas, o grupo deve acessar o sistema e confirmar que banco, autenticação e deploy estão ativos.

## Referências

- https://vercel.com/docs/frameworks/full-stack/nextjs
- https://vercel.com/docs/environment-variables
- https://supabase.com/docs/guides/auth
- https://supabase.com/docs/guides/database/postgres/row-level-security

