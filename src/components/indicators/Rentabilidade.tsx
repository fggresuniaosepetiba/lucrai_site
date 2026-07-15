"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "./KpiCard";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/cn";
import { EmptyState } from "./EmptyState";
import { TrendingUp, BarChart3, PieChart, Target, Lightbulb, ChartNoAxesColumn } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import type { IndicadoresContext } from "@/types/dashboard";

interface RentabilidadeProps {
  data: IndicadoresContext;
}

export function Rentabilidade({ data }: RentabilidadeProps) {
  const { rentabilidade: r, investimentos: inv } = data;

  const margemData = [
    { name: "Margem Bruta", value: r.margemBruta, fill: "#22c55e" },
    { name: "Margem EBITDA", value: r.margemEBITDA, fill: "#3b82f6" },
    { name: "Margem Líquida", value: r.margemLiquida, fill: "#8b5cf6" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Margem Bruta" value={r.margemBruta} format="percent" variant={r.margemBruta > 20 ? "success" : r.margemBruta > 10 ? "warning" : "danger"} />
        <KpiCard label="Margem EBITDA" value={r.margemEBITDA} format="percent" variant={r.margemEBITDA > 15 ? "success" : r.margemEBITDA > 5 ? "warning" : "danger"} />
        <KpiCard label="Margem Líquida" value={r.margemLiquida} format="percent" variant={r.margemLiquida > 10 ? "success" : r.margemLiquida > 0 ? "warning" : "danger"} />
        <KpiCard label="ROI" value={r.roi} format="percent" variant={r.roi > 0 ? "success" : "danger"} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Comparativo de Margens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={margemData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v}%`} />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-xl border bg-popover p-3 text-xs shadow-md">
                      <p className="font-medium mb-1">{payload[0].payload.name}</p>
                      <p style={{ color: payload[0].color }}>
                        {payload[0].name}: {Number(payload[0].value).toFixed(1)}%
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={80}>
                {margemData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ChartNoAxesColumn className="h-4 w-4 text-muted-foreground" />
              EBITDA & EBIT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-border/50 p-4">
                <p className="text-xs text-muted-foreground mb-1">EBITDA</p>
                <p className="text-2xl font-bold">{formatCurrency(r.ebitda)}</p>
                <p className="text-[10px] text-muted-foreground">Lucro antes de juros, impostos, depreciação e amortização</p>
              </div>
              <div className="rounded-xl border border-border/50 p-4">
                <p className="text-xs text-muted-foreground mb-1">EBIT</p>
                <p className="text-2xl font-bold">{formatCurrency(r.ebit)}</p>
                <p className="text-[10px] text-muted-foreground">Lucro antes de juros e impostos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
              Investimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inv.totalInvestido === 0 && inv.projetosAtivos === 0 ? (
              <EmptyState
                icon={Target}
                title="Nenhum investimento registrado"
                description="Os indicadores de CAPEX, ROI, TIR, VPL e Payback serão exibidos aqui quando você registrar seus projetos de investimento."
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">Total Investido</p>
                  <p className="text-lg font-bold">{formatCurrency(inv.totalInvestido)}</p>
                </div>
                <div className="rounded-lg bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">CAPEX</p>
                  <p className="text-lg font-bold">{formatCurrency(inv.capEx)}</p>
                </div>
                <div className="rounded-lg bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">TIR</p>
                  <p className="text-lg font-bold">{inv.tir.toFixed(1)}%</p>
                </div>
                <div className="rounded-lg bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">Payback</p>
                  <p className="text-lg font-bold">{inv.paybackMeses} meses</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
