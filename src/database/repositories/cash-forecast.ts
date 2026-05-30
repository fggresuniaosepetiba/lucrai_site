"use client";

import { db } from "../dexie";
import { TransactionRepository } from "./transactions";
import type { CashForecast, TransactionType } from "@/types";
import { generateId } from "@/lib/utils";

export const CashForecastRepository = {
  async getAll(company: string): Promise<CashForecast[]> {
    const all = await db.cashForecasts
      .where("company")
      .equals(company)
      .toArray();
    return all.sort(
      (a, b) => new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime()
    );
  },

  async getById(id: string): Promise<CashForecast | undefined> {
    return db.cashForecasts.get(id);
  },

  async getByStatus(status: CashForecast["status"], company: string): Promise<CashForecast[]> {
    const all = await db.cashForecasts
      .where("status")
      .equals(status)
      .filter((f) => f.company === company)
      .toArray();
    return all.sort(
      (a, b) => new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime()
    );
  },

  async create(
    data: Omit<CashForecast, "id" | "createdAt" | "updatedAt" | "company">,
    company: string
  ): Promise<CashForecast> {
    const now = new Date().toISOString();
    const forecast: CashForecast = {
      ...data,
      company,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    await db.cashForecasts.add(forecast);
    return forecast;
  },

  async update(id: string, data: Partial<CashForecast>): Promise<void> {
    await db.cashForecasts.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  async delete(id: string): Promise<void> {
    await db.cashForecasts.delete(id);
  },

  async markAsReceived(id: string, company: string): Promise<void> {
    const forecast = await db.cashForecasts.get(id);
    if (!forecast || forecast.status !== "predicted") return;

    await db.cashForecasts.update(id, {
      status: "received",
      updatedAt: new Date().toISOString(),
    });

    const today = new Date().toISOString().slice(0, 10);
    await TransactionRepository.create(
      {
        type: "income",
        value: forecast.amount,
        categoryId: "",
        categoryName: forecast.category || "Previsão Recebida",
        description: forecast.description,
        date: today,
        observation: `Previsto para ${forecast.expectedDate}`,
      },
      company
    );
  },

  async markAsPaid(id: string, company: string): Promise<void> {
    const forecast = await db.cashForecasts.get(id);
    if (!forecast || forecast.status !== "predicted") return;

    await db.cashForecasts.update(id, {
      status: "paid",
      updatedAt: new Date().toISOString(),
    });

    const today = new Date().toISOString().slice(0, 10);
    await TransactionRepository.create(
      {
        type: "expense",
        value: forecast.amount,
        categoryId: "",
        categoryName: forecast.category || "Previsão Paga",
        description: forecast.description,
        date: today,
        observation: `Previsto para ${forecast.expectedDate}`,
      },
      company
    );
  },

  async markAsCancelled(id: string): Promise<void> {
    await db.cashForecasts.update(id, {
      status: "cancelled",
      updatedAt: new Date().toISOString(),
    });
  },

  async getTotals(company: string) {
    const all = await this.getAll(company);
    const predictedIncomes = all
      .filter((f) => f.status === "predicted" && f.type === "income")
      .reduce((s, f) => s + f.amount, 0);
    const predictedExpenses = all
      .filter((f) => f.status === "predicted" && f.type === "expense")
      .reduce((s, f) => s + f.amount, 0);
    return { predictedIncomes, predictedExpenses };
  },
};
