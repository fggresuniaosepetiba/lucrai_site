"use client";

import { db } from "../dexie";
import type { PricingProduct } from "@/types";
import { generateId } from "@/lib/utils";

export const PricingRepository = {
  async getAll(company: string): Promise<PricingProduct[]> {
    return db.pricingProducts
      .where("company")
      .equals(company)
      .reverse()
      .sortBy("createdAt");
  },

  async getById(id: string): Promise<PricingProduct | undefined> {
    return db.pricingProducts.get(id);
  },

  async create(data: Omit<PricingProduct, "id" | "createdAt" | "updatedAt" | "company" | "createdBy">, company: string, userName: string): Promise<PricingProduct> {
    const now = new Date().toISOString();
    const product: PricingProduct = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      company,
      createdBy: userName,
    };
    await db.pricingProducts.add(product);
    return product;
  },

  async update(id: string, data: Partial<PricingProduct>): Promise<void> {
    await db.pricingProducts.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  async delete(id: string): Promise<void> {
    await db.pricingProducts.delete(id);
  },
};
