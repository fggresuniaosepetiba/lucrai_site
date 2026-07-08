// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAlertsCount } from "../useAlertsCount";
import { useAuthStore } from "@/store/auth-store";
import { usePeriodoStore } from "@/store/periodo-store";

vi.mock("@/services/alertasService", () => ({
  calcularAlertasAtivos: vi.fn(),
}));

import { calcularAlertasAtivos } from "@/services/alertasService";

const API_BASE = "http://localhost:5099";

function mockResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(typeof data === "string" ? data : JSON.stringify(data)),
    blob: () => Promise.resolve(new Blob()),
    headers: new Headers({ "content-type": "application/json" }),
  } as Response;
}

const mockTransactions = [
  { id: "tx-1", type: "income", value: 5000, date: "2024-03-10", categoryId: "cat-1", categoryName: "Vendas", description: "Serviço", company: "emp-1", createdAt: "", updatedAt: "", displayId: "#001" },
  { id: "tx-2", type: "expense", value: 2000, date: "2024-03-15", categoryId: "cat-2", categoryName: "Aluguel", description: "Aluguel", company: "emp-1", createdAt: "", updatedAt: "", displayId: "#002" },
];

const mockTotals = { predictedIncomes: 4000, predictedExpenses: 1500, allIncomes: 0, allExpenses: 0 };

function setupFetchMock() {
  vi.spyOn(globalThis, "fetch").mockImplementation((url: unknown) => {
    const urlStr = String(url);
    if (urlStr.includes("/api/transactions")) return Promise.resolve(mockResponse(mockTransactions));
    if (urlStr.includes("/api/forecasts/totals")) return Promise.resolve(mockResponse(mockTotals));
    return Promise.resolve(mockResponse(null));
  });
}

describe("useAlertsCount", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAuthStore.setState({ isAuthenticated: false, user: null, isLoading: false, mustChangePassword: false });
    usePeriodoStore.setState({ ano: 2024, mes: null, periodoLabel: "2024 · Todos os meses", isFiltered: false });
    vi.mocked(calcularAlertasAtivos).mockReturnValue([]);
  });

  it("deve retornar contagem zerada quando nao ha alertas", async () => {
    useAuthStore.setState({ isAuthenticated: true, user: { id: "1", name: "Test", email: "test@test.com", role: "admin", company: "emp-1", plan: "PRO", mustChangePassword: false } });
    setupFetchMock();
    vi.mocked(calcularAlertasAtivos).mockReturnValue([]);

    const { result } = renderHook(() => useAlertsCount());

    await vi.waitFor(() => {
      expect(result.current).toEqual({ criticos: 0, atencao: 0, positivos: 0 });
    });
  });

  it("deve contar alertas por tipo corretamente", async () => {
    useAuthStore.setState({ isAuthenticated: true, user: { id: "1", name: "Test", email: "test@test.com", role: "admin", company: "emp-1", plan: "PRO", mustChangePassword: false } });
    setupFetchMock();
    vi.mocked(calcularAlertasAtivos).mockReturnValue([
      { id: "a1", tipo: "critico", categoria: "fluxo", titulo: "Risco", descricao: "", dadosContextuais: [], acaoLabel: "", acaoHref: "", dispensado: false, geradoEm: "" },
      { id: "a2", tipo: "critico", categoria: "fluxo", titulo: "Risco 2", descricao: "", dadosContextuais: [], acaoLabel: "", acaoHref: "", dispensado: false, geradoEm: "" },
      { id: "a3", tipo: "atencao", categoria: "custo", titulo: "Atenção", descricao: "", dadosContextuais: [], acaoLabel: "", acaoHref: "", dispensado: false, geradoEm: "" },
      { id: "a4", tipo: "positivo", categoria: "receita", titulo: "Bom", descricao: "", dadosContextuais: [], acaoLabel: "", acaoHref: "", dispensado: false, geradoEm: "" },
      { id: "a5", tipo: "positivo", categoria: "margem", titulo: "Ótimo", descricao: "", dadosContextuais: [], acaoLabel: "", acaoHref: "", dispensado: false, geradoEm: "" },
    ]);

    const { result } = renderHook(() => useAlertsCount());

    await vi.waitFor(() => {
      expect(result.current).toEqual({ criticos: 2, atencao: 1, positivos: 2 });
    });
  });

  it("deve ignorar alertas dispensados na contagem", async () => {
    useAuthStore.setState({ isAuthenticated: true, user: { id: "1", name: "Test", email: "test@test.com", role: "admin", company: "emp-1", plan: "PRO", mustChangePassword: false } });
    setupFetchMock();
    vi.mocked(calcularAlertasAtivos).mockReturnValue([
      { id: "a1", tipo: "critico", categoria: "fluxo", titulo: "Risco", descricao: "", dadosContextuais: [], acaoLabel: "", acaoHref: "", dispensado: true, geradoEm: "" },
      { id: "a2", tipo: "critico", categoria: "fluxo", titulo: "Risco 2", descricao: "", dadosContextuais: [], acaoLabel: "", acaoHref: "", dispensado: false, geradoEm: "" },
      { id: "a3", tipo: "atencao", categoria: "custo", titulo: "Atenção", descricao: "", dadosContextuais: [], acaoLabel: "", acaoHref: "", dispensado: true, geradoEm: "" },
    ]);

    const { result } = renderHook(() => useAlertsCount());

    await vi.waitFor(() => {
      expect(result.current).toEqual({ criticos: 1, atencao: 0, positivos: 0 });
    });
  });
});
