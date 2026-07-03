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

function converterGrupo(n: number, singular: string, pluralSemPreposicao: string): { texto: string; usaDe: boolean } {
  if (n === 0) return { texto: "", usaDe: false };
  if (n === 1) return { texto: singular, usaDe: true };
  const centena = converterCentena(n);
  const temCentenaDezena = n % 100 !== 0 || Math.floor(n % 1000) > 0;
  return { texto: centena + " " + pluralSemPreposicao, usaDe: !temCentenaDezena };
}

export function valorPorExtenso(valor: number): string {
  if (isNaN(valor) || valor < 0) return "";
  const reais = Math.floor(valor);
  const centavos = Math.round((valor - reais) * 100);

  if (reais === 0 && centavos === 0) return "Zero Reais";

  const partes: string[] = [];

  if (reais > 0) {
    const bilhoes = Math.floor(reais / 1000000000);
    const restoAposBilhao = reais % 1000000000;
    const milhoes = Math.floor(restoAposBilhao / 1000000);
    const restoAposMilhao = restoAposBilhao % 1000000;
    const milhares = Math.floor(restoAposMilhao / 1000);
    const unidades = restoAposMilhao % 1000;

    if (bilhoes > 0) {
      const g = converterGrupo(bilhoes, "um bilhão", "bilhões");
      partes.push(g.texto + (g.usaDe ? " de" : ""));
    }
    if (milhoes > 0) {
      const g = converterGrupo(milhoes, "um milhão", "milhões");
      partes.push(g.texto + (g.usaDe ? " de" : ""));
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
    const usaDe = /(milhão|milhões|bilhão|bilhões)$/.test(ultimo);
    partes.length = 0;
    partes.push(reaisText + (usaDe ? " de" : "") + (reais === 1 ? " Real" : " Reais"));
  }

  if (centavos > 0) {
    const cText = converterCentena(centavos);
    if (reais > 0) {
      return capitalizar(partes[0] + " e " + cText + (centavos === 1 ? " Centavo" : " Centavos"));
    }
    return capitalizar(cText + (centavos === 1 ? " Centavo" : " Centavos"));
  }

  return capitalizar(partes[0] || "Zero Reais");
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
