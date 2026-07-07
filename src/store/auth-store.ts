"use client";

import { create } from "zustand";
import { api } from "@/services/api";
import type { LoginResponse, AuthUserResponse, UserInfo } from "@/types/api";

interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  isLoading: boolean;
  mustChangePassword: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

function getStoredUser(): UserInfo | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("lucrai-auth");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("lucrai-access-token");
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!getStoredToken() && !!getStoredUser(),
  user: getStoredUser(),
  isLoading: true,
  mustChangePassword: getStoredUser()?.mustChangePassword ?? false,

  login: async (username: string, password: string) => {
    try {
      const data = await api.post<LoginResponse>("/api/auth/login", { email: username, password }, true);
      localStorage.setItem("lucrai-access-token", data.accessToken);
      localStorage.setItem("lucrai-refresh-token", data.refreshToken);
      localStorage.setItem("lucrai-auth", JSON.stringify(data.user));
      set({
        isAuthenticated: true,
        user: data.user,
        isLoading: false,
        mustChangePassword: data.user.mustChangePassword,
      });
      return true;
    } catch {
      set({ isAuthenticated: false, user: null, isLoading: false, mustChangePassword: false });
      return false;
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      await api.post("/api/auth/change-password", { currentPassword, newPassword });
      const stored = getStoredUser();
      if (stored) {
        stored.mustChangePassword = false;
        localStorage.setItem("lucrai-auth", JSON.stringify(stored));
      }
      set({ mustChangePassword: false, user: stored });
      return true;
    } catch {
      return false;
    }
  },

  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem("lucrai-access-token");
    localStorage.removeItem("lucrai-refresh-token");
    localStorage.removeItem("lucrai-auth");
    set({ isAuthenticated: false, user: null, isLoading: false, mustChangePassword: false });
  },

  refreshUser: async () => {
    const token = getStoredToken();
    if (!token) return;
    try {
      const user = await api.get<AuthUserResponse>("/api/auth/me");
      const userInfo: UserInfo = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company,
        plan: user.plan,
        mustChangePassword: user.mustChangePassword,
      };
      localStorage.setItem("lucrai-auth", JSON.stringify(userInfo));
      set({ user: userInfo, mustChangePassword: user.mustChangePassword });
    } catch {
      // silently fail
    }
  },

  initialize: async () => {
    const token = getStoredToken();
    if (!token) {
      set({ isAuthenticated: false, user: null, isLoading: false });
      return;
    }
    try {
      const user = await api.get<AuthUserResponse>("/api/auth/me");
      const userInfo: UserInfo = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company,
        plan: user.plan,
        mustChangePassword: user.mustChangePassword,
      };
      localStorage.setItem("lucrai-auth", JSON.stringify(userInfo));
      set({ isAuthenticated: true, user: userInfo, isLoading: false, mustChangePassword: user.mustChangePassword });
    } catch {
      localStorage.removeItem("lucrai-access-token");
      localStorage.removeItem("lucrai-refresh-token");
      localStorage.removeItem("lucrai-auth");
      set({ isAuthenticated: false, user: null, isLoading: false, mustChangePassword: false });
    }
  },
}));
