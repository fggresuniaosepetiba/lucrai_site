# Quinto Set — Deploy no Render (API Express + Drizzle + Postgres)

> Monorepo `quinto-set`: web `Next.js 16` na Vercel + API `Express 5` no Render + Postgres no Neon (mesma conta do LUCRAÍ, DB separado).

## Por que Render
- Express precisa de processo long-running (Vercel serverless não é ideal para `Drizzle/pino/tsyringe`)
- Custo: **+7 USD/mês** (Starter). Mantendo Neon: total LUCRAÍ (7) + Quinto (7) = **14 USD**

## Render — New Web Service
1. Dashboard Render → **New → Web Service** → conectar `fggresuniaosepetiba/quinto-set` (ou onde estiver o repo)
2. Config:
   - **Name:** `quinto-set-api`
   - **Root Directory:** `apps/api` (ou `api`/`backend` — onde está o `package.json` da API)
   - **Runtime:** `Node`
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `npm start` (deve rodar `node dist/index.js` e respeitar `PORT`)
   - **Region:** `Oregon` (mesma do LUCRAÍ para latência) ou `Frankfurt`
   - **Plan:** `Starter` (512MB, sem sleep — Free dorme em 15min e quebra Drizzle)
   - **Health Check:** `/health` ou `/api/health`
   - **Auto Deploy:** `Yes` (branch `main`)

## Env Vars (Render → Environment)
| Variável | Valor | Onde pegar |
|---|---|---|
| `DATABASE_URL` | `postgres://user:pass@ep-xxx.neon.tech/quintoset?sslmode=require` | Neon → novo DB `quintoset` (separado de `lucrai`) |
| `PORT` | auto (Render injeta) | — |
| `CORS_ORIGIN` | `https://quintoset.vercel.app` | — |
| `NODE_ENV` | `production` | — |

> Use **Neon com 2 DBs** (`lucrai` e `quintoset`) na mesma conta — economiza os 7 USD do Render Postgres e mantém `sslmode=require`.

## Drizzle
```bash
# local, 1ª vez (aponta para Neon quintoset)
npx drizzle-kit push
# ou no Render Build Command, se preferir:
# npm ci && npm run build && npx drizzle-kit push
```

## Vercel (web)
Vercel → Project `quinto-set` → **Settings → Environment Variables**:
- `NEXT_PUBLIC_API_URL` = `https://quinto-set-api.onrender.com` → **Redeploy**

## Smoke
```bash
curl https://quinto-set-api.onrender.com/health
# 200
curl https://quinto-set-api.onrender.com/api/contato # ou rota real
```

## Custo 30d
- LUCRAÍ API (Docker Starter) 7 USD + Quinto API (Node Starter) 7 USD + Neon (free/5 USD) = **14–19 USD**
- Free em ambos estoura 750h e dá cold start — não recomendado para DB persistente.
