"use client";

import { db } from "../dexie";
import type { AppUser } from "@/types";
import { generateId } from "@/lib/utils";

export const UserRepository = {
  async getAll(): Promise<AppUser[]> {
    return db.users.toArray();
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
};
