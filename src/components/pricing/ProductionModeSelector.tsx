"use client";

import type { ProductionMode } from "@/types";

interface Props {
  mode: ProductionMode;
  onChange: (mode: ProductionMode) => void;
  lotQuantity: number;
  onLotQuantityChange: (qty: number) => void;
}

export function ProductionModeSelector({ mode, onChange, lotQuantity, onLotQuantityChange }: Props) {
  return (
    <div className="rounded-lg border border-border/50 bg-card p-4 space-y-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Este cálculo refere-se a:
      </p>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name="productionMode"
            checked={mode === "unitaria"}
            onChange={() => onChange("unitaria")}
            className="h-4 w-4 accent-primary"
          />
          <span className="text-sm text-foreground group-hover:text-primary transition-colors">
            Produção Unitária
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name="productionMode"
            checked={mode === "lote"}
            onChange={() => onChange("lote")}
            className="h-4 w-4 accent-primary"
          />
          <span className="text-sm text-foreground group-hover:text-primary transition-colors">
            Produção por Lote
          </span>
        </label>
      </div>

      {mode === "lote" && (
        <div className="animate-fade-in space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Quantidade produzida no lote *
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={lotQuantity > 0 ? lotQuantity : ""}
              onChange={(e) => onLotQuantityChange(Math.max(1, parseInt(e.target.value) || 0))}
              placeholder="Ex.: 150 unidades"
              className="flex h-9 w-full max-w-xs rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>

          {lotQuantity > 0 && (
            <p className="text-xs text-muted-foreground animate-fade-in">
              Todos os custos foram convertidos para custo por unidade (lote ÷ {lotQuantity})
            </p>
          )}
        </div>
      )}
    </div>
  );
}
