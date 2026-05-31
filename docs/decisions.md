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

**Trade-off:** A aplicação é 100% client-side, então o SSR/SSG do Next.js não é totalmente aproveitado. Porém, a estrutura de pastas e o roteamento valem o custo.

### Dexie.js (IndexedDB)

**Decisão:** Usar IndexedDB via Dexie.js em vez de SQLite (via sql.js), LocalStorage ou uma API remota.

**Motivo:**
- **100% offline** — sem dependência de servidor
- **Dados persistentes** — ao contrário de LocalStorage (limite de 5-10MB)
- **Consultas indexadas** — Dexie permite índices, filtros e ordenação eficientes
- **API simples** — similar a um ORM, com suporte a Promises
- **Sem backend** — elimina custos de infraestrutura e manutenção

**Trade-off:** Dados ficam presos no navegador. Não há sincronização entre dispositivos. Perda de dados do navegador = perda total. Futuramente será necessário implementar backup/restore e sincronização.

### Zustand 5

**Decisão:** Usar Zustand em vez de Redux, Context API ou Jotai.

**Motivo:**
- API minimalista (menos boilerplate que Redux)
- Sem providers (ao contrário de Context API)
- Performance superior a Context para atualizações frequentes
- Persistência integrada com `persist` middleware
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

### Aplicação 100% Client-side

**Decisão:** Não implementar backend no MVP.

**Motivo:**
- MVP focado em validação do produto e usabilidade
- Elimina custos de servidor, banco remoto e DevOps
- Desenvolvimento mais rápido sem integração API
- Usuário tem controle total dos dados

**Consequência futura:** Será necessário implementar sincronização e backup. A arquitetura atual (repositories) facilita a adição de uma camada remota no futuro.

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

**Decisão:** Validar dados tanto no frontend (formulário) quanto no repositório (backend).

**Motivo:**
- Impedir dados inválidos mesmo que o usuário manipule o DOM
- Proteção contra chamadas diretas ao Dexie via console
- Consistência dos dados na fonte (repositório)
- Mensagens de erro amigáveis no frontend + lançamento de erro no backend

### Abreviação Inteligente (Mi/Bi)

**Decisão:** Abreviar valores ≥ R$ 1.000.000 nos cards do dashboard.

**Motivo:**
- Dashboard executivo precisa de leitura rápida
- Valores milionários ocupam muito espaço visual
- Tooltip com valor completo mantém a precisão quando necessário
- Padrão de mercado (Mi = Milhões, Bi = Bilhões) seguindo finanças brasileiras

## Decisões Pendentes

### Backup e Sincronização
Ainda não definido: implementar sincronização via WebDAV, arquivo JSON de exportação, ou API remota. A decisão depende da demanda dos usuários após o MVP.

### Testes
Sem testes automatizados no MVP. O plano é adicionar testes unitários (Vitest) e de integração (Playwright) na fase Pós-MVP.

### Hash de Senhas
Atualmente as senhas são armazenadas em texto plano no IndexedDB. Isso é aceitável porque o banco é local (não há ataque remoto), mas será necessário implementar hash (bcrypt ou similar) se houver sincronização remota.

### PWA
O aplicativo poderia se beneficiar de Service Workers para instalação como PWA e melhor experiência offline. Decisão adiada para fase Pós-MVP.
