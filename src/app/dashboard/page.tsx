"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Shell } from "@/components/layout/shell";
import { StatsCards, type DashboardFilter } from "@/components/dashboard/stats-cards";
import { ChartRevenue } from "@/components/dashboard/chart-revenue";
import { ChartCategories } from "@/components/dashboard/chart-categories";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { FinancialHealth } from "@/components/dashboard/financial-health";
import { TransactionRepository } from "@/database/repositories/transactions";
import { CategoryRepository } from "@/database/repositories/categories";
import { CashForecastRepository } from "@/database/repositories/cash-forecast";
import { seedDefaultCategories } from "@/database/seed";
import { migrateDisplayIds, fixCompanyName } from "@/database/dexie";
import type { Transaction, Category } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DashboardFilter>("all");
  const [forecastIncomes, setForecastIncomes] = useState(0);
  const [forecastExpenses, setForecastExpenses] = useState(0);
  const company = user?.company ?? "";

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    loadData();
  }, [isAuthenticated, router, company]);

  const loadData = async () => {
    try {
      await migrateDisplayIds();
      await fixCompanyName();
      await useAuthStore.getState().refreshUser();
      await seedDefaultCategories(company);
      const [txs, cats, forecastTotals] = await Promise.all([
        TransactionRepository.getAll(company),
        CategoryRepository.getAll(company),
        CashForecastRepository.getTotals(company),
      ]);
      setTransactions(txs);
      setCategories(cats);
      setForecastIncomes(forecastTotals.predictedIncomes);
      setForecastExpenses(forecastTotals.predictedExpenses);
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

  const filteredTransactions = useMemo(() => {
    if (filter === "all" || filter === "balance") return transactions;
    if (filter === "income") return transactions.filter((t) => t.type === "income");
    if (filter === "expense") return transactions.filter((t) => t.type === "expense");
    return transactions;
  }, [transactions, filter]);

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
        {/* Realizados - Stats Cards */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Realizado</h3>
          <StatsCards
            transactions={transactions}
            activeFilter={filter}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Previsto - Forecast Cards */}
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

        {/* Linha Principal: Entradas x Saídas + Saúde da Empresa */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartRevenue transactions={filteredTransactions} />
          <FinancialHealth transactions={transactions} />
        </div>

        {/* Linha Secundária: Gastos por Categoria + Últimos Lançamentos */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCategories
            transactions={filteredTransactions}
            categories={categories}
            syncType={filter === "income" ? "income" : filter === "expense" ? "expense" : null}
            onSyncChange={(t) => setFilter(t === "income" ? "income" : "expense")}
          />
          <RecentTransactions transactions={filteredTransactions} />
        </div>
      </div>
    </Shell>
  );
}
