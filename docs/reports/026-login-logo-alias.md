# Sprint 26 — Login: nova logo + título destacado

## Objetivo

Trocar o logotipo da tela de login para a versão dedicada `logo-lucrai-login.png` e dar destaque ao texto "Sistema de Gestão Financeira", padronizando sua estilização com o título "Acessar plataforma".

## O que foi feito

### 1. Alias `@images` para as imagens da raiz

O projeto não possuía alias para a pasta `images/` da raiz (só `@/*` → `./src/*`). Foram adicionados:

- `tsconfig.json` → `paths["@images/*"] = ["./images/*"]`
- `next.config.js` → alias de webpack `config.resolve.alias["@images"]` apontando para `path.join(__dirname, "images")`

### 2. Página de login (`src/app/login/page.tsx`)

- Import da imagem via o novo alias:
  ```ts
  import logoLogin from "@images/logo-lucrai-login.png";
  ```
- Substituído `src="/images/lucrai/logo-lucrai-sem-fundo.png"` por `src={logoLogin}`.
- Texto de rodapé do logo: `<p className="text-sm text-muted-foreground">Sistema de Gestão Financeira</p>` →
  `<p className="text-xl font-semibold">Sistema de Gestão Financeira</p>` (mesma estilização do título "Acessar plataforma", que usa `text-xl font-semibold`).

## Experiencia / Validação

- `npx tsc --noEmit` — limpo (exit 0).
- `npm run dev` → `/login` compilado sem erros, Web `✓ Ready`.
- `GET /login` → `200`.
- A imagem importada é otimizada pelo Next para `/_next/static/media/logo-lucrai-login.5f5af9ee.png` (serve `200`), referenciada no chunk `app/login/page.js`.

## Arquivos modificados

| Arquivo | Ação |
|---|---|
| `tsconfig.json` | Adicionado alias `@images/*` |
| `next.config.js` | Adicionado alias de webpack para `@images` |
| `src/app/login/page.tsx` | Nova logo importada + título destacado |
| `docker-compose.yml` | **Não alterado** |

## Validação pendente

- Screenshot visual manual (requer navegador; Playwright sem Chrome instalado localmente no momento).

---

## Anexo — nota sobre arranque do Docker no Windows (ref. Sprint 25)

O modo `auto` do Docker guard, na sua máquina (Windows), passou a **abrir o Docker Desktop (GUI)** via `Docker Desktop.exe -Autostart`, em vez do start headless `com.docker.backend.exe -with-frontend=false`. Motivo: o start headless abria uma janela de console indesejada. O `LUCRAI_DOCKER_MODE=auto` fica apenas no `.env` local (gitignored); demais devs/SOs seguem no modo `check` (não invasivo).