import Dexie, { type Table } from "dexie";
import type { Transaction, Category, AppUser, AppSettings, DeletedTransaction, CashForecast, AuditLog, PricingProduct, Conta, DocumentoFinanceiro, DocumentoAprendizado, DocumentoLog, DocumentoConfiguracao, DocumentoTrashItem, Receipt, EventoAuditoria, SignatureConfig, FixedCost, Insumo } from "@/types";

export class LucraiDatabase extends Dexie {
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;
  users!: Table<AppUser, string>;
  settings!: Table<AppSettings, string>;
  deletedTransactions!: Table<DeletedTransaction, string>;
  cashForecasts!: Table<CashForecast, string>;
  auditLogs!: Table<AuditLog, string>;
  pricingProducts!: Table<PricingProduct, string>;
  contas!: Table<Conta, string>;
  documentos!: Table<DocumentoFinanceiro, string>;
  documentoAprendizado!: Table<DocumentoAprendizado, string>;
  documentoLogs!: Table<DocumentoLog, string>;
  documentoConfiguracoes!: Table<DocumentoConfiguracao, string>;
  documentoTrash!: Table<DocumentoTrashItem, string>;
  recibos!: Table<Receipt, string>;
  eventosAuditoria!: Table<EventoAuditoria, string>;
  configuracoesAssinatura!: Table<SignatureConfig, string>;
  fixedCosts!: Table<FixedCost, string>;
  insumos!: Table<Insumo, string>;

  constructor() {
    super("lucrai-core");

    this.version(14).stores({
      pricingProducts: "id, name, category, company, createdAt",
      transactions: "id, displayId, type, categoryId, date, createdAt, company",
      categories: "id, type, name, company",
      users: "id, email, role, company",
      settings: "id, company",
      deletedTransactions: "id, originalId, displayId, deletedAt, restoreUntil, company, createdBy",
      cashForecasts: "id, displayId, type, status, expectedDate, company, isRecurring",
      auditLogs: "id, entityId, entityType, action, company, timestamp",
      contas: "id, email, empresa, createdAt",
      documentos: "id, empresa_id, status, tipo_arquivo, hash_arquivo, criado_em, excluido_em, lancamento_id, *tipo_documento_detectado",
      documentoAprendizado: "id, empresa_id, chave_reconhecimento, categoria_id, frequencia",
      documentoLogs: "id, documento_id, empresa_id, usuario_id, acao, criado_em",
      documentoConfiguracoes: "id, empresa_id",
      documentoTrash: "id, documento_id, empresa_id, excluido_em, restore_until, excluido_por",
      recibos: "id, numero, tipo, status, data, lancamentoId, origem, criadoEm, company",
      eventosAuditoria: "id, reciboId, acao, realizadoEm, realizadoPor",
      configuracoesAssinatura: "id, company",
      fixedCosts: "id, company",
      insumos: "id, company, nome, categoria",
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
