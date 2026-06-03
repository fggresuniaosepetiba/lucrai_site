"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Shell } from "@/components/layout/shell";
import { TransactionRepository } from "@/database/repositories/transactions";
import { CashForecastRepository } from "@/database/repositories/cash-forecast";
import { migrateDisplayIds, fixCompanyName } from "@/database/dexie";
import type { Transaction, CashForecast } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, parseLocalDate } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, Download, Target, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [forecasts, setForecasts] = useState<CashForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const initialized = useRef(false);
  const company = user?.company ?? "";

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (!initialized.current) {
      initialized.current = true;
      runStartup();
    } else {
      loadData();
    }
  }, [isAuthenticated, router, company]);

  const runStartup = async () => {
    try { await migrateDisplayIds(); } catch (e) { console.error("migrateDisplayIds:", e); }
    try { await fixCompanyName(); } catch (e) { console.error("fixCompanyName:", e); }
    try { await useAuthStore.getState().refreshUser(); } catch (e) { console.error("refreshUser:", e); }
    loadData();
  };

  const loadData = async () => {
    try {
      const [txs, fcs] = await Promise.all([
        TransactionRepository.getAll(company),
        CashForecastRepository.getAll(company),
      ]);
      setTransactions(txs);
      setForecasts(fcs.filter((f) => f.status === "predicted"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Shell>
        <div className="space-y-4">
          <Skeleton className="h-12 w-64 rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </Shell>
    );
  }

  const yearTransactions = transactions.filter((t) => {
    const d = parseLocalDate(t.date);
    return d.getFullYear() === year;
  });

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthTxs = yearTransactions.filter((t) => {
      const d = parseLocalDate(t.date);
      return d.getMonth() === i;
    });
    const incomes = monthTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.value, 0);
    const expenses = monthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.value, 0);
    const balance = incomes - expenses;
    const count = monthTxs.length;

    const monthForecasts = forecasts.filter((f) => {
      const d = parseLocalDate(f.expectedDate);
      return d.getMonth() === i && d.getFullYear() === year;
    });
    const forecastIncomes = monthForecasts.filter((f) => f.type === "income").reduce((s, f) => s + f.amount, 0);
    const forecastExpenses = monthForecasts.filter((f) => f.type === "expense").reduce((s, f) => s + f.amount, 0);

    return {
      month: [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
      ][i],
      incomes,
      expenses,
      balance,
      count,
      forecastIncomes,
      forecastExpenses,
      projectedBalance: balance + forecastIncomes - forecastExpenses,
    };
  });

  const annualIncomes = monthlyData.reduce((s, m) => s + m.incomes, 0);
  const annualExpenses = monthlyData.reduce((s, m) => s + m.expenses, 0);
  const annualBalance = annualIncomes - annualExpenses;
  const annualForecastIncomes = monthlyData.reduce((s, m) => s + m.forecastIncomes, 0);
  const annualForecastExpenses = monthlyData.reduce((s, m) => s + m.forecastExpenses, 0);
  const annualProjected = annualBalance + annualForecastIncomes - annualForecastExpenses;

  const exportReport = () => {
    const lines = [
      "Mês,Entradas Realizadas,Saídas Realizadas,Saldo Realizado,Recebimentos Previstos,Pagamentos Previstos,Saldo Projetado,Transações"
    ];
    monthlyData.forEach((m) => {
      lines.push(
        `${m.month},${m.incomes.toFixed(2)},${m.expenses.toFixed(2)},${m.balance.toFixed(2)},${m.forecastIncomes.toFixed(2)},${m.forecastExpenses.toFixed(2)},${m.projectedBalance.toFixed(2)},${m.count}`
      );
    });
    lines.push(
      `\nTotal,${annualIncomes.toFixed(2)},${annualExpenses.toFixed(2)},${annualBalance.toFixed(2)},${annualForecastIncomes.toFixed(2)},${annualForecastExpenses.toFixed(2)},${annualProjected.toFixed(2)}`
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-${year}.csv`;
    link.click();
  };

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Relatório {year}</h2>
            <div className="flex gap-1 rounded-lg border p-1">
              {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map((y) => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    year === y ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={exportReport} className="gap-2">
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
        </div>

        {/* Realizado Section */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Realizado
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-500/10 p-3">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Entradas Realizadas</p>
                    <p className="text-xl font-bold text-emerald-400">{formatCurrency(annualIncomes)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-red-500/10 p-3">
                    <TrendingDown className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saídas Realizadas</p>
                    <p className="text-xl font-bold text-red-400">{formatCurrency(annualExpenses)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl p-3 ${annualBalance >= 0 ? "bg-blue-500/10" : "bg-red-500/10"}`}>
                    <DollarSign className={`h-5 w-5 ${annualBalance >= 0 ? "text-blue-400" : "text-red-400"}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo Realizado</p>
                    <p className={`text-xl font-bold ${annualBalance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {formatCurrency(annualBalance)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Previsto Section */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Previsto
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-500/10 p-3">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Recebimentos Previstos</p>
                    <p className="text-xl font-bold text-emerald-400">{formatCurrency(annualForecastIncomes)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-red-500/10 p-3">
                    <TrendingDown className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pagamentos Previstos</p>
                    <p className="text-xl font-bold text-red-400">{formatCurrency(annualForecastExpenses)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl p-3 ${annualProjected >= 0 ? "bg-blue-500/10" : "bg-red-500/10"}`}>
                    <Target className={`h-5 w-5 ${annualProjected >= 0 ? "text-blue-400" : "text-red-400"}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo Projetado</p>
                    <p className={`text-xl font-bold ${annualProjected >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {formatCurrency(annualProjected)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalhamento Mensal</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left font-medium text-muted-foreground p-4">Mês</th>
                    <th className="text-right font-medium text-muted-foreground p-4">Entradas</th>
                    <th className="text-right font-medium text-muted-foreground p-4">Saídas</th>
                    <th className="text-right font-medium text-muted-foreground p-4">Saldo Realizado</th>
                    <th className="text-right font-medium text-muted-foreground p-4">Prev. Rec.</th>
                    <th className="text-right font-medium text-muted-foreground p-4">Prev. Pag.</th>
                    <th className="text-right font-medium text-muted-foreground p-4">Saldo Projetado</th>
                    <th className="text-center font-medium text-muted-foreground p-4">Trans.</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((m) => (
                    <tr key={m.month} className="border-b border-border/25 hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium">{m.month}</td>
                      <td className="p-4 text-right text-emerald-400 font-medium">{formatCurrency(m.incomes)}</td>
                      <td className="p-4 text-right text-red-400 font-medium">{formatCurrency(m.expenses)}</td>
                      <td className={`p-4 text-right font-medium tabular-nums ${
                        m.balance >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}>{formatCurrency(m.balance)}</td>
                      <td className="p-4 text-right text-emerald-400/70 font-medium">{formatCurrency(m.forecastIncomes)}</td>
                      <td className="p-4 text-right text-red-400/70 font-medium">{formatCurrency(m.forecastExpenses)}</td>
                      <td className={`p-4 text-right font-medium tabular-nums ${
                        m.projectedBalance >= 0 ? "text-blue-400" : "text-red-400"
                      }`}>{formatCurrency(m.projectedBalance)}</td>
                      <td className="p-4 text-center">
                        <Badge variant="secondary">{m.count}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
