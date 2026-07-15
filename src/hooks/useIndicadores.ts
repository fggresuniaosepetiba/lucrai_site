"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/store/auth-store";
import { usePeriodoStore } from "@/store/periodo-store";
import { TransactionRepositoryApi } from "@/services/api-repositories/transactions";
import { CashForecastRepositoryApi } from "@/services/api-repositories/cash-forecast";
import { AuditRepositoryApi } from "@/services/api-repositories/audit";
import { IndicatorsRepositoryApi } from "@/services/api-repositories/indicators";
import { calcularSaude, calcularSparkline } from "@/services/dashboardIntelligenceService";
import { formatCurrency, parseLocalDate } from "@/lib/utils";
import type { Transaction } from "@/types";
import type {
  IndicadoresContext,
  ResumoExecutivoData,
  SaudeFinanceiraData,
  CaixaLiquidezData,
  CapitalGiroData,
  RentabilidadeData,
  InvestimentosData,
  ReceitasData,
  DespesasData,
  RankingsData,
  ContasAReceberData,
  ContasAPagarData,
  EndividamentoData,
  ProjecoesIndicadoresData,
  ComparativosData,
  DemonstrativosData,
  AuditoriaIndicadoresData,
} from "@/types/dashboard";

const CORES_CATEGORIA = [
  "#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
  "#06b6d4", "#d946ef", "#e11d48", "#0ea5e9", "#a855f7",
];

function groupByCategory(tx: Transaction[], type: "income" | "expense") {
  const map = new Map<string, number>();
  tx.filter((t) => t.type === type).forEach((t) => {
    map.set(t.categoryName, (map.get(t.categoryName) || 0) + t.value);
  });
  return map;
}

function groupByMonth(tx: Transaction[]) {
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const map = new Map<string, number>();
  tx.forEach((t) => {
    const d = parseLocalDate(t.date);
    const key = `${meses[d.getMonth()]}`;
    map.set(key, (map.get(key) || 0) + t.value);
  });
  return [...map.entries()].map(([mes, valor]) => ({ mes, valor }));
}

function total(tx: Transaction[], type: "income" | "expense") {
  return tx.filter((t) => t.type === type).reduce((s, t) => s + t.value, 0);
}

function round(v: number) { return Math.round(v * 100) / 100; }

function emptyContext(): IndicadoresContext {
  return {
    isLoading: true,
    temDados: false,
    resumoExecutivo: {
      receitaPeriodo: 0, despesaPeriodo: 0, resultadoPeriodo: 0,
      margemLiquida: 0, saldoAtual: 0, variacaoReceita: 0,
      variacaoDespesa: 0, variacaoResultado: 0,
    },
    saudeFinanceira: {
      score: 0, label: "—", cor: "text-muted-foreground", bg: "bg-muted",
      subIndicadores: [], tendencia: "estavel", variacaoScore: 0,
    },
    caixaLiquidez: {
      saldoDisponivel: 0, saldoBloqueado: 0, saldoAplicado: 0,
      entradasPrevistas30d: 0, saidasPrevistas30d: 0, saldoProjetado30d: 0,
      indices: { liquidezImediata: 0, liquidezCorrente: 0, liquidezSeca: 0, liquidityRatio: "atencao" },
    },
    capitalGiro: {
      valor: 0, variacao: 0,
      ciclos: { pmr: 0, pmp: 0, pme: 0, cicloFinanceiro: 0, cicloOperacional: 0 },
      necessidadeCapitalGiro: 0, saldoDisponivel: 0,
    },
    rentabilidade: {
      margemBruta: 0, margemEBITDA: 0, margemLiquida: 0, roi: 0,
      variacaoMargemBruta: 0, variacaoMargemEBITDA: 0,
      variacaoMargemLiquida: 0, variacaoROI: 0, ebitda: 0, ebit: 0,
    },
    investimentos: {
      totalInvestido: 0, capEx: 0, roi: 0, tir: 0, vpl: 0,
      paybackMeses: 0, projetosAtivos: 0,
    },
    receitas: {
      total: 0, variacao: 0, porCategoria: [], porMes: [],
      ticketMedio: 0, recorrencia: 0, receitaRecorrente: 0, receitaNaoRecorrente: 0,
    },
    despesas: {
      total: 0, variacao: 0, porCategoria: [], porMes: [],
      custoFixo: 0, custoVariavel: 0, despesaOperacional: 0,
    },
    rankings: {
      topClientes: [], topReceitas: [], topFornecedores: [],
      topDespesas: [], topCategoriasReceita: [], topCategoriasDespesa: [],
    },
    contasAReceber: {
      totalAReceber: 0, vencido: 0, aVencer30d: 0, aVencer60d: 0,
      aVencer90d: 0, inadimplencia: 0, prazoMedioRecebimento: 0,
    },
    contasAPagar: {
      totalAPagar: 0, vencido: 0, aVencer30d: 0, aVencer60d: 0,
      aVencer90d: 0, prazoMedioPagamento: 0,
    },
    endividamento: {
      dividaTotal: 0, dividaCurtoPrazo: 0, dividaLongoPrazo: 0,
      dividaLiquida: 0, alavancagem: 0, coberturaJuros: 0, comprometimentoReceita: 0,
    },
    projecoes: {
      receitaProjetada: 0, despesaProjetada: 0, resultadoProjetado: 0,
      cenarioOtimista: { receita: 0, despesa: 0, resultado: 0 },
      cenarioPessimista: { receita: 0, despesa: 0, resultado: 0 },
      pontosProjetados: [],
    },
    comparativos: {
      vsPeriodoAnterior: { receita: 0, despesa: 0, resultado: 0, margem: 0 },
      vsOrcamento: { receita: 0, despesa: 0, resultado: 0 },
      vsMeta: { receita: { atual: 0, meta: 0, percentual: 0 }, margem: { atual: 0, meta: 0, percentual: 0 } },
      variacaoPercentual: { receita: 0, despesa: 0, resultado: 0 },
    },
    demonstrativos: { dre: null, dfc: null, balanco: null, balancete: [], razao: [] },
    auditoria: { totalEventos: 0, ultimosEventos: [], porAcao: [], porUsuario: [] },
  };
}

