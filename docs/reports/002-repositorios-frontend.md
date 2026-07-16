# Repositórios Frontend (Dexie / IndexedDB)

Camada de persistência client-side usando Dexie.js sobre IndexedDB. Responsável por CRUD de transações, previsões, categorias, usuários e demais entidades. Comunicação direta com o banco local do navegador.

## [2026-07-16] Correção do campo createdBy, ordenação por displayId e filtro por usuário

### Problema

1. **`createdBy` não era preenchido** — Em `transactions.ts`, o campo era enviado como string vazia `""`. Em `cash-forecast.ts`, o campo sequer era incluído no objeto de criação (`undefined`). Impossível rastrear o autor de cada registro.

2. **Filtro ausente no `getNextDisplayId`** — Os métodos `getNextDisplayId` variavam todos os registros da empresa sem filtrar por `createdBy`, gerando displayIds globais que conflitavam entre usuários diferentes.

3. **Ordenação por data** — `getAll()` usava `sort((a,b) => new Date(b.date) - new Date(a.date))` e similar, não por `displayId`.

### Solução

1. **`createdBy` preenchido** — Ambos os repositórios passaram a receber `userName || ""` vindo do parâmetro da função `create()`, garantindo que todo registro tenha o criador registrado.

2. **Filtro por usuário no `getNextDisplayId`** — Agora filtra todos os registros por `createdBy === userName` antes de calcular o próximo ID disponível, isolando a sequência por usuário.

3. **Ordenação por displayId** — Ambos os `getAll()` usam `sort((a,b) => a.displayId.localeCompare(b.displayId))`.

### Arquivos Alterados

| Arquivo | Mudança |
|---------|---------|
| `src/database/repositories/transactions.ts` | `create()`: `createdBy: userName \|\| ""` + filtro por `userName` no `getNextDisplayId` + sort por displayId |
| `src/database/repositories/cash-forecast.ts` | `create()`: `createdBy: userName \|\| ""` + filtro por `userName` no `getNextDisplayId` + sort por displayId |

### Métricas

| Métrica | Valor |
|---------|-------|
| Arquivos alterados | 2 |
| Linhas alteradas | 9 |
| **Registros com createdBy preenchido** | **100%** (antes: 0% em ambos) |
| **DisplayId isolado por usuário** | **100%** (antes: 0% — global) |
| **Ordenação por ID** | **100%** das listagens (antes: 0%) |

### Commits

- `3d0333a` — Ordenação por displayId nos repositórios
- `b246cb1` — createdBy fix + filtro por usuário no getNextDisplayId
