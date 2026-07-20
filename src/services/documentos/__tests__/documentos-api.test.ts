import { describe, it, expect, beforeEach, vi } from "vitest";
import { DocumentoRepositoryApi, type ConfirmarDocumentoRequest, type CleanupResponse } from "@/services/api-repositories/documents";
import type { DocumentoFinanceiro, DocumentoLog, DocumentoTrashItem, DocumentoAprendizado, DocumentoConfiguracao, DocumentoStats } from "@/types";

const storageMock: Storage = (() => {
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

Object.defineProperty(globalThis, "sessionStorage", { value: storageMock });
Object.defineProperty(globalThis, "localStorage", { value: storageMock });
Object.defineProperty(globalThis, "window", { value: globalThis, writable: true });

if (typeof URL.createObjectURL === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (URL as any).createObjectURL = () => "blob:http://localhost/mock";
}

const API_BASE = "http://localhost:5099";
const token = "test-token-123";

const sampleApiDoc = {
  id: "doc-1",
  company: "emp-1",
  userUploadId: "user-1",
  nomeArquivoOriginal: "nota.pdf",
  nomeArquivoStorage: "nota_storage.pdf",
  pathStorage: "/uploads/nota_storage.pdf",
  tipoArquivo: "PDF",
  tamanhoBytes: 1024,
  status: "AGUARDANDO_CONFERENCIA",
  tipoDocumentoDetectado: "NOTA_FISCAL",
  valorExtraido: 1500.50,
  dataExtraida: "2024-03-15",
  favorecidoExtraido: "Fornecedor ABC",
  emitenteExtraido: null,
  descricaoExtraida: "Nota fiscal de compra",
  tipoMovimentacaoSugerido: "DESPESA",
  categoriaSugeridaId: "cat-1",
  confiancaExtracao: 0.95,
  dadosExtraidosRaw: '{"tipo":"NOTA_FISCAL"}',
  dadosEstruturados: null,
  observacoesIa: null,
  resumoExecutivo: "Compra identificada no valor de R$ 1.500,50",
  lancamentoId: null,
  usuarioConferenciaId: null,
  dataConferencia: null,
  motivoRejeicao: null,
  tentativasProcessamento: 1,
  ultimoErro: null,
  criadoEm: "2024-03-15T10:00:00Z",
  atualizadoEm: "2024-03-15T10:05:00Z",
};

function createMockFetchResponse(overrides: Partial<Response>): Response {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
    blob: () => Promise.resolve(new Blob()),
    headers: new Headers({ "content-type": "application/json" }),
    ...overrides,
  } as Response;
}

function mockFetchSuccess(data: unknown, status = 200) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    createMockFetchResponse({
      ok: true,
      status,
      json: () => Promise.resolve(data),
    })
  );
}

function mockFetchError(status = 400, message = "Erro na requisicao") {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    createMockFetchResponse({
      ok: false,
      status,
      text: () => Promise.resolve(message),
      json: () => Promise.reject(new Error("Not JSON")),
    })
  );
}

function mockFetchBlob(blob: Blob) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    createMockFetchResponse({
      ok: true,
      status: 200,
      blob: () => Promise.resolve(blob),
    })
  );
}

