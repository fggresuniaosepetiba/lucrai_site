"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, parseLocalDate } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3 } from "lucide-react";
import type { Transaction } from "@/types";

interface FinancialHealthProps {
  transactions: Transaction[];
}

export function FinancialHealth({ transactions }: FinancialHealthProps) {
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

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthTransactions = transactions.filter((t) => {
    const d = parseLocalDate(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthIncomes = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.value, 0);

  const monthExpenses = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.value, 0);

  const monthBalance = monthIncomes - monthExpenses;

  const allIncomes = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.value, 0);

  const allExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.value, 0);

  const totalBalance = allIncomes - allExpenses;

  const margin = monthIncomes > 0
    ? ((monthIncomes - monthExpenses) / monthIncomes) * 100
    : 0;

  const expenseRatio = monthIncomes > 0
    ? (monthExpenses / monthIncomes) * 100
    : 0;

  const healthScore = (() => {
    if (totalBalance <= 0) return { label: "Crítico", color: "text-red-400", bg: "bg-red-500/10", pct: 15 };
    if (margin <= 0) return { label: "Atenção", color: "text-amber-400", bg: "bg-amber-500/10", pct: 35 };
    if (margin < 20) return { label: "Regular", color: "text-yellow-400", bg: "bg-yellow-500/10", pct: 55 };
    if (margin < 40) return { label: "Bom", color: "text-emerald-400", bg: "bg-emerald-500/10", pct: 75 };
    return { label: "Excelente", color: "text-emerald-400", bg: "bg-emerald-500/10", pct: 95 };
  })();

  const metrics = [
    {
      label: "Saldo Total",
      value: formatCurrency(totalBalance),
      icon: DollarSign,
      color: totalBalance >= 0 ? "text-emerald-400" : "text-red-400",
    },
    {
      label: "Resultado do Mês",
      value: formatCurrency(monthBalance),
      icon: monthBalance >= 0 ? TrendingUp : TrendingDown,
      color: monthBalance >= 0 ? "text-emerald-400" : "text-red-400",
    },
    {
      label: "Margem Líquida",
      value: `${margin >= 0 ? "+" : ""}${margin.toFixed(1)}%`,
      icon: Activity,
      color: margin >= 10 ? "text-emerald-400" : "text-amber-400",
    },
    {
      label: "Gasto sobre Receita",
      value: `${expenseRatio.toFixed(1)}%`,
      icon: TrendingDown,
      color: expenseRatio <= 80 ? "text-emerald-400" : "text-red-400",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Saúde Financeira</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full ${healthScore.bg}`}>
            <span className={`text-2xl font-bold ${healthScore.color}`}>
              {healthScore.pct}%
            </span>
          </div>
          <div>
            <p className="text-lg font-semibold">Saúde: {healthScore.label}</p>
            <p className="text-sm text-muted-foreground">
              Baseado no saldo total e margem líquida
            </p>
          </div>
        </div>

        <div className="mb-4 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${healthScore.pct}%`,
              backgroundColor:
                healthScore.pct >= 75
                  ? "hsl(142, 71%, 45%)"
                  : healthScore.pct >= 50
                  ? "hsl(48, 96%, 53%)"
                  : healthScore.pct >= 30
                  ? "hsl(38, 92%, 50%)"
                  : "hsl(0, 72%, 51%)",
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-lg border border-border/50 bg-muted/30 p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <m.icon className={`h-3.5 w-3.5 ${m.color}`} />
                <span className="text-xs text-muted-foreground">{m.label}</span>
              </div>
              <p className={`text-base font-semibold ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
