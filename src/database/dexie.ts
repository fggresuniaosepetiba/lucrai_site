import Dexie, { type Table } from "dexie";
import type { Transaction, Category, AppUser, AppSettings, DeletedTransaction, CashForecast } from "@/types";

export class LucraiDatabase extends Dexie {
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;
  users!: Table<AppUser, string>;
  settings!: Table<AppSettings, string>;
  deletedTransactions!: Table<DeletedTransaction, string>;
  cashForecasts!: Table<CashForecast, string>;

  constructor() {
    super("lucrai-core");

    this.version(5).stores({
      transactions: "id, type, categoryId, date, createdAt, company",
      categories: "id, type, name, company",
      users: "id, email, role, company",
      settings: "id, company",
      deletedTransactions: "id, originalId, deletedAt, restoreUntil, company",
      cashForecasts: "id, type, status, expectedDate, company",
    });
  }
}

export const db = new LucraiDatabase();
