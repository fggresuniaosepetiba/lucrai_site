import type { Transaction } from "./index";

// ============ INDICADORES INTELLIGENCE CENTER ============

export type IndicadorTabId =
  | "visao-geral"
  | "caixa-liquidez"
  | "rentabilidade"
  | "receitas"
  | "despesas"
  | "contas-receber-pagar"
  | "endividamento"
  | "projecoes"
  | "demonstrativos"
  | "auditoria";

export interface IndicadorTab {
  id: IndicadorTabId;
  label: string;
  icon: string;
}

export interface FiltroGlobal {
  periodo: { ano: number; mes: number | null };
  competencia: string | null;
  regime: "caixa" | "competencia";
  centroCusto: string | null;
  categoria: string | null;
  contaBancaria: string | null;
  cliente: string | null;
  fornecedor: string | null;
  projeto: string | null;
  unidadeNegocio: string | null;
  formaPagamento: string | null;
}

// --- Resumo Executivo (bloco 1) ---
export interface ResumoExecutivoData {
  receitaPeriodo: number;
  despesaPeriodo: number;
  resultadoPeriodo: number;
  margemLiquida: number;
  saldoAtual: number;
  variacaoReceita: number;
  variacaoDespesa: number;
  variacaoResultado: number;
}

// --- Saúde Financeira (bloco 16) ---
export interface SaudeFinanceiraData {
  score: number;
  label: string;
  cor: string;
  bg: string;
  subIndicadores: SubIndicador[];
  tendencia: "melhorou" | "piorou" | "estavel";
  variacaoScore: number;
}

// --- Caixa & Liquidez (bloco 2) ---
export interface CaixaLiquidezData {
  saldoDisponivel: number;
  saldoBloqueado: number;
  saldoAplicado: number;
  entradasPrevistas30d: number;
  saidasPrevistas30d: number;
  saldoProjetado30d: number;
  indices: {
    liquidezImediata: number;
    liquidezCorrente: number;
    liquidezSeca: number;
    liquidityRatio: "saudavel" | "atencao" | "critico";
  };
}

// --- Capital de Giro (bloco 9) ---
export interface CapitalGiroData {
  valor: number;
  variacao: number;
  ciclos: {
    pmr: number;
    pmp: number;
    pme: number;
    cicloFinanceiro: number;
    cicloOperacional: number;
  };
  necessidadeCapitalGiro: number;
  saldoDisponivel: number;
}

// --- Rentabilidade (bloco 3) ---
export interface RentabilidadeData {
  margemBruta: number;
  margemEBITDA: number;
  margemLiquida: number;
  roi: number;
  variacaoMargemBruta: number;
  variacaoMargemEBITDA: number;
  variacaoMargemLiquida: number;
  variacaoROI: number;
  ebitda: number;
  ebit: number;
}

// --- Investimentos (bloco 10) ---
export interface InvestimentosData {
  totalInvestido: number;
  capEx: number;
  roi: number;
  tir: number;
  vpl: number;
  paybackMeses: number;
  projetosAtivos: number;
}

// --- Receitas (bloco 4) ---
export interface ReceitasData {
  total: number;
  variacao: number;
  porCategoria: { categoria: string; valor: number; percentual: number; cor: string }[];
  porMes: { mes: string; valor: number }[];
  ticketMedio: number;
  recorrencia: number;
  receitaRecorrente: number;
  receitaNaoRecorrente: number;
}

// --- Despesas (bloco 5) ---
export interface DespesasData {
  total: number;
  variacao: number;
  porCategoria: { categoria: string; valor: number; percentual: number; cor: string }[];
  porMes: { mes: string; valor: number }[];
  custoFixo: number;
  custoVariavel: number;
  despesaOperacional: number;
}

// --- Rankings (bloco 13) ---
export interface RankingItem {
  nome: string;
  valor: number;
  percentual: number;
  variacao: number;
  quantidade?: number;
}

export interface RankingsData {
  topClientes: RankingItem[];
  topReceitas: RankingItem[];
  topFornecedores: RankingItem[];
  topDespesas: RankingItem[];
  topCategoriasReceita: RankingItem[];
  topCategoriasDespesa: RankingItem[];
}

// --- Contas a Receber (bloco 6) ---
export interface ContasAReceberData {
  totalAReceber: number;
  vencido: number;
  aVencer30d: number;
  aVencer60d: number;
  aVencer90d: number;
  inadimplencia: number;
  prazoMedioRecebimento: number;
}

