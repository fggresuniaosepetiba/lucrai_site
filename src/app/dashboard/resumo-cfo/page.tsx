"use client";

import { useMemo, useState, useEffect } from "react";
import { Shell } from "@/components/layout/shell";
import { FiltroAtivoIndicator } from "@/components/shared/FiltroAtivoIndicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDadosFiltrados } from "@/hooks/useDadosFiltrados";
import { useAuthStore } from "@/store/auth-store";
import { formatCurrency, parseLocalDate } from "@/lib/utils";
import { cn } from "@/lib/cn";
import { calcularAlertasAtivos } from "@/services/alertasService";
import {
  gerarNotaCFO, gerarAcoesRecomendadas, calcularSaude, calcularSparkline,
} from "@/services/dashboardIntelligenceService";

import {
  TrendingUp, TrendingDown, ShieldCheck, BarChart3, DollarSign,
  Activity, Target, Bell, Heart, ChevronRight
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, LineChart, Line, CartesianGrid
} from "recharts";
import Link from "next/link";
import type { AlertaItem, AcaoRecomendada, SparklinePoint } from "@/types/dashboard";

function getSaudacao(): string {
  const hora = new Date().getHours();
  if (hora >= 6 && hora < 12) return "Bom dia";
  if (hora >= 12 && hora < 18) return "Boa tarde";
  return "Boa noite";
}

