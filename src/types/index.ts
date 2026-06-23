export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  displayId: string;
  type: TransactionType;
  value: number;
  categoryId: string;
  categoryName: string;
  description: string;
  date: string;
  observation?: string;
  company: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: TransactionType;
  company: string;
  createdAt: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "owner" | "admin" | "financial" | "viewer";
  company: string;
  avatar?: string;
  createdAt: string;
  active?: boolean;
}

export interface AppSettings {
  id: string;
  companyName: string;
  logoUrl?: string;
  primaryColor: string;
  company: string;
}

export interface DeletedTransaction {
  id: string;
  originalId: string;
  displayId: string;
  entryType: "transaction" | "forecast";
  type: TransactionType;
  value?: number;
  categoryId?: string;
  categoryName?: string;
  description: string;
  date?: string;
  observation?: string;
  amount?: number;
  category?: string;
  expectedDate?: string;
  notes?: string;
  status?: ForecastStatus;
  cancelledReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  createdAt: string;
  updatedAt: string;
  company: string;
  deletedAt: string;
  reason: string;
  restoreUntil: string;
}

export type ForecastStatus = "predicted" | "received" | "paid" | "cancelled";

export type RecurrenceType = "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "semiannual" | "annual";

export interface CashForecast {
  id: string;
  displayId: string;
  type: TransactionType;
  description: string;
  amount: number;
  category: string;
  expectedDate: string;
  status: ForecastStatus;
  notes?: string;
  company: string;
  createdAt: string;
  updatedAt: string;
  cancelledReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  isRecurring?: boolean;
  recurrenceType?: RecurrenceType;
  recurrenceEndDate?: string;
}

export interface MonthlySummary {
  month: string;
  year: number;
  incomes: number;
  expenses: number;
  balance: number;
}

export interface PricingProduct {
  id: string;
  name: string;
  category: string;
  sku?: string;
  description?: string;
  rawMaterial: number;
  packaging: number;
  labor: number;
  freight: number;
  otherCosts: number;
  taxes: number;
  cardFee: number;
  marketplaceFee: number;
  commission: number;
  otherFees: number;
  desiredMargin: number;
  minPrice: number;
  healthyPrice: number;
  premiumPrice: number;
  netMargin: number;
  createdAt: string;
  updatedAt: string;
  company: string;
  createdBy: string;
}

export type PorteEmpresa = "MEI" | "ME" | "EPP" | "Médio" | "Grande";

export interface Conta {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  empresa: string;
  cargo: string;
  porte: PorteEmpresa;
  faturamento: string;
  origem: string;
  plano: string;
  trialInicio: string;
  trialFim: string;
  primeiroAcesso: boolean;
  createdAt: string;
}

export type AuditAction =
  | "created"
  | "edited"
  | "cancelled"
  | "paid"
  | "received"
  | "restored"
  | "deleted"
  | "moved_to_trash";

export interface AuditLog {
  id: string;
  entityId: string;
  entityType: "transaction" | "forecast" | "user";
  displayId: string;
  action: AuditAction;
  description: string;
  user: string;
  company: string;
  timestamp: string;
  details?: string;
}

// ============ DOCUMENTOS FINANCEIROS ============

export type DocumentoStatus = "NOVO" | "PROCESSANDO" | "AGUARDANDO_CONFERENCIA" | "CONVERTIDO" | "REJEITADO" | "ERRO";

export type TipoArquivo = "PDF" | "XML" | "JPG" | "JPEG" | "PNG";

export type TipoDocumentoDetectado =
  | "NOTA_FISCAL"
  | "XML_NFE"
  | "COMPROVANTE_PIX"
  | "COMPROVANTE_TED"
  | "BOLETO"
  | "RECIBO"
  | "EXTRATO_BANCARIO"
  | "COMPROVANTE_PAGAMENTO"
  | "OUTRO";

export type TipoMovimentacao = "RECEITA" | "DESPESA" | "TRANSFERENCIA";

