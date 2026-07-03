import type { DadosDocumento, ParserResult } from "./types";
import { parseDanfe } from "./danfe-parser";

export type { DadosDocumento, ProdutoExtraido, ParserResult } from "./types";
export { criarDadosDocumentoVazio } from "./types";

export function parseDocumento(texto: string, nomeArquivo: string, tipoArquivo?: string): ParserResult {
  const inicio = performance.now();

  const nomeLC = nomeArquivo.toLowerCase();
  const isNFE = tipoArquivo === "XML"
    || nomeLC.includes("nfe")
    || nomeLC.includes("nota")
    || nomeLC.includes("danfe")
    || nomeLC.includes("xml")
    || /n[º°]\s*\d/.test(texto)
    || /chave\s*(?:de\s*)?acesso/i.test(texto)
    || /\b\d{44}\b/.test(texto);

  let dados: DadosDocumento;

  if (isNFE) {
    dados = parseDanfe(texto, nomeArquivo);
  } else {
    dados = parseDanfe(texto, nomeArquivo);
  }

  if (!dados.documento.tipo) {
    if (texto.toLowerCase().includes("pix")) dados.documento.tipo = "COMPROVANTE_PIX";
    else if (texto.toLowerCase().includes("boleto")) dados.documento.tipo = "BOLETO";
    else if (texto.toLowerCase().includes("ted") || texto.toLowerCase().includes("doc")) dados.documento.tipo = "COMPROVANTE_TED";
    else if (texto.toLowerCase().includes("recibo")) dados.documento.tipo = "RECIBO";
    else if (texto.toLowerCase().includes("extrato")) dados.documento.tipo = "EXTRATO_BANCARIO";
    else if (texto.toLowerCase().includes("pagamento")) dados.documento.tipo = "COMPROVANTE_PAGAMENTO";
    else dados.documento.tipo = "OUTRO";
  }

  const fim = performance.now();

  return {
    dados,
    provedor: "parser-local",
    tempo_processamento_ms: Math.round(fim - inicio),
  };
}
