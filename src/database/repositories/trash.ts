"use client";

import { db } from "../dexie";
import type { Transaction, DeletedTransaction } from "@/types";
import { generateId } from "@/lib/utils";

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
    reason: string
  ): Promise<DeletedTransaction> {
    const now = new Date();
    const restoreUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const deleted: DeletedTransaction = {
      id: generateId(),
      originalId: transaction.id,
      type: transaction.type,
      value: transaction.value,
      categoryId: transaction.categoryId,
      categoryName: transaction.categoryName,
      description: transaction.description,
      date: transaction.date,
      observation: transaction.observation,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      company: transaction.company,
      deletedAt: now.toISOString(),
      reason,
      restoreUntil: restoreUntil.toISOString(),
    };

    await db.transactions.delete(transaction.id);
    await db.deletedTransactions.add(deleted);
    return deleted;
  },

  async restore(id: string): Promise<Transaction | null> {
    const deleted = await db.deletedTransactions.get(id);
    if (!deleted) return null;

    const restored: Transaction = {
      id: deleted.originalId,
      type: deleted.type,
      value: deleted.value,
      categoryId: deleted.categoryId,
      categoryName: deleted.categoryName,
      description: deleted.description,
      date: deleted.date,
      observation: deleted.observation,
      createdAt: deleted.createdAt,
      updatedAt: new Date().toISOString(),
      company: deleted.company,
    };

    await db.transactions.add(restored);
    await db.deletedTransactions.delete(id);
    return restored;
  },

  async permanentlyDelete(id: string): Promise<void> {
    await db.deletedTransactions.delete(id);
  },

  async cleanup(): Promise<number> {
    const expired = await this.getAllExpired();
    const ids = expired.map((t) => t.id);
    await db.deletedTransactions.bulkDelete(ids);
    return ids.length;
  },
};
