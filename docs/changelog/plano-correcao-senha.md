# Plano de Correção: Forçar Troca de Senha + Hash no Banco

## Problemas Identificados

### 1. MustChangePassword reseta a toda reinicialização

**Arquivo:** `backend/src/Lucrai.Infrastructure/Seed/DataSeeder.cs:95`

**Causa:** Na branch `else` (usuário já existe), `existing.MustChangePassword = true;` reseta a flag. O seed roda em toda inicialização em `Program.cs:110`.

**Efeito:** Usuário troca a senha (flag vai pra `false`), mas na próxima vez que o backend reiniciar (deploy, idle, crash), a flag volta pra `true` — forcing a trocar senha de novo, inclusive em outros navegadores.

**Correção:** Remover `existing.MustChangePassword = true;` da branch `else`. O seed deve criar novos usuários com `MustChangePassword = true` (via valor padrão da entidade ou no `if` de criação), mas **nunca** resetar a flag de quem já trocou.

---

### 2. Senha em texto puro na tabela `CompanyRegistrations` (Neon)

**Arquivos:**
- `backend/src/Lucrai.Core/Entities/CompanyRegistration.cs:11` — campo `Senha`
- `backend/src/Lucrai.API/Controllers/ContasController.cs:60` — `Senha = request.Senha`
- `backend/src/Lucrai.Infrastructure/Data/LucraiDbContext.cs:190` — config do campo

**Causa:** Ao criar uma conta (`POST /api/contas`), a senha é salva **em texto puro** na coluna `Senha` da tabela `CompanyRegistrations` no PostgreSQL (Neon em produção). O `AspNetUsers.PasswordHash` (gerenciado pelo Identity) está correto — usa hash. Mas a tabela auxiliar expõe a senha.

**Correção:** Remover o campo `Senha` da entidade `CompanyRegistration` — a senha já está hasheada em `AspNetUsers.PasswordHash`, não há necessidade de duplicá-la em texto puro.

---

### 3. Senha em texto puro no seed Dexie (IndexedDB)

**Arquivo:** `src/database/seed.ts:31,38,45,52`

**Causa:** `password: "123"` armazenado em texto puro no IndexedDB do navegador.

**Correção:** Remover campo `password` dos objetos de seed e do tipo `AppUser`.

---

### 4. `.gitignore`

Adicionar `docs/changelog/seed-credentials.md` para não versionar credenciais.

---

## Ordem de Execução

1. Editar `DataSeeder.cs` — remover `existing.MustChangePassword = true;` (linha 95)
2. Editar `CompanyRegistration.cs` — remover propriedade `Senha`
3. Editar `ContasController.cs` — remover `Senha = request.Senha;` (linha 60)
4. Editar `LucraiDbContext.cs` — remover `.Property(r => r.Senha).HasMaxLength(500).IsRequired();`
5. Executar migration: `dotnet ef migrations add RemoveSenhaFromCompanyRegistrations`
6. Editar `src/database/seed.ts` — remover `password` de todos os usuários
7. Editar `src/types/index.ts` — remover `password: string` de `AppUser`
8. Editar `.gitignore` — adicionar `docs/changelog/seed-credentials.md`
9. Rodar testes E2E e unitários
10. Commit
