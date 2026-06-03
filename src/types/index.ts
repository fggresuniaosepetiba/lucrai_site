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
