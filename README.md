<a name="top"></a>

<p align="center">
  <img src="public/images/lucrai/logo-lucrai-sem-fundo-otimizada.png" alt="LUCRAÍ" width="220" />
</p>

<h1 align="center">🚀 LUCRAÍ — Intelligent Digital CFO</h1>

<p align="center">
  Financial management SaaS for Brazilian SMBs — a <strong>Digital CFO</strong> that interprets your data.<br/>
  SaaS de gestão financeira para PMEs brasileiras — um <strong>Diretor Financeiro Digital</strong> que interpreta seus dados.
</p>

<p align="center">
  <a href="#english">🇺🇸 English</a> &nbsp;·&nbsp; <a href="#portugues">🇧🇷 Português</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_15-App_Router-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript_5.8-strict-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/.NET_10-C%23-512BD4?style=flat-square&logo=dotnet&logoColor=white" alt=".NET 10" />
  <img src="https://img.shields.io/badge/EF_Core_10-512BD4?style=flat-square&logo=dotnet&logoColor=white" alt="EF Core 10" />
  <img src="https://img.shields.io/badge/PostgreSQL_16-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL 16" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white" alt="Vitest" />
  <img src="https://img.shields.io/badge/Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white" alt="Playwright" />
  <img src="https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white" alt="GitHub Actions" />
</p>

---

<a name="english"></a>
# 🇺🇸 English

