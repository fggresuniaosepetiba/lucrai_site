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
import { seedDefaultCategories } from "@/database/seed";
import type { Transaction, Category } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DashboardFilter>("all");
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
      await seedDefaultCategories(company);
      const [txs, cats] = await Promise.all([
        TransactionRepository.getAll(company),
        CategoryRepository.getAll(company),
      ]);
      setTransactions(txs);
      setCategories(cats);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

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
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6">
        <StatsCards
          transactions={transactions}
          activeFilter={filter}
          onFilterChange={handleFilterChange}
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartRevenue transactions={filteredTransactions} />
          <ChartCategories
            transactions={filteredTransactions}
            categories={categories}
            syncType={filter === "income" ? "income" : filter === "expense" ? "expense" : null}
            onSyncChange={(t) => setFilter(t === "income" ? "income" : "expense")}
          />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <FinancialHealth transactions={transactions} />
          <RecentTransactions transactions={filteredTransactions} />
        </div>
      </div>
    </Shell>
  );
}
