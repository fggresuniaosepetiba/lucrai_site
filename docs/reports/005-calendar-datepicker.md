# Calendar / DatePicker

Componente de calendário baseado em `react-day-picker` v10, utilizado nos formulários de criação/edição de transações e previsões financeiras para seleção de datas. Implementado como wrapper customizado em `src/components/ui/calendar.tsx`.

## [2026-07-16] Modernização: custom MonthCaption, popover controlado e normalização de datas

### Problema

1. **Navegação limitada** — O `MonthCaption` padrão do `react-day-picker` v10 exibia apenas o nome do mês sem setas de navegação. A navegação entre meses dependia de implementação externa.

2. **Popover não controlado** — O DatePicker não controlava explicitamente o estado de abertura/fechamento do popover, causando comportamentos inesperados em dispositivos móveis e após seleção de data.

3. **Deslocamento UTC** — Datas em previsões sofriam deslocamento de fuso horário. `2026-07-15T03:00:00.000Z` convertido para string ISO virava `14/07/2026` no fuso Brasil (UTC-3).

### Solução

1. **Custom `MonthCaption`** — Componente próprio substituindo o padrão do `react-day-picker`, com:
   - Botões de navegação (`←` / `→`) para meses anterior e seguinte
   - Exibição do mês e ano por extenso
   - Implementado seguindo a API v10: recebe `{ calendarMonth: { date: Date } }` (o objeto `date` está aninhado em `.calendarMonth.date`)

2. **Popover controlado** — Estado `isOpen` gerenciado com `useState`. Abertura via clique no botão de calendário. Fechamento automático ao selecionar uma data. Previne duplicidade de popovers abertos.

3. **Normalização de datas** — Função `normalizeDate` que remove o deslocamento UTC:
   ```typescript
   const normalizeDate = (date: Date) =>
     new Date(date.getTime() + date.getTimezoneOffset() * 60000);
   ```
   Aplicada em `transaction-form.tsx` e `cash-forecast/page.tsx`.

### Arquivos Alterados

| Arquivo | Mudança |
|---------|---------|
| `src/components/ui/calendar.tsx` | Custom MonthCaption + popover + navegação entre meses |
| `src/components/financial/transaction-form.tsx` | Adaptado para novo Calendar + normalizeDate |
| `src/app/cash-forecast/page.tsx` | Adaptado para novo Calendar + normalizeDate |

### Métricas

| Métrica | Valor |
|---------|-------|
| Arquivos alterados | 3 |
| Linhas adicionadas | 150 |
| Linhas removidas | 39 |
| **Crescimento do calendar.tsx** | **~74%** (de ~90 para ~163 linhas) |
| **Navegação entre meses** | **Adicionada** (antes: ausente) |
| **Popover controlado** | **100%** (antes: não controlado) |
| **Datas normalizadas (UTC fix)** | **100%** (antes: sujeitas a deslocamento) |

### Commits

- `355d713` — Modernize DatePicker com custom MonthCaption, popover controlado e normalizeDate
