# Guia de Deploy — Lucraí em Produção

## Arquitetura Final

```
Usuário → https://lucrai-site.vercel.app (Next.js)
                    ↕ HTTPS / JSON
         https://lucrai-api.onrender.com (ASP.NET Core 10 — Render Docker)
                    ↕ Npgsql
         PostgreSQL (Neon — 2 DBs: lucrai + quintoset)
```

> **Histórico:** Railway (`lucrai-api.up.railway.app`) descontinuado por créditos — migrado para **Render** via `render.yaml`.
> Quinto Set: `https://quintoset.vercel.app` (web) → `https://quinto-set-api.onrender.com` (Express + Drizzle, ver `docs/quinto-set-render.md`)

---

## Passo 1: Banco de Dados (PostgreSQL)

### Opção A — Plugin PostgreSQL do Railway (mais simples)

1. No dashboard do Railway, dentro do projeto, clicar em **New → Database → Add PostgreSQL**
2. Aguardar provisionar
3. Copiar a `connection string` na seção **Connect**

### Opção B — Neon (recomendado se quiser banco separado)

1. Criar conta em [neon.tech](https://neon.tech)
2. Criar um projeto, região próxima (São Paulo ou US)
3. Copiar a connection string da branch `main`

### Criar o banco

Conectar no PostgreSQL e executar (ou apenas rodar a API que ela faz as migrations automáticas):

```sql
CREATE DATABASE lucrai;
```

---

## Passo 2: Deploy da API no Render (recomendado)

### 2.1 Criar serviço

1. Acessar [render.com](https://render.com) → **New → Web Service** → conectar `fggresuniaosepetiba/lucrai_site`
2. Render detecta `render.yaml` automaticamente (ou configure manual):
   - **Root Directory:** `backend`
   - **Dockerfile:** `src/Lucrai.API/Dockerfile`
   - **Plan:** `Starter` (~7 USD, sem sleep — Free dorme e quebra DB)
   - **Health Check:** `/api/health`

### 2.2 Configurar variáveis de ambiente

No Render, **Environment** → adicionar (ou `render.yaml` → `sync: false` → setar no dashboard):

| Variável | Valor | Observação |
|---|---|---|
| `ASPNETCORE_URLS` | `http://+:${PORT}` | Já configurado no Dockerfile com fallback |
| `ConnectionStrings__Default` | (connection string do PostgreSQL) | Substituir senha e host |
| `Jwt__Key` | (senha forte, mínimo 32 caracteres) | Gerar com: `openssl rand -base64 32` |
| `Jwt__Issuer` | `lucrai-api` | |
| `Jwt__Audience` | `lucrai-frontend` | |
| `Cors__Origins` | `https://lucrai-site.vercel.app` | |

**Atenção**: Se usar Neon, a connection string tem `sslmode=require`. Exemplo:
```
Host=ep-xxxx.us-east-2.aws.neon.tech;Port=5432;Database=lucrai;Username=lucrai_owner;Password=xxx;SslMode=Require
```

### 2.3 Deploy

- **IaC:** push com `render.yaml` já dispara deploy; ou **Manual Deploy → Deploy latest commit**
- Acompanhar em **Logs**; auto-deploy a cada push em `main`

### 2.4 Obter URL da API

- Render gera `https://lucrai-api.onrender.com` (ou custom domain)
- **Copiar** — vai usar no Passo 3

---

## Passo 3: Configurar Frontend na Vercel

O frontend já está em produção em `https://lucrai-site.vercel.app`.

### 3.1 Adicionar variável de ambiente de produção

1. Acessar [vercel.com](https://vercel.com)
2. Ir em **Projects → lucrai-site → Settings → Environment Variables**
3. Adicionar:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://lucrai-api.onrender.com` (URL do Passo 2.4)
   - **Environments**: Production, Preview, Development
4. Salvar

### 3.2 Redeploy

Ir em **Deployments**, clicar nos três pontos do último deploy e selecionar **Redeploy** (ou fazer um novo push no `main`).

> Quinto Set: ver `docs/quinto-set-render.md` — `NEXT_PUBLIC_API_URL=https://quinto-set-api.onrender.com`

---

## Passo 4: Verificar

Após o deploy:

1. **API**: Acessar `https://lucrai-api.onrender.com/api/health` (200) ou `/api/auth/me` (401 = no ar)
2. **Frontend**: Acessar `https://lucrai-site.vercel.app` e tentar login
3. **Logs Render**: confirmar `Applied migrations` / `Now listening on`

### Testes de smoke

```bash
curl -s -o /dev/null -w "%{http_code}" https://lucrai-api.onrender.com/api/health
# 200

curl -s -X POST https://lucrai-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lucrai.com","password":"sua-senha"}'
```

---

## Manutenção

### Atualizar API

Push no `main` — Render auto-deploy (via `render.yaml`) e Vercel auto-deploy.

### Logs

- **API LUCRAÍ**: Render → `lucrai-api` → Logs
- **API Quinto Set**: Render → `quinto-set-api` → Logs (`docs/quinto-set-render.md`)
- **Frontend**: Vercel → Deployments → Logs

### Variáveis de ambiente

- **APIs**: Render → Environment
- **Frontends**: Vercel → Settings → Environment Variables

---

## Rollback

### Render

- **Manual Deploy → Deploy latest commit** ou rollback para deploy anterior no dashboard

### Vercel

- **Deployments → Promote to Production**

### Custo estimado (2 APIs + Neon)

- `lucrai-api` Starter 7 USD + `quinto-set-api` Starter 7 USD + Neon free/5 USD = **14–19 USD/mês** (2 serviços Free estouram 750h e dormem)

