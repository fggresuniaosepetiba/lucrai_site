# Sprint 16 — Calendário Financeiro: Bloqueio Visual + Validação Inline

## Contexto

O formulário de lançamento financeiro (`transaction-form.tsx`) usa um calendário ShadCN (react-day-picker v10) para selecionar a data. Embora a validação `validateTransactionDate()` já existisse no backend/submit, ela só disparava ao clicar "Salvar", permitindo que o usuário selecionasse datas futuras sem feedback imediato.

## Problema

- O calendário permitia clicar em qualquer data futura sem bloqueio visual
- O erro só aparecia após o usuário preencher todo o formulário e clicar em "Salvar"
- Frustração: o usuário só descobria que a data era inválida no final do preenchimento

## Solução: Duas mudanças no `transaction-form.tsx`

### 1. Bloqueio visual de datas futuras

```tsx
disabled={{ after: new Date() }}
```

Adicionado como prop do `<Calendar>` (reat-day-picker v10). O componente:
- Desabilita visualmente dias futuros (classe CSS `disabled: "text-muted-foreground/30 cursor-not-allowed"`)
- Impede o clique/seleção — o `onSelect` não dispara para datas desabilitadas
- Hoje permanece selecionável

### 2. Validação inline no `onSelect`

```tsx
const dateStr = `${d.getFullYear()}-${...}`;
setDate(dateStr);
const dateCheck = validateTransactionDate(dateStr);
if (!dateCheck.valid) {
  setErrors((prev) => ({ ...prev, date: dateCheck.message }));
} else {
  setErrors((prev) => ({ ...prev, date: "" }));
}
```

A validação roda imediatamente ao selecionar uma data. A mensagem de erro aparece abaixo do campo antes do submit:
> "A Página Financeiro aceita apenas lançamentos realizados. Para lançamentos futuros utilize a funcionalidade Previsão de Caixa."

## Arquivos modificados

| Arquivo | Mudança |
|---------|---------|
| `src/components/financial/transaction-form.tsx:257-270` | `disabled` prop + validação inline no `onSelect` |
| `docs/todo.md` | Sprint 16 adicionada |
| `docs/frontend-todo.md` | Sprint 16 adicionada |

## Comportamento final

| Ação | Antes | Depois |
|------|-------|--------|
| Clicar em data futura no calendário | Selecionava, erro só no submit | Botão desabilitado, não clica |
| Selecionar data futura (se conseguisse) | Sem feedback visual | Erro aparece imediatamente abaixo |
| Selecionar data passada/hoje | OK | OK |

## Build

- `npm run build` — 0 erros (testado)
- `npm run lint` — sem warnings relacionados
