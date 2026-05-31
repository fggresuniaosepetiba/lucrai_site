# LUCRAÍ Core — Roadmap

## Fase 1: MVP ✅ (Atual)

### Funcionalidades Concluídas

- [x] Autenticação local com controle de sessão (localStorage)
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
- [x] 3 temas visuais (Normal, Dark Mega, Clean)
- [x] Sidebar colapsável com navegação completa
- [x] Multiempresa: dados segregados por company
- [x] Suporte a datas retroativas ilimitadas no financeiro
- [x] Validação de datas futuras na previsão de caixa (máx 10 anos)
- [x] Bloqueio de datas absurdas (< 1900)
- [x] Responsividade dos cards financeiros para valores milionários

### Funcionalidades Pendentes (MVP)

- [ ] Testes automatizados (unitários e de integração)
- [ ] Página inicial (landing page) do produto
- [ ] Onboarding interativo para novos usuários
- [ ] Backup e restauração dos dados do IndexedDB

## Fase 2: Pós-MVP 🚀

- [ ] Exportação para PDF (relatórios e extratos)
- [ ] Impressão de relatórios com formatação profissional
- [ ] Personalização de cores e branding por empresa
- [ ] Múltiplas contas bancárias e carteiras
- [ ] Conciliação bancária manual
- [ ] Relatório de Fluxo de Caixa (DRE simplificado)
- [ ] Gráfico de evolução patrimonial
- [ ] Notificações no navegador (lembretes de contas a pagar/receber)
- [ ] Página de extrato detalhado com filtros avançados
- [ ] Upload de comprovantes e anexos por transação
- [ ] Modo escuro programável (agendado)

## Fase 3: Inteligência Financeira 📊

- [ ] Métricas financeiras avançadas (índices de liquidez, endividamento)
- [ ] Alertas inteligentes (saldo negativo projetado, despesas acima da média)
- [ ] Projeção de saldo futuro com base em sazonalidade
- [ ] Orçamento mensal/anual com comparação realizado vs orçado
- [ ] Centro de custos por departamento/projeto
- [ ] Rateio de despesas entre centros de custo
- [ ] Indicador de saúde financeira aprimorado com mais variáveis
- [ ] Análise de tendências (comparativo mensal/anual)

## Fase 4: CFO Digital 🤖

- [ ] Recomendações automáticas de economia
- [ ] Identificação de gastos recorrentes e assinaturas
- [ ] Cenários "what-if" (simulação de decisões financeiras)
- [ ] Relatório executivo mensal automatizado
- [ ] Plano de ação baseado em indicadores
- [ ] Dashboard personalizável por papel de usuário
- [ ] Meta de resultados com acompanhamento visual
- [ ] Ciclo financeiro completo (prazo médio de recebimento/pagamento)

## Fase 5: IA Financeira 🧠

- [ ] Categorização automática de transações por IA
- [ ] Detecção de anomalias e fraudes
- [ ] Insights preditivos de fluxo de caixa
- [ ] Reconhecimento de padrões de gastos
- [ ] Sugestão inteligente de categoria baseada em histórico
- [ ] Previsão de receitas com base em sazonalidade e tendências
- [ ] Análise de sentimento financeiro da empresa
- [ 】 Assistente virtual financeiro em linguagem natural
