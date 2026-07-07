import { api } from "@/services/api";
import type { ApiAuditLog } from "@/types/api";
import type { AuditLog, AuditAction } from "@/types";

function mapAuditLog(l: ApiAuditLog): AuditLog {
  return {
    id: l.id,
    entityId: l.entityId,
    entityType: l.entityType as "transaction" | "forecast" | "user",
    displayId: l.displayId,
    action: l.action as AuditAction,
    description: l.description,
    user: l.user,
    company: l.company,
    timestamp: l.timestamp,
    details: l.details ?? undefined,
  };
}

export const AuditRepositoryApi = {
  async getAll(): Promise<AuditLog[]> {
    const data = await api.get<ApiAuditLog[]>("/api/audit");
    return data.map(mapAuditLog);
  },

  async getByEntity(entityId: string): Promise<AuditLog[]> {
    const data = await api.get<ApiAuditLog[]>(`/api/audit/entity/${entityId}`);
    return data.map(mapAuditLog);
  },

  async getByAction(action: string): Promise<AuditLog[]> {
    const data = await api.get<ApiAuditLog[]>(`/api/audit/action/${action}`);
    return data.map(mapAuditLog);
  },
};
