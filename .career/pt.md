# LUCRAÍ — Ativos de Currículo (PT-BR)

> Projeto: **LUCRAÍ** — SaaS de gestão financeira para PMEs brasileiras (Diretor Financeiro Digital).
> Desenvolvido em **dupla** (2 autores). Eu fui o **autor principal** (156 de 211 commits, ~74%) — a maior parte do backend, da inteligência financeira, dos módulos de documentos/recibos, dos testes e do DevOps é de minha autoria. João Ribeiro (54 commits) contribuiu com a base inicial do frontend e refinamentos.
> Base: análise do código-fonte, commits, testes e docs (`docs/`, `docs/reports/001–028` + `029-031` híbrido/isolamento). Nada foi inventado — cada item tem evidência em arquivo.

---

## 1. Arquitetura Full-Stack & Padrões (Clean Architecture)

Nome: Arquitetura Full-Stack e Padrões de Projeto
Categoria: Arquitetura / Backend / Frontend

### Evidências encontradas

- `backend/Lucrai.slnx` — solução com 3 projetos (Lucrai.API, Lucrai.Core, Lucrai.Infrastructure) + testes
- `backend/src/Lucrai.Core/` — domínio puro: 25 entidades, DTOs, 22 interfaces de repositório + 2 de serviço
- `backend/src/Lucrai.Infrastructure/` — EF Core (`Data/LucraiDbContext.cs`), 22 repositórios, 24 migrations (`20260907201024_FixFixedCostPerUserIsolation`), Seed (`DataSeeder.cs:118-122` só reativa `MustChangePassword` quando hash é `123`)
- `backend/src/Lucrai.API/Program.cs` — DI com 25 registros; `AddValidatorsFromAssemblyContaining<Program>()`
- `backend/src/Lucrai.API/Validators/` — 35 validators FluentValidation
- `src/services/api.ts` — cliente HTTP (Bearer, refresh automático, `ApiError`)
- `src/services/api-repositories/` — 14 repositórios no frontend (um por entidade)
- `next.config.js` — `output: "standalone"` (deploy em container)

### Currículo

- Desenvolvi um SaaS full-stack de gestão financeira (LUCRAÍ) usando Clean Architecture no backend (.NET 10) e arquitetura por camadas no frontend (Next.js 15), em projeto em dupla onde fui o desenvolvedor principal.
- Projetei API REST com 24 controllers e 138 endpoints, seguindo Repository Pattern com 22 repositórios e injeção de dependência centralizada no `Program.cs`.
- Implementei validação em duas camadas: zod + react-hook-form no frontend e FluentValidation (35 validators) no backend.

### STAR

Situação: O produto precisava evoluir de um protótipo local para um SaaS multi-usuário com regras de negócio financeiras complexas.
Tarefa: Estruturar um backend escalável e testável, desacoplado do frontend, mantendo consistência de dados.
Ação: Apliquei Clean Architecture (Core/Infrastructure/API), Repository Pattern com DI, DTOs e validação FluentValidation; espelhei o padrão no frontend com 14 API repositories sobre um cliente HTTP comum.
Resultado: Backend com 138 endpoints e 87 testes xUnit passando; frontend totalmente desacoplado da API (troca de provedor sem alterar páginas).

### XYZ

Realizado: uma API REST de 24 controllers/138 endpoints e um frontend 100% integrado por API,
Por: separando domínio (Core), infraestrutura (EF Core) e apresentação (API) com Repository Pattern e injeção de dependência,
Usando: .NET 10, EF Core 10, PostgreSQL, FluentValidation, Next.js 15, TypeScript.

### Tecnologias

- .NET 10 / ASP.NET Core Web API
- EF Core 10 + Npgsql + PostgreSQL 16
- FluentValidation
- Next.js 15 (App Router) + React 19 + TypeScript 5.8
- zod + react-hook-form

### Competências

- Clean Architecture
- Repository Pattern
- Dependency Injection
- Design de API REST
- Validação em duas camadas
- Separação de responsabilidades

### Palavras-chave ATS

- Clean Architecture
- REST API
- Repository Pattern
- Dependency Injection
- .NET Core
- TypeScript
- Full Stack
- API Design
- Domain-Driven Structure

### Confiança

Alta — 100% confirmado pelo código.

---

## 2. Autenticação & Segurança (JWT, Refresh Token, RBAC)

Nome: Autenticação e Segurança
Categoria: Segurança / Backend

### Evidências encontradas

- `backend/src/Lucrai.API/Controllers/AuthController.cs` — login, register, refresh, logout, me, change-password (6 endpoints)
- `backend/src/Lucrai.Core/Entities/RefreshToken.cs` — `IsUsed`, `IsRevoked`, `ExpiresAt` (rotação)
- `backend/src/Lucrai.API/Program.cs` — `AddIdentity` + `AddAuthentication().AddJwtBearer()` + política de senha
- `[Authorize(Roles = "Admin,Owner")]` em `UsersController.cs`, `AuditController.cs`, `ContasController.cs` (RBAC)
- `src/store/auth-store.ts` — tokens em `sessionStorage` (`lucrai-access-token`, `lucrai-refresh-token`)
- `src/services/api.ts` — Bearer automático + interceptador 401 → refresh → retry
- `src/components/layout/InactivityTracker.tsx` — timeout de inatividade 15 min
- `src/app/trocar-senha/` — fluxo `mustChangePassword`
- Migrations: `AddUserPlanAndMustChangePassword`, `FixUserPlanAndMustChangePasswordDefaults`

### Currículo

- Implementei autenticação JWT com refresh token rotativo (rotação revoga o token anterior a cada uso) e ASP.NET Identity com hash PBKDF2.
- Implementei RBAC com papéis (owner/admin/financial/viewer) protegendo rotas sensíveis via `[Authorize(Roles)]`.
- Endureci a sessão no frontend: token em `sessionStorage` (fechar aba = logout), timeout de inatividade de 15 minutos e fluxo de troca de senha obrigatória no primeiro acesso.

