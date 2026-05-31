"use client";

import { db } from "../dexie";
import type { AuditLog, AuditAction } from "@/types";
import { generateId } from "@/lib/utils";

export const AuditRepository = {
  async log(params: {
    entityId: string;
    entityType: "transaction" | "forecast" | "user";
    displayId: string;
    action: AuditAction;
    description: string;
    user: string;
    company: string;
    details?: string;
  }): Promise<void> {
    const log: AuditLog = {
      id: generateId(),
      entityId: params.entityId,
      entityType: params.entityType,
      displayId: params.displayId,
      action: params.action,
      description: params.description,
      user: params.user,
      company: params.company,
      timestamp: new Date().toISOString(),
      details: params.details,
    };
    await db.auditLogs.add(log);
  },

  async getAll(company: string): Promise<AuditLog[]> {
    return db.auditLogs
      .where("company")
      .equals(company)
      .reverse()
      .toArray();
  },

  async getByEntity(entityId: string): Promise<AuditLog[]> {
    return db.auditLogs
      .where("entityId")
      .equals(entityId)
      .reverse()
      .toArray();
  },

  async getByAction(action: AuditAction, company: string): Promise<AuditLog[]> {
    return db.auditLogs
      .where("action")
      .equals(action)
      .filter((l) => l.company === company)
      .reverse()
      .toArray();
  },
};
