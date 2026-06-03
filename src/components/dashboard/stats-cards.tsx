"use client";

import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCompactCurrency, parseLocalDate } from "@/lib/utils";
import { cn } from "@/lib/cn";
import type { Transaction } from "@/types";

export type DashboardFilter = "all" | "income" | "expense" | "balance";

interface StatsCardsProps {
  transactions: Transaction[];
  activeFilter: DashboardFilter;
  onFilterChange: (filter: DashboardFilter) => void;
  year: number;
}

export function StatsCards({ transactions, activeFilter, onFilterChange, year }: StatsCardsProps) {
  const now = new Date();
  const currentMonth = now.getMonth();

  const monthTransactions = transactions.filter((t) => {
    const d = parseLocalDate(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === year;
  });

  const totalIncomes = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.value, 0);

  const totalExpenses = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.value, 0);

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

  const incomeCompact = formatCompactCurrency(totalIncomes);
  const expenseCompact = formatCompactCurrency(totalExpenses);
  const balanceCompact = formatCompactCurrency(totalBalance);

  const cards = [
    {
      key: "income" as DashboardFilter,
      title: "Entradas (mês)",
      value: totalIncomes,
      display: incomeCompact.display,
      fullValue: incomeCompact.full,
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      activeBg: "ring-2 ring-emerald-500/40 bg-emerald-500/15",
    },
    {
      key: "expense" as DashboardFilter,
      title: "Saídas (mês)",
      value: totalExpenses,
      display: expenseCompact.display,
      fullValue: expenseCompact.full,
      icon: TrendingDown,
      color: "text-red-400",
      bg: "bg-red-500/10",
      activeBg: "ring-2 ring-red-500/40 bg-red-500/15",
    },
    {
      key: "balance" as DashboardFilter,
      title: "Saldo Atual",
      value: totalBalance,
      display: balanceCompact.display,
      fullValue: balanceCompact.full,
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
                "group transition-all duration-300 cursor-pointer hover:shadow-md h-full",
                isActive ? card.activeBg : "hover:border-primary/30"
              )}
            >
              <CardContent className="p-6 h-full relative overflow-hidden">
                <div className={cn("absolute top-5 right-5 rounded-xl p-3 transition-transform", card.bg, isActive && "scale-110")}>
                  <card.icon className={cn("h-5 w-5", card.color)} />
                </div>
                <div className="h-full flex flex-col justify-center pr-16">
                  <p className="text-sm text-muted-foreground mb-1.5">{card.title}</p>
                  <p className="text-2xl font-bold tracking-tight break-words" title={card.fullValue || card.display}>
                    {card.display}
                  </p>
                </div>
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
