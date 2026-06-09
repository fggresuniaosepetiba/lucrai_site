import type { Transaction } from "./index";

export type AlertaTipo = "critico" | "atencao" | "positivo";
export type AlertaCategoria = "fluxo" | "margem" | "receita" | "custo" | "inadimplencia" | "crescimento";

export interface AlertaItem {
  id: string;
  tipo: AlertaTipo;
  categoria: AlertaCategoria;
  titulo: string;
  descricao: string;
  dadosContextuais: { label: string; valor: string }[];
  acaoLabel: string;
  acaoHref: string;
  dispensado: boolean;
  dispensadoEm?: string;
  geradoEm: string;
}

export type HorizonteProjecao = 30 | 60 | 90 | 180 | 365;

export interface ProjecaoResult {
  receita: number;
  custos: number;
  margem: number;
  saldoFinal: number;
  pontosRealizado: { mes: string; valor: number }[];
  pontosProjetado: { mes: string; valor: number; base: number; intervaloSuperior: number; intervaloInferior: number }[];
  pontosSimulados?: { mes: string; valor: number }[];
}

export interface CenarioParams {
  crescimentoReceita: number;
  variacaoCustos: number;
  novoCustoFixo: number;
  despesaPontual: number;
  despesaPontualMes: number;
}

export interface RunwayResult {
  meses: number;
  dias: number;
  status: "seguro" | "atencao" | "critico";
  label: string;
}

export interface BreakEvenResult {
  valor: number;
  percentualAtingido: number;
  acima: boolean;
}

export interface KPIData {
  label: string;
  valor: string;
  variacao?: string;
  variacaoPositiva?: boolean;
  sparkline?: SparklinePoint[];
  link?: string;
  badge?: { texto: string; variante: "verde" | "vermelho" | "amarelo" | "info" };
}

export interface SparklinePoint {
  periodo: string;
  valor: number;
}

export interface AcaoRecomendada {
  id: string;
  texto: string;
  urgencia: "urgente" | "esta_semana" | "este_mes";
  href: string;
  concluido: boolean;
}

export interface AgendaItem {
  data: string;
  label: string;
  descricao: string;
  valor: number;
  tipo: "income" | "expense";
}

export interface SaudeResult {
  score: number;
  label: string;
  cor: string;
  bg: string;
  subIndicadores: SubIndicador[];
}

export interface SubIndicador {
  nome: string;
  score: number;
  tooltip: string;
}

export interface PeriodoState {
  ano: number;
  mes: number | null;
  periodoLabel: string;
  isFiltered: boolean;
}

export interface PeriodoActions {
  setAno: (ano: number) => void;
  setMes: (mes: number | null) => void;
  limparFiltro: () => void;
}

export interface DadosFiltradosResult {
  lancamentos: Transaction[];
  entradas: number;
  saidas: number;
  saldoAtual: number;
  saldoProjetado: number;
  margemLiquida: number;
  recebimentosPrevistos: number;
  pagamentosPrevistos: number;
  periodoAtivo: { ano: number; mes: number | null };
  isLoading: boolean;
}
