import { api } from "@/services/api";
import type { ApiTrashItem } from "@/types/api";
import type { DeletedTransaction } from "@/types";

function mapTrashItem(t: ApiTrashItem): DeletedTransaction {
  return {
    id: t.id,
    originalId: t.originalId,
    displayId: t.displayId,
    entryType: t.entryType as "transaction" | "forecast",
    type: t.type === "Income" ? "income" : "expense",
    value: t.value ?? undefined,
    categoryName: t.categoryName ?? undefined,
    description: t.description,
    date: t.date ?? undefined,
    amount: t.amount ?? undefined,
    category: t.category ?? undefined,
    expectedDate: t.expectedDate ?? undefined,
    notes: undefined,
    status: t.status as DeletedTransaction["status"],
    company: t.company,
    createdBy: t.createdBy ?? "",
    createdAt: t.deletedAt,
    updatedAt: t.deletedAt,
    deletedAt: t.deletedAt,
    reason: t.reason,
    restoreUntil: t.restoreUntil,
  };
}

export const TrashRepositoryApi = {
  async getAll(): Promise<DeletedTransaction[]> {
    const data = await api.get<ApiTrashItem[]>("/api/trash");
    return data.map(mapTrashItem);
  },

  async restore(id: string): Promise<void> {
    await api.post(`/api/trash/${id}/restore`);
  },

  async permanentlyDelete(id: string): Promise<void> {
    await api.delete(`/api/trash/${id}`);
  },

  async cleanup(): Promise<number> {
    const result = await api.post<{ removedCount: number }>("/api/trash/cleanup");
    return result.removedCount;
  },
};
