# Lucraí — Backend Architecture

## Visão Geral

O backend do Lucraí é uma **Web API REST** construída em **ASP.NET Core 10 LTS**, seguindo os princípios da **Clean Architecture**. Responsável por toda persistência, regras de negócio, autenticação e inteligência financeira da plataforma.

```
┌──────────────────────────────────────────────────────────────┐
│                        Next.js 15 (Front-end)                 │
│  (SSR/CSR — consome API via HTTP, Bearer JWT)               │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼───────────────────────────────────┐
│                    Lucrai.API (ASP.NET Core 10)               │
│  ┌────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ Controllers │  │   Middleware     │  │    Program.cs     │  │
│  │  (REST)     │  │ (JWT, Exception) │  │  (DI, Config)    │  │
│  └──────┬──────┘  └──────────────────┘  └──────────────────┘  │
│         │                                                      │
│  ┌──────▼──────────────────────────────────────────────────┐  │
│  │              Lucrai.Core (Domínio)                       │  │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────────────┐  │  │
│  │  │ Entities │  │  DTOs    │  │  Services (regras)    │  │  │
│  │  └──────────┘  └──────────┘  └───────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│         │                                                      │
│  ┌──────▼──────────────────────────────────────────────────┐  │
│  │          Lucrai.Infrastructure (Dados)                   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │  │
│  │  │ EF Core 10   │  │  Repositories│  │  Migrations   │  │  │
│  │  │ (DbContext)  │  │  (implement) │  │  + Seed       │  │  │
│  │  └──────┬───────┘  └──────────────┘  └───────────────┘  │  │
│  └─────────┼────────────────────────────────────────────────┘  │
└────────────┼────────────────────────────────────────────────────┘
             │ Npgsql
┌────────────▼────────────────────────────────────────────────────┐
│              PostgreSQL (Neon Serverless)                        │
│  transactions │ categories │ users │ cashForecasts │ auditLogs  │
│  pricingProducts │ deletedItems │ companySettings │ registrations│
└─────────────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológico

| Camada | Tecnologia | Versão |
|---|---|---|
| Runtime | .NET | 10.0 LTS |
| Framework | ASP.NET Core | 10.0 |
| ORM | Entity Framework Core | 10.0 |
| Database | PostgreSQL (via Neon) | 16 |
| DB Driver | Npgsql | — |
| Autenticação | ASP.NET Identity + JWT Bearer + Refresh Token | — |
| Testes | xUnit + WebApplicationFactory | — |
| Serialização | System.Text.Json | — |
| Container | Docker + docker-compose | — |
| CI/CD | GitHub Actions | — |

---

## Estrutura de Pastas

```
backend/
├── Lucrai.slnx
├── src/
│   ├── Lucrai.API/
│   │   ├── Controllers/          # 24 controllers / 138 endpoints
│   │   │   ├── AuthController.cs
│   │   │   ├── TransactionsController.cs
│   │   │   ├── CategoriesController.cs
│   │   │   ├── CashForecastsController.cs
│   │   │   ├── UsersController.cs
│   │   │   ├── TrashController.cs
│   │   │   ├── AuditController.cs
│   │   │   ├── SettingsController.cs
│   │   │   ├── PricingController.cs
│   │   │   ├── DashboardController.cs
│   │   │   ├── ContasController.cs
│   │   │   ├── HealthController.cs
│   │   │   ├── DocumentosController.cs
│   │   │   ├── DocumentoAprendizadoController.cs
│   │   │   ├── DocumentoConfigController.cs
│   │   │   ├── RecibosController.cs
│   │   │   ├── SignatureController.cs
│   │   │   ├── InsumosController.cs
│   │   │   ├── FixedCostsController.cs
│   │   │   ├── AccountsPayableController.cs
│   │   │   ├── AccountsReceivableController.cs
│   │   │   ├── DebtsController.cs
│   │   │   ├── InvestmentsController.cs
│   │   │   └── BalanceAccountsController.cs
│   │   ├── Middleware/
│   │   │   ├── ExceptionHandlingMiddleware.cs
│   │   │   └── TenantContextMiddleware.cs
│   │   ├── Validators/           # FluentValidation (35 validators)
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   └── Dockerfile
│   │
│   ├── Lucrai.Core/
│   │   ├── Entities/             # 25 entidades
│   │   ├── Enums/
│   │   ├── DTOs/
│   │   ├── Interfaces/           # 22 repositórios + 2 serviços + ITenantContext
│   │   └── Services/             # DashboardIntelligenceService, AlertasService
│   │
│   └── Lucrai.Infrastructure/
│       ├── Data/
│       │   └── LucraiDbContext.cs  # Fluent API + ApplyTenantFilters (23 entidades)
│       ├── Repositories/          # 22 implementações
│       ├── Migrations/            # 23 migrations EF Core
│       └── Seed/
│           └── DataSeeder.cs
│
├── tests/
│   └── Lucrai.API.Tests/          # 87 testes xUnit
│       ├── Controllers/           # 13 arquivos (incl. ReciboIsolationTests)
│       ├── Services/
│       └── CustomWebApplicationFactory.cs
│
├── .dockerignore
└── src/Lucrai.API/Dockerfile
```

---

## Modelo de Dados

### Entidades e Relacionamentos

```
┌───────────────────┐       ┌───────────────────┐
│    Transaction     │       │     Category      │
├───────────────────┤       ├───────────────────┤
│ PK: Id (Guid)      │──────>│ PK: Id (Guid)     │
│ DisplayId (#001)   │       │ Name              │
│ Type (income/exp)  │       │ Color             │
│ Value              │       │ Icon              │
│ CategoryId (FK)    │       │ Type              │
│ CategoryName       │       │ Company           │
│ Description        │       │ CreatedAt         │
│ Date               │       └───────────────────┘
│ Observation?       │
│ Company            │       ┌───────────────────┐
│ CreatedAt          │       │   CashForecast    │
│ UpdatedAt          │       ├───────────────────┤
└───────────────────┘       │ PK: Id (Guid)      │
                             │ DisplayId (#001)   │
┌───────────────────┐       │ Type               │
│       User        │       │ Description        │
├───────────────────┤       │ Amount             │
│ PK: Id (Guid)      │       │ Category           │
│ (IdentityUser)     │       │ ExpectedDate       │
│ Name               │       │ Status             │
│ Email              │       │ Company            │
│ PasswordHash       │       │ IsRecurring        │
│ Role (owner/admin) │       │ RecurrenceType?    │
│ Company            │       │ CreatedAt          │
│ Active             │       │ UpdatedAt          │
│ Avatar?            │       └───────────────────┘
│ CreatedAt          │
└───────────────────┘       ┌───────────────────┐
                             │   DeletedItem     │
┌───────────────────┐       ├───────────────────┤
│   AuditLog        │       │ PK: Id (Guid)      │
├───────────────────┤       │ OriginalId         │
│ PK: Id (Guid)      │       │ EntryType (tx/fore)│
│ EntityId           │       │ DisplayId          │
│ EntityType         │       │ Type               │
│ DisplayId          │       │ Value/Amount       │
│ Action             │       │ Description        │
│ Description        │       │ DeletedAt          │
│ User               │       │ Reason             │
│ Company            │       │ RestoreUntil       │
│ Timestamp          │       │ Company            │
│ Details?           │       └───────────────────┘
└───────────────────┘
```

### Esquema de Multi-tenancy

O isolamento é feito via **filtros globais do EF Core** (`HasQueryFilter`), aplicados em **23 das 25 entidades** no `ApplyTenantFilters()` do `LucraiDbContext`. O `Company` e o `UserId` são extraídos do JWT pelo `TenantContextMiddleware` (scoped `ITenantContext`) — nunca confiados em parâmetros de requisição.

Dois níveis de isolamento:
- **Empresa (tenant):** `Company == CurrentCompany` em todas as tabelas
- **Usuário:** `CreatedBy == null || CreatedBy == CurrentUserId` (migração `AddUserLevelIsolation`, 20260728142726) — cada usuário vê apenas os próprios registros

Testes de isolamento específicos existem em `ReciboIsolationTests` (4 testes).

### Índices-Chave

| Tabela | Índices |
|---|---|
| transactions | `(Company, Date)`, `(Company, Type)`, `(Company, CategoryId)` |
| categories | `(Company, Type)`, `(Company, Name)` |
| cashForecasts | `(Company, Status)`, `(Company, ExpectedDate)` |
| auditLogs | `(Company, Timestamp)`, `(Company, EntityType)` |
| deletedItems | `(Company, DeletedAt)`, `(Company, RestoreUntil)` |
| pricingProducts | `(Company, Name)`, `(Company, Category)` |

---

## Fluxo de Autenticação

```
┌──────────┐         ┌──────────────┐         ┌────────────┐
│  Client   │         │ Lucrai.API   │         │ PostgreSQL │
└────┬─────┘         └──────┬───────┘         └──────┬─────┘
     │  POST /api/auth/login │                       │
     │  { email, password }  │                       │
     ├──────────────────────>│                       │
     │                       │  Validate via         │
     │                       │  SignInManager        │
     │                       │  (ASP.NET Identity)   │
     │                       ├──────────────────────>│
     │                       │<──────────────────────│
     │                       │                       │
     │                       │  Generate JWT (15min) │
     │                       │  Claims: userId,      │
     │                       │  email, role, company │
     │                       │                       │
     │                       │  Generate RefreshToken│
     │                       │  Store in DB (7 days) │
     │                       │                       │
     │  { accessToken,       │                       │
     │    refreshToken,      │                       │
     │    expiresIn,         │                       │
     │    user }             │                       │
     │<──────────────────────│                       │
     │                       │                       │
     │  POST /api/auth/refresh                       │
     │  { refreshToken }     │                       │
     ├──────────────────────>│                       │
     │                       │  Validate RefreshToken│
     │                       │  Rotate (revoke old)  │
     │                       ├──────────────────────>│
     │                       │<──────────────────────│
     │  { accessToken,       │                       │
     │    refreshToken,      │                       │
     │    expiresIn }        │                       │
     │<──────────────────────│                       │
```

### Estrutura do JWT

```json
{
  "sub": "guid-do-usuario",          // ClaimTypes.NameIdentifier
  "email": "usuario@empresa.com",    // ClaimTypes.Email
  "name": "Nome do Usuário",         // ClaimTypes.Name
  "role": "admin",                   // ClaimTypes.Role
  "company": "Nome da Empresa",      // custom claim
  "iat": 1719000000,
  "exp": 1719000900
}
```

> **Nota:** O `TenantContextMiddleware` extrai `Company`, `UserName` e `UserId` do JWT após validação e disponibiliza em `HttpContext.Items` para os controllers.

---

## API Endpoints

### Autenticação

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | /api/auth/login | Login com email + senha | ❌ |
| POST | /api/auth/register | Registrar nova conta | ❌ |
| POST | /api/auth/refresh | Renovar access token | ❌ |
| POST | /api/auth/logout | Revogar refresh token | ✅ |

### Transactions

| Método | Rota | Descrição |
|---|---|---|
| GET | /api/transactions | Listar transações (query: type, year, month, search) |
| GET | /api/transactions/{id} | Obter transação por ID |
| GET | /api/transactions/summary | Sumário do período (incomes, expenses, balance) |
| GET | /api/transactions/yearly-summary | Sumário anual (12 meses) |
| GET | /api/transactions/balance | Saldo total (all-time) |
| POST | /api/transactions | Criar transação |
| PUT | /api/transactions/{id} | Atualizar transação |
| DELETE | /api/transactions/{id} | Mover para lixeira |

### Categories

| Método | Rota | Descrição |
|---|---|---|
| GET | /api/categories | Listar categorias (query: type) |
| GET | /api/categories/{id} | Obter categoria |
| POST | /api/categories | Criar categoria |
| PUT | /api/categories/{id} | Atualizar categoria |
| DELETE | /api/categories/{id} | Excluir (bloqueia se houver transações vinculadas) |
| POST | /api/categories/remove-duplicates | Mesclar duplicatas |

### Cash Forecasts

| Método | Rota | Descrição |
|---|---|---|
| GET | /api/forecasts | Listar previsões (query: status) |
| GET | /api/forecasts/{id} | Obter previsão |
| GET | /api/forecasts/totals | Totais (incomes, expenses previstos) |
| POST | /api/forecasts | Criar previsão |
| PUT | /api/forecasts/{id} | Atualizar previsão |
| DELETE | /api/forecasts/{id} | Mover para lixeira |
| POST | /api/forecasts/{id}/mark-as-received | Marcar como recebido (+cria transaction) |
| POST | /api/forecasts/{id}/mark-as-paid | Marcar como pago (+cria transaction) |
| POST | /api/forecasts/{id}/mark-as-cancelled | Cancelar |

### Users

| Método | Rota | Descrição |
|---|---|---|
| GET | /api/users | Listar usuários da empresa |
| GET | /api/users/{id} | Obter usuário |
| POST | /api/users | Criar usuário |
| PUT | /api/users/{id} | Atualizar dados/papel |
| DELETE | /api/users/{id} | Desativar (soft delete) |

### Trash

| Método | Rota | Descrição |
|---|---|---|
| GET | /api/trash | Listar itens na lixeira (não expirados) |
| POST | /api/trash/{id}/restore | Restaurar item |
| DELETE | /api/trash/{id} | Excluir permanentemente |
| POST | /api/trash/cleanup | Limpar itens expirados |

### Audit

| Método | Rota | Descrição |
|---|---|---|
| GET | /api/audit | Listar logs de auditoria |
| GET | /api/audit/entity/{entityId} | Logs de uma entidade específica |

### Settings

| Método | Rota | Descrição |
|---|---|---|
| GET | /api/settings | Obter configurações da empresa |
| PUT | /api/settings | Atualizar configurações |

### Pricing

| Método | Rota | Descrição |
|---|---|---|
| GET | /api/pricing | Listar produtos |
| GET | /api/pricing/{id} | Obter produto |
| POST | /api/pricing | Criar produto |
| PUT | /api/pricing/{id} | Atualizar produto |
| DELETE | /api/pricing/{id} | Excluir |

### Dashboard Intelligence

| Método | Rota | Descrição |
|---|---|---|
| POST | /api/dashboard/projection | Projeção financeira (12 meses, cenários) |
| GET | /api/dashboard/runway | Cálculo de runway (meses de caixa) |
| GET | /api/dashboard/breakeven | Ponto de equilíbrio |
| GET | /api/dashboard/health | Saúde financeira (score 0-100 + subindicadores) |
| GET | /api/dashboard/alerts | Alertas inteligentes |
| GET | /api/dashboard/sparkline | Dados para sparkline |
| GET | /api/dashboard/nota-cfo | Resumo executivo em linguagem natural |
| GET | /api/dashboard/recommended-actions | Ações recomendadas priorizadas |
| POST | /api/dashboard/alerts/{id}/dismiss | Dispensar alerta |
| POST | /api/dashboard/alerts/{id}/restore | Restaurar alerta dispensado |

### Documentos Financeiros

| Método | Rota | Descrição |
|---|---|---|
| GET | /api/documentos | Listar documentos (status/query) |
| GET | /api/documentos/{id} | Obter documento |
| GET | /api/documentos/{id}/download | URL de download |
| POST | /api/documentos/upload | Upload (arquivos + metadados extraídos) |
| GET | /api/documentos/stats | Estatísticas |
| GET | /api/documentos/trash | Lixeira de documentos |
| POST | /api/documentos/{id}/excluir | Mover para lixeira |
| POST | /api/documentos/{id}/restaurar | Restaurar da lixeira |
| DELETE | /api/documentos/{id}/permanente | Excluir permanentemente |
| POST | /api/documentos/trash/cleanup | Limpar expirados |
| POST | /api/documentos/{id}/confirmar | Confirmar (+ cria transação/previsão) |
| POST | /api/documentos/{id}/rejeitar | Rejeitar com motivo |
| POST | /api/documentos/{id}/reprocessar | Reprocessar documento |
| GET | /api/documentos/{id}/logs | Logs de um documento |
| GET/POST/DELETE | /api/documentos/aprendizado | Aprendizado (chave → categoria/tipo) |
| GET/PUT | /api/documentos/config | Configuração do módulo |

### Recibos

| Método | Rota | Descrição |
|---|---|---|
| GET | /api/recibos | Listar recibos (filtros status/tipo/busca) |
| GET | /api/recibos/{id} | Obter recibo |
| POST | /api/recibos | Criar recibo (numeração REC-{ano}-######) |
| PUT | /api/recibos/{id} | Atualizar recibo |
| DELETE | /api/recibos/{id} | Excluir (soft delete) |
| POST | /api/recibos/{id}/cancelar | Cancelar com motivo |
| POST | /api/recibos/audit | Log de evento de recibo |
| GET | /api/signature | Obter assinatura digital |
| PUT | /api/signature | Atualizar assinatura (imagem base64 + responsável) |

### Precificação (Insumos / Custos Fixos)

| Método | Rota | Descrição |
|---|---|---|
| GET/POST/PUT/DELETE | /api/pricing | CRUD de produtos (cálculo automático de preços) |
| GET/POST/PUT/DELETE | /api/insumos | CRUD de insumos (conversão automática de unidades) |
| GET/POST | /api/fixed-costs | Custos fixos mensais |

### Financeiro Avançado

| Método | Rota | Descrição |
|---|---|---|
| GET/POST/PUT/DELETE | /api/accounts-payable | Contas a pagar (aging buckets) |
| GET/POST/PUT/DELETE | /api/accounts-receivable | Contas a receber (aging buckets) |
| GET/POST/PUT/DELETE | /api/debts | Dívidas (net debt / alavancagem) |
| GET/POST/PUT/DELETE | /api/investments | Investimentos (ROI, IRR, NPV, payback) |
| GET/POST/PUT/DELETE | /api/balance-accounts | Plano de contas (Ativo/Passivo/PL) |

### Contas (Company Registration)

| Método | Rota | Descrição |
|---|---|---|
| GET | /api/contas | Listar registros |
| POST | /api/contas | Criar registro de cadastro |

---

## Regras de Negócio

### Display ID Sequencial
- Toda transação e previsão recebe um `DisplayId` no formato `#001`, `#002`...
- A sequência é independente por tabela e por empresa.
- Implementado via contador no repositório (`COUNT + 1`).

### Forecast → Transaction Bridge
- Quando uma previsão é marcada como `received` ou `paid`, o sistema **cria automaticamente** uma `Transaction` real com o mesmo valor.
- A `Transaction` criada referencia a previsão original no campo `observation`.

### Soft Delete com TTL (30 dias)
- Ao excluir uma transação ou previsão, os dados são copiados para `DeletedItem` com `RestoreUntil = now + 30 dias`.
- Após expirar, o `cleanup()` remove permanentemente.
- A restauração devolve o item à tabela original.

### Proteção de Categoria
- Uma categoria **não pode ser excluída** se existir alguma transação vinculada a ela.
- O endpoint retorna erro com a contagem de transações que impedem a exclusão.

### Remoção de Duplicatas (Categorias)
- Detecta categorias com mesmo nome normalizado e mesmo tipo.
- Mantém a mais antiga (`keepId`), re-aponta transações das duplicatas para ela, exclui as duplicatas.

### Auditoria Obrigatória
- Toda mutação (create, update, delete, restore, cancel, markAsPaid/Received) gera um registro em `AuditLog`.
- Campos registrados: entidade, ação, usuário responsável, timestamp, descrição, detalhes opcionais.

### Multi-tenancy
- Dados 100% isolados por empresa.
- Toda query inclui `WHERE Company = @company` — garantido por filtro global no EF Core ou manual em cada repositório.
- Um usuário autenticado **nunca** acessa dados de outra empresa.

### Papéis e Permissões
| Papel | Acesso |
|---|---|
| owner | Total (inclusive excluir empresa) |
| admin | CRUD completo, gerenciar usuários |
| financial | CRUD transações/previsões, sem gerenciar usuários |
| viewer | Leitura de todos os módulos |

---

## Segurança

- **Senhas:** Hash via `PasswordHasher` do ASP.NET Identity (PBKDF2).
- **JWT:** Chave simétrica configurada via `appsettings.json` / environment secrets.
- **Refresh Token:** Opaco, armazenado em tabela `RefreshTokens` no banco, com **rotação** a cada uso (revoga o anterior).
- **Sessão (FE):** Token armazenado em `sessionStorage` (fechar aba = logout) + timeout de inatividade de 15 min.
- **Multi-tenancy:** Filtros globais por `Company` + isolamento por `CreatedBy`/`UserId` em 23 entidades (migrações `AddTenantQueryFilters` e `AddUserLevelIsolation`).
- **Validação:** FluentValidation em todos os request DTOs (35 validators) + validação no frontend (duas camadas).
- **SQL Injection:** Prevenido nativamente pelo EF Core (parameterized queries).
- **CORS:** Middleware próprio restrito às origens do front-end.
- **Rate Limiting:** ⚠️ **NÃO implementado** (recomendado para endpoints de autenticação).
- **HTTPS/HSTS:** ⚠️ **Não há redirecionamento HTTP→HTTPS nem HSTS no código** (HTTPS garantido no nível da plataforma — Railway/Vercel).

---

## Estratégia de Testes

### Back-end (xUnit + WebApplicationFactory) — 87 testes `[Fact]`

```
tests/Lucrai.API.Tests/
├── Controllers/
│   ├── ReciboIsolationTests.cs        # 4 testes de isolamento multi-tenant/user
│   ├── AuthControllerTests.cs         # 8 testes
│   ├── CashForecastsControllerTests.cs # 11 testes
│   ├── DashboardControllerTests.cs    # 10 testes
│   ├── UsersControllerTests.cs        # 9 testes
│   ├── ContasControllerTests.cs       # 4 testes
│   ├── AuditControllerTests.cs        # 4 testes
│   ├── SettingsControllerTests.cs     # 4 testes
│   ├── TransactionsControllerTests.cs # 4 testes
│   ├── TrashControllerTests.cs        # 4 testes
│   ├── CategoriesControllerTests.cs   # 3 testes
│   ├── PricingControllerTests.cs      # 2 testes
│   └── ...
├── Services/
│   ├── DashboardIntelligenceServiceTests.cs  # 12 testes
│   └── AlertasServiceTests.cs               # 8 testes
└── CustomWebApplicationFactory.cs           # InMemory DB + test JWT
```

- **Testes de unidade:** Serviços de domínio puros (Dashboard, Alertas), sem dependência externa.
- **Testes de integração:** Controllers com `WebApplicationFactory<Program>` + EF Core InMemory (`DatabaseProvider=InMemory`), autenticação via test JWT.
- **Isolamento:** `ReciboIsolationTests` valida que um usuário/empresa não acessa dados de outro.

### Front-end (Vitest + Playwright)

- **Unitários (Vitest, 7 suítes):** utils (formatação, valor por extenso, CPF/CNPJ), hooks (`useDadosFiltrados`, `useAlertsCount`), serviços de documentos (API, service, parse NF-e XML), recibos.
- **E2E (Playwright, 6 specs):** login→dashboard, criar transação, criar previsão, lixeira/restauração, categorias — com API mockada (`e2e/helpers.ts`).

---

## Docker

```yaml
# docker-compose.yml (raiz do projeto)
services:
  postgres:
    image: postgres:16-alpine
    container_name: lucrai-db
    ports:
      - "5433:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U lucrai -d lucrai"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: ./backend
      dockerfile: src/Lucrai.API/Dockerfile
    profiles: ["full"]
    ports:
      - "5000:8080"
    environment:
      ConnectionStrings__Default: Host=postgres;Port=5432;Database=lucrai;Username=lucrai;Password=...
      Jwt__Key: ...
      Cors__Origins: http://localhost:3000
    depends_on:
      postgres:
        condition: service_healthy

  web:
    build:
      context: .
      dockerfile: frontend.Dockerfile
    profiles: ["full"]
    ports:
      - "3000:3000"
    build:
      args:
        NEXT_PUBLIC_API_URL: http://localhost:5000
    depends_on:
      - api

volumes:
  pgdata:
```

> **Profiles:** `docker compose up -d` sobe apenas `postgres`. `docker compose --profile full up -d` sobe `postgres + api + web`.

### Dockerfile (API) — `backend/src/Lucrai.API/Dockerfile`

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/Lucrai.API/Lucrai.API.csproj", "src/Lucrai.API/"]
COPY ["src/Lucrai.Core/Lucrai.Core.csproj", "src/Lucrai.Core/"]
COPY ["src/Lucrai.Infrastructure/Lucrai.Infrastructure.csproj", "src/Lucrai.Infrastructure/"]
RUN dotnet restore "src/Lucrai.API/Lucrai.API.csproj"
COPY . .
WORKDIR "/src/src/Lucrai.API"
RUN dotnet publish "Lucrai.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends libgssapi-krb5-2 curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:${PORT:-8080}
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Lucrai.API.dll"]
```

> **Nota:** porta dinâmica `${PORT:-8080}` (Railway-compatible). `curl` instalado para o healthcheck do compose.

---

## CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend:
    name: Backend - Build & Test
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend
    steps:
      - uses: actions/checkout@v4
      - name: Setup .NET 10
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: "10.0.x"
      - name: Restore dependencies
        run: dotnet restore
      - name: Build
        run: dotnet build --no-restore --configuration Release
      - name: Test
        run: dotnet test --no-restore --configuration Release --verbosity normal

  frontend:
    name: Frontend - Lint & Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"
      - name: Install dependencies
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Build
        run: npm run build

  docker:
    name: Docker - Validate Images
    needs: [backend, frontend]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      - name: Build backend image
        uses: docker/build-push-action@v6
        with:
          context: ./backend
          file: ./backend/src/Lucrai.API/Dockerfile
          push: false
      - name: Build frontend image
        uses: docker/build-push-action@v6
        with:
          context: ./
          file: ./frontend.Dockerfile
          push: false
```

> **Nota:** Os testes usam `DatabaseProvider=InMemory`, portanto não precisam de PostgreSQL no CI. O deploy é feito via Railway (auto-deploy ao push em `main`).

---

## Desenvolvimento Local

### Pré-requisitos

- .NET SDK 10.0+
- Docker Desktop (para PostgreSQL)
- Node.js 22+
- Visual Studio 2022+ / VS Code / JetBrains Rider

### Setup

```bash
# 1. Subir PostgreSQL (serviço postgres — profile default)
docker compose up -d postgres

# 2. Rodar API (migrations + seed automáticos)
cd backend
dotnet run --project src/Lucrai.API

# 3. Rodar front-end (outro terminal)
cd ..
npm run dev
```

> **Alternativa:** `npm run dev:all` (verifica Docker via `scripts/ensure-docker.ts`, sobe `postgres`, aguarda DB via `scripts/wait-for-db.ts`, sobe API + frontend). `npm run dev:full` adiciona o profile `full` (api + web em containers).

### Configuração de Ambiente

```json
// appsettings.Development.json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=lucrai;Username=lucrai;Password=devpass"
  },
  "Jwt": {
    "Key": "dev-secret-key-lucrai-at-least-32-chars!!",
    "Issuer": "lucrai-api",
    "Audience": "lucrai-frontend",
    "ExpiresInMinutes": 15
  },
  "RefreshToken": {
    "ExpiresInDays": 7
  },
  "Cors": {
    "Origins": ["http://localhost:3000"]
  }
}
```

### Banco de Dados Configurável

O `Program.cs` suporta dois providers via config:

| Provider | Uso |
|---|---|
| `PostgreSQL` (default) | Produção — usa Npgsql + ConnectionString |
| `InMemory` | Testes — usa EF Core InMemory Database |

```bash
# Para usar InMemory localmente:
dotnet run --project src/Lucrai.API --DatabaseProvider=InMemory
```

---

## Decisões Arquiteturais

### Clean Architecture
Separação clara entre domínio (Core), infraestrutura (Infrastructure) e apresentação (API). O Core não tem dependência externa — apenas .NET puro. A Infrastructure implementa as interfaces definidas no Core. A API orquesta tudo via DI.

### Repository Pattern
Cada entidade tem seu repositório. Abstrai o EF Core do resto da aplicação, facilitando testes e possível troca de ORM no futuro.

### ASP.NET Identity + JWT
Combina a maturidade do Identity (password hashing, lockout, user manager) com a flexibilidade do JWT para APIs stateless. Refresh token rotativo previne vazamento de sessão.

### Multi-tenancy por Compartilhamento
Uma única database, tabelas com campo `Company`. Mais simples que banco por tenant, adequado para o porte atual. Índices garantem performance. Futuramente pode evoluir para schema-based ou database-based.

### Display ID Sequencial
IDs amigáveis (#001, #002) para comunicação com usuários, mantendo UUIDs como chave primária para integridade referencial.

### Soft Delete com TTL
Evita perda acidental de dados. Prazo de 30 dias para restauração, seguido de limpeza automática.
