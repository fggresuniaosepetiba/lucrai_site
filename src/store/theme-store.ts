"use client";

import { create } from "zustand";

export type ThemeMode = "normal" | "dark-mega" | "clean";

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "normal";
  const stored = localStorage.getItem("lucrai-theme") as ThemeMode | null;
  if (stored && ["normal", "dark-mega", "clean"].includes(stored)) return stored;
  return "normal";
}

export const useThemeStore = create<ThemeState>((set) => {
  const initial = getInitialTheme();
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", initial);
  }

  return {
    theme: initial,
    setTheme: (theme: ThemeMode) => {
      localStorage.setItem("lucrai-theme", theme);
      document.documentElement.setAttribute("data-theme", theme);
      set({ theme });
    },
  };
});
