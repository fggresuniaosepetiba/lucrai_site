# Sprint 27 — Modais: bloqueio de fechamento por clique fora

## Objetivo

Impedir que os modais do app fechem ao clicar/tocar fora do conteúdo (evita perda acidental de dados preenchidos em formulários). O fechamento continua disponível apenas pelo botão X, pelo botão Cancelar e pela tecla Esc.

## O que foi feito

### `src/components/ui/dialog.tsx` — componente central `DialogContent`

Todos os modais do app usam o componente compartilhado `DialogContent` (Radix `Dialog.Primitive.Content`). A correção foi feita nesse único ponto, adicionando dois handlers no `<DialogPrimitive.Content>`:

```tsx
onPointerDownOutside={(event) => event.preventDefault()}
onInteractOutside={(event) => event.preventDefault()}
```

- `onPointerDownOutside` — bloqueia o fechamento disparado pelo clique/toque fora do modal.
- `onInteractOutside` — bloqueia também o fechamento por interação externa (foco, por exemplo), reforçando o bloqueio.

A tecla Esc **não** foi bloqueada (nenhum `onEscapeKeyDown`), então continua fechando os modais normalmente, conforme solicitado.

Como a alteração é central, ela vale para **todos** os modais do app de uma vez:

| Área | Modais cobertos |
|---|---|
| Financeiro | Formulário de transação (`transaction-form`), `delete-dialog` |
| Previsão de Caixa | Form de previsão, confirmações (recebido/pago/cancelado/excluir/limpar histórico), avisos (ação não permitida, limite de recorrência, duplicidade) |
| Lixeira | Restaurar/excluir permanente de lançamento, documento e recibo |
| Recibos | Excluir recibo, cancelamento, formulário, visualização |
| Documentos | Rejeição de documento |
| Usuários, Categorias, Precificação | Diálogos de criação/edição/exclusão |

## Validação

- `npx tsc --noEmit` — limpo (exit 0).
- Teste visual via Playwright com navegador Edge (`channel: "msedge"`), subindo a stack local (Postgres via Docker + API + Web):
  1. Clique fora do modal → **não fecha** (permanece aberto).
  2. Tecla Esc → **fecha**.
  3. Botão Cancelar → **fecha**.
  4. Botão X → **fecha**.
- Popovers/Selects dentro dos modais não são afetados (usam `Popover`/`Select`, não o `Dialog`).

## Arquivos modificados

| Arquivo | Ação |
|---|---|
| `src/components/ui/dialog.tsx` | `onPointerDownOutside` + `onInteractOutside` com `preventDefault` no `DialogContent` |
| `docs/todo.md` | Adicionado Sprint 27 |

## Observação

Nenhum modal do projeto dependia do clique fora para fechar de forma imprescindível — a mudança apenas torna o fechamento mais deliberado, protegendo dados não salvos.
