# Sprint 20 — Componente DatePicker Unificado

## Objetivo

Unificar todos os inputs de data do projeto usando o mesmo componente Popover + Calendar (react-day-picker) do Lançamento, eliminando os `<input type="date">` nativos.

## Mudanças

### Criado
- `src/components/ui/date-picker.tsx` — Componente reutilizável encapsulando Popover + Calendar + CalendarIcon com suporte a `disabled` por contexto e `error` para borda vermelha.

### Substituídos

| Local | Antes | Depois |
|---|---|---|
| `Lançamentos (transaction-form.tsx)` | Popover+Calendar inline | `<DatePicker disabled={{ after: new Date() }}>` |
| `Central de Recibos (recibo-form.tsx)` | `<Input type="date">` | `<DatePicker disabled={{ after: new Date() }}>` |
| `Previsão de Caixa (cash-forecast/page.tsx)` — Data Prevista | Popover+Calendar inline | `<DatePicker>` (sem restrição) |
| `Previsão de Caixa (cash-forecast/page.tsx)` — Fim Recorrência | `<Input type="date">` | `<DatePicker>` (sem restrição) |
| `Documentos/Conferência` | `<Input type="date">` | `<DatePicker>` (sem restrição, mantido `isFutureDate`) |

### Removido
- `calendarOpen` / `setCalendarOpen` state dos componentes que tinham Popover inline
- Imports não utilizados: `Popover`, `PopoverContent`, `PopoverTrigger`, `Calendar`, `CalendarIcon`, `cn`

## Comportamento por contexto

| Contexto | `disabled` | Validação |
|---|---|---|
| Lançamentos | `{ after: new Date() }` | `validateTransactionDate()` |
| Recibos | `{ after: new Date() }` | Nenhuma (borda vermelha por erro) |
| Previsão de Caixa | Nenhum | `validateForecastDate()` no submit |
| Documentos/Conferência | Nenhum | `isFutureDate` info box |

## Arquivos modificados
- `src/components/ui/date-picker.tsx` (+69 linhas)
- `src/components/financial/transaction-form.tsx` (−40 linhas)
- `src/components/recibos/recibo-form.tsx` (−3 linhas, +2)
- `src/app/cash-forecast/page.tsx` (−47 linhas)
- `src/app/documentos/[id]/conferencia/page.tsx` (−1 linha, +2)