export function useIndicadores(): IndicadoresContext {
  const { isAuthenticated } = useAuthStore();
  const { ano, mes } = usePeriodoStore();
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [forecastIncomes, setForecastIncomes] = useState(0);
  const [forecastExpenses, setForecastExpenses] = useState(0);
  const [arSummary, setArSummary] = useState<{ totalAReceber: number; vencido: number; aVencer30d: number; aVencer60d: number; aVencer90d: number; inadimplencia: number; prazoMedioRecebimento: number } | null>(null);
  const [apSummary, setApSummary] = useState<{ totalAPagar: number; vencido: number; aVencer30d: number; aVencer60d: number; aVencer90d: number; prazoMedioPagamento: number } | null>(null);
  const [debtSummary, setDebtSummary] = useState<{ dividaTotal: number; dividaCurtoPrazo: number; dividaLongoPrazo: number } | null>(null);
  const [investmentSummary, setInvestmentSummary] = useState<{ totalInvestido: number; projetosAtivos: number; roiMedio: number | null; capEx: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    Promise.all([
      TransactionRepositoryApi.getAll(),
      CashForecastRepositoryApi.getTotals(),
      IndicatorsRepositoryApi.getAccountsReceivableSummary().catch(() => null),
      IndicatorsRepositoryApi.getAccountsPayableSummary().catch(() => null),
      IndicatorsRepositoryApi.getDebtSummary().catch(() => null),
      IndicatorsRepositoryApi.getInvestmentSummary().catch(() => null),
    ])
      .then(([txs, forecastTotals, ar, ap, debt, inv]) => {
        setAllTransactions(txs);
        setForecastIncomes(forecastTotals.predictedIncomes);
        setForecastExpenses(forecastTotals.predictedExpenses);
        setArSummary(ar);
        setApSummary(ap);
        setDebtSummary(debt);
        setInvestmentSummary(inv);
      })
      .catch((err) => console.error("useIndicadores error:", err))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  const lancamentosFiltrados = useMemo(() => {
    return allTransactions.filter((t) => {
      const d = parseLocalDate(t.date);
      if (d.getFullYear() !== ano) return false;
      if (mes !== null && d.getMonth() + 1 !== mes) return false;
      return true;
    });
  }, [allTransactions, ano, mes]);

  const ctx = useMemo((): IndicadoresContext => {
    if (isLoading) return { ...emptyContext(), isLoading: true };

    const allTx = allTransactions;
    const filtered = lancamentosFiltrados;
    const temDados = allTx.length > 0;

    const receitaPeriodo = total(filtered, "income");
    const despesaPeriodo = total(filtered, "expense");
    const resultadoPeriodo = receitaPeriodo - despesaPeriodo;
    const margemLiquida = receitaPeriodo > 0 ? (resultadoPeriodo / receitaPeriodo) * 100 : 0;
    const saldoAtual = total(allTx, "income") - total(allTx, "expense");
    const saldoProjetado = saldoAtual + forecastIncomes - forecastExpenses;

    // Resumo Executivo
    const allIncomes = total(allTx, "income");
    const allExpenses = total(allTx, "expense");

    const resumoExecutivo: ResumoExecutivoData = {
      receitaPeriodo,
      despesaPeriodo,
      resultadoPeriodo,
      margemLiquida,
      saldoAtual,
      variacaoReceita: 0,
      variacaoDespesa: 0,
      variacaoResultado: 0,
    };

    // Saúde Financeira
    const rawSaude = calcularSaude(saldoAtual, saldoProjetado, margemLiquida, receitaPeriodo, despesaPeriodo);
    const saudeFinanceira: SaudeFinanceiraData = {
      ...rawSaude,
      tendencia: "estavel",
      variacaoScore: 0,
    };

    // Caixa & Liquidez
    const caixaLiquidez: CaixaLiquidezData = {
      saldoDisponivel: saldoAtual > 0 ? saldoAtual * 0.7 : 0,
      saldoBloqueado: 0,
      saldoAplicado: saldoAtual > 0 ? saldoAtual * 0.3 : 0,
      entradasPrevistas30d: forecastIncomes,
      saidasPrevistas30d: forecastExpenses,
      saldoProjetado30d: saldoProjetado,
      indices: {
        liquidezImediata: despesaPeriodo > 0 ? round(saldoAtual / (despesaPeriodo || 1)) : 0,
        liquidezCorrente: despesaPeriodo > 0 ? round((saldoAtual + forecastIncomes) / (despesaPeriodo || 1)) : 0,
        liquidezSeca: despesaPeriodo > 0 ? round((saldoAtual + forecastIncomes) / (despesaPeriodo || 1)) : 0,
        liquidityRatio: saldoAtual > despesaPeriodo ? "saudavel" : saldoAtual > 0 ? "atencao" : "critico",
      },
    };

    // Capital de Giro
    const diasPeriodo = mes ? 30 : 365;
    const receitaDiaria = receitaPeriodo / Math.max(1, diasPeriodo);
    const despesaDiaria = despesaPeriodo / Math.max(1, diasPeriodo);
    const pmr = receitaDiaria > 0 ? 30 : 0;
    const pmp = despesaDiaria > 0 ? 30 : 0;
    const pme = despesaDiaria > 0 ? 15 : 0;
    const capitalGiro: CapitalGiroData = {
      valor: saldoAtual,
      variacao: 0,
      ciclos: {
        pmr, pmp, pme,
        cicloFinanceiro: pmr + pme - pmp,
        cicloOperacional: pmr + pme,
      },
      necessidadeCapitalGiro: (pmr + pme - pmp) * receitaDiaria,
      saldoDisponivel: saldoAtual,
    };

    // Rentabilidade
    const receitasTotal = allIncomes;
    const despesasTotal = allExpenses;
    const ebitda = resultadoPeriodo;
    const ebit = ebitda;
    const margemBruta = receitaPeriodo > 0 ? ((receitaPeriodo - despesaPeriodo) / receitaPeriodo) * 100 : 0;
    const rentabilidade: RentabilidadeData = {
      margemBruta,
      margemEBITDA: receitaPeriodo > 0 ? (ebitda / receitaPeriodo) * 100 : 0,
      margemLiquida,
      roi: 0,
      variacaoMargemBruta: 0,
      variacaoMargemEBITDA: 0,
      variacaoMargemLiquida: 0,
      variacaoROI: 0,
      ebitda,
      ebit,
    };

    // Investimentos
    const investimentos: InvestimentosData = {
      totalInvestido: investmentSummary?.totalInvestido ?? 0,
      capEx: investmentSummary?.capEx ?? 0,
      roi: investmentSummary?.roiMedio ?? 0,
      tir: 0,
      vpl: 0,
      paybackMeses: 0,
      projetosAtivos: investmentSummary?.projetosAtivos ?? 0,
    };

    // Receitas
    const receitaPorCat = groupByCategory(filtered, "income");
    const receitaTotal = receitaPeriodo;
    const receitasPorMes = groupByMonth(filtered.filter((t) => t.type === "income"));

    const receitas: ReceitasData = {
      total: receitaTotal,
      variacao: 0,
      porCategoria: [...receitaPorCat.entries()]
        .sort(([, a], [, b]) => b - a)
        .map(([categoria, valor], i) => ({
          categoria, valor,
          percentual: receitaTotal > 0 ? (valor / receitaTotal) * 100 : 0,
          cor: CORES_CATEGORIA[i % CORES_CATEGORIA.length],
        })),
      porMes: receitasPorMes,
      ticketMedio: receitaTotal / Math.max(1, filtered.filter((t) => t.type === "income").length),
      recorrencia: 0,
      receitaRecorrente: receitaTotal * 0.6,
      receitaNaoRecorrente: receitaTotal * 0.4,
    };

    // Despesas
    const despesaPorCat = groupByCategory(filtered, "expense");
    const despesaTotal = despesaPeriodo;

    const despesas: DespesasData = {
      total: despesaTotal,
      variacao: 0,
      porCategoria: [...despesaPorCat.entries()]
        .sort(([, a], [, b]) => b - a)
        .map(([categoria, valor], i) => ({
          categoria, valor,
          percentual: despesaTotal > 0 ? (valor / despesaTotal) * 100 : 0,
          cor: CORES_CATEGORIA[i % CORES_CATEGORIA.length],
        })),
      porMes: groupByMonth(filtered.filter((t) => t.type === "expense")),
      custoFixo: despesaTotal * 0.4,
      custoVariavel: despesaTotal * 0.6,
      despesaOperacional: despesaTotal * 0.8,
    };

    // Rankings
    const categoriasReceita = [...receitaPorCat.entries()]
      .sort(([, a], [, b]) => b - a)
      .map(([nome, valor], i) => ({
        nome, valor,
        percentual: receitaTotal > 0 ? (valor / receitaTotal) * 100 : 0,
        variacao: 0,
      }));
    const categoriasDespesa = [...despesaPorCat.entries()]
      .sort(([, a], [, b]) => b - a)
      .map(([nome, valor], i) => ({
        nome, valor,
        percentual: despesaTotal > 0 ? (valor / despesaTotal) * 100 : 0,
        variacao: 0,
      }));

    const rankings: RankingsData = {
      topClientes: [],
      topReceitas: categoriasReceita,
      topFornecedores: [],
      topDespesas: categoriasDespesa,
      topCategoriasReceita: categoriasReceita,
      topCategoriasDespesa: categoriasDespesa,
    };

    // Contas a Receber
    const contasAReceber: ContasAReceberData = {
      totalAReceber: arSummary?.totalAReceber ?? 0,
      vencido: arSummary?.vencido ?? 0,
      aVencer30d: arSummary?.aVencer30d ?? 0,
      aVencer60d: arSummary?.aVencer60d ?? 0,
      aVencer90d: arSummary?.aVencer90d ?? 0,
      inadimplencia: arSummary?.inadimplencia ?? 0,
      prazoMedioRecebimento: arSummary?.prazoMedioRecebimento ?? 0,
    };

    // Contas a Pagar
    const contasAPagar: ContasAPagarData = {
      totalAPagar: apSummary?.totalAPagar ?? 0,
      vencido: apSummary?.vencido ?? 0,
      aVencer30d: apSummary?.aVencer30d ?? 0,
      aVencer60d: apSummary?.aVencer60d ?? 0,
      aVencer90d: apSummary?.aVencer90d ?? 0,
      prazoMedioPagamento: apSummary?.prazoMedioPagamento ?? 0,
    };

    // Endividamento
    const endividamento: EndividamentoData = {
      dividaTotal: debtSummary?.dividaTotal ?? 0,
      dividaCurtoPrazo: debtSummary?.dividaCurtoPrazo ?? 0,
      dividaLongoPrazo: debtSummary?.dividaLongoPrazo ?? 0,
      dividaLiquida: (debtSummary?.dividaTotal ?? 0) - (saldoAtual > 0 ? saldoAtual : 0),
      alavancagem: receitaPeriodo > 0 ? ((debtSummary?.dividaTotal ?? 0) / receitaPeriodo) : 0,
      coberturaJuros: 0,
      comprometimentoReceita: receitaPeriodo > 0 ? ((debtSummary?.dividaTotal ?? 0) / receitaPeriodo) * 100 : 0,
    };

    // Projeções
    const mediaReceita = receitaPeriodo / Math.max(1, mes || 1);
    const mediaDespesa = despesaPeriodo / Math.max(1, mes || 1);
    const projecoes: ProjecoesIndicadoresData = {
      receitaProjetada: mediaReceita * 3,
      despesaProjetada: mediaDespesa * 3,
      resultadoProjetado: (mediaReceita - mediaDespesa) * 3,
      cenarioOtimista: {
        receita: mediaReceita * 3 * 1.2,
        despesa: mediaDespesa * 3 * 0.95,
        resultado: (mediaReceita * 3 * 1.2) - (mediaDespesa * 3 * 0.95),
      },
      cenarioPessimista: {
        receita: mediaReceita * 3 * 0.8,
        despesa: mediaDespesa * 3 * 1.1,
        resultado: (mediaReceita * 3 * 0.8) - (mediaDespesa * 3 * 1.1),
      },
      pontosProjetados: [],
    };

    // Comparativos
    const comparativos: ComparativosData = {
      vsPeriodoAnterior: { receita: 0, despesa: 0, resultado: 0, margem: 0 },
      vsOrcamento: { receita: 0, despesa: 0, resultado: 0 },
      vsMeta: {
        receita: { atual: receitaTotal, meta: receitaTotal * 1.1, percentual: receitaTotal > 0 ? (receitaTotal / (receitaTotal * 1.1)) * 100 : 0 },
        margem: { atual: margemLiquida, meta: 15, percentual: margemLiquida > 0 ? (margemLiquida / 15) * 100 : 0 },
      },
      variacaoPercentual: { receita: 0, despesa: 0, resultado: 0 },
    };

    // Demonstrativos (DRE only - computed)
    const itensDRE = [
      { conta: "Receita Bruta", valor: receitaTotal, percentualReceita: 100, tipo: "receita" as const },
      { conta: "Deduções", valor: 0, percentualReceita: 0, tipo: "deducao" as const },
      { conta: "Receita Líquida", valor: receitaTotal, percentualReceita: 100, tipo: "receita" as const },
      { conta: "Custos", valor: despesaTotal * 0.4, percentualReceita: receitaTotal > 0 ? (despesaTotal * 0.4 / receitaTotal) * 100 : 0, tipo: "custo" as const },
      { conta: "Lucro Bruto", valor: receitaTotal - despesaTotal * 0.4, percentualReceita: receitaTotal > 0 ? ((receitaTotal - despesaTotal * 0.4) / receitaTotal) * 100 : 0, tipo: "resultado" as const },
      { conta: "Despesas Operacionais", valor: despesaTotal * 0.6, percentualReceita: receitaTotal > 0 ? (despesaTotal * 0.6 / receitaTotal) * 100 : 0, tipo: "despesa" as const },
      { conta: "EBITDA", valor: ebitda, percentualReceita: receitaTotal > 0 ? (ebitda / receitaTotal) * 100 : 0, tipo: "resultado" as const },
      { conta: "EBIT", valor: ebit, percentualReceita: receitaTotal > 0 ? (ebit / receitaTotal) * 100 : 0, tipo: "resultado" as const },
      { conta: "Resultado Financeiro", valor: 0, percentualReceita: 0, tipo: "resultado" as const },
      { conta: "Impostos", valor: -Math.abs(resultadoPeriodo * 0.15), percentualReceita: receitaTotal > 0 ? (Math.abs(resultadoPeriodo * 0.15) / receitaTotal) * 100 : 0, tipo: "imposto" as const },
      { conta: "Lucro Líquido", valor: resultadoPeriodo - Math.abs(resultadoPeriodo * 0.15), percentualReceita: receitaTotal > 0 ? ((resultadoPeriodo - Math.abs(resultadoPeriodo * 0.15)) / receitaTotal) * 100 : 0, tipo: "resultado" as const },
    ];

    const demonstrativos: DemonstrativosData = {
      dre: {
        periodo: `${ano}${mes ? ` - Mês ${mes}` : ""}`,
        receitaBruta: receitaTotal,
        deducoes: 0,
        receitaLiquida: receitaTotal,
        custos: despesaTotal * 0.4,
        lucroBruto: receitaTotal - despesaTotal * 0.4,
        despesas: despesaTotal * 0.6,
        ebitda,
        ebit,
        resultadoFinanceiro: 0,
        imposto: -Math.abs(resultadoPeriodo * 0.15),
        lucroLiquido: resultadoPeriodo - Math.abs(resultadoPeriodo * 0.15),
        itens: itensDRE,
      },
      dfc: null,
      balanco: null,
      balancete: [],
      razao: [],
    };

    // Auditoria (empty)
    const auditoria: AuditoriaIndicadoresData = {
      totalEventos: 0,
      ultimosEventos: [],
      porAcao: [],
      porUsuario: [],
    };

    return {
      isLoading: false,
      temDados,
      resumoExecutivo,
      saudeFinanceira,
      caixaLiquidez,
      capitalGiro,
      rentabilidade,
      investimentos,
      receitas,
      despesas,
      rankings,
      contasAReceber,
      contasAPagar,
      endividamento,
      projecoes,
      comparativos,
      demonstrativos,
      auditoria,
    };
  }, [allTransactions, lancamentosFiltrados, forecastIncomes, forecastExpenses, mes, ano, isLoading, arSummary, apSummary, debtSummary, investmentSummary]);

  return ctx;
}
