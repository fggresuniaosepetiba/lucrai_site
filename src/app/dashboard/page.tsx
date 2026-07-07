"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { usePeriodoStore } from "@/store/periodo-store";
import { Shell } from "@/components/layout/shell";
import { StatsCards, type DashboardFilter } from "@/components/dashboard/stats-cards";
import { ChartRevenue } from "@/components/dashboard/chart-revenue";
import { ChartCategories } from "@/components/dashboard/chart-categories";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { FinancialHealth } from "@/components/dashboard/financial-health";
import { FiltroAtivoIndicator } from "@/components/shared/FiltroAtivoIndicator";
import { TransactionRepositoryApi } from "@/services/api-repositories/transactions";
import { CashForecastRepositoryApi } from "@/services/api-repositories/cash-forecast";
import { PricingRepositoryApi } from "@/services/api-repositories/pricing";

import type { Transaction, PricingProduct } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, Calculator, Percent, AlertTriangle } from "lucide-react";
import { formatCurrency, parseLocalDate } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { ano, mes } = usePeriodoStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DashboardFilter>("all");
  const [forecastIncomes, setForecastIncomes] = useState(0);
  const [forecastExpenses, setForecastExpenses] = useState(0);
  const [pricingProducts, setPricingProducts] = useState<PricingProduct[]>([]);
  const company = user?.company ?? "";
  const initialized = useRef(false);

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
    try { await useAuthStore.getState().refreshUser(); } catch { /* ignore */ }
    loadData();
  };

  const loadData = async () => {
    try {
      const [txs, forecastTotals, pricing] = await Promise.all([
        TransactionRepositoryApi.getAll(),
        CashForecastRepositoryApi.getTotals(),
        PricingRepositoryApi.getAll(),
      ]);
      setTransactions(txs);
      setForecastIncomes(forecastTotals.predictedIncomes);
      setForecastExpenses(forecastTotals.predictedExpenses);
      setPricingProducts(pricing);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentBalance = useMemo(() => {
    const incomes = transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.value, 0);
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.value, 0);
    return incomes - expenses;
  }, [transactions]);

  const projectedBalance = currentBalance + forecastIncomes - forecastExpenses;

  const pricingCount = pricingProducts.length;
  const avgMargin = pricingCount > 0
    ? pricingProducts.reduce((s, p) => s + p.netMargin, 0) / pricingCount
    : 0;
  const atRiskCount = pricingProducts.filter((p) => p.netMargin < 10).length;

  const filteredTransactionsByPeriod = useMemo(() => {
    return transactions.filter((t) => {
      const d = parseLocalDate(t.date);
      if (d.getFullYear() !== ano) return false;
      if (mes !== null && d.getMonth() + 1 !== mes) return false;
      return true;
    });
  }, [transactions, ano, mes]);

  const filteredTransactions = useMemo(() => {
    let tx = filteredTransactionsByPeriod;
    if (filter === "income") tx = tx.filter((t) => t.type === "income");
    else if (filter === "expense") tx = tx.filter((t) => t.type === "expense");
    return tx;
  }, [filteredTransactionsByPeriod, filter]);

  const handleFilterChange = (newFilter: DashboardFilter) => {
    setFilter((prev) => (prev === newFilter ? "all" : newFilter));
  };

  if (loading) {
    return (
      <Shell>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          </div>
        </div>

        <FiltroAtivoIndicator />

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Realizado</h3>
          <StatsCards
            transactions={filteredTransactionsByPeriod}
            activeFilter={filter}
            onFilterChange={handleFilterChange}
            year={ano}
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Previsto</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <button onClick={() => router.push("/cash-forecast?filter=income")} className="text-left">
              <Card className="hover:shadow-md transition-all cursor-pointer group border-emerald-500/20">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-500/10 p-3 group-hover:bg-emerald-500/20 transition-colors">
                      <TrendingUp className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Recebimentos Previstos</p>
                      <p className="text-xl font-bold text-emerald-400">{formatCurrency(forecastIncomes)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>

            <button onClick={() => router.push("/cash-forecast?filter=expense")} className="text-left">
              <Card className="hover:shadow-md transition-all cursor-pointer group border-red-500/20">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-red-500/10 p-3 group-hover:bg-red-500/20 transition-colors">
                      <TrendingDown className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pagamentos Previstos</p>
                      <p className="text-xl font-bold text-red-400">{formatCurrency(forecastExpenses)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>

            <button onClick={() => router.push("/cash-forecast")} className="text-left">
              <Card className="hover:shadow-md transition-all cursor-pointer group border-blue-500/20">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-3 group-hover:opacity-80 transition-opacity ${projectedBalance >= 0 ? "bg-blue-500/10" : "bg-red-500/10"}`}>
                      <Target className={`h-5 w-5 ${projectedBalance >= 0 ? "text-blue-400" : "text-red-400"}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Saldo Projetado</p>
                      <p className={`text-xl font-bold ${projectedBalance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {formatCurrency(projectedBalance)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>
          </div>
        </div>

        {pricingCount > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Precificação
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <button onClick={() => router.push("/pricing")} className="text-left">
                <Card className="hover:shadow-md transition-all cursor-pointer group border-blue-500/20">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-blue-500/10 p-3 group-hover:bg-blue-500/20 transition-colors">
                        <Calculator className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Produtos Precificados</p>
                        <p className="text-xl font-bold text-blue-400">{pricingCount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>

              <button onClick={() => router.push("/pricing")} className="text-left">
                <Card className="hover:shadow-md transition-all cursor-pointer group border-emerald-500/20">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-emerald-500/10 p-3 group-hover:bg-emerald-500/20 transition-colors">
                        <Percent className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Margem Média</p>
                        <p className="text-xl font-bold text-emerald-400">{avgMargin.toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>

              <button onClick={() => router.push("/pricing")} className="text-left">
                <Card className={`hover:shadow-md transition-all cursor-pointer group ${atRiskCount > 0 ? "border-red-500/20" : "border-border/50"}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-xl p-3 group-hover:opacity-80 transition-opacity ${atRiskCount > 0 ? "bg-red-500/10" : "bg-muted"}`}>
                        <AlertTriangle className={`h-5 w-5 ${atRiskCount > 0 ? "text-red-400" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Produtos em Risco</p>
                        <p className={`text-xl font-bold ${atRiskCount > 0 ? "text-red-400" : "text-muted-foreground"}`}>
                          {atRiskCount}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <ChartRevenue transactions={filteredTransactions} year={ano} />
          <FinancialHealth transactions={filteredTransactionsByPeriod} year={ano} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCategories
            transactions={filteredTransactions}
            syncType={filter === "income" ? "income" : filter === "expense" ? "expense" : null}
            onSyncChange={(t) => setFilter(t === "income" ? "income" : "expense")}
          />
          <RecentTransactions transactions={filteredTransactions} />
        </div>
      </div>
    </Shell>
  );
}
