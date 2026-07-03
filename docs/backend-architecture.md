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
├── Lucrai.sln
├── src/
│   ├── Lucrai.API/
│   │   ├── Controllers/
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
│   │   │   └── ContasController.cs
│   │   ├── Middleware/
│   │   │   ├── ExceptionHandlingMiddleware.cs
│   │   │   └── TenantContextMiddleware.cs
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   └── Dockerfile
│   │
│   ├── Lucrai.Core/
│   │   ├── Entities/
│   │   │   ├── Transaction.cs
│   │   │   ├── Category.cs
│   │   │   ├── User.cs
│   │   │   ├── CashForecast.cs
│   │   │   ├── PricingProduct.cs
│   │   │   ├── DeletedItem.cs
│   │   │   ├── AuditLog.cs
│   │   │   ├── CompanySettings.cs
│   │   │   └── CompanyRegistration.cs
│   │   ├── Enums/
│   │   │   ├── TransactionType.cs
│   │   │   ├── ForecastStatus.cs
│   │   │   ├── UserRole.cs
│   │   │   ├── AuditAction.cs
│   │   │   └── EntryType.cs
│   │   ├── DTOs/
│   │   │   ├── Auth/
│   │   │   ├── Transactions/
│   │   │   ├── Categories/
│   │   │   ├── Forecasts/
│   │   │   ├── Users/
│   │   │   ├── Trash/
│   │   │   ├── Audit/
│   │   │   ├── Settings/
│   │   │   ├── Pricing/
│   │   │   ├── Dashboard/
│   │   │   └── Contas/
│   │   ├── Interfaces/
│   │   │   ├── ITransactionRepository.cs
│   │   │   ├── ICategoryRepository.cs
│   │   │   ├── ICashForecastRepository.cs
│   │   │   ├── IUserRepository.cs
│   │   │   ├── ITrashRepository.cs
│   │   │   ├── IAuditRepository.cs
│   │   │   ├── ISettingsRepository.cs
│   │   │   └── IPricingRepository.cs
│   │   └── Services/
│   │       ├── IDashboardIntelligenceService.cs
│   │       ├── DashboardIntelligenceService.cs
│   │       ├── IAlertasService.cs
│   │       └── AlertasService.cs
│   │
│   └── Lucrai.Infrastructure/
│       ├── Data/
│       │   ├── LucraiDbContext.cs
│       │   └── EntityConfigurations/
│       │       ├── TransactionConfiguration.cs
│       │       ├── CategoryConfiguration.cs
│       │       ├── UserConfiguration.cs
│       │       ├── CashForecastConfiguration.cs
│       │       └── ...
│       ├── Repositories/
│       │   ├── TransactionRepository.cs
│       │   ├── CategoryRepository.cs
│       │   ├── CashForecastRepository.cs
│       │   ├── UserRepository.cs
│       │   ├── TrashRepository.cs
│       │   ├── AuditRepository.cs
│       │   ├── SettingsRepository.cs
│       │   └── PricingRepository.cs
│       ├── Migrations/
│       └── Seed/
│           └── DataSeeder.cs
│
├── tests/
│   └── Lucrai.API.Tests/
│       ├── Services/
│       ├── Controllers/
│       └── Integration/
│
├── .dockerignore
└── Dockerfile
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