### STAR

Situação: O sistema exigia autenticação segura para um SaaS multi-tenant com usuários de diferentes níveis de acesso.
Tarefa: Prover login/logout robustos, renovação de sessão e controle de acesso por papel.
Ação: Combinei ASP.NET Identity (PBKDF2) com JWT Bearer e refresh token opaco rotativo armazenado no banco; protegi controllers com `[Authorize]` e RBAC; no frontend movi o token para `sessionStorage` e adicionei timeout de inatividade.
Resultado: Sessões mais seguras (token expira ao fechar aba; refresh revoga o anterior) e controle granular de permissões entre papéis.

### XYZ

Realizado: sessões com renovação segura e revogação de tokens antigos,
Por: implementando rotação de refresh tokens, RBAC via atributos e token em `sessionStorage` com timeout de inatividade,
Usando: ASP.NET Core Identity, JWT Bearer, .NET 10, Next.js, Zustand.

### Tecnologias

- ASP.NET Core Identity (PBKDF2)
- JWT Bearer + Refresh Token rotativo
- RBAC (atributos `[Authorize(Roles)]`)
- sessionStorage / localStorage
- Zustand (auth store)

### Competências

- Autenticação e autorização
- Gerenciamento de sessão
- Segurança de aplicação web
- Proteção de rotas

### Palavras-chave ATS

- JWT
- OAuth (conceito)
- RBAC
- Autenticação
- Autorização
- Refresh Token
- Segurança
- Gerenciamento de Sessão

### Confiança

Alta — confirmado pelo código e testes (`AuthControllerTests`, 8 testes).

---

## 3. Multi-tenancy & Isolamento de Dados

Nome: Multi-tenancy e Isolamento de Dados (empresa + usuário)
Categoria: Segurança / Backend / Banco de Dados

### Evidências encontradas

- `backend/src/Lucrai.API/Middleware/TenantContextMiddleware.cs` — extrai Company/User do JWT
- `backend/src/Lucrai.Core/Interfaces/ITenantContext.cs` — contexto scoped
- `backend/src/Lucrai.Infrastructure/Data/LucraiDbContext.cs:535-559` — `ApplyTenantFilters()` com `HasQueryFilter` em **23 de 25 entidades** (`FixedCost` migrado para `Company+CreatedBy` único `IsRequired` em `20260907201024`, antes `Company` único compartilhado `43c6c99b`)
- Migrations: `AddTenantQueryFilters`, `AddUserLevelIsolation`, `AddCreatedByFields`, `FixFixedCostPerUserIsolation (B per-user)`
- `backend/tests/Lucrai.API.Tests/Controllers/ReciboIsolationTests.cs` — 4 testes de isolamento + `prompts/testes-QA.md:120` validação prod `lucrai.adm/fellype.gabriel` `FixedCosts 87173955 vs 9d3084fb` isolados
- `docs/reports/018-multi-tenant-security.md`, `019-tenant-security-query-filters-fix.md`, `013-fix-cross-tenant-trash-cleanup.md` — correções de segurança de isolamento
- `docs/fix-isolamento-usuario.md:113-200` — isolamento `FixedCosts` per-user `B` + zeramento `lucrai.adm/joao.ribeiro 123 MustChangePassword true` via `PasswordHasher` + `DELETE RefreshTokens` (Neon `ep-proud-base-aci4mfda`)

### Currículo

- Projetei e implementei isolamento multi-tenant com filtros globais do EF Core (`HasQueryFilter`) aplicados em 23 entidades (exceções `DismissedAlert` só `Company`, `Category` `CreatedBy=""` compartilhada), garantindo que cada empresa e cada usuário acesse apenas seus próprios dados; `FixedCosts` migrado de singleton por empresa para per-user `B` a pedido.
- Implementei middleware (`TenantContextMiddleware`) que extrai tenant e usuário do JWT, evitando confiar em parâmetros do cliente.
- Adicionei isolamento em nível de usuário (campo `CreatedBy`) e validei com 4 testes de integração dedicados (`ReciboIsolationTests`), incluindo correção de falhas críticas de isolamento documentadas em relatórios de sprint.

### STAR

Situação: Auditoria de segurança revelou brechas de isolamento entre empresas e usuários (relatórios 013/018/019).
Tarefa: Garantir isolamento no nível do banco, não por esquecimento em cada controller.
Ação: Centralizei o isolamento em `ApplyTenantFilters()` no DbContext (23 entidades), adicionei isolamento por usuário (`CreatedBy`) e cobri com testes de integração específicos.
Resultado: Isolamento aplicado em toda query automaticamente; 4 testes de isolamento passando e falhas críticas corrigidas.

### XYZ

Realizado: dados 100% isolados entre empresas e entre usuários,
Por: centralizando filtros globais no DbContext, extraindo o tenant do JWT via middleware e cobrindo com testes,
Usando: EF Core `HasQueryFilter`, .NET 10, JWT, xUnit + WebApplicationFactory.

### Tecnologias

- Filtros globais do EF Core (`HasQueryFilter`)
- Middleware ASP.NET Core
- Claims do JWT
- xUnit / WebApplicationFactory
- PostgreSQL

### Competências

- Multi-tenancy
- Isolamento de dados
- Segurança de dados
- Testes de integração

### Palavras-chave ATS

- Multi-tenant
- Multi-tenancy
- Isolamento de Dados
- Filtros de Query
- Segurança
- EF Core
- Testes de Integração

### Confiança

Alta — código + 4 testes de isolamento.

---

## 4. Inteligência Financeira & CFO Digital

Nome: Inteligência Financeira e CFO Digital
Categoria: Backend / Frontend / Análise de Dados

