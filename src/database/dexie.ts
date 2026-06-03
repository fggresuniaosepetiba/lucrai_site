import Dexie, { type Table } from "dexie";
import type { Transaction, Category, AppUser, AppSettings, DeletedTransaction, CashForecast, AuditLog, PricingProduct } from "@/types";

export class LucraiDatabase extends Dexie {
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;
  users!: Table<AppUser, string>;
  settings!: Table<AppSettings, string>;
  deletedTransactions!: Table<DeletedTransaction, string>;
  cashForecasts!: Table<CashForecast, string>;
  auditLogs!: Table<AuditLog, string>;
  pricingProducts!: Table<PricingProduct, string>;

  constructor() {
    super("lucrai-core");

    this.version(7).stores({
      pricingProducts: "id, name, category, company, createdAt",
      transactions: "id, displayId, type, categoryId, date, createdAt, company",
      categories: "id, type, name, company",
      users: "id, email, role, company",
      settings: "id, company",
      deletedTransactions: "id, originalId, displayId, deletedAt, restoreUntil, company",
      cashForecasts: "id, displayId, type, status, expectedDate, company",
      auditLogs: "id, entityId, entityType, action, company, timestamp",
    });
  }
}

export const db = new LucraiDatabase();

export async function migrateDisplayIds(): Promise<void> {
  const txsWithoutId = await db.transactions
    .filter((t) => !t.displayId)
    .toArray();
  for (let i = 0; i < txsWithoutId.length; i++) {
    const num = String(i + 1).padStart(3, "0");
    await db.transactions.update(txsWithoutId[i].id, { displayId: `#${num}` });
  }

  const forecastsWithoutId = await db.cashForecasts
    .filter((f) => !f.displayId)
    .toArray();
  for (let i = 0; i < forecastsWithoutId.length; i++) {
    const num = String(i + 1).padStart(3, "0");
    await db.cashForecasts.update(forecastsWithoutId[i].id, { displayId: `#${num}` });
  }

  const deletedWithoutId = await db.deletedTransactions
    .filter((d) => !d.displayId)
    .toArray();
  for (let i = 0; i < deletedWithoutId.length; i++) {
    const num = String(i + 1).padStart(3, "0");
    await db.deletedTransactions.update(deletedWithoutId[i].id, { displayId: `#${num}` });
  }
}

export async function fixCompanyName(): Promise<void> {
  const wrong = "Grão Natura";
  const correct = "Grão Natural";
  const users = await db.users.where("company").equals(wrong).toArray();
  for (const u of users) {
    await db.users.update(u.id, { company: correct });
  }
  const txs = await db.transactions.where("company").equals(wrong).toArray();
  for (const t of txs) {
    await db.transactions.update(t.id, { company: correct });
  }
  const cats = await db.categories.where("company").equals(wrong).toArray();
  for (const c of cats) {
    await db.categories.update(c.id, { company: correct });
  }
  const forecasts = await db.cashForecasts.where("company").equals(wrong).toArray();
  for (const f of forecasts) {
    await db.cashForecasts.update(f.id, { company: correct });
  }
  const deleted = await db.deletedTransactions.where("company").equals(wrong).toArray();
  for (const d of deleted) {
    await db.deletedTransactions.update(d.id, { company: correct });
  }
  const settings = await db.settings.where("companyName").equals(wrong).toArray();
  for (const s of settings) {
    await db.settings.update(s.id, { companyName: correct });
  }
}
