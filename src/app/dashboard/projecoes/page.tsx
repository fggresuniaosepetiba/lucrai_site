"use client";

import { useMemo, useState } from "react";
import { Shell } from "@/components/layout/shell";
import { FiltroAtivoIndicator } from "@/components/shared/FiltroAtivoIndicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDadosFiltrados } from "@/hooks/useDadosFiltrados";
import { formatCurrency, parseLocalDate } from "@/lib/utils";
import { cn } from "@/lib/cn";
import {
  LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, Area, ReferenceLine, CartesianGrid,
  Legend
} from "recharts";
import { TrendingUp, TrendingDown, Calculator, BarChart3, Info, ChevronRight } from "lucide-react";
import type { HorizonteProjecao, CenarioParams, ProjecaoResult, RunwayResult, BreakEvenResult } from "@/types/dashboard";
import { calcularProjecao, calcularRunway, calcularBreakEven } from "@/services/dashboardIntelligenceService";
import Link from "next/link";

const horizontes: { value: HorizonteProjecao; label: string }[] = [
  { value: 30, label: "30 dias" },
  { value: 60, label: "60 dias" },
  { value: 90, label: "90 dias" },
  { value: 180, label: "6 meses" },
  { value: 365, label: "12 meses" },
];

export default function ProjecoesPage() {
  const dados = useDadosFiltrados();
  const { lancamentos, entradas, saidas, saldoAtual } = dados;
  const [horizonte, setHorizonte] = useState<HorizonteProjecao>(90);
  const [params, setParams] = useState<CenarioParams>({
    crescimentoReceita: 0,
    variacaoCustos: 0,
    novoCustoFixo: 0,
    despesaPontual: 0,
    despesaPontualMes: 1,
  });
  const [activeCenario, setActiveCenario] = useState<string | null>("realista");

  const custoMedioMensal = useMemo(() => {
    const saidasTotal = lancamentos.filter((t) => t.type === "expense").reduce((s, t) => s + t.value, 0);
    const meses = Math.max(1, new Set(lancamentos.map((t) => {
      const d = parseLocalDate(t.date);
      return `${d.getFullYear()}-${d.getMonth()}`;
    })).size);
    return saidasTotal / meses;
  }, [lancamentos]);

  const projecao = useMemo((): ProjecaoResult => {
    return calcularProjecao(lancamentos, horizonte, params);
  }, [lancamentos, horizonte, params]);

  const runway: RunwayResult = useMemo(() => calcularRunway(saldoAtual, custoMedioMensal), [saldoAtual, custoMedioMensal]);

  const breakEven: BreakEvenResult = useMemo(() => calcularBreakEven(lancamentos), [lancamentos]);

  const mesesPassados = useMemo(() => {
    const porMes = new Map<string, { receita: number; custo: number }>();
    lancamentos.forEach((t) => {
      const key = (() => {
        const d = parseLocalDate(t.date);
        const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        return `${meses[d.getMonth()]}`;
      })();
      const entry = porMes.get(key) || { receita: 0, custo: 0 };
      if (t.type === "income") entry.receita += t.value;
      else entry.custo += t.value;
      porMes.set(key, entry);
    });
    return [...porMes.entries()].slice(-6).map(([mes, v]) => ({
      mes,
      receita: v.receita,
      custo: v.custo,
      margem: v.receita > 0 ? ((v.receita - v.custo) / v.receita) * 100 : 0,
    }));
  }, [lancamentos]);

  const chartData = useMemo(() => {
    const data: { mes: string; realizado?: number; projetado?: number; intervaloSup?: number; intervaloInf?: number; simulado?: number }[] = [];

    projecao.pontosRealizado.forEach((p: { mes: string; valor: number }) => {
      data.push({ mes: p.mes, realizado: p.valor });
    });

    projecao.pontosProjetado.forEach((p: { mes: string; base: number; intervaloSuperior: number; intervaloInferior: number }) => {
      data.push({
        mes: p.mes,
        projetado: p.base,
        intervaloSup: p.intervaloSuperior,
        intervaloInf: p.intervaloInferior,
      });
    });

    return data;
  }, [projecao]);

  const receitaMediaMensal = lancamentos.filter((t) => t.type === "income").reduce((s, t) => s + t.value, 0) / Math.max(1, mesesPassados.length);

  const handleCenarioRapido = (tipo: string) => {
    setActiveCenario(tipo);
    switch (tipo) {
      case "pessimista":
        setParams({ crescimentoReceita: -20, variacaoCustos: 10, novoCustoFixo: 0, despesaPontual: 0, despesaPontualMes: 1 });
        break;
      case "realista":
        setParams({ crescimentoReceita: 0, variacaoCustos: 0, novoCustoFixo: 0, despesaPontual: 0, despesaPontualMes: 1 });
        break;
      case "otimista":
        setParams({ crescimentoReceita: 20, variacaoCustos: -5, novoCustoFixo: 0, despesaPontual: 0, despesaPontualMes: 1 });
        break;
    }
  };

  const temDados = lancamentos.length > 0;

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Projeções Financeiras</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Projeções Financeiras</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualize o futuro com base em tendências históricas e simule cenários estratégicos.
          </p>
        </div>

        <FiltroAtivoIndicator />

        {!temDados ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-14 w-14 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold text-muted-foreground">Dados insuficientes</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-md text-center">
                Adicione lançamentos financeiros para gerar projeções precisas.
              </p>
              <Link
                href="/financial"
                className="mt-4 text-sm text-primary hover:underline"
              >
                Adicionar lançamentos →
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <Tabs value={horizonte.toString()} onValueChange={(v) => setHorizonte(Number(v) as HorizonteProjecao)}>
              <TabsList>
                {horizontes.map((h) => (
                  <TabsTrigger key={h.value} value={h.value.toString()}>{h.label}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <p className="text-xs text-muted-foreground">Receita Projetada — próximos {horizonte} dias</p>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(projecao.receita)}</p>
                  {receitaMediaMensal > 0 && (
                    <p className="text-xs text-muted-foreground">Baseado na média mensal de {formatCurrency(receitaMediaMensal)}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <p className="text-xs text-muted-foreground">Custos Projetados — próximos {horizonte} dias</p>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(projecao.custos)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Calculator className="h-4 w-4 text-blue-500" />
                    <p className="text-xs text-muted-foreground">Margem Projetada</p>
                  </div>
                  <p className="text-xl font-bold">{projecao.margem.toFixed(1)}%</p>
                  <Badge variant="outline" className={cn(
                    "text-[10px]",
                    projecao.margem >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  )}>
                    vs. margem atual {entradas > 0 ? ((entradas - saidas) / entradas * 100).toFixed(1) : "0.0"}%
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Info className="h-4 w-4 text-blue-500" />
                    <p className="text-xs text-muted-foreground">Saldo Final Projetado</p>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(projecao.saldoFinal)}</p>
                  <Badge variant="outline" className={cn(
                    "text-[10px]",
                    projecao.saldoFinal >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {projecao.saldoFinal >= 0 ? "Positivo" : "Atenção"}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Projeção de Fluxo de Caixa</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `R$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0)}`} />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded-xl border bg-popover p-3 text-xs shadow-md">
                            {payload.map((p, i) => (
                              <p key={i} style={{ color: p.color }}>
                                {p.name}: {formatCurrency(p.value as number)}
                              </p>
                            ))}
                          </div>
                        );
                      }}
                    />
                    <Legend
                      formatter={(value) => <span className="text-xs">{value}</span>}
                    />
                    {chartData.some((d) => d.intervaloSup !== undefined) && (
                      <>
                        <Area
                          type="monotone"
                          dataKey="intervaloSup"
                          stroke="none"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.08}
                          name="Intervalo"
                        />
                        <Area
                          type="monotone"
                          dataKey="intervaloInf"
                          stroke="none"
                          fill="transparent"
                          name=""
                        />
                      </>
                    )}
                    <Line
                      type="monotone"
                      dataKey="realizado"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#22c55e" }}
                      name="Realizado"
                    />
                    <Line
                      type="monotone"
                      dataKey="projetado"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      strokeDasharray="6 3"
                      dot={false}
                      name="Projetado"
                    />
                    <ReferenceLine
                      x={chartData.find((d) => d.realizado !== undefined && d.projetado !== undefined)?.mes || chartData[chartData.length - 1]?.mes}
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="4 4"
                      label={{ value: "Hoje", position: "top", fontSize: 11 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Simule diferentes cenários</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ajuste os parâmetros e veja o impacto no fluxo projetado em tempo real.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-[38%_62%] gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Crescimento mensal de receita</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          value={params.crescimentoReceita}
                          onChange={(e) => setParams({ ...params, crescimentoReceita: Number(e.target.value) })}
                          className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm"
                          min={-30}
                          max={50}
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Variação mensal de custos</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          value={params.variacaoCustos}
                          onChange={(e) => setParams({ ...params, variacaoCustos: Number(e.target.value) })}
                          className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm"
                          min={-20}
                          max={30}
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Novo custo fixo mensal</label>
                      <input
                        type="number"
                        value={params.novoCustoFixo}
                        onChange={(e) => setParams({ ...params, novoCustoFixo: Number(e.target.value) })}
                        className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm mt-1"
                        placeholder="R$ 0,00"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Despesa ou investimento pontual</label>
                      <input
                        type="number"
                        value={params.despesaPontual}
                        onChange={(e) => setParams({ ...params, despesaPontual: Number(e.target.value) })}
                        className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm mt-1"
                        placeholder="R$ 0,00"
                      />
                    </div>

                    <div className="flex gap-2">
                      {["pessimista", "realista", "otimista"].map((c) => (
                        <button
                          key={c}
                          onClick={() => handleCenarioRapido(c)}
                          className={cn(
                            "flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                            activeCenario === c
                              ? "border-2 border-primary bg-primary/5"
                              : "border border-border bg-muted/30 hover:bg-muted/60"
                          )}
                        >
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis hide />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="realizado" stroke="#22c55e" strokeWidth={2} dot={false} name="Realizado" />
                        <Line type="monotone" dataKey="projetado" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Projetado" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Runway Financeiro</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Se as receitas pararem hoje, por quanto tempo você opera com o saldo atual?
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{runway.label}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      runway.status === "seguro" ? "bg-green-500" :
                      runway.status === "atencao" ? "bg-yellow-500" : "bg-red-500"
                    )} />
                    <span className="text-sm text-muted-foreground">
                      {runway.status === "seguro" ? "Confortável" : runway.status === "atencao" ? "Monitore de perto" : "Ação necessária"}
                    </span>
                  </div>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="mt-2 text-xs text-muted-foreground/60 hover:text-muted-foreground">
                          Saldo atual: {formatCurrency(saldoAtual)} · Custo médio: {formatCurrency(custoMedioMensal)}/mês
                          <Info className="h-3 w-3 inline ml-1" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs">Saldo atual: {formatCurrency(saldoAtual)} · Custo médio: {formatCurrency(custoMedioMensal)}/mês</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ponto de Equilíbrio</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Receita mínima para cobrir todos os custos operacionais
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(breakEven.valor)}<span className="text-sm text-muted-foreground font-normal"> por mês</span></p>
                  <div className="mt-3">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          breakEven.acima ? "bg-green-500" : "bg-red-500"
                        )}
                        style={{ width: `${Math.min(100, breakEven.percentualAtingido)}%` }}
                      />
                    </div>
                    <p className={cn(
                      "text-xs mt-1",
                      breakEven.acima ? "text-green-500" : "text-red-500"
                    )}>
                      Você está {breakEven.acima ? `${(100 - breakEven.percentualAtingido).toFixed(0)}% acima` : `${breakEven.percentualAtingido.toFixed(0)}% abaixo`} do seu ponto de equilíbrio
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tendência de gastos por categoria</CardTitle>
              </CardHeader>
              <CardContent>
                {mesesPassados.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Sem dados suficientes.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left font-medium text-muted-foreground pb-3">Categoria</th>
                          <th className="text-right font-medium text-muted-foreground pb-3">Média 3 períodos</th>
                          <th className="text-right font-medium text-muted-foreground pb-3">Projeção Próx. Período</th>
                          <th className="text-right font-medium text-muted-foreground pb-3">Tendência</th>
                          <th className="text-right font-medium text-muted-foreground pb-3">% da Receita</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(
                          lancamentos.filter((t) => t.type === "expense").reduce((acc, t) => {
                            acc[t.categoryName] = (acc[t.categoryName] || 0) + t.value;
                            return acc;
                          }, {} as Record<string, number>)
                        )
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 10)
                          .map(([cat, total]) => {
                            const pctReceita = entradas > 0 ? (total / entradas) * 100 : 0;
                            const media = total / Math.max(1, mesesPassados.length);
                            const tendencia = media > 0 && receitaMediaMensal > media ? "up" : "down";
                            return (
                              <tr key={cat} className="border-b border-border/25 hover:bg-muted/30">
                                <td className="py-2.5">{cat}</td>
                                <td className="py-2.5 text-right font-mono">{formatCurrency(media)}</td>
                                <td className="py-2.5 text-right font-mono">{formatCurrency(media * 1.05)}</td>
                                <td className="py-2.5 text-right">
                                  {tendencia === "up" ? (
                                    <TrendingUp className="h-4 w-4 text-red-500 inline" />
                                  ) : (
                                    <TrendingDown className="h-4 w-4 text-green-500 inline" />
                                  )}
                                </td>
                                <td className="py-2.5 text-right font-mono">{pctReceita.toFixed(1)}%</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Shell>
  );
}


