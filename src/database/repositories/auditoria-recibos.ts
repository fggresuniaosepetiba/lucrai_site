import { db } from "@/database/dexie";
import type { EventoAuditoria } from "@/types";

export const AuditoriaRecibosRepository = {
  async registrar(evento: Omit<EventoAuditoria, "id">): Promise<EventoAuditoria> {
    const ev: EventoAuditoria = {
      ...evento,
      id: crypto.randomUUID(),
    };
    await db.eventosAuditoria.add(ev);
    return ev;
  },

  async listarPorRecibo(reciboId: string): Promise<EventoAuditoria[]> {
    return db.eventosAuditoria.where("reciboId").equals(reciboId).sortBy("realizadoEm");
  },

  async listarTodos(): Promise<EventoAuditoria[]> {
    return db.eventosAuditoria.toArray().then((arr) =>
      arr.sort((a, b) => b.realizadoEm.localeCompare(a.realizadoEm))
    );
  },
};
