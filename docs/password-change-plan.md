# Plano: Troca de Senha Obrigatória + Planos + SuperAdmin

## Backend
- [ ] Adicionar campo `MustChangePassword` (bool, default true) em `User.cs`
- [ ] Criar enum `UserPlan` (SuperAdmin, Basic, Pro, Enterprise)
- [ ] Adicionar campo `Plan` (UserPlan, default Basic) em `User.cs`
- [ ] Migration `AddUserPlanAndMustChangePassword`
- [ ] Atualizar password policy em `Program.cs` (6+ chars, upper, lower, digit, special)
- [ ] Adicionar `MustChangePassword` + `Plan` nos DTOs (`LoginResponse`, `UserInfo`, `AuthUserResponse`)
- [ ] Criar endpoint `POST /api/auth/change-password` (currentPassword, newPassword)
- [ ] No login, retornar `mustChangePassword` para front-end redirecionar
- [ ] Opcional: middleware/filtro que bloqueia rotas se `MustChangePassword == true`
- [ ] `TenantContextMiddleware`: se Plan == SuperAdmin, não filtrar por Company
- [ ] Repositórios: pular filtro `Company` se SuperAdmin
- [ ] `DataSeeder`: setar `Plan = SuperAdmin`, `MustChangePassword = true` nos 4 usuários seed

## Front-end
- [ ] Atualizar `UserInfo` em `src/types/api.ts` com `mustChangePassword` + `plan`
- [ ] `auth-store.ts`: guardar `mustChangePassword`, redirecionar p/ `/trocar-senha` se true
- [ ] Criar página `/trocar-senha` com formulário e validação client-side
- [ ] `api.ts`: garantir que `change-password` funcione com token atual (não requer refresh)
- [ ] Badge "Super Admin" no sidebar/header pra usuários SuperAdmin
- [ ] Seletor de empresa no topo para SuperAdmin navegar entre dados de qualquer company
