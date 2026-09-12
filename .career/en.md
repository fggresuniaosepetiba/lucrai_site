# LUCRAÍ — Career Assets (EN-US)

> Project: **LUCRAÍ** — a financial management SaaS for Brazilian SMBs (Digital CFO).
> Developed by a **two-person team** (2 authors). I was the **lead author** (156 of 211 commits, ~74%) — most of the backend, financial intelligence, documents/receipts modules, tests, and DevOps are my work. João Ribeiro (54 commits) contributed the initial frontend foundation and refinements.
> Based on: source code analysis, commits, tests, and docs (`docs/`, `docs/reports/001–028` + `029-031` hybrid/isolation). Nothing was invented — every item has file evidence.

---

## 1. Full-Stack Architecture & Design Patterns (Clean Architecture)

Name: Full-Stack Architecture and Design Patterns
Category: Architecture / Backend / Frontend

### Evidence found

- `backend/Lucrai.slnx` — solution with 3 projects (Lucrai.API, Lucrai.Core, Lucrai.Infrastructure) + tests
- `backend/src/Lucrai.Core/` — pure domain: 25 entities, DTOs, 22 repository interfaces + 2 service interfaces
- `backend/src/Lucrai.Infrastructure/` — EF Core (`Data/LucraiDbContext.cs`), 22 repositories, 24 migrations (`20260907201024_FixFixedCostPerUserIsolation`), Seed (`DataSeeder.cs:118-122` only reactivates `MustChangePassword` when hash is `123`)
- `backend/src/Lucrai.API/Program.cs` — DI with 25 registrations; `AddValidatorsFromAssemblyContaining<Program>()`
- `backend/src/Lucrai.API/Validators/` — 35 FluentValidation validators
- `src/services/api.ts` — HTTP client (Bearer, auto refresh, `ApiError`)
- `src/services/api-repositories/` — 14 frontend repositories (one per entity)
- `next.config.js` — `output: "standalone"` (container deploy)

### Resume

- Built a full-stack financial SaaS (LUCRAÍ) using Clean Architecture on the .NET 10 backend and layered architecture on the Next.js 15 frontend, as the lead developer in a two-person project.
- Designed a REST API with 24 controllers and 138 endpoints, applying the Repository Pattern (22 repositories) with centralized dependency injection.
- Implemented two-layer validation: zod + react-hook-form on the frontend and FluentValidation (35 validators) on the backend.

### STAR

Situation: The product needed to evolve from a local prototype into a multi-user SaaS with complex financial business rules.
Task: Build a scalable, testable backend decoupled from the frontend while keeping data consistent.
Action: Applied Clean Architecture (Core/Infrastructure/API), Repository Pattern with DI, DTOs, and FluentValidation; mirrored the pattern on the frontend with 14 API repositories over a shared HTTP client.
Result: Backend with 138 endpoints and 87 passing xUnit tests; a frontend fully decoupled from the API (provider swap without touching pages).

### XYZ

Accomplished: a 24-controller/138-endpoint REST API and a 100% API-integrated frontend,
By: separating domain (Core), infrastructure (EF Core), and presentation (API) with Repository Pattern and dependency injection,
Using: .NET 10, EF Core 10, PostgreSQL, FluentValidation, Next.js 15, TypeScript.

### Technologies

- .NET 10 / ASP.NET Core Web API
- EF Core 10 + Npgsql + PostgreSQL 16
- FluentValidation
- Next.js 15 (App Router) + React 19 + TypeScript 5.8
- zod + react-hook-form

### Skills

- Clean Architecture
- Repository Pattern
- Dependency Injection
- REST API design
- Two-layer validation
- Separation of concerns

### ATS Keywords

- Clean Architecture
- REST API
- Repository Pattern
- Dependency Injection
- .NET Core
- TypeScript
- Full Stack
- API Design

### Confidence

High — 100% confirmed by code.

---

## 2. Authentication & Security (JWT, Refresh Token, RBAC)

Name: Authentication and Security
Category: Security / Backend

### Evidence found

- `backend/src/Lucrai.API/Controllers/AuthController.cs` — login, register, refresh, logout, me, change-password (6 endpoints)
- `backend/src/Lucrai.Core/Entities/RefreshToken.cs` — `IsUsed`, `IsRevoked`, `ExpiresAt` (rotation)
- `backend/src/Lucrai.API/Program.cs` — `AddIdentity` + `AddAuthentication().AddJwtBearer()` + password policy
- `[Authorize(Roles = "Admin,Owner")]` in `UsersController.cs`, `AuditController.cs`, `ContasController.cs` (RBAC)
- `src/store/auth-store.ts` — tokens in `sessionStorage` (`lucrai-access-token`, `lucrai-refresh-token`)
- `src/services/api.ts` — automatic Bearer + 401 → refresh → retry interceptor
- `src/components/layout/InactivityTracker.tsx` — 15-minute inactivity timeout
- `src/app/trocar-senha/` — `mustChangePassword` flow
- Migrations: `AddUserPlanAndMustChangePassword`, `FixUserPlanAndMustChangePasswordDefaults`

### Resume

