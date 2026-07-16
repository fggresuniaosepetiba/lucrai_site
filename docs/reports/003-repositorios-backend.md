# Repositórios Backend (C# / .NET)

Camada de persistência server-side usando Entity Framework Core sobre PostgreSQL (Neon). Responsável por operações CRUD de transações, previsões, lixeira, auditoria e autenticação via Identity.

## [2026-07-16] Ordenação por displayId + geração sequencial por usuário

### Problema

1. **Ordenação por data** — `TransactionRepository` usava `OrderByDescending(t => t.Date)` (3 métodos). `CashForecastRepository` usava `OrderBy(f => f.ExpectedDate)` (2 métodos). Nenhuma listagem usava `DisplayId`.

2. **Display ID global** — `GetNextDisplayIdAsync` usava `COUNT(*) + 1` sem filtrar por `CreatedBy`. Dois usuários recebiam o mesmo displayId ao criar registros simultaneamente.

3. **Interface sem suporte a userId** — Os métodos `GetNextDisplayIdAsync` em `ITransactionRepository` e `ICashForecastRepository` não aceitavam parâmetro de usuário, impedindo o isolamento por usuário no backend.

### Solução

1. **Ordenação** — Todos os métodos de listagem alterados para `OrderBy(t => t.DisplayId)`:
   - `TransactionRepository`: `GetAllAsync`, `GetByMonthAsync`, `GetByDateRangeAsync`
   - `CashForecastRepository`: `GetAllAsync`, `GetByDateRangeAsync`

2. **Display ID por usuário** — `GetNextDisplayIdAsync` agora recebe `createdBy`, filtra registros do usuário e encontra o menor número disponível:
   ```sql
   SELECT "DisplayId" FROM "Transactions"
   WHERE "CreatedBy" = @CreatedBy
   ORDER BY "DisplayId"
   ```
   No C#, ordena os displayIds, converte para inteiros e encontra a primeira lacuna.

3. **Interface atualizada** — Assinatura alterada para `GetNextDisplayIdAsync(string userId)` em ambas as interfaces.

### Arquivos Alterados

| Arquivo | Mudança |
|---------|---------|
| `src/Lucrai.Core/Interfaces/ITransactionRepository.cs` | `GetNextDisplayIdAsync(userId)` |
| `src/Lucrai.Core/Interfaces/ICashForecastRepository.cs` | `GetNextDisplayIdAsync(userId)` |
| `src/Lucrai.Infrastructure/Repositories/TransactionRepository.cs` | OrderBy(DisplayId) em 3 métodos + filtro por userId |
| `src/Lucrai.Infrastructure/Repositories/CashForecastRepository.cs` | OrderBy(DisplayId) em 2 métodos + filtro por userId |

### Métricas

| Métrica | Valor |
|---------|-------|
| Arquivos alterados | 4 |
| Linhas adicionadas | ~52 |
| Linhas removidas | ~10 |
| **Métodos com OrderBy(DisplayId)** | **5 de 5 (100%)** — antes: 0% |
| **DisplayId isolado por usuário** | **100%** — antes: global |
| **Algoritmo de ID** | `COUNT+1` → `lowest-available-number` |
| **Interfaces atualizadas** | **2 de 2 (100%)** |

### Commits

- `3d0333a` — Ordenação por displayId nos repositórios
- `b246cb1` — Per-user displayId + interface changes
