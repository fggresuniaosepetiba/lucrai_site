// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDadosFiltrados } from "../useDadosFiltrados";
import { useAuthStore } from "@/store/auth-store";
import { usePeriodoStore } from "@/store/periodo-store";

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
  { id: "tx-1", type: "Income", value: 5000, date: "2024-03-10", categoryId: "cat-1", categoryName: "Vendas", description: "Serviço", company: "emp-1", createdAt: "", updatedAt: "", displayId: "#001" },
  { id: "tx-2", type: "Expense", value: 2000, date: "2024-03-15", categoryId: "cat-2", categoryName: "Aluguel", description: "Aluguel", company: "emp-1", createdAt: "", updatedAt: "", displayId: "#002" },
  { id: "tx-3", type: "Income", value: 3000, date: "2024-02-20", categoryId: "cat-1", categoryName: "Vendas", description: "Serviço", company: "emp-1", createdAt: "", updatedAt: "", displayId: "#003" },
  { id: "tx-4", type: "Expense", value: 1000, date: "2024-04-05", categoryId: "cat-3", categoryName: "Material", description: "Compra", company: "emp-1", createdAt: "", updatedAt: "", displayId: "#004" },
];

const mockTotals = { predictedIncomes: 4000, predictedExpenses: 1500, allIncomes: 0, allExpenses: 0 };

describe("useDadosFiltrados", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAuthStore.setState({ isAuthenticated: false, user: null, isLoading: false, mustChangePassword: false });
    usePeriodoStore.setState({ ano: 2024, mes: null, periodoLabel: "2024 · Todos os meses", isFiltered: false });
  });

  it("deve iniciar com isLoading true", () => {
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse([]));

    const { result } = renderHook(() => useDadosFiltrados());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.lancamentos).toEqual([]);
  });

  it("deve buscar dados e calcular valores quando autenticado", async () => {
    useAuthStore.setState({ isAuthenticated: true, user: { id: "1", name: "Test", email: "test@test.com", role: "admin", company: "emp-1", plan: "PRO", mustChangePassword: false } });

    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce(mockResponse(mockTransactions))
      .mockResolvedValueOnce(mockResponse(mockTotals));

    const { result } = renderHook(() => useDadosFiltrados());

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.lancamentos).toHaveLength(4);
    });

    expect(result.current.entradas).toBe(8000);
    expect(result.current.saidas).toBe(3000);
    expect(result.current.saldoAtual).toBe(5000);
    expect(result.current.saldoProjetado).toBe(7500);
    expect(result.current.margemLiquida).toBeCloseTo(62.5, 1);
    expect(result.current.recebimentosPrevistos).toBe(4000);
    expect(result.current.pagamentosPrevistos).toBe(1500);
    expect(result.current.periodoAtivo).toEqual({ ano: 2024, mes: null });
  });

  it("deve filtrar lancamentos por mes", async () => {
    useAuthStore.setState({ isAuthenticated: true, user: { id: "1", name: "Test", email: "test@test.com", role: "admin", company: "emp-1", plan: "PRO", mustChangePassword: false } });
    usePeriodoStore.setState({ ano: 2024, mes: 3 });

    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce(mockResponse(mockTransactions))
      .mockResolvedValueOnce(mockResponse(mockTotals));

    const { result } = renderHook(() => useDadosFiltrados());

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.lancamentos).toHaveLength(2);
    });

    expect(result.current.entradas).toBe(5000);
    expect(result.current.saidas).toBe(2000);
  });

  it("deve lidar com erro na API sem quebrar", async () => {
    useAuthStore.setState({ isAuthenticated: true, user: { id: "1", name: "Test", email: "test@test.com", role: "admin", company: "emp-1", plan: "PRO", mustChangePassword: false } });

    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useDadosFiltrados());

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.lancamentos).toEqual([]);
    });

    expect(result.current.entradas).toBe(0);
    expect(result.current.saidas).toBe(0);
  });

  it("deve retornar margem zero quando nao ha entradas", async () => {
    useAuthStore.setState({ isAuthenticated: true, user: { id: "1", name: "Test", email: "test@test.com", role: "admin", company: "emp-1", plan: "PRO", mustChangePassword: false } });

    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce(mockResponse([]))
      .mockResolvedValueOnce(mockResponse({ predictedIncomes: 0, predictedExpenses: 0, allIncomes: 0, allExpenses: 0 }));

    const { result } = renderHook(() => useDadosFiltrados());

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.lancamentos).toEqual([]);
    });

    expect(result.current.margemLiquida).toBe(0);
  });
});
