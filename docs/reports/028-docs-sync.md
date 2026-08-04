# Sprint 28 — Sync da documentação com o codebase

## Objetivo

A documentação do projeto estava desatualizada em relação ao código real: ainda citava o Dexie/IndexedDB como camada ativa, contagens antigas (11 controllers, 83 testes, ~16 migrations) e não refletia os módulos novos (Documentos/OCR, Recibos, Pricing/Insumos, Inteligência Financeira, Financeiro Avançado, Landing/Cadastro). Esta sprint sincronizou os 8 documentos principais com o estado real do código.

## Estado real verificado no código (evidências)

- **Backend:** 24 controllers / 138 endpoints / 23 migrations / 87 testes xUnit / 25 entidades / 22 repositórios / 35 validators FluentValidation
- **Frontend:** 14 API repositories / 23 componentes shadcn/ui / 5 stores Zustand / 25 arquivos `page.tsx` em 23 rotas / 7 suítes Vitest / 6 specs Playwright
- **Dexie:** zero dependência no `package.json`, zero imports em `src/` (removido nas sprints 9–11)
- **Multi-tenancy:** `HasQueryFilter` em 23 de 25 entidades (`ApplyTenantFilters` em `LucraiDbContext.cs`), migrações `AddTenantQueryFilters` e `AddUserLevelIsolation`
- **Auth:** token em `sessionStorage` + refresh token rotativo + timeout de inatividade (15 min)
- **Segurança:** rate limiting e HTTPS/HSTS **não implementados** no código (registrado como ressalva)

## Documentos atualizados

| Arquivo | Principais correções |
|---|---|
| `docs/architecture.md` | Removida camada Dexie (diagrama + estrutura + seção IndexedDB); 24 controllers, 14 repos, 5 stores; multi-tenancy; rotas novas; PDF/OCR nas integrações |
| `docs/project-context.md` | Removido modo híbrido; stack real; módulos novos; entidades e diferenciais atualizados |
| `docs/backend-architecture.md` | 24 controllers, 23 migrations, 87 testes, 25 entidades, 22 repositórios, 35 validators; endpoints novos; Dockerfile/CI/compose reais; ressalvas de segurança |
| `docs/backend-todo.md` | Testes 83→87 (distribuição por arquivo); Grupo C financeiro avançado; totais ~200/0 |
| `docs/frontend-todo.md` | Referências Dexie ativas removidas; seções Inteligência Financeira, Recibos, Documentos, Landing & Cadastro; total 164 |
| `docs/categories-flow.md` | Removido fallback Dexie/IndexedDB |
| `docs/roadmap.md` | Concluídos: testes, landing, onboarding, inteligência financeira, ciclo financeiro, IA em documentos |
| `docs/decisions.md` | Dexie marcado removido; "100% client-side" → full-stack; ADRs novos (multi-tenancy, JWT rotativo, OCR/IA); pendentes atualizados |
| `docs/todo.md` | Adicionada seção Sprint 28; pendentes corrigidos |

## Validação

- Releitura dos 8 documentos após edição para conferir consistência das contagens e remoção de referências ativas ao Dexie.
- Não houve alteração de código de produção nesta sprint — apenas documentação.

## Arquivos modificados

| Arquivo | Ação |
|---|---|
| `docs/architecture.md` | Atualizado |
| `docs/project-context.md` | Atualizado |
| `docs/backend-architecture.md` | Atualizado |
| `docs/backend-todo.md` | Atualizado |
| `docs/frontend-todo.md` | Atualizado |
| `docs/categories-flow.md` | Atualizado |
| `docs/roadmap.md` | Atualizado |
| `docs/decisions.md` | Atualizado |
| `docs/todo.md` | Sprint 28 adicionada |
| `docs/reports/028-docs-sync.md` | Criado |

## Observação

As referências históricas ao Dexie nos relatórios de sprint (009–011) e no changelog foram **mantidas** propositalmente, pois são registros históricos do que foi feito. Apenas os documentos ativos (guia/contexto/arquitetura/todos) foram corrigidos para refletir o estado atual.
