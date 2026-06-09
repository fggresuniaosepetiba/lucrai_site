"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/store/auth-store";
import { usePeriodoStore } from "@/store/periodo-store";
import { TransactionRepository } from "@/database/repositories/transactions";
import { CashForecastRepository } from "@/database/repositories/cash-forecast";
import { parseLocalDate } from "@/lib/utils";
import type { Transaction } from "@/types";
import type { DadosFiltradosResult } from "@/types/dashboard";

export function useDadosFiltrados(): DadosFiltradosResult {
  const { user, isAuthenticated } = useAuthStore();
  const { ano, mes } = usePeriodoStore();
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [forecastIncomes, setForecastIncomes] = useState(0);
  const [forecastExpenses, setForecastExpenses] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const company = user?.company ?? "";

  useEffect(() => {
    if (!isAuthenticated || !company) return;
    setIsLoading(true);
    Promise.all([
      TransactionRepository.getAll(company),
      CashForecastRepository.getTotals(company),
    ])
      .then(([txs, forecastTotals]) => {
        setAllTransactions(txs);
        setForecastIncomes(forecastTotals.predictedIncomes);
        setForecastExpenses(forecastTotals.predictedExpenses);
      })
      .catch((err) => console.error("useDadosFiltrados error:", err))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, company]);

  const lancamentosFiltrados = useMemo(() => {
    return allTransactions.filter((t) => {
      const d = parseLocalDate(t.date);
      if (d.getFullYear() !== ano) return false;
      if (mes !== null && d.getMonth() + 1 !== mes) return false;
      return true;
    });
  }, [allTransactions, ano, mes]);

  const { entradas, saidas } = useMemo(() => {
    const incomes = lancamentosFiltrados
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.value, 0);
    const expenses = lancamentosFiltrados
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.value, 0);
    return { entradas: incomes, saidas: expenses };
  }, [lancamentosFiltrados]);

  const saldoAtual = useMemo(() => {
    const allIncomes = allTransactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.value, 0);
    const allExpenses = allTransactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.value, 0);
    return allIncomes - allExpenses;
  }, [allTransactions]);

  const saldoProjetado = saldoAtual + forecastIncomes - forecastExpenses;

  const margemLiquida = entradas > 0 ? ((entradas - saidas) / entradas) * 100 : 0;

  return {
    lancamentos: lancamentosFiltrados,
    entradas,
    saidas,
    saldoAtual,
    saldoProjetado,
    margemLiquida,
    recebimentosPrevistos: forecastIncomes,
    pagamentosPrevistos: forecastExpenses,
    periodoAtivo: { ano, mes },
    isLoading,
  };
}
