# Sprint 19 — Correção Crítica: ApplyTenantFilters Nunca Aplicava (Guard NullCurrentCompany)

## Contexto

No Sprint 18 os `HasQueryFilter` foram adicionados a todas as 23 entidades com campo `Company`, mas o método `ApplyTenantFilters` tinha um guard `if (string.IsNullOrEmpty(CurrentCompany)) return;` que impedia TODOS os filtros de serem registrados quando o modelo era construído pela primeira vez sem um JWT (ex: health check, CORS preflight, requisição anônima de cadastro). Como `OnModelCreating` executa uma única vez por lifetime da aplicação, o modelo era cacheado SEM os filtros, deixando todas as queries subsequentes sem isolamento de tenant.

## Root Cause

`LucraiDbContext.cs:524-527`:
```csharp
// ANTES: guard impedia filtros de serem registrados
if (string.IsNullOrEmpty(CurrentCompany))
    return;
```

`OnModelCreating` executa UMA vez. Se a primeira requisição é anônima → `CurrentCompany` é null → `return` precoce → filtros nunca registrados → modelo é cacheado sem isolamento.

## O Que Foi Corrigido

### Crítico: `ApplyTenantFilters` — guard removido

**Antes:**
```csharp
if (string.IsNullOrEmpty(CurrentCompany))
    return;
builder.Entity<Transaction>().HasQueryFilter(t => t.Company == CurrentCompany);
```

**Depois:**
```csharp
// Filtro sempre registrado; quando CurrentCompany é null, vira no-op
builder.Entity<Transaction>().HasQueryFilter(t => CurrentCompany == null || t.Company == CurrentCompany);
```

### Defense-in-Depth: Repositórios com Company Filtering

Métodos que não tinham filtro de empresa agora recebem `string company` e filtram na query (redundância com HasQueryFilter, mas protege caso o filtro global não seja aplicado por qualquer motivo):

| Repositório | Métodos |
|---|---|
| **ReciboRepository** | `GetByIdAsync`, `DeleteAsync`, `GetByLancamentoIdAsync` |
| **InsumoRepository** | `GetByIdAsync`, `DeleteAsync` |
| **PricingRepository** | `GetByIdAsync`, `DeleteAsync` |
| **DocumentoRepository** | `GetByIdAsync`, `MoveToTrashAsync`, `RestoreFromTrashAsync`, `PermanentDeleteAsync`, `GetTrashItemAsync` |
| **DocumentoLogRepository** | `GetByDocumentoAsync` |

### Controllers: `fetch-then-verify` removido

Todos os controllers que faziam `var x = await repo.GetByIdAsync(id); if (x.Company != Company) return NotFound()` agora passam `Company` direto para o repositório. O repositório já filtra por `id + company`, eliminando a redundância e o risco de esquecer o check em novos endpoints.

## Arquivos Modificados

15 arquivos, 109 inserções, 112 deleções:

- `LucraiDbContext.cs` — HasQueryFilter sem guard (CurrentCompany == null || ...)
- `IReciboRepository.cs`, `ReciboRepository.cs`, `RecibosController.cs`
- `IInsumoRepository.cs`, `InsumoRepository.cs`, `InsumosController.cs`
- `IPricingRepository.cs`, `PricingRepository.cs`, `PricingController.cs`
- `IDocumentoRepository.cs`, `DocumentoRepository.cs`, `DocumentosController.cs`
- `IDocumentoLogRepository.cs`, `DocumentoLogRepository.cs`

## Impacto

- Build: 0 erros
- Testes: 83/83 passando
- Frontend TypeScript: 0 erros

## Observações

- O operador `??` (null-coalescing) NÃO funciona em expression trees do EF Core InMemory — por isso usamos `CurrentCompany == null || ...` em vez de `CurrentCompany ?? ...`
- `CompanyRegistration` e `RefreshToken` continuam sem `HasQueryFilter` (não têm campo `Company`)
- Alguns `DeleteAsync(Guid id)` ainda não têm company filtering (CashForecast, Category, Transaction, etc.) mas estão protegidos por controller-side pre-checks