- Implemented JWT authentication with rotating refresh tokens (each use revokes the previous token) and ASP.NET Identity with PBKDF2 hashing.
- Implemented RBAC with roles (owner/admin/financial/viewer) protecting sensitive routes via `[Authorize(Roles)]`.
- Hardened the frontend session: tokens in `sessionStorage` (closing the tab logs out), a 15-minute inactivity timeout, and a mandatory change-password flow on first login.

### STAR

Situation: The system required secure authentication for a multi-tenant SaaS with users of different access levels.
Task: Provide robust login/logout, session renewal, and role-based access control.
Action: Combined ASP.NET Identity (PBKDF2) with JWT Bearer and an opaque rotating refresh token stored in the database; protected controllers with `[Authorize]` and RBAC; on the frontend moved the token to `sessionStorage` and added an inactivity timeout.
Result: More secure sessions (token expires when the tab closes; refresh revokes the previous one) and granular permission control across roles.

### XYZ

Accomplished: sessions with secure renewal and revocation of old tokens,
By: implementing rotating refresh tokens, RBAC via attributes, and `sessionStorage` tokens with an inactivity timeout,
Using: ASP.NET Core Identity, JWT Bearer, .NET 10, Next.js, Zustand.

### Technologies

- ASP.NET Core Identity (PBKDF2)
- JWT Bearer + rotating Refresh Token
- RBAC (`[Authorize(Roles)]` attributes)
- sessionStorage / localStorage
- Zustand (auth store)

### Skills

- Authentication & authorization
- Session management
- Web application security
- Route protection

### ATS Keywords

- JWT
- RBAC
- Authentication
- Authorization
- Refresh Token
- Security
- Session Management

### Confidence

High — confirmed by code and tests (`AuthControllerTests`, 8 tests).

---

## 3. Multi-tenancy & Data Isolation

Name: Multi-tenancy and Data Isolation (company + user)
Category: Security / Backend / Database

### Evidence found

- `backend/src/Lucrai.API/Middleware/TenantContextMiddleware.cs` — extracts Company/User from JWT
- `backend/src/Lucrai.Core/Interfaces/ITenantContext.cs` — scoped context
- `backend/src/Lucrai.Infrastructure/Data/LucraiDbContext.cs:535-559` — `ApplyTenantFilters()` with `HasQueryFilter` on **23 of 25 entities** (`FixedCost` migrated to `Company+CreatedBy` unique `IsRequired` in `20260907201024`, previously `Company` singleton `43c6c99b`)
- Migrations: `AddTenantQueryFilters`, `AddUserLevelIsolation`, `AddCreatedByFields`, `FixFixedCostPerUserIsolation (B per-user)`
- `backend/tests/Lucrai.API.Tests/Controllers/ReciboIsolationTests.cs` — 4 isolation tests + `prompts/testes-QA.md:120` prod validation `lucrai.adm/fellype.gabriel` `FixedCosts 87173955 vs 9d3084fb` isolated
- `docs/reports/018-multi-tenant-security.md`, `019-tenant-security-query-filters-fix.md`, `013-fix-cross-tenant-trash-cleanup.md` — isolation security fixes
- `docs/fix-isolamento-usuario.md:113-200` — `FixedCosts` per-user `B` + zeramento `lucrai.adm/joao.ribeiro 123 MustChangePassword true` via `PasswordHasher` + `DELETE RefreshTokens` (Neon `ep-proud-base-aci4mfda`)

### Resume

- Designed and implemented multi-tenant isolation with EF Core global query filters (`HasQueryFilter`) on 23 entities, ensuring each company and each user can only access their own data.
- Implemented middleware (`TenantContextMiddleware`) that extracts tenant and user from the JWT, avoiding reliance on client-supplied parameters.
- Added user-level isolation (`CreatedBy`) and validated it with 4 dedicated integration tests (`ReciboIsolationTests`), including fixes for critical isolation gaps documented in sprint reports.

### STAR

Situation: A security audit revealed isolation gaps between companies and users (reports 013/018/019).
Task: Guarantee isolation at the database level, not by remembering it in every controller.
Action: Centralized isolation in `ApplyTenantFilters()` in the DbContext (23 entities), added user-level isolation (`CreatedBy`), and covered it with dedicated integration tests.
Result: Isolation applied automatically to every query; 4 isolation tests passing and critical gaps fixed.

### XYZ

Accomplished: data 100% isolated between companies and between users,
By: centralizing global filters in the DbContext, extracting the tenant from the JWT via middleware, and covering it with tests,
Using: EF Core `HasQueryFilter`, .NET 10, JWT, xUnit + WebApplicationFactory.

### Technologies

- EF Core Global Query Filters
- ASP.NET Core Middleware
- JWT claims
- xUnit / WebApplicationFactory
- PostgreSQL

### Skills

- Multi-tenancy
- Data isolation
- Data security
- Integration testing

### ATS Keywords

- Multi-tenant
- Multi-tenancy
- Data Isolation
- Query Filters
- Security
- EF Core
- Integration Testing

### Confidence

High — code + 4 isolation tests.

---

## 4. Financial Intelligence & Digital CFO

Name: Financial Intelligence and Digital CFO
Category: Backend / Frontend / Data Analysis

### Evidence found

