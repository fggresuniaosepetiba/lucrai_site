# Sprint 14 — Dev Experience + Docker Automation

## Objetivo

Automatizar o ambiente de desenvolvimento local para que um único comando resolva tudo: Docker Desktop, PostgreSQL, API e Frontend.

## O que foi feito

### 1. Endpoint `/api/health`
- Criado `HealthController.cs` em `backend/src/Lucrai.API/Controllers/`
- Retorna `{ status, database, timestamp }` com verificação de conectividade ao PostgreSQL
- Usado pelo healthcheck do Docker Compose e debug rápido

### 2. Docker Compose com profiles
- `docker-compose.yml` reorganizado:
  - `postgres`: serviço padrão (sobe sempre)
  - `api`: profile `full` (só sobe com `--profile full`)
  - Ambos com healthcheck e `restart: unless-stopped`
- Dockerfile atualizado: `curl` adicionado para healthcheck via HTTP

### 3. Script de espera pelo PostgreSQL
- Criado `scripts/wait-for-db.js`
- Usa `pg` (já instalado) para testar conectividade antes de iniciar a API
- Timeout configurável via `WAIT_TIMEOUT` (padrão 60s)

### 4. Scripts do package.json aprimorados
- `dev:wait-db` — novo script para aguardar PostgreSQL
- `dev:all` — agora inclui `dev:wait-db` entre o `dev:db` e a API
- `dev:full` — novo comando: sobe API em container + Frontend nativo

### 5. Scripts de auto-start do Docker
- `scripts/dev.ps1` (Windows) — detecta Docker Desktop, inicia se necessário, executa `dev:all`
- `scripts/dev.sh` (Unix/WSL) — equivalente em Bash, com suporte a macOS (open -a Docker) e Linux (systemctl)
- Ambos aceitam argumento `full` para usar o profile completo

### 6. Documentação
- `docs/dev-guide.md` — guia completo de desenvolvimento local
- `docs/todo.md` — atualizado com sprint 14

### 7. Configuração
- `.env.example` — expandido com comentários

## Fluxo final

```bash
# Windows (auto-start Docker):
.\scripts\dev.ps1

# Linux / macOS / WSL:
./scripts/dev.sh

# Ou direto via npm (se Docker já estiver rodando):
npm run dev:all

# Para testar API full-container:
npm run dev:full
```

## Arquivos criados/modificados

| Arquivo | Ação |
|---|---|
| `backend/src/Lucrai.API/Controllers/HealthController.cs` | Criado |
| `docker-compose.yml` | Modificado (profiles, healthcheck) |
| `backend/src/Lucrai.API/Dockerfile` | Modificado (curl) |
| `package.json` | Modificado (scripts) |
| `.env.example` | Modificado |
| `scripts/wait-for-db.js` | Criado |
| `scripts/dev.ps1` | Criado |
| `scripts/dev.sh` | Criado |
| `docs/dev-guide.md` | Criado |
| `docs/todo.md` | Modificado |