export interface DocumentoFinanceiro {
  id: string;
  empresa_id: string;
  usuario_upload_id: string;
  nome_arquivo_original: string;
  nome_arquivo_storage: string;
  path_storage: string;
  tipo_arquivo: TipoArquivo;
  tamanho_bytes: number;
  hash_arquivo: string;
  status: DocumentoStatus;
  tipo_documento_detectado: TipoDocumentoDetectado | null;
  valor_extraido: number | null;
  data_extraida: string | null;
  favorecido_extraido: string | null;
  emitente_extraido: string | null;
  descricao_extraida: string | null;
  tipo_movimentacao_sugerido: TipoMovimentacao | null;
  categoria_sugerida_id: string | null;
  confianca_extracao: number | null;
  dados_extraidos_raw: string | null;
  dados_estruturados: string | null;
  observacoes_ia: string | null;
  resumo_executivo: string | null;
  lancamento_id: string | null;
  usuario_conferencia_id: string | null;
  data_conferencia: string | null;
  motivo_rejeicao: string | null;
  motivo_exclusao: string | null;
  exclusao_permanente: boolean | null;
  excluido_por: string | null;
  data_exclusao: string | null;
  tentativas_processamento: number;
  ultimo_erro: string | null;
  arquivo_data: ArrayBuffer | null;
  criado_em: string;
  atualizado_em: string;
  excluido_em: string | null;
}

export interface DocumentoAprendizado {
  id: string;
  empresa_id: string;
  chave_reconhecimento: string;
  categoria_id: string;
  tipo_movimentacao: TipoMovimentacao;
  frequencia: number;
  ultima_confirmacao: string;
  criado_em: string;
  atualizado_em: string;
}

export type DocumentoLogAcao =
  | "UPLOAD"
  | "PROCESSAMENTO_INICIADO"
  | "PROCESSAMENTO_CONCLUIDO"
  | "PROCESSAMENTO_ERRO"
  | "CONFERENCIA_ABERTA"
  | "DADOS_EDITADOS"
  | "CONFIRMADO"
  | "REJEITADO"
  | "REPROCESSADO"
  | "EXCLUIDO"
  | "MOVED_TO_TRASH"
  | "PERMANENTLY_DELETED"
  | "RESTAURADO"
  | "CRIADO_PREVISAO"
  | "DOWNLOAD";

export interface DocumentoLog {
  id: string;
  documento_id: string;
  empresa_id: string;
  usuario_id: string | null;
  acao: DocumentoLogAcao;
  detalhes: string | null;
  ip_origem: string | null;
  criado_em: string;
}

export interface DocumentoConfiguracao {
  id: string;
  empresa_id: string;
  retencao_dias: number;
  notificar_email: boolean;
  notificar_sistema: boolean;
  auto_sugerir_categoria: boolean;
  limite_tamanho_mb: number;
  criado_em: string;
  atualizado_em: string;
}

export interface DocumentoTrashItem {
  id: string;
  documento_id: string;
  empresa_id: string;
  nome_arquivo_original: string;
  tipo_arquivo: TipoArquivo;
  tamanho_bytes: number;
  status_original: DocumentoStatus;
  motivo_exclusao: string;
  excluido_por: string;
  dados_documento: string;
  criado_em: string;
  excluido_em: string;
  restore_until: string;
}

export interface DocumentoStats {
  total: number;
  aguardando: number;
  processando: number;
  convertidos_mes: number;
  rejeitados_mes: number;
  economia_estimada_minutos: number;
  valor_total_automatizado: number;
}

export type ReciboTipo = "recebimento" | "pagamento";
export type ReciboStatus = "emitido" | "cancelado";
export type ReciboOrigem = "manual" | "lancamento";

export interface CancelamentoRecibo {
  motivo: string;
  canceladoEm: string;
  canceladoPor: string;
}

export interface EventoAuditoria {
  id: string;
  reciboId: string;
  acao: "criado" | "editado" | "cancelado" | "pdf_baixado" | "impresso";
  realizadoEm: string;
  realizadoPor: string;
  detalhes?: Record<string, unknown>;
}

export interface Receipt {
  id: string;
  company: string;
  numero: string;
  tipo: ReciboTipo;
  status: ReciboStatus;
  nomePagador: string;
  documentoPagador: string;
  nomeRecebedor: string;
  documentoRecebedor: string;
  data: string;
  valor: number;
  valorPorExtenso: string;
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
  origem: ReciboOrigem;
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  cancelamento?: CancelamentoRecibo | null;
}

export interface SignatureConfig {
  id: string;
  company: string;
  imagemBase64: string | null;
  nomeResponsavel: string;
  cargo: string;
  permitirUso: boolean;
}
