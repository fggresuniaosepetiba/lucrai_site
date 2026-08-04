# LUCRAÍ Core — Contexto do Projeto

## Visão do Produto

LUCRAÍ é um sistema de gestão financeira empresarial focado em pequenas e médias empresas brasileiras. O produto funciona como um **Diretor Financeiro Digital**, oferecendo controle de fluxo de caixa, previsões financeiras, relatórios gerenciais e indicadores de saúde financeira — tudo em uma interface moderna e acessível via navegador.

## Propósito

Fornecer às empresas brasileiras uma ferramenta profissional de gestão financeira que seja:

- **Simples** o suficiente para microempreendedores
- **Completa** o bastante para atender PMEs estruturadas
- **100% online** — todos os dados persistidos na API REST + PostgreSQL (Dexie/IndexedDB removido)
- **Multiempresa** — um único sistema atende múltiplos CNPJs

## Público-Alvo

- Microempreendedores Individuais (MEI)
- Pequenas e médias empresas (PMEs)
- Escritórios de contabilidade parceiros
- Administradores financeiros não especializados
- Empresas que migraram de planilhas e buscam profissionalização

## Posicionamento

LUCRAÍ se posiciona como a camada de inteligência financeira entre o controle por planilhas (Excel/Google Sheets) e os ERPs corporativos pesados (SAP, Oracle, Totvs). É um sistema **leve, visual e opinativo** sobre boas práticas de gestão financeira.

## Stack Tecnológica

| Categoria          | Tecnologia                                              |
|--------------------|---------------------------------------------------------|
| Framework Frontend | Next.js 15.2 (App Router) + TypeScript 5.8 (strict)     |
| Framework Backend  | .NET 10 (C#) — ASP.NET Web API                          |
| Banco de Dados     | PostgreSQL 16 (produção via Neon/Railway)               |
| ORM                | Entity Framework Core 10 + Npgsql                       |
| Autenticação       | JWT + Refresh Token rotativo + ASP.NET Core Identity (PBKDF2) |
| Estado (FE)        | Zustand 5.x com persistência manual (sessionStorage/localStorage) |
| UI (FE)            | shadcn/ui (23 componentes) + Radix UI + Tailwind CSS 3.4 |
| Ícones             | Lucide React                                            |
| Gráficos           | Recharts 2.x                                            |
| Formulários        | react-hook-form + zod                                   |
| Datas              | date-fns + react-day-picker                             |
| PDF / Extração     | jsPDF + html2canvas / tesseract.js + pdfjs-dist + DOMParser |
| Tema               | Sistema próprio com 2 temas (Normal, Dark Mega)         |
| Testes (BE)        | xUnit 87 testes + WebApplicationFactory + Moq           |
| Testes (FE)        | Vitest (7 suítes) + Playwright (6 specs)                |
| Infra              | Docker (compose + profiles) + Railway + Vercel + GitHub Actions |

## Arquitetura

Aplicação **full-stack** com frontend Next.js 15 e backend .NET 10 + PostgreSQL. O frontend se comunica com a API REST via fetch, utilizando JWT para autenticação.

```
[ Navegador ] → [ Next.js (React) ] → [ API Repositories ] → HTTP → [ .NET API ] → [ EF Core ] → [ PostgreSQL ]
```

## Principais Módulos

| Módulo              | Descrição                                                              |
|---------------------|------------------------------------------------------------------------|
| Landing Page        | Página institucional com 13 seções (hero, features, pricing, FAQ...)    |
| Cadastro            | Onboarding multi-etapa com força de senha e trial de 14 dias           |
| Dashboard           | Visão executiva com cards financeiros, gráficos e saúde da empresa      |
| Inteligência Financeira | Central CFO: 10 sub-abas (DRE, DFC, balancete, razão, balanço), nota CFO, projeção 12m, runway, breakeven, health score |
| Financeiro          | CRUD de transações realizadas (entradas/saídas)                        |
| Previsão de Caixa   | Planejamento de recebimentos e pagamentos futuros                      |
| Categorias          | Gerenciamento de categorias financeiras por tipo                       |
| Relatórios          | Relatório anual com separação realizado/previsto                       |
| Lixeira             | Sistema de exclusão temporária (30 dias) com restauração               |
| Usuários            | Gestão de usuários com controle de acesso por papel                    |
| Configurações       | Dados da empresa, logo, tema e alteração de senha                      |
| Documentos          | Upload de documentos fiscais com OCR (Tesseract.js), IA (OpenAI/Gemini) e parse de NF-e XML/DANFE |
| Pricing             | Precificação com insumos (conversão de unidades), custos fixos e margens |
| Recibos             | Emissão de recibos com assinatura digital e geração de PDF            |
| Financeiro Avançado | Contas a pagar/receber (aging), dívidas, investimentos (backend)       |

## Entidades Principais

- **Transaction** — Lançamento financeiro realizado (entrada ou saída) com valor, data, categoria, descrição
- **CashForecast** — Previsão futura com status (previsto/recebido/pago/cancelado)
- **Category** — Categoria financeira com nome, cor, tipo, ícone
- **User** — Usuário (ASP.NET Identity) com papel (owner/admin/financial/viewer) vinculado a uma empresa
- **DeletedItem** — Registro excluído com TTL de 30 dias para restauração
- **AuditLog** — Registro de auditoria para todas as ações do sistema
- **CompanySettings** — Configurações da empresa (logo, cor primária)
- **DocumentoFinanceiro** — Documento fiscal com campos extraídos (OCR/IA)
- **Recibo** — Recibo emitido (com assinatura digital e soft delete)
- **PricingProduct / Insumo / FixedCost** — Precificação
- **AccountPayable / AccountReceivable / Debt / Investment / BalanceAccount** — Financeiro avançado

## Diferenciais Competitivos

- **Arquitetura full-stack**: Next.js + .NET + PostgreSQL — escalável e profissional
- **Multiempresa + isolamento por usuário**: filtros globais EF Core em 23 entidades (migrações de segurança)
- **Inteligência Financeira**: nota CFO em linguagem natural, projeção 12m, runway, breakeven, health score, alertas inteligentes
- **Documentos com OCR/IA**: Tesseract.js (PT-BR), OpenAI Vision, Gemini e parser de NF-e XML/DANFE
- **Previsão de Caixa**: separação clara entre realizado e previsto
- **Valor por Extenso**: geração automática do valor por extenso em português
- **Recibos digitais**: numeração `REC-{ano}-######`, validação CPF/CNPJ e PDF via jsPDF
- **Temas visuais**: 2 temas (Normal, Dark Mega) para conforto visual
- **Auditoria completa**: rastreamento de todas as ações com usuário responsável
- **Display ID**: identificação #001, #002 amigável para o usuário
- **Testes**: 87 xUnit + 7 Vitest + 6 Playwright + CI em 3 jobs

## Visão de Longo Prazo

O LUCRAÍ evolui em 5 fases:

1. **MVP** — Gestão financeira essencial (concluído)
2. **Pós-MVP** — Exportação, personalização, experiência aprimorada (em andamento)
3. **Inteligência Financeira** — Métricas avançadas, alertas, projeções (concluído)
4. **CFO Digital** — Recomendações automatizadas, cenários, relatórios executivos (em andamento)
5. **IA Financeira** — Detecção de anomalias, categorização automática, insights preditivos
