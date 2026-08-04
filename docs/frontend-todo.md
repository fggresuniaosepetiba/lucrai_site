# Lucraí — Frontend Checklist

## Legenda
- [x] Concluído
- [ ] Pendente
- [~] Em andamento

---

## Infraestrutura e Projeto

- [x] Projeto Next.js 15 configurado com App Router
- [x] TypeScript configurado com strict mode (5.8)
- [x] Tailwind CSS com sistema de temas próprio
- [x] shadcn/ui configurado (23 componentes) — Dexie.js removido na sprint 11
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
- [x] Tabela de auditoria via API REST (`AuditRepositoryApi`)
- [x] Registro do usuário responsável em cada ação

## Tema e Interface

- [x] 2 temas: Normal/Sistema (escuro) e Dark Mega (ultra escuro) — tema claro removido
- [x] Troca de tema via dropdown no header
- [x] Sidebar colapsável com navegação
- [x] Responsividade básica (grid adaptável)
- [x] Animações de entrada (fade-in, slide-in)
- [x] Sistema de notificações (toast)

## Autenticação e Sessão (Sprint 15)

- [x] Token de sessão movido de `localStorage` para `sessionStorage` (fechar aba = logout)
- [x] Race condition no logout corrigida (`logout()` agora é awaitado antes do redirect)
- [x] Login page nunca auto-redireciona — sempre exige credenciais
- [x] InactivityTracker — timeout de 15 minutos com toast de warning aos 14 min
- [x] Testes atualizados para `sessionStorage`

## Financeiro (Sprint 16) — Bloqueio Visual + Validação Inline

- [x] Datas futuras desabilitadas no calendário (`disabled={{ after: new Date() }}`)
- [x] Validação inline ao selecionar data (erro aparece antes do submit, via `validateTransactionDate`)
- [x] Mensagem de erro orienta o usuário a usar Previsão de Caixa

## Integração com API

- [x] `src/services/api.ts` — cliente HTTP com Bearer token automático + refresh automático + error handling
- [x] `auth-store.ts` — login via API, JWT armazenado, mustChangePassword flow, refreshUser
- [x] `useDadosFiltrados.ts` — chama API (`TransactionRepositoryApi`, `CashForecastRepositoryApi`) ao invés de Dexie
- [x] api.ts — refresh token automático (interceptor 401 → refresh → retry)
- [x] api.ts — tratamento de erro da API (classe `ApiError`, redirect 401)
- [x] `api-repositories/` — repositórios API (transactions, cash-forecast, dashboard, categories, users, settings, trash, audit, indicadores, documentos, pricing, fixed-costs, insumos, recibos, signature, contas)
- [x] Substituir chamadas Dexie restantes nos pages (pricing, financial, cash-forecast, dashboard, reports, resumo-cfo, cadastro)
- [x] `useDocumentos.ts` — migrar de Dexie para API (listagem + stats + upload + conferência + lixeira)

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

## Grupo A: Migrar páginas Dexie → API (concluído)

**Problema original:** Essas páginas ainda liam/escreviam no Dexie (IndexedDB). Dados ficavam presos no navegador.

**Solução:** Trocar `import` do repositório Dexie pelo `ApiRepository` correspondente.

### Plano de Implementação

#### ✅ Grupo A — Concluído (sprint 10)

Todas as 8 migrações do Grupo A foram realizadas:

1. ✅ `categories/page.tsx` — já usava `CategoryRepositoryApi`
2. ✅ `reports/page.tsx` — já usava `TransactionRepositoryApi` / `CashForecastRepositoryApi`
3. ✅ `settings/page.tsx` — já usava `SettingsRepositoryApi`
4. ✅ `trash/page.tsx` — já usava `TrashRepositoryApi`
5. ✅ `users/page.tsx` — já usava `UserRepositoryApi`
6. ✅ `transaction-form.tsx` — recebe categories via props, sem dependência Dexie
7. ✅ `alertasService.ts` — já usava `localStorage`
8. ✅ `documentos.service.ts` — fallback Dexie + `iniciarProcessamento` removidos

