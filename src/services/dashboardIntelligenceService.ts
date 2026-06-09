import type { Transaction } from "@/types";
import type {
  ProjecaoResult, CenarioParams, HorizonteProjecao,
  RunwayResult, BreakEvenResult, SparklinePoint,
  AcaoRecomendada, SaudeResult, SubIndicador,
  AlertaItem,
} from "@/types/dashboard";
import { parseLocalDate, formatCurrency } from "@/lib/utils";
import { RUNWAY_VERDE, RUNWAY_AMARELO } from "@/lib/constants";

function getMonthYear(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${meses[d.getMonth()]}/${d.getFullYear()}`;
}

export function calcularProjecao(
  lancamentos: Transaction[],
  horizonte: HorizonteProjecao,
  params?: CenarioParams
): ProjecaoResult {
  const meses = Math.max(1, Math.ceil(horizonte / 30));

  const entradasMensais: number[] = [];
  const saidasMensais: number[] = [];
  const receitasPorMes = new Map<string, number>();
  const custosPorMes = new Map<string, number>();

  lancamentos.forEach((t) => {
    const key = getMonthYear(t.date);
    if (t.type === "income") {
      receitasPorMes.set(key, (receitasPorMes.get(key) || 0) + t.value);
    } else {
      custosPorMes.set(key, (custosPorMes.get(key) || 0) + t.value);
    }
  });

  const allKeys = [...new Set([...receitasPorMes.keys(), ...custosPorMes.keys()])].sort();
  allKeys.forEach((key) => {
    entradasMensais.push(receitasPorMes.get(key) || 0);
    saidasMensais.push(custosPorMes.get(key) || 0);
  });

  let mediaEntrada = entradasMensais.length > 0
    ? entradasMensais.reduce((s, v) => s + v, 0) / entradasMensais.length
    : 0;
  let mediaSaida = saidasMensais.length > 0
    ? saidasMensais.reduce((s, v) => s + v, 0) / saidasMensais.length
    : 0;

  if (params) {
    mediaEntrada = mediaEntrada * (1 + params.crescimentoReceita / 100);
    mediaSaida = mediaSaida * (1 + params.variacaoCustos / 100);
    mediaSaida += params.novoCustoFixo;
  }

  const mesesExtras = Math.max(0, meses - allKeys.length);
  const receitaProjetada = mediaEntrada * (allKeys.length + mesesExtras);
  let custosProjetados = mediaSaida * (allKeys.length + mesesExtras);

  if (params && params.despesaPontual > 0) {
    custosProjetados += params.despesaPontual;
  }

  const margem = receitaProjetada > 0
    ? ((receitaProjetada - custosProjetados) / receitaProjetada) * 100
    : 0;

  const allIncomes = lancamentos.filter((t) => t.type === "income").reduce((s, t) => s + t.value, 0);
  const allExpenses = lancamentos.filter((t) => t.type === "expense").reduce((s, t) => s + t.value, 0);
  const saldoAtual = allIncomes - allExpenses;
  const saldoFinal = saldoAtual + receitaProjetada - custosProjetados;

  const pontosRealizado: { mes: string; valor: number }[] = [];
  const ultimosMeses = allKeys.slice(-6);
  ultimosMeses.forEach((key) => {
    const entradas = receitasPorMes.get(key) || 0;
    const saidas = custosPorMes.get(key) || 0;
    pontosRealizado.push({ mes: key, valor: entradas - saidas });
  });

  const pontosProjetado: { mes: string; valor: number; base: number; intervaloSuperior: number; intervaloInferior: number }[] = [];
  const hoje = new Date();
  for (let i = 1; i <= mesesExtras + 1; i++) {
    const mesNome = getFutureMonth(hoje, i);
    const base = mediaEntrada - mediaSaida;
    pontosProjetado.push({
      mes: mesNome,
      valor: base,
      base,
      intervaloSuperior: base * 1.15,
      intervaloInferior: base * 0.85,
    });
  }

  return {
    receita: receitaProjetada,
    custos: custosProjetados,
    margem,
    saldoFinal,
    pontosRealizado,
    pontosProjetado,
  };
}

function getFutureMonth(from: Date, monthsAhead: number): string {
  const d = new Date(from);
  d.setMonth(d.getMonth() + monthsAhead);
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${meses[d.getMonth()]}/${d.getFullYear()}`;
}

