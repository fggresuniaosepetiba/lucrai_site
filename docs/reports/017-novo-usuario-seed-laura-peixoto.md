# Sprint 17 — Novo Usuário Seed: Laura Peixoto

## Contexto

O `DataSeeder.cs` define usuários padrão para o ambiente de desenvolvimento, todos da empresa Lucraí com plano SuperAdmin. Foi solicitada a criação de mais dois usuários: `laura.peixoto` e `vitoria.justo`.

## Descobertas

- `vitoria.justo` **já existia** no seed (linhas 43-53 do `DataSeeder.cs`)
- `laura.peixoto` **não existia** — foi adicionada seguindo o mesmo padrão

O `seed-credentials.md` está no `.gitignore` (contém senhas), portanto a atualização feita nele é apenas local.

## Arquivos modificados

| Arquivo | Mudança |
|---------|---------|
| `backend/src/Lucrai.Infrastructure/Seed/DataSeeder.cs` | `laura.peixoto` adicionada ao array `seedUsers` (Admin/SuperAdmin, Lucraí, senha `123`) |
| `docs/dev-guide.md` | Tabela de credenciais atualizada com `laura.peixoto` |
| `docs/todo.md` | Sprint 17 adicionada |
| `docs/backend-todo.md` | Contagem de seed users atualizada (5 → 6) |

## Build

- `dotnet build` — 0 erros
