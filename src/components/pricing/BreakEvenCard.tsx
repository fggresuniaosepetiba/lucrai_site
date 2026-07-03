"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { BarChart3 } from "lucide-react";

interface Props {
  breakEvenUnits: number | null;
  useFixedCosts: boolean;
  effectiveCost: number;
  healthyPrice: number | null;
}

export function BreakEvenCard({ breakEvenUnits, useFixedCosts, effectiveCost, healthyPrice }: Props) {
  if (!useFixedCosts) return null;

  const isInviable = healthyPrice !== null && healthyPrice <= effectiveCost;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-cyan-400" />
          Ponto de Equilíbrio
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isInviable ? (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400">Cálculo inviável</p>
              <p className="text-xs text-muted-foreground mt-1">
                O lucro por unidade é igual ou menor que zero com os valores atuais.
                Revise seus custos ou aumente o preço de venda para calcular o ponto de equilíbrio.
              </p>
            </div>
          </div>
        ) : breakEvenUnits !== null ? (
          <p className="text-sm text-muted-foreground">
            Para cobrir todos os seus custos fixos mensais, você precisa vender aproximadamente{" "}
            <strong className="text-foreground">{breakEvenUnits} unidades</strong>{" "}
            deste produto por mês.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Preencha os custos e defina uma margem para calcular o ponto de equilíbrio.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
