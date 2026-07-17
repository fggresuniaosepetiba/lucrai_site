# Fluxo de Categorias — LUCRAÍ

## 1. Estrutura de Dados

```typescript
// src/types/index.ts
export type TransactionType = "income" | "expense";

export interface Category {
  id: string;
  name: string;      // Nome exibido (ex: "Vendas", "Aluguel")
  color: string;     // Cor hexadecimal (ex: "#22c55e")
  icon: string;      // Nome do ícone Lucide (ex: "tag")
  type: TransactionType; // "income" (Entrada) | "expense" (Saída)
  company: string;   // CNPJ/nome da empresa (multi-tenant)
  createdAt: string; // ISO date
}
```

## 2. Repository

**Arquivo:** `src/services/api-repositories/categories.ts` (principal)

A página de categorias foi migrada para usar a API REST do backend. O `CategoryRepositoryApi` faz chamadas HTTP para o controller `CategoriesController`.

| Método | Descrição |
|---|---|
| `getAll()` | Retorna todas as categorias da empresa do usuário logado |
| `getByType(type)` | Retorna categorias filtradas por tipo |
| `create(data)` | Cria nova categoria com validação |
| `update(id, data)` | Atualiza nome/cor/ícone/tipo |
| `delete(id)` | Exclui se nenhuma transação estiver vinculada |
| `findDuplicates()` | Detecta duplicatas (mesmo nome + tipo) |
| `removeDuplicates()` | Remove duplicatas e reassocia transações |

O repositório Dexie (`src/database/repositories/categories.ts`) existe apenas como fallback offline.

### Regras de negócio (no backend):
- Nome da categoria: máximo 120 caracteres
- Exclusão bloqueada se houver transações vinculadas à categoria
- Duplicata detectada por `nome.ToLower().Trim() + tipo`
- Empresa herdada do usuário autenticado via JWT

## 3. Database

**Backend** — PostgreSQL, tabela `Categories` via EF Core.

**Frontend (fallback)** — IndexedDB, tabela `categories` — schema v14:
```
categories: "id, type, name, company"
```

## 4. Seed (Dados Iniciais)

**Arquivo:** `backend/src/Lucrai.Infrastructure/Seed/DataSeeder.cs`

Categorias padrão criadas via `DataSeeder.SeedCategoriesAsync()`:
- **Entrada (income):** Vendas, Prestação de Serviços, Investimentos, Receitas Diversas
- **Saída (expense):** Salários, Aluguel, Fornecedores, Marketing, Impostos, Despesas Operacionais, Pró-Labore, Manutenção

Só são semeadas se a empresa ainda não tiver nenhuma categoria cadastrada (verificação via `_context.Categories.AnyAsync(c => c.Company == company)`).

## 5. Fluxo nos Módulos

### 5.1 Financeiro (`/financial`)

**Arquivo:** `src/app/financial/page.tsx`

- Carrega categorias via `CategoryRepositoryApi.getAll()` no `loadData()`
- Passa `categories` como prop para `TransactionForm`
- Botões de tipo: **Entrada** → `income`, **Saída** → `expense`

**Componente:** `src/components/financial/transaction-form.tsx`

- Filtra categorias por tipo: `localCategories.filter(c => c.type === type)`
- Quando usuário clica em "Entrada", `type = "income"` → mostra categorias de entrada
- Quando usuário clica em "Saída", `type = "expense"` → mostra categorias de saída
- Ao trocar o tipo, `categoryId` é resetado para `""`
- "+ Criar nova categoria" → `onCreateCategory` → salva via API → adiciona ao estado local → seleciona automaticamente

### 5.2 Categorias (`/categories`)

**Arquivo:** `src/app/categories/page.tsx`

- CRUD completo via API REST (criar, editar, excluir)
- Botões de tipo: **Entrada** → `income`, **Saída** → `expense`
- Paleta de 12 cores fixas
- Agrupamento visual por tipo (Entradas / Saídas)
- Detecção e remoção de duplicatas integrada
- Proteção: não permite excluir categoria com transações vinculadas

