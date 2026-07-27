# Sprint 23 — Correção de Duplicação de Categorias

## Problema

Categorias estavam aparecendo multiplicadas nos selects de categoria em três lugares:
- Formulário de transações financeiras
- Tela de conferência de documentos
- Tela de previsão de caixa

## Causas raiz

1. **Banco de dados**: Não havia unique constraint em `(Name, Type, Company)` na tabela `Categories`, permitindo registros duplicados
2. **Repositório**: `CreateAsync` no `CategoryRepository` não verificava se já existia categoria com mesmo nome+tipo+empresa antes de inserir
3. **Frontend**: Os três componentes que renderizam selects de categoria não filtravam duplicatas

## Correções

### Backend

1. **`LucraiDbContext.cs`**: índice `IX_Categories_Company_Name` substituído por `IX_Categories_Name_Type_Company` com `IsUnique()`
2. **Migration `AddUniqueCategoryIndex`**: Remove duplicatas existentes antes de aplicar o índice único:
   - Reatribui transações das categorias duplicadas para a mantida
   - Remove as categorias duplicadas
3. **`CategoryRepository.CreateAsync`**: Verifica se já existe categoria com `(Name, Type, Company)` antes de criar — se existir, retorna a existente

### Frontend

1. **`transaction-form.tsx`**: `filteredCategories` usa `useMemo` com dedup por `name.toLowerCase().trim()`
2. **`conferencia/page.tsx`**: `incomeCategories` e `expenseCategories` usam `useMemo` com dedup
3. **`cash-forecast/page.tsx`**: `uniqueCategories` usa `useMemo` com dedup, e o select usa `uniqueCategories` em vez de `userCategories`

## Arquivos modificados

### Backend
- `backend/src/Lucrai.Infrastructure/Data/LucraiDbContext.cs`
- `backend/src/Lucrai.Infrastructure/Repositories/CategoryRepository.cs`
- `backend/src/Lucrai.Infrastructure/Migrations/20260727221419_AddUniqueCategoryIndex.cs`

### Frontend
- `src/components/financial/transaction-form.tsx`
- `src/app/documentos/[id]/conferencia/page.tsx`
- `src/app/cash-forecast/page.tsx`

### Documentação
- `docs/todo.md` — Sprint 23 adicionada