### Evidências encontradas

- `backend/src/Lucrai.Core/Services/DashboardIntelligenceService.cs` — projeção 12m, runway, breakeven, health score, sparkline, nota CFO, ações recomendadas (12 testes)
- `backend/src/Lucrai.Core/Services/AlertasService.cs` — 6 tipos de alertas + insights + dismiss/restore (8 testes)
- `backend/src/Lucrai.API/Controllers/DashboardController.cs` — 13 endpoints (projection, runway, breakeven, health, alerts, sparkline, nota-cfo, recommended-actions, dismiss/restore)
- `backend/src/Lucrai.Core/Entities/DismissedAlert.cs` + migration `AddDismissedAlert`
- `src/app/dashboard/indicadores/`, `resumo-cfo/`, `projecoes/`, `alertas/` — 4 rotas
- `src/services/api-repositories/indicators.ts`
- `src/hooks/__tests__/useAlertsCount.test.ts`

### Currículo

- Desenvolvi motor de inteligência financeira no backend: projeção de 12 meses, cálculo de runway (meses de caixa), ponto de equilíbrio, health score 0–100 e nota executiva (CFO) gerada em linguagem natural.
- Implementei sistema de alertas inteligentes com 6 tipos (saldo negativo, queda de margem, custos > receita, pico anômalo, inadimplência + insights positivos) com ação de dispensar/restaurar.
- Construí a Central de Inteligência Financeira no frontend com 10 sub-abas (DRE, DFC, balancete, razão, balanço etc.) consumindo a API.

### STAR

Situação: O produto precisava entregar valor além do CRUD — ser um "Diretor Financeiro Digital" que interpreta os dados.
Tarefa: Computar métricas executivas e comunicá-las de forma simples.
Ação: Implementei serviços de domínio puros no Core (projeção, runway, breakeven, health, nota CFO, ações recomendadas) e um serviço de alertas com 6 tipos, expostos via 13 endpoints e consumidos por 4 telas.
Resultado: Painel com score de saúde, projeções e alertas priorizados; 22 testes dedicados (service + controller) validando os cálculos.

### XYZ

Realizado: um painel de inteligência financeira executivo (nota CFO, saúde 0–100, projeções, alertas),
Por: implementando serviços de domínio puros com cálculos financeiros e expondo via REST,
Usando: .NET 10, C#, Next.js, Recharts, xUnit.

### Tecnologias

- C# / .NET 10 (serviços de domínio)
- REST API
- Next.js + Recharts
- xUnit

### Competências

- Análise financeira computacional
- Metodologia CFO
- Geração de insights a partir de dados
- Design de algoritmos financeiros (runway, breakeven)

### Palavras-chave ATS

- Inteligência Financeira
- KPI
- Métricas Financeiras
- Painel CFO
- Business Intelligence
- Análise de Dados
- Algoritmos

### Confiança

Alta — código + 22 testes.

---

## 5. Financeiro Core (Transações + Previsão de Caixa)

Nome: Módulo Financeiro (Transações e Previsão de Caixa)
Categoria: Backend / Frontend

### Evidências encontradas

- `backend/src/Lucrai.API/Controllers/TransactionsController.cs` (10 endpoints) e `CashForecastsController.cs` (10 endpoints)
- `backend/src/Lucrai.Infrastructure/Repositories/TransactionRepository.cs`, `CashForecastRepository.cs` — DisplayId sequencial, bridge previsão→transação
- `src/components/financial/transaction-form.tsx` — máscara BRL, valor por extenso, bloqueio de datas futuras
- `src/app/financial/page.tsx`, `src/app/cash-forecast/page.tsx`
- `src/lib/__tests__/utils.test.ts` — `formatCurrency`, `valorPorExtenso`, `getNextDisplayId`
- `docs/reports/001-sistema-display-id.md`, `005-calendar-datepicker.md`, `016-bloquear-datas-futuras-financeiro.md`

### Currículo

