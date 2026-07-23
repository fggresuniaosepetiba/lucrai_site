# Isolamento Total por Usuário + Cross-Tenant Data Exposure

## Legenda

- `[x]` Concluído

---

## Princípio

> Isolamento total por usuário, ponto final. O role é irrelevante — cada usuário só vê seus próprios dados.
> Usuário X **não pode** ver o dado de Usuário Y, e vice-versa.
> Role/permissão é irrelevante para esse isolamento.
> Nem mesmo um Owner pode ver settings de outro usuário.

---

## Fase 1 — Settings por Usuário (impede vazamento entre usuários)

### 1.1 Entity — adicionar `UserId`

**Arquivo:** `backend/src/Lucrai.Core/Entities/CompanySettings.cs`

```csharp
// Adicionar após Company (linha 9):
public string UserId { get; set; } = string.Empty;
```

### 1.2 DbContext — unique index composto

**Arquivo:** `backend/src/Lucrai.Infrastructure/Data/LucraiDbContext.cs` (linhas 205-214)

```
// Mudar de:
entity.HasIndex(s => s.Company).IsUnique();

// Para:
entity.HasIndex(s => new { s.UserId, s.Company }).IsUnique();
```

### 1.3 Migration

```bash
dotnet ef migrations add AddUserIdToCompanySettings \
  --project backend/src/Lucrai.Infrastructure \
  --startup-project backend/src/Lucrai.API
```

- Coluna `UserId` (varchar 200, not null)
- Drop unique index `IX_CompanySettings_Company`
- Create unique index `IX_CompanySettings_UserId_Company`

### 1.4 Repository — filtro por `UserId`

**Arquivo:** `backend/src/Lucrai.Core/Interfaces/ISettingsRepository.cs` (linhas 7-9)

```
// Mudar de:
Task<CompanySettings?> GetAsync(string? company);
Task<CompanySettings> UpdateAsync(string? company, CompanySettings settings);

// Para:
Task<CompanySettings?> GetAsync(string company, string userId);
Task<CompanySettings> UpdateAsync(string company, string userId, CompanySettings settings);
```

**Arquivo:** `backend/src/Lucrai.Infrastructure/Repositories/SettingsRepository.cs`

#### `GetAsync` (linhas 17-21)

```
// Mudar de:
public async Task<CompanySettings?> GetAsync(string? company)
{
    return await _context.CompanySettings
        .FirstOrDefaultAsync(s => company == null || s.Company == company);
}

// Para:
public async Task<CompanySettings?> GetAsync(string company, string userId)
{
    return await _context.CompanySettings
        .FirstOrDefaultAsync(s => s.Company == company && s.UserId == userId);
}
```

#### `SaveAsync` (linhas 23-39) — vincular ao `UserId`

```
// Dentro do método, no bloco de criação (após linha 35):
settings.UserId = userId;

// Assinatura:
public async Task<CompanySettings> SaveAsync(CompanySettings settings, string userId)
```

#### `UpdateAsync` (linhas 41-57)

```
// Mudar de:
public async Task<CompanySettings> UpdateAsync(string? company, CompanySettings settings)

// Para:
public async Task<CompanySettings> UpdateAsync(string company, string userId, CompanySettings settings)
```

No corpo, usar `GetAsync(company, userId)` em vez de `GetAsync(company)`.

### 1.5 Controller — ler `UserId` do JWT

**Arquivo:** `backend/src/Lucrai.API/Controllers/SettingsController.cs`

#### Propriedades (linha 21)

```
// Mudar de:
private string Company => HttpContext.Items["Company"] as string ?? "";

// Para:
private string Company => HttpContext.Items["Company"] as string;
private string UserId => HttpContext.Items["UserId"] as string;
```

#### `Get()` (linhas 23-31)

```
// Mudar de:
var settings = await _repo.GetAsync(Company);

// Para:
if (string.IsNullOrEmpty(Company) || string.IsNullOrEmpty(UserId))
    return Unauthorized();
var settings = await _repo.GetAsync(Company, UserId);
```

#### `Save()` (linhas 33-46)

