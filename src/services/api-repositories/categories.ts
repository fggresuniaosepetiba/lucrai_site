import { api } from "@/services/api";
import type { ApiCategory } from "@/types/api";
import type { Category, TransactionType } from "@/types";

function mapCategory(c: ApiCategory): Category {
  return {
    id: c.id,
    name: c.name,
    color: c.color,
    icon: c.icon,
    type: c.type === "Income" ? "income" : "expense",
    company: c.company,
    createdBy: c.createdBy,
    createdAt: c.createdAt,
  };
}

export const CategoryRepositoryApi = {
  async getAll(): Promise<Category[]> {
    const data = await api.get<ApiCategory[]>("/api/categories");
    return data.map(mapCategory);
  },

  async getByType(type: TransactionType): Promise<Category[]> {
    const apiType = type === "income" ? "Income" : "Expense";
    const data = await api.get<ApiCategory[]>(`/api/categories/type/${apiType}`);
    return data.map(mapCategory);
  },

  async create(data: { name: string; color: string; icon: string; type: TransactionType }): Promise<Category> {
    const created = await api.post<ApiCategory>("/api/categories", {
      name: data.name,
      color: data.color,
      icon: data.icon,
      type: data.type === "income" ? "Income" : "Expense",
    });
    return mapCategory(created);
  },

  async update(id: string, data: { name?: string; color?: string; icon?: string; type?: TransactionType }): Promise<void> {
    await api.put(`/api/categories/${id}`, {
      name: data.name,
      color: data.color,
      icon: data.icon,
      type: data.type ? (data.type === "income" ? "Income" : "Expense") : undefined,
    });
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/categories/${id}`);
  },

  async removeDuplicates(): Promise<number> {
    const result = await api.post<{ removedCount: number }>("/api/categories/remove-duplicates");
    return result.removedCount;
  },
};
