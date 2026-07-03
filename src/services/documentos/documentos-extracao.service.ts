"use client";

import type { TipoDocumentoDetectado, TipoMovimentacao } from "@/types";
import type { DadosDocumento } from "./parser";
import { parseDocumento } from "./parser";

export interface ExtracaoResult {
  tipo_documento: TipoDocumentoDetectado;
  valor: number | null;
  data: string | null;
  favorecido: string | null;
  emitente: string | null;
  descricao: string | null;
  tipo_movimentacao: TipoMovimentacao | null;
  informacoes_complementares: Record<string, unknown> | null;
  produtos?: { descricao: string; quantidade: number; valor_unitario: number; valor_total: number }[];
  numero_nota?: string | null;
  serie?: string | null;
  chave_acesso?: string | null;
  emitente_cnpj?: string | null;
  destinatario_cnpj?: string | null;
  forma_pagamento?: string | null;
  valor_produtos?: number | null;
  confianca: number;
  observacoes: string | null;
  dados_estruturados?: DadosDocumento | null;
}

async function extractPDFText(buffer: ArrayBuffer): Promise<string> {
  try {
    const pdfjsLib = await import("pdfjs-dist");
    const loadingTask = pdfjsLib.getDocument({ data: buffer.slice(0) });
    const pdf = await loadingTask.promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      for (const item of content.items) {
        if ("str" in item) text += (item as { str: string }).str + " ";
      }
      text += "\n";
    }
    return text;
  } catch {
    return "";
  }
}

async function extractImageText(buffer: ArrayBuffer): Promise<string> {
  try {
    const Tesseract = await import("tesseract.js");
    const blob = new Blob([buffer]);
    const result = await Tesseract.recognize(blob, "por");
    return result.data.text;
  } catch {
    return "";
  }
}

function extractDataFromText(text: string, nomeArquivo: string): ExtracaoResult {
  const parsed = parseDocumento(text, nomeArquivo);
  const dados = parsed.dados;

  const produtos = dados.produtos.map((p) => ({
    descricao: p.descricao || "",
    quantidade: p.quantidade || 1,
    valor_unitario: p.valor_unitario || 0,
    valor_total: p.valor_total || 0,
  }));

  const valor = dados.financeiro.valor_total;
  const data = dados.documento.data_emissao;
  const emitente = dados.emitente.razao_social;
  const favorecido = dados.destinatario.razao_social;
  const numero_nota = dados.documento.numero_nota;
  const serie = dados.documento.serie;
  const chave_acesso = dados.documento.chave_acesso;
  const emitente_cnpj = dados.emitente.cnpj;
  const destinatario_cnpj = dados.destinatario.cnpj_cpf;
  const forma_pagamento = dados.pagamento.forma;
  const valor_produtos = dados.financeiro.valor_produtos;
  const descricao = dados.interpretacao_financeira.descricao_sugerida || `Documento: ${nomeArquivo}`;

  const mov = dados.interpretacao_financeira.tipo_movimentacao;
  let tipo_movimentacao: ExtracaoResult["tipo_movimentacao"] = "DESPESA";
  if (mov === "RECEITA") tipo_movimentacao = "RECEITA";

  let tipo_documento: TipoDocumentoDetectado = "OUTRO";
  if (dados.documento.tipo === "NOTA_FISCAL" || chave_acesso || numero_nota) {
    tipo_documento = "NOTA_FISCAL";
  } else if (text.toLowerCase().includes("pix")) {
    tipo_documento = "COMPROVANTE_PIX";
  } else if (text.toLowerCase().includes("boleto")) {
    tipo_documento = "BOLETO";
  } else if (text.toLowerCase().includes("ted") || text.toLowerCase().includes("doc")) {
    tipo_documento = "COMPROVANTE_TED";
  } else if (text.toLowerCase().includes("recibo") || text.toLowerCase().includes("receb")) {
    tipo_documento = "RECIBO";
  } else if (text.toLowerCase().includes("extrato")) {
    tipo_documento = "EXTRATO_BANCARIO";
  } else if (text.toLowerCase().includes("pagamento")) {
    tipo_documento = "COMPROVANTE_PAGAMENTO";
  }

  const complementares: Record<string, unknown> = {};
  if (emitente_cnpj) complementares.emitente_cnpj = emitente_cnpj;
  if (destinatario_cnpj) complementares.destinatario_cnpj = destinatario_cnpj;
  if (numero_nota) complementares.numero_nota = numero_nota;
  if (serie) complementares.serie = serie;
  if (chave_acesso) complementares.chave_acesso = chave_acesso;
  if (forma_pagamento) complementares.forma_pagamento = forma_pagamento;
  if (valor_produtos) complementares.valor_produtos = valor_produtos;
  if (produtos.length > 0) complementares.produtos = produtos;
  if (dados.tributacao.cfop) complementares.cfop = dados.tributacao.cfop;
  if (dados.tributacao.ncm) complementares.ncm = dados.tributacao.ncm;
  if (dados.transporte.transportadora) complementares.transportadora = dados.transporte.transportadora;

  const confidence = dados.confianca || (text.length > 50 ? 0.7 : 0.3);

  return {
    tipo_documento,
    valor,
    data,
    favorecido,
    emitente,
    descricao,
    tipo_movimentacao,
    informacoes_complementares: complementares,
    produtos,
    numero_nota,
    serie,
    chave_acesso,
    emitente_cnpj,
    destinatario_cnpj,
    forma_pagamento,
    valor_produtos,
    confianca: confidence,
    observacoes: text.length > 20
      ? `Documento processado com interpretação inteligente. Confiança: ${Math.round(confidence * 100)}%.`
      : "Não foi possível extrair dados suficientes do documento. Verifique se o arquivo está legível.",
    dados_estruturados: dados,
  };
}

