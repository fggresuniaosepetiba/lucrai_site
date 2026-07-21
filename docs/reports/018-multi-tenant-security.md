# Sprint 18 — Segurança Multi-Tenant + Bug de Configurações

## Contexto

Correção de vulnerabilidades de isolamento entre tenants (cross-tenant data leak) e bug de salvamento das configurações, reportados por PO/QA.

## Descobertas (da auditoria)

### Settings Bug
- `SettingsController.Update()` retornava 404 quando não existia registro de `CompanySettings` — mas o frontend só chama `PUT`, nunca `POST`. `UpdateAsync` já tratava upsert, mas o controller abortava antes.
- `LogoUrl.HasMaxLength(500)` no DbContext conflitava com `MaximumLength(2048)` no FluentValidation — imagens reais em base64 excedem 500 chars.
- `handleSave()` no frontend sempre chamava `SignatureRepositoryApi.save()` mesmo sem usuário preencher assinatura — campos vazios causavam 400.

### Cross-Tenant (5 CRITICAL, 6 HIGH)
- Nenhum `HasQueryFilter` no DbContext — zero isolamento automático
- 20+ métodos `FindAsync(id)` sem filtro de empresa em 14 repositórios
- `UsersController` expunha todos os usuários sem filtro de empresa
- `AuditController.GetByEntity` sem filtro de empresa
- `UserRepository` sem qualquer filtro de empresa
- 12 `DeleteAsync(Guid id)` sem verificação de tenant
- 12 `UpdateAsync` sem re-verificação de tenant

## Mudanças Realizadas

### Settings Bug
1. **SettingsController.cs** — `PUT` agora cria um novo `CompanySettings` object e chama `UpdateAsync` diretamente (que faz upsert), em vez de buscar existente e retornar 404
2. **LucraiDbContext.cs** — `LogoUrl.HasMaxLength(500)` → `HasMaxLength(2048)`
3. **settings/page.tsx** — `handleSave` só chama `SignatureRepositoryApi.save()` se `nomeResponsavel` e `cargo` não estiverem vazios

### Isolamento Multi-Tenant (Arquitetural)

4. **ITenantContext.cs** (novo) — Interface + implementação `TenantContext` no Core, serviço scoped com Company, UserName, UserId, Plan
5. **TenantContextMiddleware.cs** — Agora também seta `ITenantContext` com dados do JWT (além de `HttpContext.Items`)
6. **LucraiDbContext.cs** — Injeta `ITenantContext` e aplica `HasQueryFilter` em todas as 23 entidades com campo `Company`. O filtro é aplicado em tempo de query (não em tempo de construção do modelo), respeitando o tenant da requisição atual
7. **Program.cs** — Registra `ITenantContext` como scoped

### Correções Específicas por Repositório

8. **IUserRepository + UserRepository** — Todos os métodos agora exigem parâmetro `company`; `FindAsync` substituído por `FirstOrDefaultAsync` com filtro
9. **UsersController.cs** — Adicionada propriedade `Company`; todos os endpoints passam empresa
10. **IAuditRepository + AuditRepository** — `GetByEntityAsync` agora aceita `company` e filtra
11. **AuditController.cs** — Passa `Company` para `GetByEntityAsync`
12. **14 repositórios** — Todos os `FindAsync(id)` substituídos por `FirstOrDefaultAsync(e => e.Id == id)` (combinado com HasQueryFilter para isolamento completo)

## Impacto

- Build: 0 erros
- Testes: 83/83 passando
- Frontend TypeScript: 0 erros
- 24 arquivos modificados, 149 inserções, 66 deleções

## Riscos

- `CompanyRegistration` não tem campo `Company` — a rota `GET /api/contas` (admin) continua retornando todos os registros. Se houver necessidade de isolamento, adicionar campo `Company` à entidade.
- `RefreshToken` não tem campo `Company` — não se aplica (token é vinculado ao UserId)
- HasQueryFilter não se aplica a `FindAsync` por design do EF Core — substituímos todos por `FirstOrDefaultAsync`, mas qualquer novo `FindAsync` no futuro estará desprotegido
