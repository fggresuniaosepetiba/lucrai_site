# Banco de Produção (Neon PostgreSQL)

Banco de dados PostgreSQL gerenciado via Neon em `ep-proud-base-aci4mfda.sa-east-1.aws.neon.tech`, utilizado pela aplicação .NET em produção. Contém tabelas do Identity (Users, Roles), Transactions, CashForecasts, DeletedItems, AuditLogs e CompanyRegistrations.

## [2026-07-16] Limpeza de registros órfãos de seed na produção

### Problema

O seed da aplicação (`DataSeeder.cs`) criou 5 registros de demonstração (`#001`–`#005`) associados ao usuário `joao.ribeiro` na empresa "Lucraí". Esses registros eram dados de demonstração sem valor real, ocupando os primeiros displayIds e impedindo a numeração limpa a partir de `#001`.

Além disso, o usuário `fellype.gabriel` (SuperAdmin) havia criado 2 registros reais (`#006`–`#007`) que foram excluídos via interface e já estavam corretamente na lixeira.

### Solução

Script SQL que move os 5 registros de seed da tabela `Transactions` para a tabela `DeletedItems` com:
- `DeletedReason = 'Registro orfao de seed'`
- `DeletedBy = 'system'`
- `RestoreUntil = NOW() + INTERVAL '30 days'` (mesma janela da exclusão por UI)
- Preservação completa dos dados originais (valor, categoria, descrição, data)

O script usa `gen_random_uuid()` para novos IDs da lixeira e uma `DO $$ ... END $$` block para iterar cada registro individualmente.

### Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `backend/scripts/move-seed-records-to-trash.sql` | Script executado (SQL documentado, execução via Node.js pg) |
| `backend/scripts/cleanup-other-user-transactions.sql` | Script auxiliar (template genérico — não executado) |

### Métricas

| Métrica | Valor |
|---------|-------|
| Registros de seed movidos | 5 (`#001` → `#005`) |
| **Registros removidos da Transactions** | **5 de 5 (100%)** |
| Registros na lixeira (pós-cleanup) | 7 (5 seed + 2 exclusões UI) |
| **Tabela Transactions (pós-cleanup)** | **0 registros** |
| **Próximo displayId disponível** | **#001** |
| Método de execução | Node.js pg (conexão direta ao Neon) |

### Commits

- `b246cb1` — Script `cleanup-other-user-transactions.sql` (template)
- `6584d66` — Script `move-seed-records-to-trash.sql` (executado)
