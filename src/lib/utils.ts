import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? parseLocalDate(date) : date;
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR").format(d);
}

export function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function getNextDisplayId(
  table: { displayId?: string }[],
  prefix: string = ""
): Promise<string> {
  const ids = table
    .map((t) => {
      const match = t.displayId?.match(/#(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n) && n > 0);
  const max = ids.length > 0 ? Math.max(...ids) : 0;
  const num = String(max + 1).padStart(3, "0");
  return `${prefix}${num}`;
}

const UNIDADES = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
const DEZENAS = ["", "dez", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const CENTENAS = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];
const ESPECIAIS: Record<number, string> = {
  11: "onze", 12: "doze", 13: "treze", 14: "quatorze", 15: "quinze",
  16: "dezesseis", 17: "dezessete", 18: "dezoito", 19: "dezenove",
};

function converterCentena(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cem";
  const c = Math.floor(n / 100);
  const d = Math.floor((n % 100) / 10);
  const u = n % 10;
  let result = CENTENAS[c];
  const resto = n % 100;
  if (resto === 0) return result;
  if (c > 0) result += " e ";
  if (ESPECIAIS[resto]) {
    result += ESPECIAIS[resto];
  } else {
    if (d > 0) {
      result += DEZENAS[d];
      if (u > 0) result += " e ";
    }
    if (u > 0) result += UNIDADES[u];
  }
  return result;
}

function converterGrupo(n: number, singular: string, plural: string): string {
  if (n === 0) return "";
  if (n === 1) return singular;
  const centena = converterCentena(n);
  return centena + " " + plural;
}

export function valorPorExtenso(valor: number): string {
  if (isNaN(valor) || valor < 0) return "";
  const reais = Math.floor(valor);
  const centavos = Math.round((valor - reais) * 100);

  if (reais === 0 && centavos === 0) return "zero reais";

  const partes: string[] = [];

  if (reais > 0) {
    const bilhoes = Math.floor(reais / 1000000000);
    const milhoes = Math.floor((reais % 1000000000) / 1000000);
    const milhares = Math.floor((reais % 1000000) / 1000);
    const unidades = reais % 1000;

    if (bilhoes > 0) {
      partes.push(converterGrupo(bilhoes, "um bilhão", "bilhões"));
    }
    if (milhoes > 0) {
      partes.push(converterGrupo(milhoes, "um milhão", "milhões"));
    }
    if (milhares > 0) {
      if (milhares === 1) {
        partes.push("mil");
      } else {
        partes.push(converterCentena(milhares) + " mil");
      }
    }
    if (unidades > 0) {
      partes.push(converterCentena(unidades));
    }

    const reaisText = partes.join(", ");
    const ultimo = partes[partes.length - 1] || "";
    const usaDe = partes.length === 1 && /(milhão|milhões|bilhão|bilhões)$/.test(ultimo);
    partes.length = 0;
    partes.push(reaisText + (usaDe ? " de" : "") + (reais === 1 ? " real" : " reais"));
  }

  if (centavos > 0) {
    const cText = converterCentena(centavos);
    if (reais > 0) {
      return partes[0] + " e " + cText + (centavos === 1 ? " centavo" : " centavos");
    }
    return cText + (centavos === 1 ? " centavo" : " centavos");
  }

  return partes[0] || "zero reais";
}

export function formatCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const padded = digits.padStart(3, "0");
  const reais = padded.slice(0, -2);
  const centavos = padded.slice(-2);
  const formattedReais = new Intl.NumberFormat("pt-BR").format(parseInt(reais || "0", 10));
  return `${formattedReais},${centavos}`;
}

function compactPrecision(v: number): number {
  const trunc1 = Math.trunc(v * 10) / 10;
  const round1 = Math.round(v * 10) / 10;
  if (trunc1 !== round1) return 2;
  if (Math.abs(v - Math.round(v)) < 1e-10) return 0;
  return 1;
}

export function formatCompactCurrency(value: number): { display: string; full: string } {
  const full = formatCurrency(value);
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_000_000_000) {
    const v = abs / 1_000_000_000;
    const d = compactPrecision(v);
    return {
      display: `${sign}R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d })} Bi`,
      full,
    };
  }

  if (abs >= 1_000_000) {
    const v = abs / 1_000_000;
    const d = compactPrecision(v);
    return {
      display: `${sign}R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d })} Mi`,
      full,
    };
  }

  return { display: full, full };
}

export function parseCurrencyInput(formatted: string): number {
  const cleaned = formatted.replace(/\./g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

export function parseLocalDate(dateStr: string): Date {
  const dateOnly = dateStr.split("T")[0];
  const [y, m, d] = dateOnly.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function yearsFromNow(years: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + years);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function validateTransactionDate(dateStr: string): { valid: boolean; message: string } {
  if (!dateStr) return { valid: false, message: "Campo obrigatório" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return { valid: false, message: "Data inválida" };
  if (dateStr > todayStr()) {
    return { valid: false, message: "A Página Financeiro aceita apenas lançamentos realizados. Para lançamentos futuros utilize a funcionalidade Previsão de Caixa." };
  }
  if (dateStr < "1900-01-01") {
    return { valid: false, message: "A data informada está fora do período permitido para registros financeiros." };
  }
  return { valid: true, message: "" };
}

export function validateForecastDate(dateStr: string): { valid: boolean; message: string } {
  if (!dateStr) return { valid: false, message: "Campo obrigatório" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return { valid: false, message: "Data inválida" };
  const hoje = todayStr();
  if (dateStr <= hoje) {
    return { valid: false, message: "Esta funcionalidade é destinada apenas a lançamentos futuros. Para movimentações já realizadas utilize a Página Financeiro." };
  }
  const limit = yearsFromNow(10);
  if (dateStr > limit) {
    return { valid: false, message: "A data informada excede o limite máximo permitido para previsões financeiras." };
  }
  return { valid: true, message: "" };
}