Todas as tabelas possuem um campo `Company` (string). Toda query é filtrada por ele automaticamente via **tenant interceptor**. O `Company` é extraído do JWT do usuário autenticado — nunca confiado em parâmetros de requisição.

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
  "sub": "guid-do-usuario",
  "email": "usuario@empresa.com",
  "name": "Nome do Usuário",
  "role": "admin",
  "company": "Nome da Empresa",
  "iat": 1719000000,
  "exp": 1719000900
}
```

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
| POST | /api/dashboard/projection | Projeção financeira |
| POST | /api/dashboard/runway | Cálculo de runway |
| POST | /api/dashboard/breakeven | Ponto de equilíbrio |
| POST | /api/dashboard/health | Saúde financeira |
| POST | /api/dashboard/alerts | Alertas inteligentes |

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
- **JWT:** Chave assimétrica ou simétrica (configurada via `appsettings.json` / environment secrets).
- **Refresh Token:** Opaco, armazenado em tabela `RefreshTokens` no banco, com rotação a cada uso.
- **HTTPS:** Exigido em produção. Redirecionamento automático.
- **CORS:** Restrito às origens do front-end (Vercel, domínio customizado).
- **Rate Limiting:** Recomendado nos endpoints de autenticação.
- **Validação:** FluentValidation ou `System.ComponentModel.DataAnnotations` em todos os DTOs.
- **SQL Injection:** Prevenido nativamente pelo EF Core (parameterized queries).

---

## Estratégia de Testes

### Back-end (xUnit + WebApplicationFactory)

```
tests/Lucrai.API.Tests/
├── Services/
│   ├── DashboardIntelligenceServiceTests.cs
│   └── AlertasServiceTests.cs
├── Controllers/
│   ├── TransactionsControllerTests.cs
│   ├── AuthControllerTests.cs
│   └── ...
└── Integration/
    └── ApiFixture.cs           # WebApplicationFactory<Program>
```

- **Testes de unidade:** Serviços de domínio puros (Dashboard, Alertas), sem dependência externa.
- **Testes de integração:** Controllers com banco PostgreSQL real via Testcontainers ou banco in-memory + WebApplicationFactory.
- **Cobertura:** Mínimo 70% nas regras de negócio.

### Front-end (Vitest + React Testing Library + Playwright)

- **Unitários:** Hooks, utils, componentes isolados (já existentes).
- **Integração:** Fluxos completos mockando a API.
- **E2E (Playwright):** Fluxos críticos — login → criar transação → ver dashboard → marcar forecast como pago.

---

## Docker

```yaml
# docker-compose.yml
services:
  api:
    build:
      context: ./backend
      dockerfile: src/Lucrai.API/Dockerfile
    ports:
      - "5000:8080"
    environment:
      ASPNETCORE_ENVIRONMENT: Development
      ConnectionStrings__Default: ${DB_CONNECTION_STRING}
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: lucrai
      POSTGRES_USER: lucrai
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U lucrai"]
      interval: 5s
      timeout: 5s
      retries: 5
```

### Dockerfile (API)

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet publish src/Lucrai.API/Lucrai.API.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Lucrai.API.dll"]
```

---

## CI/CD (GitHub Actions)

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: lucrai-test
          POSTGRES_USER: lucrai
          POSTGRES_PASSWORD: testpass
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: "10.0.x"
      - run: dotnet restore ./backend
      - run: dotnet build ./backend --no-restore --configuration Release
      - run: dotnet test ./backend --no-build --configuration Release

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
      - run: npm ci
      - run: npm run build --if-present
      - run: npx playwright install --with-deps
      - run: npm test

  e2e:
    needs: [backend, frontend]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
```

---

## Desenvolvimento Local

### Pré-requisitos

- .NET SDK 10.0+
- Docker Desktop (para PostgreSQL)
- Node.js 22+
- Visual Studio 2022+ / VS Code / JetBrains Rider

### Setup

```bash
# 1. Subir PostgreSQL
docker compose up -d db

# 2. Aplicar migrations
cd backend
dotnet ef database update --project src/Lucrai.Infrastructure --startup-project src/Lucrai.API

# 3. Rodar API
dotnet run --project src/Lucrai.API

# 4. Rodar front-end (outro terminal)
cd ..
npm run dev
```

### Configuração de Ambiente

```json
// appsettings.Development.json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=lucrai;Username=lucrai;Password=devpass"
  },
  "Jwt": {
    "Key": "dev-secret-key-at-least-32-chars-long!!",
    "Issuer": "lucrai-api",
    "Audience": "lucrai-frontend",
    "ExpiresInMinutes": 15
  },
  "RefreshToken": {
    "ExpiresInDays": 7
  }
}
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
