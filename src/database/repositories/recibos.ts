import { db } from "@/database/dexie";
import { gerarProximoNumeroRecibo } from "@/services/recibos/gerarNumeroRecibo";
import { valorPorExtenso } from "@/services/recibos/valorPorExtenso";
import type { Receipt, CancelamentoRecibo } from "@/types";

export const RecibosRepository = {
  async getAll(company: string): Promise<Receipt[]> {
    return db.recibos.where("company").equals(company).reverse().sortBy("criadoEm");
  },

  async getById(id: string): Promise<Receipt | undefined> {
    return db.recibos.get(id);
  },

  async getByLancamentoId(lancamentoId: string): Promise<Receipt | undefined> {
    return db.recibos.where("lancamentoId").equals(lancamentoId).first();
  },

  async getCompanyFromRecibo(id: string): Promise<string | undefined> {
    const recibo = await db.recibos.get(id);
    return recibo?.company;
  },

  async create(data: Omit<Receipt, "id" | "numero" | "valorPorExtenso" | "criadoEm" | "atualizadoEm">): Promise<Receipt> {
    const numero = gerarProximoNumeroRecibo();
    const now = new Date().toISOString();
    const recibo: Receipt = {
      ...data,
      id: crypto.randomUUID(),
      numero,
      valorPorExtenso: valorPorExtenso(data.valor),
      criadoEm: now,
      atualizadoEm: now,
    };
    await db.recibos.add(recibo);
    return recibo;
  },

  async update(id: string, data: Partial<Omit<Receipt, "id" | "numero" | "criadoEm">>): Promise<void> {
    const updateData: Record<string, unknown> = { ...data, atualizadoEm: new Date().toISOString() };
    if (data.valor !== undefined) {
      updateData.valorPorExtenso = valorPorExtenso(data.valor);
    }
    await db.recibos.update(id, updateData);
  },

  async cancelar(id: string, cancelamento: CancelamentoRecibo): Promise<void> {
    await db.recibos.update(id, {
      status: "cancelado",
      cancelamento,
      atualizadoEm: new Date().toISOString(),
    });
  },

  async delete(id: string): Promise<void> {
    await db.recibos.delete(id);
  },
};