```
// Adicionar:
settings.UserId = UserId;
// Passar UserId para SaveAsync
```

#### `Update()` (linhas 48-61)

```
// Passar Company e UserId para UpdateAsync
```

### 1.6 DTOs — adicionar `UserId`

**Arquivo:** `backend/src/Lucrai.Core/DTOs/Settings/SettingsDtos.cs` (linhas 9-15)

```
// SettingsResponse adicionar:
string UserId
```

### 1.7 Frontend — atualizar tipos

**Arquivo:** `src/types/api.ts` (linhas 137-143)

```typescript
export interface ApiSettings {
  id: string;
  companyName: string;
  logoUrl: string | null;
  primaryColor: string;
  company: string;
  userId: string;  // NOVO
}
```

**Arquivo:** `src/types/index.ts` (linhas 41-47)

```typescript
export interface AppSettings {
  id: string;
  companyName: string;
  logoUrl?: string;
  primaryColor: string;
  company: string;
  userId: string;  // NOVO
}
```

**Arquivo:** `src/services/api-repositories/settings.ts`

- `mapSettings()` — mapear `userId`

---

## Fase 2 — Audit Logging em Settings (nunca mais perder dados)

### 2.1 Repository — injetar auditoria

**Arquivo:** `backend/src/Lucrai.Infrastructure/Repositories/SettingsRepository.cs`

```csharp
// Adicionar field:
private readonly IAuditRepository _auditRepo;

// Construtor:
public SettingsRepository(LucraiDbContext context, IAuditRepository auditRepo)
{
    _context = context;
    _auditRepo = auditRepo;
}
```

### 2.2 Log em `SaveAsync` e `UpdateAsync`

Após `SaveChangesAsync()` em ambos os métodos:

```csharp
await _auditRepo.LogAsync(new AuditLog
{
    EntityId = saved.Id,
    EntityType = "settings",
    DisplayId = saved.Company,
    Action = existing != null ? AuditAction.Edited : AuditAction.Created,
    Description = $"Configurações {(existing != null ? "atualizadas" : "criadas")} para {saved.Company}",
    User = userName,  // precisa receber userName por parâmetro ou do context
    Company = saved.Company,
    Details = JsonSerializer.Serialize(new
    {
        before = existing != null ? new { existing.CompanyName, existing.LogoUrl, existing.PrimaryColor } : null,
        after = new { saved.CompanyName, saved.LogoUrl, saved.PrimaryColor }
    })
});
```

> Nota: `SaveAsync` e `UpdateAsync` precisam receber `string? userName`.

### 2.3 Controller — passar `UserName`

**Arquivo:** `backend/src/Lucrai.API/Controllers/SettingsController.cs`

```csharp
private string UserName => HttpContext.Items["UserName"] as string;
```

Passar `UserName` para `SaveAsync()` e `UpdateAsync()`.

---

## Fase 3 — Fechar Null-Gate do HasQueryFilter (sistêmico)

### 3.1 DbContext — 22 entidades fail-closed

**Arquivo:** `backend/src/Lucrai.Infrastructure/Data/LucraiDbContext.cs` (linhas 524-549)

Manter null-gate APENAS em `User` (login precisa):

```csharp
builder.Entity<User>().HasQueryFilter(u => CurrentCompany == null || u.Company == CurrentCompany);
```

Todas as outras 22 entidades mudar de:

```
CurrentCompany == null || e.Company == CurrentCompany
```

Para:

```
e.Company == CurrentCompany
```

Entidades afetadas:

