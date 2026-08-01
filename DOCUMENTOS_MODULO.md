# Módulo Central Inteligente de Documentos — LUCRAÍ

## 1. Visão Geral

A **Central Inteligente de Documentos** permite que usuários do Lucraí enviem documentos financeiros (notas fiscais, comprovantes, boletos, recibos), tenham os dados conferidos e gerem lançamentos automáticos no sistema (Financeiro ou Previsão de Caixa).

**Filosofia central:** "O melhor lançamento financeiro é aquele que o usuário não precisou digitar."

## 2. Arquitetura

### Stack atual do projeto
- **Frontend:** Next.js 15 (App Router) + React 19 + TypeScript
- **UI:** Tailwind CSS + shadcn/ui (Radix UI primitives)
- **Estado:** Zustand
- **Backend:** ASP.NET Core 10 (Web API REST) + EF Core
- **Database:** PostgreSQL (Neon em produção, Docker local)
- **Autenticação:** JWT Bearer + refresh token
- **Multi-tenancy:** Isolamento por `Company` + `CreatedBy` via Global Query Filters

> **Nota:** O módulo foi **100% migrado do Dexie/IndexedDB para a API REST** (sprints 9-11). Não existe mais persistência client-side de documentos.

### Fluxo de dados

```
Usuário → Next.js (DocumentoService / DocumentoRepositoryApi)
                    ↕ HTTPS / JSON + JWT
         ASP.NET Core (DocumentosController + repositórios)
                    ↕ EF Core / Npgsql
         PostgreSQL
```

## 3. Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Sim | URL base da API (ex.: `https://lucrai-api.up.railway.app`) |

Não existem mais variáveis `NEXT_PUBLIC_DOCUMENT_AI_*` — a extração/processamento acontece no backend ou no parser local do frontend.

## 4. Migrations

As tabelas do módulo são gerenciadas pelo EF Core no backend:

- `DocumentoFinanceiro` — `Documentos`
- `DocumentoTrashItem` — lixeira com TTL de 30 dias (snapshot + metadata)
- `DocumentoLog` — auditoria de ações nos documentos
- `DocumentoAprendizado` — aprendizado (chave → categoria + tipo)
- `DocumentoConfiguracao` — configurações por empresa

Migrations aplicadas automaticamente no startup da API (`db.Database.Migrate()`).

## 5. Endpoints (Backend)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/documentos` | Listar documentos (query: `status`) |
| `GET` | `/api/documentos/{id}` | Obter documento |
| `GET` | `/api/documentos/{id}/download` | Baixar arquivo original |
| `GET` | `/api/documentos/stats` | Estatísticas (`mes`, `ano`) |
| `POST` | `/api/documentos/upload` | Upload de até 10 arquivos (PDF/XML/JPG/PNG) |
| `GET` | `/api/documentos/trash` | Listar itens na lixeira |
| `POST` | `/api/documentos/{id}/excluir` | Mover para lixeira com motivo |
| `POST` | `/api/documentos/{id}/restaurar` | Restaurar da lixeira |
| `DELETE` | `/api/documentos/{id}/permanente` | Excluir permanentemente |
| `POST` | `/api/documentos/trash/cleanup` | Limpar itens expirados |
| `POST` | `/api/documentos/{id}/confirmar` | Confirmar e converter em lançamento |
| `POST` | `/api/documentos/{id}/rejeitar` | Rejeitar com motivo |
| `POST` | `/api/documentos/{id}/reprocessar` | Reprocessar documento |
| `GET` | `/api/documentos/{id}/logs` | Logs de auditoria do documento |
| `GET/POST` | `/api/documentos/aprendizado` | Listar / upsert aprendizado |
| `DELETE` | `/api/documentos/aprendizado/{id}` | Remover aprendizado |
| `GET/PUT` | `/api/documentos/config` | Obter / atualizar configurações |

**Isolamento:** todos os endpoints filtram por `Company` (tenant) e por `CreatedBy` (usuário). Restauração e exclusão permanente da lixeira usam `.IgnoreQueryFilters()` para acessar itens do snapshot.

## 6. Estrutura de Arquivos (Frontend)

