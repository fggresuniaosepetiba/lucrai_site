"use client";

import { db } from "../dexie";
import type { Transaction, TransactionType } from "@/types";
import { generateId } from "@/lib/utils";

export const TransactionRepository = {
  async getAll(company: string): Promise<Transaction[]> {
    const all = await db.transactions
      .where("company")
      .equals(company)
      .toArray();
    return all.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
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
    return all.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
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

  async create(data: Omit<Transaction, "id" | "createdAt" | "updatedAt" | "company">, company: string): Promise<Transaction> {
    const now = new Date().toISOString();
    const transaction: Transaction = {
      ...data,
      company,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    await db.transactions.add(transaction);
    return transaction;
  },

  async update(id: string, data: Partial<Transaction>): Promise<void> {
    await db.transactions.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
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
      .filter((t) => new Date(t.date).getFullYear() === year)
      .toArray();
    const incomes = all
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.value, 0);
    const expenses = all
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.value, 0);
    return { incomes, expenses, balance: incomes - expenses, total: all.length };
  },
};