| # | Entity | Linha |
|---|--------|-------|
| 1 | `Transaction` | 526 |
| 2 | `Category` | 527 |
| 3 | `CashForecast` | 528 |
| 4 | `PricingProduct` | 529 |
| 5 | `DeletedItem` | 530 |
| 6 | `AuditLog` | 531 |
| 7 | `CompanySettings` | 532 |
| 8 | `DismissedAlert` | 533 |
| 9 | `DocumentoFinanceiro` | 534 |
| 10 | `DocumentoTrashItem` | 535 |
| 11 | `DocumentoLog` | 536 |
| 12 | `DocumentoAprendizado` | 537 |
| 13 | `DocumentoConfiguracao` | 538 |
| 14 | `SignatureConfig` | 539 |
| 15 | `FixedCost` | 540 |
| 16 | `Insumo` | 541 |
| 17 | `Recibo` | 542 |
| 18 | `AccountReceivable` | 543 |
| 19 | `AccountPayable` | 544 |
| 20 | `Debt` | 545 |
| 21 | `Investment` | 546 |
| 22 | `BalanceAccount` | 547 |

### 3.2 Migration — nenhuma necessária (só mudança de código, não de schema)

> HasQueryFilter é aplicado em tempo de execução pelo EF Core. Nenhuma migration necessária.

---

## Fase 4 — Defesa em Profundidade (Repositórios)

### 4.1 Nove `DeleteAsync(Guid id)` → `DeleteAsync(Guid id, string company)`

Cada repositório precisa de 3 arquivos alterados: interface, implementação, controller.

#### 4.1a TransactionRepository

| Arquivo | Linhas | Mudança |
|---------|--------|---------|
| `src/Lucrai.Core/Interfaces/ITransactionRepository.cs` | 13 | `Task DeleteAsync(Guid id)` → `Task DeleteAsync(Guid id, string company)` |
| `src/Lucrai.Infrastructure/Repositories/TransactionRepository.cs` | 113-121 | `FirstOrDefaultAsync(t => t.Id == id)` → `FirstOrDefaultAsync(t => t.Id == id && t.Company == company)` |
| `src/Lucrai.API/Controllers/TransactionsController.cs` | 160 | `await _repo.DeleteAsync(id)` → `await _repo.DeleteAsync(id, Company)` |

#### 4.1b CategoryRepository

| Arquivo | Linhas | Mudança |
|---------|--------|---------|
| `src/Lucrai.Core/Interfaces/ICategoryRepository.cs` | 12 | `Task DeleteAsync(Guid id)` → `Task DeleteAsync(Guid id, string company)` |
| `src/Lucrai.Infrastructure/Repositories/CategoryRepository.cs` | 69-77 | `FirstOrDefaultAsync(c => c.Id == id)` → `FirstOrDefaultAsync(c => c.Id == id && c.Company == company)` |
| `src/Lucrai.API/Controllers/CategoriesController.cs` | 118 | `await _repo.DeleteAsync(id)` → `await _repo.DeleteAsync(id, Company)` |

#### 4.1c CashForecastRepository

| Arquivo | Linhas | Mudança |
|---------|--------|---------|
| `src/Lucrai.Core/Interfaces/ICashForecastRepository.cs` | 12 | `Task DeleteAsync(Guid id)` → `Task DeleteAsync(Guid id, string company)` |
| `src/Lucrai.Infrastructure/Repositories/CashForecastRepository.cs` | 97-105 | `FirstOrDefaultAsync(f => f.Id == id)` → `FirstOrDefaultAsync(f => f.Id == id && f.Company == company)` |
| `src/Lucrai.API/Controllers/CashForecastsController.cs` | 139 | `await _repo.DeleteAsync(id)` → `await _repo.DeleteAsync(id, Company)` |

#### 4.1d AccountReceivableRepository

| Arquivo | Linhas | Mudança |
|---------|--------|---------|
| `src/Lucrai.Core/Interfaces/IAccountReceivableRepository.cs` | 11 | `Task DeleteAsync(Guid id)` → `Task DeleteAsync(Guid id, string company)` |
| `src/Lucrai.Infrastructure/Repositories/AccountReceivableRepository.cs` | 76-84 | `FirstOrDefaultAsync(a => a.Id == id)` → `FirstOrDefaultAsync(a => a.Id == id && a.Company == company)` |
| `src/Lucrai.API/Controllers/AccountsReceivableController.cs` | 113 | `await _repo.DeleteAsync(id)` → `await _repo.DeleteAsync(id, Company)` |

#### 4.1e AccountPayableRepository

