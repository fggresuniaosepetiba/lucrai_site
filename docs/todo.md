# LUCRAÍ Core — Checklist de Desenvolvimento

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
- [x] Dexie.js configurado com schema version 13+ (em processo de remoção)
- [x] Variáveis de ambiente (.env.local)

## Autenticação e Sessão

- [x] Tela de login com validação local
- [x] Store de autenticação (Zustand + JWT via API)
- [x] Proteção de rotas por verificação de sessão
- [x] Logout com limpeza de sessão
- [x] MustChangePassword — login detecta e redireciona para troca de senha
- [x] Landing page não é mais interceptada pelo mustChangePassword
- [x] Controle de acesso por papel (owner, admin, financial, viewer)

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
- [x] Registro do usuário responsável em cada ação

## Tema e Interface

- [x] 3 temas: Normal (escuro), Dark Mega (ultra escuro), Clean (claro)
- [x] Troca de tema via dropdown no header
- [x] Sidebar colapsável com navegação
- [x] Responsividade básica (grid adaptável)
- [x] Animações de entrada (fade-in, slide-in)
- [x] Sistema de notificações (toast)

## Dexie removido

Todos os repositórios Dexie foram removidos. O frontend agora se comunica exclusivamente via API REST.

### Tudo que foi removido (sprints 9, 10 e 11)

| Item | Detalhes |
|------|----------|
| **14 repositórios Dexie** | `recibos.ts`, `insumos.ts`, `assinatura.ts`, `audit.ts`, `auditoria-recibos.ts`, `fixed-costs.ts` (sprint 9) + `transactions.ts`, `cash-forecast.ts`, `categories.ts`, `documentos.ts`, `settings.ts`, `trash.ts`, `users.ts`, `pricing.ts` (sprint 10) |
| **Seed Dexie** | `src/database/seed.ts` |
| **Arquivo dexie.ts** | `src/database/dexie.ts` (sprint 11) |
| **Pasta database/** | `src/database/` — removida completamente (sprint 11) |
| **Pacote npm** | `dexie` removido do `package.json` (sprint 11) |

### Arquivos migrados para API

- `app/recibos/page.tsx` — `TransactionRepository` → `TransactionRepositoryApi`
- `hooks/useDocumentos.ts` — fallback Dexie removido
- `services/documentos/documentos.service.ts` — fallback Dexie + `iniciarProcessamento` removidos
- `services/documentos/documentos-aprendizado.service.ts` — `DocumentoAprendizadoRepository` → `DocumentoRepositoryApi`
- `components/pricing/TechnicalSheetModal.tsx` — `InsumosRepository` → `InsumoRepositoryApi`
- `app/pricing/page.tsx` — `seedDefaultCategories` removido
- `app/login/page.tsx` — `seedAll` removido

## Sprint 14 — Dev Experience + Docker Automation

- [x] Endpoint `/api/health` (HealthController)
- [x] Docker Compose com profiles (`full` para API em container)
- [x] Healthcheck nos serviços (postgres + api)
- [x] Script `scripts/wait-for-db.js` — aguarda PostgreSQL ficar pronto
- [x] `npm run dev:all` aprimorado com wait + graceful shutdown
- [x] `npm run dev:full` — stack completa em Docker
- [x] Scripts `scripts/dev.ps1` (Windows) e `scripts/dev.sh` (Unix) com auto-start do Docker
- [x] `docs/dev-guide.md` — guia de desenvolvimento local
- [x] `docker-compose.yml` — curl adicionado ao Dockerfile para healthcheck

## Sprint 15 — Segurança: Sessão + Timeout de Inatividade

- [x] Token de sessão movido de `localStorage` para `sessionStorage`
- [x] Race condition no logout corrigida (`await logout()` antes do redirect)
- [x] Login page nunca auto-redireciona (sempre exige credenciais)
- [x] InactivityTracker — timeout de 15 minutos com toast de warning
- [x] Testes atualizados (mock sessionStorage)

## Sprint 16 — Calendário Financeiro: Bloqueio Visual + Validação Inline

- [x] Datas futuras desabilitadas no calendário (`disabled={{ after: new Date() }}`)
- [x] Validação inline ao selecionar data (erro aparece antes do submit)
- [x] Mensagem clara: redireciona o usuário para Previsão de Caixa

## Sprint 17 — Novo Usuário Seed: Laura Peixoto

- [x] Adicionado `laura.peixoto` ao `DataSeeder.cs` (Admin/SuperAdmin, Lucraí, senha `123`)
- [x] `docs/dev-guide.md` atualizado com o novo usuário

## Sprint 18 — Segurança Multi-Tenant + Bug de Configurações

- [x] SettingsController: PUT não retorna mais 404 quando não existe CompanySettings
- [x] LogoUrl: MaxLength 500 → 2048 (alinhado com validação)
- [x] Frontend: assinatura só salva se nomeResponsavel e cargo preenchidos
- [x] ITenantContext: serviço scoped com dados do tenant (Company, UserName, UserId, Plan)
- [x] TenantContextMiddleware: agora também seta ITenantContext a partir do JWT
- [x] LucraiDbContext: HasQueryFilter aplicado em todas as 23 entidades com campo Company
- [x] UsersController + UserRepository: todos os endpoints filtram por empresa
- [x] AuditController.GetByEntity: escopo por empresa adicionado
- [x] Todos os `FindAsync(id)` substituídos por `FirstOrDefaultAsync` (14 repositórios)
- [x] ContasController.GetAll mantido como admin-only (CompanyRegistration não tem Company)

## Sprint 19 — Correção Crítica: ApplyTenantFilters Nunca Aplicava

- [x] Removido guard `if (string.IsNullOrEmpty(CurrentCompany)) return;` em ApplyTenantFilters
- [x] HasQueryFilter alterado para `CurrentCompany == null || entity.Company == CurrentCompany`
- [x] ReciboRepository: GetByIdAsync/DeleteAsync/GetByLancamentoIdAsync com company filter
- [x] InsumoRepository: GetByIdAsync/DeleteAsync com company filter
- [x] PricingRepository: GetByIdAsync/DeleteAsync com company filter
- [x] DocumentoRepository: GetByIdAsync/MoveToTrashAsync/RestoreFromTrashAsync/PermanentDeleteAsync/GetTrashItemAsync com company filter
- [x] DocumentoLogRepository: GetByDocumentoAsync com company filter
- [x] Controllers: fetch-then-verify removido (redundante com filtro no repositório)

## Sprint 20 — Componente DatePicker Unificado

- [x] Criado `src/components/ui/date-picker.tsx` — componente reutilizável Popover+Calendar
- [x] transaction-form.tsx: inline Popover+Calendar → DatePicker
- [x] recibo-form.tsx: `<Input type="date">` → DatePicker
- [x] cash-forecast/page.tsx: ambos os date inputs → DatePicker
- [x] documentos/conferencia/page.tsx: `<Input type="date">` → DatePicker
- [x] Removidos states e imports de Popover/Calendar/CalendarIcon não utilizados

## Pendentes

- [ ] Onboarding interativo para novos usuários
- [ ] Backup e restauração dos dados
- [ ] Exportação para PDF
- [ ] Modo escuro programável (agendado)
