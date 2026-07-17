# Cross-Tenant Data Exposure Fix — Trash Cleanup Endpoints

## Problem

Both trash cleanup endpoints operated globally without tenant isolation, allowing any authenticated user to trigger permanent deletion of expired trash items from **all companies**:

### `POST /api/trash/cleanup`
- `TrashController.Cleanup()` called `CleanupAsync()` with no company parameter
- `TrashRepository.GetAllExpiredAsync()` had **no WHERE Company filter** — returned expired items from all tenants
- Any user from Company A could permanently delete Company B's expired trash items

### `POST /api/documentos/trash/cleanup`
- `DocumentosController.CleanupTrash()` called `CleanupTrashAsync()` with no company parameter
- `DocumentoRepository.CleanupTrashAsync()` had **no WHERE Company filter** — deleted expired items from all tenants

Since the frontend calls cleanup on every visit to `/trash`, this cross-tenant mutation was triggered frequently.

## Fix

Added optional `string? company = null` parameter to all cleanup methods, propagating `Company` from the JWT context through controller → interface → repository.

### Files changed (6 files)

| File | Change |
|------|--------|
| `src/Lucrai.Core/Interfaces/ITrashRepository.cs` | Added `company` param to `GetAllExpiredAsync()` and `CleanupAsync()` |
| `src/Lucrai.Infrastructure/Repositories/TrashRepository.cs` | Added `WHERE Company == @company` to `GetAllExpiredAsync()` and `CleanupAsync()` |
| `src/Lucrai.API/Controllers/TrashController.cs` | Passing `Company` to `CleanupAsync(Company)` |
| `src/Lucrai.Core/Interfaces/IDocumentoRepository.cs` | Added `company` param to `CleanupTrashAsync()` |
| `src/Lucrai.Infrastructure/Repositories/DocumentoRepository.cs` | Added `WHERE Company == @company` to `CleanupTrashAsync()` |
| `src/Lucrai.API/Controllers/DocumentosController.cs` | Passing `Company` to `CleanupTrashAsync(Company)` |

### Design decisions
- Parameter is **optional** (`string? company = null`) — backward compatible
- When `company` is null, behavior matches the original global cleanup (no change for tests or callers that don't provide company)
- Tenant context comes from `HttpContext.Items["Company"]` extracted by `TenantContextMiddleware` from the JWT `company` claim
- No frontend changes needed — tenant identity is server-side only

## Verification

- `dotnet build` — 0 errors
- `dotnet test` — 83/83 passed (including existing `TrashControllerTests.Cleanup_ReturnsOk`)
