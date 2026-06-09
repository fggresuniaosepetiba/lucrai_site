import type { Transaction } from "@/types";
import type { AlertaItem, AlertaTipo, AlertaCategoria } from "@/types/dashboard";
import { db } from "@/database/dexie";
import { parseLocalDate, formatCurrency } from "@/lib/utils";
import { DESVIO_ANOMALIA_CUSTO, LIMIAR_QUEDA_MARGEM_CRITICO, LIMIAR_QUEDA_MARGEM_ATENCAO } from "@/lib/constants";

let idCounter = 0;
function gerarId(): string {
  idCounter += 1;
  return `alerta-${Date.now()}-${idCounter}`;
}

interface DadosParaAlertas {
  lancamentos: Transaction[];
  entradas: number;
  saidas: number;
  saldoAtual: number;
  saldoProjetado: number;
  margemLiquida: number;
  recebimentosPrevistos: number;
  pagamentosPrevistos: number;
  periodoAnteriorEntradas?: number;
  periodoAnteriorMargem?: number;
}

export async function getAlertasDispensados(): Promise<Set<string>> {
  try {
    const stored = await db.settings.get("alertas-dispensados");
    if (stored && stored.company) {
      const parsed = JSON.parse(stored.company);
      return new Set<string>(parsed);
    }
    return new Set<string>();
  } catch {
    return new Set<string>();
  }
}

export async function dispensarAlerta(id: string): Promise<void> {
  const stored = await getAlertasDispensados();
  stored.add(id);
  await db.settings.put({
    id: "alertas-dispensados",
    company: JSON.stringify(Array.from(stored)),
    companyName: "",
    primaryColor: "",
  });
}

export async function restaurarAlerta(id: string): Promise<void> {
  const stored = await getAlertasDispensados();
  stored.delete(id);
  await db.settings.put({
    id: "alertas-dispensados",
    company: JSON.stringify(Array.from(stored)),
    companyName: "",
    primaryColor: "",
  });
}

function criarAlerta(
  tipo: AlertaTipo,
  categoria: AlertaCategoria,
  titulo: string,
  descricao: string,
  dadosContextuais: { label: string; valor: string }[],
  acaoLabel: string,
  acaoHref: string,
  dispensado: boolean = false
): AlertaItem {
  return {
    id: gerarId(),
    tipo,
    categoria,
    titulo,
    descricao,
    dadosContextuais,
    acaoLabel,
    acaoHref,
    dispensado,
    geradoEm: new Date().toISOString(),
  };
}