export function calcularRunway(saldoAtual: number, custoMedioMensal: number): RunwayResult {
  if (custoMedioMensal <= 0) {
    return { meses: 99, dias: 0, status: "seguro", label: "+99 meses" };
  }
  const mesesFloat = saldoAtual / custoMedioMensal;
  const meses = Math.floor(mesesFloat);
  const dias = Math.round((mesesFloat - meses) * 30);

  let status: RunwayResult["status"];
  if (meses >= RUNWAY_VERDE) status = "seguro";
  else if (meses >= RUNWAY_AMARELO) status = "atencao";
  else status = "critico";

  const label = meses >= 99 ? "+99 meses" : `${meses} meses e ${dias} dias`;
  return { meses, dias, status, label };
}

export function calcularBreakEven(lancamentos: Transaction[]): BreakEvenResult {
  const entradas = lancamentos.filter((t) => t.type === "income").reduce((s, t) => s + t.value, 0);
  const saidas = lancamentos.filter((t) => t.type === "expense").reduce((s, t) => s + t.value, 0);
  const custoMedio = saidas > 0 ? saidas : 0;

  if (entradas === 0) {
    return { valor: custoMedio, percentualAtingido: 0, acima: false };
  }

  const percentual = (saidas / entradas) * 100;
  return {
    valor: custoMedio,
    percentualAtingido: Math.min(100, percentual),
    acima: entradas > saidas,
  };
}

export function calcularSaude(
  saldoAtual: number,
  saldoProjetado: number,
  margemLiquida: number,
  entradas: number,
  saidas: number,
  entradasPeriodoAnterior?: number
): SaudeResult {
  const subIndicadores: SubIndicador[] = [];

  // Sub-indicador 1 - Fluxo de Caixa
  const scoreFluxo = saldoAtual > 0 && saldoProjetado > 0 ? 5
    : saldoAtual > 0 ? 3
    : 1;
  subIndicadores.push({
    nome: "Fluxo de Caixa",
    score: scoreFluxo,
    tooltip: "Avalia se seu saldo atual e projetado são positivos. Mantenha recebimentos em dia e pagamentos programados para melhorar.",
  });

  // Sub-indicador 2 - Margem Líquida
  const scoreMargem = margemLiquida > 20 ? 5
    : margemLiquida > 10 ? 4
    : margemLiquida > 5 ? 3
    : margemLiquida > 0 ? 2
    : 1;
  subIndicadores.push({
    nome: "Margem Líquida",
    score: scoreMargem,
    tooltip: "Percentual de lucro sobre a receita. Quanto maior, mais eficiente é sua operação.",
  });

  // Sub-indicador 3 - Crescimento de Receita
  let scoreCrescimento = 3;
  if (entradasPeriodoAnterior !== undefined && entradasPeriodoAnterior > 0) {
    const crescimento = ((entradas - entradasPeriodoAnterior) / entradasPeriodoAnterior) * 100;
    scoreCrescimento = crescimento > 10 ? 5
      : crescimento >= 0 ? 4
      : crescimento >= -10 ? 2
      : 1;
  }
  subIndicadores.push({
    nome: "Crescimento de Receita",
    score: scoreCrescimento,
    tooltip: "Compara sua receita atual com o período anterior. Crescimento consistente indica expansão saudável.",
  });

  // Sub-indicador 4 - Equilíbrio Operacional
  const scoreEquilibrio = entradas > saidas ? 5
    : Math.abs(entradas - saidas) / Math.max(entradas, saidas, 1) <= 0.05 ? 3
    : 1;
  subIndicadores.push({
    nome: "Equilíbrio Operacional",
    score: scoreEquilibrio,
    tooltip: "Verifica se suas entradas superam as saídas. Sinal básico de sustentabilidade financeira.",
  });

  const mediaScore = subIndicadores.reduce((s, si) => s + si.score, 0) / subIndicadores.length;
  const score = Math.round(mediaScore * 20);

  let label: string;
  let cor: string;
  let bg: string;

  if (score >= 80) {
    label = "Excelente"; cor = "text-emerald-400"; bg = "bg-emerald-500/10";
  } else if (score >= 60) {
    label = "Boa"; cor = "text-blue-400"; bg = "bg-blue-500/10";
  } else if (score >= 40) {
    label = "Regular"; cor = "text-yellow-400"; bg = "bg-yellow-500/10";
  } else {
    label = "Crítica"; cor = "text-red-400"; bg = "bg-red-500/10";
  }

  return { score, label, cor, bg, subIndicadores };
}

