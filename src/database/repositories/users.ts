"use client";

import { db } from "../dexie";
import type { AppUser } from "@/types";
import { generateId } from "@/lib/utils";
import { AuditRepository } from "./audit";

export const UserRepository = {
  async getAll(): Promise<AppUser[]> {
    return db.users.toArray();
  },

  async getActive(): Promise<AppUser[]> {
    return db.users.filter((u) => u.active !== false).toArray();
  },

  async getById(id: string): Promise<AppUser | undefined> {
    return db.users.get(id);
  },

  async findByEmail(email: string): Promise<AppUser | undefined> {
    return db.users.where("email").equals(email).first();
  },

  async create(data: Omit<AppUser, "id" | "createdAt">): Promise<AppUser> {
    const user: AppUser = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    await db.users.add(user);
    return user;
  },

  async update(id: string, data: Partial<AppUser>): Promise<void> {
    await db.users.update(id, data);
  },

  async delete(id: string): Promise<void> {
    await db.users.delete(id);
  },

  async softDelete(id: string, reason: string, deletedBy: string): Promise<AppUser | undefined> {
    const user = await db.users.get(id);
    if (!user) return undefined;
    await db.users.update(id, { active: false });
    await AuditRepository.log({
      entityId: id,
      entityType: "user",
      displayId: user.email,
      action: "deleted",
      description: `Usuário "${user.name}" excluído por "${deletedBy}"`,
      user: deletedBy,
      company: user.company,
      details: JSON.stringify({
        userId: id,
        userName: user.name,
        userEmail: user.email,
        company: user.company,
        reason,
        deletedBy,
        deletedAt: new Date().toISOString(),
      }),
    });
    return { ...user, active: false };
  },
};