**Migrações adicionais feitas na sprint 10:**
- `useDocumentos.ts` — fallback Dexie removido
- `documentos-aprendizado.service.ts` — `DocumentoAprendizadoRepository` → `DocumentoRepositoryApi`
- `recibos/page.tsx` — `TransactionRepository` → `TransactionRepositoryApi`
- `pricing/page.tsx` — `seedDefaultCategories` removido
- `login/page.tsx` — `seedAll` removido

---

## Grupo B: Features — Backend + Frontend conectados via API

**Problema original:** Essas entidades só existiam no Dexie. Não tinham controller/entidade/repositório no backend .NET.

**Situação atual:** Backend completo (controllers, entities, repositories) + Frontend conectado via API repositories. Dexie removido.

### ✅ Concluído

| Módulo | Frontend (API repo) | Backend |
|--------|-------------------|---------|
| Recibos | `RecibosRepositoryApi` | Controller + Repository |
| Insumos | `InsumoRepositoryApi` | Controller + Repository |
| Custos Fixos | `FixedCostRepositoryApi` | Controller + Repository |
| Assinatura | `SignatureRepositoryApi` | Controller + Repository |
| Auditoria de Recibos | Embutido no `RecibosRepositoryApi.createAudit()` | Controller + Repository |

---

## Inteligência Financeira (Dashboard)

- [x] Central com 10 sub-abas de indicadores (DRE, DFC, balancete, razão, balanço, etc.)
- [x] Resumo CFO (`/dashboard/resumo-cfo`) com nota em linguagem natural
- [x] Projeções (`/dashboard/projecoes`) — projeção 12 meses via API
- [x] Alertas (`/dashboard/alertas`) — 6 tipos + insights + dismiss/restore
- [x] Health score (0-100) com subindicadores
- [x] Sparkline de saldo

## Recibos

- [x] Listagem com filtros (status, tipo, busca)
- [x] Criação com validação CPF/CNPJ (checksum), numeração `REC-{ano}-######` e valor por extenso
- [x] Geração de PDF (jsPDF + html2canvas, A4)
- [x] Assinatura digital (imagem base64 + responsável) via `SignatureRepositoryApi`
- [x] Cancelamento com motivo
- [x] Lixeira própria com TTL 30 dias (soft delete)

## Documentos (Fase 10 — concluído)

- [x] Páginas `/documentos`, `/documentos/[id]`, `/documentos/[id]/conferencia`, `/documentos/configuracoes`
- [x] Upload com validação de tipo/tamanho (100MB, 10 arquivos) e checksum SHA-256
- [x] Extração: PDF (pdfjs-dist), OCR imagem (tesseract.js pt), NF-e XML (DOMParser), DANFE (parser local)
- [x] Provedores de IA: OpenAI Vision (gpt-4o) e Google Gemini — com fallback sem IA
- [x] Fluxo de conferência (confirmar/rejeitar/reprocessar) com criação de transação/previsão
- [x] Aprendizado (chave → categoria/tipo) e configuração por empresa
- [x] Lixeira de documentos com TTL

## Landing Page & Cadastro

- [x] Landing page (`/`) com 13 seções (hero, features, comparação, resultados, depoimentos, pricing, consultoria, segurança, FAQ, CTA)
- [x] Onboarding multi-etapa (`/cadastro`): StepDadosPessoais (senha com força) + StepDadosEmpresa
- [x] Tela pós-cadastro (`/bem-vindo`) com trial de 14 dias

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
| Inteligência Financeira | 6 | 0 |
| Recibos | 6 | 0 |
| Documentos (Fase 10) | 6 | 0 |
| Landing Page & Cadastro | 3 | 0 |
| Testes Unitários | 3 | 0 |
| Testes E2E | 5 | 0 |
| Migração Grupo A | 8 | 0 |
| Migração Grupo B (backend + frontend) | 5 | 0 |
| Pendências Gerais | 0 | 4 |
| **Total** | **164** | **4** |
