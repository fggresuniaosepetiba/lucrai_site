"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, parseLocalDate } from "@/lib/utils";
import type { Transaction } from "@/types";

interface ChartRevenueProps {
  transactions: Transaction[];
  year: number;
}

export function ChartRevenue({ transactions, year }: ChartRevenueProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];

  const monthlyData = months.map((name, index) => {
    const monthTxs = transactions.filter((t) => {
      const d = parseLocalDate(t.date);
      return d.getMonth() === index && d.getFullYear() === year;
    });

    const incomes = monthTxs
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.value, 0);
    const expenses = monthTxs
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.value, 0);

    return { name, incomes, expenses };
  });

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; name: string; value: number; color: string }[]; label?: string }) => {
    if (!active || !payload || payload.length === 0) return null;

    const items = hoveredKey
      ? payload.filter((p) => p.dataKey === hoveredKey)
      : payload;

    if (items.length === 0) return null;

    return (
      <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-md">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        {items.map((p) => (
          <p key={p.dataKey} className="text-sm font-medium" style={{ color: p.color }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Entradas x Saídas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.25)" }} />
              <Legend
                onMouseEnter={(o) => setHoveredKey(typeof o.dataKey === "string" ? o.dataKey : null)}
                onMouseLeave={() => setHoveredKey(null)}
              />
              <Bar
                dataKey="incomes"
                name="Entradas"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
                onMouseEnter={() => setHoveredKey("incomes")}
                onMouseLeave={() => setHoveredKey(null)}
                opacity={hoveredKey && hoveredKey !== "incomes" ? 0.25 : 1}
                style={{ transition: "opacity 0.2s" }}
              />
              <Bar
                dataKey="expenses"
                name="Saídas"
                fill="hsl(var(--chart-5))"
                radius={[4, 4, 0, 0]}
                onMouseEnter={() => setHoveredKey("expenses")}
                onMouseLeave={() => setHoveredKey(null)}
                opacity={hoveredKey && hoveredKey !== "expenses" ? 0.25 : 1}
                style={{ transition: "opacity 0.2s" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
