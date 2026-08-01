# LUCRAÍ Core — Arquitetura

## Visão Geral

O LUCRAÍ Core é uma aplicação **full-stack** com frontend Next.js 15 (App Router) e backend .NET 10 + PostgreSQL. O frontend opera em modo **híbrido**: os dados são buscados via API REST do backend, mas o IndexedDB (Dexie.js) mantém uma camada de fallback offline e armazenamento local para entidades que ainda não possuem backend.

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
│  │                   │                      ▲          │  │
│  │          ┌────────▼────────┐     ┌───────┴──────┐  │  │
│  │          │  HTTP (fetch)   │     │ Dexie.js     │  │  │
│  │          │  → Backend API  │     │ (fallback)   │  │  │
│  │          └────────┬────────┘     └───────▲──────┘  │  │
│  └───────────────────┼──────────────────────┼─────────┘  │
└──────────────────────┼──────────────────────┼────────────┘
                       │ HTTP                 │
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
│   ├── page.tsx                   # Rota / — redireciona conforme auth
│   ├── login/page.tsx             # Tela de login
│   ├── dashboard/page.tsx         # Dashboard executivo
│   ├── financial/page.tsx         # Gestão de transações
│   ├── cash-forecast/page.tsx     # Previsão de caixa
│   ├── categories/page.tsx        # Gerenciamento de categorias
│   ├── reports/page.tsx           # Relatórios anuais
│   ├── indicadores/page.tsx       # Central de Inteligência Financeira
│   ├── users/page.tsx             # Gerenciamento de usuários
│   ├── trash/page.tsx             # Lixeira
│   ├── pricing/page.tsx           # Precificação (insumos + custos fixos)
│   ├── documentos/                # Upload e gestão de documentos fiscais
│   ├── recibos/page.tsx           # Emissão de recibos
│   └── settings/page.tsx          # Configurações da empresa
│
├── components/
│   ├── layout/                    # Componentes de layout
│   │   ├── shell.tsx              # Wrapper principal (sidebar + header + content)
│   │   ├── sidebar.tsx            # Navegação lateral colapsável
│   │   └── header.tsx             # Topo com tema e avatar
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
│   └── ui/                        # Componentes de UI (shadcn/ui)
│       ├── avatar.tsx, badge.tsx, button.tsx, card.tsx
│       ├── dialog.tsx, dropdown-menu.tsx
│       ├── input.tsx, label.tsx, select.tsx
│       ├── separator.tsx, skeleton.tsx, switch.tsx
│       ├── tabs.tsx, textarea.tsx, toast.tsx
│
├── services/
│   └── api-repositories/          # Camada de API REST (16 repositórios)
│       ├── transactions.ts        # CRUD via backend API
│       ├── categories.ts          # CRUD via backend API
│       ├── cash-forecast.ts       # CRUD via backend API
│       ├── users.ts               # CRUD via backend API
│       ├── settings.ts            # Configurações via backend API
│       ├── trash.ts               # Lixeira via backend API
│       ├── audit.ts               # Auditoria via backend API
│       ├── dashboard.ts           # Dados do dashboard via backend API
│       ├── indicators.ts          # Indicadores financeiros via backend API
│       ├── contas.ts              # Gestão de contas via backend API
│       ├── documents.ts           # Documentos fiscais via backend API
│       ├── pricing.ts             # Pricing via backend API
│       ├── fixed-costs.ts         # Custos fixos via backend API
│       ├── insumos.ts             # Insumos via backend API
│       ├── recibos.ts             # Recibos via backend API
│       └── signature.ts           # Assinatura digital via backend API
│
├── database/
│   ├── dexie.ts                   # Classe LucraiDatabase (schema v14)
│   ├── seed.ts                    # Dados iniciais (fallback offline)
│   └── repositories/             # Repositórios Dexie (fallback offline)
│       ├── transactions.ts       # CRUD + sumários + auditoria
│       ├── categories.ts         # CRUD + detecção duplicatas
│       ├── cash-forecast.ts      # CRUD + status
│       ├── users.ts              # CRUD + autenticação
│       ├── settings.ts           # Configurações da empresa
│       ├── trash.ts              # Soft delete + restauração
│       └── audit.ts              # Log de auditoria
│
├── lib/
│   ├── cn.ts                     # Utilitário de classes Tailwind
│   └── utils.ts                  # Funções utilitárias (formatação, validação, etc.)
│
├── store/
│   ├── auth-store.ts             # Estado de autenticação
│   ├── theme-store.ts            # Estado do tema visual
│   └── sidebar-store.ts          # Estado da sidebar
│
└── types/
    ├── index.ts                  # Definições de tipos TypeScript
    └── api.ts                    # Tipos das respostas da API
