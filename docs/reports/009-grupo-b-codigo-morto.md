# Limpeza de Código Morto — Grupo B

Remoção de repositórios Dexie não utilizados, migração dos últimos consumidores Dexie para API, bump do schema Dexie e remoção de tipos mortos.

## [2026-07-17] Migrar consumidores Dexie para API

### Contexto

As 5 features do Grupo B (Recibos, Insumos, Custos Fixos, Assinatura Digital, Auditoria) **já possuíam backend completo** (controllers, entidades, DTOs, repositórios EF Core, migrations, DI). Os frontends já chamavam a API (`*RepositoryApi`), mas os repositórios Dexie equivalentes permaneciam no código — nunca usados.

### Mudanças

#### Migrações Dexie → API

| Componente | Antes (Dexie) | Depois (API) |
|------------|--------------|-------------|
| `TechnicalSheetModal.tsx` | `InsumosRepository.getAll(company)` / `.create()` | `InsumoRepositoryApi.getAll()` / `.create()` |
| `pricing/page.tsx` | `FixedCostsRepository.getByCompany(company)` | `FixedCostRepositoryApi.get()` |

#### Repositórios Dexie deletados (6)

| Arquivo | Motivo |
|---------|--------|
| `src/database/repositories/recibos.ts` | Não usado — páginas usam `RecibosRepositoryApi` |
| `src/database/repositories/insumos.ts` | Migrado para `InsumoRepositoryApi` |
| `src/database/repositories/assinatura.ts` | Não usado — páginas usam `SignatureRepositoryApi` |
| `src/database/repositories/audit.ts` | Não usado — páginas usam `AuditRepositoryApi` |
| `src/database/repositories/auditoria-recibos.ts` | Não usado — `EventoAuditoria` era tipo morto |
| `src/database/repositories/fixed-costs.ts` | Migrado para `FixedCostRepositoryApi` |

#### AuditRepository removido dos repositórios restantes

Os 4 repositórios Dexie ainda em uso importavam `AuditRepository` (deletado) para fazer client-side audit logging. Como o backend já audita via API, o código foi removido:

| Arquivo | Chamadas removidas |
|---------|-------------------|
| `src/database/repositories/transactions.ts` | `AuditRepository.log` em `create` e `update` |
| `src/database/repositories/cash-forecast.ts` | `AuditRepository.log` em `create`, `update`, `softDelete`, `markAsReceived`, `markAsPaid`, `markAsCancelled` |
| `src/database/repositories/trash.ts` | `AuditRepository.log` em `moveToTrash`, `restore`, `permanentlyDelete` |
| `src/database/repositories/users.ts` | `AuditRepository.log` em `softDelete` |

#### Schema Dexie v14 → v15

Tabelas removidas do `dexie.ts`:

| Tabela | Motivo |
|--------|--------|
| `auditLogs` | Não usada — audit é server-side via API |
| `recibos` | Não usada — páginas usam API |
| `eventosAuditoria` | Tipo `EventoAuditoria` removido (morto) |
| `configuracoesAssinatura` | Não usada — páginas usam API |
| `fixedCosts` | Migrado para API |
| `insumos` | Migrado para API |

#### Tipos removidos

| Arquivo | Tipo | Motivo |
|---------|------|--------|
| `src/types/index.ts` | `EventoAuditoria` | Só referenciado em arquivos Dexie deletados |

### Arquivos Alterados

| Arquivo | Mudança |
|---------|---------|
| `src/components/pricing/TechnicalSheetModal.tsx` | `InsumosRepository` → `InsumoRepositoryApi` |
| `src/app/pricing/page.tsx` | `FixedCostsRepository` → `FixedCostRepositoryApi` |
| `src/database/repositories/transactions.ts` | Remove `AuditRepository` import e chamadas |
| `src/database/repositories/cash-forecast.ts` | Remove `AuditRepository` import e chamadas |
| `src/database/repositories/trash.ts` | Remove `AuditRepository` import e chamadas |
| `src/database/repositories/users.ts` | Remove `AuditRepository` import e chamadas |
| `src/database/dexie.ts` | Bump v14→v15, remove 6 tabelas, limpa import |
| `src/types/index.ts` | Remove `EventoAuditoria` |

### Arquivos Deletados

| Arquivo |
|---------|
| `src/database/repositories/recibos.ts` |
| `src/database/repositories/insumos.ts` |
| `src/database/repositories/assinatura.ts` |
| `src/database/repositories/audit.ts` |
| `src/database/repositories/auditoria-recibos.ts` |
| `src/database/repositories/fixed-costs.ts` |

### Métricas

| Métrica | Valor |
|---------|-------|
| Arquivos alterados | 8 |
| Arquivos deletados | 6 |
| Schema Dexie | `14 → 15` |
| TypeScript check | 0 erros |
| Repositórios Dexie restantes | 9 (transactions, cash-forecast, categories, documentos, settings, trash, users, pricing, contas) |
