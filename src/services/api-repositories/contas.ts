import { api } from "@/services/api";
import type { ApiConta } from "@/types/api";

export const ContasRepositoryApi = {
  async getAll(): Promise<ApiConta[]> {
    return api.get<ApiConta[]>("/api/contas");
  },

  async create(data: {
    nome: string;
    email: string;
    telefone: string;
    senha: string;
    empresa: string;
    porte: string;
    faturamento: string;
    origem: string;
    plano: string;
  }): Promise<ApiConta> {
    return api.post<ApiConta>("/api/contas", data, true);
  },
};