// --- Contas a Pagar (bloco 7) ---
export interface ContasAPagarData {
  totalAPagar: number;
  vencido: number;
  aVencer30d: number;
  aVencer60d: number;
  aVencer90d: number;
  prazoMedioPagamento: number;
}

// --- Endividamento (bloco 8) ---
export interface EndividamentoData {
  dividaTotal: number;
  dividaCurtoPrazo: number;
  dividaLongoPrazo: number;
  dividaLiquida: number;
  alavancagem: number;
  coberturaJuros: number;
  comprometimentoReceita: number;
}

// --- Projeções (bloco 11) ---
export interface ProjecoesIndicadoresData {
  receitaProjetada: number;
  despesaProjetada: number;
  resultadoProjetado: number;
  cenarioOtimista: { receita: number; despesa: number; resultado: number };
  cenarioPessimista: { receita: number; despesa: number; resultado: number };
  pontosProjetados: { mes: string; otimista: number; realista: number; pessimista: number }[];
}

// --- Comparativos (bloco 12) ---
export interface ComparativosData {
  vsPeriodoAnterior: { receita: number; despesa: number; resultado: number; margem: number };
  vsOrcamento: { receita: number; despesa: number; resultado: number };
  vsMeta: { receita: { atual: number; meta: number; percentual: number }; margem: { atual: number; meta: number; percentual: number } };
  variacaoPercentual: { receita: number; despesa: number; resultado: number };
}

// --- Demonstrativos (bloco 14) ---
export interface DREItem {
  conta: string;
  valor: number;
  percentualReceita: number;
  tipo: "receita" | "deducao" | "custo" | "despesa" | "imposto" | "resultado";
}

export interface DRE {
  periodo: string;
  receitaBruta: number;
  deducoes: number;
  receitaLiquida: number;
  custos: number;
  lucroBruto: number;
  despesas: number;
  ebitda: number;
  ebit: number;
  resultadoFinanceiro: number;
  imposto: number;
  lucroLiquido: number;
  itens: DREItem[];
}

export interface DFCItem {
  categoria: string;
  valor: number;
  tipo: "operacional" | "investimento" | "financiamento";
}

export interface DFC {
  periodo: string;
  saldoInicial: number;
  fluxoOperacional: number;
  fluxoInvestimento: number;
  fluxoFinanciamento: number;
  variacaoCambial: number;
  saldoFinal: number;
  itens: DFCItem[];
}

export interface BalancoItem {
  conta: string;
  valor: number;
  tipo: "ativo" | "passivo" | "pl";
}

export interface Balanco {
  periodo: string;
  ativoCirculante: number;
  ativoNaoCirculante: number;
  ativoTotal: number;
  passivoCirculante: number;
  passivoNaoCirculante: number;
  passivoTotal: number;
  patrimonioLiquido: number;
  itens: BalancoItem[];
}

export interface BalanceteItem {
  conta: string;
  saldoAnterior: number;
  debito: number;
  credito: number;
  saldoAtual: number;
}

export interface RazaoItem {
  data: string;
  historico: string;
  debito: number;
  credito: number;
  saldo: number;
}

export interface DemonstrativosData {
  dre: DRE | null;
  dfc: DFC | null;
  balanco: Balanco | null;
  balancete: BalanceteItem[];
  razao: RazaoItem[];
}

// --- Auditoria (bloco 15) ---
export interface AuditoriaIndicadoresData {
  totalEventos: number;
  ultimosEventos: AuditoriaEvento[];
  porAcao: { acao: string; quantidade: number }[];
  porUsuario: { usuario: string; quantidade: number }[];
}

export interface AuditoriaEvento {
  id: string;
  timestamp: string;
  usuario: string;
  acao: string;
  entidade: string;
  descricao: string;
}

// --- Full context ---
export interface IndicadoresContext {
  isLoading: boolean;
  temDados: boolean;
  resumoExecutivo: ResumoExecutivoData;
  saudeFinanceira: SaudeFinanceiraData;
  caixaLiquidez: CaixaLiquidezData;
  capitalGiro: CapitalGiroData;
  rentabilidade: RentabilidadeData;
  investimentos: InvestimentosData;
  receitas: ReceitasData;
  despesas: DespesasData;
  rankings: RankingsData;
  contasAReceber: ContasAReceberData;
  contasAPagar: ContasAPagarData;
  endividamento: EndividamentoData;
  projecoes: ProjecoesIndicadoresData;
  comparativos: ComparativosData;
  demonstrativos: DemonstrativosData;
  auditoria: AuditoriaIndicadoresData;
}

// ============ END INDICADORES ============

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
