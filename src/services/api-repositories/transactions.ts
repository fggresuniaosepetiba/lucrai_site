import { api } from "@/services/api";
import type { ApiTransaction, ApiSummary, ApiBalance } from "@/types/api";
import type { Transaction } from "@/types";

function mapTransaction(t: ApiTransaction): Transaction {
  return {
    id: t.id,
    displayId: t.displayId,
    type: t.type === "Income" ? "income" : "expense",
    value: t.value,
    categoryId: t.categoryId,
    categoryName: t.categoryName,
    description: t.description,
    date: t.date,
    observation: t.observation ?? undefined,
    company: t.company,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

export const TransactionRepositoryApi = {
  async getAll(): Promise<Transaction[]> {
    const data = await api.get<ApiTransaction[]>("/api/transactions");
    return data.map(mapTransaction);
  },

  async getById(id: string): Promise<Transaction | undefined> {
    try {
      const data = await api.get<ApiTransaction>(`/api/transactions/${id}`);
      return mapTransaction(data);
    } catch (err) {
      console.error("transactions.getById:", err);
      return undefined;
    }
  },

  async getByType(type: "income" | "expense"): Promise<Transaction[]> {
    const data = await api.get<ApiTransaction[]>(`/api/transactions/type/${type === "income" ? "Income" : "Expense"}`);
    return data.map(mapTransaction);
  },

  async getByMonth(year: number, month: number): Promise<Transaction[]> {
    const data = await api.get<ApiTransaction[]>(`/api/transactions/month/${year}?month=${month}`);
    return data.map(mapTransaction);
  },

  async create(
    data: Omit<Transaction, "id" | "displayId" | "createdAt" | "updatedAt" | "company">,
  ): Promise<Transaction> {
    const created = await api.post<ApiTransaction>("/api/transactions", {
      type: data.type === "income" ? "Income" : "Expense",
      value: data.value,
      categoryId: data.categoryId,
      categoryName: data.categoryName,
      description: data.description,
      date: data.date,
      observation: data.observation,
    });
    return mapTransaction(created);
  },

  async update(id: string, data: Partial<Transaction>): Promise<void> {
    await api.put(`/api/transactions/${id}`, {
      type: data.type ? (data.type === "income" ? "Income" : "Expense") : undefined,
      value: data.value,
      categoryId: data.categoryId,
      categoryName: data.categoryName,
      description: data.description,
      date: data.date,
      observation: data.observation,
    });
  },

  async delete(id: string, reason?: string): Promise<void> {
    const params = reason ? `?reason=${encodeURIComponent(reason)}` : "";
    await api.delete(`/api/transactions/${id}${params}`);
  },

  async getAllBalance(): Promise<{ incomes: number; expenses: number; balance: number }> {
    const data = await api.get<ApiBalance>("/api/transactions/balance");
    return data;
  },

  async getSummary(year: number, month: number): Promise<{ incomes: number; expenses: number; balance: number }> {
    const data = await api.get<ApiSummary>(`/api/transactions/summary/${year}?month=${month}`);
    return data;
  },

  async getYearlySummary(year: number): Promise<{ incomes: number; expenses: number; balance: number; total: number }> {
    const data = await api.get<ApiSummary & { total?: number }>(`/api/transactions/summary/yearly/${year}`);
    return { ...data, total: data.total ?? 0 };
  },
};
