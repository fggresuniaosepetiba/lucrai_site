"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import type { ScenarioType, ScenarioData } from "@/hooks/usePricingCalculations";

const SCENARIO_LABELS: Record<ScenarioType, string> = {
  minimo: "Preço Mínimo",
  saudavel: "Preço Saudável",
  premium: "Preço Premium",
};

const SCENARIO_COLORS: Record<ScenarioType, string> = {
  minimo: "text-red-400",
  saudavel: "text-blue-400",
  premium: "text-emerald-400",
};

const SCENARIO_BORDER: Record<ScenarioType, string> = {
  minimo: "border-red-500/30",
  saudavel: "border-blue-500/30",
  premium: "border-emerald-500/30",
};

interface Props {
  scenarios: Record<ScenarioType, ScenarioData | null>;
  selectedScenario: ScenarioType;
  onScenarioChange: (scenario: ScenarioType) => void;
}

export function FinancialSummaryCard({ scenarios, selectedScenario, onScenarioChange }: Props) {
  const data = scenarios[selectedScenario];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-violet-400" />
          Resumo Financeiro
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(SCENARIO_LABELS) as ScenarioType[]).map((key) => {
            const s = scenarios[key];
            const isSelected = key === selectedScenario;
            const borderColor = SCENARIO_BORDER[key];
            return (
              <button
                key={key}
                onClick={() => s && onScenarioChange(key)}
                disabled={!s}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  isSelected
                    ? `${borderColor} bg-accent font-semibold ${SCENARIO_COLORS[key]}`
                    : "border-border text-muted-foreground hover:bg-accent"
                } ${!s ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {SCENARIO_LABELS[key]}
                {s && ` — ${formatCurrency(s.price)}`}
              </button>
            );
          })}
        </div>

        {data ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Receita Bruta</p>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(data.price)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Lucro Bruto</p>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(data.grossProfit)}
              </p>
              <p className="text-[10px] text-muted-foreground/60">
                Receita - Custos Diretos
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Lucro Líquido</p>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(data.netProfit)}
              </p>
              <p className="text-[10px] text-muted-foreground/60">
                Após taxas, impostos e custos fixos
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Margem Final</p>
              <p className={`text-lg font-bold ${
                data.finalMargin >= 20 ? "text-emerald-400" :
                data.finalMargin >= 10 ? "text-amber-400" :
                data.finalMargin > 0 ? "text-red-400" :
                "text-muted-foreground"
              }`}>
                {data.finalMargin > 0 ? `${data.finalMargin.toFixed(1)}%` : "—"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Selecione um cenário para visualizar o resumo financeiro.</p>
        )}
      </CardContent>
    </Card>
  );
}
