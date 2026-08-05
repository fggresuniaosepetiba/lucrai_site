# LUCRAÍ Core — Roadmap

## Fase 1: MVP (Atual)

### Funcionalidades Concluídas

- [x] Autenticação JWT + Refresh Token com rotação (backend .NET 10 + ASP.NET Identity)
- [x] Dashboard executivo com cards financeiros, gráficos e saúde da empresa
- [x] CRUD completo de transações financeiras (entradas/saídas)
- [x] Previsão de Caixa com criação, edição, recebimento, pagamento e cancelamento
- [x] Histórico de previsões (recebidas, pagas, canceladas)
- [x] Gerenciamento de categorias financeiras com criação, edição, exclusão
- [x] Detecção e remoção de categorias duplicadas
- [x] Relatório anual com separação realizado/previsto
- [x] Exportação de dados para CSV
- [x] Sistema de lixeira com expiração de 30 dias e restauração
- [x] Gerenciamento de usuários com 4 papéis (owner, admin, financial, viewer)
- [x] Configurações da empresa (logo, nome, cor primária, senha)
- [x] Display ID sequencial (#001, #002) para transações e previsões
- [x] Sistema de auditoria completo com log de ações
- [x] Valor por extenso automático em português (até bilhões)
- [x] Formatação de moeda brasileira (R$ 1.234,56) com máscara em tempo real
- [x] Abreviação inteligente de valores (R$ 1,5 Mi, R$ 2 Bi)
- [x] 2 temas visuais (Normal/Sistema, Dark Mega) — tema claro removido
- [x] Sidebar colapsável com navegação completa
- [x] Multiempresa: dados segregados por company + isolamento por usuário
- [x] Suporte a datas retroativas ilimitadas no financeiro
- [x] Validação de datas futuras na previsão de caixa (máx 10 anos)
- [x] Bloqueio de datas absurdas (< 1900)
- [x] Responsividade dos cards financeiros para valores milionários
- [x] Landing page institucional (13 seções)
- [x] Testes automatizados: 87 xUnit + 7 Vitest + 6 Playwright + CI (3 jobs)
- [x] Onboarding multi-etapa no cadastro (`/cadastro`)
- [x] Sessão segura: token em `sessionStorage` + timeout de inatividade (15 min)

### Funcionalidades Pendentes (MVP)

- [ ] Backup e restauração dos dados (server-side)

## Fase 2: Pós-MVP 🚀

- [ ] Exportação para PDF (relatórios e extratos) — recibo PDF já implementado (jsPDF)
- [ ] Impressão de relatórios com formatação profissional
- [x] Personalização de cores e branding por empresa (logo, cor primária)
- [x] Múltiplas contas bancárias (CRUD de contas)
- [ ] Conciliação bancária manual
- [x] Relatório de Fluxo de Caixa (DRE simplificado — módulo de indicadores)
- [x] Gráfico de evolução patrimonial (indicadores)
- [ ] Notificações no navegador (lembretes de contas a pagar/receber)
- [ ] Página de extrato detalhado com filtros avançados
- [x] Upload de comprovantes e anexos (módulo de documentos fiscais)
- [ ] Modo escuro programável (agendado)

## Fase 3: Inteligência Financeira 📊

- [x] Métricas financeiras avançadas (índices, endividamento, net debt, ROI/IRR/NPV)
- [x] Alertas inteligentes (6 tipos: saldo negativo, queda de margem, custos > receita, pico anômalo, inadimplência + insights)
- [x] Projeção de saldo futuro (12 meses, cenários)
- [ ] Orçamento mensal/anual com comparação realizado vs orçado
- [ ] Centro de custos por departamento/projeto
- [ ] Rateio de despesas entre centros de custo
- [x] Indicador de saúde financeira (score 0-100 com subindicadores)
- [x] Análise de tendências (comparativo mensal/anual)

## Fase 4: CFO Digital 🤖

- [x] Recomendações automáticas de economia (recommended-actions priorizadas)
- [ ] Identificação de gastos recorrentes e assinaturas
- [ ] Cenários "what-if" (simulação de decisões financeiras)
- [ ] Relatório executivo mensal automatizado
- [x] Plano de ação baseado em indicadores (nota CFO em linguagem natural)
- [ ] Dashboard personalizável por papel de usuário
- [ ] Meta de resultados com acompanhamento visual
- [x] Ciclo financeiro completo (aging de contas a pagar/receber, prazo médio)

## Fase 5: IA Financeira 🧠

- [x] Categorização assistida de documentos por IA (OpenAI Vision + Gemini no módulo de documentos)
- [ ] Detecção de anomalias e fraudes
- [ ] Insights preditivos de fluxo de caixa
- [ ] Reconhecimento de padrões de gastos
- [x] Sugestão de categoria baseada em histórico (aprendizado de documentos)
- [ ] Previsão de receitas com base em sazonalidade e tendências
- [ ] Análise de sentimento financeiro da empresa
- [ ] Assistente virtual financeiro em linguagem natural
