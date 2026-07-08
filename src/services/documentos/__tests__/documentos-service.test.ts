import { describe, it, expect, beforeEach, vi } from "vitest";
import { DocumentoService } from "../documentos.service";

const localStorageMock: Storage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });
Object.defineProperty(globalThis, "window", { value: globalThis, writable: true });

vi.mock("@/database/repositories/categories", () => ({
  CategoryRepository: {
    getAll: vi.fn().mockResolvedValue([
      { id: "cat-1", name: "Alimentação", type: "expense", company: "emp-1" },
    ]),
  },
}));

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

function mockSequential(responses: unknown[]): ReturnType<typeof vi.fn> {
  const fn = vi.fn();
  for (const r of responses) {
    fn.mockResolvedValueOnce(mockResponse(r));
  }
  globalThis.fetch = fn;
  return fn;
}

const documentoConfirmado = {
  id: "doc-1",
  company: "emp-1",
  userUploadId: "user-1",
  nomeArquivoOriginal: "nota.pdf",
  nomeArquivoStorage: "nota_storage.pdf",
  pathStorage: "/uploads/nota_storage.pdf",
  tipoArquivo: "PDF",
  tamanhoBytes: 1024,
  status: "CONVERTIDO",
  tipoDocumentoDetectado: "NOTA_FISCAL",
  valorExtraido: 1500,
  dataExtraida: "2024-01-15",
  favorecidoExtraido: "Fornecedor Teste",
  emitenteExtraido: null,
  descricaoExtraida: "Compra de insumos",
  tipoMovimentacaoSugerido: "DESPESA",
  categoriaSugeridaId: "cat-1",
  confiancaExtracao: 0.95,
  dadosExtraidosRaw: null,
  dadosEstruturados: null,
  observacoesIa: null,
  resumoExecutivo: null,
  lancamentoId: null,
  usuarioConferenciaId: "user-1",
  dataConferencia: "2024-01-15T10:00:00Z",
  motivoRejeicao: null,
  tentativasProcessamento: 1,
  ultimoErro: null,
  criadoEm: "2024-01-15T09:00:00Z",
  atualizadoEm: "2024-01-15T10:00:00Z",
};