- `backend/src/Lucrai.Core/Services/DashboardIntelligenceService.cs` — 12-month projection, runway, break-even, health score, sparkline, CFO note, recommended actions (12 tests)
- `backend/src/Lucrai.Core/Services/AlertasService.cs` — 6 alert types + insights + dismiss/restore (8 tests)
- `backend/src/Lucrai.API/Controllers/DashboardController.cs` — 13 endpoints (projection, runway, breakeven, health, alerts, sparkline, nota-cfo, recommended-actions, dismiss/restore)
- `backend/src/Lucrai.Core/Entities/DismissedAlert.cs` + migration `AddDismissedAlert`
- `src/app/dashboard/indicadores/`, `resumo-cfo/`, `projecoes/`, `alertas/` — 4 routes
- `src/services/api-repositories/indicators.ts`
- `src/hooks/__tests__/useAlertsCount.test.ts`

### Resume

- Built a financial intelligence engine on the backend: 12-month projection, cash runway calculation, break-even point, a 0–100 health score, and an executive (CFO) note generated in natural language.
- Implemented an intelligent alert system with 6 types (negative balance, margin drop, costs above revenue, anomaly spike, delinquency + positive insights) with dismiss/restore actions.
- Built the Financial Intelligence Center in the frontend with 10 sub-tabs (P&L, cash flow statement, trial balance, ledger, balance sheet, etc.) consuming the API.

### STAR

Situation: The product needed to deliver value beyond CRUD — to act as a "Digital CFO" that interprets the data.
Task: Compute executive metrics and communicate them simply.
Action: Implemented pure domain services in Core (projection, runway, break-even, health, CFO note, recommended actions) and an alert service with 6 types, exposed via 13 endpoints and consumed by 4 screens.
Result: A panel with health score, projections, and prioritized alerts; 22 dedicated tests validating the calculations.

### XYZ

Accomplished: an executive financial intelligence panel (CFO note, 0–100 health, projections, alerts),
By: implementing pure domain services with financial calculations and exposing them via REST,
Using: .NET 10, C#, Next.js, Recharts, xUnit.

### Technologies

- C# / .NET 10 (domain services)
- REST API
- Next.js + Recharts
- xUnit

### Skills

- Computational financial analysis
- CFO methodology
- Turning data into insights
- Financial algorithm design (runway, break-even)

### ATS Keywords

- Financial Intelligence
- KPI
- Financial Metrics
- CFO Dashboard
- Business Intelligence
- Data Analysis
- Algorithms

### Confidence

High — code + 22 tests.

---

## 5. Core Finance Module (Transactions + Cash Forecast)

Name: Core Finance Module (Transactions and Cash Forecast)
Category: Backend / Frontend

### Evidence found

- `backend/src/Lucrai.API/Controllers/TransactionsController.cs` (10 endpoints) and `CashForecastsController.cs` (10 endpoints)
- `backend/src/Lucrai.Infrastructure/Repositories/TransactionRepository.cs`, `CashForecastRepository.cs` — sequential DisplayId, forecast→transaction bridge
- `src/components/financial/transaction-form.tsx` — BRL mask, value-by-extenso, future-date blocking
- `src/app/financial/page.tsx`, `src/app/cash-forecast/page.tsx`
- `src/lib/__tests__/utils.test.ts` — `formatCurrency`, `valorPorExtenso`, `getNextDisplayId`
- `docs/reports/001-sistema-display-id.md`, `005-calendar-datepicker.md`, `016-bloquear-datas-futuras-financeiro.md`

### Resume

