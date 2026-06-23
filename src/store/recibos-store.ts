"use client";
import { create } from "zustand";
import type { ReciboTipo, ReciboStatus } from "@/types";

interface RecibosFilterState {
  filterStatus: ReciboStatus | "todos";
  filterTipo: ReciboTipo | "todos";
  search: string;
}

interface RecibosStoreState {
  filter: RecibosFilterState;
  setFilterStatus: (status: ReciboStatus | "todos") => void;
  setFilterTipo: (tipo: ReciboTipo | "todos") => void;
  setSearch: (search: string) => void;
}

export const useRecibosStore = create<RecibosStoreState>((set) => ({
  filter: {
    filterStatus: "todos",
    filterTipo: "todos",
    search: "",
  },
  setFilterStatus: (filterStatus) =>
    set((state) => ({ filter: { ...state.filter, filterStatus } })),
  setFilterTipo: (filterTipo) =>
    set((state) => ({ filter: { ...state.filter, filterTipo } })),
  setSearch: (search) =>
    set((state) => ({ filter: { ...state.filter, search } })),
}));
