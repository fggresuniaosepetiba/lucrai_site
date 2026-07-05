import { api } from "@/services/api";
import type {
  ApiRunwayResponse,
  ApiBreakEvenResponse,
  ApiHealthResponse,
  ApiDashboardAlert,
  ApiSparklinePoint,
  ApiNotaCFOResponse,
  ApiAcaoRecomendada,
} from "@/types/api";

export const DashboardRepositoryApi = {
  async getRunway(): Promise<ApiRunwayResponse> {
    return api.get<ApiRunwayResponse>("/api/dashboard/runway");
  },

  async getBreakEven(): Promise<ApiBreakEvenResponse> {
    return api.get<ApiBreakEvenResponse>("/api/dashboard/breakeven");
  },

  async getHealth(): Promise<ApiHealthResponse> {
    return api.get<ApiHealthResponse>("/api/dashboard/health");
  },

  async getAlerts(): Promise<ApiDashboardAlert[]> {
    return api.get<ApiDashboardAlert[]>("/api/dashboard/alerts");
  },

  async getSparkline(months: number = 12): Promise<ApiSparklinePoint[]> {
    return api.get<ApiSparklinePoint[]>(`/api/dashboard/sparkline?months=${months}`);
  },

  async getNotaCFO(): Promise<ApiNotaCFOResponse> {
    return api.get<ApiNotaCFOResponse>("/api/dashboard/nota-cfo");
  },

  async getRecommendedActions(): Promise<ApiAcaoRecomendada[]> {
    return api.get<ApiAcaoRecomendada[]>("/api/dashboard/recommended-actions");
  },

  async dismissAlert(alertId: string): Promise<void> {
    await api.post(`/api/dashboard/alerts/${alertId}/dismiss`);
  },

  async restoreAlert(alertId: string): Promise<void> {
    await api.post(`/api/dashboard/alerts/${alertId}/restore`);
  },

  async postProjection(
    horizonte: number,
    crescimentoReceita?: number,
    variacaoCustos?: number,
    novoCustoFixo?: number,
    despesaPontual?: number,
    despesaPontualMes?: number,
  ) {
    return api.post("/api/dashboard/projection", {
      horizonte,
      crescimentoReceita,
      variacaoCustos,
      novoCustoFixo,
      despesaPontual,
      despesaPontualMes,
    });
  },
};