<small>[🇧🇷 Português](#portugues) · [↑ Back to top](#top)</small>

## 📌 About

**LUCRAÍ** is a full-stack financial management SaaS built for **Brazilian small and medium businesses (SMBs)**, acting as an **Intelligent Digital CFO**. It provides cash-flow control, financial forecasts, management reports, and financial-health indicators in a modern, accessible, browser-based interface.

It positions itself as the financial intelligence layer **between spreadsheets** (Excel/Google Sheets) and **heavy corporate ERPs** (SAP, Oracle, TOTVS): lightweight, visual, and opinionated about good financial management practices.

Built by a two-person team, with the lead author responsible for **140 of 195 commits (~72%)** — most of the backend, financial intelligence, documents/receipts modules, tests, and DevOps.

## ✨ Features

| Module | Description |
|---|---|
| **Landing Page** | Institutional page with 13 sections (hero, features, pricing, FAQ…) |
| **Onboarding** | Multi-step signup with password-strength check and 14-day trial |
| **Dashboard** | Executive view with financial cards, charts, and company health |
| **Financial Intelligence** | CFO Center with 10 sub-tabs (P&L, cash-flow statement, trial balance, ledger, balance sheet…), natural-language **CFO note**, 12-month projection, cash runway, break-even, health score |
| **Finance** | CRUD of real transactions (income/expense) |
| **Cash Forecast** | Planning of future receipts and payments |
| **Categories** | Financial category management by type |
| **Reports** | Annual report separating forecast vs. realized |
| **Trash** | 30-day soft-delete with restore and permanent delete |
| **Users** | User management with role-based access control (RBAC) |
| **Settings** | Company data, logo, theme, password change |
| **Documents** | Fiscal document upload with **OCR** (Tesseract.js PT-BR), **AI extraction** (OpenAI GPT-4o / Gemini), and **NF-e XML/DANFE parsing**, plus a human review flow |
| **Pricing** | Cost-based pricing with inputs (unit conversion), fixed costs, and margins |
| **Receipts** | Receipt issuance with sequential numbering, CPF/CNPJ validation, **digital signature**, and browser-generated **PDF** |
| **Advanced Finance** | Accounts payable/receivable (aging), debts, investments (ROI/IRR/NPV) — backend |

## 🧰 Tech Stack

| Category | Technology |
|---|---|
| Frontend framework | Next.js 15 (App Router) + TypeScript 5.8 (strict) |
| Backend framework | .NET 10 (C#) — ASP.NET Core Web API |
| Database | PostgreSQL 16 |
| ORM | Entity Framework Core 10 + Npgsql |
| Auth | JWT + rotating refresh token + ASP.NET Core Identity (PBKDF2), RBAC |
| State (FE) | Zustand 5 (sessionStorage/localStorage persistence) |
| UI (FE) | shadcn/ui (23 components) + Radix UI + Tailwind CSS 3.4 |
| Charts | Recharts |
| Forms | react-hook-form + zod (two-layer validation with FluentValidation on the backend) |
| PDF / Extraction | jsPDF + html2canvas · tesseract.js + pdfjs-dist + DOMParser |
| AI | OpenAI API (GPT-4o Vision) · Google Gemini API |
| Themes | Custom system with 2 themes (Normal, Dark Mega) via CSS variables |
| Tests (BE) | xUnit — 87 tests + WebApplicationFactory + Moq |
| Tests (FE) | Vitest — 7 suites + Playwright — 6 E2E specs |
| Infra | Docker (compose + profiles) + Railway + Vercel + GitHub Actions |

## 🏗️ Architecture

Full-stack application: a **Next.js 15** frontend consuming a **.NET 10** REST API backed by **PostgreSQL**. The frontend uses an API-repository layer over a shared HTTP client (Bearer token + automatic refresh).

```
[ Browser ] → [ Next.js (React) ] → [ API Repositories ] → HTTP → [ .NET API ] → [ EF Core ] → [ PostgreSQL ]
```

Highlights:

- **Clean Architecture** on the backend: `Core` (pure domain) / `Infrastructure` (EF Core, repositories) / `API` (controllers, DI).
- **REST API with 24 controllers and 138 endpoints**, 22 repositories, centralized dependency injection, and 35 FluentValidation validators.
- **Multi-tenant** shared database with **global query filters on 23 of 25 entities** (company + user isolation) — security-validated by integration tests.
- **JWT authentication with rotating refresh tokens**, RBAC (`owner/admin/financial/viewer`), and hardened frontend sessions (sessionStorage, 15-min inactivity timeout).
- **25 entities, 23 EF Core migrations**, audit trail for every action, and 30-day TTL soft delete.

## 📁 Project Structure

```
lucrai_site/
├── src/                        # Next.js 15 frontend (App Router)
│   ├── app/                    # Pages and routes (SSR + SEO)
│   ├── components/             # shadcn/ui + feature components
│   ├── services/               # API repositories, documents/OCR services
│   ├── store/                  # Zustand stores (auth, theme)
│   ├── hooks/                  # Custom hooks
│   └── lib/                    # Utilities (currency, dates, etc.)
├── backend/
│   ├── src/Lucrai.API/         # .NET 10 Web API (controllers, DI, validators)
│   ├── src/Lucrai.Core/        # Domain entities, interfaces, domain services
│   ├── src/Lucrai.Infrastructure/  # EF Core, repositories, migrations, seed
│   └── tests/Lucrai.API.Tests/ # xUnit — 87 tests
├── e2e/                        # Playwright E2E specs (6)
├── docs/                       # Architecture, guides, sprint reports
├── scripts/                    # Dev automation (TypeScript)
├── .github/workflows/ci.yml    # CI: backend, frontend, Docker validation
├── docker-compose.yml
├── frontend.Dockerfile
└── package.json
```

## 🚀 Getting Started

**Requirements:** Node.js 20+, .NET 10 SDK, Docker (for PostgreSQL).

```bash
# 1. Configure environment
cp .env.example .env
# edit .env → set POSTGRES_PASSWORD

# 2. Install frontend dependencies
npm install

# 3. Full stack (PostgreSQL + API + Web via Docker)
npm run dev:full

# — or step by step —
npm run dev:db        # starts PostgreSQL via Docker (port 5433)
npm run dev:api       # dotnet watch run — backend on :5000
npm run dev           # Next.js dev — frontend on :3000
```

## 🧪 Testing

```bash
npm test              # Vitest — 7 frontend suites
npm run test:e2e      # Playwright — 6 E2E flows (mocked API)
dotnet test backend   # xUnit — 87 backend tests (integration + unit)
```

A **3-job CI pipeline** (GitHub Actions) runs the backend build + tests, frontend lint + build, and Docker image validation on every push.

## 📚 Documentation

- [Project context](docs/project-context.md)
- [Architecture](docs/architecture.md) · [Backend architecture](docs/backend-architecture.md)
- [Development guide](docs/dev-guide.md)
- [Deploy guide](docs/deploy-guide.md)
- [Decisions](docs/decisions.md) · [Roadmap](docs/roadmap.md)
- [Sprint reports](docs/reports/)

## 🗺️ Roadmap

1. **MVP** — Essential financial management _(done)_
2. **Post-MVP** — Export, customization, enhanced UX _(in progress)_
3. **Financial Intelligence** — Advanced metrics, alerts, projections _(done)_
4. **Digital CFO** — Automated recommendations, scenarios, executive reports _(in progress)_
5. **Financial AI** — Anomaly detection, automatic categorization, predictive insights

## 📄 License

[MIT](LICENSE) © 2026 **Lucraí**

---

<a name="portugues"></a>
# 🇧🇷 Português

<small>[🇺🇸 English](#english) · [↑ Voltar ao topo](#top)</small>

## 📌 Sobre

O **LUCRAÍ** é um SaaS full-stack de gestão financeira para **pequenas e médias empresas brasileiras**, atuando como um **Diretor Financeiro Digital inteligente**. Oferece controle de fluxo de caixa, previsões financeiras, relatórios gerenciais e indicadores de saúde financeira em uma interface moderna, acessível e 100% online.

Posiciona-se como a camada de inteligência financeira **entre as planilhas** (Excel/Google Sheets) e os **ERPs corporativos pesados** (SAP, Oracle, TOTVS): leve, visual e opinativo sobre boas práticas de gestão financeira.

Desenvolvido em dupla, com o autor principal responsável por **140 de 195 commits (~72%)** — a maior parte do backend, da inteligência financeira, dos módulos de documentos/recibos, dos testes e do DevOps.

## ✨ Funcionalidades

| Módulo | Descrição |
|---|---|
| **Landing Page** | Página institucional com 13 seções (hero, funcionalidades, pricing, FAQ…) |
| **Cadastro** | Onboarding multi-etapa com indicador de força de senha e trial de 14 dias |
| **Dashboard** | Visão executiva com cards financeiros, gráficos e saúde da empresa |
| **Inteligência Financeira** | Central CFO com 10 sub-abas (DRE, DFC, balancete, razão, balanço…), **nota CFO** em linguagem natural, projeção 12 meses, runway, breakeven, health score |
| **Financeiro** | CRUD de transações realizadas (entradas/saídas) |
| **Previsão de Caixa** | Planejamento de recebimentos e pagamentos futuros |
| **Categorias** | Gerenciamento de categorias financeiras por tipo |
| **Relatórios** | Relatório anual separando previsto/realizado |
| **Lixeira** | Exclusão temporária de 30 dias com restauração e exclusão permanente |
| **Usuários** | Gestão de usuários com controle de acesso por papel (RBAC) |
| **Configurações** | Dados da empresa, logo, tema e alteração de senha |
| **Documentos** | Upload de documentos fiscais com **OCR** (Tesseract.js PT-BR), **extração por IA** (OpenAI GPT-4o / Gemini) e **parse de NF-e XML/DANFE**, com fluxo de conferência |
| **Pricing** | Precificação baseada em custo com insumos (conversão de unidades), custos fixos e margens |
| **Recibos** | Emissão de recibos com numeração sequencial, validação CPF/CNPJ, **assinatura digital** e **PDF** gerado no navegador |
| **Financeiro Avançado** | Contas a pagar/receber (aging), dívidas, investimentos (ROI/IRR/NPV) — backend |

## 🧰 Stack Tecnológica

| Categoria | Tecnologia |
|---|---|
| Framework Frontend | Next.js 15 (App Router) + TypeScript 5.8 (strict) |
| Framework Backend | .NET 10 (C#) — ASP.NET Core Web API |
| Banco de Dados | PostgreSQL 16 |
| ORM | Entity Framework Core 10 + Npgsql |
| Autenticação | JWT + refresh token rotativo + ASP.NET Core Identity (PBKDF2), RBAC |
| Estado (FE) | Zustand 5 (persistência em sessionStorage/localStorage) |
| UI (FE) | shadcn/ui (23 componentes) + Radix UI + Tailwind CSS 3.4 |
| Gráficos | Recharts |
| Formulários | react-hook-form + zod (validação em duas camadas com FluentValidation no backend) |
| PDF / Extração | jsPDF + html2canvas · tesseract.js + pdfjs-dist + DOMParser |
| IA | OpenAI API (GPT-4o Vision) · Google Gemini API |
| Temas | Sistema próprio com 2 temas (Normal, Dark Mega) via CSS variables |
| Testes (BE) | xUnit — 87 testes + WebApplicationFactory + Moq |
| Testes (FE) | Vitest — 7 suítes + Playwright — 6 specs E2E |
| Infra | Docker (compose + profiles) + Railway + Vercel + GitHub Actions |

## 🏗️ Arquitetura

Aplicação full-stack: frontend **Next.js 15** consumindo uma API REST **.NET 10** com banco **PostgreSQL**. O frontend usa uma camada de API repositories sobre um cliente HTTP compartilhado (Bearer + refresh automático).

```
[ Navegador ] → [ Next.js (React) ] → [ API Repositories ] → HTTP → [ .NET API ] → [ EF Core ] → [ PostgreSQL ]
```

Destaques:

- **Clean Architecture** no backend: `Core` (domínio puro) / `Infrastructure` (EF Core, repositórios) / `API` (controllers, DI).
- **API REST com 24 controllers e 138 endpoints**, 22 repositórios, injeção de dependência centralizada e 35 validators FluentValidation.
- **Multi-tenant** em banco único com **filtros globais de consulta em 23 de 25 entidades** (isolamento por empresa + usuário) — validado por testes de integração.
- **Autenticação JWT com refresh token rotativo**, RBAC (`owner/admin/financial/viewer`) e sessões endurecidas no frontend (sessionStorage, timeout de inatividade de 15 min).
- **25 entidades, 23 migrations EF Core**, auditoria completa de ações e soft-delete com TTL de 30 dias.

## 📁 Estrutura do Projeto

```
lucrai_site/
├── src/                        # Frontend Next.js 15 (App Router)
│   ├── app/                    # Páginas e rotas (SSR + SEO)
│   ├── components/             # shadcn/ui + componentes de funcionalidade
│   ├── services/               # API repositories, serviços de documentos/OCR
│   ├── store/                  # Stores Zustand (auth, tema)
│   ├── hooks/                  # Custom hooks
│   └── lib/                    # Utilitários (moeda, datas, etc.)
├── backend/
│   ├── src/Lucrai.API/         # Web API .NET 10 (controllers, DI, validators)
│   ├── src/Lucrai.Core/        # Entidades de domínio, interfaces, serviços
│   ├── src/Lucrai.Infrastructure/  # EF Core, repositórios, migrations, seed
│   └── tests/Lucrai.API.Tests/ # xUnit — 87 testes
├── e2e/                        # Specs Playwright E2E (6)
├── docs/                       # Arquitetura, guias, relatórios de sprint
├── scripts/                    # Automação de dev (TypeScript)
├── .github/workflows/ci.yml    # CI: backend, frontend, validação Docker
├── docker-compose.yml
├── frontend.Dockerfile
└── package.json
```

## 🚀 Como Rodar

**Requisitos:** Node.js 20+, SDK .NET 10, Docker (para o PostgreSQL).

```bash
# 1. Configurar ambiente
cp .env.example .env
# edite o .env → defina POSTGRES_PASSWORD

# 2. Instalar dependências do frontend
npm install

# 3. Stack completo (PostgreSQL + API + Web via Docker)
npm run dev:full

# — ou passo a passo —
npm run dev:db        # inicia PostgreSQL via Docker (porta 5433)
npm run dev:api       # dotnet watch run — backend em :5000
npm run dev           # Next.js dev — frontend em :3000
```

## 🧪 Testes

```bash
npm test              # Vitest — 7 suítes do frontend
npm run test:e2e      # Playwright — 6 fluxos E2E (API mockada)
dotnet test backend   # xUnit — 87 testes do backend (integração + unitários)
```

Um **pipeline de CI em 3 jobs** (GitHub Actions) roda build + testes do backend, lint + build do frontend e validação de imagens Docker a cada push.

## 📚 Documentação

- [Contexto do projeto](docs/project-context.md)
- [Arquitetura](docs/architecture.md) · [Arquitetura do backend](docs/backend-architecture.md)
- [Guia de desenvolvimento](docs/dev-guide.md)
- [Guia de deploy](docs/deploy-guide.md)
- [Decisões](docs/decisions.md) · [Roadmap](docs/roadmap.md)
- [Relatórios de sprint](docs/reports/)

## 🗺️ Roadmap

1. **MVP** — Gestão financeira essencial _(concluído)_
2. **Pós-MVP** — Exportação, personalização e UX aprimorada _(em andamento)_
3. **Inteligência Financeira** — Métricas avançadas, alertas, projeções _(concluído)_
4. **CFO Digital** — Recomendações automatizadas, cenários, relatórios executivos _(em andamento)_
5. **IA Financeira** — Detecção de anomalias, categorização automática, insights preditivos

## 📄 Licença

[MIT](LICENSE) © 2026 **Lucraí**
