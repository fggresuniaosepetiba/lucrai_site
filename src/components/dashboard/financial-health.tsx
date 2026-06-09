"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { parseLocalDate } from "@/lib/utils";
import { Info, BarChart3 } from "lucide-react";
import type { Transaction } from "@/types";
import type { SaudeResult, SubIndicador } from "@/types/dashboard";
import { calcularSaude } from "@/services/dashboardIntelligenceService";
import Link from "next/link";

interface FinancialHealthProps {
  transactions: Transaction[];
  year: number;
  entradasPeriodoAnterior?: number;
}

function SubIndicadorPontos({ sub }: { sub: SubIndicador }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">{sub.nome}</span>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="inline-flex">
                <Info className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-56">
              <p className="text-xs leading-relaxed">{sub.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((ponto) => (
          <div
            key={ponto}
            className={`h-2 w-2 rounded-full ${
              ponto <= sub.score ? "bg-primary" : "bg-muted/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function FinancialHealth({ transactions, year, entradasPeriodoAnterior }: FinancialHealthProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Saúde Financeira</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold text-muted-foreground">Aguardando dados</p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Cadastre suas primeiras movimentações financeiras para que o LUCRAÍ possa analisar a saúde da sua empresa.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const yearTransactions = transactions.filter((t) => {
    const d = parseLocalDate(t.date);
    return d.getFullYear() === year;
  });

  const yearIncomes = yearTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.value, 0);

  const yearExpenses = yearTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.value, 0);

  const allIncomes = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.value, 0);

  const allExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.value, 0);

  const totalBalance = allIncomes - allExpenses;

  const margin = yearIncomes > 0
    ? ((yearIncomes - yearExpenses) / yearIncomes) * 100
    : 0;

  const allProjetado = allIncomes - allExpenses;
  const projectedBalance = allProjetado;

  const saude: SaudeResult = calcularSaude(
    totalBalance,
    projectedBalance,
    margin,
    yearIncomes,
    yearExpenses,
    entradasPeriodoAnterior
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Saúde Financeira</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full ${saude.bg}`}>
            <span className={`text-2xl font-bold ${saude.cor}`}>
              {saude.score}%
            </span>
          </div>
          <div>
            <p className="text-lg font-semibold">Saúde: {saude.label}</p>
            <p className="text-sm text-muted-foreground">
              Score calculado com base em {saude.subIndicadores.length} indicadores
            </p>
          </div>
        </div>

        <div className="mb-4 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${saude.score}%`,
              backgroundColor:
                saude.score >= 80
                  ? "hsl(142, 71%, 45%)"
                  : saude.score >= 60
                  ? "hsl(199, 89%, 48%)"
                  : saude.score >= 40
                  ? "hsl(48, 96%, 53%)"
                  : "hsl(0, 72%, 51%)",
            }}
          />
        </div>

        <div className="space-y-1 mb-4">
          {saude.subIndicadores.map((sub) => (
            <SubIndicadorPontos key={sub.nome} sub={sub} />
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-border/30">
          <Link
            href="/dashboard/resumo-cfo"
            className="text-xs text-primary hover:underline"
          >
            Entender minha saúde financeira →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
