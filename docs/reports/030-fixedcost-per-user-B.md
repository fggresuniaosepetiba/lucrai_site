# 030 — FixedCosts: Company singleton → Per-user B

## Data: 2026-09-07
## Commits: 0a97977, 20260907201024_FixFixedCostPerUserIsolation

### Problema
`FixedCosts` era singleton por `Company` (`IX Company` único, `CreatedBy nullable`, filter `(null||current)`) — `QA prompts/testes-QA.md:124` reprovou: `lucrai PUT 7777 (43c6c99b) → fellype GET 7777` compartilhado.

### Opção escolhida: B (per-user)
- `FixedCost.cs:22` `CreatedBy string = "" IsRequired`
- `LucraiDbContext.cs:535` `HasIndex Company+CreatedBy unique` + `HasQueryFilter Company==CurrentCompany && CreatedBy==CurrentUserId` (strict, sem fallback null)
- `FixedCostRepository` per-user, `FixedCostsController PUT CreatedBy=UserId`
- Migration `20260907201024` `DELETE WHERE CreatedBy IS NULL/''` + `AlterColumn NOT NULL` + `CreateIndex unique`

### Teste prod
`lucrai GET 404 → PUT 1111 id 87173955 → fellype GET 404` / `fellype PUT 2222 id 9d3084fb → lucrai still 1111`; reset ambos `7140` com ids distintos. `docs/fix-isolamento-usuario.md:113` e `prompts/testes-QA.md:124 [x] PASS`.

### Nota
Original `per Company` fazia sentido contábil (custo da empresa). `B` foi escolhido a pedido para isolamento total; revert para `A` é só trocar filtro/índice.
