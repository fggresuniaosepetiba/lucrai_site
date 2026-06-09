"use client";

import { Filter } from "lucide-react";
import { usePeriodoStore } from "@/store/periodo-store";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril",
  "Maio", "Junho", "Julho", "Agosto",
  "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function FiltroAtivoIndicator() {
  const { mes, ano, isFiltered, limparFiltro } = usePeriodoStore();

  if (!isFiltered || mes === null) return null;

  return (
    <div className="inline-flex items-center gap-2 text-xs text-muted-foreground mb-4">
      <Filter className="h-3 w-3" />
      <span>Exibindo dados de {MESES[mes - 1].toLowerCase()} de {ano}</span>
      <span>·</span>
      <button
        onClick={limparFiltro}
        className="text-primary hover:underline"
      >
        Limpar filtro
      </button>
    </div>
  );
}
