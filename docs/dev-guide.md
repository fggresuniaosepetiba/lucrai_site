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

Os wrappers `dev.ps1`/`dev.sh` apenas delegam aos comandos npm. Quem controla o Docker é o **guard** `scripts/ensure-docker.ts` (ver [seção Docker guard](#docker-guard)).

```powershell
.\scripts\dev.ps1          # roda npm run dev:all
.\scripts\dev.ps1 -Full    # usa docker compose --profile full
```

```bash
./scripts/dev.sh           # Linux/macOS
./scripts/dev.sh full      # perfil full
```

---

## Docker guard

Antes de qualquer comando que precise de Docker (`dev:all`, `dev:db`, `dev:full`, `dev:reset-db`), o script `scripts/ensure-docker.ts` roda como **guardião** via `npm run dev:check-docker`.

Ele executa `docker info`:

| Estado do daemon | Comportamento |
|---|---|
| Rodando | Segue em frente (exit 0) |
| Parado (modo padrão) | **Não inicia nada** — exibe orientação por SO e sai (exit 1) |
| Parado (modo `auto`) | Inicia o Docker em 2º plano e aguarda ficar pronto |

### Modos de execução (via variável de ambiente)

O comportamento é controlado por `LUCRAI_DOCKER_MODE`:

| Valor | Default? | Efeito |
|---|---|---|
| `check` | ✅ Sim | Só verifica e orienta a iniciar manualmente — nunca mexe no ambiente do dev |
| `auto` | Não | Se o daemon estiver parado, inicia em 2º plano (headless) e espera |
| `skip` | Não | Pula a verificação (igual a `LUCRAI_SKIP_DOCKER_CHECK=1`) |

Exemplos:
```bash
# Orientar manualmente (comportamento padrão)
npm run dev:all

# Iniciar Docker em 2º plano automaticamente (ex.: seu ambiente local)
LUCRAI_DOCKER_MODE=auto npm run dev:all
```

Dica: para ativar o `auto` sem digitar toda vez, adicione `LUCRAI_DOCKER_MODE=auto` ao seu `.env` local (não é versionado).

### Como o start "auto" funciona por SO

| SO | Estratégia | Janela GUI? |
|---|---|---|
| Windows | `com.docker.backend.exe -unattended -with-frontend=false` (fallback: `Docker Desktop.exe -Autostart`) | Não abre |
| macOS | `com.docker.backend -unattended -with-frontend=false` (fallback: `open -a Docker`) | Não abre (1º caminho) |
| Linux | `sudo systemctl start docker` / `sudo service docker start` | Headless por natureza |

O comando de start não trava o terminal: o guard entra em **polling** de `docker info` até o daemon responder (timeout padrão de 120s, configurável via `DOCKER_WAIT_TIMEOUT`).

---

## Containers na prática

No fluxo normal, o `npm run dev:all`/`dev:full` já cria os containers automaticamente via `docker compose` — **não é preciso criar na mão**. Esta seção é para inspecionar/executar de forma manual quando necessário.

### Via Docker Compose (recomendado)

```bash
docker compose up postgres -d        # só o banco (padrão do dev:all)
docker compose --profile full up -d  # banco + API + frontend em container
docker compose ps                    # lista os containers (lucrai-db, lucrai-api, lucrai-web)
docker compose logs -f postgres      # logs ao vivo de um serviço
docker compose down                  # para tudo
docker compose down -v               # para e apaga o volume (reset completo)
```

### Via `docker run` (container avulso)

```bash
docker run -d --name lucrai-db \
  -p 5433:5432 \
  -e POSTGRES_DB=lucrai -e POSTGRES_USER=lucrai -e POSTGRES_PASSWORD=sua-senha \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16-alpine
```

### Manutenção manual (independente de como criou)

```bash
docker ps                  # containers em execução
docker ps -a               # todos (incl. parados)
docker stop <container>    # parar
docker start <container>   # iniciar um já existente
docker rm <container>      # remover
docker exec -it lucrai-db psql -U lucrai -d lucrai   # shell/psql no banco
```

> O usuário de banco no container é `lucrai` (isolado do PostgreSQL nativo). Não é preciso usar o usuário `postgres` do sistema.

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
    ├─ tsx scripts/ensure-docker.ts  ← guard: garante Docker de pé
    ├─ docker compose up postgres -d
    ├─ tsx scripts/wait-for-db.ts    ← aguarda PostgreSQL pronto
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
# O guard (modo padrão "check") NÃO inicia o Docker sozinho:
# Windows: docker desktop start
# Linux:   sudo systemctl start docker
# macOS:   open -a Docker
# Depois rode: npm run dev:all

# Se quiser que o projeto inicie o Docker em 2º plano automaticamente:
LUCRAI_DOCKER_MODE=auto npm run dev:all
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
# Modo padrão (check): o guard mostra a orientação e sai. Inicie e rode de novo:
# Windows: docker desktop start
# Linux:   sudo systemctl start docker
# macOS:   open -a Docker
#
# Ou ative o start automático em 2º plano no seu .env:
#   LUCRAI_DOCKER_MODE=auto
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