| Arquivo | Linhas | Mudança |
|---------|--------|---------|
| `src/Lucrai.Core/Interfaces/IAccountPayableRepository.cs` | 11 | `Task DeleteAsync(Guid id)` → `Task DeleteAsync(Guid id, string company)` |
| `src/Lucrai.Infrastructure/Repositories/AccountPayableRepository.cs` | 76-84 | `FirstOrDefaultAsync(a => a.Id == id)` → `FirstOrDefaultAsync(a => a.Id == id && a.Company == company)` |
| `src/Lucrai.API/Controllers/AccountsPayableController.cs` | 113 | `await _repo.DeleteAsync(id)` → `await _repo.DeleteAsync(id, Company)` |

#### 4.1f DebtRepository

| Arquivo | Linhas | Mudança |
|---------|--------|---------|
| `src/Lucrai.Core/Interfaces/IDebtRepository.cs` | 11 | `Task DeleteAsync(Guid id)` → `Task DeleteAsync(Guid id, string company)` |
| `src/Lucrai.Infrastructure/Repositories/DebtRepository.cs` | 76-84 | `FirstOrDefaultAsync(d => d.Id == id)` → `FirstOrDefaultAsync(d => d.Id == id && d.Company == company)` |
| `src/Lucrai.API/Controllers/DebtsController.cs` | 122 | `await _repo.DeleteAsync(id)` → `await _repo.DeleteAsync(id, Company)` |

#### 4.1g InvestmentRepository

| Arquivo | Linhas | Mudança |
|---------|--------|---------|
| `src/Lucrai.Core/Interfaces/IInvestmentRepository.cs` | 11 | `Task DeleteAsync(Guid id)` → `Task DeleteAsync(Guid id, string company)` |
| `src/Lucrai.Infrastructure/Repositories/InvestmentRepository.cs` | 76-84 | `FirstOrDefaultAsync(i => i.Id == id)` → `FirstOrDefaultAsync(i => i.Id == id && i.Company == company)` |
| `src/Lucrai.API/Controllers/InvestmentsController.cs` | 130 | `await _repo.DeleteAsync(id)` → `await _repo.DeleteAsync(id, Company)` |

#### 4.1h BalanceAccountRepository

| Arquivo | Linhas | Mudança |
|---------|--------|---------|
| `src/Lucrai.Core/Interfaces/IBalanceAccountRepository.cs` | 13 | `Task DeleteAsync(Guid id)` → `Task DeleteAsync(Guid id, string company)` |
| `src/Lucrai.Infrastructure/Repositories/BalanceAccountRepository.cs` | 92-100 | `FirstOrDefaultAsync(a => a.Id == id)` → `FirstOrDefaultAsync(a => a.Id == id && a.Company == company)` |
| `src/Lucrai.API/Controllers/BalanceAccountsController.cs` | 142 | `await _repo.DeleteAsync(id)` → `await _repo.DeleteAsync(id, Company)` |

#### 4.1i DocumentoAprendizadoRepository

| Arquivo | Linhas | Mudança |
|---------|--------|---------|
| `src/Lucrai.Core/Interfaces/IDocumentoAprendizadoRepository.cs` | 10 | `Task DeleteAsync(Guid id)` → `Task DeleteAsync(Guid id, string company)` |
| `src/Lucrai.Infrastructure/Repositories/DocumentoAprendizadoRepository.cs` | 60-68 | `FirstOrDefaultAsync(a => a.Id == id)` → `FirstOrDefaultAsync(a => a.Id == id && a.Company == company)` |
| `src/Lucrai.API/Controllers/DocumentoAprendizadoController.cs` | 64 | `await _repo.DeleteAsync(id)` → `await _repo.DeleteAsync(id, Company)` |

### 4.2 Três `MarkAs*` do CashForecastRepository

**Arquivo:** `backend/src/Lucrai.Core/Interfaces/ICashForecastRepository.cs` (linhas 13-15)

