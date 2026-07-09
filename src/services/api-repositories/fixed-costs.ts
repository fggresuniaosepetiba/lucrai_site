import { api } from "@/services/api";
import type { ApiFixedCost, ApiFixedCostItem } from "@/types/api";
import type { FixedCost, CustomCostItem } from "@/types";

function mapFixedCost(f: ApiFixedCost): FixedCost {
  return {
    id: f.id,
    company: f.company,
    aluguel: f.aluguel,
    energia: f.energia,
    agua: f.agua,
    internet: f.internet,
    contador: f.contador,
    proLabore: f.proLabore,
    softwares: f.softwares,
    telefone: f.telefone,
    marketing: f.marketing,
    limpeza: f.limpeza,
    outros: f.outros,
    customCosts: (f.customCosts ?? []).map(mapCustomCostItem),
    total: f.total,
    createdAt: f.createdAt,
    updatedAt: f.updatedAt,
  };
}

function mapCustomCostItem(c: ApiFixedCostItem): CustomCostItem {
  return { id: c.id, name: c.name, value: c.value };
}

export const FixedCostRepositoryApi = {
  async get(): Promise<FixedCost | undefined> {
    try {
      const data = await api.get<ApiFixedCost>("/api/fixed-costs");
      return mapFixedCost(data);
    } catch (err) {
      console.error("fixed-costs.get:", err);
      return undefined;
    }
  },

  async save(data: {
    aluguel: number;
    energia: number;
    agua: number;
    internet: number;
    contador: number;
    proLabore: number;
    softwares: number;
    telefone: number;
    marketing: number;
    limpeza: number;
    outros: number;
    customCosts: CustomCostItem[];
  }): Promise<FixedCost> {
    const saved = await api.put<ApiFixedCost>("/api/fixed-costs", {
      aluguel: data.aluguel,
      energia: data.energia,
      agua: data.agua,
      internet: data.internet,
      contador: data.contador,
      proLabore: data.proLabore,
      softwares: data.softwares,
      telefone: data.telefone,
      marketing: data.marketing,
      limpeza: data.limpeza,
      outros: data.outros,
      customCosts: data.customCosts,
    });
    return mapFixedCost(saved);
  },
};
