# Lucraí — Backend Checklist

## Legenda
- [x] Concluído
- [ ] Pendente
- [~] Em andamento

---

## Fase 1: Fundação (Scaffold + Domínio)

### 1.1 Documentação
- [x] `docs/backend-architecture.md` — documento de arquitetura (stack, ER diagram, endpoints, auth flow, regras de negócio, Docker, CI/CD)

### 1.2 Solução .NET
- [x] `backend/Lucrai.slnx` — solution file
- [x] `backend/src/Lucrai.API/` — Web API project (ASP.NET Core 10)
- [x] `backend/src/Lucrai.Core/` — Class library (domínio puro)
- [x] `backend/src/Lucrai.Infrastructure/` — Class library (EF Core, dados)
- [x] `backend/tests/Lucrai.API.Tests/` — xUnit test project

### 1.3 Dependências (NuGet)
- [x] `Lucrai.Infrastructure`: EF Core, EF Core Tools, Npgsql, Identity.EntityFrameworkCore
- [x] `Lucrai.API`: Identity.EntityFrameworkCore, JwtBearer, EF Core Design, InMemory
- [x] `Lucrai.Core`: Identity.Stores (para User herdar IdentityUser)
- [x] `Lucrai.API.Tests`: Mvc.Testing, EF Core InMemory

### 1.4 Enums (`Lucrai.Core/Enums/`)
- [x] `TransactionType.cs` — Income, Expense
- [x] `ForecastStatus.cs` — Predicted, Received, Paid, Cancelled
- [x] `UserRole.cs` — Owner, Admin, Financial, Viewer
- [x] `AuditAction.cs` — Created, Edited, Cancelled, Paid, Received, Restored, Deleted, MovedToTrash
- [x] `EntryType.cs` — Transaction, Forecast
- [x] `RecurrenceType.cs` — Daily, Weekly, Biweekly, Monthly, Quarterly, Semiannual, Annual
- [x] `PorteEmpresa.cs` — MEI, ME, EPP, Medio, Grande
- [x] `UserPlan.cs` — Free, Basic, Premium, SuperAdmin

### 1.5 Entidades (`Lucrai.Core/Entities/`)
- [x] `User.cs` — estende IdentityUser, campos: Name, Role, Company, Avatar, Active, CreatedAt, Plan, MustChangePassword
- [x] `Transaction.cs` — Id, DisplayId, Type, Value, CategoryId, CategoryName, Description, Date, Observation, Company, CreatedAt, UpdatedAt
- [x] `Category.cs` — Id, Name, Color, Icon, Type, Company, CreatedAt (relacionamento 1:N com Transaction)
- [x] `CashForecast.cs` — Id, DisplayId, Type, Description, Amount, Category, ExpectedDate, Status, Notes, Company + campos de cancelamento e recorrência
- [x] `PricingProduct.cs` — Id, Name, Category, Sku, Description + todos os campos de custo/preço
- [x] `DeletedItem.cs` — snapshot polimórfico (Transaction ou Forecast) com TTL de 30 dias
- [x] `AuditLog.cs` — Id, EntityId, EntityType, DisplayId, Action, Description, User, Company, Timestamp, Details
- [x] `CompanySettings.cs` — CompanyName, LogoUrl, PrimaryColor, Company
- [x] `CompanyRegistration.cs` — cadastro legado (Conta): Nome, Email, Telefone, Porte, Faturamento, etc.
- [x] `RefreshToken.cs` — Token, UserId, IsUsed, IsRevoked, ExpiresAt

### 1.6 Interfaces de Repositório (`Lucrai.Core/Interfaces/`)
- [x] `ITransactionRepository.cs` — CRUD + GetByMonth, GetSummary, GetYearlySummary, GetBalance, GetNextDisplayId
- [x] `ICategoryRepository.cs` — CRUD + HasTransactions, FindDuplicates, RemoveDuplicates
- [x] `ICashForecastRepository.cs` — CRUD + GetByStatus, MarkAsReceived/Paid/Cancelled, GetTotals, GetNextDisplayId
- [x] `IUserRepository.cs` — GetAll, GetActive, FindByEmail, Create (com password hash), SoftDelete
- [x] `ITrashRepository.cs` — GetAll (não expirados), MoveToTrash, Restore, PermanentlyDelete, Cleanup
- [x] `IAuditRepository.cs` — Log, GetAll, GetByEntity, GetByAction
- [x] `ISettingsRepository.cs` — Get, Save, Update
- [x] `IPricingRepository.cs` — CRUD completo

