# Guia de Deploy — Lucraí em Produção

## Arquitetura Final

```
Usuário → https://lucrai-site.vercel.app (Next.js)
                    ↕ HTTPS / JSON
         https://lucrai-api.up.railway.app (ASP.NET Core 10)
                    ↕ Npgsql
         PostgreSQL (Neon ou Railway Plugin)
```

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

## Passo 2: Deploy da API no Railway

### 2.1 Criar conta

1. Acessar [railway.com](https://railway.com) e criar conta (GitHub)
2. Clique em **New Project**

### 2.2 Conectar repositório

1. **Deploy from GitHub repo**
2. Selecionar `fggresuniaosepetiba/lucrai_site`
3. Configurar:
   - **Root Directory**: `backend`
   - O Railway detecta automaticamente o `railway.json` que aponta para o Dockerfile

### 2.3 Configurar variáveis de ambiente

No Railway, ir em **Variables** e adicionar:

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

### 2.4 Fazer deploy

- O Railway faz **auto-deploy** automaticamente a cada push no `main`
- Para deploy manual: botão **Deploy** no dashboard
- Acompanhar logs em **Deployments**

### 2.5 Obter URL da API

- Ir em **Settings → Networking → Generate Domain**
- A URL será algo como: `https://lucrai-api.up.railway.app`
- **Copiar essa URL** — vai usar no Passo 3

---

## Passo 3: Configurar Frontend na Vercel

O frontend já está em produção em `https://lucrai-site.vercel.app`.

### 3.1 Adicionar variável de ambiente de produção

1. Acessar [vercel.com](https://vercel.com)
2. Ir em **Projects → lucrai-site → Settings → Environment Variables**
3. Adicionar:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://lucrai-api.up.railway.app` (a URL do Passo 2.5)
   - **Environments**: Production, Preview, Development
4. Salvar

### 3.2 Redeploy

Ir em **Deployments**, clicar nos três pontos do último deploy e selecionar **Redeploy** (ou fazer um novo push no `main`).

---

## Passo 4: Verificar

Após o deploy:

1. **API**: Acessar `https://lucrai-api.up.railway.app/api/auth/me` (deve retornar 401 — significa que está no ar)
2. **Frontend**: Acessar `https://lucrai-site.vercel.app` e tentar fazer login
3. **Verificar no Railway**: Abrir os logs do deploy para confirmar que as migrations rodaram

### Testes de smoke

```bash
# Health check da API
curl -s -o /dev/null -w "%{http_code}" https://lucrai-api.up.railway.app/api/auth/me
# Deve retornar 401 (não autorizado — mas API está viva)

# Login real
curl -s -X POST https://lucrai-api.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lucrai.com","password":"sua-senha"}'
```

---

## Manutenção

### Atualizar API

Basta fazer push no `main` — Railway faz auto-deploy.

### Atualizar Frontend

Basta fazer push no `main` — Vercel faz auto-deploy.

### Logs

- **API**: Dashboard do Railway → Deployments → clicar no deploy → Logs
- **Frontend**: Dashboard da Vercel → Deployments → clicar no deploy → Logs

### Variáveis de ambiente

- **API**: Railway → Variables
- **Frontend**: Vercel → Settings → Environment Variables

---

## Rollback

### Railway

- Ir em **Deployments**, clicar nos três pontos do deploy anterior, **Redeploy**

### Vercel

- Ir em **Deployments**, clicar nos três pontos do deploy anterior, **Promote to Production**
