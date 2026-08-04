# LUCRAÍ Core — Arquitetura

## Visão Geral

O LUCRAÍ Core é uma aplicação **full-stack** com frontend Next.js 15 (App Router) e backend .NET 10 + PostgreSQL. O frontend opera **100% via API REST** do backend: o IndexedDB (Dexie.js) foi completamente removido (sprints 9–11) e todos os dados são persistidos no PostgreSQL via a camada de API repositories.

```
┌──────────────────────────────────────────────────────────┐
│                     Navegador                             │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Next.js 15 (App Router)                │  │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────────────┐    │  │
│  │  │  Pages  │ │Components│ │   Layout (Shell)  │    │  │
│  │  └────┬────┘ └────┬─────┘ └──────────────────┘    │  │
│  │       │           │                                │  │
│  │  ┌────▼───────────▼────────────────────────────┐   │  │
│  │  │           Zustand Stores                     │   │  │
│  │  │   (auth, theme, sidebar, toast)              │   │  │
│  │  └────────────────┬────────────────────────────┘   │  │
│  │                   │                                │  │
│  │  ┌────────────────▼────────────────────────────┐   │  │
│  │  │     API Repositories (fetch layer)            │   │  │
│  │  │   transactions, categories, users, etc.      │   │  │
│  │  └────────────────┬────────────────────────────┘   │  │
│  │          ┌────────▼────────┐  │  │
│  │          │  HTTP (fetch)   │  │  │
│  │          │  → Backend API  │  │  │
│  │          └────────┬────────┘  │  │
│  └───────────────────┼───────────┘  │
└──────────────────────┼──────────────┘
                       │ HTTP
┌──────────────────────▼──────────────────────┴────────────┐
│                  Docker Container                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │          .NET 10 Web API (C#)                       │ │
│  │  ┌──────────┐  ┌────────────────┐  ┌────────────┐  │ │
│  │  │Controllers│  │ Infrastructure │  │   Core     │  │ │
│  │  │ (REST)   │  │ (EF Core,      │  │ (Entities, │  │ │
│  │  │          │  │  Repositories) │  │  DTOs)     │  │ │
│  │  └──────────┘  └────────┬───────┘  └────────────┘  │ │
│  │                         │                           │ │
│  │  ┌──────────────────────▼──────────────────────┐    │ │
│  │  │        PostgreSQL (via Npgsql)              │    │ │
│  │  └─────────────────────────────────────────────┘    │ │
│  └─────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

## Estrutura de Pastas

### Frontend (Next.js 15)

```
src/
├── app/                           # Páginas (Next.js App Router)
│   ├── globals.css                # Estilos globais + temas CSS
│   ├── layout.tsx                 # Layout raiz (fontes, tema, metadata)
│   ├── page.tsx                   # Rota / — landing page (13 seções)
│   ├── login/page.tsx             # Tela de login
│   ├── cadastro/page.tsx          # Onboarding multi-etapa (cadastro de empresa)
│   ├── bem-vindo/page.tsx         # Tela pós-cadastro
│   ├── trocar-senha/page.tsx      # Troca de senha (mustChangePassword)
│   ├── dashboard/page.tsx         # Dashboard executivo
│   ├── dashboard/indicadores/     # Central de Inteligência Financeira
│   ├── dashboard/resumo-cfo/      # Resumo do CFO
│   ├── dashboard/projecoes/       # Projeções financeiras
│   ├── dashboard/alertas/         # Alertas inteligentes
│   ├── financial/page.tsx         # Gestão de transações
│   ├── cash-forecast/page.tsx     # Previsão de caixa
│   ├── categories/page.tsx        # Gerenciamento de categorias
│   ├── reports/page.tsx           # Relatórios anuais
│   ├── users/page.tsx             # Gerenciamento de usuários
│   ├── trash/page.tsx             # Lixeira
│   ├── pricing/page.tsx           # Precificação
│   ├── pricing/insumos/           # Insumos (matéria-prima)
│   ├── pricing/fixed-costs/       # Custos fixos
│   ├── recibos/page.tsx           # Emissão de recibos
│   ├── documentos/                # Upload e gestão de documentos fiscais
│   ├── documentos/[id]/           # Detalhe do documento
│   ├── documentos/[id]/conferencia/ # Conferência do documento
│   ├── documentos/configuracoes/  # Configurações de documentos
│   └── settings/page.tsx          # Configurações da empresa
│
├── components/
│   ├── layout/                    # Componentes de layout
│   │   ├── shell.tsx              # Wrapper principal (sidebar + header + content)
│   │   ├── sidebar.tsx            # Navegação lateral colapsável
│   │   ├── header.tsx             # Topo com tema e avatar
│   │   ├── AuthInitializer.tsx    # Verificação de sessão nas rotas protegidas
│   │   └── InactivityTracker.tsx  # Timeout de inatividade (15 min)
│   ├── landing/                   # Landing page (17 componentes: hero, features, pricing, FAQ...)
│   ├── dashboard/                 # Componentes do dashboard
│   │   ├── stats-cards.tsx        # 4 cards financeiros filtráveis
│   │   ├── chart-revenue.tsx      # Gráfico de barras receita x despesa
│   │   ├── chart-categories.tsx   # Gráfico de pizza por categoria
│   │   ├── recent-transactions.tsx # Tabela de últimas movimentações
│   │   └── financial-health.tsx   # Indicador de saúde financeira
│   ├── financial/                 # Componentes do módulo financeiro
│   │   ├── transaction-form.tsx   # Formulário de criação/edição
│   │   ├── transaction-list.tsx   # Tabela de transações
│   │   └── delete-dialog.tsx      # Diálogo de exclusão
│   └── ui/                        # Componentes de UI (shadcn/ui — 23 arquivos)
│       ├── avatar, badge, button, card, checkbox
│       ├── dialog, dropdown-menu, input, label, select
│       ├── combobox, calendar, date-picker, accordion, collapsible
│       ├── popover, tooltip, tabs, textarea, toast, switch, skeleton, separator
│
├── services/
│   ├── api.ts                     # Cliente HTTP (Bearer, refresh automático, ApiError)
│   └── api-repositories/          # Camada de API REST (14 repositórios)
│       ├── transactions.ts, categories.ts, cash-forecast.ts, users.ts
│       ├── settings.ts, trash.ts, documents.ts, indicators.ts
│       ├── pricing.ts, fixed-costs.ts, insumos.ts, recibos.ts, signature.ts, contas.ts
│
├── store/                         # 5 stores Zustand (persistência manual)
│   ├── auth-store.ts             # Estado de autenticação (sessionStorage)
│   ├── theme-store.ts            # Estado do tema visual (localStorage)
│   ├── sidebar-store.ts          # Estado da sidebar (localStorage)
│   ├── recibos-store.ts          # Filtros da página de recibos
│   └── periodo-store.ts          # Filtro de período (ano/mês)
│
├── hooks/                         # Hooks customizados (useDadosFiltrados, useAlertsCount, ...)
├── lib/                           # Utilitários (cn, formatadores, validações)
├── types/                         # Definições de tipos TypeScript
└── utils/                         # Funções utilitárias (valor por extenso, trial, etc.)
```

### Backend (.NET 10)

```
backend/
├── src/
│   ├── Lucrai.API/              # ASP.NET Web API
│   │   ├── Controllers/         # Controladores REST (24 controllers, 138 endpoints)
│   │   │   ├── AuthController.cs, UsersController.cs, TransactionsController.cs
│   │   │   ├── CategoriesController.cs, CashForecastsController.cs
│   │   │   ├── TrashController.cs, DashboardController.cs, SettingsController.cs
│   │   │   ├── AuditController.cs, ContasController.cs, HealthController.cs
│   │   │   ├── DocumentosController.cs, DocumentoAprendizadoController.cs, DocumentoConfigController.cs
│   │   │   ├── RecibosController.cs, SignatureController.cs
│   │   │   ├── PricingController.cs, InsumosController.cs, FixedCostsController.cs
│   │   │   ├── AccountsPayableController.cs, AccountsReceivableController.cs
│   │   │   ├── DebtsController.cs, InvestmentsController.cs, BalanceAccountsController.cs
│   │   ├── Middleware/
│   │   │   ├── ExceptionHandlingMiddleware.cs
│   │   │   └── TenantContextMiddleware.cs   # Extrai Company/User do JWT → ITenantContext
│   │   ├── Validators/          # Validação com FluentValidation (35 validators)
│   │   ├── Program.cs           # Entry point + DI (25 registros)
│   │   └── appsettings.json
│   │
│   ├── Lucrai.Core/             # Domínio puro (sem dependências externas)
│   │   ├── Entities/            # 25 entidades
│   │   ├── DTOs/                # Data Transfer Objects
│   │   ├── Interfaces/          # 22 repositórios + 2 serviços + ITenantContext
│   │   └── Services/            # DashboardIntelligenceService, AlertasService
│   │
│   └── Lucrai.Infrastructure/   # Infraestrutura
│       ├── Data/                # DbContext + ApplyTenantFilters (23 entidades)
│       ├── Repositories/        # 22 implementações dos repositórios
│       ├── Migrations/          # 23 migrations EF Core
│       └── Seed/                # DataSeeder com usuários + categorias padrão
│
├── tests/
│   └── Lucrai.API.Tests/        # Testes xUnit (87 testes)
│       ├── Controllers/         # 13 arquivos de teste de controllers
│       ├── Services/            # DashboardIntelligenceServiceTests, AlertasServiceTests
│       └── CustomWebApplicationFactory.cs
│
└── src/Lucrai.API/Dockerfile    # Dockerfile do backend (multi-stage)
```

## Fluxo de Autenticação

1. Usuário acessa `/login`
2. Preenche email e senha
3. Frontend faz POST `/api/auth/login` com email + senha
4. Backend valida credenciais via ASP.NET Identity (PasswordHasher com hash)
5. Retorna JWT token + dados do usuário (incluindo `mustChangePassword`)
6. Frontend salva token e dados em `sessionStorage` + Zustand (fechar aba = logout)
7. Redireciona para `/dashboard` (ou `/login/change-password` se `mustChangePassword = true`)
8. Em cada requisição à API, o token JWT é enviado no header `Authorization: Bearer`
9. Em cada página protegida, o `AuthInitializer` verifica o token e redireciona se expirado

## Banco de Dados

### PostgreSQL — Tabelas Principais

| Table                    | Description                                      |
|--------------------------|--------------------------------------------------|
| Transactions             | Lançamentos financeiros realizados               |
| CashForecasts            | Previsões futuras (receber/pagar)               |
| Categories               | Categorias financeiras por tipo (entrada/saída) |
| AspNetUsers              | Usuários (Identity + campos customizados)       |
| AspNetRoles              | Papéis (Owner, Admin, Financial, Viewer)        |
| DeletedItems             | Registros excluídos (lixeira)                   |
| AuditLogs                | Auditoria de ações do sistema                   |
| RefreshTokens            | Refresh tokens rotativos                        |
| DismissedAlerts          | Alertas dispensados pelo usuário                |
| Contas / CompanyRegistrations | Cadastro de empresas (pré-aprovação)        |
| CompanySettings          | Configurações da empresa                        |
| DocumentoFinanceiro      | Upload de documentos fiscais                    |
| DocumentoAprendizado     | Reconhecimento de tipos de documento            |
| DocumentoConfiguracao    | Configuração do módulo por empresa              |
| DocumentoLog             | Log de operações em documentos                  |
| DocumentoTrash           | Lixeira de documentos (30 dias)                 |
| FixedCosts               | Custos fixos mensais                            |
| Insumos                  | Matérias-primas (pricing)                       |
| PricingProducts          | Produtos precificados                           |
| Recibos                  | Recibos emitidos (com soft delete)              |
| SignatureConfig          | Configuração de assinatura digital              |
| AccountsPayable          | Contas a pagar (aging buckets)                  |
| AccountsReceivable       | Contas a receber (aging buckets)                |
| Debts                    | Dívidas (net debt / alavancagem)                |
| Investments              | Investimentos (ROI, IRR, NPV, payback)          |
| BalanceAccounts          | Plano de contas (Ativo/Passivo/PL)              |

### Multi-tenancy no Banco

O isolamento é feito por **filtro global** (`HasQueryFilter`) aplicado em **23 das 25 entidades**, combinando dois níveis:

- **Empresa (tenant):** `Company == CurrentCompany` — extraído do JWT pelo `TenantContextMiddleware`
- **Usuário (nível de isolamento):** `CreatedBy == null || CreatedBy == CurrentUserId` (ou equivalente por entidade) — migração `AddUserLevelIsolation`

Apenas `CompanyRegistration` e `RefreshToken` não possuem filtro (não pertencem a um tenant).

## Padrões Arquiteturais

### API Repository Pattern (Frontend)
Cada entidade possui um repositório em `src/services/api-repositories/` (14 repositórios) que faz chamadas HTTP para o backend via `src/services/api.ts` (cliente com Bearer token automático, refresh de token e tratamento de erros).

### Backend Layers
- **Controllers** — Recebem requisições, validam (FluentValidation), chamam repositórios, retornam DTOs
- **Core (Entities + DTOs + Services)** — Domínio rico sem dependências externas
- **Infrastructure (EF Core)** — Acesso a dados com PostgreSQL via Npgsql, filtros de tenant
- **Middleware** — `TenantContextMiddleware` (multi-tenancy), `ExceptionHandlingMiddleware` (erros globais)

### State Management (Zustand)
- 5 stores pequenas e focadas (auth, theme, sidebar, recibos, período)
- Persistência manual em `sessionStorage` (auth) e `localStorage` (theme, sidebar)
- Sem dependência entre stores

### Componentes shadcn/ui
- Componentes de UI baseados em Radix UI Primitives
- Todos os componentes aceitam `className` via `cn()` para personalização
- Variantes gerenciadas via `class-variance-authority`

### Data Flow
```
User Action → Page Component → API Repository → HTTP Request → Backend Controller
                                                                      ↓
                                                               Repository (EF Core)
                                                                      ↓
                                                               PostgreSQL
                                                                      ↓
                                                               Response (JSON)
                                                                      ↓
