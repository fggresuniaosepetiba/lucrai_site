# LUCRAÍ Core — Contexto do Projeto

## Visão do Produto

LUCRAÍ é um sistema de gestão financeira empresarial focado em pequenas e médias empresas brasileiras. O produto funciona como um **Diretor Financeiro Digital**, oferecendo controle de fluxo de caixa, previsões financeiras, relatórios gerenciais e indicadores de saúde financeira — tudo em uma interface moderna e acessível via navegador.

## Propósito

Fornecer às empresas brasileiras uma ferramenta profissional de gestão financeira que seja:

- **Simples** o suficiente para microempreendedores
- **Completa** o bastante para atender PMEs estruturadas
- **Offline-first** — funciona sem depender de servidor remoto
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

| Categoria        | Tecnologia                                              |
|------------------|---------------------------------------------------------|
| Framework        | Next.js 15 (App Router)                                 |
| Linguagem        | TypeScript 5.x                                          |
| Banco de Dados   | IndexedDB via Dexie.js 4.x (client-side)                |
| Estado           | Zustand 5.x com persistência localStorage               |
| UI               | shadcn/ui + Radix UI + Tailwind CSS 3.x                 |
| Ícones           | Lucide React                                            |
| Gráficos         | Recharts 2.x                                            |
| Formulários      | react-hook-form + zod                                   |
| Datas            | date-fns                                                |
| Tema             | Sistema próprio com 3 temas (Normal, Dark Mega, Clean)  |

## Arquitetura

Aplicação **100% client-side** (SPA). Não há backend ou API remota. Todos os dados são armazenados no IndexedDB do navegador usando Dexie.js. O Next.js é usado apenas como framework de interface e roteamento (páginas estáticas geradas no build).

```
[ Navegador ] → [ Next.js (React) ] → [ Dexie.js ] → [ IndexedDB ]
```

## Principais Módulos

| Módulo              | Descrição                                                              |
|---------------------|------------------------------------------------------------------------|
| Dashboard           | Visão executiva com cards financeiros, gráficos e saúde da empresa      |
| Financeiro          | CRUD de transações realizadas (entradas/saídas)                        |
| Previsão de Caixa   | Planejamento de recebimentos e pagamentos futuros                      |
| Categorias          | Gerenciamento de categorias financeiras por tipo                       |
| Relatórios          | Relatório anual com separação realizado/previsto                       |
| Lixeira             | Sistema de exclusão temporária (30 dias) com restauração               |
| Usuários            | Gestão de usuários com controle de acesso por papel                    |
| Configurações       | Dados da empresa, logo, tema e alteração de senha                      |

## Entidades Principais

- **Transaction** — Lançamento financeiro realizado (entrada ou saída) com valor, data, categoria, descrição
- **CashForecast** — Previsão futura com status (previsto/recebido/pago/cancelado)
- **Category** — Categoria financeira com nome, cor, tipo, ícone
- **AppUser** — Usuário com papel (owner/admin/financial/viewer) vinculado a uma empresa
- **DeletedTransaction** — Transação excluída com data de expiração para restauração
- **AuditLog** — Registro de auditoria para todas as ações do sistema
- **AppSettings** — Configurações da empresa (logo, cor primária)

## Diferenciais Competitivos

- **Offline-first**: funciona completamente offline (dados no navegador)
- **Multiempresa**: suporte nativo a múltiplos CNPJs no mesmo sistema
- **Previsão de Caixa**: separação clara entre realizado e previsto
- **Valor por Extenso**: geração automática do valor por extenso em português
- **Indicador de Saúde**: score financeiro executivo baseado em saldo e margem
- **Temas visuais**: 3 temas (Normal, Dark Mega, Clean) para conforto visual
- **Auditoria completa**: rastreamento de todas as ações com usuário responsável
- **Display ID**: identificação #001, #002 amigável para o usuário

## Visão de Longo Prazo

O LUCRAÍ evolui em 5 fases:

1. **MVP** — Gestão financeira essencial (atual)
2. **Pós-MVP** — Exportação, personalização, experiência aprimorada
3. **Inteligência Financeira** — Métricas avançadas, alertas, projeções
4. **CFO Digital** — Recomendações automatizadas, cenários, relatórios executivos
5. **IA Financeira** — Detecção de anomalias, categorização automática, insights preditivos
