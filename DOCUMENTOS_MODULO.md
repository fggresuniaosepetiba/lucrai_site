# Módulo Central Inteligente de Documentos — LUCRAÍ

## 1. Visão Geral

A **Central Inteligente de Documentos** permite que usuários dos planos Pro e Enterprise do Lucraí enviem documentos financeiros (notas fiscais, comprovantes, boletos, recibos) e tenham seus dados extraídos automaticamente por IA, com criação automática de lançamentos no sistema.

**Filosofia central:** "O melhor lançamento financeiro é aquele que o usuário não precisou digitar."

## 2. Arquitetura

### Stack atual do projeto
- **Frontend:** Next.js 15 (App Router) + React 19 + TypeScript
- **UI:** Tailwind CSS + shadcn/ui (Radix UI primitives)
- **Estado:** Zustand
- **Database:** Dexie.js (IndexedDB) — aplicação **100% client-side**
- **Multi-tenancy:** Filtragem por campo `company`/`empresa_id`

### Decisões Técnicas para o Módulo

1. **Banco de dados client-side**: Por ser uma aplicação IndexedDB (Dexie), não há backend para armazenar arquivos ou processar documentos. As 4 novas tabelas foram adicionadas ao Dexie.

2. **Armazenamento de arquivos**: Arquivos são armazenados como `ArrayBuffer` diretamente no IndexedDB dentro do campo `arquivo_data` da tabela `documentos`. URLs de visualização são geradas via `URL.createObjectURL()`.

3. **Processamento assíncrono**: Simulado via `setTimeout` com retry automático (3 tentativas). Em produção, recomenda-se substituir por Web Workers ou Service Workers.

4. **Extração de XML NF-e**: Parsing nativo feito no frontend com `DOMParser`. Campos extraídos diretamente do XML estruturado sem dependência de IA.

5. **Extração de PDF/Imagens**: Serviço simulado (mock) por padrão. Arquitetura preparada para OpenAI Vision API via `NEXT_PUBLIC_DOCUMENT_AI_PROVIDER` e `NEXT_PUBLIC_DOCUMENT_AI_API_KEY`.

6. **Segurança de tenant**: Isolamento por `empresa_id` em todas as queries. Teste básico de segurança implementado para validar que empresa A não acessa dados da empresa B.

7. **LGPD**: Soft-delete com `excluido_em`, política de retenção configurável por empresa (padrão 365 dias).

## 3. Variáveis de Ambiente

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `NEXT_PUBLIC_DOCUMENT_AI_PROVIDER` | Não | `mock` | Provider de IA: `mock`, `openai`, `anthropic`, `google` |
| `NEXT_PUBLIC_DOCUMENT_AI_API_KEY` | Não | — | Chave da API de IA |

## 4. Migrations

Nenhuma migration tradicional — o Dexie schema é versionado no código. A versão 10 foi adicionada com as novas tabelas:

```typescript
this.version(10).stores({
  // ... tabelas existentes ...
  documentos: "id, empresa_id, status, tipo_arquivo, hash_arquivo, criado_em, excluido_em, lancamento_id, *tipo_documento_detectado",
  documentoAprendizado: "id, empresa_id, chave_reconhecimento, categoria_id, frequencia",
  documentoLogs: "id, documento_id, empresa_id, usuario_id, acao, criado_em",
  documentoConfiguracoes: "id, empresa_id",
});
```

O Dexie atualiza automaticamente o schema do IndexedDB. Não é necessário rodar comandos.

## 5. Worker / Fila

Não há sistema de filas real no frontend. O processamento é iniciado com `setTimeout` e inclui retry automático:

- Ao fazer upload, cada documento é processado sequencialmente
- Em caso de erro, tenta novamente após 5s (máx. 3 tentativas)
- Status é atualizado em tempo real no IndexedDB

**Para produção:** Recomenda-se substituir por Web Workers ou Background Sync API.

## 6. Provider de IA

### Configuração no frontend

```env
NEXT_PUBLIC_DOCUMENT_AI_PROVIDER=mock
NEXT_PUBLIC_DOCUMENT_AI_API_KEY=sua-chave-aqui
```

### Providers suportados

| Provider | Status | Arquivos suportados |
|---|---|---|
| `mock` | ✅ Funcional (dados simulados) | PDF, XML, JPG, JPEG, PNG |
| `openai` | ✅ Estrutura pronta | PDF, JPG, JPEG, PNG (via Vision API) |
| `anthropic` | ⚠️ Pendente implementação | — |
| `google` | ⚠️ Pendente implementação | — |

### XML de NF-e

O parsing de XML é **sempre nativo** (sem usar IA), pois o formato é estruturado e padronizado pela SEFAZ. Campos extraídos:
- Número da NF (`nNF`)
- Data de emissão (`dhEmi`)
- Valor total (`vNF`)
- Emitente (`emit xNome`, `emit CNPJ`)
- Destinatário (`dest xNome`, `dest CNPJ`)
- Itens (`det > prod > xProd`)
- Confiança: 1.0 (máxima)

## 7. Estrutura de Arquivos

