import Dexie, { type Table } from "dexie";
import type { Transaction, Category, AppUser, AppSettings, DeletedTransaction } from "@/types";

export class LucraiDatabase extends Dexie {
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;
  users!: Table<AppUser, string>;
  settings!: Table<AppSettings, string>;
  deletedTransactions!: Table<DeletedTransaction, string>;

  constructor() {
    super("lucrai-core");

    this.version(4).stores({
      transactions: "id, type, categoryId, date, createdAt, company",
      categories: "id, type, name, company",
      users: "id, email, role, company",
      settings: "id, company",
      deletedTransactions: "id, originalId, deletedAt, restoreUntil, company",
    });
  }
}

export const db = new LucraiDatabase();
