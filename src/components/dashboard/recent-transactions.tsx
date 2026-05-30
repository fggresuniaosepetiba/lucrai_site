"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/types";
import Link from "next/link";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const recent = transactions.slice(0, 10);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Últimos Lançamentos</CardTitle>
        <Link
          href="/financial"
          className="text-xs text-primary hover:underline"
        >
          Ver todos
        </Link>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Nenhum lançamento registrado</p>
            <Link
              href="/financial"
              className="mt-2 text-sm text-primary hover:underline"
            >
              Criar primeiro lançamento
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left font-medium text-muted-foreground pb-3">Descrição</th>
                  <th className="text-left font-medium text-muted-foreground pb-3">Categoria</th>
                  <th className="text-left font-medium text-muted-foreground pb-3">Data</th>
                  <th className="text-right font-medium text-muted-foreground pb-3">Valor</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t.id} className="border-b border-border/25 hover:bg-muted/30 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {t.type === "income" ? (
                          <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-400" />
                        )}
                        <span className="font-medium">{t.description}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge variant="secondary" className="text-xs">
                        {t.categoryName}
                      </Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">{formatDate(t.date)}</td>
                    <td className={`py-3 text-right font-medium ${
                      t.type === "income" ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {t.type === "income" ? "+" : "-"}
                      {formatCurrency(t.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
