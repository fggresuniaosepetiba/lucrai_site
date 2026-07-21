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
| `npm run dev:full` | API em container + Frontend nativo |
| `npm run dev:stop` | Para o container PostgreSQL |
| `npm run dev:reset-db` | Reseta o banco (apaga volumes e recria) |

---

## Scripts Avançados

### Windows (auto-start Docker Desktop)

```powershell
.\scripts\dev.ps1
```

Detecta se Docker Desktop está rodando; se não, inicia e aguarda. Depois executa `npm run dev:all`.

```powershell
.\scripts\dev.ps1 -Full    # usa docker compose --profile full
```

### Linux / macOS / WSL

```bash
./scripts/dev.sh
./scripts/dev.sh full      # perfil full
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
docker compose --profile full up    # PostgreSQL + API em container
```

O profile `full` sobe a API dentro do Docker (útil para testar o comportamento em container). No dia a dia, prefira `npm run dev:all` que roda a API nativamente com hot reload.

---

## Troubleshooting

### Docker não está rodando
```bash
# Windows: Abrir Docker Desktop manualmente ou usar:
.\scripts\dev.ps1   # inicia automaticamente

# Linux: sudo systemctl start docker
# macOS: open -a Docker
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
npm run dev:reset-db    # apaga tudo e recria com seed automático
```

### Erro "dotnet não encontrado"
Instalar .NET SDK 10: https://dotnet.microsoft.com/download/dotnet/10.0

---

## Credenciais de Desenvolvimento

O `DataSeeder` roda automático no startup da API e cria usuários com senha `123`:

| Usuário | Papel |
|---|---|
| lucrai.adm | Admin |
| joao.ribeiro | Owner |
| vitoria.justo | Admin |
| fellype.gabriel | Admin |
| eduardo.contador | Admin |
| laura.peixoto | Admin |
