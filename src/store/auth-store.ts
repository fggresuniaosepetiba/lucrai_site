"use client";

import { create } from "zustand";
import { seedAll } from "@/database/seed";

interface AuthUser {
  email: string;
  name: string;
  company: string;
  role: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const stored = typeof window !== "undefined" ? localStorage.getItem("lucrai-auth") : null;
  const initialAuth = stored ? JSON.parse(stored) : { isAuthenticated: false, user: null };

  return {
    isAuthenticated: initialAuth.isAuthenticated,
    user: initialAuth.user,
    login: async (username: string, password: string) => {
      const { UserRepository } = await import("@/database/repositories/users");
      const user = await UserRepository.findByEmail(username);
      if (user && user.password === password) {
        const session = {
          isAuthenticated: true,
          user: {
            email: user.email,
            name: user.name,
            company: user.company,
            role: user.role,
          },
        };
        localStorage.setItem("lucrai-auth", JSON.stringify(session));
        set(session);
        return true;
      }
      return false;
    },
    logout: () => {
      localStorage.removeItem("lucrai-auth");
      set({ isAuthenticated: false, user: null });
    },
  };
});
