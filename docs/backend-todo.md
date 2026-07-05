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

### 1.5 Entidades (`Lucrai.Core/Entities/`)
- [x] `User.cs` — estende IdentityUser, campos: Name, Role, Company, Avatar, Active, CreatedAt
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
- [x] `DataSeeder.cs` — 3 usuários padrão (Trinary, Lucraí, Grão Natural) com senha via UserManager
- [x] 12 categorias padrão (4 de receita + 8 de despesa) por empresa
- [x] Executa migrations automaticamente (com fallback EnsureCreated para InMemory)

### 1.9 API Setup (`Lucrai.API/`)
- [x] `Program.cs` — DI completo: DbContext (Npgsql/InMemory configurável), Identity, JWT Bearer, CORS, autorização
- [x] `appsettings.json` — ConnectionString, JWT config, Refresh Token config, CORS origins
- [ ] `appsettings.Development.json` — config para ambiente local

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

- [ ] `Lucrai.Core/Services/IDashboardIntelligenceService.cs`
- [ ] `Lucrai.Core/Services/DashboardIntelligenceService.cs`
  - [ ] `CalcularProjecao()` — projeção financeira com cenários
  - [ ] `CalcularRunway()` — quanto tempo a empresa sobrevive
  - [ ] `CalcularBreakEven()` — ponto de equilíbrio
  - [ ] `CalcularSaude()` — score 0-100 com subindicadores
  - [ ] `CalcularSparkline()` — dados para gráficos
  - [ ] `GerarNotaCFO()` — resumo em linguagem natural
  - [ ] `GerarAcoesRecomendadas()` — recomendações priorizadas
- [ ] `Lucrai.Core/Services/IAlertasService.cs`
- [ ] `Lucrai.Core/Services/AlertasService.cs`
  - [ ] Alertas de fluxo de caixa negativo
  - [ ] Alertas de queda de margem
  - [ ] Alertas de custos acima da receita
  - [ ] Alertas de pico anômalo de despesas
  - [ ] Alertas de inadimplência (>7/15 dias)
  - [ ] Insights positivos (melhor período, margem expandindo)
  - [ ] Dispensar/restaurar alertas

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
- [ ] `.github/workflows/deploy.yml`
  - [ ] Build Docker images
  - [ ] Push para container registry
  - [ ] Deploy para produção

---

## Fase 8: Testes

### 8.1 Back-end (xUnit) — 22 testes passando
- [x] `AuthControllerTests.cs` — register, login, refresh, logout, me, duplicate email
- [x] `TransactionsControllerTests.cs` — CRUD, list, balance, summary
- [x] `CategoriesControllerTests.cs` — CRUD, list, get by type
- [x] `DashboardControllerTests.cs` — projection, runway, breakeven, health, alerts
- [x] `PricingControllerTests.cs` — create (com cálculo de preços), list
- [ ] `Services/DashboardIntelligenceServiceTests.cs` — projeção, runway, break-even, saúde
- [ ] `Services/AlertasServiceTests.cs` — geração de alertas, dispensar/restaurar
- [ ] `CashForecastsControllerTests.cs` — CRUD, markAs*
- [ ] `UsersControllerTests.cs` — CRUD, soft delete
- [ ] `TrashControllerTests.cs` — restore, cleanup
- [ ] `AuditControllerTests.cs` — list, filter
- [ ] `SettingsControllerTests.cs` — CRUD
- [ ] `ContasControllerTests.cs` — create registration

### 8.2 Front-end (Vitest + RTL)
- [ ] Adaptar testes existentes para mockar API (substituir Dexie)
- [ ] Testar hooks (useDadosFiltrados, useAlertsCount)
- [ ] Testar utils (mascaras, formatação)

### 8.3 E2E (Playwright)
- [ ] Fluxo: Login → Dashboard → ver indicadores
- [ ] Fluxo: Criar transação → ver no financeiro
- [ ] Fluxo: Criar previsão → marcar como recebida
- [ ] Fluxo: Excluir → restaurar da lixeira
- [ ] Fluxo: Gerenciar categorias

---

## Fase 9: Integração Front-end

- [ ] `src/services/api.ts` — cliente HTTP com Bearer token automático
- [ ] Atualizar `auth-store.ts` — login via API, JWT armazenado
- [ ] Atualizar `useDadosFiltrados.ts` — chamar API ao invés de Dexie
- [ ] Substituir chamadas Dexie nos pages por chamadas API
- [ ] Tratar erros da API (toast, redirect se 401)
- [ ] Refresh token automático (interceptor 401 → refresh → retry)

---

## Resumo

| Fase | Itens | Concluídos | Pendentes |
|------|-------|-----------|-----------|
| 1 — Fundação | ~41 itens | 40 | 1 |
| 2 — Controllers | ~50 endpoints | 50 | 0 |
| 3 — Repositories | ~8 arquivos | 8 | 0 |
| 4 — Middleware/Infra | ~5 itens | 4 | 1 |
| 5 — Serviços | ~2 serviços | 0 | 2 |
| 6 — Docker | ~3 itens | 3 | 0 |
| 7 — CI/CD | ~2 workflows | 1 | 1 |
| 8 — Testes | ~15 itens | 5 | 10 |
| 9 — Integração Front | ~6 itens | 0 | 6 |
| **Total** | **~132 itens** | **111** | **21** |
