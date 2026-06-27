"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { HelpModalRateio } from "./HelpModalRateio";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  fixedCostTotal: number;
  hasFixedCosts: boolean;
  fixedCostRateio: number;
  estimatedUnits: number;
  onEstimatedUnitsChange: (v: number) => void;
}

export function FixedCostsCheckbox({
  checked, onCheckedChange,
  fixedCostTotal, hasFixedCosts,
  fixedCostRateio, estimatedUnits, onEstimatedUnitsChange,
}: Props) {
  return (
    <div className="rounded-lg border border-border/50 bg-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Checkbox
          id="useFixedCosts"
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(v === true)}
        />
        <Label htmlFor="useFixedCosts" className="text-sm cursor-pointer">
          Utilizar custos fixos cadastrados
        </Label>
        <HelpModalRateio />
      </div>

      {checked && (
        <div className="animate-fade-in space-y-3 pl-6">
          {!hasFixedCosts ? (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
              <p className="text-sm text-amber-400 font-medium">
                Nenhum custo fixo cadastrado
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Cadastre seus custos fixos para incorporá-los ao cálculo de precificação.
              </p>
              <Link href="/pricing/fixed-costs">
                <Button type="button" variant="outline" size="sm" className="mt-2">
                  Ir para Custos Fixos
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total mensal</span>
                <span className="font-semibold text-foreground">{formatCurrency(fixedCostTotal)}</span>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Quantas unidades você vende por mês (estimativa)? *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={estimatedUnits > 0 ? estimatedUnits : ""}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    onEstimatedUnitsChange(raw ? parseInt(raw, 10) : 0);
                  }}
                  placeholder="Ex.: 200"
                  className="flex h-8 w-32 rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>

              {estimatedUnits > 0 && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                  <p className="text-xs text-muted-foreground">
                    Custo fixo rateado por unidade:{" "}
                    <strong className="text-foreground">
                      {formatCurrency(fixedCostRateio)}
                    </strong>
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
