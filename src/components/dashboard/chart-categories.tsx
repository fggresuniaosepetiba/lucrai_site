"use client";

import { useState, useMemo, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import type { Transaction, Category } from "@/types";

const MAX_SLICES = 7;

function generateColors(count: number, palette: "income" | "expense"): string[] {
  const baseHue = palette === "income" ? 142 : 0;
  const hueRange = palette === "income" ? 40 : 30;
  const saturation = palette === "income" ? 65 : 70;
  const lightnessMin = 35;
  const lightnessMax = palette === "income" ? 55 : 50;

  return Array.from({ length: count }, (_, i) => {
    const hue = baseHue + (i / Math.max(count, 1)) * hueRange;
    const lightness = lightnessMax - (i / Math.max(count, 1)) * (lightnessMax - lightnessMin);
    return `hsl(${Math.round(hue)}, ${saturation}%, ${Math.round(lightness)}%)`;
  });
}

interface ChartCategoriesProps {
  transactions: Transaction[];
  categories: Category[];
  syncType?: "income" | "expense" | null;
  onSyncChange?: (type: "income" | "expense") => void;
}

export function ChartCategories({ transactions, categories, syncType, onSyncChange }: ChartCategoriesProps) {
  const [type, setType] = useState<"expense" | "income">("expense");

  useEffect(() => {
    if (syncType) setType(syncType);
  }, [syncType]);

  const { data, othersTotal } = useMemo(() => {
    const filtered = transactions.filter((t) => t.type === type);
    const grouped: Record<string, number> = {};

    filtered.forEach((t) => {
      const key = t.categoryName || "Sem categoria";
      grouped[key] = (grouped[key] || 0) + t.value;
    });

    const sorted = Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    if (sorted.length <= MAX_SLICES) {
      return { data: sorted, othersTotal: 0 };
    }

    const top = sorted.slice(0, MAX_SLICES);
    const rest = sorted.slice(MAX_SLICES).reduce((sum, s) => sum + s.value, 0);
    if (rest > 0) {
      top.push({ name: "Outros", value: rest });
    }
    return { data: top, othersTotal: rest };
  }, [transactions, type]);

  const colors = useMemo(() => generateColors(data.length, type), [data.length, type]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">
          {type === "expense" ? "Gastos por Categoria" : "Receitas por Categoria"}
        </CardTitle>
        <Tabs value={type} onValueChange={(v) => { setType(v as "expense" | "income"); onSyncChange?.(v as "expense" | "income"); }}>
          <TabsList className="h-8">
            <TabsTrigger value="expense" className="text-xs px-3">Saídas</TabsTrigger>
            <TabsTrigger value="income" className="text-xs px-3">Entradas</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-60 items-center justify-center">
            <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={105}
                  paddingAngle={3}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                      stroke={entry.name === "Outros" ? "hsl(var(--muted-foreground) / 0.3)" : undefined}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const p = payload[0];
                    return (
                      <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-md space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                            type === "income"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-red-500/15 text-red-400"
                          }`}>
                            {type === "income" ? "Entrada" : "Saída"}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{p.name}</p>
                        <p className="text-sm font-medium" style={{ color: p.payload.fill }}>
                          {formatCurrency(typeof p.value === "number" ? p.value : 0)}
                        </p>
                      </div>
                    );
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px" }}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
