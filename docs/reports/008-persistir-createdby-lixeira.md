# Persistir `createdBy` na Lixeira

Correção no sistema de lixeira para preservar o campo `createdBy` durante o ciclo de exclusão e restauração de lançamentos (transações e previsões financeiras). Sem essa correção, registros restaurados ficavam invisíveis na página financeira e o DisplayId `#00X` não era reutilizado corretamente.

## [2026-07-17] Adicionar `CreatedBy` ao `DeletedItem`

### Problema

O tipo `DeletedTransaction` (frontend) e a entidade `DeletedItem` (backend) não possuíam o campo `createdBy`. Ao excluir um registro:

1. **Registros restaurados ficavam invisíveis** — a página financeira (`financial/page.tsx:148`) filtra por `t.createdBy === user?.id`, mas registros restaurados tinham `createdBy: ""`
2. **DisplayId `#00X` não era reutilizado** — `GetNextDisplayIdAsync` filtra por `createdBy` e não encontrava o registro excluído para reivindicar seu ID

### Solução

Adicionado o campo `CreatedBy` em toda a cadeia: entidade, DTOs, controllers, repositórios, migration e frontend (tipos, repositórios Dexie/API).

### Arquivos Alterados

#### Backend

| Arquivo | Mudança |
|---------|---------|
| `backend/src/Lucrai.Core/Entities/DeletedItem.cs` | Propriedade `CreatedBy` adicionada |
| `backend/src/Lucrai.Core/DTOs/Trash/TrashDtos.cs` | Campo `CreatedBy` em `TrashResponse` |
| `backend/src/Lucrai.API/Controllers/TransactionsController.cs` | Passa `existing.CreatedBy` ao deletar |
| `backend/src/Lucrai.API/Controllers/CashForecastsController.cs` | Passa `existing.CreatedBy` ao deletar |
| `backend/src/Lucrai.API/Controllers/TrashController.cs` | Inclui `i.CreatedBy` no GetAll |
| `backend/src/Lucrai.Infrastructure/Repositories/TrashRepository.cs` | Seta `CreatedBy` ao restaurar |
| `backend/src/Lucrai.Infrastructure/Data/LucraiDbContext.cs` | Configuração da coluna `CreatedBy` |
| `backend/src/Lucrai.Infrastructure/Migrations/20260717200519_AddCreatedByToDeletedItem.cs` | Migration adicionando coluna |
| `backend/src/Lucrai.Infrastructure/Migrations/LucraiDbContextModelSnapshot.cs` | Snapshot atualizado |

#### Frontend

| Arquivo | Mudança |
|---------|---------|
| `src/types/index.ts` | `createdBy` em `DeletedTransaction` |
| `src/types/api.ts` | `createdBy` em `ApiTrashItem` |
| `src/database/repositories/trash.ts` | `moveToTrash` e `restore` manipulam `createdBy` |
| `src/database/repositories/cash-forecast.ts` | `softDelete` inclui `createdBy` |
| `src/database/services/api-repositories/trash.ts` | `mapTrashItem` mapeia `createdBy` |
| `src/database/dexie.ts` | Schema version bump 13→14, índice `createdBy` adicionado |

### Métricas

| Métrica | Valor |
|---------|-------|
| Arquivos alterados | 17 |
| Migration | `20260717200519_AddCreatedByToDeletedItem` |
| Schema Dexie | `13 → 14` |
| Testes backend | 83/83 passando |
| Testes frontend | 3 falhas pré-existentes (não relacionadas) |

### Commits

- `ec40eac` — `fix: preserve createdBy through delete-restore cycle in trash system`
