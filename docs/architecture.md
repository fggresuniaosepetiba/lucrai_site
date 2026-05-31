# LUCRAÍ Core — Arquitetura

## Visão Geral

O LUCRAÍ Core é uma aplicação **100% client-side** construída com Next.js 15 (App Router). Não há backend, API ou servidor de banco de dados externo. Todo o armazenamento de dados ocorre no IndexedDB do navegador através da biblioteca Dexie.js.

```
┌─────────────────────────────────────────────────────────┐
│                     Navegador                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Next.js 15 (App Router)               │  │
│  │  ┌─────────┐ ┌──────────┐ ┌───────────────────┐  │  │
│  │  │  Pages  │ │Components│ │   Layout (Shell)   │  │  │
│  │  └────┬────┘ └────┬─────┘ └───────────────────┘  │  │
│  │       │           │                               │  │
│  │  ┌────▼───────────▼───────────────────────────┐  │  │
│  │  │           Zustand Stores                    │  │  │
│  │  │   (auth, theme, sidebar, toast)             │  │  │
│  │  └────────────────┬───────────────────────────┘  │  │
│  │                   │                               │  │
│  │  ┌────────────────▼───────────────────────────┐  │  │
│  │  │         Repositories (CRUD Layer)            │  │  │
│  │  │   transactions, categories, users, etc.     │  │  │
│  │  └────────────────┬───────────────────────────┘  │  │
│  │                   │                               │  │
│  │  ┌────────────────▼───────────────────────────┐  │  │
│  │  │            Dexie.js (IndexedDB)              │  │  │
│  │  │  7 tabelas: transactions, categories,       │  │  │
│  │  │  users, settings, deletedTransactions,      │  │  │
│  │  │  cashForecasts, auditLogs                   │  │  │
│  │  └───────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Estrutura de Pastas

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
│   ├── users/page.tsx             # Gerenciamento de usuários
│   ├── trash/page.tsx             # Lixeira
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
├── database/
│   ├── dexie.ts                   # Classe LucraiDatabase (schema v6)
│   ├── seed.ts                    # Dados iniciais (usuários + categorias)
│   └── repositories/             # Camada de acesso a dados
│       ├── transactions.ts       # CRUD + sumários + auditoria
│       ├── categories.ts         # CRUD + detecção duplicatas
│       ├── cash-forecast.ts      # CRUD + markAsReceived/Paid/Cancelled
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
    └── index.ts                  # Definições de tipos TypeScript
```

## Fluxo de Autenticação

1. Usuário acessa `/login`
2. Preenche email e senha
3. `seedAll()` é chamado para garantir usuários padrão no banco
4. `auth-store.login()` busca o usuário por email no Dexie
5. Compara a senha (texto plano — sem hash)
6. Se OK: salva sessão em `localStorage` + Zustand
7. Redireciona para `/dashboard`
8. Em cada página protegida, `useEffect` verifica `isAuthenticated`
9. Se não autenticado, redireciona para `/login`

## Banco de Dados

### IndexedDB — 7 Tabelas

| Tabela               | Chave     | Índices                                               |
|----------------------|-----------|-------------------------------------------------------|
| transactions         | id        | displayId, type, categoryId, date, createdAt, company |
| categories           | id        | type, name, company                                   |
| users                | id        | email, role, company                                  |
| settings             | id        | company                                               |
| deletedTransactions  | id        | originalId, displayId, deletedAt, restoreUntil, company|
| cashForecasts        | id        | displayId, type, status, expectedDate, company        |
| auditLogs            | id        | entityId, entityType, action, company, timestamp      |

### Schema Version

**v6 (atual):** Adiciona tabela `auditLogs` e índice `displayId` em transactions, cashForecasts e deletedTransactions.

## Padrões Arquiteturais

### Repository Pattern
Cada entidade possui um repositório dedicado em `src/database/repositories/` que encapsula todas as operações de banco de dados (CRUD, consultas especializadas, auditoria).

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
User Action → Page Component → Repository → Dexie/IndexedDB
                    ↓
            Zustand Store (se aplicável)
                    ↓
           Re-render (React state)
```

## Integrações

Atualmente o LUCRAÍ não possui integrações externas. Todo o processamento é local. Integrações futuras planejadas:

- Exportação para PDF e impressão
- Backup/restore para arquivo
- API bancária (Open Finance) — futuro

## Temas

Três temas visuais controlados pelo atributo `data-theme` no `<html>`:

| Tema       | data-theme   | Perfil                          |
|------------|--------------|---------------------------------|
| Normal     | `"normal"`   | Escuro padrão (fundo #0a0f1e)   |
| Dark Mega  | `"dark-mega"`| Ultra escuro (fundo #0a0b0d)    |
| Clean      | `"clean"`    | Claro (fundo branco)            |

Cada tema define ~30 variáveis CSS customizadas. A troca é feita via `theme-store.ts` que atualiza o atributo no `<html>` e persiste a escolha.