- Desenvolvi o módulo financeiro central: CRUD de transações e previsões de caixa com display ID sequencial (#001, #002), valor por extenso em português e formatação de moeda BRL.
- Implementei a ponte "previsão → transação": ao marcar uma previsão como recebida/paga, o sistema cria automaticamente o lançamento real vinculado.
- Implementei validações de negócio de datas (bloqueio de datas futuras no financeiro, máximo 10 anos na previsão) e exportação CSV.

### STAR

Situação: Precisava de um módulo de lançamentos confiável e amigável para usuários brasileiros.
Tarefa: Construir CRUD financeiro com identificadores legíveis e validações de negócio.
Ação: Implementei display ID sequencial por empresa, máscara de moeda em tempo real, valor por extenso automático, restrição de datas e a ponte automática previsão→transação.
Resultado: Lançamentos com identificação amigável (#001), sem inconsistência entre previsto e realizado, com validação em duas camadas.

### XYZ

Realizado: um módulo financeiro completo e intuitivo,
Por: aplicando display IDs sequenciais, máscaras de moeda, valor por extenso e regras de data em duas camadas,
Usando: .NET 10, EF Core, Next.js, date-fns, react-hook-form, zod.

### Tecnologias

- .NET 10 / EF Core / PostgreSQL
- Next.js 15 / TypeScript
- date-fns, react-day-picker
- react-hook-form + zod

### Competências

- CRUD e regras de negócio
- UX para dados financeiros
- Validação de formulários
- Formatação local (pt-BR)

### Palavras-chave ATS

- CRUD
- Gestão Financeira
- Fluxo de Caixa
- Validação de Formulários
- Moeda Brasileira
- Regras de Negócio

### Confiança

Alta — código + testes.

---

## 6. Lixeira / Soft-Delete com TTL

Nome: Sistema de Lixeira (Soft Delete com TTL)
Categoria: Backend

### Evidências encontradas

- `backend/src/Lucrai.API/Controllers/TrashController.cs` — listar, restaurar, excluir permanentemente, cleanup (4 endpoints)
- `backend/src/Lucrai.Core/Entities/DeletedItem.cs` — `RestoreUntil` (TTL 30 dias)
- `backend/src/Lucrai.Infrastructure/Repositories/TrashRepository.cs`
- Migrations: `FixDeletedItemTimestampColumns`, `AddCreatedByToDeletedItem`
- `src/app/trash/page.tsx` — contagem regressiva e badges de vencimento
- `docs/reports/006-sistema-exclusao.md`, `013-fix-cross-tenant-trash-cleanup.md`

### Currículo

- Implementei sistema de exclusão segura (soft delete) com TTL de 30 dias, restauração e exclusão permanente, com limpeza automática de itens expirados.
- Garanti o isolamento da lixeira por tenant/usuário (correção de vazamento cross-tenant documentada no relatório 013).

### STAR

Situação: Exclusões definitivas causavam perda acidental de dados financeiros.
Tarefa: Criar um mecanismo de exclusão reversível por tempo limitado.
Ação: Implementei soft delete com snapshot em `DeletedItem` e TTL de 30 dias, endpoints de restauração/exclusão/cleanup e proteção de isolamento entre empresas.
Resultado: Recuperação de dados por até 30 dias, sem perda por exclusão acidental.

### XYZ

Realizado: exclusões reversíveis por 30 dias,
Por: implementando soft delete com TTL, restauração e cleanup automático com isolamento por tenant,
Usando: EF Core, .NET 10, PostgreSQL, Next.js.

### Tecnologias

- EF Core
- .NET 10
- PostgreSQL
- Next.js

### Competências

- Soft delete
- Recuperação de dados
- Regras de retenção (TTL)

### Palavras-chave ATS

- Soft Delete
- Recuperação de Dados
- TTL
- Retenção de Dados
- Lixeira / Reciclar

### Confiança

Alta — código + testes (`TrashControllerTests`).

---

## 7. Central de Documentos com OCR e IA

Nome: Central de Documentos com OCR/IA e Fluxo de Conferência
Categoria: Frontend / Backend / IA

### Evidências encontradas

- `backend/src/Lucrai.API/Controllers/DocumentosController.cs` (14 endpoints), `DocumentoAprendizadoController.cs` (3), `DocumentoConfigController.cs` (2)
- `backend/src/Lucrai.Core/Entities/` — `DocumentoFinanceiro`, `DocumentoAprendizado`, `DocumentoConfiguracao`, `DocumentoLog`, `DocumentoTrashItem`
- Migrations: `AddDocumentoFinanceiro`, `AddDocumentoLogAprendizadoConfig`
- `src/services/documentos/documentos-extracao.service.ts` — pdfjs-dist, tesseract.js (`por`), `DOMParser` para XML NF-e, OpenAI `gpt-4o` e Google Gemini com fallback sem IA
- `src/services/documentos/parser/danfe-parser.ts` — parser DANFE
- `src/services/documentos/documentos.service.ts` — orquestração (confirmar cria transação/previsão)
- `src/app/documentos/**` — listagem, detalhe, conferência, configurações
- 3 suítes Vitest de documentos (API, service, parse NF-e XML)

### Currículo

- Construí central de documentos fiscais com extração automática de dados no frontend: texto de PDF (pdfjs-dist), OCR de imagem em português (tesseract.js) e parse de NF-e em XML (DOMParser) e DANFE.
- Integrei provedores de IA de visão (OpenAI GPT-4o e Google Gemini) para extração de dados de documentos, com fallback sem IA.
- Implementei fluxo de conferência (confirmar/rejeitar/reprocessar) que gera lançamentos financeiros a partir do documento, com aprendizado por fornecedor e configuração por empresa.

### STAR

Situação: O fluxo manual de lançar notas fiscais era lento e propenso a erro.
Tarefa: Automatizar a extração de dados de documentos e o lançamento financeiro.
Ação: Implementei extração multi-motor (PDF, OCR pt-BR, XML NF-e, DANFE) e IA de visão com fallback; criei fluxo de conferência com geração automática de transações/previsões e aprendizado de fornecedores.
Resultado: Documentos processados com dados pré-preenchidos, revisão humana e lançamento automático, com testes de extração e parser.

### XYZ

Realizado: extração e lançamento de documentos fiscais sem digitação manual,
Por: combinando OCR, parsing de XML/PDF, IA de visão e um fluxo de conferência,
Usando: tesseract.js, pdfjs-dist, OpenAI API, Gemini API, Next.js, .NET.

### Tecnologias

- Tesseract.js (OCR pt-BR)
- pdfjs-dist
- DOMParser (XML)
- OpenAI API (GPT-4o Vision)
- Google Gemini API
- .NET 10 / Next.js 15

### Competências

- OCR e extração de dados
- Integração com APIs de IA
- Parser de XML (NF-e)
- Automação de processos

### Palavras-chave ATS

- OCR
- Visão Computacional
- OpenAI
- Gemini
- Gestão de Documentos
- Extração de Dados
- Parsing de XML
- Integração de IA

### Confiança

Alta — código + 3 suítes de testes de documentos.

---

## 8. Precificação Inteligente

Nome: Precificação Inteligente (Insumos, Custos Fixos e Margens)
Categoria: Backend / Frontend / Regras de Negócio

### Evidências encontradas

- `backend/src/Lucrai.API/Controllers/PricingController.cs` (5 endpoints), `InsumosController.cs` (5), `FixedCostsController.cs` (2)
- `backend/src/Lucrai.Core/Entities/` — `PricingProduct`, `Insumo`, `FixedCost`
- Migrations: `AddInsumos`, `AddFixedCosts`
- `src/services/api-repositories/pricing.ts`, `insumos.ts`, `fixed-costs.ts`
- `src/app/pricing/`, `src/app/pricing/insumos/`, `src/app/pricing/fixed-costs/`

### Currículo

- Desenvolvi módulo de precificação que calcula preços mínimo/saudável/premium a partir de insumos (com conversão automática de unidades kg↔g, L↔ml) e custos fixos.
- Implementei simulação de desconto, margens de 10–50%, formas de pagamento (PIX/débito/crédito/parcelado) e produção unitária/lote, incluindo pró-labore.

### STAR

Situação: Microempreendedores tinham dificuldade de precificar produtos com margem adequada.
Tarefa: Criar uma ferramenta que calculasse preço a partir de custos reais.
Ação: Implementei CRUD de insumos com conversão de unidades, custos fixos e cálculo automático de preços (mínimo/saudável/premium), simulação de desconto e formas de pagamento.
Resultado: Ferramenta de precificação baseada em custo com 12 endpoints no backend.

### XYZ

Realizado: cálculo automático de preço de venda com margem saudável,
Por: modelando insumos, custos fixos e cenários de pagamento,
Usando: .NET 10, EF Core, Next.js, TypeScript.

### Tecnologias

- .NET 10 / EF Core
- Next.js / TypeScript

### Competências

- Regras de negócio de precificação
- Conversão de unidades
- Análise de custos

### Palavras-chave ATS

- Precificação
- Análise de Custos
- Cálculo de Margem
- Regras de Negócio
- Estoque

### Confiança

Alta — código + testes de pricing.

---

## 9. Recibos, Assinatura Digital e PDF

Nome: Emissão de Recibos com Assinatura Digital e PDF
Categoria: Frontend / Backend

### Evidências encontradas

- `backend/src/Lucrai.API/Controllers/RecibosController.cs` (10 endpoints), `SignatureController.cs` (2)
- `backend/src/Lucrai.Core/Entities/Recibo.cs` (com soft delete), `SignatureConfig.cs`
- Migrations: `AddSignatureConfig`, `AddRecibos`, `AddSoftDeleteToRecibo`
- `src/services/recibos/reciboPdfService.ts` — geração PDF (jsPDF + html2canvas, A4)
- `src/services/recibos/cpfCnpjValidator.ts` (checksum), `valorPorExtenso.ts`, `gerarNumeroRecibo.ts` (`REC-{ano}-######`)
- `backend/tests/Lucrai.API.Tests/Controllers/ReciboIsolationTests.cs` — 4 testes
- `src/services/recibos/__tests__/recibos.test.ts`

### Currículo

- Desenvolvi módulo de recibos com numeração sequencial `REC-{ano}-######`, validação de CPF/CNPJ por checksum, valor por extenso e cancelamento com motivo.
- Implementei assinatura digital (upload de imagem + responsável) e geração de PDF em A4 no navegador (jsPDF + html2canvas).
- Implementei soft delete e isolamento por tenant/usuário nos recibos, validado por 4 testes de integração.

### STAR

Situação: Pequenos prestadores precisavam emitir recibos profissionais com assinatura.
Tarefa: Criar emissão de recibos com numeração, validação fiscal e PDF.
Ação: Implementei CRUD de recibos com numeração sequencial, validação de CPF/CNPJ, assinatura digital, cancelamento com motivo e geração de PDF no navegador.
Resultado: Recibos profissionais emitidos em segundos, com PDF e assinatura, e isolamento garantido por testes.

### XYZ

Realizado: emissão de recibos profissionais com assinatura e PDF,
Por: implementando numeração sequencial, validação de documentos e geração de PDF no cliente,
Usando: .NET 10, Next.js, jsPDF, html2canvas.

### Tecnologias

- jsPDF / html2canvas
- Next.js / TypeScript
- .NET 10 / EF Core
- Validação de CPF/CNPJ (checksum)

### Competências

- Geração de PDF
- Validação de documentos brasileiros
- Assinatura digital (conceito)
- Numeração sequencial

### Palavras-chave ATS

- Geração de PDF
- Recibos / Faturamento
- Assinatura Digital
- CPF / CNPJ
- Conformidade Fiscal Brasileira

### Confiança

Alta — código + 4 testes de isolamento + suíte Vitest.

---

## 10. Financeiro Avançado (Contas a Pagar/Receber, Dívidas, Investimentos)

Nome: Financeiro Avançado (backend)
Categoria: Backend / Banco de Dados

### Evidências encontradas

- `backend/src/Lucrai.API/Controllers/AccountsPayableController.cs`, `AccountsReceivableController.cs`, `DebtsController.cs`, `InvestmentsController.cs`, `BalanceAccountsController.cs` (6 endpoints cada)
- `backend/src/Lucrai.Core/Entities/` — `AccountPayable`, `AccountReceivable`, `Debt`, `Investment`, `BalanceAccount`
- Migration: `AddFinancialEntities`
- `src/services/api-repositories/indicators.ts` — consome `/api/debts/summary` e `/api/investments/summary`
- Validators: `AccountPayableValidators`, `AccountReceivableValidators`, `DebtValidators`, `InvestmentValidators`, `BalanceAccountValidators`

### Currículo

- Modelei e implementei no backend contas a pagar/receber com aging buckets (30/60/90 dias), inadimplência e prazo médio.
- Implementei módulo de dívidas (net debt, alavancagem) e de investimentos com métricas ROI, IRR, NPV e payback, além de plano de contas (balanço agrupado por Ativo/Passivo/Patrimônio Líquido).
- Nota: o frontend dedicado desses módulos ainda está em andamento — a API já é consumida parcialmente pela central de indicadores.

### STAR

Situação: O sistema de caixa precisava evoluir para gestão financeira completa (não só fluxo de caixa).
Tarefa: Adicionar módulos avançados de finanças corporativas.
Ação: Modelei 5 entidades e 5 controllers com aging, métricas de dívida e investimento, e plano de contas, todos com validação e DI.
Resultado: Backend pronto para contas a pagar/receber, dívidas, investimentos e balanço — base para as próximas telas.

### XYZ

Realizado: camada de finanças corporativas (contas a pagar/receber, dívidas, investimentos, balanço),
Por: modelando entidades, repositórios, validators e endpoints REST,
Usando: .NET 10, EF Core, PostgreSQL, FluentValidation.

### Tecnologias

- .NET 10 / EF Core / PostgreSQL
- FluentValidation

### Competências

- Finanças corporativas (accounting)
- Métricas financeiras (ROI, IRR, NPV, payback)
- Modelagem de banco de dados

### Palavras-chave ATS

- Contas a Pagar
- Contas a Receber
- Gestão de Dívidas
- Investimentos
- ROI
- IRR
- NPV
- Balanço Patrimonial

### Confiança

Média — backend 100% confirmado; frontend dedicado ainda em andamento (consumo parcial via indicadores).

---

## 11. Testes & Qualidade

Nome: Testes Automatizados e Qualidade
Categoria: Testes / QA

### Evidências encontradas

- `backend/tests/Lucrai.API.Tests/` — **87 testes** `[Fact]` em 14 arquivos (controllers + services)
- `CustomWebApplicationFactory.cs` — `WebApplicationFactory<Program>` + InMemory + test JWT
- `src/**/__tests__/` — **7 suítes Vitest** (utils, hooks, documentos, recibos)
- `e2e/` — **6 specs Playwright** com API mockada (`e2e/helpers.ts`)
- `.github/workflows/ci.yml` — 3 jobs: backend build+test, frontend lint+build, docker validation
- `vitest.config.ts`, `playwright.config.ts`

### Currículo

- Escrevi 87 testes de integração/unitários no backend (xUnit + WebApplicationFactory + InMemory + Moq), incluindo testes de isolamento multi-tenant.
- Escrevi 7 suítes de testes unitários no frontend (Vitest) cobrindo utils, hooks e serviços de documentos/recibos.
- Configurei 6 fluxos E2E com Playwright (login, transações, previsões, lixeira, categorias) e pipeline de CI com 3 jobs que roda build, testes e validação de imagens Docker.

### STAR

Situação: Um SaaS financeiro não podia regredir silenciosamente em regras críticas (cálculos, isolamento, autenticação).
Tarefa: Criar uma rede de segurança automatizada em todos os níveis.
Ação: Implementei testes de unidade e integração no backend (incluindo isolamento), testes de hooks/utils no frontend, fluxos E2E com API mockada e CI em 3 jobs.
Resultado: 87 + 7 + 6 testes cobrindo as regras críticas, rodando automaticamente a cada push.

### XYZ

Realizado: confiabilidade com testes automatizados em 3 camadas,
Por: escrevendo testes de unidade/integração/E2E e automatizando no CI,
Usando: xUnit, Moq, WebApplicationFactory, Vitest, Playwright, GitHub Actions.

### Tecnologias

- xUnit / Moq / WebApplicationFactory
- Vitest
- Playwright
- GitHub Actions

### Competências

- TDD / teste automatizado
- Testes de integração
- Testes E2E
- CI/CD

### Palavras-chave ATS

- Testes Unitários
- Testes de Integração
- Testes E2E
- xUnit
- Vitest
- Playwright
- Automação de Testes
- Garantia de Qualidade

### Confiança

Alta — contagens confirmadas no repositório.

---

## 12. DevOps & CI/CD

Nome: DevOps, Docker e Deploy (CI/CD)
Categoria: DevOps

### Evidências encontradas

- `.github/workflows/ci.yml:59-82` — 3 jobs (backend `dotnet 10 build/test`, frontend `node 22 lint/build`, docker `buildx validate` `push:false`)
- `docker-compose.yml:1-60` — híbrido `postgres:16-alpine 5433:5432 pgdata health pg_isready` + `api 5000→8080 health curl /api/health` + `web 3000` `profiles: [full]` (`Neon` `ep-proud-base-aci4mfda` em prod)
- `backend/src/Lucrai.API/Dockerfile:1-19` — multi-stage `sdk:10 → aspnet:10` porta `${PORT:-8080}` `DOTNET_USE_POLLING_FILE_WATCHER` (Render Free)
- `frontend.Dockerfile:2-29` — `node:22-alpine@sha256` digest, non-root `nextjs:1001`, `HEALTHCHECK wget`, `standalone` (`ARG NEXT_PUBLIC_API_URL`)
- `render.yaml` + `docs/deploy-guide.md:42-53` — `Render` `lucrai-site.onrender.com` (Docker) + `Vercel` `lucrai-site.vercel.app` (`Neon` `neondb` compartilhado) — `Railway` descontinuado
- `scripts/ensure-docker.ts` — guard cross-platform (`LUCRAI_DOCKER_MODE`: check/auto/skip)
- `scripts/wait-for-db.ts` — aguarda PostgreSQL pronto
- `backend/src/Lucrai.API/Controllers/HealthController.cs` — `GET /api/health`
- `next.config.js` — `output: "standalone"`

### Currículo

- Configurei Docker multi-stage para backend (.NET 10) e frontend (Next.js standalone `output:"standalone"` com base pinada por digest, usuário não-root e healthcheck), com docker-compose híbrido `postgres local + Neon prod` em profiles.
- Automatizei deploy híbrido `Render (API Docker) + Vercel (FE) + Neon (PG)` (`render.yaml` + `docs/deploy-guide.md:6-11`) e CI 3 jobs com `buildx` `push:false`; `docs/estudo-docker-postgres-hibrido.md` com trilha 7 níveis.
- Desenvolvi scripts de automação de dev em TypeScript: guard de Docker cross-platform (modos check/auto/skip) e waiter de banco de dados.

### STAR

Situação: Times precisavam subir o ambiente local de forma consistente e o deploy precisava ser automatizado.
Tarefa: Padronizar desenvolvimento e deploy.
Ação: Criei compose com profiles, Dockerfiles endurecidos (non-root, healthcheck, digest pin), guard de Docker em TS, waiter de DB, scripts de deploy no Railway e CI em 3 jobs.
Resultado: Ambiente local consistente (postgres via compose) e deploy automático no Railway ao dar push em `main`.

### XYZ

Realizado: ambiente de dev e deploy padronizados e automatizados,
Por: criando Dockerfiles endurecidos, compose com profiles, scripts TS e CI em 3 jobs,
Usando: Docker, docker-compose, GitHub Actions, Railway CLI, Node/TypeScript.

### Tecnologias

- Docker / docker-compose
- GitHub Actions
- Railway / Vercel
- TypeScript (scripts CLI)

### Competências

- Containerização
- CI/CD
- Automação de ambiente
- Deploy em nuvem

### Palavras-chave ATS

- Docker
- Docker Compose
- CI/CD
- GitHub Actions
- Railway
- DevOps
- Deploy na Nuvem
- Infraestrutura

### Confiança

Alta — arquivos de config confirmados.

---

## 13. UI/UX & Produto SaaS

Nome: UI/UX, Landing Page e Onboarding
Categoria: UI/UX / Frontend

### Evidências encontradas

- `src/components/landing/` — 17 componentes (13 seções: hero, features, comparação, resultados, depoimentos, pricing, consultoria, segurança, FAQ, CTA)
- `src/components/ui/` — 23 componentes shadcn/ui (Radix UI, acessíveis)
- `src/store/theme-store.ts` — 2 temas (normal, dark-mega) via ~30 CSS vars cada
- `src/components/cadastro/CadastroForm.tsx` — onboarding multi-etapa (2 steps) + `PasswordStrength`
- `src/utils/trial.ts` — trial de 14 dias
- `src/app/globals.css` — variáveis CSS de tema, `prefers-reduced-motion`, foco visível

### Currículo

- Construí landing page institucional com 13 seções e copy orientada a conversão para o público PME brasileiro.
- Implementei onboarding multi-etapa no cadastro com indicador de força de senha e trial de 14 dias.
- Desenvolvi sistema de temas com 2 variações (escuro e ultra-escuro) via CSS variables, sidebar colapsável, componentes acessíveis (shadcn/ui + Radix) e micro-interações (skeleton, toast).

### STAR

Situação: O produto precisava converter visitantes e reduzir atrito na criação de conta.
Tarefa: Construir presença institucional e onboarding fluido.
Ação: Implementei landing de 13 seções, onboarding multi-etapa com validação de força de senha e trial de 14 dias, além do sistema de temas e componentes acessíveis.
Resultado: Caminho de conversão completo (landing → cadastro → trial) e interface consistente com 2 temas.

### XYZ

Realizado: presença institucional e onboarding de conversão,
Por: construindo landing de 13 seções, cadastro multi-etapa e tema com 2 variações,
Usando: Next.js, Tailwind CSS, shadcn/ui, Radix UI, Zustand.

### Tecnologias

- Next.js 15 / Tailwind CSS 3.4
- shadcn/ui / Radix UI
- Zustand (tema)
- CSS variables

### Competências

- UI/UX design
- Landing page / copywriting
- Onboarding / product-led growth
- Acessibilidade (WAI-ARIA)
- Design System

### Palavras-chave ATS

- UI/UX
- Landing Page
- Onboarding
- Design System
- Tailwind CSS
- Acessibilidade
- Design Responsivo
- Product-led Growth

### Confiança

Alta — componentes e páginas confirmados.

---

# Tecnologias dominadas

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript 5.8 (strict), Tailwind CSS 3.4, shadcn/ui, Radix UI, Zustand 5, react-hook-form, zod, Recharts, date-fns, jsPDF, html2canvas, tesseract.js, pdfjs-dist
- **Backend:** .NET 10, ASP.NET Core Web API, EF Core 10 (24 migrations), Npgsql, ASP.NET Core Identity (PBKDF2), JWT + Refresh Token rotativo
- **Banco de dados:** PostgreSQL 16 (Neon/Railway), migrations EF Core
- **Testes:** Vitest, Playwright
- **DevOps:** Docker multi-stage, docker-compose híbrido, GitHub Actions (buildx), Render (Docker), Vercel, Neon (Postgres gerenciado)
- **IA:** OpenAI API (GPT-4o Vision), Google Gemini API

# Conceitos demonstrados

- Clean Architecture
- Repository Pattern
- Dependency Injection
- REST API
- JWT + Refresh Token Rotation
- RBAC
- Multi-tenancy (Global Query Filters)
- SOLID
- Soft Delete com TTL
- Validação em duas camadas
- Gerenciamento de estado (Zustand)
- Custom Hooks
- OCR / extração de dados
- Integração com IA de visão
- Testes em 3 camadas (unitário, integração, E2E)
- CI/CD
- Acessibilidade (WAI-ARIA)
- Responsividade

# Ferramentas utilizadas

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
- tsx (scripts TS)

# Arquiteturas identificadas

- Clean Architecture (backend: Core / Infrastructure / API)
- Camadas (Controller-Service-Repository)
- Repository Pattern
- Multi-tenant shared database (single DB + Company/User filters)
- Client-Server com REST API
- Frontend: baseado em features + camada de API repositories

---

# Resumo Executivo (máx. 10 bullets)

1. Desenvolvi um **SaaS de gestão financeira** (LUCRAÍ) full-stack com Next.js 15/React/TypeScript + .NET 10/EF Core/PostgreSQL híbrido (Neon), em dupla — fui o autor principal (156 de 211 commits, 74%).
2. Projetei **API REST com 24 controllers e 138 endpoints** em Clean Architecture, com 22 repositórios, 24 migrations, DI e 35 validators FluentValidation.
3. Implementei **autenticação JWT com refresh token rotativo** (`MustChangePassword` + `POST /api/auth/change-password 200`), RBAC e **isolamento multi-tenant** por filtros globais do EF Core em 23 entidades (empresa + usuário; exceções `DismissedAlert` só `Company`, `Category CreatedBy=""`) + `FixedCosts` per-user `B`, com testes de isolamento.
4. Construí **motor de inteligência financeira**: projeção 12 meses, runway, break-even, health score 0–100, nota CFO em linguagem natural e 6 tipos de alertas.
5. Implementei **central de documentos com OCR** (Tesseract pt-BR), parse de NF-e XML/DANFE e **extração por IA** (OpenAI GPT-4o e Gemini), com fluxo de conferência.
6. Construí **emissão de recibos** com numeração sequencial, validação CPF/CNPJ, assinatura digital e **PDF gerado no navegador** (jsPDF).
7. Implementei **precificação inteligente** (insumos com conversão de unidades, custos fixos, margens e simulação de desconto) e financeiro avançado (aging, dívidas, investimentos) no backend.
8. Escrevi **87 testes xUnit**, 7 suítes Vitest e 6 fluxos Playwright, com **CI em 3 jobs** (build, testes e validação de imagens Docker).
9. Configurei **Docker híbrido (compose profiles `postgres local` + Neon `neondb` + Render `lucrai-site.onrender.com` Docker + Vercel FE), Dockerfiles endurecidos (`PORT` dinâmico, `HEALTHCHECK`, `digest pin`) e CI 3 jobs (`buildx`)**, além de automações de dev em TypeScript.
10. Entreguei **produto SaaS completo**: landing de 13 seções, onboarding multi-etapa com trial, 2 temas, auditoria total e soft-delete com TTL.

---

# Resumo por Foco

## Frontend

- Interfaces em **React 19 + Next.js 15 (App Router) + TypeScript strict**, com 23 componentes shadcn/ui/Radix acessíveis.
- Gerenciamento de estado com **Zustand** (persistência em sessionStorage/localStorage) e formulários com **react-hook-form + zod**.
- **OCR e extração de IA no cliente** (pdfjs, tesseract.js, OpenAI/Gemini) e **geração de PDF** (jsPDF/html2canvas).
- Testes com **Vitest (7 suítes) e Playwright (6 fluxos E2E)**; gráficos com Recharts; 2 temas via CSS variables.

## Backend

- **API REST em .NET 10** com 24 controllers/138 endpoints, Clean Architecture (Core/Infrastructure/API).
- **EF Core 10 + PostgreSQL 16** com 23 migrations e **filtros globais de multi-tenancy** em 23 entidades.
- **Autenticação JWT + refresh rotativo (Identity/PBKDF2)**, RBAC e 35 validators FluentValidation.
- **87 testes xUnit** (WebApplicationFactory + InMemory + Moq), incluindo isolamento.
- Serviços de domínio: inteligência financeira (runway, break-even, health score, nota CFO) e alertas.

## Full Stack

- End-to-end em todas as camadas: modelagem de dados (25 entidades, 23 migrations), API (138 endpoints), consumo no frontend (14 API repositories) e testes (unitário + integração + E2E).
- Fluxos completos implementados: autenticação, multi-tenancy, financeiro, previsões, lixeira, documentos com IA, recibos, precificação.

## SaaS

- **Multi-tenancy real** (empresa + usuário), RBAC, auditoria completa, soft-delete com TTL, onboarding com trial e sessão segura.
- Arquitetura de deploy SaaS: Docker, Railway, Vercel e CI/CD automatizado.

## Internacional

- Produto com copy/regras do mercado brasileiro (NF-e, DANFE, CPF/CNPJ, PIX, valor por extenso, BRL) — pronto para compor um portfólio internacional de fintech.
- Documentação técnica e READMEs em PT-BR; materiais de currículo disponíveis em EN-US (ver `en.md`).

## Startup

- MVP completo entregue com escopo bem definido, evolução por sprints (27 sprints documentadas), prototipagem rápida e foco em conversão (landing, onboarding, trial).
- Automações de dev (Docker guard, wait-for-db, deploy scripts) que reduzem o custo de setup de novos desenvolvedores.

---

# Compatibilidade com vagas

| Tipo de vaga | Justificativa |
|---|---|
| **Frontend React / TypeScript** | React 19, Next.js 15, TypeScript strict, Tailwind, shadcn/ui, testes Vitest/Playwright. |
| **Backend .NET / C#** | .NET 10, ASP.NET Core, EF Core, FluentValidation, 87 testes xUnit. |
| **Full Stack** | Implementação completa de ponta a ponta (banco → API → UI → testes → deploy). |
| **SaaS / Product Engineer** | Multi-tenancy, RBAC, onboarding/trial, auditoria, billing de planos e ciclo de produto completo. |
| **Fintech / Gestão Financeira** | Domínio financeiro (fluxo de caixa, previsões, DRE, aging, ROI/IRR, recibos/NF-e, PIX). |
| **Software Engineer (Júnior/Pleno)** | Escopo amplo, código real com testes e CI, evidência de evolução por sprints. |
| **DevOps / DevExp** | Docker, compose, Railway, GitHub Actions, automações em TS. |
| **Internacional** | Stack em inglês (React, .NET, PostgreSQL), testes padronizados e portfólio demonstrável. |
| **Startup** | Entregas rápidas, visão de produto, landing + onboarding + trial (product-led growth). |

---

# Histórico

## v1

- Criado após análise inicial.
