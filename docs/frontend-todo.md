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
- [ ] `useDocumentos.ts` — migrar de Dexie para API

## Testes

### Testes Unitários (Vitest + RTL)

- [ ] Adaptar testes existentes para mockar API (substituir Dexie)
- [ ] Testar hooks (useDadosFiltrados, useAlertsCount)
- [ ] Testar utils (máscaras, formatação)

### Testes E2E (Playwright)

- [ ] Fluxo: Login → Dashboard → ver indicadores
- [ ] Fluxo: Criar transação → ver no financeiro
- [ ] Fluxo: Criar previsão → marcar como recebida
- [ ] Fluxo: Excluir → restaurar da lixeira
- [ ] Fluxo: Gerenciar categorias

## Pendências Gerais

- [ ] Página inicial/landing page antes do login
- [ ] Onboarding interativo para novos usuários
- [ ] Backup e restauração dos dados
- [ ] Exportação para PDF
- [ ] Modo escuro programável (agendado)

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
| Integração com API | 6 | 2 |
| Testes Unitários | 0 | 3 |
| Testes E2E | 0 | 5 |
| Pendências Gerais | 0 | 5 |
| **Total** | **98** | **15** |
