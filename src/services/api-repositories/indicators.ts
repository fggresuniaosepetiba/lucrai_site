import { api } from "@/services/api";

export interface AccountsReceivableSummary {
  totalAReceber: number;
  vencido: number;
  aVencer30d: number;
  aVencer60d: number;
  aVencer90d: number;
  inadimplencia: number;
  prazoMedioRecebimento: number;
  totalContas: number;
}

export interface AccountsPayableSummary {
  totalAPagar: number;
  vencido: number;
  aVencer30d: number;
  aVencer60d: number;
  aVencer90d: number;
  prazoMedioPagamento: number;
  totalContas: number;
}

export interface DebtSummary {
  dividaTotal: number;
  dividaCurtoPrazo: number;
  dividaLongoPrazo: number;
  dividaLiquida: number;
  alavancagem: number;
  coberturaJuros: number;
  comprometimentoReceita: number;
  totalDividas: number;
}

export interface InvestmentSummary {
  totalInvestido: number;
  projetosAtivos: number;
  roiMedio: number | null;
  capEx: number;
}

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

  async getAccountsReceivableSummary() {
    return api.get<AccountsReceivableSummary>("/api/accounts-receivable/summary");
  },

  async getAccountsPayableSummary() {
    return api.get<AccountsPayableSummary>("/api/accounts-payable/summary");
  },

  async getDebtSummary() {
    return api.get<DebtSummary>("/api/debts/summary");
  },

  async getInvestmentSummary() {
    return api.get<InvestmentSummary>("/api/investments/summary");
  },
};
