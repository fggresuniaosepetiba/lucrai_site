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
- [x] `Lucrai.API`: Identity.EntityFrameworkCore, JwtBearer, EF Core Design
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
- [x] Executa migrations automaticamente antes do seed

### 1.9 API Setup (`Lucrai.API/`)
- [x] `Program.cs` — DI completo: DbContext (Npgsql), Identity, JWT Bearer, CORS, autorização
- [x] `appsettings.json` — ConnectionString, JWT config, Refresh Token config, CORS origins
- [ ] `appsettings.Development.json` — config para ambiente local

---

## Fase 2: Controllers (API REST)

### 2.1 Auth
- [ ] `AuthController.cs`
  - [ ] `POST /api/auth/login` — valida credenciais, retorna JWT + refresh token
  - [ ] `POST /api/auth/register` — cria novo usuário + empresa
  - [ ] `POST /api/auth/refresh` — rotaciona refresh token
  - [ ] `POST /api/auth/logout` — revoga refresh token
  - [ ] `GET /api/auth/me` — dados do usuário logado

### 2.2 Transactions
- [ ] `TransactionsController.cs`
  - [ ] `GET /api/transactions` — listar (query: type, year, month, search)
  - [ ] `GET /api/transactions/{id}` — obter por ID
  - [ ] `GET /api/transactions/summary` — sumário do período
  - [ ] `GET /api/transactions/yearly-summary` — sumário anual
  - [ ] `GET /api/transactions/balance` — saldo total (all-time)
  - [ ] `POST /api/transactions` — criar (com validação + audit)
  - [ ] `PUT /api/transactions/{id}` — atualizar (com validação + audit)
  - [ ] `DELETE /api/transactions/{id}` — mover para lixeira

### 2.3 Categories
- [ ] `CategoriesController.cs`
  - [ ] `GET /api/categories` — listar (query: type)
  - [ ] `GET /api/categories/{id}` — obter
  - [ ] `POST /api/categories` — criar
  - [ ] `PUT /api/categories/{id}` — atualizar
  - [ ] `DELETE /api/categories/{id}` — excluir (bloqueia se houver transações)
  - [ ] `POST /api/categories/remove-duplicates` — mesclar duplicatas

### 2.4 Cash Forecasts
- [ ] `CashForecastsController.cs`
  - [ ] `GET /api/forecasts` — listar (query: status)
  - [ ] `GET /api/forecasts/{id}` — obter
  - [ ] `GET /api/forecasts/totals` — totais previstos
  - [ ] `POST /api/forecasts` — criar
  - [ ] `PUT /api/forecasts/{id}` — atualizar
  - [ ] `DELETE /api/forecasts/{id}` — mover para lixeira
  - [ ] `POST /api/forecasts/{id}/mark-as-received` — receber (+ cria Transaction)
  - [ ] `POST /api/forecasts/{id}/mark-as-paid` — pagar (+ cria Transaction)
  - [ ] `POST /api/forecasts/{id}/mark-as-cancelled` — cancelar

### 2.5 Users
- [ ] `UsersController.cs`
  - [ ] `GET /api/users` — listar usuários da empresa
  - [ ] `GET /api/users/{id}` — obter
  - [ ] `POST /api/users` — criar
  - [ ] `PUT /api/users/{id}` — atualizar
  - [ ] `DELETE /api/users/{id}` — desativar (soft delete)

### 2.6 Trash
- [ ] `TrashController.cs`
  - [ ] `GET /api/trash` — listar itens não expirados
  - [ ] `POST /api/trash/{id}/restore` — restaurar
  - [ ] `DELETE /api/trash/{id}` — excluir permanentemente
  - [ ] `POST /api/trash/cleanup` — limpar expirados

### 2.7 Audit
- [ ] `AuditController.cs`
  - [ ] `GET /api/audit` — listar logs da empresa
  - [ ] `GET /api/audit/entity/{entityId}` — logs de uma entidade

### 2.8 Settings
- [ ] `SettingsController.cs`
  - [ ] `GET /api/settings` — obter config da empresa
  - [ ] `PUT /api/settings` — atualizar config

### 2.9 Pricing
- [ ] `PricingController.cs`
  - [ ] `GET /api/pricing` — listar produtos
  - [ ] `GET /api/pricing/{id}` — obter
  - [ ] `POST /api/pricing` — criar
  - [ ] `PUT /api/pricing/{id}` — atualizar
  - [ ] `DELETE /api/pricing/{id}` — excluir

### 2.10 Dashboard
- [ ] `DashboardController.cs`
  - [ ] `POST /api/dashboard/projection` — projeção financeira
  - [ ] `POST /api/dashboard/runway` — cálculo de runway
  - [ ] `POST /api/dashboard/breakeven` — ponto de equilíbrio
  - [ ] `POST /api/dashboard/health` — saúde financeira
  - [ ] `POST /api/dashboard/alerts` — alertas inteligentes