function getDataFormatada(): string {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function getDiaSemana(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  const hoje = new Date();
  const diff = Math.round((d.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return `${dias[d.getDay()]} ${d.getDate()}`;
}

function getProximos7Dias(lancamentos: import("@/types").Transaction[]) {
  const hoje = new Date();
  const fim = new Date(hoje);
  fim.setDate(fim.getDate() + 7);
  return lancamentos
    .filter((t) => {
      const d = parseLocalDate(t.date);
      return d >= hoje && d <= fim;
    })
    .sort((a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime());
}

export default function ResumoCFOPage() {
  const dados = useDadosFiltrados();
  const { user } = useAuthStore();
  const { lancamentos, entradas, saidas, saldoAtual, saldoProjetado, margemLiquida, isLoading } = dados;
  const [acoes, setAcoes] = useState<AcaoRecomendada[]>([]);
  const [acoesConcluidas, setAcoesConcluidas] = useState<Set<string>>(new Set());
  const [alertas, setAlertas] = useState<AlertaItem[]>([]);

  const primeiroNome = user?.name ? user.name.split(" ")[0] : "Usuário";
  const saudacao = getSaudacao();
  const dataFormatada = getDataFormatada();

  useEffect(() => {
    if (isLoading || lancamentos.length === 0) return;
    const resultado = calcularAlertasAtivos({
      lancamentos, entradas, saidas, saldoAtual, saldoProjetado, margemLiquida,
      recebimentosPrevistos: dados.recebimentosPrevistos,
      pagamentosPrevistos: dados.pagamentosPrevistos,
    });
    setAlertas(resultado);

    const acoesGeradas = gerarAcoesRecomendadas(lancamentos, resultado, entradas, saidas);
    setAcoes(acoesGeradas);

    // Load saved checkbox states
    try {
      const stored = localStorage.getItem("acoes-concluidas");
      if (stored) setAcoesConcluidas(new Set(JSON.parse(stored)));
    } catch {}
  }, [isLoading, lancamentos, entradas, saidas, saldoAtual, saldoProjetado, margemLiquida, dados.recebimentosPrevistos, dados.pagamentosPrevistos]);

  const toggleAcao = async (id: string) => {
    const next = new Set(acoesConcluidas);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setAcoesConcluidas(next);
    localStorage.setItem("acoes-concluidas", JSON.stringify(Array.from(next)));
  };

  const sparklineReceita: SparklinePoint[] = useMemo(() => calcularSparkline(lancamentos, "income", 6), [lancamentos]);

  const saude = useMemo(() => calcularSaude(saldoAtual, saldoProjetado, margemLiquida, entradas, saidas), [saldoAtual, saldoProjetado, margemLiquida, entradas, saidas]);

  const alertasCriticos = alertas.filter((a) => a.tipo === "critico" && !a.dispensado);
  const alertasAtencao = alertas.filter((a) => a.tipo === "atencao" && !a.dispensado);

  const notaCFO = useMemo(() => gerarNotaCFO({ entradas, margemLiquida, saldoAtual }, alertas), [entradas, margemLiquida, saldoAtual, alertas]);

  const agendaSemana = useMemo(() => getProximos7Dias(lancamentos), [lancamentos]);

  const sparklineData = useMemo(() => {
    const porMes = new Map<string, { receita: number; custo: number }>();
    lancamentos.forEach((t) => {
      const d = parseLocalDate(t.date);
      const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const key = `${meses[d.getMonth()]}`;
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

  const temDados = lancamentos.length > 0;

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Resumo do CFO</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {saudacao}, {primeiroNome}.
          </h1>
          <p className="text-sm text-muted-foreground mt-1 capitalize">
            {dataFormatada}
          </p>
        </div>

        <FiltroAtivoIndicator />

        {!temDados ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-14 w-14 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold text-muted-foreground">Bem-vindo ao Resumo do CFO</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-md text-center">
                Cadastre seus primeiros lançamentos financeiros para receber uma análise completa.
              </p>
              <Link href="/financial" className="mt-4 text-sm text-primary hover:underline">
                Adicionar lançamentos →
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Nota do CFO */}
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-5">
                <div className="relative">
                  <span className="absolute -top-2 -left-1 text-4xl text-primary/10 font-serif leading-none">{'\u201C'}</span>
                  <p className="text-base italic leading-relaxed text-foreground/90 pt-2">
                    {notaCFO}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-3">
                    — Lucraí CFO Digital · {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Grid 2x3 de KPIs */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      <p className="text-xs text-muted-foreground">Receita do Período</p>
                    </div>
                    <Link href="/dashboard/projecoes" className="text-[10px] text-primary hover:underline">
                      Ver projeções →
                    </Link>
                  </div>
                  <p className="text-lg font-bold">{formatCurrency(entradas)}</p>
                  {sparklineReceita.length > 0 && (
                    <ResponsiveContainer width="100%" height={40}>
                      <LineChart data={sparklineReceita}>
                        <Line type="monotone" dataKey="valor" stroke="#22c55e" strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-400" />
                      <p className="text-xs text-muted-foreground">Margem Líquida</p>
                    </div>
                    <Link href="/dashboard" className="text-[10px] text-primary hover:underline">
                      Ver análise →
                    </Link>
                  </div>
                  <p className="text-lg font-bold">{margemLiquida.toFixed(1)}%</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                    <p className="text-xs text-muted-foreground">Saldo Atual</p>
                  </div>
                  <p className="text-lg font-bold">{formatCurrency(saldoAtual)}</p>
                  <p className="text-[10px] text-muted-foreground">disponível hoje</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-400" />
                      <p className="text-xs text-muted-foreground">Saldo Projetado (30 dias)</p>
                    </div>
                    <Link href="/dashboard/projecoes" className="text-[10px] text-primary hover:underline">
                      Ver projeções →
                    </Link>
                  </div>
                  <p className="text-lg font-bold">{formatCurrency(dados.saldoProjetado)}</p>
                  <Badge variant="outline" className={cn(
                    "text-[10px]",
                    dados.saldoProjetado >= saldoAtual ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {dados.saldoProjetado >= saldoAtual ? "+" : ""}{dados.saldoProjetado - saldoAtual > 0 ? "+" : ""}{formatCurrency(dados.saldoProjetado - saldoAtual)} vs. hoje
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-yellow-400" />
                      <p className="text-xs text-muted-foreground">Alertas Ativos</p>
                    </div>
                    <Link href="/dashboard/alertas" className="text-[10px] text-primary hover:underline">
                      Ver alertas →
                    </Link>
                  </div>
                  {alertasCriticos.length === 0 && alertasAtencao.length === 0 ? (
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Tudo em ordem</span>
                    </div>
                  ) : (
                    <p className="text-lg font-bold">
                      {alertasCriticos.length > 0 && <span className="text-destructive">{alertasCriticos.length} crítico{alertasCriticos.length > 1 ? "s" : ""}</span>}
                      {alertasCriticos.length > 0 && alertasAtencao.length > 0 && <span className="text-muted-foreground"> · </span>}
                      {alertasAtencao.length > 0 && <span className="text-yellow-500">{alertasAtencao.length} atenção</span>}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-primary" />
                      <p className="text-xs text-muted-foreground">Saúde Financeira</p>
                    </div>
                    <Link href="/dashboard" className="text-[10px] text-primary hover:underline">
                      Ver detalhes →
                    </Link>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", saude.bg)}>
                      <span className={cn("text-sm font-bold", saude.cor)}>{saude.score}%</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{saude.label}</p>
                      <div className="flex gap-0.5 mt-1">
                        {saude.subIndicadores.map((sub, i) => (
                          <TooltipProvider key={i} delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex gap-[1px]">
                                  {[1, 2, 3, 4, 5].map((p) => (
                                    <div key={p} className={cn(
                                      "h-1.5 w-1.5 rounded-full",
                                      p <= sub.score ? "bg-primary" : "bg-muted/40"
                                    )} />
                                  ))}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-xs">{sub.nome}: {sub.score}/5</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Minha agenda da semana */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">O que acontece esta semana</CardTitle>
                </CardHeader>
                <CardContent>
                  {agendaSemana.length === 0 ? (
                    <div>
                      <p className="text-sm text-muted-foreground italic">
                        Nenhum lançamento previsto para os próximos 7 dias.
                      </p>
                      <Link href="/cash-forecast" className="mt-2 text-sm text-primary hover:underline inline-block">
                        Adicionar previsão →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {agendaSemana.slice(0, 5).map((t) => (
                        <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0">
                          <div className="flex items-center gap-2">
                            {t.type === "income" ? (
                              <TrendingUp className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-400" />
                            )}
                            <Badge variant="secondary" className="text-[10px]">
                              {getDiaSemana(t.date)}
                            </Badge>
                            <span className="text-sm">{t.description}</span>
                          </div>
                          <span className={cn(
                            "text-sm font-medium",
                            t.type === "income" ? "text-emerald-400" : "text-red-400"
                          )}>
                            {t.type === "income" ? "+" : "-"}{formatCurrency(t.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Ações recomendadas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">O que fazer esta semana</CardTitle>
                </CardHeader>
                <CardContent>
                  {acoes.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      Nenhuma ação recomendada no momento.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {acoes.map((acao) => {
                        const concluido = acoesConcluidas.has(acao.id);
                        return (
                          <div
                            key={acao.id}
                            className={cn(
                              "flex items-start gap-2 py-2 border-b border-border/20 last:border-0",
                              concluido && "opacity-50"
                            )}
                          >
                            <Checkbox
                              checked={concluido}
                              onCheckedChange={() => toggleAcao(acao.id)}
                              className="mt-0.5"
                            />
                            <div className="flex-1">
                              <p className={cn("text-sm", concluido && "line-through")}>
                                {acao.texto}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={cn(
                                  "text-[9px] px-1.5 py-0",
                                  acao.urgencia === "urgente" && "bg-destructive/10 text-destructive",
                                  acao.urgencia === "esta_semana" && "bg-yellow-500/10 text-yellow-600",
                                  acao.urgencia === "este_mes" && "bg-muted text-muted-foreground"
                                )}>
                                  {acao.urgencia === "urgente" ? "Urgente" : acao.urgencia === "esta_semana" ? "Esta semana" : "Este mês"}
                                </Badge>
                                <Link href={acao.href} className="text-[10px] text-primary hover:underline">
                                  Ir →
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Mini gráfico de tendência 6 meses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tendência dos últimos 6 meses</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={sparklineData}>
                    <defs>
                      <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorCusto" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis hide />
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0]?.payload;
                        return (
                          <div className="rounded-xl border bg-popover p-3 text-xs shadow-md">
                            <p className="font-medium mb-1">{data?.mes}</p>
                            {payload.map((p, i) => (
                              <p key={i} style={{ color: p.color }}>
                                {p.name}: {formatCurrency(p.value as number)}
                              </p>
                            ))}
                            {data?.margem !== undefined && (
                              <p className="text-muted-foreground mt-1">Margem: {data.margem.toFixed(1)}%</p>
                            )}
                          </div>
                        );
                      }}
                    />
                    <Area type="monotone" dataKey="receita" stroke="hsl(var(--primary))" fill="url(#colorReceita)" strokeWidth={2} name="Receita" />
                    <Area type="monotone" dataKey="custo" stroke="#ef4444" fill="url(#colorCusto)" strokeWidth={2} name="Custos" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Shell>
  );
}


