# LUCRAÍ Core — Contexto do Projeto

## Visão do Produto

LUCRAÍ é um sistema de gestão financeira empresarial focado em pequenas e médias empresas brasileiras. O produto funciona como um **Diretor Financeiro Digital**, oferecendo controle de fluxo de caixa, previsões financeiras, relatórios gerenciais e indicadores de saúde financeira — tudo em uma interface moderna e acessível via navegador.

## Propósito

Fornecer às empresas brasileiras uma ferramenta profissional de gestão financeira que seja:

- **Simples** o suficiente para microempreendedores
- **Completa** o bastante para atender PMEs estruturadas
- **Híbrido (online + offline)** — opera com API remota e fallback local
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
| Framework Frontend | Next.js 15 (App Router) + TypeScript 5.x                |
| Framework Backend  | .NET 10 (C#) — ASP.NET Web API                          |
| Banco de Dados     | PostgreSQL (produção) + IndexedDB Dexie.js (fallback)   |
| ORM                | Entity Framework Core 10 + Npgsql                       |
| Autenticação       | JWT + ASP.NET Core Identity                             |
| Estado (FE)        | Zustand 5.x com persistência localStorage               |
| UI (FE)            | shadcn/ui + Radix UI + Tailwind CSS 3.x                 |
| Ícones             | Lucide React                                            |
| Gráficos           | Recharts 2.x                                            |
| Formulários        | react-hook-form + zod                                   |
| Datas              | date-fns                                                |
| Tema               | Sistema próprio com 3 temas (Normal, Dark Mega, Clean)  |
| Infra              | Docker + Railway (deploy)                                |

## Arquitetura

Aplicação **full-stack** com frontend Next.js 15 e backend .NET 10 + PostgreSQL. O frontend se comunica com a API REST via fetch, utilizando JWT para autenticação. O IndexedDB (Dexie.js) existe como fallback offline para entidades que ainda não possuem backend.

```
[ Navegador ] → [ Next.js (React) ] → [ API Repositories ] → HTTP → [ .NET API ] → [ EF Core ] → [ PostgreSQL ]
                                                          ↘ fallback → [ Dexie.js ] → [ IndexedDB ]
```

## Principais Módulos

| Módulo              | Descrição                                                              |
|---------------------|------------------------------------------------------------------------|
| Dashboard           | Visão executiva com cards financeiros, gráficos e saúde da empresa      |
| Financeiro          | CRUD de transações realizadas (entradas/saídas)                        |
| Previsão de Caixa   | Planejamento de recebimentos e pagamentos futuros                      |
| Categorias          | Gerenciamento de categorias financeiras por tipo                       |
| Indicadores         | Central de Inteligência Financeira (10 sub-abas)                       |
| Relatórios          | Relatório anual com separação realizado/previsto                       |
| Lixeira             | Sistema de exclusão temporária (30 dias) com restauração               |
| Usuários            | Gestão de usuários com controle de acesso por papel                    |
| Configurações       | Dados da empresa, logo, tema e alteração de senha                      |
| Documentos          | Upload e gestão de documentos fiscais com reconhecimento automático     |
| Pricing             | Precificação com insumos, custos fixos e margem                        |
| Recibos             | Emissão de recibos com assinatura digital                              |

## Entidades Principais

- **Transaction** — Lançamento financeiro realizado (entrada ou saída) com valor, data, categoria, descrição
- **CashForecast** — Previsão futura com status (previsto/recebido/pago/cancelado)
- **Category** — Categoria financeira com nome, cor, tipo, ícone
- **AppUser** — Usuário com papel (owner/admin/financial/viewer) vinculado a uma empresa
- **DeletedTransaction** — Transação excluída com data de expiração para restauração
- **AuditLog** — Registro de auditoria para todas as ações do sistema
- **AppSettings** — Configurações da empresa (logo, cor primária)

## Diferenciais Competitivos

- **Arquitetura full-stack**: Next.js + .NET + PostgreSQL — escalável e profissional
- **Multiempresa**: suporte nativo a múltiplos CNPJs no mesmo sistema
- **Fallback offline**: dados disponíveis mesmo sem conexão (via IndexedDB)
- **Previsão de Caixa**: separação clara entre realizado e previsto
- **Valor por Extenso**: geração automática do valor por extenso em português
- **Indicador de Saúde**: score financeiro executivo baseado em saldo e margem
- **Temas visuais**: 3 temas (Normal, Dark Mega, Clean) para conforto visual
- **Auditoria completa**: rastreamento de todas as ações com usuário responsável
- **Display ID**: identificação #001, #002 amigável para o usuário

## Visão de Longo Prazo

O LUCRAÍ evolui em 5 fases:

1. **MVP** — Gestão financeira essencial (concluído)
2. **Pós-MVP** — Exportação, personalização, experiência aprimorada (em andamento)
3. **Inteligência Financeira** — Métricas avançadas, alertas, projeções
4. **CFO Digital** — Recomendações automatizadas, cenários, relatórios executivos
5. **IA Financeira** — Detecção de anomalias, categorização automática, insights preditivos
