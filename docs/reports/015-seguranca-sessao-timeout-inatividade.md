# Sprint 15 — Segurança: Sessão efêmera + Timeout de Inatividade

## Objetivo

Corrigir os problemas de segurança reportados pelo QA: (1) auto-login sem credenciais ao acessar `/login` após logout, (2) sessão persistente mesmo após fechar o navegador, (3) ausência de timeout de inatividade.

## O que foi feito

### 1. Token de sessão: `localStorage` → `sessionStorage`

Todas as chaves de autenticação foram migradas de `localStorage` (persiste entre sessões) para `sessionStorage` (morre ao fechar a aba):

- `lucrai-access-token` — JWT de acesso
- `lucrai-refresh-token` — token de refresh
- `lucrai-auth` — dados do usuário logado

**Efeito:** fechar a aba/navegador limpa os tokens automaticamente. Na próxima visita, o usuário precisa digitar e-mail e senha.

**Arquivos alterados:**
- `src/store/auth-store.ts` — 14 ocorrências
- `src/services/api.ts` — 8 ocorrências
- `src/services/api-repositories/documents.ts` — 1 ocorrência
- `src/services/documentos/__tests__/documentos-api.test.ts` — mock atualizado

### 2. Race condition no logout corrigida

`src/components/layout/sidebar.tsx` — `handleLogout` agora faz `await logout()` antes de redirecionar para `/login`. Antes o redirect acontecia antes do `logout()` completar, deixando tokens residuais que permitiam auto-login.

```tsx
// Antes (bug):
const handleLogout = () => { logout(); router.push("/login"); };

// Depois:
const handleLogout = async () => { await logout(); router.push("/login"); };
```

### 3. Login page nunca auto-redireciona

`src/app/login/page.tsx` — removido o `useEffect` que verificava `isAuthenticated` e redirecionava automaticamente para `/dashboard`. A tela de login sempre exibe o formulário, exigindo que o usuário digite credenciais explicitamente.

### 4. Timeout de inatividade (15 minutos)

Criado `src/components/layout/InactivityTracker.tsx`:
- Monitora eventos de atividade: `mousedown`, `mousemove`, `keydown`, `scroll`, `touchstart`, `click`, `wheel`
- Timer de **15 minutos** de inatividade
- Toast de warning aos **14 minutos** ("Sua sessão será encerrada por inatividade em 1 minuto")
- Auto-logout aos 15 minutos: chama `logout()` + redireciona para `/login`
- Timer reseta a qualquer evento de atividade
- Não opera em rotas públicas (`/`, `/cadastro`, `/login`, `/bem-vindo`)
- Cleanup completo de timers e listeners no unmount

Montado em `src/app/layout.tsx` dentro do `AuthInitializer`.

### 5. Teste atualizado

Mock do `localStorage` substituído por `storageMock` compartilhado entre `localStorage` e `sessionStorage` no teste de `documentos-api.test.ts`.

## Regras de negócio implementadas

| Regra | Mecanismo |
|-------|-----------|
| Fechou o navegador/aba → precisa logar de novo | `sessionStorage` (morre ao fechar a aba) |
| 15 min sem mexer → deslogar automaticamente | `InactivityTracker` com timer + eventos de atividade |
| Clicou "Sair" → tela de login pede senha | `await logout()` + login page sem auto-redirect |

## Arquivos criados/modificados

| Arquivo | Ação |
|---|---|
| `src/components/layout/InactivityTracker.tsx` | Criado |
| `src/store/auth-store.ts` | Modificado (localStorage → sessionStorage) |
| `src/services/api.ts` | Modificado (localStorage → sessionStorage) |
| `src/services/api-repositories/documents.ts` | Modificado (localStorage → sessionStorage) |
| `src/services/documentos/__tests__/documentos-api.test.ts` | Modificado (mock) |
| `src/components/layout/sidebar.tsx` | Modificado (race condition) |
| `src/app/login/page.tsx` | Modificado (auto-redirect removido) |
| `src/app/layout.tsx` | Modificado (InactivityTracker montado) |
| `docs/todo.md` | Modificado |
| `docs/frontend-todo.md` | Modificado |
