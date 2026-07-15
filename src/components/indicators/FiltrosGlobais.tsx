"use client";

import { usePeriodoStore } from "@/store/periodo-store";
import { Calendar, Filter, X, Banknote, Building2, Tags, Landmark, Users, Truck, Briefcase, LayoutGrid, CreditCard } from "lucide-react";
import { cn } from "@/lib/cn";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const FILTROS_EM_BREVE = [
  { icon: Banknote, label: "Regime", value: "Caixa" },
  { icon: Building2, label: "Centro de Custo", value: "Todos" },
  { icon: Tags, label: "Categoria", value: "Todas" },
  { icon: Landmark, label: "Conta Bancária", value: "Todas" },
  { icon: Users, label: "Cliente", value: "Todos" },
  { icon: Truck, label: "Fornecedor", value: "Todos" },
  { icon: Briefcase, label: "Projeto", value: "Todos" },
  { icon: LayoutGrid, label: "Unidade de Negócio", value: "Todas" },
  { icon: CreditCard, label: "Forma de Pagamento", value: "Todas" },
];

export function FiltrosGlobais() {
  const { mes, ano, isFiltered, limparFiltro } = usePeriodoStore();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/30 px-3 py-1.5 text-xs">
        <Calendar className="h-3.5 w-3.5 text-primary" />
        <span className="font-medium">
          {mes ? `${mes}/${ano}` : ano.toString()}
        </span>
        {isFiltered && (
          <button onClick={limparFiltro} className="ml-1 text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <TooltipProvider delayDuration={200}>
        {FILTROS_EM_BREVE.map((f) => (
          <Tooltip key={f.label}>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border/30 bg-muted/10 px-2.5 py-1.5 text-xs text-muted-foreground/50 cursor-not-allowed">
                <f.icon className="h-3 w-3" />
                <span>{f.value}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <p>Filtro <strong>{f.label}</strong> — Em breve</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>

      <div className="text-[10px] text-muted-foreground/40 ml-1">
        <Filter className="h-3 w-3 inline" /> {FILTROS_EM_BREVE.length + 1} filtros
      </div>
    </div>
  );
}
