"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "./KpiCard";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/cn";
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { TrendingUp, TrendingDown, Target, BarChart3, Award } from "lucide-react";
import type { IndicadoresContext } from "@/types/dashboard";

interface ProjecoesProps {
  data: IndicadoresContext;
}

export function Projecoes({ data }: ProjecoesProps) {
  const { projecoes: p, comparativos: c, rankings: rank } = data;

  const chartData = p.pontosProjetados.length > 0 ? p.pontosProjetados : [
    { mes: "Mês 1", otimista: p.cenarioOtimista.resultado / 3, realista: p.resultadoProjetado / 3, pessimista: p.cenarioPessimista.resultado / 3 },
    { mes: "Mês 2", otimista: p.cenarioOtimista.resultado / 3 * 2, realista: p.resultadoProjetado / 3 * 2, pessimista: p.cenarioPessimista.resultado / 3 * 2 },
    { mes: "Mês 3", otimista: p.cenarioOtimista.resultado, realista: p.resultadoProjetado, pessimista: p.cenarioPessimista.resultado },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Receita Projetada (3 meses)" value={p.receitaProjetada} variant="success" />
        <KpiCard label="Despesa Projetada (3 meses)" value={p.despesaProjetada} variant="danger" />
        <KpiCard label="Resultado Projetado" value={p.resultadoProjetado} variant={p.resultadoProjetado >= 0 ? "success" : "danger"} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Projeção 3 Cenários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `R$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0)}`} />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-xl border bg-popover p-3 text-xs shadow-md">
                      <p className="font-medium mb-1">{payload[0].payload.mes}</p>
                      {payload.map((p, i) => (
                        <p key={i} style={{ color: p.color }}>
                          {p.name}: {formatCurrency(p.value as number)}
                        </p>
                      ))}
                    </div>
                  );
                }}
              />
              <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
              <Line type="monotone" dataKey="otimista" stroke="#22c55e" strokeWidth={2} dot={false} name="Otimista" />
              <Line type="monotone" dataKey="realista" stroke="#3b82f6" strokeWidth={2} dot={false} name="Realista" />
              <Line type="monotone" dataKey="pessimista" stroke="#ef4444" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Pessimista" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Cenário Otimista
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Receita</span>
              <span className="font-medium text-emerald-400">{formatCurrency(p.cenarioOtimista.receita)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Despesa</span>
              <span className="font-medium">{formatCurrency(p.cenarioOtimista.despesa)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-border/20 pt-2">
              <span className="text-muted-foreground">Resultado</span>
              <span className="font-bold text-emerald-400">{formatCurrency(p.cenarioOtimista.resultado)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-400" />
              Cenário Realista
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Receita</span>
              <span className="font-medium">{formatCurrency(p.receitaProjetada)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Despesa</span>
              <span className="font-medium">{formatCurrency(p.despesaProjetada)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-border/20 pt-2">
              <span className="text-muted-foreground">Resultado</span>
              <span className={cn("font-bold", p.resultadoProjetado >= 0 ? "text-blue-400" : "text-red-400")}>{formatCurrency(p.resultadoProjetado)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-400" />
              Cenário Pessimista
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Receita</span>
              <span className="font-medium">{formatCurrency(p.cenarioPessimista.receita)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Despesa</span>
              <span className="font-medium">{formatCurrency(p.cenarioPessimista.despesa)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-border/20 pt-2">
              <span className="text-muted-foreground">Resultado</span>
              <span className={cn("font-bold", p.cenarioPessimista.resultado >= 0 ? "text-emerald-400" : "text-red-400")}>{formatCurrency(p.cenarioPessimista.resultado)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Comparativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Receita vs. Meta</p>
              <p className="text-lg font-bold">{c.vsMeta.receita.percentual.toFixed(1)}%</p>
              <p className="text-[10px] text-muted-foreground">
                {formatCurrency(c.vsMeta.receita.atual)} / {formatCurrency(c.vsMeta.receita.meta)}
              </p>
            </div>
            <div className="rounded-xl border border-border/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Margem vs. Meta</p>
              <p className="text-lg font-bold">{c.vsMeta.margem.percentual.toFixed(1)}%</p>
              <p className="text-[10px] text-muted-foreground">
                {c.vsMeta.margem.atual.toFixed(1)}% / {c.vsMeta.margem.meta}%
              </p>
            </div>
            <div className="rounded-xl border border-border/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Variação Receita</p>
              <p className={cn("text-lg font-bold", c.variacaoPercentual.receita >= 0 ? "text-emerald-400" : "text-red-400")}>
                {c.variacaoPercentual.receita >= 0 ? "+" : ""}{c.variacaoPercentual.receita.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-xl border border-border/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Variação Despesa</p>
              <p className={cn("text-lg font-bold", c.variacaoPercentual.despesa <= 0 ? "text-emerald-400" : "text-red-400")}>
                {c.variacaoPercentual.despesa >= 0 ? "+" : ""}{c.variacaoPercentual.despesa.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              Top Categorias de Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rank.topCategoriasReceita.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum dado disponível</p>
            ) : (
              <div className="space-y-2">
                {rank.topCategoriasReceita.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-border/20 last:border-0">
                    <span className="font-medium">{item.nome}</span>
                    <span>{formatCurrency(item.valor)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              Top Categorias de Despesa
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rank.topCategoriasDespesa.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum dado disponível</p>
            ) : (
              <div className="space-y-2">
                {rank.topCategoriasDespesa.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-border/20 last:border-0">
                    <span className="font-medium">{item.nome}</span>
                    <span>{formatCurrency(item.valor)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