### 1.7 DbContext (`Lucrai.Infrastructure/Data/`)
- [x] `LucraiDbContext.cs` — herda IdentityDbContext<User, IdentityRole, string>
- [x] 10 DbSets: Transactions, Categories, CashForecasts, PricingProducts, DeletedItems, AuditLogs, CompanySettings, CompanyRegistrations, RefreshTokens (+ Users herdado do Identity)
- [x] Fluent API completa: tipos, tamanhos, índices, relacionamentos, deleção restrita
- [x] Índices: compostos por Company + campo de busca em todas as tabelas

### 1.8 Seed (`Lucrai.Infrastructure/Seed/`)
- [x] `DataSeeder.cs` — 5 usuários SuperAdmin (Lucraí): lucrai.adm, joao.ribeiro, vitoria.justo, fellype.gabriel, eduardo.contador
- [x] Senhas condicionais: `lucrai.adm → Lucrai@1`, demais → `123` (forçam troca de senha no 1º login)
- [x] Todos os seed users com `MustChangePassword = true`, `Plan = SuperAdmin`, `Company = "Lucraí"`
- [x] 12 categorias padrão (4 de receita + 8 de despesa) por empresa
- [x] Executa migrations automaticamente (com fallback EnsureCreated para InMemory)

### 1.9 API Setup (`Lucrai.API/`)
- [x] `Program.cs` — DI completo: DbContext (Npgsql/InMemory configurável), Identity, JWT Bearer, CORS, autorização, password policy
- [x] `appsettings.json` — ConnectionString, JWT config, Refresh Token config, CORS origins
- [x] `appsettings.Development.json` — config para ambiente local

### 1.10 Neon (Produção)
- [x] `appsettings.Production.json` — connection string Neon (key-value), JWT key
- [x] `.gitignore` — excluído do versionamento
- [x] Migration `Initial` recriada e aplicada no Neon
- [x] Seed rodou (3 usuários + 36 categorias)
- [x] API responde em Production (login retorna JWT, categories retorna dados)

---

## Fase 2: Controllers (API REST)

### 2.1 Auth
- [x] `AuthController.cs`
  - [x] `POST /api/auth/login` — valida credenciais, retorna JWT + refresh token
  - [x] `POST /api/auth/register` — cria novo usuário + empresa
  - [x] `POST /api/auth/refresh` — rotaciona refresh token
  - [x] `POST /api/auth/logout` — revoga refresh token
  - [x] `GET /api/auth/me` — dados do usuário logado

### 2.2 Transactions
- [x] `TransactionsController.cs`
  - [x] `GET /api/transactions` — listar (query: type, year, month)
  - [x] `GET /api/transactions/{id}` — obter por ID
  - [x] `GET /api/transactions/summary` — sumário do período
  - [x] `GET /api/transactions/summary/yearly/{year}` — sumário anual
  - [x] `GET /api/transactions/balance` — saldo total (all-time)
  - [x] `POST /api/transactions` — criar (com validação + audit)
  - [x] `PUT /api/transactions/{id}` — atualizar (com validação + audit)
  - [x] `DELETE /api/transactions/{id}` — excluir

### 2.3 Categories
- [x] `CategoriesController.cs`
  - [x] `GET /api/categories` — listar (query: type)
  - [x] `GET /api/categories/{id}` — obter
  - [x] `POST /api/categories` — criar
  - [x] `PUT /api/categories/{id}` — atualizar
  - [x] `DELETE /api/categories/{id}` — excluir (bloqueia se houver transações)
  - [x] `POST /api/categories/remove-duplicates` — mesclar duplicatas

### 2.4 Cash Forecasts
- [x] `CashForecastsController.cs`
  - [x] `GET /api/forecasts` — listar (query: status)
  - [x] `GET /api/forecasts/{id}` — obter
  - [x] `GET /api/forecasts/totals` — totais previstos
  - [x] `POST /api/forecasts` — criar
  - [x] `PUT /api/forecasts/{id}` — atualizar
  - [x] `DELETE /api/forecasts/{id}` — mover para lixeira
  - [x] `POST /api/forecasts/{id}/mark-as-received` — receber (+ cria Transaction)
  - [x] `POST /api/forecasts/{id}/mark-as-paid` — pagar (+ cria Transaction)
  - [x] `POST /api/forecasts/{id}/mark-as-cancelled` — cancelar