User ← Re-render ← Page Component ← API Repository ← HTTP Response
```

## Integrações

| Integração | Status |
|------------|--------|
| API REST própria (.NET 10) | ✅ Ativa |
| PostgreSQL (via Neon/Railway) | ✅ Ativa |
| Autenticação JWT + Refresh Token | ✅ Ativa |
| Upload de documentos (OCR + IA) | ✅ Ativa |
| OCR (Tesseract.js) + IA (OpenAI/Gemini) | ✅ Ativa (frontend) |
| Geração de PDF (recibos via jsPDF/html2canvas) | ✅ Ativa |
| Parse de NF-e (XML + DANFE) | ✅ Ativa (frontend) |
| Backup/restore para arquivo | 🔜 Planejado |
| API bancária (Open Finance) | 🔜 Planejado |

## Temas

Dois temas visuais controlados pelo atributo `data-theme` no `<html>`:

| Tema       | data-theme   | Perfil                          |
|------------|--------------|---------------------------------|
| Normal     | `"normal"`   | Escuro padrão (fundo #0a0f1e)   |
| Dark Mega  | `"dark-mega"`| Ultra escuro (fundo #0a0b0d)    |

Cada tema define ~30 variáveis CSS customizadas. A troca é feita via `theme-store.ts` que atualiza o atributo no `<html>` e persiste a escolha.
