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

**Arquivo:** `src/database/repositories/categories.ts`

| Método | Descrição |
|---|---|
| `getAll(company)` | Retorna todas as categorias da empresa |
| `getByType(type, company)` | Retorna categorias filtradas por tipo |
| `create(data, company)` | Cria nova categoria com validação de nome (max 120 caracteres) |
| `update(id, data)` | Atualiza nome/cor/ícone/tipo |
| `delete(id)` | Exclui se nenhuma transação estiver vinculada |
| `findDuplicates(company)` | Detecta duplicatas (mesmo nome + tipo) |
| `removeDuplicates(company)` | Remove duplicatas e reassocia transações |

### Regras de negócio no Repository:
- Nome da categoria: máximo 120 caracteres
- Exclusão bloqueada se houver transações vinculadas à categoria
- Duplicata detectada por `nome.toLowerCase().trim() + tipo`

## 3. Database (IndexedDB)

**Arquivo:** `src/database/dexie.ts`

Tabela `categories` — schema v9:
```
categories: "id, type, name, company"
```

## 4. Seed (Dados Iniciais)

**Arquivo:** `src/database/seed.ts`

Categorias padrão criadas via `seedDefaultCategories(company)`:
- **Entrada (income):** Vendas, Prestação de Serviços, Investimentos, Receitas Diversas
- **Saída (expense):** Salários, Aluguel, Fornecedores, Marketing, Impostos, Despesas Operacionais, Pró-Labore, Manutenção

Só são semeadas se a empresa ainda não tiver nenhuma categoria cadastrada.

## 5. Fluxo nos Módulos

### 5.1 Financeiro (`/financial`)

**Arquivo:** `src/app/financial/page.tsx`

- Carrega categorias via `CategoryRepository.getAll(company)` no `loadData()`
- Passa `categories` como prop para `TransactionForm`
- Botões de tipo: **Entrada** → `income`, **Saída** → `expense`

**Componente:** `src/components/financial/transaction-form.tsx`

- Filtra categorias por tipo: `localCategories.filter(c => c.type === type)`
- Quando usuário clica em "Entrada", `type = "income"` → mostra categorias de entrada
- Quando usuário clica em "Saída", `type = "expense"` → mostra categorias de saída
- Ao trocar o tipo, `categoryId` é resetado para `""`
- "+ Criar nova categoria" → `onCreateCategory` → salva no DB via `CategoryRepository.create` → adiciona ao estado local → seleciona automaticamente

### 5.2 Categorias (`/categories`)

**Arquivo:** `src/app/categories/page.tsx`

- CRUD completo (criar, editar, excluir)
- Botões de tipo: **Entrada** → `income`, **Saída** → `expense`
- Paleta de 12 cores fixas
- Agrupamento visual por tipo (Entradas / Saídas)
- Detecção e remoção de duplicatas integrada
- Proteção: não permite excluir categoria com transações vinculadas

### 5.3 Previsão de Caixa (`/cash-forecast`)

**Arquivo:** `src/app/cash-forecast/page.tsx`

- Carrega categorias via `CategoryRepository.getAll(company)` no `loadData()`
- Filtra por tipo: `categories.filter(c => c.type === formType)`
- Select exibe nome da categoria, armazena `formCategory` (string com o nome)
- Ao trocar tipo (Entrada/Saída), `formCategory` é resetado
- "+ Criar nova categoria" → `handleCreateCategory` → salva no DB → adiciona ao estado local → seleciona automaticamente

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
  → CategoryRepository.create({ name, type, color, icon }, company)
  → Categoria salva no IndexedDB
  → Estado local atualizado (setCategories)
  → Categoria selecionada no select automaticamente
  → Disponível em todos os módulos na próxima renderização
```

## 8. Fluxo de Atualização

```
Usuário edita categoria na página Categorias
  → Dialog preenchido com dados atuais
  → Usuário altera nome/cor/tipo
  → CategoryRepository.update(id, data)
  → IndexedDB atualizado
  → loadCategories() recarrega lista
  → Próximo uso no Financeiro/Previsão reflete alteração
```

## 9. Fluxo de Exclusão

```
Usuário clica em excluir na página Categorias
  → Confirmação exibida
  → CategoryRepository.delete(id)
  → Verifica se há transações vinculadas (categoryId === id)
  → Se sim: erro "Cannot delete category: N transaction(s) use it"
  → Se não: remove do IndexedDB
  → loadCategories() recarrega lista
```

## 10. Dependências Entre Módulos

```
CategoryRepository (fonte única de dados)
  ├── Página Categorias (CRUD + duplicatas)
  ├── Página Financeiro (leitura + criação inline)
  └── Página Previsão de Caixa (leitura + criação inline)
```

**Regra:** Não existe lógica duplicada, cadastro paralelo ou categorias independentes por módulo. A fonte única é o `CategoryRepository` operando sobre a tabela `categories` do Dexie.

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
  - Importado `CategoryRepository` e tipo `Category`
  - Adicionado estado `categories`
  - Carregamento no `loadData()`
  - Substituído Input por `<Select>` com filtro por tipo
  - Adicionado "+ Criar nova categoria" com salvamento imediato no DB
  - Categoria selecionada automaticamente após criação
