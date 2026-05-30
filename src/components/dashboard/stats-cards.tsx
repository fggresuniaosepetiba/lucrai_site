"use client";

import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/cn";
import type { Transaction } from "@/types";

export type DashboardFilter = "all" | "income" | "expense" | "balance";

interface StatsCardsProps {
  transactions: Transaction[];
  activeFilter: DashboardFilter;
  onFilterChange: (filter: DashboardFilter) => void;
}

export function StatsCards({ transactions, activeFilter, onFilterChange }: StatsCardsProps) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncomes = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.value, 0);

  const totalExpenses = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.value, 0);

  const monthBalance = totalIncomes - totalExpenses;

  const allIncomes = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.value, 0);

  const allExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.value, 0);

  const totalBalance = allIncomes - allExpenses;

  const margin = totalIncomes > 0
    ? ((totalIncomes - totalExpenses) / totalIncomes) * 100
    : 0;

  const cards = [
    {
      key: "income" as DashboardFilter,
      title: "Entradas (mês)",
      value: totalIncomes,
      display: formatCurrency(totalIncomes),
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      activeBg: "ring-2 ring-emerald-500/40 bg-emerald-500/15",
    },
    {
      key: "expense" as DashboardFilter,
      title: "Saídas (mês)",
      value: totalExpenses,
      display: formatCurrency(totalExpenses),
      icon: TrendingDown,
      color: "text-red-400",
      bg: "bg-red-500/10",
      activeBg: "ring-2 ring-red-500/40 bg-red-500/15",
    },
    {
      key: "balance" as DashboardFilter,
      title: "Saldo Atual",
      value: totalBalance,
      display: formatCurrency(totalBalance),
      icon: DollarSign,
      color: totalBalance >= 0 ? "text-emerald-400" : "text-red-400",
      bg: "bg-blue-500/10",
      activeBg: "ring-2 ring-blue-500/40 bg-blue-500/15",
    },
    {
      key: "all" as DashboardFilter,
      title: "Margem Líquida",
      value: margin,
      display: `${margin >= 0 ? "+" : ""}${margin.toFixed(1)}%`,
      icon: Percent,
      color: margin >= 0 ? "text-emerald-400" : "text-red-400",
      bg: "bg-purple-500/10",
      activeBg: "ring-2 ring-purple-500/40 bg-purple-500/15",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const isActive = activeFilter === card.key;
        return (
          <button
            key={card.key}
            onClick={() => onFilterChange(card.key)}
            className="text-left"
          >
            <Card
              className={cn(
                "group transition-all duration-300 cursor-pointer hover:shadow-md",
                isActive ? card.activeBg : "hover:border-primary/30"
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <p className="text-2xl font-bold tracking-tight">
                      {card.display}
                    </p>
                  </div>
                  <div className={cn("rounded-xl p-3 transition-transform", card.bg, isActive && "scale-110")}>
                    <card.icon className={cn("h-5 w-5", card.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
