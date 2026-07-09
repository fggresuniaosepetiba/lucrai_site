import { api } from "@/services/api";
import type { ApiCashForecast, ApiForecastTotals } from "@/types/api";
import type { CashForecast } from "@/types";

function mapForecast(f: ApiCashForecast): CashForecast {
  return {
    id: f.id,
    displayId: f.displayId,
    type: f.type === "Income" ? "income" : "expense",
    description: f.description,
    amount: f.amount,
    category: f.category,
    expectedDate: f.expectedDate,
    status: f.status === "Predicted" ? "predicted"
      : f.status === "Received" ? "received"
      : f.status === "Paid" ? "paid"
      : "cancelled",
    notes: f.notes ?? undefined,
    company: f.company,
    createdAt: f.createdAt,
    updatedAt: f.updatedAt,
    cancelledReason: f.cancelledReason ?? undefined,
    cancelledAt: f.cancelledAt ?? undefined,
    cancelledBy: f.cancelledBy ?? undefined,
    isRecurring: f.isRecurring,
    recurrenceType: f.recurrenceType as CashForecast["recurrenceType"],
    recurrenceEndDate: f.recurrenceEndDate ?? undefined,
  };
}

export const CashForecastRepositoryApi = {
  async getAll(): Promise<CashForecast[]> {
    const data = await api.get<ApiCashForecast[]>("/api/forecasts");
    return data.map(mapForecast);
  },

  async getById(id: string): Promise<CashForecast | undefined> {
    try {
      const data = await api.get<ApiCashForecast>(`/api/forecasts/${id}`);
      return mapForecast(data);
    } catch (err) {
      console.error("cash-forecast.getById:", err);
      return undefined;
    }
  },

  async getByStatus(status: CashForecast["status"]): Promise<CashForecast[]> {
    const statusMap: Record<string, string> = {
      predicted: "Predicted",
      received: "Received",
      paid: "Paid",
      cancelled: "Cancelled",
    };
    const data = await api.get<ApiCashForecast[]>(`/api/forecasts/status/${statusMap[status]}`);
    return data.map(mapForecast);
  },

  async create(
    data: Omit<CashForecast, "id" | "displayId" | "createdAt" | "updatedAt" | "company">,
  ): Promise<CashForecast> {
    const created = await api.post<ApiCashForecast>("/api/forecasts", {
      type: data.type === "income" ? "Income" : "Expense",
      description: data.description,
      amount: data.amount,
      category: data.category,
      expectedDate: data.expectedDate,
      status: "Predicted",
      notes: data.notes,
      isRecurring: data.isRecurring ?? false,
      recurrenceType: data.recurrenceType ?? null,
      recurrenceEndDate: data.recurrenceEndDate ?? null,
    });
    return mapForecast(created);
  },

  async update(id: string, data: Partial<CashForecast>): Promise<void> {
    await api.put(`/api/forecasts/${id}`, {
      type: data.type ? (data.type === "income" ? "Income" : "Expense") : undefined,
      description: data.description,
      amount: data.amount,
      category: data.category,
      expectedDate: data.expectedDate,
      notes: data.notes,
      status: data.status ? (
        data.status === "predicted" ? "Predicted"
        : data.status === "received" ? "Received"
        : data.status === "paid" ? "Paid"
        : "Cancelled"
      ) : undefined,
      isRecurring: data.isRecurring,
      recurrenceType: data.recurrenceType,
      recurrenceEndDate: data.recurrenceEndDate,
    });
  },

  async delete(id: string, reason?: string): Promise<void> {
    const params = reason ? `?reason=${encodeURIComponent(reason)}` : "";
    await api.delete(`/api/forecasts/${id}${params}`);
  },

  async markAsReceived(id: string): Promise<void> {
    await api.post(`/api/forecasts/${id}/mark-as-received`);
  },

  async markAsPaid(id: string): Promise<void> {
    await api.post(`/api/forecasts/${id}/mark-as-paid`);
  },

  async markAsCancelled(id: string, reason?: string): Promise<void> {
    await api.post(`/api/forecasts/${id}/mark-as-cancelled`, reason ?? "");
  },

  async getTotals(): Promise<{ predictedIncomes: number; predictedExpenses: number; allIncomes: number; allExpenses: number }> {
    return api.get<ApiForecastTotals>("/api/forecasts/totals");
  },
};
