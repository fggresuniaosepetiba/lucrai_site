# Sprint 11 — Remoção final do Dexie (pacote + arquivo morto)

## Objetivo

Remover os últimos vestígios físicos do Dexie: o arquivo `dexie.ts`, a pasta `src/database/` e o pacote `npm dexie`.

## O que foi feito

1. **Deletado** `src/database/dexie.ts` — arquivo vazio sem imports no código de produção
2. **Deletado** `src/database/` — pasta agora vazia
3. **Desinstalado** pacote `dexie` via `npm uninstall dexie`
4. **Verificado** `npx tsc --noEmit` → 0 erros

## Documentação atualizada

- `docs/todo.md` — seção Dexie expandida com tabela completa de tudo que foi removido nas sprints 9–11
- `docs/frontend-todo.md` — linha do Dexie marcada como removida; seção Grupo B corrigida (não é mais "escopo futuro", está concluída); total corrigido para 147/151

## Resultado

- **Zero** dependência do Dexie no frontend
- **Zero** arquivos em `src/database/`
- **TypeScript check:** 0 erros
- **Frontend 100% API REST** — sem fallback local, sem IndexedDB, sem schema versioning obsoleto

## Pendências gerais (fora do escopo Dexie)

- Onboarding interativo para novos usuários
- Backup e restauração dos dados
- Exportação para PDF
- Modo escuro programável (agendado)
