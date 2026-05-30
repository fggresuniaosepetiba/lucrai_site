"use client";

import { db } from "../dexie";
import type { Category, TransactionType } from "@/types";
import { generateId } from "@/lib/utils";

export const CategoryRepository = {
  async getAll(company: string): Promise<Category[]> {
    return db.categories.where("company").equals(company).toArray();
  },

  async getByType(type: TransactionType, company: string): Promise<Category[]> {
    return db.categories
      .where("type")
      .equals(type)
      .filter((c) => c.company === company)
      .toArray();
  },

  async create(data: Omit<Category, "id" | "createdAt" | "company">, company: string): Promise<Category> {
    const category: Category = {
      ...data,
      company,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    await db.categories.add(category);
    return category;
  },

  async update(id: string, data: Partial<Category>): Promise<void> {
    await db.categories.update(id, data);
  },

  async delete(id: string): Promise<void> {
    const count = await db.transactions
      .where("categoryId")
      .equals(id)
      .count();
    if (count > 0) {
      throw new Error(
        `Cannot delete category: ${count} transaction(s) use it.`
      );
    }
    await db.categories.delete(id);
  },
};
