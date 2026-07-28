# Isolamento Total por Usuário (Cross-User Data Exposure)

## Data: 2026-07-28

---

## Problema

Usuários dentro da mesma empresa conseguiam ver dados uns dos outros em diversas funcionalidades (Recibos, Transações, etc.). Alguns controllers aceitavam `CriadoPor` vindo do corpo da requisição, permitindo que um cliente falsificasse a identidade.

---

## Solução Implementada

### 1. Global Query Filters no DbContext

Adicionado filtro global `e.CreatedBy == CurrentUserId` em 22 entidades, mantendo o filtro de empresa existente. O filtro é aplicado automaticamente pelo EF Core em toda query.

```csharp
builder.Entity<Transaction>().HasQueryFilter(t =>
    t.Company == CurrentCompany &&
    (t.CreatedBy == null || t.CreatedBy == CurrentUserId));
```

**Exceções:**
- `DismissedAlert` — apenas filtro de empresa (alertas descartados afetam todos)
- `Category` — `(c.CreatedBy == "" || c.CreatedBy == CurrentUserId)` (categorias de sistema)
- `User` — regra existente (necessária para login)

### 2. Recibo — Correção de Vulnerabilidade

| Antes | Depois |
|---|---|
| `CriadoPor = request.CriadoPor` (do corpo) | `CreatedBy = UserId` (do JWT) |
| AuditLog usava `request.CriadoPor` | AuditLog usa `UserName` do JWT + novo campo `UserId` |

### 3. Padronização de Campos

| Entidade | Campo Antigo | Novo Campo |
|---|---|---|
| Recibo | `CriadoPor` | `CreatedBy` (nullable) |
| DocumentoFinanceiro | `UserUploadId` | `CreatedBy` |
| DocumentoAprendizado | `CriadoPor` | `CreatedBy` |

### 4. Novos Campos Adicionados

| Entidade | Novo Campo | Tipo |
|---|---|---|
| FixedCost | `CreatedBy` | `string?` |
| Insumo | `CreatedBy` | `string?` |
| SignatureConfig | `CreatedBy` | `string?` |
| DocumentoConfiguracao | `CreatedBy` | `string?` |
| AuditLog | `UserId` | `string?` |

### 5. Delete com Ownership

- `ReciboRepository.GetByIdIncludingDeletedAsync` — agora aceita `userId` e filtra por `CreatedBy`
- Com o query filter global, `DeleteAsync` em todos os repositórios automaticamente só encontra registros do próprio usuário

### 6. PricingController

`CreatedBy` agora usa `UserId` do JWT (antes usava `UserName`, que é display name).

---

## Arquivos Modificados

### Entidades
- `backend/src/Lucrai.Core/Entities/Recibo.cs`
- `backend/src/Lucrai.Core/Entities/DocumentoAprendizado.cs`
- `backend/src/Lucrai.Core/Entities/DocumentoFinanceiro.cs`
- `backend/src/Lucrai.Core/Entities/FixedCost.cs`
- `backend/src/Lucrai.Core/Entities/Insumo.cs`
- `backend/src/Lucrai.Core/Entities/SignatureConfig.cs`
- `backend/src/Lucrai.Core/Entities/DocumentoConfiguracao.cs`
- `backend/src/Lucrai.Core/Entities/AuditLog.cs`

### DTOs
- `backend/src/Lucrai.Core/DTOs/Recibos/ReciboDtos.cs` — removido `CriadoPor` do request
- `backend/src/Lucrai.Core/DTOs/Documentos/DocumentoDtos.cs` — `UserUploadId` → `CreatedBy`

### DbContext
- `backend/src/Lucrai.Infrastructure/Data/LucraiDbContext.cs` — `CurrentUserId`, property configs, query filters