### 2.5 Users
- [x] `UsersController.cs`
  - [x] `GET /api/users` — listar usuários da empresa
  - [x] `GET /api/users/active` — listar apenas ativos
  - [x] `GET /api/users/{id}` — obter
  - [x] `POST /api/users` — criar
  - [x] `PUT /api/users/{id}` — atualizar
  - [x] `DELETE /api/users/{id}` — desativar (soft delete)

### 2.6 Trash
- [x] `TrashController.cs`
  - [x] `GET /api/trash` — listar itens não expirados
  - [x] `POST /api/trash/{id}/restore` — restaurar
  - [x] `DELETE /api/trash/{id}` — excluir permanentemente
  - [x] `POST /api/trash/cleanup` — limpar expirados

### 2.7 Audit
- [x] `AuditController.cs`
  - [x] `GET /api/audit` — listar logs da empresa
  - [x] `GET /api/audit/entity/{entityId}` — logs de uma entidade específica
  - [x] `GET /api/audit/action/{action}` — logs por tipo de ação

### 2.8 Settings
- [x] `SettingsController.cs`
  - [x] `GET /api/settings` — obter config da empresa
  - [x] `POST /api/settings` — criar config
  - [x] `PUT /api/settings` — atualizar config

### 2.9 Pricing
- [x] `PricingController.cs`
  - [x] `GET /api/pricing` — listar produtos
  - [x] `GET /api/pricing/{id}` — obter
  - [x] `POST /api/pricing` — criar (com cálculo automático de preços)
  - [x] `PUT /api/pricing/{id}` — atualizar (recalcula preços)
  - [x] `DELETE /api/pricing/{id}` — excluir

### 2.10 Dashboard
- [x] `DashboardController.cs`
  - [x] `POST /api/dashboard/projection` — projeção financeira (12 meses, cenários)
  - [x] `GET /api/dashboard/runway` — cálculo de runway (meses de caixa)
  - [x] `GET /api/dashboard/breakeven` — ponto de equilíbrio
  - [x] `GET /api/dashboard/health` — saúde financeira (score 0-100)
  - [x] `GET /api/dashboard/alerts` — alertas inteligentes

### 2.11 Contas (Company Registration)
- [x] `ContasController.cs`
  - [x] `POST /api/contas` — criar registro de cadastro (público)
  - [x] `GET /api/contas` — listar registros (Admin)

---

## Fase 3: Repositories (Implementação EF Core)

- [x] `Lucrai.Infrastructure/Repositories/TransactionRepository.cs`
  - [x] Display ID sequencial por empresa
  - [x] Filtros por tipo/mês/ano
  - [x] Sumários e balanços agregados
  - [x] Criação com auditoria
- [x] `Lucrai.Infrastructure/Repositories/CategoryRepository.cs`
  - [x] Proteção de exclusão (verifica transações vinculadas)
  - [x] Detecção e remoção de duplicatas
- [x] `Lucrai.Infrastructure/Repositories/CashForecastRepository.cs`
  - [x] MarkAsReceived: atualiza status + cria Transaction
  - [x] MarkAsPaid: atualiza status + cria Transaction
  - [x] MarkAsCancelled: registra motivo/data/responsável
  - [x] Totais agregados
- [x] `Lucrai.Infrastructure/Repositories/UserRepository.cs`
  - [x] Criação com hash de senha (via UserManager)
  - [x] Soft delete (Active = false)
- [x] `Lucrai.Infrastructure/Repositories/TrashRepository.cs`
  - [x] Move snapshot completo para DeletedItems
  - [x] Restaura devolvendo à tabela original
  - [x] Cleanup de expirados
- [x] `Lucrai.Infrastructure/Repositories/AuditRepository.cs`
  - [x] Log genérico para qualquer mutação
- [x] `Lucrai.Infrastructure/Repositories/SettingsRepository.cs`
  - [x] Upsert (get or create default)
- [x] `Lucrai.Infrastructure/Repositories/PricingRepository.cs`
  - [x] CRUD simples

---

## Fase 4: Middleware e Infra

- [x] `Lucrai.API/Middleware/ExceptionHandlingMiddleware.cs`
  - [x] Tratamento global de exceções (JSON: 400, 404, 403, 500)
- [x] `Lucrai.API/Middleware/TenantContextMiddleware.cs`
  - [x] Extrai Company/UserName/UserId do JWT e disponibiliza no HttpContext
