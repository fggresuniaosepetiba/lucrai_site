# 029 — Migração Railway → Render + Neon híbrido

## Data: 2026-09-07
## Commits: 9dc1302, 70b1396

### Problema
Railway descontinuado (créditos) — backend `.NET 10` precisava de host Docker Free com `PORT` dinâmico + Postgres gerenciado fora do container.

### Solução
- `backend/src/Lucrai.API/Dockerfile:17` `ASPNETCORE_URLS http://+:${PORT:-8080}` + `DOTNET_USE_POLLING_FILE_WATCHER=true` (Render Free inotify)
- `render.yaml` `Root Directory: backend` `src/Lucrai.API/Dockerfile` + `Health Check /api/health` → `https://lucrai-site.onrender.com`
- `appsettings.Production.json:4` Neon `Host=ep-proud-base-aci4mfda.sa-east-1.aws.neon.tech` `SslMode=Require` + `Vercel` `NEXT_PUBLIC_API_URL=https://lucrai-site.onrender.com`
- Híbrido: `docker-compose.yml` `postgres:16-alpine` local (`5433:5432 pgdata`) vs Neon prod; `docs/deploy-guide.md:6-11`

### Evidência
- `docs/deploy-guide.md`, `render.yaml`, `lucrai-site.onrender.com/api/health 200`, `lucrai-site.vercel.app` login 200
