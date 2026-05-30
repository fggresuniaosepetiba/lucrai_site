"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Shell } from "@/components/layout/shell";
import { TransactionRepository } from "@/database/repositories/transactions";
import { CategoryRepository } from "@/database/repositories/categories";
import type { Transaction, Category } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
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
      const txs = await TransactionRepository.getAll(company);
      setTransactions(txs);
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

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthTxs = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === i && d.getFullYear() === year;
    });
    const incomes = monthTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.value, 0);
    const expenses = monthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.value, 0);
    const balance = incomes - expenses;
    const count = monthTxs.length;
    return {
      month: [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
      ][i],
      incomes,
      expenses,
      balance,
      count,
    };
  });

  const annualIncomes = monthlyData.reduce((s, m) => s + m.incomes, 0);
  const annualExpenses = monthlyData.reduce((s, m) => s + m.expenses, 0);
  const annualBalance = annualIncomes - annualExpenses;

  const exportReport = () => {
    const lines = ["Mês,Entradas,Saídas,Saldo,Transações"];
    monthlyData.forEach((m) => {
      lines.push(`${m.month},${m.incomes.toFixed(2)},${m.expenses.toFixed(2)},${m.balance.toFixed(2)},${m.count}`);
    });
    lines.push(`\nTotal,${annualIncomes.toFixed(2)},${annualExpenses.toFixed(2)},${annualBalance.toFixed(2)}`);
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

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-500/10 p-3">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Entradas</p>
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
                  <p className="text-sm text-muted-foreground">Total Saídas</p>
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
                  <p className="text-sm text-muted-foreground">Saldo Anual</p>
                  <p className={`text-xl font-bold ${annualBalance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {formatCurrency(annualBalance)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
                    <th className="text-right font-medium text-muted-foreground p-4">Saldo</th>
                    <th className="text-center font-medium text-muted-foreground p-4">Transações</th>
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