- Developed the core financial module: transactions and cash-flow forecasts with sequential display IDs (#001, #002), value-by-extenso in Portuguese, and BRL currency formatting.
- Implemented the "forecast → transaction" bridge: marking a forecast as received/paid automatically creates the linked real transaction.
- Implemented date business rules (blocking future dates in finance, max 10 years in forecasts) and CSV export.

### STAR

Situation: We needed a reliable, friendly transaction module for Brazilian users.
Task: Build financial CRUD with readable identifiers and business validation.
Action: Implemented per-company sequential display IDs, real-time currency mask, automatic value-by-extenso, date restrictions, and the automatic forecast→transaction bridge.
Result: Transactions with friendly IDs (#001), no inconsistency between forecasted and actual values, and two-layer validation.

### XYZ

Accomplished: a complete, intuitive financial module,
By: applying sequential display IDs, currency masks, value-by-extenso, and date rules in two layers,
Using: .NET 10, EF Core, Next.js, date-fns, react-hook-form, zod.

### Technologies

- .NET 10 / EF Core / PostgreSQL
- Next.js 15 / TypeScript
- date-fns, react-day-picker
- react-hook-form + zod

### Skills

- CRUD and business rules
- Financial data UX
- Form validation
- pt-BR localization

### ATS Keywords

- CRUD
- Financial Management
- Cash Flow
- Form Validation
- Business Rules

### Confidence

High — code + tests.

---

## 6. Trash / Soft Delete with TTL

Name: Trash System (Soft Delete with TTL)
Category: Backend

### Evidence found

- `backend/src/Lucrai.API/Controllers/TrashController.cs` — list, restore, permanent delete, cleanup (4 endpoints)
- `backend/src/Lucrai.Core/Entities/DeletedItem.cs` — `RestoreUntil` (30-day TTL)
- `backend/src/Lucrai.Infrastructure/Repositories/TrashRepository.cs`
- Migrations: `FixDeletedItemTimestampColumns`, `AddCreatedByToDeletedItem`
- `src/app/trash/page.tsx` — countdown and expiry badges
- `docs/reports/006-sistema-exclusao.md`, `013-fix-cross-tenant-trash-cleanup.md`

### Resume

- Implemented a safe-delete system (soft delete) with a 30-day TTL, restore and permanent delete, with automatic cleanup of expired items.
- Ensured trash isolation per tenant/user (fixed a cross-tenant leak documented in report 013).

### STAR

Situation: Permanent deletes caused accidental loss of financial data.
Task: Create a reversible, time-limited deletion mechanism.
Action: Implemented soft delete with a snapshot in `DeletedItem` and a 30-day TTL, restore/permanent-delete/cleanup endpoints, and company isolation.
Result: Data recoverable for up to 30 days, with no loss from accidental deletes.

### XYZ

Accomplished: deletes reversible for 30 days,
By: implementing soft delete with TTL, restore, and automatic cleanup with tenant isolation,
Using: EF Core, .NET 10, PostgreSQL, Next.js.

### Technologies

- EF Core
- .NET 10
- PostgreSQL
- Next.js

### Skills

- Soft delete
- Data recovery
- Retention rules (TTL)

### ATS Keywords

- Soft Delete
- Data Recovery
- TTL
- Data Retention

### Confidence

High — code + tests (`TrashControllerTests`).

---

## 7. Document Center with OCR and AI

Name: Document Center with OCR/AI and Review Flow
Category: Frontend / Backend / AI

### Evidence found

- `backend/src/Lucrai.API/Controllers/DocumentosController.cs` (14 endpoints), `DocumentoAprendizadoController.cs` (3), `DocumentoConfigController.cs` (2)
- `backend/src/Lucrai.Core/Entities/` — `DocumentoFinanceiro`, `DocumentoAprendizado`, `DocumentoConfiguracao`, `DocumentoLog`, `DocumentoTrashItem`
- Migrations: `AddDocumentoFinanceiro`, `AddDocumentoLogAprendizadoConfig`
- `src/services/documentos/documentos-extracao.service.ts` — pdfjs-dist, tesseract.js (`por`), `DOMParser` for NF-e XML, OpenAI `gpt-4o` and Google Gemini with a no-AI fallback
- `src/services/documentos/parser/danfe-parser.ts` — DANFE parser
- `src/services/documentos/documentos.service.ts` — orchestration (confirm creates transaction/forecast)
- `src/app/documentos/**` — list, detail, review, settings
- 3 Vitest suites for documents (API, service, NF-e XML parsing)

### Resume

- Built a fiscal document center with client-side automatic data extraction: PDF text (pdfjs-dist), Portuguese OCR for images (tesseract.js), and NF-e parsing from XML (DOMParser) and DANFE.
- Integrated vision AI providers (OpenAI GPT-4o and Google Gemini) for document data extraction, with a no-AI fallback.
- Implemented a review flow (confirm/reject/reprocess) that generates financial records from the document, with supplier learning and per-company configuration.

### STAR

Situation: Manually posting invoices was slow and error-prone.
Task: Automate document data extraction and financial posting.
Action: Implemented multi-engine extraction (PDF, pt-BR OCR, NF-e XML, DANFE) and vision AI with fallback; built a review flow that auto-generates transactions/forecasts and learns supplier patterns.
Result: Documents processed with pre-filled data, human review, and automatic posting, with extraction and parser tests.

### XYZ

Accomplished: fiscal document extraction and posting without manual typing,
By: combining OCR, XML/PDF parsing, vision AI, and a review workflow,
Using: tesseract.js, pdfjs-dist, OpenAI API, Gemini API, Next.js, .NET.

### Technologies

- Tesseract.js (pt-BR OCR)
- pdfjs-dist
- DOMParser (XML)
- OpenAI API (GPT-4o Vision)
- Google Gemini API
- .NET 10 / Next.js 15

### Skills

- OCR and data extraction
- AI API integration
- XML parsing (NF-e)
- Process automation

### ATS Keywords

- OCR
- Computer Vision
- OpenAI
- Gemini
- Document Management
- Data Extraction
- XML Parsing
- AI Integration

### Confidence

High — code + 3 document test suites.

---

## 8. Intelligent Pricing

Name: Intelligent Pricing (Inputs, Fixed Costs, and Margins)
Category: Backend / Frontend / Business Rules

### Evidence found

- `backend/src/Lucrai.API/Controllers/PricingController.cs` (5 endpoints), `InsumosController.cs` (5), `FixedCostsController.cs` (2)
- `backend/src/Lucrai.Core/Entities/` — `PricingProduct`, `Insumo`, `FixedCost`
- Migrations: `AddInsumos`, `AddFixedCosts`
- `src/services/api-repositories/pricing.ts`, `insumos.ts`, `fixed-costs.ts`
- `src/app/pricing/`, `src/app/pricing/insumos/`, `src/app/pricing/fixed-costs/`

### Resume

- Developed a pricing module that computes minimum/healthy/premium prices from inputs (with automatic unit conversion kg↔g, L↔ml) and fixed costs.
- Implemented discount simulation, 10–50% margins, payment methods (PIX/debit/credit/installments), and unit/batch production, including owner compensation (pró-labore).

### STAR

Situation: Micro-entrepreneurs struggled to price products with a proper margin.
Task: Build a tool that computes price from real costs.
Action: Implemented CRUD for inputs with unit conversion, fixed costs, and automatic price calculation (minimum/healthy/premium), discount simulation, and payment methods.
Result: A cost-based pricing tool with 12 backend endpoints.

### XYZ

Accomplished: automatic selling-price calculation with a healthy margin,
By: modeling inputs, fixed costs, and payment scenarios,
Using: .NET 10, EF Core, Next.js, TypeScript.

### Technologies

- .NET 10 / EF Core
- Next.js / TypeScript

### Skills

- Pricing business rules
- Unit conversion
- Cost analysis

### ATS Keywords

- Pricing
- Cost Analysis
- Margin Calculation
- Business Rules
- Inventory

### Confidence

High — code + pricing tests.

---

## 9. Receipts, Digital Signature, and PDF

Name: Receipt Issuance with Digital Signature and PDF
Category: Frontend / Backend

### Evidence found

- `backend/src/Lucrai.API/Controllers/RecibosController.cs` (10 endpoints), `SignatureController.cs` (2)
- `backend/src/Lucrai.Core/Entities/Recibo.cs` (with soft delete), `SignatureConfig.cs`
- Migrations: `AddSignatureConfig`, `AddRecibos`, `AddSoftDeleteToRecibo`
- `src/services/recibos/reciboPdfService.ts` — PDF generation (jsPDF + html2canvas, A4)
- `src/services/recibos/cpfCnpjValidator.ts` (checksum), `valorPorExtenso.ts`, `gerarNumeroRecibo.ts` (`REC-{year}-######`)
- `backend/tests/Lucrai.API.Tests/Controllers/ReciboIsolationTests.cs` — 4 tests
- `src/services/recibos/__tests__/recibos.test.ts`

### Resume

- Developed a receipts module with sequential numbering `REC-{year}-######`, CPF/CNPJ checksum validation, value-by-extenso, and cancellation with reason.
- Implemented digital signature (image upload + responsible person) and A4 PDF generation in the browser (jsPDF + html2canvas).
- Implemented soft delete and tenant/user isolation for receipts, validated by 4 integration tests.

### STAR

Situation: Small service providers needed to issue professional receipts with signatures.
Task: Create receipt issuance with numbering, fiscal validation, and PDF.
Action: Implemented receipt CRUD with sequential numbering, CPF/CNPJ validation, digital signature, cancellation with reason, and browser-based PDF generation.
Result: Professional receipts issued in seconds, with PDF and signature, and isolation guaranteed by tests.

### XYZ

Accomplished: professional receipt issuance with signature and PDF,
By: implementing sequential numbering, document validation, and client-side PDF generation,
Using: .NET 10, Next.js, jsPDF, html2canvas.

### Technologies

- jsPDF / html2canvas
- Next.js / TypeScript
- .NET 10 / EF Core
- CPF/CNPJ validation (checksum)

### Skills

- PDF generation
- Brazilian document validation
- Digital signature (concept)
- Sequential numbering

### ATS Keywords

- PDF Generation
- Receipts / Invoicing
- Digital Signature
- CPF / CNPJ
- Fiscal Compliance

### Confidence

High — code + 4 isolation tests + Vitest suite.

---

## 10. Advanced Finance (Payables/Receivables, Debts, Investments)

Name: Advanced Finance (backend)
Category: Backend / Database

### Evidence found

- `backend/src/Lucrai.API/Controllers/AccountsPayableController.cs`, `AccountsReceivableController.cs`, `DebtsController.cs`, `InvestmentsController.cs`, `BalanceAccountsController.cs` (6 endpoints each)
- `backend/src/Lucrai.Core/Entities/` — `AccountPayable`, `AccountReceivable`, `Debt`, `Investment`, `BalanceAccount`
- Migration: `AddFinancialEntities`
- `src/services/api-repositories/indicators.ts` — consumes `/api/debts/summary` and `/api/investments/summary`
- Validators: `AccountPayableValidators`, `AccountReceivableValidators`, `DebtValidators`, `InvestmentValidators`, `BalanceAccountValidators`

### Resume

- Modeled and implemented on the backend accounts payable/receivable with aging buckets (30/60/90 days), delinquency, and average payment terms.
- Implemented a debts module (net debt, leverage) and an investments module with ROI, IRR, NPV, and payback metrics, plus a chart of accounts (balance sheet grouped by Assets/Liabilities/Equity).
- Note: dedicated frontend pages for these modules are still in progress — the API is already partially consumed by the indicators center.

### STAR

Situation: The cash system needed to evolve into complete financial management (beyond cash flow).
Task: Add advanced corporate finance modules.
Action: Modeled 5 entities and 5 controllers with aging, debt and investment metrics, and a chart of accounts, all with validation and DI.
Result: Backend ready for payables/receivables, debts, investments, and balance sheet — the foundation for upcoming screens.

### XYZ

Accomplished: a corporate finance layer (payables/receivables, debts, investments, balance sheet),
By: modeling entities, repositories, validators, and REST endpoints,
Using: .NET 10, EF Core, PostgreSQL, FluentValidation.

### Technologies

- .NET 10 / EF Core / PostgreSQL
- FluentValidation

### Skills

- Corporate finance (accounting)
- Financial metrics (ROI, IRR, NPV, payback)
- Database modeling

### ATS Keywords

- Accounts Payable
- Accounts Receivable
- Debt Management
- Investments
- ROI
- IRR
- NPV
- Balance Sheet

### Confidence

Medium — backend 100% confirmed; dedicated frontend still in progress (partial consumption via indicators).

---

## 11. Testing & Quality

Name: Automated Testing and Quality
Category: Testing / QA

### Evidence found

- `backend/tests/Lucrai.API.Tests/` — **87 tests** `[Fact]` across 14 files (controllers + services)
- `CustomWebApplicationFactory.cs` — `WebApplicationFactory<Program>` + InMemory + test JWT
- `src/**/__tests__/` — **7 Vitest suites** (utils, hooks, documents, receipts)
- `e2e/` — **6 Playwright specs** with mocked API (`e2e/helpers.ts`)
- `.github/workflows/ci.yml` — 3 jobs: backend build+test, frontend lint+build, docker validation
- `vitest.config.ts`, `playwright.config.ts`

### Resume

- Wrote 87 backend integration/unit tests (xUnit + WebApplicationFactory + InMemory + Moq), including multi-tenant isolation tests.
- Wrote 7 frontend unit test suites (Vitest) covering utils, hooks, and document/receipt services.
- Set up 6 Playwright E2E flows (login, transactions, forecasts, trash, categories) and a CI pipeline with 3 jobs running build, tests, and Docker image validation.

### STAR

Situation: A financial SaaS could not silently regress on critical rules (calculations, isolation, authentication).
Task: Create an automated safety net at every level.
Action: Implemented unit and integration tests on the backend (including isolation), hook/util tests on the frontend, E2E flows with a mocked API, and a 3-job CI.
Result: 87 + 7 + 6 tests covering critical rules, running automatically on every push.

### XYZ

Accomplished: reliability with automated tests in 3 layers,
By: writing unit/integration/E2E tests and automating them in CI,
Using: xUnit, Moq, WebApplicationFactory, Vitest, Playwright, GitHub Actions.

### Technologies

- xUnit / Moq / WebApplicationFactory
- Vitest
- Playwright
- GitHub Actions

### Skills

- Automated testing
- Integration testing
- E2E testing
- CI/CD

### ATS Keywords

- Unit Testing
- Integration Testing
- E2E Testing
- xUnit
- Vitest
- Playwright
- Test Automation
- Quality Assurance

### Confidence

High — counts confirmed in the repository.

---

## 12. DevOps & CI/CD

Name: DevOps, Docker, and Deployment (CI/CD)
Category: DevOps

### Evidence found

- `.github/workflows/ci.yml:59-82` — 3 jobs (backend `dotnet 10 build/test`, frontend `node 22 lint/build`, docker `buildx validate` `push:false`)
- `docker-compose.yml:1-60` — hybrid `postgres:16-alpine 5433:5432 pgdata health pg_isready` + `api 5000→8080 health curl /api/health` + `web 3000` `profiles: [full]` (`Neon` `ep-proud-base-aci4mfda` in prod)
- `backend/src/Lucrai.API/Dockerfile:1-19` — multi-stage `sdk:10 → aspnet:10` port `${PORT:-8080}` `DOTNET_USE_POLLING_FILE_WATCHER` (Render Free)
- `frontend.Dockerfile:2-29` — `node:22-alpine@sha256` digest, non-root `nextjs:1001`, `HEALTHCHECK wget`, `standalone` (`ARG NEXT_PUBLIC_API_URL`)
- `render.yaml` + `docs/deploy-guide.md:42-53` — `Render` `lucrai-site.onrender.com` (Docker) + `Vercel` `lucrai-site.vercel.app` (`Neon` `neondb` shared) — `Railway` discontinued
- `scripts/ensure-docker.ts` — cross-platform guard (`LUCRAI_DOCKER_MODE`: check/auto/skip)
- `scripts/wait-for-db.ts` — waits for PostgreSQL readiness
- `backend/src/Lucrai.API/Controllers/HealthController.cs` — `GET /api/health`
- `next.config.js` — `output: "standalone"`

### Resume

- Set up multi-stage Docker for the backend (.NET 10) and frontend (Next.js standalone `output:"standalone"` with digest-pinned base, non-root user and healthcheck), with hybrid docker-compose `postgres local + Neon prod` profiles.
- Automated hybrid deploys `Render (API Docker) + Vercel (FE) + Neon (PG)` (`render.yaml` + `docs/deploy-guide.md:6-11`) and 3-job CI with `buildx` `push:false`; `docs/estudo-docker-postgres-hibrido.md` with 7-level track.
- Developed TypeScript dev automation scripts: a cross-platform Docker guard (check/auto/skip modes) and a database readiness waiter.

### STAR

Situation: Teams needed a consistent local environment and automated deploys.
Task: Standardize development and deployment.
Action: Created compose profiles, hardened Dockerfiles (non-root, healthcheck, digest pin), a TS Docker guard, a DB waiter, Railway deploy scripts, and a 3-job CI.
Result: A consistent local environment (postgres via compose) and automatic Railway deploys on push to `main`.

### XYZ

Accomplished: standardized, automated dev and deploy environments,
By: creating hardened Dockerfiles, compose profiles, TS scripts, and a 3-job CI,
Using: Docker, docker-compose, GitHub Actions, Railway CLI, Node/TypeScript.

### Technologies

- Docker / docker-compose
- GitHub Actions
- Railway / Vercel
- TypeScript (CLI scripts)

### Skills

- Containerization
- CI/CD
- Environment automation
- Cloud deployment

### ATS Keywords

- Docker
- Docker Compose
- CI/CD
- GitHub Actions
- Railway
- DevOps
- Cloud Deployment
- Infrastructure

### Confidence

High — config files confirmed.

---

## 13. UI/UX & SaaS Product

Name: UI/UX, Landing Page, and Onboarding
Category: UI/UX / Frontend

### Evidence found

- `src/components/landing/` — 17 components (13 sections: hero, features, comparison, results, testimonials, pricing, consulting, security, FAQ, CTA)
- `src/components/ui/` — 23 shadcn/ui components (Radix UI, accessible)
- `src/store/theme-store.ts` — 2 themes (normal, dark-mega) via ~30 CSS vars each
- `src/components/cadastro/CadastroForm.tsx` — multi-step onboarding (2 steps) + `PasswordStrength`
- `src/utils/trial.ts` — 14-day trial
- `src/app/globals.css` — theme CSS variables, `prefers-reduced-motion`, visible focus

### Resume

- Built an institutional landing page with 13 sections and conversion-focused copy for the Brazilian SMB audience.
- Implemented a multi-step onboarding signup with a password-strength indicator and a 14-day trial.
- Developed a theming system with 2 variants (dark and ultra-dark) via CSS variables, a collapsible sidebar, accessible components (shadcn/ui + Radix), and micro-interactions (skeletons, toasts).

### STAR

Situation: The product needed to convert visitors and reduce friction at account creation.
Task: Build an institutional presence and a smooth onboarding.
Action: Implemented a 13-section landing page, multi-step onboarding with password-strength validation and a 14-day trial, plus the theming system and accessible components.
Result: A complete conversion path (landing → signup → trial) and a consistent interface with 2 themes.

### XYZ

Accomplished: institutional presence and conversion-oriented onboarding,
By: building a 13-section landing, multi-step signup, and a 2-variant theming system,
Using: Next.js, Tailwind CSS, shadcn/ui, Radix UI, Zustand.

### Technologies

- Next.js 15 / Tailwind CSS 3.4
- shadcn/ui / Radix UI
- Zustand (theme)
- CSS variables

### Skills

- UI/UX design
- Landing page / copywriting
- Onboarding / product-led growth
- Accessibility (WAI-ARIA)
- Design system

### ATS Keywords

- UI/UX
- Landing Page
- Onboarding
- Design System
- Tailwind CSS
- Accessibility
- Responsive Design
- Product-led Growth

### Confidence

High — components and pages confirmed.

---

# Technologies mastered

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript 5.8 (strict), Tailwind CSS 3.4, shadcn/ui, Radix UI, Zustand 5, react-hook-form, zod, Recharts, date-fns, jsPDF, html2canvas, tesseract.js, pdfjs-dist
- **Backend:** .NET 10, ASP.NET Core Web API, EF Core 10 (24 migrations), Npgsql, ASP.NET Core Identity (PBKDF2), JWT + rotating Refresh Token
- **Database:** PostgreSQL 16 (Neon/Railway), EF Core migrations
- **Testing:** Vitest, Playwright
- **DevOps:** Multi-stage Docker, hybrid docker-compose, GitHub Actions (buildx), Render (Docker), Vercel, Neon (managed Postgres)
- **AI:** OpenAI API (GPT-4o Vision), Google Gemini API

# Concepts demonstrated

- Clean Architecture
- Repository Pattern
- Dependency Injection
- REST API
- JWT + Refresh Token Rotation
- RBAC
- Multi-tenancy (Global Query Filters)
- SOLID
- Soft Delete with TTL
- Two-layer validation
- State Management (Zustand)
- Custom Hooks
- OCR / data extraction
- Vision AI integration
- Three-layer testing (unit, integration, E2E)
- CI/CD
- Accessibility (WAI-ARIA)
- Responsiveness

# Tools used

- Git / GitHub
- GitHub Actions
- Docker / Docker Compose
- Railway CLI
- Vercel
- .NET CLI / dotnet
- Next.js CLI / npm
- ESLint
- TypeScript compiler (tsc)
- Vitest / Playwright
- tsx (TS scripts)

# Architectures identified

- Clean Architecture (backend: Core / Infrastructure / API)
- Layered / Controller-Service-Repository
- Repository Pattern
- Multi-tenant shared database (single DB + Company/User filters)
- Client-Server with REST API
- Frontend: feature-based + API repository layer

---

# Executive Summary (max 10 bullets)

1. Built a **financial management SaaS** (LUCRAÍ) full-stack with Next.js 15/React/TypeScript + .NET 10/EF Core/hybrid PostgreSQL (Neon), as the lead author in a two-person team (156 of 211 commits, 74%).
2. Designed a **REST API with 24 controllers and 138 endpoints** in Clean Architecture, with 22 repositories, 24 migrations, DI, and 35 FluentValidation validators.
3. Implemented **JWT authentication with rotating refresh tokens** (`MustChangePassword` + `POST /api/auth/change-password 200`), RBAC, and **multi-tenant isolation** via EF Core global query filters on 23 entities (company + user; exceptions `DismissedAlert` only `Company`, `Category CreatedBy=""`) + `FixedCosts` per-user `B`, with isolation tests.
4. Built a **financial intelligence engine**: 12-month projection, cash runway, break-even, 0–100 health score, natural-language CFO note, and 6 alert types.
5. Implemented a **document center with OCR** (Tesseract pt-BR), NF-e XML/DANFE parsing, and **AI extraction** (OpenAI GPT-4o and Gemini), with a review workflow.
6. Built **receipt issuance** with sequential numbering, CPF/CNPJ validation, digital signature, and **browser-generated PDF** (jsPDF).
7. Implemented **intelligent pricing** (inputs with unit conversion, fixed costs, margins, discount simulation) and advanced finance (aging, debts, investments) on the backend.
8. Wrote **87 xUnit tests**, 7 Vitest suites, and 6 Playwright flows, with a **3-job CI** (build, tests, Docker image validation).
9. Set up **hybrid Docker (compose profiles `postgres local` + Neon `neondb` + Render `lucrai-site.onrender.com` Docker + Vercel FE), hardened Dockerfiles (`PORT` dynamic, `HEALTHCHECK`, `digest pin`) and 3-job CI (`buildx`)**, plus TypeScript dev automations.
10. Delivered a **complete SaaS product**: 13-section landing, multi-step onboarding with trial, 2 themes, full audit trail, and TTL soft delete.

---

# Focused Summaries

## Frontend

- Interfaces in **React 19 + Next.js 15 (App Router) + strict TypeScript**, with 23 accessible shadcn/ui/Radix components.
- State management with **Zustand** (sessionStorage/localStorage persistence) and forms with **react-hook-form + zod**.
- **Client-side OCR and AI extraction** (pdfjs, tesseract.js, OpenAI/Gemini) and **PDF generation** (jsPDF/html2canvas).
- Tested with **Vitest (7 suites) and Playwright (6 E2E flows)**; charts with Recharts; 2 themes via CSS variables.

## Backend

- **REST API in .NET 10** with 24 controllers/138 endpoints, Clean Architecture (Core/Infrastructure/API).
- **EF Core 10 + PostgreSQL 16** with 23 migrations and **multi-tenancy global filters** on 23 entities.
- **JWT auth + rotating refresh (Identity/PBKDF2)**, RBAC, and 35 FluentValidation validators.
- **87 xUnit tests** (WebApplicationFactory + InMemory + Moq), including isolation.
- Domain services: financial intelligence (runway, break-even, health score, CFO note) and alerts.

## Full Stack

- End-to-end across all layers: data modeling (25 entities, 23 migrations), API (138 endpoints), frontend consumption (14 API repositories), and testing (unit + integration + E2E).
- Complete flows implemented: auth, multi-tenancy, finance, forecasts, trash, AI documents, receipts, pricing.

## SaaS

- **Real multi-tenancy** (company + user), RBAC, full audit trail, TTL soft delete, onboarding with trial, and secure sessions.
- SaaS deployment architecture: Docker, Railway, Vercel, and automated CI/CD.

## International

- Product with Brazilian-market copy and rules (NF-e, DANFE, CPF/CNPJ, PIX, value-by-extenso, BRL) — ready for an international fintech portfolio.
- Technical docs in pt-BR; career assets available in EN-US (see this file).

## Startup

- Complete MVP delivered with a well-defined scope, sprint-based evolution (27 documented sprints), fast prototyping, and conversion focus (landing, onboarding, trial).
- Dev automations (Docker guard, wait-for-db, deploy scripts) that reduce onboarding cost for new developers.

---

# Job compatibility

| Role type | Justification |
|---|---|
| **Frontend React / TypeScript** | React 19, Next.js 15, strict TypeScript, Tailwind, shadcn/ui, Vitest/Playwright tests. |
| **Backend .NET / C#** | .NET 10, ASP.NET Core, EF Core, FluentValidation, 87 xUnit tests. |
| **Full Stack** | Complete end-to-end implementation (database → API → UI → tests → deploy). |
| **SaaS / Product Engineer** | Multi-tenancy, RBAC, onboarding/trial, audit trail, plan billing, and full product lifecycle. |
| **Fintech / Financial Management** | Financial domain (cash flow, forecasts, P&L, aging, ROI/IRR, receipts/NF-e, PIX). |
| **Software Engineer (Junior/Mid)** | Broad scope, real code with tests and CI, evidence of sprint-based evolution. |
| **DevOps / DevExp** | Docker, compose, Railway, GitHub Actions, TS automations. |
| **International** | English-language stack (React, .NET, PostgreSQL), standardized tests, demonstrable portfolio. |
| **Startup** | Fast delivery, product vision, landing + onboarding + trial (product-led growth). |

---

# History

## v1

- Created after initial analysis.
