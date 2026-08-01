# Guia de Desenvolvimento Local — Lucraí

## Quick Start

```bash
# Pré-requisitos: Docker Desktop, Node.js 22+, .NET SDK 10

# 1. Configurar senha do PostgreSQL (primeira vez apenas)
cp .env.example .env
# Editar .env com sua senha

# 2. Tudo em um comando:
npm run dev:all
```

Isso inicia PostgreSQL (Docker), aguarda o banco ficar pronto, sobe a API com `dotnet watch` e o frontend com `next dev` — tudo em paralelo.

---

## Comandos Disponíveis

| Comando | O que faz |
|---|---|
| `npm run dev` | Frontend apenas (Next.js em `localhost:3000`) |
| `npm run dev:db` | Sobe PostgreSQL via Docker |
| `npm run dev:api` | API apenas (`dotnet watch` em `localhost:5000`) |
| `npm run dev:wait-db` | Aguarda PostgreSQL ficar pronto |
| **`npm run dev:all`** | PostgreSQL + API + Frontend (uso diário) |
| `npm run dev:full` | Stack completa em container (Postgres + API + Frontend) |
| `npm run dev:stop` | Para o container PostgreSQL |
| `npm run dev:reset-db` | Reseta o banco (apaga volumes, recria e aguarda ficar pronto) |

---

## Scripts Avançados

### Windows (CLI-only, não abre Docker Desktop)

```powershell
.\scripts\dev.ps1
```

Verifica se o daemon Docker está rodando via CLI; se não estiver, exibe erro e sai **sem abrir o Docker Desktop**. Depois executa `npm run dev:all`.

```powershell
.\scripts\dev.ps1 -Full    # usa docker compose --profile full
```

### Linux / macOS / WSL

```bash
./scripts/dev.sh
./scripts/dev.sh full      # perfil full
```

---

## Deploy da API via Railway CLI

```bash
# Redeploy do último deploy (projeto sincere-creation / serviço lucrai_site):
.\scripts\deploy-railway.ps1          # Windows
./scripts/deploy-railway.sh           # Linux/macOS

# Enviar o código atual (railway up):
.\scripts\deploy-railway.ps1 up
```

---

## Arquitetura do Setup

```
npm run dev:all
    │
    ├─ docker compose up postgres -d
    ├─ node scripts/wait-for-db.js   ← aguarda pg_isready
    └─ concurrently
         ├─ dotnet watch run          (localhost:5000)
         └─ next dev                  (localhost:3000)
```

### Health Check

A API expõe `GET /api/health` que retorna:

```json
{ "status": "healthy", "database": "connected", "timestamp": "..." }
```

Usado pelo healthcheck do Docker Compose e para debug.

---

## Docker Compose Profiles

```bash
docker compose up                   # só PostgreSQL (padrão)
docker compose --profile full up    # PostgreSQL + API + Frontend em container
```

O profile `full` sobe a API e o Frontend dentro do Docker (útil para testar o comportamento em container). No dia a dia, prefira `npm run dev:all` que roda a API nativamente com hot reload.

---

## Troubleshooting

### Docker não está rodando
```bash
# Os scripts NÃO abrem o Docker Desktop automaticamente:
# Windows: Abrir Docker Desktop manualmente
# Linux:   sudo systemctl start docker
# macOS:   open -a Docker
# Depois rode: .\scripts\dev.ps1  (ou npm run dev:all)
```

### Porta 5433 ocupada
Editar `.env`:
```env
POSTGRES_PORT=5434
```

E atualizar `ConnectionStrings__Default` no `appsettings.json` ou na variável de ambiente.

### Porta 5000 ocupada
```bash
dotnet run --project backend/src/Lucrai.API --urls=http://localhost:5001
```

### Resetar banco de dados
```bash
npm run dev:reset-db    # apaga tudo, recria com seed automático e aguarda o banco ficar pronto
```

> A API roda migrations + seed no startup. Depois de resetar, reinicie a API (`npm run dev:all`) para recriar usuários e categorias padrão.

### Docker Desktop não inicia / daemon parado
```bash
# Os scripts NÃO abrem o Docker Desktop. Inicie o Docker manualmente e rode de novo:
# Windows: Docker Desktop
# Linux:   sudo systemctl start docker
# macOS:   open -a Docker
```

### Erro "dotnet não encontrado"
Instalar .NET SDK 10: https://dotnet.microsoft.com/download/dotnet/10.0

---

## Credenciais de Desenvolvimento

O `DataSeeder` roda automático no startup da API e cria usuários com senha `123`:

| Usuário | Papel |
|---|---|
| lucrai.adm | Owner |
| joao.ribeiro | Owner |
| vitoria.justo | Admin |
| fellype.gabriel | Owner |
| eduardo.contador | Admin |
| laura.peixoto | Admin |
