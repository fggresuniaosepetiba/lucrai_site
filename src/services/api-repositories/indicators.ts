import { api } from "@/services/api";

export const IndicatorsRepositoryApi = {
  async getRunway() {
    return api.get<{ meses: number; dias: number; status: string; label: string }>("/api/dashboard/runway");
  },

  async getBreakEven() {
    return api.get<{ valor: number; percentualAtingido: number; acima: boolean }>("/api/dashboard/breakeven");
  },

  async getHealth() {
    return api.get<{ score: number; label: string; cor: string; bg: string; subIndicadores: { nome: string; score: number; tooltip: string }[] }>("/api/dashboard/health");
  },

  async getSparkline(months = 12) {
    return api.get<{ mes: string; valor: number }[]>(`/api/dashboard/sparkline?months=${months}`);
  },

  async getProjecoes(horizonte: number) {
    return api.post("/api/dashboard/projection", { horizonte });
  },

  async getAuditLogs() {
    return api.get<Record<string, unknown>[]>("/api/audit");
  },
};
