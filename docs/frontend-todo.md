# Lucraí — Frontend Checklist

## Legenda
- [x] Concluído
- [ ] Pendente
- [~] Em andamento

---

## Infraestrutura e Projeto

- [x] Projeto Next.js 15 configurado com App Router
- [x] TypeScript configurado com strict mode
- [x] Tailwind CSS com sistema de temas próprio
- [x] shadcn/ui configurado com componentes base
- [x] Dexie.js configurado com 7 tabelas e schema version 6
- [x] Variáveis de ambiente (.env.local)

## Autenticação e Sessão

- [x] Tela de login com validação local
- [x] Store de autenticação (Zustand + localStorage)
- [x] Proteção de rotas por verificação de sessão
- [x] Logout com limpeza de sessão
- [x] Seed de usuários padrão na primeira execução
- [x] Controle de acesso por papel (owner, admin, financial, viewer)
- [x] MustChangePassword — login detecta e redireciona para troca de senha
- [x] Tela de troca de senha (`/trocar-senha`) com validação de requisitos

## Dashboard

- [x] Cards financeiros: Entradas, Saídas, Saldo Atual, Margem Líquida
- [x] Filtro por tipo nos cards (all/income/expense/balance)
- [x] Cards de previsto: Recebimentos, Pagamentos, Saldo Projetado
- [x] Gráfico de barras: Entradas x Saídas por mês
- [x] Gráfico de pizza: Gastos por Categoria
- [x] Tabela: Últimos Lançamentos
- [x] Indicador: Saúde da Empresa (independente de filtros)
- [x] Abreviação inteligente de valores nos cards (Mi/Bi)
- [x] Tooltip com valor completo nos cards
- [x] Layout responsivo dos cards para valores milionários

## Financeiro (Transações)