describe("DocumentoRepositoryApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    storageMock.clear();
  });

  // ── getAll ──
  describe("getAll", () => {
    it("deve buscar todos os documentos sem filtro de status", async () => {
      mockFetchSuccess([sampleApiDoc]);

      const result = await DocumentoRepositoryApi.getAll();

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/documentos`,
        expect.any(Object)
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("doc-1");
      expect(result[0].status).toBe("AGUARDANDO_CONFERENCIA");
      expect(result[0].valor_extraido).toBe(1500.50);
    });

    it("deve buscar com filtro de status", async () => {
      mockFetchSuccess([sampleApiDoc]);

      const result = await DocumentoRepositoryApi.getAll("AGUARDANDO_CONFERENCIA");

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/documentos?status=AGUARDANDO_CONFERENCIA`,
        expect.any(Object)
      );
      expect(result).toHaveLength(1);
    });

    it("deve retornar array vazio quando API retorna vazio", async () => {
      mockFetchSuccess([]);

      const result = await DocumentoRepositoryApi.getAll();

      expect(result).toEqual([]);
    });

    it("deve lançar erro quando API falha", async () => {
      mockFetchError(500, "Erro interno");

      await expect(DocumentoRepositoryApi.getAll()).rejects.toThrow();
    });
  });

  // ── getById ──
  describe("getById", () => {
    it("deve buscar documento por ID", async () => {
      mockFetchSuccess(sampleApiDoc);

      const result = await DocumentoRepositoryApi.getById("doc-1");

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/documentos/doc-1`,
        expect.any(Object)
      );
      expect(result).not.toBeNull();
      expect(result!.id).toBe("doc-1");
      expect(result!.nome_arquivo_original).toBe("nota.pdf");
    });

    it("deve retornar null quando documento nao encontrado", async () => {
      mockFetchError(404, "Not found");

      const result = await DocumentoRepositoryApi.getById("doc-inexistente");

      expect(result).toBeNull();
    });

    it("deve retornar null em caso de erro de rede", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));

      const result = await DocumentoRepositoryApi.getById("doc-1");

      expect(result).toBeNull();
    });
  });

  // ── getDownloadUrl ──
  describe("getDownloadUrl", () => {
    beforeEach(() => {
      storageMock.setItem("lucrai-access-token", token);
    });

    it("deve gerar URL de download do documento", async () => {
      const spy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:http://localhost/mock-url");
      mockFetchBlob(new Blob(["conteudo"], { type: "application/pdf" }));

      const url = await DocumentoRepositoryApi.getDownloadUrl("doc-1");

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/documentos/doc-1/download`,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      expect(url).toBe("blob:http://localhost/mock-url");
      expect(URL.createObjectURL).toHaveBeenCalled();
      spy.mockRestore();
    });

    it("deve lançar erro quando download falha", async () => {
      mockFetchError(404, "Arquivo nao encontrado");

      await expect(DocumentoRepositoryApi.getDownloadUrl("doc-1")).rejects.toThrow(
        "Falha ao baixar arquivo"
      );
    });

    it("deve fazer request sem token quando nao ha token", async () => {
      storageMock.clear();
      mockFetchBlob(new Blob());

      await DocumentoRepositoryApi.getDownloadUrl("doc-1");

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/documentos/doc-1/download`,
        expect.objectContaining({ headers: {} })
      );
    });
  });

  // ── getStats ──
  describe("getStats", () => {
    it("deve buscar estatisticas do mes/ano", async () => {
      const apiStats = {
        total: 100,
        aguardando: 30,
        processando: 5,
        convertidosMes: 20,
        rejeitadosMes: 3,
        economiaEstimadaMinutos: 480,
        valorTotalAutomatizado: 50000,
      };
      mockFetchSuccess(apiStats);

      const result = await DocumentoRepositoryApi.getStats(3, 2024);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/documentos/stats?mes=3&ano=2024`,
        expect.any(Object)
      );
      expect(result.total).toBe(100);
      expect(result.aguardando).toBe(30);
      expect(result.convertidos_mes).toBe(20);
      expect(result.valor_total_automatizado).toBe(50000);
    });

    it("deve lançar erro quando API falha", async () => {
      mockFetchError(500);

      await expect(DocumentoRepositoryApi.getStats(3, 2024)).rejects.toThrow();
    });
  });

  // ── upload ──
  describe("upload", () => {
    it("deve fazer upload de arquivos com FormData", async () => {
      mockFetchSuccess([sampleApiDoc]);
      const files = [new File(["conteudo"], "teste.pdf", { type: "application/pdf" })];

      const result = await DocumentoRepositoryApi.upload(files);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/documentos/upload`,
        expect.objectContaining({
          method: "POST",
          body: expect.any(FormData),
        })
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("doc-1");
    });

    it("deve fazer upload de multiplos arquivos", async () => {
      const docs = [
        { ...sampleApiDoc, id: "doc-1", nomeArquivoOriginal: "a.pdf" },
        { ...sampleApiDoc, id: "doc-2", nomeArquivoOriginal: "b.pdf" },
      ];
      mockFetchSuccess(docs);
      const files = [
        new File(["a"], "a.pdf", { type: "application/pdf" }),
        new File(["b"], "b.pdf", { type: "application/pdf" }),
      ];

      const result = await DocumentoRepositoryApi.upload(files);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("doc-1");
      expect(result[1].id).toBe("doc-2");
    });

    it("deve lançar erro quando upload falha", async () => {
      mockFetchError(413, "Arquivo muito grande");
      const files = [new File(["x"], "grande.pdf", { type: "application/pdf" })];

      await expect(DocumentoRepositoryApi.upload(files)).rejects.toThrow();
    });
  });

  // ── Lixeira ──
  describe("getTrash", () => {
    it("deve buscar itens da lixeira", async () => {
      const apiTrash = [{
        id: "trash-1",
        documentoId: "doc-1",
        nomeArquivoOriginal: "nota.pdf",
        tipoArquivo: "PDF",
        tamanhoBytes: 1024,
        statusOriginal: "AGUARDANDO_CONFERENCIA",
        motivoExclusao: "Duplicado",
        excluidoPor: "user-1",
        excluidoEm: "2024-03-20T10:00:00Z",
        expiracaoEm: "2024-04-20T10:00:00Z",
      }];
      mockFetchSuccess(apiTrash);

      const result = await DocumentoRepositoryApi.getTrash();

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/documentos/trash`,
        expect.any(Object)
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("trash-1");
      expect(result[0].motivo_exclusao).toBe("Duplicado");
    });

    it("deve retornar array vazio quando lixeira vazia", async () => {
      mockFetchSuccess([]);

      const result = await DocumentoRepositoryApi.getTrash();

      expect(result).toEqual([]);
    });
  });

  describe("excluir", () => {
    it("deve enviar documento para lixeira", async () => {
      mockFetchSuccess(null, 200);

      await DocumentoRepositoryApi.excluir("doc-1", "Documento duplicado");

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/documentos/doc-1/excluir`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ motivo: "Documento duplicado" }),
        })
      );
    });

    it("deve lançar erro quando exclusao falha", async () => {
      mockFetchError(500);

      await expect(
        DocumentoRepositoryApi.excluir("doc-1", "motivo")
      ).rejects.toThrow();
    });
  });

  describe("restaurar", () => {
    it("deve restaurar documento da lixeira", async () => {
      mockFetchSuccess(null, 200);

      await DocumentoRepositoryApi.restaurar("doc-1");

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/documentos/doc-1/restaurar`,
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  describe("excluirPermanente", () => {
    it("deve excluir documento permanentemente", async () => {
      mockFetchSuccess(null, 200);

      await DocumentoRepositoryApi.excluirPermanente("doc-1");

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/documentos/doc-1/permanente`,
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  describe("cleanupTrash", () => {
    it("deve limpar lixeira e retornar quantidade removida", async () => {
      mockFetchSuccess({ removidos: 5 });

      const result = await DocumentoRepositoryApi.cleanupTrash();

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/documentos/trash/cleanup`,
        expect.objectContaining({ method: "POST" })
      );
      expect(result.removidos).toBe(5);
    });
  });

  // ── Conferência ──
  describe("confirmar", () => {
    it("deve confirmar documento com dados corrigidos", async () => {
      mockFetchSuccess(sampleApiDoc);
      const data: ConfirmarDocumentoRequest = {
        valorExtraido: 2000,
        dataExtraida: "2024-03-15",
        favorecidoExtraido: "Fornecedor XYZ",
        emitenteExtraido: null,
        descricaoExtraida: "Compra de insumos",
        tipoMovimentacaoSugerido: "DESPESA",
        categoriaSugeridaId: "cat-2",
      };

      const result = await DocumentoRepositoryApi.confirmar("doc-1", data);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/documentos/doc-1/confirmar`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(data),
        })
      );
      expect(result.id).toBe("doc-1");
      expect(result.status).toBe("AGUARDANDO_CONFERENCIA");
    });

    it("deve lançar erro quando confirmacao falha", async () => {
      mockFetchError(400, "Dados invalidos");
      const data: ConfirmarDocumentoRequest = { valorExtraido: 0 };

      await expect(
        DocumentoRepositoryApi.confirmar("doc-1", data)
      ).rejects.toThrow();
    });
  });

  describe("rejeitar", () => {
    it("deve rejeitar documento com motivo", async () => {
      mockFetchSuccess({ ...sampleApiDoc, status: "REJEITADO", motivoRejeicao: "Documento ilegivel" });

      const result = await DocumentoRepositoryApi.rejeitar("doc-1", "Documento ilegivel");

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/documentos/doc-1/rejeitar`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ motivo: "Documento ilegivel" }),
        })
      );
      expect(result.id).toBe("doc-1");
    });
  });

  // ── Ações ──
  describe("reprocessar", () => {
    it("deve solicitar reprocessamento de documento", async () => {
      mockFetchSuccess({ ...sampleApiDoc, status: "PROCESSANDO" });

      const result = await DocumentoRepositoryApi.reprocessar("doc-1");

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/documentos/doc-1/reprocessar`,
        expect.objectContaining({ method: "POST" })
      );
      expect(result.status).toBe("PROCESSANDO");
    });
  });

  // ── Auditoria ──
  describe("getLogs", () => {
    it("deve buscar logs de auditoria do documento", async () => {
      const apiLogs = [
        {
          id: "log-1",
          documentoId: "doc-1",
          acao: "UPLOAD",
          descricao: "Upload realizado",
          usuarioNome: "João",
          criadoEm: "2024-03-15T10:00:00Z",
          detalhes: '{"nome_arquivo":"nota.pdf"}',
        },
        {
          id: "log-2",
          documentoId: "doc-1",
          acao: "CONFIRMADO",
          descricao: "Documento confirmado",
          usuarioNome: "Maria",
          criadoEm: "2024-03-15T11:00:00Z",
          detalhes: null,
        },
      ];
      mockFetchSuccess(apiLogs);

      const result = await DocumentoRepositoryApi.getLogs("doc-1");

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/documentos/doc-1/logs`,
        expect.any(Object)
      );
      expect(result).toHaveLength(2);
      expect(result[0].acao).toBe("UPLOAD");
      expect(result[1].acao).toBe("CONFIRMADO");
    });

    it("deve retornar array vazio quando nao ha logs", async () => {
      mockFetchSuccess([]);

      const result = await DocumentoRepositoryApi.getLogs("doc-1");

      expect(result).toEqual([]);
    });
  });

  // ── Aprendizado ──
  describe("getAprendizado", () => {
    it("deve buscar registros de aprendizado", async () => {
      const apiAprendizados = [
        {
          id: "aprend-1",
          chave: "fornecedor abc",
          categoriaId: "cat-1",
          tipoMovimentacao: "DESPESA",
          confiancaMinima: 0.8,
          ativo: true,
          criadoEm: "2024-01-01T00:00:00Z",
          atualizadoEm: "2024-03-15T10:00:00Z",
        },
      ];
      mockFetchSuccess(apiAprendizados);

      const result = await DocumentoRepositoryApi.getAprendizado();

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/documentos/aprendizado`,
        expect.any(Object)
      );
      expect(result).toHaveLength(1);
      expect(result[0].chave_reconhecimento).toBe("fornecedor abc");
      expect(result[0].categoria_id).toBe("cat-1");
    });
  });

  describe("upsertAprendizado", () => {
    it("deve criar ou atualizar registro de aprendizado", async () => {
      const apiResult = {
        id: "aprend-1",
        chave: "fornecedor xyz",
        categoriaId: "cat-2",
        tipoMovimentacao: "RECEITA",
        confiancaMinima: null,
        ativo: true,
        criadoEm: "2024-03-15T12:00:00Z",
        atualizadoEm: "2024-03-15T12:00:00Z",
      };
      mockFetchSuccess(apiResult);

      const result = await DocumentoRepositoryApi.upsertAprendizado({
        chave: "fornecedor xyz",
        categoriaId: "cat-2",
        tipoMovimentacao: "RECEITA",
      });

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/documentos/aprendizado`,
        expect.objectContaining({ method: "POST" })
      );
      expect(result.chave_reconhecimento).toBe("fornecedor xyz");
    });
  });

  describe("deleteAprendizado", () => {
    it("deve remover registro de aprendizado", async () => {
      mockFetchSuccess(null, 204);

      await DocumentoRepositoryApi.deleteAprendizado("aprend-1");

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/documentos/aprendizado/aprend-1`,
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  // ── Config ──
  describe("getConfig", () => {
    it("deve buscar configuracao de documentos", async () => {
      const apiConfig = {
        id: "cfg-1",
        company: "emp-1",
        categorizacaoAutomatica: true,
        criarLancamentoAutomatico: false,
        diasRetencaoLixeira: 30,
      };
      mockFetchSuccess(apiConfig);

      const result = await DocumentoRepositoryApi.getConfig();

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/documentos/config`,
        expect.any(Object)
      );
      expect(result.auto_sugerir_categoria).toBe(true);
      expect(result.retencao_dias).toBe(30);
    });
  });

  describe("updateConfig", () => {
    it("deve atualizar configuracao de documentos", async () => {
      const apiConfig = {
        id: "cfg-1",
        company: "emp-1",
        categorizacaoAutomatica: true,
        criarLancamentoAutomatico: true,
        diasRetencaoLixeira: 60,
      };
      mockFetchSuccess(apiConfig);

      const result = await DocumentoRepositoryApi.updateConfig({
        categorizacaoAutomatica: true,
        criarLancamentoAutomatico: true,
        diasRetencaoLixeira: 60,
      });

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/documentos/config`,
        expect.objectContaining({ method: "PUT" })
      );
      expect(result.retencao_dias).toBe(60);
      expect(result.auto_sugerir_categoria).toBe(true);
    });
  });
});
