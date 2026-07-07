export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserInfo;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  company: string;
  plan: string;
  mustChangePassword: boolean;
}

export interface AuthUserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  company: string;
  plan: string;
  mustChangePassword: boolean;
  avatar: string | null;
  active: boolean;
  createdAt: string;
}

export interface ApiTransaction {
  id: string;
  displayId: string;
  type: "Income" | "Expense";
  value: number;
  categoryId: string;
  categoryName: string;
  description: string;
  date: string;
  observation: string | null;
  company: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCashForecast {
  id: string;
  displayId: string;
  type: "Income" | "Expense";
  description: string;
  amount: number;
  category: string;
  expectedDate: string;
  status: "Predicted" | "Received" | "Paid" | "Cancelled";
  notes: string | null;
  company: string;
  createdAt: string;
  updatedAt: string;
  cancelledReason: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;
  isRecurring: boolean;
  recurrenceType: string | null;
  recurrenceEndDate: string | null;
}

export interface ApiCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: "Income" | "Expense";
  company: string;
  createdAt: string;
}

export interface ApiForecastTotals {
  predictedIncomes: number;
  predictedExpenses: number;
  allIncomes: number;
  allExpenses: number;
}

export interface ApiSummary {
  incomes: number;
  expenses: number;
  balance: number;
  total?: number;
}

export interface ApiBalance {
  incomes: number;
  expenses: number;
  balance: number;
}

export interface ApiDashboardAlert {
  id: string;
  tipo: string;
  categoria: string;
  titulo: string;
  descricao: string;
  dadosContextuais: { label: string; valor: string }[];
  acaoLabel: string;
  acaoHref: string;
  dispensado: boolean;
  geradoEm: string;
}

export interface ApiHealthResponse {
  score: number;
  label: string;
  cor: string;
  bg: string;
  subIndicadores: { nome: string; score: number; tooltip: string }[];
}

export interface ApiRunwayResponse {
  meses: number;
  dias: number;
  status: string;
  label: string;
}

export interface ApiBreakEvenResponse {
  valor: number;
  percentualAtingido: number;
  acima: boolean;
}

export interface ApiSparklinePoint {
  mes: string;
  valor: number;
}

export interface ApiNotaCFOResponse {
  resumo: string;
  nota: string;
  pontosForca: string[];
  pontosAtencao: string[];
}

export interface ApiAcaoRecomendada {
  titulo: string;
  descricao: string;
  prioridade: string;
  categoria: string;
  link: string | null;
}

// ============ PRICING ============
export interface ApiPricingProduct {
  id: string;
  name: string;
  category: string;
  sku: string | null;
  description: string | null;
  rawMaterial: number;
  packaging: number;
  labor: number;
  freight: number;
  otherCosts: number;
  totalCost: number;
  taxes: number;
  cardFee: number;
  marketplaceFee: number;
  commission: number;
  otherFees: number;
  totalFees: number;
  desiredMargin: number;
  minPrice: number;
  healthyPrice: number;
  premiumPrice: number;
  netMargin: number;
  company: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ============ SETTINGS ============
export interface ApiSettings {
  id: string;
  companyName: string;
  logoUrl: string | null;
  primaryColor: string;
  company: string;
}

// ============ USERS ============
export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  plan: string;
  mustChangePassword: boolean;
  avatar: string | null;
  active: boolean;
  createdAt: string;
}

// ============ TRASH ============
export interface ApiTrashItem {
  id: string;
  originalId: string;
  displayId: string;
  entryType: string;
  type: string;
  value: number | null;
  categoryName: string | null;
  description: string;
  date: string | null;
  amount: number | null;
  category: string | null;
  expectedDate: string | null;
  status: string | null;
  company: string;
  deletedAt: string;
  reason: string;
  restoreUntil: string;
}

export interface ApiRestoreResponse {
  id: string;
  message: string;
}

export interface ApiCleanupResponse {
  removedCount: number;
}

// ============ AUDIT ============
export interface ApiAuditLog {
  id: string;
  entityId: string;
  entityType: string;
  displayId: string;
  action: string;
  description: string;
  user: string;
  company: string;
  timestamp: string;
  details: string | null;
}

// ============ CONTAS (Company Registration) ============
export interface ApiConta {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  porte: string;
  faturamento: string;
  origem: string;
  plano: string;
  createdAt: string;
}