export function calcularAlertasAtivos(
  dados: DadosParaAlertas,
  dispensados: Set<string> = new Set()
): AlertaItem[] {
  const alertas: AlertaItem[] = [];
  const {
    lancamentos, entradas, saidas, saldoAtual, saldoProjetado,
    margemLiquida, recebimentosPrevistos, pagamentosPrevistos,
    periodoAnteriorEntradas, periodoAnteriorMargem,
  } = dados;

  const totalEntradas = lancamentos.filter((t) => t.type === "income").reduce((s, t) => s + t.value, 0);

  if (!lancamentos || lancamentos.length === 0) return [];

  // A - Fluxo de Caixa Negativo Iminente
  if ((saldoAtual + recebimentosPrevistos - pagamentosPrevistos) < 0) {
    alertas.push(criarAlerta(
      "critico", "fluxo",
      "Risco de saldo negativo nos próximos dias",
      "Com base no saldo atual e nos pagamentos previstos, seu fluxo de caixa pode ficar negativo em breve.",
      [
        { label: "Saldo atual", valor: formatCurrency(saldoAtual) },
        { label: "Pagamentos previstos", valor: formatCurrency(pagamentosPrevistos) },
        { label: "Saldo projetado", valor: formatCurrency(saldoProjetado) },
      ],
      "Revisar pagamentos previstos",
      "/cash-forecast"
    ));
  }

  // B - Queda de Margem Líquida
  if (periodoAnteriorMargem !== undefined && periodoAnteriorMargem > 0 && margemLiquida < periodoAnteriorMargem) {
    const diferenca = periodoAnteriorMargem - margemLiquida;
    const severidade: AlertaTipo = diferenca >= LIMIAR_QUEDA_MARGEM_CRITICO ? "critico" : "atencao";
    if (diferenca >= LIMIAR_QUEDA_MARGEM_ATENCAO) {
      alertas.push(criarAlerta(
        severidade, "margem",
        `Margem líquida caiu ${diferenca.toFixed(1)} pontos percentuais`,
        `Sua margem passou de ${periodoAnteriorMargem.toFixed(1)}% para ${margemLiquida.toFixed(1)}%. Mantida essa tendência, a sustentabilidade operacional será pressionada.`,
        [
          { label: "Margem anterior", valor: `${periodoAnteriorMargem.toFixed(1)}%` },
          { label: "Margem atual", valor: `${margemLiquida.toFixed(1)}%` },
          { label: "Variação", valor: `-${diferenca.toFixed(1)} pontos` },
        ],
        "Ver gastos por categoria",
        "/dashboard"
      ));
    }
  }

  // C - Custos Crescendo Acima da Receita
  if (periodoAnteriorEntradas !== undefined && periodoAnteriorEntradas > 0) {
    const crescReceita = entradas > 0 ? ((entradas - periodoAnteriorEntradas) / periodoAnteriorEntradas) * 100 : 0;
    const custosPeriodo = saidas;
    const custosAnterior = dados.entradas > 0
      ? totalEntradas - entradas + saidas - custosPeriodo
      : 0;
    if (custosAnterior > 0 && crescReceita >= 0) {
      const crescCustos = ((custosPeriodo - custosAnterior) / custosAnterior) * 100;
      if (crescCustos > crescReceita) {
        alertas.push(criarAlerta(
          "atencao", "custo",
          "Custos crescendo mais rápido que a receita",
          `Sua receita cresceu ${crescReceita.toFixed(1)}% mas seus custos cresceram ${crescCustos.toFixed(1)}% no mesmo período. Se mantido, sua margem será corroída.`,
          [
            { label: "Crescimento de receita", valor: `+${crescReceita.toFixed(1)}%` },
            { label: "Crescimento de custos", valor: `+${crescCustos.toFixed(1)}%` },
            { label: "Diferença", valor: `${(crescCustos - crescReceita).toFixed(1)} pontos` },
          ],
          "Analisar categorias de custo",
          "/categories"
        ));
      }
    }
  }

  // D - Gasto Anômalo em Categoria
  // Simplificado: compara total de saídas com média do período (sem 3 períodos históricos)
  const mediaCustosMensal = saidas / Math.max(1, [...new Set(lancamentos.map((t) => {
    const d = parseLocalDate(t.date);
    return `${d.getFullYear()}-${d.getMonth()}`;
  }))].length);
  if (saidas > mediaCustosMensal * DESVIO_ANOMALIA_CUSTO && entradas > 0) {
    const desvio = ((saidas - mediaCustosMensal) / mediaCustosMensal) * 100;
    alertas.push(criarAlerta(
      "atencao", "custo",
      `Gastos 30% acima da média`,
      `Seus gastos no período foram de ${formatCurrency(saidas)}, contra uma média de ${formatCurrency(mediaCustosMensal)}. Pode ser um evento pontual — vale investigar.`,
      [
        { label: "Gasto atual", valor: formatCurrency(saidas) },
        { label: "Média histórica", valor: formatCurrency(mediaCustosMensal) },
        { label: "Desvio", valor: `+${desvio.toFixed(1)}%` },
      ],
      "Ver lançamentos desta categoria",
      "/financial"
    ));
  }

  // E - Recebimentos Previstos em Atraso
  const hoje = new Date();
  const recebimentosAtrasados = lancamentos.filter((t) => {
    const d = parseLocalDate(t.date);
    return t.type === "income" && d < hoje;
  });
  if (recebimentosAtrasados.length > 0) {
    const totalAtrasado = recebimentosAtrasados.reduce((s, t) => s + t.value, 0);
    const maisAntigo = recebimentosAtrasados.reduce((antigo, t) =>
      parseLocalDate(t.date) < parseLocalDate(antigo.date) ? t : antigo
    );
    const diasAtraso = Math.floor((hoje.getTime() - parseLocalDate(maisAntigo.date).getTime()) / (1000 * 60 * 60 * 24));
    const severidade: AlertaTipo = diasAtraso > 15 ? "critico" : "atencao";
    if (diasAtraso > 7) {
      alertas.push(criarAlerta(
        severidade, "inadimplencia",
        `${recebimentosAtrasados.length} recebimento(s) previsto(s) em atraso`,
        `Você tem ${recebimentosAtrasados.length} recebimento(s) totalizando ${formatCurrency(totalAtrasado)} que não foram confirmados após a data prevista. Verifique a inadimplência.`,
        [
          { label: "Quantidade", valor: `${recebimentosAtrasados.length} lançamentos` },
          { label: "Valor total", valor: formatCurrency(totalAtrasado) },
          { label: "Mais antigo", valor: formatDate(maisAntigo.date) },
        ],
        "Ver lançamentos em atraso",
        "/financial"
      ));
    }
  }

  // Insight A - Melhor Período do Ano
  if (entradas > 0 && totalEntradas > entradas) {
    const receitasMensais = new Map<string, number>();
    lancamentos.filter((t) => t.type === "income").forEach((t) => {
      const d = parseLocalDate(t.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      receitasMensais.set(key, (receitasMensais.get(key) || 0) + t.value);
    });
    const maiorReceita = Math.max(...receitasMensais.values(), 0);
    if (entradas >= maiorReceita && entradas > 0) {
      const segundaMaior = [...receitasMensais.values()].sort((a, b) => b - a)[1] || 0;
      alertas.push(criarAlerta(
        "positivo", "receita",
        "Melhor desempenho de receita do ano",
        "Este é seu melhor período do ano em receita. Aproveite para reforçar o caixa e avaliar investimentos estratégicos.",
        [
          { label: "Receita atual", valor: formatCurrency(entradas) },
          { label: "Segunda maior", valor: formatCurrency(segundaMaior) },
        ],
        "Ver projeções",
        "/dashboard/projecoes"
      ));
    }
  }

  // Insight B - Margem em Expansão Consecutiva (simplificado)
  if (periodoAnteriorMargem !== undefined && margemLiquida > periodoAnteriorMargem && periodoAnteriorMargem > 0) {
    alertas.push(criarAlerta(
      "positivo", "margem",
      "Margem em crescimento",
      "Sua eficiência operacional está melhorando consistentemente. Sinal de maturidade na gestão de custos.",
      [
        { label: "Margem atual", valor: `${margemLiquida.toFixed(1)}%` },
        { label: "Margem anterior", valor: `${periodoAnteriorMargem.toFixed(1)}%` },
      ],
      "Ver análise",
      "/dashboard"
    ));
  }

  // Filtrar dispensados
  return alertas.filter((a) => !dispensados.has(a.id));
}

function formatDate(dateStr: string): string {
  try {
    const d = parseLocalDate(dateStr);
    return new Intl.DateTimeFormat("pt-BR").format(d);
  } catch {
    return dateStr;
  }
}
