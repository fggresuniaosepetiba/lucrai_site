# LUCRAÍ Core — Decisões Técnicas

## Tecnologias Escolhidas

### Next.js 15 (App Router)

**Decisão:** Usar Next.js 15 com App Router em vez de React puro, Vite ou CRA.

**Motivo:**
- Roteamento baseado em arquivos (sem configurar react-router)
- Suporte nativo a layouts aninhados
- Geração de páginas estáticas no build (SSG) sem custo de servidor
- Ecosistema maduro com boa DX
- Possibilidade futura de migrar para SSR/API routes se necessário

**Trade-off:** A aplicação é client-side (CSR), então o SSR/SSG do Next.js não é totalmente aproveitado. Porém, a estrutura de pastas, o roteamento App Router e o build `output: standalone` (para Docker) valem o custo.

### Dexie.js (IndexedDB) — ✅ Removido

**Decisão original (MVP):** Usar IndexedDB via Dexie.js para persistência local 100% offline.

**Status atual:** ⚠️ **Decisão superada.** O Dexie foi **completamente removido** nas sprints 9–11. Todo o armazenamento foi migrado para o backend `.NET 10 + PostgreSQL` via API REST, com a camada de `api-repositories` no frontend. Não há nenhuma dependência de `dexie` no `package.json` nem código IndexedDB em `src/`.

**Motivo da remoção:**
- Dados ficavam presos no navegador e sem sincronização entre dispositivos
- Perda de dados do navegador = perda total
- A necessidade de multi-tenant e colaboração exigiu persistência centralizada

### Zustand 5

**Decisão:** Usar Zustand em vez de Redux, Context API ou Jotai.

**Motivo:**
- API minimalista (menos boilerplate que Redux)
- Sem providers (ao contrário de Context API)
- Performance superior a Context para atualizações frequentes
- Persistência manual (auth em `sessionStorage`, tema/sidebar em `localStorage`) — sem `persist` middleware
- Bundle pequeno (~1KB)

### shadcn/ui + Radix UI

**Decisão:** Usar shadcn/ui como biblioteca de componentes baseada em Radix UI em vez de Material UI, Ant Design ou Chakra.

**Motivo:**
- Componentes acessíveis (Radix UI) — suporte a WAI-ARIA
- Estilização com Tailwind — sem conflitos de CSS-in-JS
- Cópia local dos componentes — controle total sobre o código
- Personalização ilimitada — sem fighting com o framework
- Bundle menor — apenas os componentes usados

### Recharts

**Decisão:** Usar Recharts para gráficos em vez de Chart.js, D3.js ou Nivo.

**Motivo:**
- API declarativa e Reactiva (componentes JSX)
- Cobertura suficiente de tipos de gráfico (barra, pizza, linha)
- Boa integração com Tailwind e temas CSS
- Mais leve que D3.js para os casos de uso atuais

## Decisões de Arquitetura

### Aplicação Full-Stack

**Decisão:** Evoluir de MVP 100% client-side para **aplicação full-stack** com backend .NET 10 + PostgreSQL.

**Motivo:**
- Persistência centralizada (multi-tenant por empresa, dados não ficam presos no navegador)
- Autenticação segura (ASP.NET Identity + JWT com refresh token rotativo)
- Colaboração multi-usuário na mesma empresa
- Inteligência financeira computada no servidor (projeções, health score, alertas)
- A camada de `api-repositories` abstrai o backend, mantendo o frontend desacoplado

### Display ID (#001, #002)

**Decisão:** Implementar IDs sequenciais amigáveis separados dos UUIDs internos.

**Motivo:**
- UUIDs são ilegíveis para usuários
- #001, #002 são familiares e fáceis de referenciar
- Sequência independente por tabela (transactions vs forecasts)
- Facilita comunicação: "localize a previsão #015"

### Separação Realizado vs Previsto

**Decisão:** Manter tabelas e fluxos totalmente separados entre transações realizadas e previsões.

**Motivo:**
- Regras de negócio distintas (datas passadas vs futuras)
- Estados diferentes (previsto/recebido/pago/cancelado vs apenas realizado)
- Clareza conceitual para o usuário
- Facilita relatórios e indicadores segregados

### Valor por Extenso em Português

**Decisão:** Implementar função própria de conversão em vez de usar biblioteca externa.

**Motivo:**
- Controle total sobre o formato e regras gramaticais
- Suporte a bilhões (necessário para empresas de grande porte)
- Personalização: vírgulas entre grupos, "de reais", centavos
- Sem dependência adicional

### Validação em Duas Camadas

**Decisão:** Validar dados tanto no frontend (formulário — react-hook-form + zod) quanto no backend (FluentValidation — 35 validators).

**Motivo:**
- Impedir dados inválidos mesmo que o usuário manipule o DOM ou chame a API diretamente
- Proteção contra requisições malformadas/forjadas
- Consistência dos dados na fonte (backend)
- Mensagens de erro amigáveis no frontend + erro de validação no backend

### Abreviação Inteligente (Mi/Bi)

**Decisão:** Abreviar valores ≥ R$ 1.000.000 nos cards do dashboard.

**Motivo:**
- Dashboard executivo precisa de leitura rápida
- Valores milionários ocupam muito espaço visual
- Tooltip com valor completo mantém a precisão quando necessário
- Padrão de mercado (Mi = Milhões, Bi = Bilhões) seguindo finanças brasileiras

### Multi-tenancy por Filtros Globais

**Decisão:** Isolar dados por `Company` (tenant) e por `CreatedBy`/`UserId` (usuário) via `HasQueryFilter` do EF Core em 23 entidades, com `TenantContextMiddleware` extraindo o tenant do JWT.

**Motivo:**
- Isolamento garantido no nível do banco (toda query é filtrada)
- Sem risco de vazamento entre empresas/usuários por esquecimento em um controller
- Testado por `ReciboIsolationTests` (4 testes de isolamento)

### Autenticação JWT + Refresh Token Rotativo

**Decisão:** Usar ASP.NET Identity (PBKDF2) + JWT Bearer com refresh token opaco rotativo armazenado no banco (7 dias).

**Motivo:**
- Rotação revoga o token anterior a cada uso (mitiga vazamento)
- Sessão stateless para a API + controle de revogação server-side
- `sessionStorage` no frontend garante logout ao fechar a aba

### OCR e IA no Frontend

**Decisão:** Executar extração de dados de documentos (PDF, imagem, NF-e XML) no **frontend** com pdfjs-dist, tesseract.js (pt-BR) e provedores de IA (OpenAI Vision, Gemini). O backend armazena os campos extraídos e orquestra o fluxo de conferência.

**Motivo:**
- Provedores de IA de visão via chamada direta (sem custo/processamento no servidor)
- Parser NF-e XML local com DOMParser (sem dependência server-side)
- Backend recebe apenas o resultado validado pelo usuário na conferência

## Decisões Pendentes

### Backup e Restauração
Ainda não implementado (server-side). Os dados agora vivem no PostgreSQL (Neon/Railway), que possui backups gerenciados.

### Testes — ✅ Concluído
87 testes xUnit (backend), 7 suítes Vitest + 6 specs Playwright (frontend), com CI em GitHub Actions (3 jobs).

### Hash de Senhas — ✅ Concluído
Senhas com hash PBKDF2 via `PasswordHasher` do ASP.NET Identity (nunca armazenadas em texto plano).

### PWA
O aplicativo poderia se beneficiar de Service Workers para instalação como PWA e melhor experiência offline. Decisão adiada para fase Pós-MVP.