```

### Backend (.NET 10)

```
backend/
├── src/
│   ├── Lucrai.API/              # ASP.NET Web API
│   │   ├── Controllers/         # Controladores REST (14 controllers)
│   │   │   ├── AuthController.cs
│   │   │   ├── UsersController.cs
│   │   │   ├── TransactionsController.cs
│   │   │   ├── CategoriesController.cs
│   │   │   ├── CashForecastsController.cs
│   │   │   ├── TrashController.cs
│   │   │   ├── DashboardController.cs
│   │   │   ├── IndicadoresController.cs
│   │   │   ├── AlertasController.cs
│   │   │   ├── ContasController.cs
│   │   │   ├── DocumentosController.cs
│   │   │   ├── PricingController.cs
│   │   │   ├── RelatoriosController.cs
│   │   │   └── AuditController.cs
│   │   ├── Services/            # Serviços de aplicação
│   │   │   ├── DashboardIntelligenceService.cs
│   │   │   └── AlertasService.cs
│   │   ├── Validators/          # Validação com FluentValidation
│   │   └── Program.cs           # Entry point + DI
│   │
│   ├── Lucrai.Core/             # Domínio
│   │   ├── Entities/            # Entidades (Transaction, Category, User, etc.)
│   │   ├── DTOs/                # Data Transfer Objects
│   │   └── Interfaces/          # Contratos de repositórios
│   │
│   └── Lucrai.Infrastructure/   # Infraestrutura
│       ├── Data/                # DbContext + configurações EF Core
│       ├── Repositories/        # Implementações dos repositórios
│       ├── Migrations/          # Migrations EF Core (~16 migrations)
│       └── Seed/                # DataSeeder com usuários + categorias padrão
│
├── tests/
│   └── Lucrai.Tests/            # Testes unitários (xUnit, 83 testes)
│       ├── Controllers/
│       └── Services/
│
├── Dockerfile                   # Dockerfile do backend
└── docker-compose.yml           # Orquestração local (API + PostgreSQL)
```

## Fluxo de Autenticação

1. Usuário acessa `/login`
2. Preenche email e senha
3. Frontend faz POST `/api/auth/login` com email + senha
4. Backend valida credenciais via ASP.NET Identity (PasswordHasher com hash)
5. Retorna JWT token + dados do usuário (incluindo `mustChangePassword`)
6. Frontend salva token e dados em `localStorage` + Zustand
7. Redireciona para `/dashboard` (ou `/login/change-password` se `mustChangePassword = true`)
8. Em cada requisição à API, o token JWT é enviado no header `Authorization: Bearer`
9. Em cada página protegida, o `AuthInitializer` verifica o token e redireciona se expirado

## Banco de Dados

### PostgreSQL — Tabelas Principais

| Tabela                  | Descrição                                      |
|-------------------------|------------------------------------------------|
| Transactions            | Lançamentos financeiros realizados             |
| CashForecasts           | Previsões futuras (receber/pagar)              |
| Categories              | Categorias financeiras por tipo (entrada/saída)|
| AspNetUsers             | Usuários (Identity + campos customizados)      |
| AspNetRoles             | Papéis (Owner, Admin, Financial, Viewer)       |
| DeletedItems            | Registros excluídos (lixeira)                  |
| AuditLogs               | Auditoria de ações do sistema                  |
| Contas                  | Contas bancárias                               |
| DocumentoFinanceiro     | Upload de documentos fiscais                   |
| DocumentoAprendizado    | Reconhecimento de tipos de documento           |
| DocumentoLog            | Log de operações em documentos                 |
| FixedCosts              | Custos fixos mensais                           |
| Insumos                 | Matérias-primas (pricing)                      |
| PricingProducts         | Produtos precificados                          |
| Recibos                 | Recibos emitidos                               |
| SignatureConfig         | Configuração de assinatura digital             |
| CompanyRegistrations    | Cadastro de empresas (pré-aprovação)           |

### IndexedDB (Dexie.js) — Fallback Offline

Schema v14 — usado como fallback para páginas que ainda não foram migradas para API e para cenários offline.

| Tabela               | Chave     | Índices                                                    |
|----------------------|-----------|------------------------------------------------------------|
| transactions         | id        | displayId, type, categoryId, date, createdAt, company      |
| categories           | id        | type, name, company                                        |
| users                | id        | email, role, company                                       |
| settings             | id        | company                                                    |
| deletedTransactions  | id        | originalId, displayId, deletedAt, restoreUntil, company, createdBy |
| cashForecasts        | id        | displayId, type, status, expectedDate, company, isRecurring|
| auditLogs            | id        | entityId, entityType, action, company, timestamp           |

## Padrões Arquiteturais

### API Repository Pattern (Frontend)
Cada entidade possui um repositório em `src/services/api-repositories/` que faz chamadas HTTP para o backend. Quando a API está indisponível, algumas operações fazem fallback para o Dexie.

### Backend Layers
- **Controllers** — Recebem requisições, validam, chamam repositórios, retornam DTOs
- **Core (Entities + DTOs)** — Domínio rico sem dependências externas
- **Infrastructure (EF Core)** — Acesso a dados com PostgreSQL via Npgsql

### State Management (Zustand)
- Stores pequenas e focadas (auth, theme, sidebar)
- Persistência seletiva em localStorage
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
| PostgreSQL (via Railway) | ✅ Ativa |
| Autenticação JWT | ✅ Ativa |
| Upload de documentos | ✅ Ativa |
| Exportação para PDF | 🔜 Planejado |
| Backup/restore para arquivo | 🔜 Planejado |
| API bancária (Open Finance) | 🔜 Planejado |

## Temas

Dois temas visuais controlados pelo atributo `data-theme` no `<html>`:

| Tema       | data-theme   | Perfil                          |
|------------|--------------|---------------------------------|
| Normal     | `"normal"`   | Escuro padrão (fundo #0a0f1e)   |
| Dark Mega  | `"dark-mega"`| Ultra escuro (fundo #0a0b0d)    |

Cada tema define ~30 variáveis CSS customizadas. A troca é feita via `theme-store.ts` que atualiza o atributo no `<html>` e persiste a escolha.
