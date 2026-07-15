"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "./KpiCard";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/cn";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, DollarSign, BarChart3, Award } from "lucide-react";
import type { IndicadoresContext } from "@/types/dashboard";

interface ReceitasProps {
  data: IndicadoresContext;
}

export function Receitas({ data }: ReceitasProps) {
  const { receitas: r, rankings: rank } = data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Receita Total" value={r.total} variant="success" variation={r.variacao} />
        <KpiCard label="Ticket Médio" value={r.ticketMedio} variant="info" />
        <KpiCard label="Receita Recorrente" value={r.receitaRecorrente} variant="success" />
        <KpiCard label="Receita Não Recorrente" value={r.receitaNaoRecorrente} variant="warning" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4 text-muted-foreground" />
              Distribuição por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {r.porCategoria.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                Nenhum dado de receita disponível
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={r.porCategoria}
                    dataKey="valor"
                    nameKey="categoria"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                  >
                    {r.porCategoria.map((entry, i) => (
                      <Cell key={i} fill={entry.cor} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-xl border bg-popover p-3 text-xs shadow-md">
                          <p className="font-medium mb-1">{d.categoria}</p>
                          <p>{formatCurrency(d.valor)}</p>
                          <p className="text-muted-foreground">{d.percentual.toFixed(1)}% do total</p>
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
              Receita por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            {r.porMes.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                Nenhum dado de receita disponível
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={r.porMes}>
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
                  <Bar dataKey="valor" fill="#22c55e" radius={[4, 4, 0, 0]} />
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
            Top Categorias de Receita
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rank.topCategoriasReceita.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
              Nenhum dado disponível
            </div>
          ) : (
            <div className="space-y-2">
              {rank.topCategoriasReceita.slice(0, 10).map((item, i) => (
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
                        className="h-full rounded-full bg-primary/60 transition-all"
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
