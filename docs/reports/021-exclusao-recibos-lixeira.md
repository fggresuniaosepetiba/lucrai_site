# Sprint 21 — Exclusão de Recibos com Lixeira (Soft-Delete)

## Objetivo

Implementar exclusão de recibos cancelados com envio para lixeira e retenção de 30 dias, seguindo o fluxo: Ativo → Cancelar (definitivo) → Excluir (move para lixeira) → Lixeira (restaurar ou excluir permanentemente).

## Mudanças

### Backend

#### Entity (`Recibo.cs`)
- `ExcluidoEm` (`DateTime?`) — quando foi movido para lixeira
- `ExcluidoPor` (`string?`) — nome do usuário que excluiu
- `ExpiracaoEm` (`DateTime?`) — = `ExcluidoEm + 30 dias`

#### DbContext + Migration (`AddSoftDeleteToRecibo`)
- Configuração dos 3 novos campos
- Índice `IX_Recibos_Company_ExcluidoEm`

#### IReciboRepository
- `DeleteAsync` ganha parâmetro `deletedBy` opcional
- `GetTrashAsync(company)` — recibos na lixeira
- `GetByIdIncludingDeletedAsync(id, company)` — busca sem filtro de exclusão
- `RestoreFromTrashAsync(recibo)` — limpa campos de soft-delete
- `PermanentDeleteAsync(recibo)` — hard-delete
- `CleanupTrashAsync()` — remove expirados

#### ReciboRepository
- `GetAllAsync`/`GetByIdAsync` filtram `ExcluidoEm == null`
- `DeleteAsync` faz soft-delete (seta ExcluidoEm, ExcluidoPor, ExpiracaoEm = now + 30d)

#### RecibosController

| Método | Rota | Comportamento |
|---|---|---|
| `DELETE` | `/api/recibos/{id}` | 400 se não cancelado; soft-delete se cancelado |
| `GET` | `/api/recibos/trash` | Lista recibos na lixeira |
| `POST` | `/api/recibos/{id}/restore` | Restaura (volta a Cancelado) |
| `DELETE` | `/api/recibos/{id}/permanent` | Hard-delete |

### Frontend

#### Types
- `ApiRecibo` + `Receipt`: campos `excluidoEm`, `excluidoPor`, `expiracaoEm`

#### API Service (`recibos.ts`)
- `getTrash()`, `restore(id)`, `permanentDelete(id)`

#### RecibosList
- Prop `onDelete`; menu "Excluir" aparece apenas para recibos cancelados

#### Recibos Page
- Modal de confirmação ao excluir ("Tem certeza que deseja excluir este recibo? Ele será movido para a lixeira e após 30 dias será excluído automaticamente.")

#### Trash Page
- Nova aba "Recibos" (ao lado de "Financeiro" e "Documentos")
- Card com: número, tipo (recebimento/pagamento), valor, pagador/recebedor, dias restantes
- Botões: Restaurar (volta a Cancelado), Excluir Permanentemente
- Confirmation dialogs para ambas as ações

### Arquivos modificados

#### Backend (7 arquivos)
- `backend/src/Lucrai.Core/Entities/Recibo.cs` (+3 linhas)
- `backend/src/Lucrai.Core/DTOs/Recibos/ReciboDtos.cs` (+3 linhas)
- `backend/src/Lucrai.Core/Interfaces/IReciboRepository.cs` (+6 linhas, −0)
- `backend/src/Lucrai.Infrastructure/Data/LucraiDbContext.cs` (+4 linhas)
- `backend/src/Lucrai.Infrastructure/Repositories/ReciboRepository.cs` (+62 linhas, −4)
- `backend/src/Lucrai.API/Controllers/RecibosController.cs` (+80 linhas, −6)
- `backend/src/Lucrai.Infrastructure/Migrations/20260724021314_AddSoftDeleteToRecibo.cs` (+59 linhas)

#### Frontend (5 arquivos)
- `src/types/api.ts` (+3 linhas)
- `src/types/index.ts` (+3 linhas)
- `src/services/api-repositories/recibos.ts` (+16 linhas)
- `src/components/recibos/recibos-list.tsx` (+9 linhas)
- `src/app/recibos/page.tsx` (+67 linhas, −2)
- `src/app/trash/page.tsx` (+214 linhas, −6)

## Observações

- Cancelamento permanece irreversível (só é possível excluir recibos já cancelados)
- Lixeira compartilhada: a página `/trash` ganhou uma 3ª aba "Recibos"
- Usamos soft-delete no próprio `Recibo`, sem criar entidade ou tabela separada
- O `ReciboRepository.GetByIdIncludingDeletedAsync` usa `.IgnoreQueryFilters()` para buscar items deletados (necessário para restore/permanent-delete)
- `CleanupTrashAsync` pronto para ser chamado por job agendado (não implementado nesta sprint)
