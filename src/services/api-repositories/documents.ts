import { api } from "@/services/api";
import type {
  DocumentoFinanceiro, DocumentoStats, DocumentoLog, DocumentoTrashItem,
  DocumentoAprendizado, DocumentoConfiguracao,
} from "@/types";

interface ApiDocumento {
  id: string;
  company: string;
  userUploadId: string;
  nomeArquivoOriginal: string;
  tipoArquivo: string;
  tamanhoBytes: number;
  status: string;
  tipoDocumentoDetectado: string | null;
  valorExtraido: number | null;
  dataExtraida: string | null;
  favorecidoExtraido: string | null;
  emitenteExtraido: string | null;
  descricaoExtraida: string | null;
  tipoMovimentacaoSugerido: string | null;
  categoriaSugeridaId: string | null;
  confiancaExtracao: number | null;
  resumoExecutivo: string | null;
  lancamentoId: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

interface ApiDocumentoStats {
  total: number;
  aguardando: number;
  processando: number;
  convertidosMes: number;
  rejeitadosMes: number;
  economiaEstimadaMinutos: number;
  valorTotalAutomatizado: number;
}

interface ApiDocumentoLog {
  id: string;
  documentoId: string | null;
  acao: string;
  descricao: string;
  usuarioNome: string;
  criadoEm: string;
  detalhes: string | null;
}

interface ApiDocumentoTrashItem {
  id: string;
  documentoId: string;
  nomeArquivoOriginal: string;
  tipoArquivo: string;
  tamanhoBytes: number;
  statusOriginal: string;
  motivoExclusao: string;
  excluidoPor: string;
  excluidoEm: string;
  expiracaoEm: string;
}

interface ApiDocumentoAprendizado {
  id: string;
  chave: string;
  categoriaId: string | null;
  tipoMovimentacao: string | null;
  confiancaMinima: number | null;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

interface ApiDocumentoConfig {
  id: string;
  company: string;
  categorizacaoAutomatica: boolean;
  criarLancamentoAutomatico: boolean;
  diasRetencaoLixeira: number;
}

export interface ConfirmarDocumentoRequest {
  valorExtraido?: number | null;
  dataExtraida?: string | null;
  favorecidoExtraido?: string | null;
  emitenteExtraido?: string | null;
  descricaoExtraida?: string | null;
  tipoMovimentacaoSugerido?: string | null;
  categoriaSugeridaId?: string | null;
}

export interface UpsertAprendizadoRequest {
  chave: string;
  categoriaId?: string | null;
  tipoMovimentacao?: string | null;
  confiancaMinima?: number | null;
  ativo?: boolean | null;
}

export interface UpdateConfigRequest {
  categorizacaoAutomatica?: boolean | null;
  criarLancamentoAutomatico?: boolean | null;
  diasRetencaoLixeira?: number | null;
}

export interface CleanupResponse {
  removidos: number;
}

function mapDocumento(d: ApiDocumento): DocumentoFinanceiro {
  return {
    id: d.id,
    empresa_id: d.company,
    usuario_upload_id: d.userUploadId,
    nome_arquivo_original: d.nomeArquivoOriginal,
    nome_arquivo_storage: "",
    path_storage: "",
    tipo_arquivo: d.tipoArquivo as DocumentoFinanceiro["tipo_arquivo"],
    tamanho_bytes: d.tamanhoBytes,
    hash_arquivo: "",
    status: d.status as DocumentoFinanceiro["status"],
    tipo_documento_detectado: d.tipoDocumentoDetectado as DocumentoFinanceiro["tipo_documento_detectado"],
    valor_extraido: d.valorExtraido,
    data_extraida: d.dataExtraida,
    favorecido_extraido: d.favorecidoExtraido,
    emitente_extraido: d.emitenteExtraido,
    descricao_extraida: d.descricaoExtraida,
    tipo_movimentacao_sugerido: d.tipoMovimentacaoSugerido as DocumentoFinanceiro["tipo_movimentacao_sugerido"],
    categoria_sugerida_id: d.categoriaSugeridaId,
    confianca_extracao: d.confiancaExtracao,
    dados_extraidos_raw: null,
    dados_estruturados: null,
    observacoes_ia: null,
    resumo_executivo: d.resumoExecutivo,
    lancamento_id: d.lancamentoId,
    usuario_conferencia_id: null,
    data_conferencia: null,
    motivo_rejeicao: null,
    motivo_exclusao: null,
    exclusao_permanente: null,
    excluido_por: null,
    data_exclusao: null,
    tentativas_processamento: 0,
    ultimo_erro: null,
    arquivo_data: null,
    criado_em: d.criadoEm,
    atualizado_em: d.atualizadoEm,
    excluido_em: null,
  };
}

function mapLog(l: ApiDocumentoLog): DocumentoLog {
  return {
    id: l.id,
    documento_id: l.documentoId ?? "",
    empresa_id: "",
    usuario_id: null,
    acao: l.acao as DocumentoLog["acao"],
    detalhes: l.detalhes,
    ip_origem: null,
    criado_em: l.criadoEm,
  };
}

function mapTrashItem(t: ApiDocumentoTrashItem): DocumentoTrashItem {
  return {
    id: t.id,
    documento_id: t.documentoId,
    empresa_id: "",
    nome_arquivo_original: t.nomeArquivoOriginal,
    tipo_arquivo: t.tipoArquivo as DocumentoTrashItem["tipo_arquivo"],
    tamanho_bytes: t.tamanhoBytes,
    status_original: t.statusOriginal as DocumentoTrashItem["status_original"],
    motivo_exclusao: t.motivoExclusao,
    excluido_por: t.excluidoPor,
    dados_documento: "",
    criado_em: t.excluidoEm,
    excluido_em: t.excluidoEm,
    restore_until: t.expiracaoEm,
  };
}

function mapAprendizado(a: ApiDocumentoAprendizado): DocumentoAprendizado {
  return {
    id: a.id,
    empresa_id: "",
    chave_reconhecimento: a.chave,
    categoria_id: a.categoriaId ?? "",
    tipo_movimentacao: (a.tipoMovimentacao ?? "RECEITA") as DocumentoAprendizado["tipo_movimentacao"],
    frequencia: 0,
    ultima_confirmacao: "",
    criado_em: a.criadoEm,
    atualizado_em: a.atualizadoEm,
  };
}

function mapConfig(c: ApiDocumentoConfig): DocumentoConfiguracao {
  return {
    id: c.id,
    empresa_id: c.company,
    retencao_dias: c.diasRetencaoLixeira,
    notificar_email: false,
    notificar_sistema: false,
    auto_sugerir_categoria: c.categorizacaoAutomatica,
    limite_tamanho_mb: 10,
    criado_em: "",
    atualizado_em: "",
  };
}

export const DocumentoRepositoryApi = {
  async getAll(): Promise<DocumentoFinanceiro[]> {
    const data = await api.get<ApiDocumento[]>("/api/documentos");
    return data.map(mapDocumento);
  },

  async getStats(mes: number, ano: number): Promise<DocumentoStats> {
    const data = await api.get<ApiDocumentoStats>(`/api/documentos/stats?mes=${mes}&ano=${ano}`);
    return {
      total: data.total,
      aguardando: data.aguardando,
      processando: data.processando,
      convertidos_mes: data.convertidosMes,
      rejeitados_mes: data.rejeitadosMes,
      economia_estimada_minutos: data.economiaEstimadaMinutos,
      valor_total_automatizado: data.valorTotalAutomatizado,
    };
  },

  async upload(files: File[]): Promise<DocumentoFinanceiro[]> {
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }
    const data = await api.upload<ApiDocumento[]>("/api/documentos/upload", formData);
    return data.map(mapDocumento);
  },

