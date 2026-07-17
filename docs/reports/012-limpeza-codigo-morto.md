# Sprint 12 — Limpeza de código morto

## Objetivo

Remover código morto: API repositories, métodos e tipos que não têm mais consumidores no frontend.

## O que foi feito

### Arquivos deletados (2)

| Arquivo | Motivo |
|---------|--------|
| `src/services/api-repositories/audit.ts` | `AuditRepositoryApi` — zero consumidores (único import em `useIndicadores.ts` nunca era chamado) |
| `src/services/api-repositories/dashboard.ts` | `DashboardRepositoryApi` — zero consumidores, nunca importado por nenhuma página/hook |

### Métodos removidos de `IndicatorsRepositoryApi` (5)

`getRunway()`, `getHealth()`, `getSparkline()`, `getProjecoes()`, `getAuditLogs()` — todos duplicados do `DashboardRepositoryApi` (que também era morto) e sem chamadores.

### Tipos removidos

| Arquivo | Tipos |
|---------|-------|
| `src/types/index.ts` | `MonthlySummary`, `AuditAction`, `AuditLog` |
| `src/types/api.ts` | `ApiDashboardAlert`, `ApiHealthResponse`, `ApiRunwayResponse`, `ApiBreakEvenResponse`, `ApiSparklinePoint`, `ApiNotaCFOResponse`, `ApiAcaoRecomendada`, `ApiAuditLog` |

### Import morto removido

- `useIndicadores.ts`: `import { AuditRepositoryApi }` removido (nunca usado)

## Resultado

- **TypeScript check:** `npx tsc --noEmit` → 0 erros
- **16 API repositories → 14** (2 removidos)
- **Total de tipos em `api.ts`** reduzido em 8 interfaces mortas

## Pendências gerais

- Onboarding interativo para novos usuários
- Backup e restauração dos dados
- Exportação para PDF
- Modo escuro programável (agendado)
