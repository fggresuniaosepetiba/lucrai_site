"use client";

import { create } from "zustand";
import type { PeriodoState, PeriodoActions } from "@/types/dashboard";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril",
  "Maio", "Junho", "Julho", "Agosto",
  "Setembro", "Outubro", "Novembro", "Dezembro",
];

function gerarLabel(ano: number, mes: number | null): string {
  if (mes === null) return `${ano} · Todos os meses`;
  return `${ano} · ${MESES[mes - 1]}`;
}

interface PeriodoStore extends PeriodoState, PeriodoActions {}

const anoAtual = new Date().getFullYear();

export const usePeriodoStore = create<PeriodoStore>((set, get) => ({
  ano: anoAtual,
  mes: null,
  periodoLabel: gerarLabel(anoAtual, null),
  isFiltered: false,

  setAno: (ano: number) => {
    set({ ano, periodoLabel: gerarLabel(ano, get().mes), isFiltered: get().mes !== null });
  },

  setMes: (mes: number | null) => {
    set({ mes, periodoLabel: gerarLabel(get().ano, mes), isFiltered: mes !== null });
  },

  limparFiltro: () => {
    set({ mes: null, periodoLabel: gerarLabel(get().ano, null), isFiltered: false });
  },
}));
