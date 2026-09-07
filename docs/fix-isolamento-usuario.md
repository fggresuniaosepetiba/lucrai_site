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

### Frontend Cleanup (2026-07-28 #3)
- **Sino de notificação removido** — botão com `Bell` icon no header
- **Tema light ("Clean") removido** — `ThemeMode` agora só `"normal" | "dark-mega"`; opções: "Sistema" (Monitor) e "Dark Mega" (Moon)

### FixedCost per-user strict (2026-09-07 — B escolhido)
- **Antes:** `FixedCost` `Company` único (`IX_FixedCosts_Company`), `CreatedBy nullable`, `HasQueryFilter (CreatedBy==null||CreatedBy==CurrentUserId)` → singleton compartilhado `43c6c99b...` visível a todos (`lucrai PUT 7777 → fellype via`)
- **Depois:** `CreatedBy` `IsRequired` (`string.Empty`), `HasIndex Company+CreatedBy unique`, `HasQueryFilter Company==CurrentCompany && CreatedBy==CurrentUserId` (sem fallback null) + `DELETE WHERE CreatedBy IS NULL` na migration `20260907201024_FixFixedCostPerUserIsolation` → cada usuário cria seu próprio `FixedCosts` (`lucrai POST → fellype 404` igual `Insumo 4771b3...`)
- **Repo:** `FixedCostRepository.GetAsync/SaveAsync` agora respeita filtro por usuário; `FixedCostsController PUT` seta `CreatedBy=UserId`

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

---

## Verificação senha/troca (2026-09-07 — sem alteração)

Leitura direta Neon `neondb` `ep-proud-base-aci4mfda` (Opção A — read-only, sem `UPDATE`):

- `SELECT DISTINCT Company` → `Grão Natural | Lucraí | Trinary` — **`Quinto Set` = 0 rows** (não existe company `Quinto Set`; deploy-guide menciona app externo `quintoset.vercel.app`, não tenant do banco lucrai_site)
- `AspNetUsers` total 8: `Lucraí` 6 (screenshot) + 1 `Grão Natural` + 1 `Trinary`
- `Lucraí`: `lucrai.adm 7671c516… false` (`@Lucrai2026` via `AuthController:57 MustChangePassword false` → login `200` sem redirect), `joao.ribeiro bb112dcd… false` (`123` dá `401 Credenciais inválidas` → já trocou), `fellype.gabriel false` (`@86493056Fg`), `eduardo.contador true` / `vitoria.justo true` / `laura.peixoto true` (`123` → `POST /api/auth/login 200 {mustChangePassword:true}` → redirect para `POST /api/auth/change-password` que seta `MustChangePassword=false`)
- `DataSeeder.cs:118-122` só reativa `MustChangePassword` quando hash ainda é `123` (proteção contra reset pós-reboot); `AuthController.cs:57,75` expõe flag e limpa após troca

Teste prod `https://lucrai-site.onrender.com/api/auth/login` 2026-09-07 17:17 UTC (sem UPDATE): `lucrai.adm/123 401`, `joao/123 401`, `eduardo/123 200 true`, `vitoria/123 200 true`, `laura/123 200 true` — confirmava que `lucrai` e `joão` **não iam** para troca

## Zeramento senha (2026-09-07 20:46 UTC — Opção A executada a pedido)

- **Alvo:** `lucrai.adm 7671c516…` + `joao.ribeiro bb112dcd…`
- **SQL:** `UPDATE AspNetUsers SET PasswordHash=@h123 (PasswordHasher<IdentityUser>.HashPassword(..., "123")), SecurityStamp=guid, ConcurrencyStamp=guid, MustChangePassword=true WHERE Id=@id` + `DELETE FROM RefreshTokens WHERE UserId=@id` (13/2 rows) — Neon `ep-proud-base-aci4mfda`
- **Verify:** `SELECT MustChangePassword true hash_len 84` ambos; `POST /api/auth/login 123 → 200 {mustChangePassword:true}` ambos; `@Lucrai2026` → `401 Credenciais inválidas`
- **Endpoint troca:** `POST /api/auth/change-password` testado `lucrai 123 → Teste@123 200` + login `Teste@123 200 {mustChangePassword:false}`; revert para `123` via API falha `400 The length of 'New Password' must be at least 6 characters` (policy 6 chars) — portanto revert feito novamente via SQL para manter `123` (hash via Identity, não via API); estado final ambos `123 true` conforme solicitado