### Controllers
- `backend/src/Lucrai.API/Controllers/RecibosController.cs` — fix vulnerabilidade
- `backend/src/Lucrai.API/Controllers/PricingController.cs` — `CreatedBy = UserId`
- `backend/src/Lucrai.API/Controllers/DocumentoAprendizadoController.cs` — `CriadoPor` → `CreatedBy`
- `backend/src/Lucrai.API/Controllers/DocumentosController.cs` — `UserUploadId` → `CreatedBy`

### Interfaces e Repositories
- `backend/src/Lucrai.Core/Interfaces/IReciboRepository.cs` — `GetByIdIncludingDeletedAsync` com `userId`
- `backend/src/Lucrai.Infrastructure/Repositories/ReciboRepository.cs` — filtro manual no `IgnoreQueryFilters`

### Validators
- `backend/src/Lucrai.API/Validators/ReciboValidators.cs` — removido validação de `CriadoPor`

### Migration
- `backend/src/Lucrai.Infrastructure/Migrations/20260728142726_AddUserLevelIsolation.cs`

### Testes
- `ReciboIsolationTests.cs` — 2 novos testes de isolamento por usuário + correção dos existentes

---

## Fixes Posteriores (2026-07-28 #2)

Após QA encontrar 3 bugs de isolamento/restore, foram aplicados:

### Controllers sem `CreatedBy` 
- `FixedCostsController` — adicionado `UserId`, seta `CreatedBy = UserId` no Save()
- `InsumosController` — adicionado `UserId`, seta `CreatedBy = UserId` no Create()
- `SignatureController` — adicionado `UserId`, seta `CreatedBy = UserId` no Save()

### Restore da Lixeira com `.IgnoreQueryFilters()`
- `TrashRepository.RestoreAsync()` — adicionado `.IgnoreQueryFilters()` para encontrar DeletedItems
- `TrashRepository.PermanentlyDeleteAsync()` — idem
- `DocumentoRepository.RestoreFromTrashAsync()` — adicionado `.IgnoreQueryFilters()` no DocumentoTrashItem
- `DocumentoRepository.PermanentDeleteAsync()` — idem
- `DocumentoRepository.GetAllTrashItemsAsync()` — idem
- `DocumentoRepository.GetTrashItemAsync()` — idem

### Erro ao criar Lançamento Financeiro do Recibo
- `CreateTransactionRequest.CategoryId` mudou de `Guid` para `Guid?`
- Quando `CategoryId` é null/empty, o controller cria (ou reusa) uma categoria "Recibo" via `ICategoryRepository`
- Frontend (`recibos/page.tsx`) envia `null` em vez de `""`

---

## Testes

87 testes no total:

| Teste | O que verifica |
|---|---|
| `Recibos_Are_Strictly_Isolated_By_Company` | Usuário de CompanyA não vê recibos de CompanyB |
| `Recibo_Cannot_Be_Fetched_Across_Companies` | lucrai.adm não pode buscar recibo de CompanyX por ID |
| `Recibos_Are_Strictly_Isolated_By_User_Within_Same_Company` | UserA não vê recibos do UserB na mesma empresa |
| `Recibo_Cannot_Be_Fetched_Across_Users_In_Same_Company` | UserB recebe 404 ao buscar recibo do UserA por ID |

---

## Migration

Para aplicar a migration no banco PostgreSQL:

```bash
dotnet ef database update \
  --project backend/src/Lucrai.Infrastructure \
  --startup-project backend/src/Lucrai.API
```

**O que a migration faz:**
1. Renomeia `Documentos.UserUploadId` → `CreatedBy`
2. Renomeia `DocumentoAprendizados.CriadoPor` → `CreatedBy`
3. Remove `Recibos.CriadoPor` e adiciona `Recibos.CreatedBy` (nullable)
4. Adiciona `CreatedBy` (nullable) em: `FixedCosts`, `Insumos`, `SignatureConfigs`, `DocumentoConfiguracoes`
5. Adiciona `UserId` (nullable) em: `AuditLogs`

Registros existentes ficam com `CreatedBy = NULL`, tornando-se visíveis a todos (fallback) até serem editados.