### 2.11 Contas (Company Registration)
- [ ] `ContasController.cs`
  - [ ] `GET /api/contas` — listar cadastros
  - [ ] `POST /api/contas` — criar cadastro

---

## Fase 3: Repositories (Implementação EF Core)

- [ ] `Lucrai.Infrastructure/Repositories/TransactionRepository.cs`
  - [ ] Display ID sequencial por empresa
  - [ ] Filtros por tipo/mês/ano
  - [ ] Sumários e balanços agregados
  - [ ] Criação com auditoria
- [ ] `Lucrai.Infrastructure/Repositories/CategoryRepository.cs`
  - [ ] Proteção de exclusão (verifica transações vinculadas)
  - [ ] Detecção e remoção de duplicatas
- [ ] `Lucrai.Infrastructure/Repositories/CashForecastRepository.cs`
  - [ ] MarkAsReceived: atualiza status + cria Transaction
  - [ ] MarkAsPaid: atualiza status + cria Transaction
  - [ ] MarkAsCancelled: registra motivo/data/responsável
  - [ ] Totais agregados
- [ ] `Lucrai.Infrastructure/Repositories/UserRepository.cs`
  - [ ] Criação com hash de senha (via UserManager)
  - [ ] Soft delete (Active = false)
- [ ] `Lucrai.Infrastructure/Repositories/TrashRepository.cs`
  - [ ] Move snapshot completo para DeletedItems
  - [ ] Restaura devolvendo à tabela original
  - [ ] Cleanup de expirados
- [ ] `Lucrai.Infrastructure/Repositories/AuditRepository.cs`
  - [ ] Log genérico para qualquer mutação
- [ ] `Lucrai.Infrastructure/Repositories/SettingsRepository.cs`
  - [ ] Upsert (get or create default)
- [ ] `Lucrai.Infrastructure/Repositories/PricingRepository.cs`
  - [ ] CRUD simples

---

## Fase 4: Middleware e Infra

- [ ] `Lucrai.API/Middleware/ExceptionHandlingMiddleware.cs`
  - [ ] Tratamento global de exceções (problema+json)
- [ ] `Lucrai.API/Middleware/TenantContextMiddleware.cs`
  - [ ] Extrai Company do JWT e disponibiliza no HttpContext
- [ ] DTOs de request/response para todos os endpoints
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

- [ ] `backend/src/Lucrai.API/Dockerfile`
  - [ ] Multi-stage build (sdk → aspnet)
  - [ ] Expose porta 8080
- [ ] `docker-compose.yml` (raiz do projeto)
  - [ ] Serviço `api`: build do backend, porta 5000:8080
  - [ ] Serviço `db`: postgres:16-alpine, volume persistente, healthcheck
  - [ ] Serviço `frontend`: build do Next.js (opcional)
  - [ ] Variáveis de ambiente via `.env`
- [ ] `.dockerignore`

---

## Fase 7: GitHub Actions

- [ ] `.github/workflows/ci.yml`
  - [ ] Job `backend`: dotnet restore → build → test
  - [ ] Job `frontend`: npm ci → build → vitest
  - [ ] Job `e2e`: playwright test (depende dos anteriores)
  - [ ] Serviço PostgreSQL no CI
- [ ] `.github/workflows/deploy.yml`
  - [ ] Build Docker images
  - [ ] Push para container registry
  - [ ] Deploy para produção

---

## Fase 8: Testes

### 8.1 Back-end (xUnit)
- [ ] `Lucrai.API.Tests/Services/DashboardIntelligenceServiceTests.cs`
  - [ ] Testes de projeção (cenários normal, otimista, pessimista)
  - [ ] Testes de runway (seguro, atenção, crítico)
  - [ ] Testes de break-even (acima/abaixo)
  - [ ] Testes de saúde financeira
- [ ] `Lucrai.API.Tests/Services/AlertasServiceTests.cs`
  - [ ] Geração de alertas por tipo
  - [ ] Dispensar/restaurar alertas
- [ ] `Lucrai.API.Tests/Controllers/` (WebApplicationFactory)
  - [ ] AuthController tests (login, refresh, register)
  - [ ] TransactionsController tests (CRUD, validações)
  - [ ] CategoriesController tests (CRUD, proteção exclusão)
  - [ ] CashForecastsController tests (CRUD, markAs*)

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
| 1 — Fundação | ~35 itens | 33 | 2 |
| 2 — Controllers | ~40 endpoints | 0 | 40 |
| 3 — Repositories | ~8 arquivos | 0 | 8 |
| 4 — Middleware/Infra | ~4 itens | 0 | 4 |
| 5 — Serviços | ~2 serviços | 0 | 2 |
| 6 — Docker | ~3 itens | 0 | 3 |
| 7 — CI/CD | ~2 workflows | 0 | 2 |
| 8 — Testes | ~12 itens | 0 | 12 |
| 9 — Integração Front | ~6 itens | 0 | 6 |
| **Total** | **~105 itens** | **33** | **~72** |
