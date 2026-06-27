"use client";

import { formatCurrency } from "@/lib/utils";

interface Props {
  value: number;
  onChange: (v: number) => void;
  calculatedUnits: number | null;
  useFixedCosts: boolean;
}

export function ProLaboreSection({ value, onChange, calculatedUnits }: Props) {
  return (
    <div className="rounded-lg border border-border/50 bg-card p-4 space-y-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Quanto você deseja retirar da empresa por mês? (opcional)
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={value > 0 ? formatCurrency(value) : ""}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            if (!raw) { onChange(0); return; }
            onChange(parseInt(raw) / 100);
          }}
          placeholder="Ex.: R$ 8.000,00"
          className="flex h-9 w-full max-w-xs rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {calculatedUnits !== null && value > 0 && (
        <div className="animate-fade-in rounded-lg bg-primary/5 border border-primary/20 p-3">
          <p className="text-sm text-muted-foreground">
            Para atingir um pró-labore de{" "}
            <strong className="text-foreground">{formatCurrency(value)}</strong>{" "}
            mantendo sua empresa saudável, você precisará vender aproximadamente{" "}
            <strong className="text-foreground">{calculatedUnits} unidades</strong>{" "}
            deste produto por mês.
          </p>
        </div>
      )}
    </div>
  );
}
