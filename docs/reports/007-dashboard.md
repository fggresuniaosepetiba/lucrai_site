# Dashboard

Tela inicial do sistema com visão executiva da saúde financeira da empresa. Exibe cards de saldo, receitas, despesas, indicadores de saúde financeira e gráficos mensais de categorias (Entradas vs Saídas).

## [2026-07-16] Correção da ordem das abas no gráfico de categorias

### Problema

O seletor de abas no gráfico de categorias exibia as opções na ordem **Saídas → Entradas**, invertida em relação à hierarquia visual esperada. Como Entradas representam receita (indicador positivo), deveriam vir primeiro para manter consistência com o restante do dashboard.

### Solução

Invertida a ordem do array de abas no componente `chart-categories.tsx`:
```
["saidas", "entradas"]  →  ["entradas", "saidas"]
```

A alteração foi feita diretamente na definição das opções do seletor de abas, sem impacto em lógica de dados ou queries.

### Arquivos Alterados

| Arquivo | Mudança |
|---------|---------|
| `src/components/dashboard/chart-categories.tsx` | Ordem do array de abas invertida |

### Métricas

| Métrica | Valor |
|---------|-------|
| Arquivos alterados | 1 |
| Linhas alteradas | 4 (2 adicionadas, 2 removidas) |
| **Ordem das abas** | **Entradas → Saídas** (antes: invertido) |

### Commits

- `d89bd8c` — Swap chart categories tab order — Entradas first, Saídas second
