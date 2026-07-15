"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "./KpiCard";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/cn";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingDown, BarChart3, PieChartIcon, Award } from "lucide-react";
import type { IndicadoresContext } from "@/types/dashboard";

interface DespesasProps {
  data: IndicadoresContext;
}

export function Despesas({ data }: DespesasProps) {
  const { despesas: d, rankings: rank } = data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Despesa Total" value={d.total} variant="danger" variation={d.variacao} />
        <KpiCard label="Custo Fixo" value={d.custoFixo} variant="warning" />
        <KpiCard label="Custo Variável" value={d.custoVariavel} variant="default" />
        <KpiCard label="Despesa Operacional" value={d.despesaOperacional} variant="info" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-muted-foreground" />
              Distribuição por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {d.porCategoria.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                Nenhum dado de despesa disponível
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={d.porCategoria}
                    dataKey="valor"
                    nameKey="categoria"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                  >
                    {d.porCategoria.map((entry, i) => (
                      <Cell key={i} fill={entry.cor} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const item = payload[0].payload;
                      return (
                        <div className="rounded-xl border bg-popover p-3 text-xs shadow-md">
                          <p className="font-medium mb-1">{item.categoria}</p>
                          <p>{formatCurrency(item.valor)}</p>
                          <p className="text-muted-foreground">{item.percentual.toFixed(1)}% do total</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Despesa por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            {d.porMes.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                Nenhum dado de despesa disponível
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={d.porMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `R$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0)}`} />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="rounded-xl border bg-popover p-3 text-xs shadow-md">
                          <p className="font-medium">{payload[0].payload.mes}</p>
                          <p style={{ color: payload[0].color }}>{formatCurrency(payload[0].value as number)}</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="valor" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4 text-muted-foreground" />
            Top Categorias de Despesa
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rank.topCategoriasDespesa.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
              Nenhum dado disponível
            </div>
          ) : (
            <div className="space-y-2">
              {rank.topCategoriasDespesa.slice(0, 10).map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5">
                  <span className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold",
                    i === 0 ? "bg-yellow-500/20 text-yellow-500" :
                    i === 1 ? "bg-gray-400/20 text-gray-400" :
                    i === 2 ? "bg-orange-500/20 text-orange-500" :
                    "bg-muted/30 text-muted-foreground"
                  )}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.nome}</p>
                    <div className="h-1.5 rounded-full bg-muted/30 mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-red-500/60 transition-all"
                        style={{ width: `${item.percentual}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(item.valor)}</p>
                    <p className="text-[10px] text-muted-foreground">{item.percentual.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
