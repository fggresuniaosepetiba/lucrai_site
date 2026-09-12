# 031 — Zeramento MustChangePassword lucrai.adm + joão.ribeiro

## Data: 2026-09-07 20:46 UTC
## Commit: d5cd8a4

### Estado antes
- DB `neondb` `ep-proud-base-aci4mfda`: 8 users (`Lucraí 6` + `Grão Natural` + `Trinary`), `Quinto Set 0` — `lucrai.adm 7671c516 false @Lucrai2026`, `joao bb112dcd false`, `fellype false`, `eduardo/vitoria/laura true 123`
- `POST /api/auth/login 123` → `lucrai/joao 401`, `eduardo 200 true`

### Ação (Opção A, Npgsql)
- `PasswordHasher<IdentityUser>.HashPassword(dummy, "123")` (84 chars) + `SecurityStamp=guid` + `ConcurrencyStamp=guid` + `MustChangePassword=true` + `DELETE RefreshTokens (13/2)` em `AspNetUsers` Neon — `ZeroPass/Program.cs` temp
- `DataSeeder.cs:118-122` só reativa `MustChangePassword` quando hash é `123` (já corrigido, não reseta pós-reboot)

### Teste pós
- `lucrai.adm/123 200 {mustChangePassword:true}`, `joao/123 200 true`, `@Lucrai2026 401`
- `POST /api/auth/change-password 123→Teste@123 200` + `Teste@123 200 {false}`; `Teste@123→123` via API `400 6 chars` → re-zerado via SQL para manter `123`
- `docs/fix-isolamento-usuario.md:200` + `docs/backend-todo.md:68` atualizados

### Endpoint troca
`AuthController.cs:62 change-password [Authorize] Challenge: ChangePasswordAsync + MustChangePassword=false`; login já retorna flag `AuthController.cs:57` para redirect `src/app/trocar-senha`
