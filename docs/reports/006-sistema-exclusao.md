# Sistema de Exclusão (Lixeira)

Sistema de exclusão temporária com lixeira, restauração em até 30 dias e exclusão permanente. Abrange:
- **Backend**: tabela `DeletedItems` no PostgreSQL + endpoints REST (`TrashController`)
- **Frontend**: página `/trash` com cards, restauração e exclusão permanente
- **Migrações**: Entity Framework Core para sincronizar schema

## [2026-07-16] Correção de timestamps no DeletedItem + toast duplicado

### Problema

1. **Timestamp type mismatch** — A migration inicial criou as colunas `CreatedAt`, `UpdatedAt`, `DeletedAt` e `RestoreUntil` como `timestamp with time zone` no PostgreSQL. Porém o EF Core as mapeava como `DateTime` (sem timezone). Tentativas de correção geravam erro de conflito: `cannot be cast automatically to type timestamp without time zone`.

2. **Toast duplicado** — Ao excluir um lançamento, o `transaction-list.tsx` disparava dois toasts de sucesso simultaneamente — um da função de exclusão e outro do handler de evento.

### Solução

1. **Duas migrations corretivas**:
   - `FixDeletedItemTimestampColumns` — primeira tentativa (não resolveu completamente)
   - `FixDeletedItemTimestampColumnsTake2` — revert colunas para `timestamptz` explicitamente no `DbContext` usando `HasColumnType("timestamp with time zone")`
   
   A configuração final no `LucraiDbContext.cs`:
   ```csharp
   entity.Property(e => e.CreatedAt).HasColumnType("timestamp with time zone");
   entity.Property(e => e.UpdatedAt).HasColumnType("timestamp with time zone");
   entity.Property(e => e.DeletedAt).HasColumnType("timestamp with time zone");
   entity.Property(e => e.RestoreUntil).HasColumnType("timestamp with time zone");
   ```

2. **Toast único** — Removida a chamada extra de toast em `transaction-list.tsx` (linha do handler de evento), mantendo apenas o disparo centralizado na função de exclusão.

### Arquivos Alterados

| Arquivo | Mudança |
|---------|---------|
| `src/Lucrai.Infrastructure/Data/LucraiDbContext.cs` | `HasColumnType("timestamp with time zone")` para 4 colunas |
| `.../Migrations/*FixDeletedItemTimestampColumns*.cs` | Migration 1 (gerada) |
| `.../Migrations/*FixDeletedItemTimestampColumns*.Designer.cs` | Snapshot 1 |
| `.../Migrations/*FixDeletedItemTimestampColumnsTake2*.cs` | Migration 2 (gerada) |
| `.../Migrations/*FixDeletedItemTimestampColumnsTake2*.Designer.cs` | Snapshot 2 |
| `.../Migrations/LucraiDbContextModelSnapshot.cs` | Model snapshot atualizado |
| `src/components/financial/transaction-list.tsx` | Removeu toast duplicado |

### Métricas

| Métrica | Valor |
|---------|-------|
| Arquivos alterados | 7 |
| Linhas adicionadas | ~4.230 (migrations geradas automaticamente) |
| Linhas removidas | 18 |
| **Bug de tipo resolvido** | **100%** — colunas agora consistentes como timestamptz |
| **Toast duplicado eliminado** | **100%** — único toast por exclusão |

### Commits

- `7a4a9ec` — Delete timestamps mismatch + duplicate toast fix
- `a730fb6` — Revert CreatedAt/UpdatedAt/DeletedAt/RestoreUntil back to timestamptz