export function gerarNotaCFO(
  dados: { entradas: number; margemLiquida: number; saldoAtual: number },
  alertas: AlertaItem[]
): string {
  const { entradas, margemLiquida, saldoAtual } = dados;

  const alertasCriticos = alertas.filter((a) => a.tipo === "critico");
  const alertasAtencao = alertas.filter((a) => a.tipo === "atencao");
  const alertasPositivos = alertas.filter((a) => a.tipo === "positivo");

  const frase1 = `Sua empresa registrou receita de ${formatCurrency(entradas)} no período, com margem líquida de ${margemLiquida.toFixed(1)}% e saldo atual de ${formatCurrency(saldoAtual)}.`;

  let frase2 = "";
  if (alertasCriticos.length > 0) {
    frase2 = `Há um ponto de atenção importante: ${alertasCriticos[0].titulo}.`;
  } else if (alertasAtencao.length > 0) {
    frase2 = `Os indicadores estão estáveis, com um ponto de monitoramento: ${alertasAtencao[0].titulo}.`;
  } else if (alertasPositivos.some((a) => a.categoria === "receita" && a.titulo.includes("Melhor desempenho"))) {
    frase2 = "Este está sendo seu melhor período do ano em receita.";
  } else {
    frase2 = "Todos os indicadores financeiros estão dentro do esperado.";
  }

  let frase3 = "";
  if (alertasCriticos.some((a) => a.categoria === "margem")) {
    frase3 = "Recomendo revisar as categorias de custo com maior crescimento antes de assumir novos compromissos financeiros.";
  } else if (alertasCriticos.some((a) => a.categoria === "fluxo")) {
    frase3 = "Priorize a confirmação de recebíveis previstos e avalie a postergação de pagamentos não essenciais.";
  } else if (margemLiquida > 20 && alertas.length === 0) {
    frase3 = "O momento é favorável para avaliar investimentos de expansão ou formação de reserva estratégica.";
  } else {
    frase3 = "Continue monitorando seus indicadores para manter a saúde financeira.";
  }

  return `${frase1} ${frase2} ${frase3}`;
}

export function gerarAcoesRecomendadas(
  lancamentos: Transaction[],
  alertas: AlertaItem[],
  entradas: number,
  saidas: number
): AcaoRecomendada[] {
  const acoes: AcaoRecomendada[] = [];

  const alertaFluxo = alertas.find((a) => a.categoria === "fluxo" && a.tipo === "critico");
  if (alertaFluxo) {
    acoes.push({
      id: "acao-fluxo",
      texto: `Revisar pagamentos previstos para evitar saldo negativo`,
      urgencia: "urgente",
      href: "/cash-forecast",
      concluido: false,
    });
  }

  const recebimentosAtrasados = lancamentos.filter((t) => {
    const d = parseLocalDate(t.date);
    return t.type === "income" && d < new Date();
  });
  if (recebimentosAtrasados.length > 0) {
    const total = recebimentosAtrasados.reduce((s, t) => s + t.value, 0);
    acoes.push({
      id: "acao-atrasados",
      texto: `Confirmar recebimento de ${formatCurrency(total)} previsto para data anterior`,
      urgencia: "urgente",
      href: "/financial",
      concluido: false,
    });
  }

  const alertaCusto = alertas.find((a) => a.categoria === "custo");
  if (alertaCusto) {
    acoes.push({
      id: "acao-custos",
      texto: `Revisar categorias de gasto acima da média`,
      urgencia: "esta_semana",
      href: "/categories",
      concluido: false,
    });
  }

  if (alertas.filter((a) => a.tipo === "atencao").length > 0) {
    acoes.push({
      id: "acao-alertas",
      texto: "Verificar alertas financeiros pendentes",
      urgencia: "esta_semana",
      href: "/dashboard/alertas",
      concluido: false,
    });
  }

  if (entradas > saidas) {
    acoes.push({
      id: "acao-planejamento",
      texto: "Avaliar oportunidades de investimento com base no superávit do período",
      urgencia: "este_mes",
      href: "/dashboard/projecoes",
      concluido: false,
    });
  }

  return acoes.slice(0, 5);
}

export function calcularSparkline(
  lancamentos: Transaction[],
  campo: "income" | "expense",
  periodos: number = 6
): SparklinePoint[] {
  const porMes = new Map<string, number>();
  lancamentos
    .filter((t) => t.type === campo)
    .forEach((t) => {
      const key = getMonthYear(t.date);
      porMes.set(key, (porMes.get(key) || 0) + t.value);
    });

  const sorted = [...porMes.keys()].sort();
  const recentes = sorted.slice(-periodos);

  return recentes.map((key) => ({
    periodo: key,
    valor: porMes.get(key) || 0,
  }));
}
