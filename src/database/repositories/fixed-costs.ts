"use client";

import { db } from "../dexie";
import type { FixedCost } from "@/types";
import { generateId } from "@/lib/utils";

export const FixedCostsRepository = {
  async getByCompany(company: string): Promise<FixedCost | undefined> {
    return db.fixedCosts
      .where("company")
      .equals(company)
      .first();
  },

  async upsert(data: Omit<FixedCost, "id" | "createdAt" | "updatedAt">): Promise<FixedCost> {
    const existing = await this.getByCompany(data.company);

    if (existing) {
      const updated = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      await db.fixedCosts.update(existing.id, updated);
      return { ...existing, ...updated };
    }

    const now = new Date().toISOString();
    const record: FixedCost = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    await db.fixedCosts.add(record);
    return record;
  },
};
