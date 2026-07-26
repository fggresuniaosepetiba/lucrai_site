# Sprint 22 — Ajuste de Cargos dos Usuários Seed

**Data:** 26/07/2026  
**Objetivo:** Adequar os cargos dos usuários seed para refletir a estrutura real de administração do sistema.

## Alterações Realizadas

### `DataSeeder.cs`

| Usuário | Antes | Depois |
|---------|-------|--------|
| `lucrai.adm` | Nome: "Gabriel Fellype", Cargo: Admin | Nome: "Lucraí Admin", Cargo: Owner |
| `fellype.gabriel` | Cargo: Admin | Cargo: Owner |

### Documentação atualizada

- **`docs/dev-guide.md`** — Tabela de credenciais com papéis corrigidos
- **`docs/changelog/seed-credentials.md`** — Nome e cargo do `lucrai.adm` atualizados, cargo do `fellype.gabriel` atualizado
- **`docs/todo.md`** — Sprint 22 adicionado ao checklist

## Motivação

- O `lucrai.adm` é a conta administrativa principal — faz sentido ter o papel mais alto (Owner)
- O `fellype.gabriel` é um usuário real que precisa de acesso Owner para testes e operações diárias
