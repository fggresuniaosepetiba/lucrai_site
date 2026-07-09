import { api } from "@/services/api";
import type { ApiSettings } from "@/types/api";
import type { AppSettings } from "@/types";

export const SettingsRepositoryApi = {
  async get(): Promise<AppSettings | undefined> {
    try {
      const data = await api.get<ApiSettings>("/api/settings");
      return mapSettings(data);
    } catch (err) {
      console.error("settings.get:", err);
      return undefined;
    }
  },

  async update(data: { companyName: string; logoUrl?: string; primaryColor: string }): Promise<AppSettings> {
    const updated = await api.put<ApiSettings>("/api/settings", {
      companyName: data.companyName,
      logoUrl: data.logoUrl ?? null,
      primaryColor: data.primaryColor,
    });
    return mapSettings(updated);
  },
};

function mapSettings(s: ApiSettings): AppSettings {
  return {
    id: s.id,
    companyName: s.companyName,
    logoUrl: s.logoUrl ?? undefined,
    primaryColor: s.primaryColor,
    company: s.company,
  };
}
