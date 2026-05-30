export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
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
  type: TransactionType;
  value: number;
  categoryId: string;
  categoryName: string;
  description: string;
  date: string;
  observation?: string;
  createdAt: string;
  updatedAt: string;
  company: string;
  deletedAt: string;
  reason: string;
  restoreUntil: string;
}

export interface MonthlySummary {
  month: string;
  year: number;
  incomes: number;
  expenses: number;
  balance: number;
}
