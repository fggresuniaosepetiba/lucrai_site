"use client";

import { db } from "../dexie";
import type { AppSettings } from "@/types";

export const SettingsRepository = {
  async get(company: string): Promise<AppSettings | undefined> {
    return db.settings.get(company);
  },

  async save(data: AppSettings): Promise<void> {
    await db.settings.put(data);
  },

  async update(company: string, data: Partial<AppSettings>): Promise<void> {
    const existing = await this.get(company);
    if (existing) {
      await db.settings.put({ ...existing, ...data, id: company });
    } else {
      await db.settings.put({
        id: company,
        companyName: "Minha Empresa",
        primaryColor: "#0ea5e9",
        company,
        ...data,
      });
    }
  },
};
