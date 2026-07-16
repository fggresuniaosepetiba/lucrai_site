"use client";

import { db } from "../dexie";
import type { Transaction, TransactionType } from "@/types";
import { generateId, getNextDisplayId, validateTransactionDate, parseLocalDate } from "@/lib/utils";
import { AuditRepository } from "./audit";

export const TransactionRepository = {
  async getAll(company: string): Promise<Transaction[]> {
    const all = await db.transactions
      .where("company")
      .equals(company)
      .toArray();
    return all.sort((a, b) => a.displayId.localeCompare(b.displayId));
  },

  async getById(id: string): Promise<Transaction | undefined> {
    return db.transactions.get(id);
  },

  async getByType(type: TransactionType, company: string): Promise<Transaction[]> {
    const all = await db.transactions
      .where("type")
      .equals(type)
      .filter((t) => t.company === company)
      .toArray();
    return all.sort((a, b) => a.displayId.localeCompare(b.displayId));
  },

  async getByMonth(year: number, month: number, company: string): Promise<Transaction[]> {
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const end = `${year}-${String(month).padStart(2, "0")}-31`;
    return db.transactions
      .where("date")
      .between(start, end, true, true)
      .filter((t) => t.company === company)
      .toArray();
  },

  async create(data: Omit<Transaction, "id" | "displayId" | "createdAt" | "updatedAt" | "company" | "createdBy">, company: string, userName?: string): Promise<Transaction> {
    const dateCheck = validateTransactionDate(data.date);
    if (!dateCheck.valid) throw new Error(dateCheck.message);
    if (data.value > 999999999999.99) throw new Error("Valor excede o limite máximo permitido de R$ 999.999.999.999,99");
    if (data.description && data.description.length > 300) throw new Error("Descrição excede o limite máximo de 300 caracteres");
    const now = new Date().toISOString();
    const all = await db.transactions.where("company").equals(company).toArray();
    const displayId = await getNextDisplayId(all);
    const transaction: Transaction = {
      ...data,
      company,
      createdBy: "",
      id: generateId(),
      displayId,
      createdAt: now,
      updatedAt: now,
    };
    await db.transactions.add(transaction);

    await AuditRepository.log({
      entityId: transaction.id,
      entityType: "transaction",
      displayId: transaction.displayId,
      action: "created",
      description: `Lançamento ${transaction.displayId} - ${transaction.description} criado`,
      user: userName || "Sistema",
      company,
    });

    return transaction;
  },

  async update(id: string, data: Partial<Transaction>, userName?: string): Promise<void> {
    const existing = await db.transactions.get(id);
    if (data.date) {
      const dateCheck = validateTransactionDate(data.date);
      if (!dateCheck.valid) throw new Error(dateCheck.message);
    }
    if (data.value && data.value > 999999999999.99) throw new Error("Valor excede o limite máximo permitido de R$ 999.999.999.999,99");
    if (data.description && data.description.length > 300) throw new Error("Descrição excede o limite máximo de 300 caracteres");
    await db.transactions.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });

    if (existing) {
      await AuditRepository.log({
        entityId: id,
        entityType: "transaction",
        displayId: existing.displayId,
        action: "edited",
        description: `Lançamento ${existing.displayId} - ${existing.description} editado`,
        user: userName || "Sistema",
        company: existing.company,
      });
    }
  },

  async delete(id: string): Promise<void> {
    await db.transactions.delete(id);
  },

  async getSummary(year: number, month: number, company: string) {
    const transactions = await this.getByMonth(year, month, company);
    const incomes = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.value, 0);
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.value, 0);
    return { incomes, expenses, balance: incomes - expenses, transactions };
  },

  async getYearlySummary(year: number, company: string) {
    const all = await db.transactions
      .where("company")
      .equals(company)
      .filter((t) => parseLocalDate(t.date).getFullYear() === year)
      .toArray();
    const incomes = all
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.value, 0);
    const expenses = all
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.value, 0);
    return { incomes, expenses, balance: incomes - expenses, total: all.length };
  },

  async getAllBalance(company: string) {
    const all = await db.transactions
      .where("company")
      .equals(company)
      .toArray();
    const incomes = all
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.value, 0);
    const expenses = all
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.value, 0);
    return { incomes, expenses, balance: incomes - expenses };
  },
};
