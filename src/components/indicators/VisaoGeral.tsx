"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "./KpiCard";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/cn";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Heart, TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import type { IndicadoresContext } from "@/types/dashboard";

interface VisaoGeralProps {
  data: IndicadoresContext;
}

export function VisaoGeral({ data }: VisaoGeralProps) {
  const { resumoExecutivo: r, saudeFinanceira: s } = data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Receita do Período"
          value={r.receitaPeriodo}
          variant="success"
          variation={r.variacaoReceita}
          variationLabel="vs. período anterior"
        />
        <KpiCard
          label="Despesa do Período"
          value={r.despesaPeriodo}
          variant="danger"
          variation={r.variacaoDespesa}
          variationLabel="vs. período anterior"
        />
        <KpiCard
          label="Resultado do Período"
          value={r.resultadoPeriodo}
          variant={r.resultadoPeriodo >= 0 ? "success" : "danger"}
          variation={r.variacaoResultado}
          variationLabel="vs. período anterior"
        />
        <KpiCard
          label="Margem Líquida"
          value={r.margemLiquida}
          format="percent"
          variant={r.margemLiquida > 10 ? "success" : r.margemLiquida > 0 ? "warning" : "danger"}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Saldo Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(r.saldoAtual)}</p>
            <p className="text-xs text-muted-foreground mt-1">Disponível em contas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-4 w-4 text-muted-foreground" />
              Saúde Financeira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className={cn("flex h-14 w-14 items-center justify-center rounded-full", s.bg)}>
                <span className={cn("text-lg font-bold", s.cor)}>{s.score}%</span>
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold">{s.label}</p>
                <p className="text-xs text-muted-foreground">
                  {s.tendencia === "melhorou" ? "Melhorou" : s.tendencia === "piorou" ? "Piorou" : "Estável"} em relação ao período anterior
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {s.subIndicadores.map((sub, i) => (
                <TooltipProvider key={i} delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="rounded-lg bg-muted/30 p-2.5">
                        <p className="text-xs text-muted-foreground">{sub.nome}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((p) => (
                              <div
                                key={p}
                                className={cn(
                                  "h-2 w-2 rounded-full",
                                  p <= sub.score ? "bg-primary" : "bg-muted/40"
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-medium">{sub.score}/5</span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px]">
                      <p className="text-xs">{sub.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