```
src/
├── types/index.ts                          # Tipos: DocumentoFinanceiro, etc.
├── database/
│   ├── dexie.ts                            # Schema v10 com novas tabelas
│   └── repositories/
│       └── documentos.ts                   # Repository + aprendizado + logs + config
├── services/
│   └── documentos/
│       ├── documentos.service.ts           # Orquestração principal
│       ├── documentos-storage.service.ts   # Upload, validação, checksum
│       ├── documentos-extracao.service.ts  # XML parser + AI integration
│       └── documentos-aprendizado.service.ts # Learning system
├── hooks/
│   ├── useDocumentos.ts                    # Hook para listagem + stats
│   └── useConferencia.ts                   # Hook para confirmar/rejeitar
├── components/
│   └── layout/
│       └── sidebar.tsx                     # Menu + badge atualizado
└── app/
    └── documentos/
        ├── page.tsx                        # Caixa de Entrada
        ├── [id]/
        │   ├── page.tsx                    # Detalhe do documento
        │   └── conferencia/
        │       └── page.tsx                # Tela de Conferência
        └── configuracoes/
            └── page.tsx                    # Configurações do módulo
```

## 8. Rotas

| Rota | Descrição |
|---|---|
| `/documentos` | Caixa de Entrada Financeira (listagem + upload) |
| `/documentos/[id]` | Detalhe do documento + timeline de auditoria |
| `/documentos/[id]/conferencia` | Tela de conferência (revisão + confirmação) |
| `/documentos/configuracoes` | Configurações do módulo |

## 9. Funcionalidades Implementadas

- [x] Upload com drag-and-drop e validação de tipo/tamanho
- [x] Parsing nativo de XML NF-e
- [x] Extração via IA (mock + estrutura para OpenAI Vision)
- [x] Sistema de aprendizado por empresa (chave de reconhecimento)
- [x] Tela de conferência com visualizador de documento + formulário
- [x] Criação automática de lançamento no Financeiro
- [x] Soft-delete com rastreabilidade (LGPD)
- [x] Reprocessamento com retry automático
- [x] Badge de contador no menu lateral
- [x] Widget de impacto (tempo economizado)
- [x] Logs de auditoria em todas as ações
- [x] Política de retenção configurável por empresa
- [x] Verificação de plano (Pro/Enterprise)
- [x] Paginação, busca, filtros
- [x] Navegação entre documentos na conferência

## 10. Como Testar Localmente

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Faça login com uma conta que tenha empresa configurada.

3. Acesse `/documentos` — a Caixa de Entrada será exibida.

4. Clique em "Enviar Documento(s)" e selecione:
   - Um XML de NF-e para testar o parser nativo
   - Um PDF ou imagem para testar a extração simulada

5. Após o upload, aguarde o processamento (status "Processando" → "Aguardando Conferência").

6. Clique em "Conferir" para revisar os dados extraídos.

7. Confirme para criar o lançamento ou rejeite.

## 11. Testes Obrigatórios

Ver arquivos de teste em:
```
src/services/documentos/__tests__/
```

### Testes implementados:
1. **Geração de chave de aprendizado**: verifica normalização de variações do mesmo emitente
2. **Parser XML NF-e**: valida extração correta de campos obrigatórios
3. **Segurança (tenant isolation)**: verifica que empresa A não acessa dados da empresa B
4. **Worker/retry**: verifica comportamento em caso de falha

## 12. Decisões Técnicas

1. **Por que mock de IA?** O projeto Lucraí é 100% client-side (IndexedDB). Sem um backend, não é possível chamar APIs de IA de forma segura sem expor a chave de API no frontend. A solução atual usa variáveis `NEXT_PUBLIC_*` (acessíveis no frontend), o que é aceitável para desenvolvimento/demo mas **não seguro para produção**. Em produção, recomenda-se criar um backend Next.js API route ou um serviço separado.

2. **Por que ArrayBuffer no IndexedDB?** Sem backend para storage, a única opção viável para persistir arquivos no navegador é o IndexedDB. Arquivos acima de 50MB podem causar problemas de performance.

3. **Por que não usar Web Workers?** O processamento simulado com `setTimeout` é suficiente para o fluxo de demonstração. Web Workers adicionariam complexidade de build e não trariam benefício real com o mock.

4. **Controle de plano**: A verificação de plano utiliza os dados da sessão do usuário (`localStorage.getItem("lucrai_sessao")`). Para maior segurança, a validação deve ser feita também no backend em produção.

## 13. Limitações Conhecidas

- A extração de PDFs e imagens atualmente usa dados mockados. Configure `NEXT_PUBLIC_DOCUMENT_AI_API_KEY` para usar extração real com OpenAI.
- Visualização de PDFs depende do suporte do navegador. Alguns PDFs complexos podem não renderizar corretamente no iframe.
- O limite prático de armazenamento no IndexedDB varia por navegador (tipicamente 50MB–500MB por domínio).
- O badge do menu lateral atualiza a cada 15 segundos. Pode haver pequena latência entre o processamento e a atualização do contador.