export const DocumentoExtracaoService = {
  async extrairDeXML(
    buffer: ArrayBuffer,
    nomeArquivo: string
  ): Promise<ExtracaoResult> {
    const decoder = new TextDecoder("utf-8");
    const xmlStr = decoder.decode(buffer);

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlStr, "text/xml");

    const parseTag = (tag: string): string | null => {
      const el = xmlDoc.querySelector(tag);
      return el?.textContent?.trim() || null;
    };

    const nNF = parseTag("nNF");
    const serie = parseTag("serie");
    const chave = parseTag("chave") || parseTag("Id")?.replace("NFe", "") || null;
    const dhEmi = parseTag("dhEmi") || parseTag("dhEmi");
    const vNF = parseTag("vNF");
    const vProd = parseTag("vProd");
    const emitNome = parseTag("emit xNome");
    const emitCNPJ = parseTag("emit CNPJ");
    const destNome = parseTag("dest xNome");
    const destCNPJ = parseTag("dest CNPJ");
    const fatura = parseTag("dup vEnc");

    const valor = vNF ? parseFloat(vNF) : null;
    const valorProd = vProd ? parseFloat(vProd) : null;

    let data: string | null = null;
    if (dhEmi) {
      const d = new Date(dhEmi);
      if (!isNaN(d.getTime())) {
        data = d.toISOString().split("T")[0];
      }
    }

    const produtos: { descricao: string; quantidade: number; valor_unitario: number; valor_total: number }[] = [];
    xmlDoc.querySelectorAll("det").forEach((det) => {
      const prodEl = det.querySelector("prod xProd");
      const qtdEl = det.querySelector("prod qCom");
      const vUnEl = det.querySelector("prod vUnCom");
      const vTotEl = det.querySelector("prod vProd");
      if (prodEl?.textContent) {
        produtos.push({
          descricao: prodEl.textContent.trim(),
          quantidade: qtdEl?.textContent ? parseFloat(qtdEl.textContent) : 1,
          valor_unitario: vUnEl?.textContent ? parseFloat(vUnEl.textContent) : 0,
          valor_total: vTotEl?.textContent ? parseFloat(vTotEl.textContent) : 0,
        });
      }
    });

    const dadosEstruturados = await (async () => {
      const { criarDadosDocumentoVazio } = await import("./parser/types");
      const d = criarDadosDocumentoVazio();
      d.documento.tipo = "XML_NFE";
      d.documento.numero_nota = nNF;
      d.documento.serie = serie;
      d.documento.chave_acesso = chave;
      d.documento.data_emissao = data;
      d.emitente.razao_social = emitNome;
      d.emitente.cnpj = emitCNPJ;
      d.destinatario.razao_social = destNome;
      d.destinatario.cnpj_cpf = destCNPJ;
      d.financeiro.valor_total = valor;
      d.financeiro.valor_produtos = valorProd;
      d.produtos = produtos.map((p) => ({
        codigo: null, descricao: p.descricao, marca: null, modelo: null,
        quantidade: p.quantidade, unidade: null,
        valor_unitario: p.valor_unitario, valor_total: p.valor_total,
      }));
      d.confianca = 1.0;
      if (fatura) d.pagamento.forma = "Fatura";
      if (data) {
        d.interpretacao_financeira.tipo_movimentacao = "DESPESA";
        d.interpretacao_financeira.resumo_executivo = `Nota Fiscal ${nNF || ""} de ${emitNome || "fornecedor"} no valor de ${valor?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) || "—"}.`;
      }
      return d;
    })();

    const complementares: Record<string, unknown> = {};
    if (emitCNPJ) complementares.emitente_cnpj = emitCNPJ;
    if (destCNPJ) complementares.destinatario_cnpj = destCNPJ;
    if (nNF) complementares.numero_nota = nNF;
    if (serie) complementares.serie = serie;
    if (chave) complementares.chave_acesso = chave;
    if (valorProd) complementares.valor_produtos = valorProd;
    if (fatura) complementares.forma_pagamento = "Fatura";
    if (produtos.length > 0) complementares.produtos = produtos;

    return {
      tipo_documento: "XML_NFE",
      valor,
      data,
      favorecido: destNome || null,
      emitente: emitNome || null,
      descricao: produtos.length > 0
        ? `Nota Fiscal ${nNF || ""} - ${produtos.slice(0, 3).map((p) => p.descricao).join(", ")}${produtos.length > 3 ? ` e mais ${produtos.length - 3} item(ns)` : ""}`
        : `Nota Fiscal Eletrônica ${nNF || ""}`,
      tipo_movimentacao: "DESPESA",
      informacoes_complementares: complementares,
      produtos,
      numero_nota: nNF,
      serie,
      chave_acesso: chave,
      emitente_cnpj: emitCNPJ,
      destinatario_cnpj: destCNPJ,
      forma_pagamento: fatura ? "Fatura" : null,
      valor_produtos: valorProd,
      confianca: 1.0,
      observacoes: "Documento fiscal eletrônico com dados extraídos diretamente do XML.",
      dados_estruturados: dadosEstruturados,
    };
  },

  async extrairDeImagemOuPDF(
    buffer: ArrayBuffer,
    tipo: string,
    _nomeArquivo: string
  ): Promise<ExtracaoResult> {
    let text = "";
    if (tipo === "PDF") {
      text = await extractPDFText(buffer);
    } else if (["JPG", "JPEG", "PNG"].includes(tipo)) {
      text = await extractImageText(buffer);
    }

    if (text.trim().length > 20) {
      return extractDataFromText(text, _nomeArquivo);
    }

    return this.fallbackSemIA(_nomeArquivo);
  },

  async extrairComOpenAI(
    buffer: ArrayBuffer,
    _tipo: string,
    apiKey: string
  ): Promise<ExtracaoResult> {
    const fileBase64 = arrayBufferToBase64(buffer);
    const mimeType = _tipo === "PDF" ? "application/pdf" : `image/${_tipo.toLowerCase()}`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extraia os dados financeiros deste documento. Retorne APENAS um JSON válido no formato: { \"tipo_documento\": \"NOTA_FISCAL\" | \"COMPROVANTE_PIX\" | \"BOLETO\" | \"RECIBO\" | \"OUTRO\", \"valor\": number | null, \"data\": \"YYYY-MM-DD\" | null, \"favorecido\": string | null, \"emitente\": string | null, \"descricao\": string | null, \"tipo_movimentacao\": \"RECEITA\" | \"DESPESA\" | null, \"numero_nota\": string | null, \"serie\": string | null, \"chave_acesso\": string | null, \"emitente_cnpj\": string | null, \"destinatario_cnpj\": string | null, \"forma_pagamento\": string | null, \"valor_produtos\": number | null, \"produtos\": [{ \"descricao\": string, \"quantidade\": number, \"valor_unitario\": number, \"valor_total\": number }] }",
                },
                {
                  type: "image_url",
                  image_url: { url: `data:${mimeType};base64,${fileBase64}` },
                },
              ],
            },
          ],
          max_tokens: 2000,
        }),
      });

      if (!response.ok) return this.fallbackSemIA("openai");

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const dadosEstruturados = parsed.dados_estruturados || null;
        return {
          tipo_documento: parsed.tipo_documento || "OUTRO",
          valor: parsed.valor ?? null,
          data: parsed.data || null,
          favorecido: parsed.favorecido || null,
          emitente: parsed.emitente || null,
          descricao: parsed.descricao || null,
          tipo_movimentacao: parsed.tipo_movimentacao || null,
          informacoes_complementares: parsed,
          produtos: parsed.produtos || [],
          numero_nota: parsed.numero_nota || null,
          serie: parsed.serie || null,
          chave_acesso: parsed.chave_acesso || null,
          emitente_cnpj: parsed.emitente_cnpj || null,
          destinatario_cnpj: parsed.destinatario_cnpj || null,
          forma_pagamento: parsed.forma_pagamento || null,
          valor_produtos: parsed.valor_produtos ?? null,
          confianca: 0.9,
          observacoes: "Documento processado via OpenAI Vision.",
          dados_estruturados: dadosEstruturados,
        };
      }
    } catch {
      return this.fallbackSemIA("openai");
    }

    return this.fallbackSemIA("openai");
  },

  async extrairComGemini(
    buffer: ArrayBuffer,
    tipo: string,
    apiKey: string
  ): Promise<ExtracaoResult> {
    const fileBase64 = arrayBufferToBase64(buffer);
    const mimeType = tipo === "PDF" ? "application/pdf" : `image/${tipo.toLowerCase()}`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: "Extraia os dados financeiros deste documento. Retorne APENAS um JSON válido no formato: { \"tipo_documento\": string, \"valor\": number | null, \"data\": \"YYYY-MM-DD\" | null, \"favorecido\": string | null, \"emitente\": string | null, \"descricao\": string | null, \"tipo_movimentacao\": \"RECEITA\" | \"DESPESA\" | null, \"numero_nota\": string | null, \"chave_acesso\": string | null, \"emitente_cnpj\": string | null, \"produtos\": [{ \"descricao\": string, \"quantidade\": number, \"valor_unitario\": number, \"valor_total\": number }] }" },
                  { inline_data: { mime_type: mimeType, data: fileBase64 } },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) return this.fallbackSemIA("gemini");

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const dadosEstruturados = parsed.dados_estruturados || null;
        return {
          tipo_documento: parsed.tipo_documento || "OUTRO",
          valor: parsed.valor ?? null,
          data: parsed.data || null,
          favorecido: parsed.favorecido || null,
          emitente: parsed.emitente || null,
          descricao: parsed.descricao || null,
          tipo_movimentacao: parsed.tipo_movimentacao || null,
          informacoes_complementares: parsed,
          produtos: parsed.produtos || [],
          numero_nota: parsed.numero_nota || null,
          serie: parsed.serie || null,
          chave_acesso: parsed.chave_acesso || null,
          emitente_cnpj: parsed.emitente_cnpj || null,
          destinatario_cnpj: parsed.destinatario_cnpj || null,
          forma_pagamento: parsed.forma_pagamento || null,
          valor_produtos: parsed.valor_produtos ?? null,
          confianca: 0.85,
          observacoes: "Documento processado via Google Gemini.",
          dados_estruturados: dadosEstruturados,
        };
      }
    } catch {
      return this.fallbackSemIA("gemini");
    }

    return this.fallbackSemIA("gemini");
  },

  fallbackSemIA(nomeArquivo: string): ExtracaoResult {
    const nomeLC = nomeArquivo.toLowerCase();

    if (nomeLC.includes("xml") || nomeLC.includes("nfe") || nomeLC.includes("nota")) {
      return {
        tipo_documento: "NOTA_FISCAL",
        valor: null,
        data: null,
        favorecido: null,
        emitente: null,
        descricao: `Documento: ${nomeArquivo}`,
        tipo_movimentacao: "DESPESA",
        informacoes_complementares: { observacao: "Não foi possível extrair dados. Verifique o arquivo." },
        confianca: 0,
        observacoes: "Não foi possível extrair dados automaticamente. O arquivo pode estar corrompido ou ilegível.",
      };
    }

    return {
      tipo_documento: "OUTRO",
      valor: null,
      data: null,
      favorecido: null,
      emitente: null,
      descricao: `Documento: ${nomeArquivo}`,
      tipo_movimentacao: null,
      informacoes_complementares: { observacao: "Extração automática não disponível sem OCR." },
      confianca: 0,
      observacoes: "Não foi possível extrair dados. Verifique se o arquivo está legível ou tente outro formato.",
    };
  },
};

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
