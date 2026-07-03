"use client";

import { db } from "../dexie";
import type { Insumo } from "@/types";
import { generateId } from "@/lib/utils";

export const InsumosRepository = {
  async getAll(company: string): Promise<Insumo[]> {
    return db.insumos
      .where("company")
      .equals(company)
      .reverse()
      .sortBy("createdAt");
  },

  async getById(id: string): Promise<Insumo | undefined> {
    return db.insumos.get(id);
  },

  async search(company: string, query: string): Promise<Insumo[]> {
    const all = await this.getAll(company);
    const lower = query.toLowerCase();
    return all.filter(
      (i) =>
        i.nome.toLowerCase().includes(lower) ||
        i.categoria.toLowerCase().includes(lower)
    );
  },

  async create(
    data: Omit<Insumo, "id" | "createdAt" | "updatedAt" | "company">,
    company: string
  ): Promise<Insumo> {
    const custoPorUnidade =
      data.quantidadeComprada > 0
        ? data.valorPago / data.quantidadeComprada
        : 0;

    const now = new Date().toISOString();
    const record: Insumo = {
      ...data,
      id: generateId(),
      company,
      custoPorUnidade,
      createdAt: now,
      updatedAt: now,
    };
    await db.insumos.add(record);
    return record;
  },

  async update(id: string, data: Partial<Insumo>): Promise<void> {
    if (data.valorPago !== undefined && data.quantidadeComprada !== undefined) {
      data.custoPorUnidade =
        data.quantidadeComprada > 0
          ? data.valorPago / data.quantidadeComprada
          : 0;
    } else if (data.valorPago !== undefined) {
      const existing = await this.getById(id);
      if (existing) {
        data.custoPorUnidade =
          existing.quantidadeComprada > 0
            ? data.valorPago / existing.quantidadeComprada
            : 0;
      }
    } else if (data.quantidadeComprada !== undefined) {
      const existing = await this.getById(id);
      if (existing) {
        data.custoPorUnidade =
          data.quantidadeComprada > 0
            ? existing.valorPago / data.quantidadeComprada
            : 0;
      }
    }

    await db.insumos.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  async delete(id: string): Promise<void> {
    await db.insumos.delete(id);
  },
};