```
Task MarkAsReceivedAsync(Guid id, string? userName)
→ Task MarkAsReceivedAsync(Guid id, string company, string? userName)

Task MarkAsPaidAsync(Guid id, string? userName)
→ Task MarkAsPaidAsync(Guid id, string company, string? userName)

Task MarkAsCancelledAsync(Guid id, string? reason, string? userName)
→ Task MarkAsCancelledAsync(Guid id, string company, string? reason, string? userName)
```

**Arquivo:** `backend/src/Lucrai.Infrastructure/Repositories/CashForecastRepository.cs`

| Método | Linhas | Mudança no `FirstOrDefaultAsync` |
|--------|--------|----------------------------------|
| `MarkAsReceivedAsync` | 109 | `f => f.Id == id && f.Company == company` |
| `MarkAsPaidAsync` | 148 | `f => f.Id == id && f.Company == company` |
| `MarkAsCancelledAsync` | 187 | `f => f.Id == id && f.Company == company` |

**Arquivo:** `backend/src/Lucrai.API/Controllers/CashForecastsController.cs`

| Linha | Atual | Novo |
|-------|-------|------|
| 150 | `MarkAsReceivedAsync(id, UserName)` | `MarkAsReceivedAsync(id, Company, UserName)` |
| 161 | `MarkAsPaidAsync(id, UserName)` | `MarkAsPaidAsync(id, Company, UserName)` |
| 172 | `MarkAsCancelledAsync(id, reason, UserName)` | `MarkAsCancelledAsync(id, Company, reason, UserName)` |

### 4.3 CategoryRepository — `HasTransactionsAsync` e `GetTransactionCountAsync`

**Arquivo:** `backend/src/Lucrai.Core/Interfaces/ICategoryRepository.cs`

```
Task<bool> HasTransactionsAsync(Guid categoryId)
→ Task<bool> HasTransactionsAsync(Guid categoryId, string company)

Task<int> GetTransactionCountAsync(Guid categoryId)
→ Task<int> GetTransactionCountAsync(Guid categoryId, string company)
```

**Arquivo:** `backend/src/Lucrai.Infrastructure/Repositories/CategoryRepository.cs`

| Método | Linhas | Mudança |
|--------|--------|---------|
| `HasTransactionsAsync` | 79-82 | `AnyAsync(t => t.CategoryId == categoryId && t.Company == company)` |
| `GetTransactionCountAsync` | 84-87 | `CountAsync(t => t.CategoryId == categoryId && t.Company == company)` |
| `RemoveDuplicatesAsync` | 117-119 | `Where(t => t.CategoryId == dup.Id && t.Company == company)` — precisa receber `company` |

### 4.4 DocumentoRepository — trash queries

**Arquivo:** `backend/src/Lucrai.Infrastructure/Repositories/DocumentoRepository.cs`

| Método | Linhas | Mudança |
|--------|--------|---------|
| `RestoreFromTrashAsync` | 142-143 | `FirstOrDefaultAsync(t => t.DocumentoId == id && t.Company == company)` |
| `PermanentDeleteAsync` | 160-161 | `FirstOrDefaultAsync(t => t.DocumentoId == id && t.Company == company)` |

---

## Sumário de Arquivos Alterados

| Fase | Categoria | Quantidade |
|------|-----------|-----------|
| 1 | Settings por usuário | 6 |
| 2 | Audit logging | 2 |
| 3 | HasQueryFilter null-gate | 1 |
| 4a | DeleteAsync (9 interfaces) | 9 |
| 4a | DeleteAsync (9 implementações) | 9 |
| 4a | DeleteAsync (9 controllers) | 9 |
| 4b | MarkAs* (1 interface + 1 impl + 1 controller) | 3 |
| 4c | Category queries (1 interface + 1 impl + 1 controller) | 3 |
| 4d | Documento trash (1 impl) | 1 |
| | **Migration** | 1 |
| | **Total** | **~44** |

---

## Status da Execução

- `[x] Fase 1` — Settings por usuário + Migration
- `[x] Fase 2` — Audit logging
- `[x] Fase 3` — HasQueryFilter fail-closed
- `[x] Fase 4` — Defesa repositórios
- `[x] `dotnet build` — 0 erros
- `[x] `npm run build` — 0 erros
