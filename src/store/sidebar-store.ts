"use client";

import { create } from "zustand";

interface SidebarState {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

function getInitialCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem("lucrai-sidebar-collapsed");
  return stored === "true";
}

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: getInitialCollapsed(),
  toggle: () =>
    set((state) => {
      const next = !state.collapsed;
      if (typeof window !== "undefined") {
        localStorage.setItem("lucrai-sidebar-collapsed", String(next));
      }
      return { collapsed: next };
    }),
  setCollapsed: (collapsed: boolean) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lucrai-sidebar-collapsed", String(collapsed));
    }
    set({ collapsed });
  },
}));
