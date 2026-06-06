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
    if (data.name && data.name.length > 120) throw new Error("Nome da categoria excede o limite máximo de 120 caracteres");
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
    if (data.name && data.name.length > 120) throw new Error("Nome da categoria excede o limite máximo de 120 caracteres");
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

  async findDuplicates(
    company: string
  ): Promise<
    { name: string; type: TransactionType; ids: string[]; keepId: string; count: number }[]
  > {
    const all = await db.categories.where("company").equals(company).toArray();
    const map = new Map<string, Category[]>();

    for (const cat of all) {
      const key = `${cat.name.toLowerCase().trim()}||${cat.type}`;
      const arr = map.get(key) || [];
      arr.push(cat);
      map.set(key, arr);
    }

    const result: {
      name: string;
      type: TransactionType;
      ids: string[];
      keepId: string;
      count: number;
    }[] = [];

    for (const [, cats] of map) {
      if (cats.length > 1) {
        cats.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        result.push({
          name: cats[0].name,
          type: cats[0].type,
          ids: cats.map((c) => c.id),
          keepId: cats[0].id,
          count: cats.length,
        });
      }
    }

    return result;
  },

  async removeDuplicates(company: string): Promise<number> {
    const duplicates = await this.findDuplicates(company);
    let removed = 0;

    for (const dup of duplicates) {
      const toDelete = dup.ids.filter((id) => id !== dup.keepId);
      for (const id of toDelete) {
        await db.transactions
          .where("categoryId")
          .equals(id)
          .modify({ categoryId: dup.keepId, categoryName: dup.name });
        await db.categories.delete(id);
        removed++;
      }
    }

    return removed;
  },
};
