import { api } from "@/services/api";
import type { DocumentoFinanceiro, DocumentoStats } from "@/types";

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
};
