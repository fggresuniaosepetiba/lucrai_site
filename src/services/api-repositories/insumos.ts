import { api } from "@/services/api";
import type { ApiInsumo } from "@/types/api";
import type { Insumo, UnidadeMedida } from "@/types";

function mapInsumo(i: ApiInsumo): Insumo {
  return {
    id: i.id,
    nome: i.nome,
    categoria: i.categoria,
    unidadeMedida: i.unidadeMedida as UnidadeMedida,
    quantidadeComprada: i.quantidadeComprada,
    valorPago: i.valorPago,
    custoPorUnidade: i.custoPorUnidade,
    company: i.company,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
  };
}

export const InsumoRepositoryApi = {
  async getAll(): Promise<Insumo[]> {
    const data = await api.get<ApiInsumo[]>("/api/insumos");
    return data.map(mapInsumo);
  },

  async getById(id: string): Promise<Insumo | undefined> {
    try {
      const data = await api.get<ApiInsumo>(`/api/insumos/${id}`);
      return mapInsumo(data);
    } catch (err) {
      console.error("insumos.getById:", err);
      return undefined;
    }
  },

  async create(
    data: Omit<Insumo, "id" | "createdAt" | "updatedAt" | "company" | "custoPorUnidade">
  ): Promise<Insumo> {
    const created = await api.post<ApiInsumo>("/api/insumos", {
      nome: data.nome,
      categoria: data.categoria,
      unidadeMedida: data.unidadeMedida,
      quantidadeComprada: data.quantidadeComprada,
      valorPago: data.valorPago,
    });
    return mapInsumo(created);
  },

  async update(id: string, data: Partial<Insumo>): Promise<void> {
    await api.put(`/api/insumos/${id}`, {
      nome: data.nome,
      categoria: data.categoria,
      unidadeMedida: data.unidadeMedida,
      quantidadeComprada: data.quantidadeComprada,
      valorPago: data.valorPago,
    });
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/insumos/${id}`);
  },
};