- [x] Listagem de transações com ID, tipo, descrição, categoria, data, valor
- [x] Busca por texto
- [x] Filtro por tipo (all/income/expense)
- [x] Ordenação por data (crescente/decrescente)
- [x] Formulário de criação/edição em dialog
- [x] Máscara de moeda brasileira em tempo real
- [x] Campo "Valor por Extenso" automático (textarea read-only)
- [x] Seleção de categoria com fallback para criação inline
- [x] Indicadores de campo obrigatório
- [x] Validação de datas: apenas hoje/passado, bloqueio de futuras
- [x] Bloqueio de datas absurdas (< 1900)
- [x] Display ID sequencial (#001, #002...)
- [x] Exclusão suave (envio para lixeira com motivo)
- [x] Exportação para CSV
- [x] Diálogo de confirmação de exclusão

## Previsão de Caixa

- [x] Listagem de previsões ativas (apenas status "predicted")
- [x] Aba de Histórico (recebidas, pagas, canceladas)
- [x] Criação e edição de previsões
- [x] Marcar como Recebido (cria transação no Financeiro)
- [x] Marcar como Pago (cria transação no Financeiro)
- [x] Cancelamento com motivo obrigatório
- [x] Diálogos de confirmação para todas as ações
- [x] Bloqueio de ações em itens já concluídos
- [x] Validação de datas: apenas futuro, máx 10 anos
- [x] Alerta de caixa (despesas previstas > saldo atual)
- [x] Gráfico de saldo projetado
- [x] Cards de resumo: saldo atual, recebimentos, pagamentos, projetado
- [x] Campo "Valor por Extenso" automático no formulário
- [x] Auditoria de todas as ações

## Categorias

- [x] Listagem agrupada por tipo (Entradas / Saídas)
- [x] Cards com cor, nome e badge de tipo
- [x] Criação com nome, cor (12 cores) e tipo
- [x] Edição inline
- [x] Exclusão com proteção (bloqueia se houver transações vinculadas)
- [x] Detecção e remoção de categorias duplicadas
- [x] Seed de categorias padrão na primeira execução

## Relatórios

- [x] Relatório anual com seletor de ano
- [x] Cards de resumo do realizado (entradas, saídas, saldo)
- [x] Cards de resumo do previsto
- [x] Tabela mensal com 12 meses
- [x] Colunas: mês, entradas, saídas, saldo realizado, saldo projetado
- [x] Exportação para CSV do relatório

## Usuários

- [x] Listagem de usuários com avatar, nome, email, papel, empresa
- [x] Criação de usuário com papel
- [x] Edição de dados e papel
- [x] Exclusão com proteção (owner não pode ser excluído)
- [x] Roles: owner, admin, financial, viewer

## Lixeira

- [x] Listagem de itens excluídos com ID, descrição, valor, data
- [x] Contagem regressiva de expiração (30 dias)
- [x] Restauração de itens
- [x] Exclusão permanente
- [x] Limpeza automática de itens expirados ao carregar
- [x] Badges visuais para itens próximos do vencimento

## Configurações

- [x] Nome da empresa
- [x] Upload de logo (base64)
- [x] Cor primária
- [x] Alteração de senha com validação de requisitos

## Auditoria

- [x] Log de criação, edição, exclusão de transações
- [x] Log de criação, edição de previsões
- [x] Log de recebimento, pagamento, cancelamento
- [x] Log de restauração e exclusão permanente
- [x] Tabela dedicada no IndexedDB (auditLogs)
- [x] Registro do usuário responsável em cada ação

## Tema e Interface

- [x] 3 temas: Normal (escuro), Dark Mega (ultra escuro), Clean (claro)
- [x] Troca de tema via dropdown no header
- [x] Sidebar colapsável com navegação
- [x] Responsividade básica (grid adaptável)
- [x] Animações de entrada (fade-in, slide-in)
- [x] Sistema de notificações (toast)

## Integração com API

- [x] `src/services/api.ts` — cliente HTTP com Bearer token automático + refresh automático + error handling
- [x] `auth-store.ts` — login via API, JWT armazenado, mustChangePassword flow, refreshUser
- [x] `useDadosFiltrados.ts` — chama API (`TransactionRepositoryApi`, `CashForecastRepositoryApi`) ao invés de Dexie
- [x] api.ts — refresh token automático (interceptor 401 → refresh → retry)
- [x] api.ts — tratamento de erro da API (classe `ApiError`, redirect 401)
- [x] `api-repositories/` — repositórios API para transactions, cash-forecast, dashboard
- [x] Substituir chamadas Dexie restantes nos pages (pricing, financial, cash-forecast, dashboard, reports, resumo-cfo, cadastro)
- [x] `useDocumentos.ts` — migrar de Dexie para API (listagem + stats + upload; conferência/lixeira continua em Dexie)

### Documentos (Financeiros) — Fase 10

#### 10.1 — `api-repositories/documents.ts` (adicionar métodos faltantes)

- [x] 10.1.1 Adicionar interfaces/types: `ApiDocumentoLog`, `ApiDocumentoTrashItem`, `ApiDocumentoAprendizado`, `ApiDocumentoConfig` + funções `mapLog()`, `mapTrashItem()`, `mapAprendizado()`, `mapConfig()`
- [x] 10.1.2 Lixeira: `getTrash()`, `excluir(id, motivo)`, `restaurar(id)`, `excluirPermanente(id)`, `cleanupTrash()`
- [x] 10.1.3 Conferência: `confirmar(id, data)`, `rejeitar(id, motivo)`
- [x] 10.1.4 Ações: `reprocessar(id)`
- [x] 10.1.5 Auditoria: `getLogs(documentoId)`
- [x] 10.1.6 Aprendizado: `getAprendizado()`, `upsertAprendizado(data)`, `deleteAprendizado(id)`
- [x] 10.1.7 Config: `getConfig()`, `updateConfig(data)`

#### 10.2 — `useDocumentoConfig` (hook + página config)

- [x] 10.2.1 Migrar `useDocumentoConfig` — substituir `DocumentoConfigRepository.get()` por `DocumentoRepositoryApi.getConfig()`
- [x] 10.2.2 Adicionar `updateConfig` ao hook (chama `DocumentoRepositoryApi.updateConfig()`)
- [x] 10.2.3 Migrar `configuracoes/page.tsx` — substituir `DocumentoConfigRepository` por hook + API repo
- [x] 10.2.4 Migrar tabela de Aprendizado na config page — substituir `DocumentoAprendizadoRepository` por `DocumentoRepositoryApi`

#### 10.3 — `documentos.service.ts` — Conferência & Ações

- [x] 10.3.1 Migrar `confirmar()` — chamar `POST /api/documentos/{id}/confirmar` + criar Transaction/Forecast via API + upsert aprendizado via API
- [x] 10.3.2 Migrar `rejeitar()` — chamar `POST /api/documentos/{id}/rejeitar`
- [x] 10.3.3 Migrar `reprocessar()` — chamar `POST /api/documentos/{id}/reprocessar`

#### 10.4 — `documentos.service.ts` — Lixeira (Trash flow)

- [x] 10.4.1 Migrar `excluir()` — chamar `POST /api/documentos/{id}/excluir`
- [x] 10.4.2 Migrar `restaurarDaTrash()` — chamar `POST /api/documentos/{id}/restaurar`
- [x] 10.4.3 Migrar `excluirPermanentemente()` — chamar `DELETE /api/documentos/{id}/permanente`

#### 10.5 — Páginas

- [x] 10.5.1 `[id]/page.tsx` — substituir `DocumentoRepository.getById()` por `DocumentoRepositoryApi`
- [x] 10.5.2 `[id]/page.tsx` — substituir logs por `DocumentoRepositoryApi.getLogs()`
- [x] 10.5.3 `[id]/page.tsx` — ações (reprocessar/excluir) passam a usar service migrado
- [x] 10.5.4 `[id]/conferencia/page.tsx` — substituir `DocumentoRepository` por `DocumentoRepositoryApi`
- [x] 10.5.5 `[id]/conferencia/page.tsx` — `confirmar`/`rejeitar` passam a usar service migrado

## Testes

### Testes Unitários (Vitest + RTL)

- [x] Adaptar testes existentes para mockar API (substituir Dexie)
- [x] Testar hooks (useDadosFiltrados, useAlertsCount)
- [x] Testar utils (máscaras, formatação)

### Testes E2E (Playwright)

- [x] Fluxo: Login → Dashboard → ver indicadores
- [x] Fluxo: Criar transação → ver no financeiro
- [x] Fluxo: Criar previsão → marcar como recebida
- [x] Fluxo: Excluir → restaurar da lixeira
- [x] Fluxo: Gerenciar categorias

## Pendências Gerais

- [ ] Onboarding interativo para novos usuários
- [ ] Backup e restauração dos dados
- [ ] Exportação para PDF
- [ ] Modo escuro programável (agendado)

## Grupo A: Migrar páginas Dexie → API (já têm API repository)

**Problema:** Essas páginas ainda leem/escrevem no Dexie (IndexedDB). Dados ficam presos no navegador.

**Solução:** Trocar `import` do repositório Dexie pelo `ApiRepository` correspondente.

### Plano de Implementação

#### 1️⃣ `src/app/categories/page.tsx` — Categorias
- **O que trocar:**
  - `CategoryRepository` (Dexie) → `CategoryRepositoryApi`
  - `seedDefaultCategories` → remover (API já seeda no backend)
  - `CategoryRepository.getAll(company)` → `CategoryRepositoryApi.getAll()`
  - `CategoryRepository.findDuplicates(company)` → remover (API faz find+remove em 1 call)
  - `CategoryRepository.removeDuplicates(company)` → `CategoryRepositoryApi.removeDuplicates()`
  - `CategoryRepository.create({...}, company)` → `CategoryRepositoryApi.create({...})` (sem company)
  - `CategoryRepository.update(id, {...})` → `CategoryRepositoryApi.update(id, {...})`
  - `CategoryRepository.delete(id)` → `CategoryRepositoryApi.delete(id)`
- **Mudança de comportamento:** Fluxo de duplicatas simplificado (sem dialog de preview, remove direto com toast do resultado)

#### 2️⃣ `src/app/reports/page.tsx` — Relatórios
- **O que trocar:**
  - `TransactionRepository` (Dexie) → `TransactionRepositoryApi`
  - `CashForecastRepository` (Dexie) → `CashForecastRepositoryApi`
  - `TransactionRepository.getAll(company)` → `TransactionRepositoryApi.getAll()` (sem company)
  - `CashForecastRepository.getAll(company)` → `CashForecastRepositoryApi.getAll()` (sem company)
- **Sem mudança de comportamento** — mesmas funções, mesmos tipos de retorno

#### 3️⃣ `src/app/settings/page.tsx` — Configurações
- **O que trocar:**
  - `SettingsRepository` (Dexie) → `SettingsRepositoryApi`
  - `UserRepository` (Dexie) → remover (não é mais usado na página)
  - `AssinaturaRepository` (Dexie) → **manter** (não tem API equivalente — Grupo B)
  - `SettingsRepository.get(company)` → `SettingsRepositoryApi.get()` (sem company)
  - `SettingsRepository.update(company, data)` → `SettingsRepositoryApi.update(data)` (sem company)

#### 4️⃣ `src/app/trash/page.tsx` — Lixeira
- **O que trocar:**
  - `TrashRepository` (Dexie) → `TrashRepositoryApi`
  - `DocumentoRepository` (Dexie) → `DocumentoRepositoryApi` (para trash de docs)
  - `TrashRepository.cleanup()` → `TrashRepositoryApi.cleanup()`
  - `TrashRepository.getAll(company)` → `TrashRepositoryApi.getAll()` (sem company)
  - `TrashRepository.restore(id, userName)` → `TrashRepositoryApi.restore(id)` (sem userName)
  - `TrashRepository.permanentlyDelete(id, userName)` → `TrashRepositoryApi.permanentlyDelete(id)` (sem userName)
  - `DocumentoRepository.cleanupTrash()` → `DocumentoRepositoryApi.cleanupTrash()`
  - `DocumentoRepository.getAllInTrash(company)` → `DocumentoRepositoryApi.getTrash()` (sem company)

#### 5️⃣ `src/app/users/page.tsx` — Usuários
- **O que trocar:**
  - `UserRepository` (Dexie) → `UserRepositoryApi` (para TODAS as operações)
  - `UserRepository.getAll()` → `UserRepositoryApi.getAll()`
  - `UserRepository.create(...)` + `UserRepositoryApi.create(...)` → só `UserRepositoryApi.create(...)` (remover dual-write)
  - `UserRepository.update(id, data)` → `UserRepositoryApi.update(id, data)`
  - `UserRepository.softDelete(id, reason, user)` → `UserRepositoryApi.delete(id, reason)`
  - Remover campo `company` do formulário de criar/editar (derivado do JWT)

#### 6️⃣ `src/components/financial/transaction-form.tsx` — Formulário de Transação
- **O que trocar:**
  - `CategoryRepository` (Dexie) → `CategoryRepositoryApi`
  - `CategoryRepository.getAll(company)` → `CategoryRepositoryApi.getAll()`
- **Nota:** Componente já recebe `categories` por prop — o Dexie era fallback se categories viessem vazias

#### 7️⃣ `src/services/alertasService.ts` — Serviço de Alertas
- **O que trocar:**
  - `db.settings` (Dexie) → `localStorage`
  - `db.settings.get("alertas-dispensados")` → `localStorage.getItem("lucrai-alertas-dispensados")`
  - `db.settings.put(...)` → `localStorage.setItem(...)`
- **Nota:** Alertas dispensados são preferência do usuário (não precisam ser compartilhados entre browsers)

#### 8️⃣ `src/services/documentos/documentos.service.ts` — Serviço de Documentos
- **O que trocar:**
  - Linhas 7-8: remover `import { TransactionRepository }` e `import { CashForecastRepository }` — já não são usados (API substituiu)
  - Linha 239 e 275: `(await import("@/database/repositories/categories")).CategoryRepository.getAll(empresa_id)` → `(await import("@/services/api-repositories/categories")).CategoryRepositoryApi.getAll()`
- **Confirmado:** `TransactionRepositoryApi.create` e `CashForecastRepositoryApi.create` já estão sendo usados (linhas 242, 265)

---

## Grupo B: Features sem backend API (requer backend + frontend)

**Problema:** Essas entidades só existem no Dexie. Não têm controller/entidade/repositório no backend .NET.

**Escopo futuro (não implementado):**
- [ ] Recibos (`src/app/recibos/`, `src/database/repositories/recibos.ts`)
- [ ] Insumos/Pricing (`src/app/pricing/insumos/`, `src/database/repositories/insumos.ts`)
- [ ] Custos Fixos/Pricing (`src/app/pricing/fixed-costs/`, `src/database/repositories/fixed-costs.ts`)
- [ ] Assinatura/Recibos (`src/database/repositories/assinatura.ts`)
- [ ] Auditoria de Recibos (`src/database/repositories/auditoria-recibos.ts`)

---

## Resumo

| Área | Concluídos | Pendentes |
|------|:----------:|:---------:|
| Infraestrutura e Projeto | 6 | 0 |
| Autenticação e Sessão | 7 | 0 |
| Dashboard | 10 | 0 |
| Financeiro (Transações) | 15 | 0 |
| Previsão de Caixa | 14 | 0 |
| Categorias | 7 | 0 |
| Relatórios | 6 | 0 |
| Usuários | 5 | 0 |
| Lixeira | 6 | 0 |
| Configurações | 4 | 0 |
| Auditoria | 6 | 0 |
| Tema e Interface | 6 | 0 |
| Integração com API | 30 | 0 |
| Testes Unitários | 3 | 0 |
| Testes E2E | 5 | 0 |
| Migração Grupo A | 8 | 0 |
| Migração Grupo B (backend + frontend) | 0 | 5 |
| Pendências Gerais | 0 | 4 |
| **Total** | **133** | **9** |
