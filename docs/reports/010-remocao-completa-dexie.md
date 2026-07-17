# Sprint 10 — Remoção completa do Dexie

## Objetivo

Remover todos os repositórios Dexie restantes e migrar o último código que ainda dependia do IndexedDB para a API REST.

## O que foi feito

### Migrações Dexie → API

| Arquivo | Mudança |
|---------|---------|
| `app/recibos/page.tsx` | `TransactionRepository.create()` → `TransactionRepositoryApi.create()` |
| `hooks/useDocumentos.ts` | Fallback Dexie removido de `load()`, `useAguardandoCount`, `useDocumentoConfig` |
| `services/documentos/documentos.service.ts` | Fallback Dexie completo removido do `upload()` + `iniciarProcessamento` + `gerarResumoExecutivo` removidos |
| `services/documentos/documentos-aprendizado.service.ts` | `DocumentoAprendizadoRepository.getByChave()` → `DocumentoRepositoryApi.getAprendizado()` + `registrarAprendizado` removido |
| `app/pricing/page.tsx` | `seedDefaultCategories` removido (API já seeda) |
| `app/login/page.tsx` | `seedAll` removido (usuários gerenciados via API) |

### Repositórios Dexie deletados (8)

`cash-forecast.ts`, `categories.ts`, `documentos.ts`, `pricing.ts`, `settings.ts`, `transactions.ts`, `trash.ts`, `users.ts`

### Seed removido

`src/database/seed.ts`

### Testes corrigidos

- `documentos-service.test.ts` — removido spy de `iniciarProcessamento`, corrigido teste de `reprocessar` (1 argumento)

### Documentação atualizada

- `docs/todo.md` — seção "Dexie removido" adicionada
- `docs/frontend-todo.md` — Grupo A marcado como concluído, resumo atualizado (142/146 itens)
- `docs/backend-todo.md` — Grupo B marcado como concluído

## Resultado

- **TypeScript check:** `npx tsc --noEmit` → 0 erros
- **Dexie removido do código de produção:** nenhum arquivo em `src/` importa mais de `@/database/`
- **Arquivo `dexie.ts`** mantido (vazio, sem imports) — pode ser removido em limpeza futura junto com a dependência `dexie` do `package.json`

## Pendências gerais (fora do escopo Dexie)

- [ ] Onboarding interativo para novos usuários
- [ ] Backup e restauração
- [ ] Exportação para PDF
- [ ] Modo escuro programável (agendado)
