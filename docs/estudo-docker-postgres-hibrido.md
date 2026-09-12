# Estudo — Docker + PostgreSQL Híbrido (Lucraí)

> Roadmap prático do que aprender, na ordem, usando o próprio repo como lab. Híbrido = **Docker local (compose) + PostgreSQL gerenciado (Neon) + Render (API Docker) + Vercel (FE)**

---

## 0. Mapa do híbrido no repo (o que já existe)

- **Local dev:** `docker-compose.yml:1-60` → `postgres:16-alpine (lucrai-db 5433:5432, pgdata, health pg_isready)` + `api (lucrai-api 5000→8080, depends_on healthy, health curl /api/health)` + `web (lucrai-web 3000, NEXT_PUBLIC_API_URL)` — `profiles: [full]` e `scripts/wait-for-db.ts`, `scripts/ensure-docker.ts (LUCRAI_DOCKER_MODE check/auto/skip)`
- **Backend prod:** `backend/src/Lucrai.API/Dockerfile:1-19` `sdk:10 → aspnet:10 (+curl/libgssapi)` `EXPOSE 8080` `ASPNETCORE_URLS http://+:${PORT:-8080}` → `Render` `https://lucrai-site.onrender.com` (`render.yaml`, `DOTNET_USE_POLLING_FILE_WATCHER=true` no Free) + `appsettings.Production.json:4` `Host=ep-proud-base-aci4mfda.sa-east-1.aws.neon.tech`
- **Frontend prod:** `frontend.Dockerfile:2-29` `node:22-alpine@sha256:… deps→builder→runner non-root nextjs:1001 HEALTHCHECK wget` **só local/CI** (Vercel builda direto `https://lucrai-site.vercel.app`)
- **CI:** `.github/workflows/ci.yml:59-82` `docker: Validate Images` (`build-push-action@v6` `push:false`, `setup-buildx@v3`) após `backend build/test` + `frontend lint/build`

---

## 1. Trilha do que estudar (7 níveis, na ordem)

### Nível 1 — Fundamentos (1-2 dias)
- Imagem vs container vs volume vs network vs registry; `docker ps/logs/exec`, `docker build/run`
- `Dockerfile` layers + cache (por que `COPY csproj` antes de `COPY .` no `Dockerfile:4-7` acelera?)
- Lab: `docker pull postgres:16-alpine && docker run -p 5433:5432 -e POSTGRES_PASSWORD=xxx postgres:16-alpine`

### Nível 2 — Compose local (2-3 dias)
- `docker-compose.yml` `services/ports/volumes/healthcheck/depends_on/restart/profiles`
- `pgdata` persistência, `5433:5432` (host vs container), `service_healthy`
- Lab: `docker compose up postgres` vs `docker compose --profile full up --build` → `curl http://localhost:5000/api/health` + `http://localhost:3000`

### Nível 3 — Backend Docker (.NET) (2-3 dias)
- Multi-stage `sdk → publish -c Release -o /app/publish → aspnet runtime`; por que `apt-get curl` para `healthcheck`?
- `PORT` dinâmico Render (`${PORT:-8080}` `Dockerfile:17`), `DOTNET_USE_POLLING_FILE_WATCHER`
- Lab: `docker build -f backend/src/Lucrai.API/Dockerfile backend -t lucrai-api:local && docker run -p 5000:8080 -e ConnectionStrings__Default=... lucrai-api:local`

### Nível 4 — Frontend Docker (Next standalone) (2 dias)
- `output: "standalone"` (`next.config.js`) + `deps → builder (ARG NEXT_PUBLIC_API_URL) → runner` + `digest pin` + `non-root nextjs` + `HEALTHCHECK wget`
- Por que `ARG` vs `ENV` no build? Como `standalone` reduz imagem?
- Lab: `docker build -f frontend.Dockerfile . -t lucrai-web:local --build-arg NEXT_PUBLIC_API_URL=http://localhost:5000`

### Nível 5 — Postgres híbrido (3-4 dias)
- Local `postgres:16-alpine` vs Neon gerenciado (`sslmode=require`, `Host ep-proud…`, `Database neondb`, pools, `psql` + `EF Core MigrateAsync()`)
- `LucraiDbContext.cs:applyTenantFilters` + `DataSeeder.cs:15` `MigrateAsync()` vs `EnsureCreatedAsync()`, `ConnectionStrings__Default` switch `appsettings.*.json`
- Lab: `psql "Host=ep-…;SslMode=Require"` → `SELECT DISTINCT Company` (Lucraí / Grão Natural / Trinary) vs `docker exec lucrai-db psql -U lucrai`

### Nível 6 — CI híbrido (2 dias)
- `ci.yml` `needs: [backend,frontend]` → `setup-buildx` → `build-push-action` `context/file/push:false`; adicionar `cache gha` + `ghcr.io` push
- Por que `push:false` hoje (só valida) vs `Render` que builda sozinho?
- Lab: forkar CI local `act` ou `docker buildx build --cache-from type=gha --cache-to type=gha`

### Nível 7 — Deploy híbrido + observabilidade (2-3 dias)
- `Render` `render.yaml` `Root Directory: backend` + `Vercel` env `NEXT_PUBLIC_API_URL` + `Neon` connection string; cold start Free (15min sleep) vs Starter $7
- `/api/health` probe, `logs` Render/Vercel, rollback `Manual Deploy / Promote`
- Lab: push `main` → ver `Render Logs: Applied migrations / Now listening on` + `Vercel Deployments`

---

## 2. Checklist prático (marque ao fazer)

- [ ] `docker compose up postgres` → `pg_isready`
- [ ] `docker compose --profile full up --build` → `api 5000` + `web 3000`
- [ ] `docker build` backend/frontend isolados
- [ ] Conectar `psql` local e Neon + `SELECT` tenants + `EF migrations`
- [ ] Quebrar propositalmente `HEALTHCHECK` e ver `unhealthy`
- [ ] Trocar `NEXT_PUBLIC_API_URL` no build e ver FE apontar para Neon local
- [ ] Adicionar `cache` no `ci.yml` localmente

## 3. Referências no repo

- `docker-compose.yml`, `backend/src/Lucrai.API/Dockerfile`, `frontend.Dockerfile`, `.github/workflows/ci.yml`, `docs/deploy-guide.md`, `docs/fix-isolamento-usuario.md`, `scripts/ensure-docker.ts`