const mockTransaction = {
  id: "tx-123",
  displayId: "TXN-001",
  type: "Expense" as const,
  value: 1500,
  categoryId: "cat-1",
  categoryName: "",
  description: "Compra de insumos",
  date: "2024-01-15",
  company: "emp-1",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockForecast = {
  id: "fc-456",
  displayId: "FC-001",
  type: "Expense" as const,
  description: "Compra de insumos",
  amount: 1500,
  category: "Alimentação",
  expectedDate: "2099-12-31",
  status: "Predicted" as const,
  notes: null,
  company: "emp-1",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  cancelledReason: null,
  cancelledAt: null,
  cancelledBy: null,
  isRecurring: false,
  recurrenceType: null,
  recurrenceEndDate: null,
};

const mockAprendizado = {
  id: "aprend-1",
  chave: "fornecedor teste",
  categoriaId: "cat-1",
  tipoMovimentacao: "DESPESA",
  confiancaMinima: null,
  ativo: true,
  criadoEm: new Date().toISOString(),
  atualizadoEm: new Date().toISOString(),
};

const confirmarData = {
  valor: 1500,
  data_lancamento: "2024-01-15",
  descricao: "Compra de insumos",
  categoria_id: "cat-1",
  tipo_movimentacao: "DESPESA" as const,
  favorecido: "Fornecedor Teste",
  emitente: undefined,
};

describe("DocumentoService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorageMock.clear();
    vi.spyOn(DocumentoService, "iniciarProcessamento").mockResolvedValue();
  });

  // ── confirmar ──
  describe("confirmar", () => {
    it("deve criar transacao e confirmar documento quando data_lancamento <= hoje", async () => {
      const fetchMock = vi.fn();
      globalThis.fetch = fetchMock;
      fetchMock
        .mockResolvedValueOnce(mockResponse(mockTransaction))
        .mockResolvedValueOnce(mockResponse(null))
        .mockResolvedValueOnce(mockResponse(documentoConfirmado))
        .mockResolvedValueOnce(mockResponse(mockAprendizado));

      const result = await DocumentoService.confirmar(
        "doc-1", confirmarData, "user-1", "João", "emp-1"
      );

      expect(result.tipo).toBe("transaction");
      expect(result.lancamento_id).toBe("tx-123");

      // TransactionRepositoryApi.create
      expect(fetchMock).toHaveBeenNthCalledWith(1,
        `${API_BASE}/api/transactions`,
        expect.objectContaining({ method: "POST" })
      );

      // TransactionRepositoryApi.update (categoryName)
      expect(fetchMock).toHaveBeenNthCalledWith(2,
        `${API_BASE}/api/transactions/tx-123`,
        expect.objectContaining({ method: "PUT" })
      );

      // DocumentoRepositoryApi.confirmar
      expect(fetchMock).toHaveBeenNthCalledWith(3,
        `${API_BASE}/api/documentos/doc-1/confirmar`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            valorExtraido: 1500,
            dataExtraida: "2024-01-15",
            descricaoExtraida: "Compra de insumos",
            categoriaSugeridaId: "cat-1",
            tipoMovimentacaoSugerido: "DESPESA",
            favorecidoExtraido: "Fornecedor Teste",
            emitenteExtraido: undefined,
          }),
        })
      );

      // DocumentoRepositoryApi.upsertAprendizado
      expect(fetchMock).toHaveBeenNthCalledWith(4,
        `${API_BASE}/api/documentos/aprendizado`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            chave: "fornecedor teste",
            categoriaId: "cat-1",
            tipoMovimentacao: "DESPESA",
          }),
        })
      );
    });

    it("deve criar previsao e confirmar documento quando data_lancamento > hoje", async () => {
      const fetchMock = vi.fn();
      globalThis.fetch = fetchMock;
      fetchMock
        .mockResolvedValueOnce(mockResponse(mockForecast))
        .mockResolvedValueOnce(mockResponse(documentoConfirmado));

      const result = await DocumentoService.confirmar(
        "doc-1",
        { ...confirmarData, data_lancamento: "2099-12-31" },
        "user-1", "João", "emp-1"
      );

      expect(result.tipo).toBe("forecast");
      expect(result.lancamento_id).toBe("fc-456");

      // CashForecastRepositoryApi.create
      expect(fetchMock).toHaveBeenNthCalledWith(1,
        `${API_BASE}/api/forecasts`,
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  // ── rejeitar ──
  describe("rejeitar", () => {
    it("deve rejeitar documento com motivo valido", async () => {
      const fetchMock = vi.fn().mockResolvedValueOnce(
        mockResponse({ ...documentoConfirmado, status: "REJEITADO", motivoRejeicao: "Ilegível" })
      );
      globalThis.fetch = fetchMock;

      await DocumentoService.rejeitar("doc-1", "Ilegível", "user-1", "emp-1");

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE}/api/documentos/doc-1/rejeitar`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ motivo: "Ilegível" }),
        })
      );
    });

    it("deve lancar erro quando motivo esta vazio", async () => {
      const fetchMock = vi.fn();
      globalThis.fetch = fetchMock;

      await expect(
        DocumentoService.rejeitar("doc-1", "", "user-1", "emp-1")
      ).rejects.toThrow("Motivo da rejeição é obrigatório");

      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  // ── excluir ──
  describe("excluir", () => {
    it("deve enviar para lixeira quando permanent=false", async () => {
      const fetchMock = vi.fn().mockResolvedValueOnce(mockResponse(null));
      globalThis.fetch = fetchMock;

      await DocumentoService.excluir("doc-1", "emp-1", "Duplicado", "user-1", "João");

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE}/api/documentos/doc-1/excluir`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ motivo: "Duplicado" }),
        })
      );
    });

    it("deve excluir permanentemente quando permanent=true", async () => {
      const fetchMock = vi.fn().mockResolvedValueOnce(mockResponse(null));
      globalThis.fetch = fetchMock;

      await DocumentoService.excluir("doc-1", "emp-1", "Duplicado", "user-1", "João", true);

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE}/api/documentos/doc-1/permanente`,
        expect.objectContaining({ method: "DELETE" })
      );
    });

    it("deve lancar erro quando motivo esta vazio", async () => {
      const fetchMock = vi.fn();
      globalThis.fetch = fetchMock;

      await expect(
        DocumentoService.excluir("doc-1", "emp-1", "", "user-1", "João")
      ).rejects.toThrow("Motivo da exclusão é obrigatório");

      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  // ── restaurarDaTrash ──
  describe("restaurarDaTrash", () => {
    it("deve restaurar documento da lixeira", async () => {
      const fetchMock = vi.fn().mockResolvedValueOnce(mockResponse(null));
      globalThis.fetch = fetchMock;

      await DocumentoService.restaurarDaTrash("doc-1", "emp-1", "user-1");

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE}/api/documentos/doc-1/restaurar`,
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  // ── reprocessar ──
  describe("reprocessar", () => {
    it("deve chamar API de reprocessamento e iniciar processamento local", async () => {
      const fetchMock = vi.fn().mockResolvedValueOnce(
        mockResponse({ ...documentoConfirmado, status: "PROCESSANDO" })
      );
      globalThis.fetch = fetchMock;

      await DocumentoService.reprocessar("doc-1", "emp-1");

      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE}/api/documentos/doc-1/reprocessar`,
        expect.objectContaining({ method: "POST" })
      );

      expect(DocumentoService.iniciarProcessamento).toHaveBeenCalledWith("doc-1");
    });
  });
});
