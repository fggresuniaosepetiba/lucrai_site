"use client";

import { db } from "../dexie";
import { TransactionRepository } from "./transactions";
import { AuditRepository } from "./audit";
import type { CashForecast } from "@/types";
import { generateId, getNextDisplayId, validateForecastDate } from "@/lib/utils";

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
    data: Omit<CashForecast, "id" | "displayId" | "createdAt" | "updatedAt" | "company">,
    company: string,
    userName?: string
  ): Promise<CashForecast> {
    const dateCheck = validateForecastDate(data.expectedDate);
    if (!dateCheck.valid) throw new Error(dateCheck.message);
    const now = new Date().toISOString();
    const all = await db.cashForecasts.where("company").equals(company).toArray();
    const displayId = await getNextDisplayId(all);
    const forecast: CashForecast = {
      ...data,
      company,
      id: generateId(),
      displayId,
      createdAt: now,
      updatedAt: now,
    };
    await db.cashForecasts.add(forecast);

    await AuditRepository.log({
      entityId: forecast.id,
      entityType: "forecast",
      displayId: forecast.displayId,
      action: "created",
      description: `Previsão ${forecast.displayId} - ${forecast.description} criada`,
      user: userName || "Sistema",
      company,
    });

    return forecast;
  },

  async update(id: string, data: Partial<CashForecast>, userName?: string): Promise<void> {
    const existing = await db.cashForecasts.get(id);
    if (data.expectedDate) {
      const dateCheck = validateForecastDate(data.expectedDate);
      if (!dateCheck.valid) throw new Error(dateCheck.message);
    }
    await db.cashForecasts.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });

    if (existing) {
      await AuditRepository.log({
        entityId: id,
        entityType: "forecast",
        displayId: existing.displayId,
        action: "edited",
        description: `Previsão ${existing.displayId} - ${existing.description} editada`,
        user: userName || "Sistema",
        company: existing.company,
      });
    }
  },

  async delete(id: string): Promise<void> {
    await db.cashForecasts.delete(id);
  },

  async markAsReceived(id: string, company: string, userName?: string): Promise<void> {
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
      company,
      userName
    );

    await AuditRepository.log({
      entityId: id,
      entityType: "forecast",
      displayId: forecast.displayId,
      action: "received",
      description: `Previsão ${forecast.displayId} - ${forecast.description} marcada como RECEBIDA`,
      user: userName || "Sistema",
      company,
    });
  },

  async markAsPaid(id: string, company: string, userName?: string): Promise<void> {
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
      company,
      userName
    );

    await AuditRepository.log({
      entityId: id,
      entityType: "forecast",
      displayId: forecast.displayId,
      action: "paid",
      description: `Previsão ${forecast.displayId} - ${forecast.description} marcada como PAGA`,
      user: userName || "Sistema",
      company,
    });
  },

  async markAsCancelled(id: string, reason?: string, userName?: string): Promise<void> {
    const forecast = await db.cashForecasts.get(id);
    if (!forecast) return;

    const now = new Date().toISOString();
    await db.cashForecasts.update(id, {
      status: "cancelled",
      cancelledReason: reason,
      cancelledAt: now,
      cancelledBy: userName,
      updatedAt: now,
    });

    await AuditRepository.log({
      entityId: id,
      entityType: "forecast",
      displayId: forecast.displayId,
      action: "cancelled",
      description: `Previsão ${forecast.displayId} - ${forecast.description} cancelada`,
      user: userName || "Sistema",
      company: forecast.company,
      details: reason,
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
    const allIncomes = all
      .filter((f) => f.status !== "cancelled" && f.type === "income")
      .reduce((s, f) => s + f.amount, 0);
    const allExpenses = all
      .filter((f) => f.status !== "cancelled" && f.type === "expense")
      .reduce((s, f) => s + f.amount, 0);
    return { predictedIncomes, predictedExpenses, allIncomes, allExpenses };
  },
};
