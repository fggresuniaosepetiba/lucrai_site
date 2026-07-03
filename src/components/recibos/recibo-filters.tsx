"use client";
import type { ReciboTipo, ReciboStatus } from "@/types";

interface ReciboFiltersProps {
  filterStatus: ReciboStatus | "todos";
  filterTipo: ReciboTipo | "todos";
  onFilterStatus: (status: ReciboStatus | "todos") => void;
  onFilterTipo: (tipo: ReciboTipo | "todos") => void;
}

export function ReciboFilters({ filterStatus, filterTipo, onFilterStatus, onFilterTipo }: ReciboFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-1">
        <div className="flex gap-1 rounded-lg border p-1">
          {(["todos", "emitido", "cancelado"] as const).map((status) => (
            <button
              key={status}
              onClick={() => onFilterStatus(status)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filterStatus === status
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {status === "todos" ? "Todos" : status === "emitido" ? "Emitidos" : "Cancelados"}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-lg border p-1">
          {(["todos", "recebimento", "pagamento"] as const).map((tipo) => (
            <button
              key={tipo}
              onClick={() => onFilterTipo(tipo)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filterTipo === tipo
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tipo === "todos" ? "Todos" : tipo === "recebimento" ? "Recebimento" : "Pagamento"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
