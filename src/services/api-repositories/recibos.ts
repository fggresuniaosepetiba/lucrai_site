import { api } from "@/services/api";
import type { ApiRecibo } from "@/types/api";
import type { Receipt } from "@/types";

function mapRecibo(r: ApiRecibo): Receipt {
  return {
    id: r.id,
    company: r.company,
    numero: r.numero,
    tipo: r.tipo === "Recebimento" ? "recebimento" : "pagamento",
    status: r.status === "Emitido" ? "emitido" : "cancelado",
    nomePagador: r.nomePagador,
    documentoPagador: r.documentoPagador ?? "",
    semDocumentoPagador: r.semDocumentoPagador,
    nomeRecebedor: r.nomeRecebedor,
    documentoRecebedor: r.documentoRecebedor ?? "",
    semDocumentoRecebedor: r.semDocumentoRecebedor,
    data: r.data,
    valor: r.valor,
    valorPorExtenso: r.valorPorExtenso,
    referente: r.referente,
    formaPagamento: r.formaPagamento ?? undefined,
    observacoes: r.observacoes ?? undefined,
    telefone: r.telefone ?? undefined,
    email: r.email ?? undefined,
    cidade: r.cidade ?? undefined,
    estado: r.estado ?? undefined,
    exibirAssinatura: r.exibirAssinatura,
    parcelaAtual: r.parcelaAtual ?? undefined,
    parcelasTotal: r.parcelasTotal ?? undefined,
    lancamentoId: r.lancamentoId ?? null,
    origem: r.origem === "Manual" ? "manual" : "lancamento",
    criadoEm: r.createdAt,
    criadoPor: r.criadoPor,
    atualizadoEm: r.updatedAt,
    cancelamento: r.cancelamento
      ? {
          motivo: r.cancelamento.motivo,
          canceladoEm: r.cancelamento.canceladoEm,
          canceladoPor: r.cancelamento.canceladoPor,
        }
      : null,
  };
}

export const RecibosRepositoryApi = {
  async getAll(): Promise<Receipt[]> {
    const data = await api.get<ApiRecibo[]>("/api/recibos");
    return data.map(mapRecibo);
  },

  async getById(id: string): Promise<Receipt | undefined> {
    try {
      const data = await api.get<ApiRecibo>(`/api/recibos/${id}`);
      return mapRecibo(data);
    } catch (err) {
      console.error("recibos.getById:", err);
      return undefined;
    }
  },

  async create(input: {
    tipo: string;
    data: string;
    valor: number;
    nomePagador: string;
    documentoPagador?: string;
    semDocumentoPagador?: boolean;
    nomeRecebedor: string;
    documentoRecebedor?: string;
    semDocumentoRecebedor?: boolean;
    referente: string;
    formaPagamento?: string;
    observacoes?: string;
    telefone?: string;
    email?: string;
    cidade?: string;
    estado?: string;
    exibirAssinatura?: boolean;
    parcelaAtual?: number;
    parcelasTotal?: number;
    lancamentoId?: string | null;
    origem: string;
    criadoPor: string;
  }): Promise<Receipt> {
    const created = await api.post<ApiRecibo>("/api/recibos", {
      tipo: input.tipo === "recebimento" ? "Recebimento" : "Pagamento",
      origem: input.origem === "manual" ? "Manual" : "Lancamento",
      data: input.data,
      valor: input.valor,
      nomePagador: input.nomePagador,
      documentoPagador: input.documentoPagador || null,
      semDocumentoPagador: input.semDocumentoPagador ?? false,
      nomeRecebedor: input.nomeRecebedor,
      documentoRecebedor: input.documentoRecebedor || null,
      semDocumentoRecebedor: input.semDocumentoRecebedor ?? false,
      referente: input.referente,
      formaPagamento: input.formaPagamento || null,
      observacoes: input.observacoes || null,
      telefone: input.telefone || null,
      email: input.email || null,
      cidade: input.cidade || null,
      estado: input.estado || null,
      exibirAssinatura: input.exibirAssinatura ?? false,
      parcelaAtual: input.parcelaAtual ?? null,
      parcelasTotal: input.parcelasTotal ?? null,
      lancamentoId: input.lancamentoId || null,
      criadoPor: input.criadoPor,
    });
    return mapRecibo(created);
  },

  async update(id: string, data: Partial<Receipt>): Promise<void> {
    await api.put(`/api/recibos/${id}`, {
      tipo: data.tipo ? (data.tipo === "recebimento" ? "Recebimento" : "Pagamento") : undefined,
      data: data.data,
      valor: data.valor,
      nomePagador: data.nomePagador,
      documentoPagador: data.documentoPagador,
      semDocumentoPagador: data.semDocumentoPagador,
      nomeRecebedor: data.nomeRecebedor,
      documentoRecebedor: data.documentoRecebedor,
      semDocumentoRecebedor: data.semDocumentoRecebedor,
      referente: data.referente,
      formaPagamento: data.formaPagamento,
      observacoes: data.observacoes,
      telefone: data.telefone,
      email: data.email,
      cidade: data.cidade,
      estado: data.estado,
      exibirAssinatura: data.exibirAssinatura,
      parcelaAtual: data.parcelaAtual,
      parcelasTotal: data.parcelasTotal,
      lancamentoId: data.lancamentoId,
    });
  },

  async cancelar(id: string, motivo: string): Promise<void> {
    await api.post(`/api/recibos/${id}/cancelar`, { motivo });
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/recibos/${id}`);
  },

  async createAudit(id: string, action: string, description: string, user: string): Promise<void> {
    await api.post(`/api/recibos/${id}/audit`, { action, description, user });
  },
};
