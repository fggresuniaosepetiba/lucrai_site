import { api } from "@/services/api";
import type { ApiUser } from "@/types/api";
import type { AppUser } from "@/types";

function mapUser(u: ApiUser): AppUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    password: "",
    role: u.role as AppUser["role"],
    company: u.company,
    avatar: u.avatar ?? undefined,
    createdAt: u.createdAt,
    active: u.active,
  };
}

export const UserRepositoryApi = {
  async getAll(): Promise<AppUser[]> {
    const data = await api.get<ApiUser[]>("/api/users");
    return data.map(mapUser);
  },

  async getActive(): Promise<AppUser[]> {
    const data = await api.get<ApiUser[]>("/api/users/active");
    return data.map(mapUser);
  },

  async getById(id: string): Promise<AppUser | undefined> {
    try {
      const data = await api.get<ApiUser>(`/api/users/${id}`);
      return mapUser(data);
    } catch {
      return undefined;
    }
  },

  async create(data: { name: string; email: string; password: string; role: string; avatar?: string }): Promise<AppUser> {
    const created = await api.post<ApiUser>("/api/users", {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      avatar: data.avatar ?? null,
    });
    return mapUser(created);
  },

  async update(id: string, data: { name?: string; role?: string; avatar?: string; active?: boolean }): Promise<void> {
    await api.put(`/api/users/${id}`, {
      name: data.name,
      role: data.role,
      avatar: data.avatar,
      active: data.active,
    });
  },

  async delete(id: string, reason?: string): Promise<void> {
    const query = reason ? `?reason=${encodeURIComponent(reason)}` : "";
    await api.delete(`/api/users/${id}${query}`);
  },

  async findByEmail(email: string): Promise<AppUser | undefined> {
    const users = await this.getAll();
    return users.find((u) => u.email === email);
  },
};