### 5.3 Previsão de Caixa (`/cash-forecast`)

**Arquivo:** `src/app/cash-forecast/page.tsx`

- Carrega categorias via `CategoryRepositoryApi.getAll()` no `loadData()`
- Filtra por tipo: `categories.filter(c => c.type === formType)`
- Select exibe nome da categoria, armazena `formCategory` (string com o nome)
- Ao trocar tipo (Entrada/Saída), `formCategory` é resetado
- "+ Criar nova categoria" → `handleCreateCategory` → salva via API → adiciona ao estado local → seleciona automaticamente

**Importante:** `CashForecast.category` é uma string (nome), não um ID — diferentemente de `Transaction.categoryId`.

## 6. Filtro Entrada/Saída

Todos os três módulos usam o mesmo padrão:

```
categorias.filter(c => c.type === tipoSelecionado)
```

Onde:
- `"income"` = Entrada
- `"expense"` = Saída

## 7. Fluxo de Criação de Categoria

```
Usuário clica em "+ Criar nova categoria"
  → Input de nome é exibido
  → Usuário digita nome e clica "Criar"
  → CategoryRepositoryApi.create({ name, type, color, icon })
  → POST /api/categories → backend salva no PostgreSQL
  → Estado local atualizado (setCategories)
  → Categoria selecionada no select automaticamente
  → Disponível em todos os módulos na próxima renderização
```

## 8. Fluxo de Atualização

```
Usuário edita categoria na página Categorias
  → Dialog preenchido com dados atuais
  → Usuário altera nome/cor/tipo
  → CategoryRepositoryApi.update(id, data)
  → PUT /api/categories/{id} → backend atualiza no PostgreSQL
  → loadCategories() recarrega lista via API
  → Próximo uso no Financeiro/Previsão reflete alteração
```

## 9. Fluxo de Exclusão

```
Usuário clica em excluir na página Categorias
  → Confirmação exibida
  → CategoryRepositoryApi.delete(id)
  → DELETE /api/categories/{id} → backend verifica transações vinculadas
  → Se houver vínculo: erro "Cannot delete category: N transaction(s) use it"
  → Se não: remove do PostgreSQL
  → loadCategories() recarrega lista via API
```

## 10. Dependências Entre Módulos

```
CategoryRepositoryApi (fonte principal — API REST)
  ├── Página Categorias (CRUD + duplicatas)
  ├── Página Financeiro (leitura + criação inline)
  └── Página Previsão de Caixa (leitura + criação inline)

CategoryRepository (fallback — IndexedDB/Dexie)
  └── Usado apenas quando API está indisponível
```

**Regra:** A fonte única de dados é a API REST (PostgreSQL). O repositório Dexie opera apenas como fallback offline.

## 11. Correções Aplicadas

### Problema 01 — Botões invertidos no Financeiro
- **Arquivo:** `src/components/financial/transaction-form.tsx`
- **Causa:** Botão "Entrada" disparava `handleTypeChange("expense")` e "Saída" disparava `handleTypeChange("income")`
- **Correção:** Invertido o mapeamento: "Entrada" → `income`, "Saída" → `expense`

### Problema 01b — Botões invertidos na página Categorias
- **Arquivo:** `src/app/categories/page.tsx`
- **Mesma causa e correção.**

### Problema 02 — Previsão de Caixa sem categorias
- **Arquivo:** `src/app/cash-forecast/page.tsx`
- **Causa:** Campo categoria era `<Input>` de texto livre
- **Correção:**
  - Importado `CategoryRepositoryApi` e tipo `Category`
  - Adicionado estado `categories`
  - Carregamento no `loadData()`
  - Substituído Input por `<Select>` com filtro por tipo
  - Adicionado "+ Criar nova categoria" com salvamento via API
  - Categoria selecionada automaticamente após criação