  // ── Lixeira ──

  async getTrash(): Promise<DocumentoTrashItem[]> {
    const data = await api.get<ApiDocumentoTrashItem[]>("/api/documentos/trash");
    return data.map(mapTrashItem);
  },

  async excluir(id: string, motivo: string): Promise<void> {
    await api.post(`/api/documentos/${id}/excluir`, { motivo });
  },

  async restaurar(id: string): Promise<void> {
    await api.post(`/api/documentos/${id}/restaurar`);
  },

  async excluirPermanente(id: string): Promise<void> {
    await api.delete(`/api/documentos/${id}/permanente`);
  },

  async cleanupTrash(): Promise<CleanupResponse> {
    return api.post<CleanupResponse>("/api/documentos/trash/cleanup");
  },

  // ── Conferência ──

  async confirmar(id: string, data: ConfirmarDocumentoRequest): Promise<DocumentoFinanceiro> {
    const result = await api.post<ApiDocumento>(`/api/documentos/${id}/confirmar`, data);
    return mapDocumento(result);
  },

  async rejeitar(id: string, motivo: string): Promise<DocumentoFinanceiro> {
    const result = await api.post<ApiDocumento>(`/api/documentos/${id}/rejeitar`, { motivo });
    return mapDocumento(result);
  },

  // ── Ações ──

  async reprocessar(id: string): Promise<DocumentoFinanceiro> {
    const result = await api.post<ApiDocumento>(`/api/documentos/${id}/reprocessar`);
    return mapDocumento(result);
  },

  // ── Auditoria ──

  async getLogs(documentoId: string): Promise<DocumentoLog[]> {
    const data = await api.get<ApiDocumentoLog[]>(`/api/documentos/${documentoId}/logs`);
    return data.map(mapLog);
  },

  // ── Aprendizado ──

  async getAprendizado(): Promise<DocumentoAprendizado[]> {
    const data = await api.get<ApiDocumentoAprendizado[]>("/api/documentos/aprendizado");
    return data.map(mapAprendizado);
  },

  async upsertAprendizado(input: UpsertAprendizadoRequest): Promise<DocumentoAprendizado> {
    const result = await api.post<ApiDocumentoAprendizado>("/api/documentos/aprendizado", input);
    return mapAprendizado(result);
  },

  async deleteAprendizado(id: string): Promise<void> {
    await api.delete(`/api/documentos/aprendizado/${id}`);
  },

  // ── Config ──

  async getConfig(): Promise<DocumentoConfiguracao> {
    const result = await api.get<ApiDocumentoConfig>("/api/documentos/config");
    return mapConfig(result);
  },

  async updateConfig(input: UpdateConfigRequest): Promise<DocumentoConfiguracao> {
    const result = await api.put<ApiDocumentoConfig>("/api/documentos/config", input);
    return mapConfig(result);
  },
};
