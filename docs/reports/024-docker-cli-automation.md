# Sprint 24 — Docker CLI-only + Automação

## Objetivo

Tornar o setup local 100% CLI-only (sem abrir o Docker Desktop), corrigir o reset do banco, containerizar o frontend, validar imagens no CI e automatizar o deploy da API via Railway CLI.

## O que foi feito

### 1. Scripts CLI-only (sem abrir Docker Desktop)

- `scripts/dev.ps1` e `scripts/dev.sh` — removido o auto-start do Docker Desktop (`Start-Process`/`open -a Docker`).
- Novo comportamento: verifica o daemon via `docker info`; se estiver parado, imprime mensagem clara e sai com código de erro — **nunca abre o GUI**.

### 2. Reset do banco com readiness

- `package.json` — `dev:reset-db` agora é:
  ```
  docker compose down -v && docker compose up postgres -d && npm run dev:wait-db
  ```
  Apaga o volume, recria o Postgres e **aguarda o banco ficar pronto** (migrations + seed rodam no startup da API).

### 3. Frontend em container

- `frontend.Dockerfile` (multi-stage, `node:22-alpine`) com Next.js `output: "standalone"`:
  - Imagens **pinadas por digest** (imutáveis, reprodutíveis)
  - Usuário não-root (`nextjs`) no estágio final
  - `HEALTHCHECK` usando `wget` na raiz
  - `ARG NEXT_PUBLIC_API_URL` — embutida no build (Next.js injeta `NEXT_PUBLIC_*` em build time)
  - `npm ci --frozen-lockfile`
- `docker-compose.yml` — novo serviço `web` (profile `full`, porta `3000:3000`) que recebe `NEXT_PUBLIC_API_URL` via **build arg**
- `.dockerignore` na raiz — exclui `node_modules`, `.next`, `.env*`, `backend`, `docs`, `scripts`, etc.

### 4. CI valida as imagens

- `.github/workflows/ci.yml` — novo job `docker` (após `backend` e `frontend`) que builda o backend (Dockerfile do Railway) e o frontend (`frontend.Dockerfile`) com `docker/setup-buildx-action` + `docker/build-push-action` (push: false).

### 5. Deploy via Railway CLI

- `scripts/deploy-railway.ps1` e `scripts/deploy-railway.sh`:
  - `redeploy` (padrão) — redeploy do último deploy
  - `up` — envia o código atual via `railway up`
  - Alvo: projeto `sincere-creation` / serviço `lucrai_site`

### 6. Documentação

- `DOCUMENTOS_MODULO.md` reescrito para refletir a arquitetura atual (backend ASP.NET Core + PostgreSQL, `DocumentoRepositoryApi`, fluxo de conferência via API). Removidas referências a Dexie/IndexedDB, `NEXT_PUBLIC_DOCUMENT_AI_*` e `lucrai_sessao`.
- `docs/todo.md` — Sprint 24 adicionada.
- `docs/dev-guide.md` — seções atualizadas (scripts CLI-only, deploy Railway, reset com readiness).
- Docs de tema (todo, frontend-todo, roadmap, project-context, architecture) — removida referência ao tema "Clean" (3 temas → 2).

## Vulnerabilidades corrigidas na `frontend.Dockerfile`

| Achado | Correção |
|---|---|
| Base image por tag mutável (`node:22-alpine`) — não reprodutível | Pinado por digest `@sha256:c610...` |
| Usuário root no estágio final | `USER nextjs` (usuário dedicado, uid 1001) |
| Sem healthcheck | `HEALTHCHECK` com `wget` na raiz |
| `NEXT_PUBLIC_API_URL` não definida no build | `ARG NEXT_PUBLIC_API_URL` + `ENV` no estágio builder |
| `npm ci` sem lockfile explícito | `npm ci --frozen-lockfile` |

## Arquivos criados/modificados

| Arquivo | Ação |
|---|---|
| `scripts/dev.ps1` | Modificado (CLI-only) |
| `scripts/dev.sh` | Modificado (CLI-only) |
| `package.json` | Modificado (`dev:reset-db` com wait) |
| `frontend.Dockerfile` | Criado (pin digest + hardening) |
| `.dockerignore` | Criado |
| `docker-compose.yml` | Modificado (serviço `web` + build args) |
| `.github/workflows/ci.yml` | Modificado (job `docker`) |
| `scripts/deploy-railway.ps1` | Criado |
| `scripts/deploy-railway.sh` | Criado |
| `DOCUMENTOS_MODULO.md` | Reescrito |
| `docs/todo.md`, `docs/dev-guide.md` | Modificados |
| `docs/architecture.md`, `docs/roadmap.md`, `docs/project-context.md`, `docs/frontend-todo.md` | Modificados (tema) |

## Validação pendente

- Build das imagens (`docker compose --profile full build`) quando o daemon Docker estiver ativo.
- CI: job `docker` valida as Dockerfiles no GitHub Actions.

---

## Anexo — Sprint 25: Docker guard tipado + scripts TS

Refinamento do Sprint 24. Os scripts Node foram migrados para TypeScript e o "CLI-only" evoluiu para um **Docker guard configurável**.

### Mudanças principais

1. **TypeScript:** `scripts/ensure-docker.ts` e `scripts/wait-for-db.ts` (ESM, `tsx` como runner, `@types/pg`). Wrappers `dev.ps1`/`dev.sh`/`deploy-railway.*` permanecem shell (só delegam ao npm).
2. **`wait-for-db.ts`:** fix real — `npm run` não carrega `.env`, então o script agora lê o `.env` manualmente (senha do PostgreSQL).
3. **`ensure-docker.ts` (guard):** fluxo de 6 passos, cross-platform: detecta SO → `docker info` → ok? segue | não → estratégia do SO → aguarda pronto (polling 120s) → segue.
4. **Configurável por env var `LUCRAI_DOCKER_MODE`:** padrão `check` (não invasivo — verifica e orienta manualmente, sem tocar no ambiente do dev); `auto` (inicia o Docker em 2º plano headless); `skip` (equivale a `LUCRAI_SKIP_DOCKER_CHECK=1`).
5. **Start por SO (modo `auto`):** Windows `Docker Desktop.exe -Autostart` (abre a GUI; falha back para erro claro se não instalado); macOS `com.docker.backend` headless ou fallback `open -a Docker`; Linux `sudo systemctl start docker` / `sudo service docker start`.

## Decisão de projeto

O auto-start headless (`auto`) é **opt-in** e voltado ao ambiente local do dono do repo. Para outros devs, o default `check` apenas verifica o Docker, imprime a orientação exata por SO e não assume controle do ambiente. Nenhuma alteração global no Windows (registry/usuários) foi feita.

## Validação executada

| Cenário | Resultado |
|---|---|
| `check` + daemon de pé | ✅ exit 0 |
| `check` + daemon parado | ✅ mensagem clara + exit 1 |
| `auto` + daemon parado | ✅ inicia headless (sem GUI) + espera pronto + exit 0 |
| `dev:db` | ✅ guard → compose up postgres |
| `dev:wait-db` | ✅ conecta no banco (ler .env) |
| `tsc --noEmit` (projeto) | ✅ sem erros |
