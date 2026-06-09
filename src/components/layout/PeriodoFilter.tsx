"use client";

import { useMemo } from "react";
import { CalendarDays, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/cn";
import { usePeriodoStore } from "@/store/periodo-store";

const MESES = [
  "Jan", "Fev", "Mar", "Abr",
  "Mai", "Jun", "Jul", "Ago",
  "Set", "Out", "Nov", "Dez",
];

const MESES_COMPLETOS = [
  "Janeiro", "Fevereiro", "Março", "Abril",
  "Maio", "Junho", "Julho", "Agosto",
  "Setembro", "Outubro", "Novembro", "Dezembro",
];

const ANOS = [2025, 2026, 2027];
const anoAtual = new Date().getFullYear();
const mesAtual = new Date().getMonth() + 1;

export function PeriodoFilter() {
  const { ano, mes, periodoLabel, isFiltered, setAno, setMes, limparFiltro } = usePeriodoStore();

  const mesesDisponiveis = useMemo(() => {
    return MESES.map((_, idx) => {
      if (ano > anoAtual) return false;
      if (ano < anoAtual) return true;
      return idx + 1 <= mesAtual;
    });
  }, [ano]);

  const handleMesClick = (mesIdx: number) => {
    if (!mesesDisponiveis[mesIdx]) return;
    if (mes === mesIdx + 1) {
      limparFiltro();
    } else {
      setMes(mesIdx + 1);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-all",
            isFiltered
              ? "bg-primary/15 border border-primary/30 text-primary font-medium"
              : "bg-muted/40 text-muted-foreground hover:bg-muted/70"
          )}
        >
          <CalendarDays className="h-3.5 w-3.5" />
          <span>{periodoLabel}</span>
          {isFiltered && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                limparFiltro();
              }}
              onKeyDown={(e) => { if (e.key === "Enter") limparFiltro(); }}
              className="ml-1 rounded-full p-0.5 hover:bg-primary/20"
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-4" align="start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Ano
          </p>
          <div className="flex gap-2">
            {ANOS.map((y) => (
              <button
                key={y}
                onClick={() => setAno(y)}
                className={cn(
                  "flex-1 rounded-md text-sm font-medium px-3 py-1.5 transition-colors",
                  ano === y
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted/70"
                )}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-border/50 my-3" />

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Mês
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {MESES.map((m, idx) => {
              const disabled = !mesesDisponiveis[idx];
              const selected = mes === idx + 1;
              return (
                <button
                  key={m}
                  onClick={() => handleMesClick(idx)}
                  disabled={disabled}
                  title={disabled ? "Sem dados para este período" : MESES_COMPLETOS[idx]}
                  className={cn(
                    "flex-1 text-xs py-1.5 rounded-md text-center transition-colors",
                    disabled && "opacity-40 cursor-not-allowed",
                    !disabled && !selected && "bg-muted/30 text-muted-foreground hover:bg-muted/60",
                    selected && "bg-primary text-primary-foreground font-medium"
                  )}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-border/50 my-3" />

        <button
          onClick={() => setMes(null)}
          className={cn(
            "w-full text-sm text-center py-1.5 rounded-md transition-colors",
            !isFiltered
              ? "bg-primary/15 text-primary border border-primary/30"
              : "bg-muted/30 text-muted-foreground hover:bg-muted/60"
          )}
        >
          Ver acumulado do ano
        </button>

        {isFiltered && mes !== null && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Mostrando dados de {MESES_COMPLETOS[mes - 1].toLowerCase()} de {ano}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