```
src/
├── services/
│   ├── api-repositories/documents.ts        # DocumentoRepositoryApi (todos os endpoints)
│   └── documentos/
│       ├── documentos.service.ts            # Orquestração principal (upload, confirmar, rejeitar...)
│       ├── documentos-aprendizado.service.ts# Sistema de aprendizado
│       ├── documentos-extracao.service.ts   # Extração (parser + metadados)
│       ├── documentos-storage.service.ts    # Validação de arquivos
│       ├── parser/                          # Parser local (XML NF-e, texto)
│       │   ├── danfe-parser.ts
│       │   ├── index.ts
│       │   └── types.ts
│       └── __tests__/                       # Testes (documentos-api, documentos-service, parser)
├── hooks/
│   ├── useDocumentos.ts                     # Listagem + stats + config
│   └── useConferencia.ts                    # Confirmar / rejeitar
└── app/
    └── documentos/
        ├── page.tsx                         # Caixa de Entrada
        ├── [id]/
        │   ├── page.tsx                     # Detalhe do documento
        │   └── conferencia/
        │       └── page.tsx                 # Tela de Conferência
        └── configuracoes/
            └── page.tsx                     # Configurações do módulo
```

## 7. Rotas (Frontend)

| Rota | Descrição |
|---|---|
| `/documentos` | Caixa de Entrada Financeira (listagem + upload) |
| `/documentos/[id]` | Detalhe do documento + timeline de auditoria |
| `/documentos/[id]/conferencia` | Tela de conferência (revisão + confirmação) |
| `/documentos/configuracoes` | Configurações do módulo |

## 8. Fluxo de Conferência

Ao confirmar um documento, o `DocumentoService.confirmar()` decide o destino:

- **Data ≤ hoje** → cria `Transaction` no Financeiro e, se houver favorecido/emitente, registra **aprendizado** (chave de reconhecimento → categoria + tipo).
- **Data futura** → cria `CashForecast` na Previsão de Caixa.

Depois chama `POST /api/documentos/{id}/confirmar` para marcar como `CONVERTIDO`. Rejeição usa `POST /api/documentos/{id}/rejeitar` com motivo obrigatório.

## 9. Funcionalidades Implementadas

- [x] Upload com drag-and-drop e validação de tipo/tamanho (máx. 10 arquivos, 100MB)
- [x] Parsing local de XML NF-e / DANFE (`parseDocumento`)
- [x] Criação automática de lançamento no Financeiro ou Previsão de Caixa
- [x] Tela de conferência com visualizador de documento + formulário
- [x] Sistema de aprendizado por empresa (chave de reconhecimento → categoria)
- [x] Soft-delete com lixeira (TTL 30 dias) e auditoria (LGPD)
- [x] Reprocessamento de documentos
- [x] Logs de auditoria em todas as ações
- [x] Configurações por empresa (retenção em dias, sugestão automática de categoria, notificações, limite de tamanho)
- [x] Paginação, busca, filtros
- [x] Navegação entre documentos na conferência
- [x] Isolamento por empresa **e** por usuário

## 10. Como Testar Localmente

```bash
npm run dev:all          # Postgres (Docker) + API (dotnet watch) + Next.js
```

1. Faça login com uma conta que tenha empresa configurada.
2. Acesse `/documentos` — a Caixa de Entrada será exibida.
3. Clique em "Enviar Documento(s)" e selecione um XML de NF-e (parser local) ou PDF/imagem.
4. Após o upload, o documento aparece com status `NOVO`.
5. Clique em "Conferir" para revisar os dados extraídos.
6. Confirme para criar o lançamento (Financeiro ou Previsão de Caixa) ou rejeite.

## 11. Testes Automatizados

Testes do frontend (Vitest) em `src/services/documentos/__tests__/`:

- `documentos-api.test.ts` — `DocumentoRepositoryApi`: upload, listagem, download, stats, lixeira, conferência, aprendizado, config
- `documentos-service.test.ts` — orquestração do `DocumentoService` (confirmar cria transaction/forecast, rejeitar, excluir)
- `documentos.test.ts` — parser e geração de chave de aprendizado

Backend: testes de isolamento por usuário/empresa em `backend/tests/Lucrai.API.Tests/`.

## 12. Limitações Conhecidas

- A extração de PDFs/imagens depende do parser local; XML de NF-e tem extração estruturada mais confiável.
- O armazenamento do arquivo é feito no próprio banco (`ArquivoData`, coluna BYTEA), com limite de 100MB por arquivo no upload.
- O badge do menu lateral atualiza por polling (15s), pode haver pequena latência entre o processamento e a atualização do contador.