- [x] DTOs de request/response para todos os endpoints (11 arquivos)
- [ ] Validação com FluentValidation ou DataAnnotations

---

## Fase 5: Serviços de Domínio (Inteligência)

- [x] `Lucrai.Core/Services/IDashboardIntelligenceService.cs`
- [x] `Lucrai.Core/Services/DashboardIntelligenceService.cs`
  - [x] `CalcularProjecao()` — projeção financeira com cenários
  - [x] `CalcularRunway()` — quanto tempo a empresa sobrevive
  - [x] `CalcularBreakEven()` — ponto de equilíbrio
  - [x] `CalcularSaude()` — score 0-100 com subindicadores
  - [x] `CalcularSparkline()` — dados para gráficos
  - [x] `GerarNotaCFO()` — resumo em linguagem natural
  - [x] `GerarAcoesRecomendadas()` — recomendações priorizadas
- [x] `Lucrai.Core/Services/IAlertasService.cs`
- [x] `Lucrai.Core/Services/AlertasService.cs`
  - [x] Alertas de fluxo de caixa negativo
  - [x] Alertas de queda de margem
  - [x] Alertas de custos acima da receita
  - [x] Alertas de pico anômalo de despesas
  - [x] Alertas de inadimplência (>7/15 dias)
  - [x] Insights positivos (melhor período, margem expandindo)
  - [x] Dispensar/restaurar alertas (via `DismissedAlert` + migration)

---

## Fase 6: Docker

- [x] `backend/src/Lucrai.API/Dockerfile`
  - [x] Multi-stage build (sdk → aspnet)
  - [x] Expose porta 8080
- [x] `docker-compose.yml` (raiz do projeto)
  - [x] Serviço `api`: build do backend, porta 5000:8080
  - [x] Serviço `db`: postgres:16-alpine, volume persistente, healthcheck
- [x] `.dockerignore`

---

## Fase 7: GitHub Actions

- [x] `.github/workflows/ci.yml`
  - [x] Job `backend`: dotnet restore → build → test
  - [x] Job `frontend`: npm ci → lint → build
- [x] `backend/railway.json` — config Railway (DOCKERFILE builder, restart policy)
- [x] `backend/src/Lucrai.API/Dockerfile` — porta dinâmica via `$PORT` (Railway compatível)
- [x] `docs/deploy-guide.md` — guia completo de deploy (Railway + Vercel)
> **Nota:** Railway conecta diretamente ao GitHub e faz auto-deploy no `main`. Não é necessário `deploy.yml`.

---

## Fase 8: Testes

### 8.1 Back-end (xUnit) — 83 testes passando
- [x] `AuthControllerTests.cs` — register, login, refresh, logout, me, duplicate email
- [x] `TransactionsControllerTests.cs` — CRUD, list, balance, summary
- [x] `CategoriesControllerTests.cs` — CRUD, list, get by type
- [x] `DashboardControllerTests.cs` — projection, runway, breakeven, health, alerts
- [x] `PricingControllerTests.cs` — create (com cálculo de preços), list
- [x] `Services/DashboardIntelligenceServiceTests.cs` — projeção, runway, break-even, saúde
- [x] `Services/AlertasServiceTests.cs` — geração de alertas, dispensar/restaurar
- [x] `CashForecastsControllerTests.cs` — CRUD, markAs*
- [x] `UsersControllerTests.cs` — CRUD, soft delete
- [x] `TrashControllerTests.cs` — restore, cleanup
- [x] `AuditControllerTests.cs` — list, filter
- [x] `SettingsControllerTests.cs` — CRUD
- [x] `ContasControllerTests.cs` — create registration

---

## Resumo

| Fase | Itens | Concluídos | Pendentes |
|------|-------|-----------|-----------|
| 1 — Fundação | ~45 itens | 45 | 0 |
| 2 — Controllers | ~50 endpoints | 50 | 0 |
| 3 — Repositories | ~8 arquivos | 8 | 0 |
| 4 — Middleware/Infra | ~5 itens | 4 | 1 |
| 5 — Serviços | ~2 serviços | 2 | 0 |
| 6 — Docker | ~3 itens | 3 | 0 |
| 7 — CI/CD | ~4 itens | 4 | 0 |
| 8 — Testes (Back-end) | ~13 itens | 13 | 0 |
| **Total** | **~130 itens** | **129** | **1** |

> **Nota:** Itens de frontend (testes unitários, E2E, integração de API) foram movidos para `docs/frontend-todo.md`.
