"use client";

import { db } from "../dexie";
import type { Transaction, CashForecast, DeletedTransaction } from "@/types";
import { generateId } from "@/lib/utils";
import { AuditRepository } from "./audit";

export const TrashRepository = {
  async getAll(company: string): Promise<DeletedTransaction[]> {
    const now = new Date().toISOString();
    const all = await db.deletedTransactions
      .where("company")
      .equals(company)
      .toArray();
    return all
      .filter((t) => t.restoreUntil > now)
      .sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
  },

  async getAllExpired(): Promise<DeletedTransaction[]> {
    const now = new Date().toISOString();
    return db.deletedTransactions
      .filter((t) => t.restoreUntil <= now)
      .toArray();
  },

  async moveToTrash(
    transaction: Transaction,
    reason: string,
    userName?: string
  ): Promise<DeletedTransaction> {
    const now = new Date();
    const restoreUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const deleted: DeletedTransaction = {
      id: generateId(),
      originalId: transaction.id,
      displayId: transaction.displayId,
      entryType: "transaction",
      type: transaction.type,
      value: transaction.value,
      categoryId: transaction.categoryId,
      categoryName: transaction.categoryName,
      description: transaction.description,
      date: transaction.date,
      observation: transaction.observation,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      createdBy: transaction.createdBy,
      company: transaction.company,
      deletedAt: now.toISOString(),
      reason,
      restoreUntil: restoreUntil.toISOString(),
    };

    await db.transactions.delete(transaction.id);
    await db.deletedTransactions.add(deleted);

    await AuditRepository.log({
      entityId: transaction.id,
      entityType: "transaction",
      displayId: transaction.displayId,
      action: "moved_to_trash",
      description: `Lançamento ${transaction.displayId} - ${transaction.description} movido para lixeira`,
      user: userName || "Sistema",
      company: transaction.company,
      details: reason,
    });

    return deleted;
  },

  async restore(id: string, userName?: string): Promise<Transaction | CashForecast | null> {
    const deleted = await db.deletedTransactions.get(id);
    if (!deleted) return null;

    if (deleted.entryType === "forecast") {
      const restored: CashForecast = {
        id: deleted.originalId,
        displayId: deleted.displayId,
        type: deleted.type,
        description: deleted.description,
        amount: deleted.amount ?? 0,
        category: deleted.category ?? "",
        expectedDate: deleted.expectedDate ?? "",
        status: deleted.status ?? "predicted",
        notes: deleted.notes,
        company: deleted.company,
        createdBy: deleted.createdBy,
        createdAt: deleted.createdAt,
        updatedAt: new Date().toISOString(),
        cancelledReason: deleted.cancelledReason,
        cancelledAt: deleted.cancelledAt,
        cancelledBy: deleted.cancelledBy,
      };

      await db.cashForecasts.add(restored);
      await db.deletedTransactions.delete(id);

      await AuditRepository.log({
        entityId: deleted.originalId,
        entityType: "forecast",
        displayId: deleted.displayId,
        action: "restored",
        description: `Previsão ${deleted.displayId} - ${deleted.description} restaurada da lixeira`,
        user: userName || "Sistema",
        company: deleted.company,
      });

      return restored;
    }

    const restored: Transaction = {
      id: deleted.originalId,
      displayId: deleted.displayId,
      type: deleted.type,
      value: deleted.value ?? 0,
      categoryId: deleted.categoryId ?? "",
      categoryName: deleted.categoryName ?? "",
      description: deleted.description,
      date: deleted.date ?? "",
      observation: deleted.observation,
      company: deleted.company,
      createdBy: deleted.createdBy,
      createdAt: deleted.createdAt,
      updatedAt: new Date().toISOString(),
    };

    await db.transactions.add(restored);
    await db.deletedTransactions.delete(id);

    await AuditRepository.log({
      entityId: deleted.originalId,
      entityType: "transaction",
      displayId: deleted.displayId,
      action: "restored",
      description: `Lançamento ${deleted.displayId} - ${deleted.description} restaurado da lixeira`,
      user: userName || "Sistema",
      company: deleted.company,
    });

    return restored;
  },

  async permanentlyDelete(id: string, userName?: string): Promise<void> {
    const deleted = await db.deletedTransactions.get(id);
    await db.deletedTransactions.delete(id);

    if (deleted) {
      const entityType = deleted.entryType === "forecast" ? "forecast" : "transaction";
      await AuditRepository.log({
        entityId: deleted.originalId,
        entityType,
        displayId: deleted.displayId,
        action: "deleted",
        description: `${entityType === "forecast" ? "Previsão" : "Lançamento"} ${deleted.displayId} - ${deleted.description} excluído permanentemente`,
        user: userName || "Sistema",
        company: deleted.company,
      });
    }
  },

  async cleanup(): Promise<number> {
    const expired = await this.getAllExpired();
    const ids = expired.map((t) => t.id);
    await db.deletedTransactions.bulkDelete(ids);
    return ids.length;
  },
};
