import type { DadosDocumento, ProdutoExtraido } from "./types";
import { criarDadosDocumentoVazio } from "./types";

function parseBRL(valor: string | null): number | null {
  if (!valor) return null;
  const digits = valor.replace(/[R$\s]/g, "").trim();
  const cleaned = digits.replace(/\./g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

function extractCNPJ(text: string): string | null {
  const match = text.match(/(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/);
  return match ? match[1] : null;
}

function extractCPF(text: string): string | null {
  const match = text.match(/(\d{3}\.\d{3}\.\d{3}-\d{2})/);
  return match ? match[1] : null;
}

function extractAllCNPJ(text: string): string[] {
  return Array.from(text.matchAll(/(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/g), (m) => m[1]);
}

function extractChaveAcesso(text: string): string | null {
  const match = text.match(/(?:chave\s*(?:de\s*)?acesso|acesso)\s*:?\s*(\d{44})/i);
  if (match) return match[1];
  const rawMatch = text.match(/\b(\d{44})\b/);
  return rawMatch ? rawMatch[1] : null;
}

function extractData(text: string): string | null {
  const patterns = [
    /(?:data\s*(?:da\s*)?emiss[aã]o|emiss[aã]o)\s*:?\s*(\d{2}\/\d{2}\/\d{4})/i,
    /(?:data\s*(?:de\s*)?sa[ií]da|sa[ií]da)\s*:?\s*(\d{2}\/\d{2}\/\d{4})/i,
    /(?:data\s*(?:de\s*)?vencimento|vencimento)\s*:?\s*(\d{2}\/\d{2}\/\d{4})/i,
    /(\d{2}\/\d{2}\/\d{4})/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function parseDateBR(dateStr: string): string | null {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;
  return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
}

function extractValorMonetario(text: string): number | null {
  const match = text.match(/(?:R\$\s*)?([\d.]+,\d{2})(?:\s|$)/);
  return match ? parseBRL(match[0]) : null;
}

function extractIE(text: string): string | null {
  const match = text.match(/(?:inscri[çc][aã]o\s*(?:estadual)?|ie)\s*[.:]?\s*([\d.\/-]+)/i);
  return match ? match[1].trim() : null;
}

interface Secao {
  inicio: number;
  fim: number;
  linhas: string[];
  tipo: "emitente" | "destinatario" | "produtos" | "totais" | "transporte" | "pagamento" | "fiscal" | "cabecalho" | "desconhecido";
}

function detectarSecoes(linhas: string[], textoCompleto: string): Secao[] {
  const secoes: Secao[] = [];
  let i = 0;

  const patterns: [RegExp, string][] = [
    [/emitente|emit|fornecedor|prestador/i, "emitente"],
    [/destinat[aá]rio|cliente|tomador|consignat[aá]rio/i, "destinatario"],
    [/produto|descri[çc][aã]o.*produto|c[óo]digo|q\.?t\.?d\.?|quantidade/i, "produtos"],
    [/total\s*(?:da\s*)?nota|valor\s*total|vnf|totais/i, "totais"],
    [/transporte|transportadora|frete|volumes|peso/i, "transporte"],
    [/pagamento|forma\s*(?:de\s*)?pagamento|fatura|duplicata/i, "pagamento"],
    [/cfop|ncm|cst|icms|pis|cofins|ipi|tributo/i, "fiscal"],
    [/n[º°]\s*\.?\s*\d+|s[eé]rie|chave\s*(?:de\s*)?acesso|modelo|data\s*(?:da\s*)?emiss[aã]o/i, "cabecalho"],
  ];

  while (i < linhas.length) {
    for (const [re, tipo] of patterns) {
      if (re.test(linhas[i])) {
        const inicio = i;
        i++;
        while (i < linhas.length) {
          const proximaSecao = patterns.some(([r]) => r.test(linhas[i]));
          if (proximaSecao && i > inicio + 1) break;
          i++;
        }
        secoes.push({
          inicio,
          fim: i,
          linhas: linhas.slice(inicio, i),
          tipo: tipo as Secao["tipo"],
        });
        break;
      }
    }
    if (secoes.length === 0 || secoes[secoes.length - 1].fim <= i) {
      i++;
    }
  }

  return secoes;
}

function parseProdutosTexto(linhas: string[]): ProdutoExtraido[] {
  const produtos: ProdutoExtraido[] = [];
  let emTabela = false;
  let cabecalhosEncontrados = false;

  const linhasLimpa = linhas.map((l) => l.trim()).filter(Boolean);

  for (let i = 0; i < linhasLimpa.length; i++) {
    const linha = linhasLimpa[i];

    if (/c[óo]digo|descri[çc][aã]o|q\.?t\.?d\.?|quantidade|un\.?|valor\s*unit/i.test(linha)) {
      cabecalhosEncontrados = true;
      emTabela = true;
      continue;
    }

    if (/total\s*(?:da\s*)?nota|subtotal|totais/i.test(linha)) {
      emTabela = false;
      continue;
    }

    if (!emTabela && !cabecalhosEncontrados) continue;

    if (!emTabela) continue;

    const temNumeroLinha = /^\d{1,3}\s/.test(linha);
    const temValorMonetario = /[\d.]+\,\d{2}/.test(linha);
    const temQtd = /\b\d+\b/.test(linha);

    if (!temNumeroLinha && !temValorMonetario && linha.length < 3) continue;
    if (/total|subtotal|icms|pis|cofins/i.test(linha)) continue;

    const codigoMatch = linha.match(/^(\d{5,})\s+/);
    const codigo = codigoMatch ? codigoMatch[1] : null;

    const valores = Array.from(linha.matchAll(/([\d.]+,\d{2})/g), (m) => m[1]);
    const qtdMatch = linha.match(/\b(\d+)\s*(?:un|pc|kg|m|lt|cx|par|pç|mt|ml)\b/i);

    let descricao = linha;
    if (codigo) descricao = descricao.replace(codigo, "").trim();
    if (qtdMatch) descricao = descricao.replace(qtdMatch[0], "").trim();
    for (const v of valores) {
      descricao = descricao.replace(v, "").trim();
    }
    descricao = descricao.replace(/R\$\s*/g, "").trim();
    descricao = descricao.replace(/^\d+\s*/, "").trim();

    if (descricao.length < 3 && !valores.length) continue;

    const unMatch = linha.match(/\b(UN|PC|KG|M|LT|CX|PAR|PÇ|MT|ML|UND?)\b/i);
    const unidade = unMatch ? unMatch[1].toUpperCase() : null;
    const quantidade = qtdMatch ? parseInt(qtdMatch[1], 10) : null;

    let valorUnitario: number | null = null;
    let valorTotal: number | null = null;

    if (valores.length >= 2) {
      valorTotal = parseBRL(valores[valores.length - 1]);
      valorUnitario = parseBRL(valores[valores.length - 2]);
    } else if (valores.length === 1) {
      valorTotal = parseBRL(valores[0]);
    }

    if (quantidade && valorTotal && !valorUnitario) {
      valorUnitario = valorTotal / quantidade;
    }

    if (descricao && descricao.length > 3) {
      produtos.push({
        codigo,
        descricao: descricao.replace(/\s+/g, " ").trim(),
        marca: null,
        modelo: null,
        quantidade,
        unidade,
        valor_unitario: valorUnitario,
        valor_total: valorTotal,
      });
    }
  }

  return produtos;
}

function analisarTributos(texto: string) {
  const tributos: DadosDocumento["tributacao"] = {
    icms: null, icms_st: null, pis: null, cofins: null,
    ipi: null, iss: null, cfop: null, ncm: null, cst: null,
  };

  const cfopMatch = texto.match(/\b(CFOP)\s*[:.]?\s*(\d{1,4})/i);
  if (cfopMatch) tributos.cfop = cfopMatch[2];

  const ncmMatch = texto.match(/\b(NCM)\s*[:.]?\s*([\d.]+)/i);
  if (ncmMatch) tributos.ncm = ncmMatch[2];

  const cstMatch = texto.match(/\b(CST)\s*[:.]?\s*(\d{3,})/i);
  if (cstMatch) tributos.cst = cstMatch[2];

  const icmsMatch = texto.match(/ICMS\s*[:.]?\s*([\d.]+,\d{2})/i);
  if (icmsMatch) tributos.icms = parseBRL(icmsMatch[1]);

  const pisMatch = texto.match(/PIS\s*[:.]?\s*([\d.]+,\d{2})/i);
  if (pisMatch) tributos.pis = parseBRL(pisMatch[1]);

  const cofinsMatch = texto.match(/COFINS\s*[:.]?\s*([\d.]+,\d{2})/i);
  if (cofinsMatch) tributos.cofins = parseBRL(cofinsMatch[1]);

  const ipiMatch = texto.match(/IPI\s*[:.]?\s*([\d.]+,\d{2})/i);
  if (ipiMatch) tributos.ipi = parseBRL(ipiMatch[1]);

  return tributos;
}

function extrairEmitente(texto: string, secoes: Secao[]): DadosDocumento["emitente"] {
  const emit: DadosDocumento["emitente"] = {
    razao_social: null, nome_fantasia: null, cnpj: null,
    inscricao_estadual: null, endereco: null, cidade: null,
    estado: null, cep: null, telefone: null,
  };

  const secaoEmitente = secoes.find((s) => s.tipo === "emitente");
  const textoEmitente = secaoEmitente
    ? secaoEmitente.linhas.join(" ")
    : texto;

  const allCNPJs = extractAllCNPJ(texto);
  const cnpjsEmitente: string[] = [];

  if (secaoEmitente) {
    const secaoText = secaoEmitente.linhas.join(" ");
    const cnpjLocal = extractCNPJ(secaoText);
    if (cnpjLocal) cnpjsEmitente.push(cnpjLocal);
  }

  const linhas = (secaoEmitente ? secaoEmitente.linhas : texto.split("\n").filter(Boolean));

  const nomeIndex = linhas.findIndex(
    (l) => !/cnpj|cpf|ie|inscrição|endereço|cep|telefone|fone|email|^\d{2}\./i.test(l)
      && l.trim().length > 5
      && !/n[º°]\s*\d|série|chave|modelo|emissão|saída/i.test(l)
  );
  if (nomeIndex >= 0) {
    emit.razao_social = linhas[nomeIndex].trim();
    if (linhas.length > nomeIndex + 1) {
      const prox = linhas[nomeIndex + 1].trim();
      if (prox.length > 3 && !/cnpj|cpf|ie|^\d/.test(prox) && prox !== emit.razao_social) {
        emit.nome_fantasia = prox;
      }
    }
  }

  if (cnpjsEmitente.length > 0) emit.cnpj = cnpjsEmitente[0];
  else if (allCNPJs.length > 0) emit.cnpj = allCNPJs[0];

  const ieMatch = textoEmitente.match(/(?:ie|inscri[çc][aã]o\s*estadual)\s*[:.]?\s*([\d.\/-]+)/i);
  if (ieMatch) emit.inscricao_estadual = ieMatch[1].trim();

  const endLinha = linhas.find((l) => /(?:rua|av|avenida|travessa|praça|logradouro|endereço)/i.test(l));
  if (endLinha) {
    emit.endereco = endLinha.trim().replace(/^(?:endereço|logradouro)\s*:?\s*/i, "");
  } else {
    const endPossivel = linhas.find((l) => /, \d+/.test(l) && !/cnpj|cpf|ie|cep|telefone/i.test(l) && l.trim().length > 10);
    if (endPossivel) emit.endereco = endPossivel.trim();
  }

  const cepMatch = textoEmitente.match(/\b(\d{5}-\d{3})\b/);
  if (cepMatch) emit.cep = cepMatch[1];

  const cidadeEstado = linhas.find((l) => /\b(?:SP|RJ|MG|RS|SC|PR|BA|PE|CE|GO|MT|MS|DF|ES|RN|PB|AL|SE|PI|MA|PA|AM|AC|RO|RR|AP|TO)\b/.test(l));
  if (cidadeEstado) {
    const parts = cidadeEstado.split("/");
    if (parts.length === 2) {
      emit.cidade = parts[0].trim();
      emit.estado = parts[1].trim();
    } else {
      const estadoMatch = cidadeEstado.match(/\b(SP|RJ|MG|RS|SC|PR|BA|PE|CE|GO|MT|MS|DF|ES|RN|PB|AL|SE|PI|MA|PA|AM|AC|RO|RR|AP|TO)\b/);
      if (estadoMatch) emit.estado = estadoMatch[1];
      const cidadeMatch = cidadeEstado.replace(estadoMatch ? estadoMatch[1] : "", "").trim();
      if (cidadeMatch.length > 3) emit.cidade = cidadeMatch.replace(/[,\s]+$/, "");
    }
  }

  const foneMatch = textoEmitente.match(/(?:telefone|fone|tel)\s*[:.]?\s*([\d\s()-]+)/i);
  if (foneMatch) emit.telefone = foneMatch[1].trim();

  return emit;
}

function extrairDestinatario(texto: string, secoes: Secao[]): DadosDocumento["destinatario"] {
  const dest: DadosDocumento["destinatario"] = {
    razao_social: null, nome_fantasia: null, cnpj_cpf: null,
    endereco: null, cidade: null, estado: null, cep: null,
  };

  const secaoDest = secoes.find((s) => s.tipo === "destinatario");
  const linhas = secaoDest
    ? secaoDest.linhas
    : texto.split("\n").filter(Boolean);
  const textoDest = secaoDest ? secaoDest.linhas.join(" ") : texto;

  const cnpj = extractCNPJ(textoDest);
  const cpf = extractCPF(textoDest);
  dest.cnpj_cpf = cnpj || cpf || null;

  const nomeIndex = linhas.findIndex(
    (l) => !/cnpj|cpf|ie|inscrição|endereço|cep|telefone|fone|email|^\d{2}\./i.test(l)
      && l.trim().length > 5
      && !/n[º°]\s*\d|série|chave|modelo|emissão|saída/i.test(l)
  );
  if (nomeIndex >= 0) {
    dest.razao_social = linhas[nomeIndex].trim();
  }

  const endLinha = linhas.find((l) => /(?:rua|av|avenida|travessa|praça|logradouro)/i.test(l));
  if (endLinha) {
    dest.endereco = endLinha.trim().replace(/^(?:endereço|logradouro)\s*:?\s*/i, "");
  } else {
    const endPossivel = linhas.find((l) => /, \d+/.test(l) && !/cnpj|cpf|ie|cep|telefone/i.test(l) && l.trim().length > 10);
    if (endPossivel) dest.endereco = endPossivel.trim();
  }

  const cepMatch = textoDest.match(/\b(\d{5}-\d{3})\b/);
  if (cepMatch) dest.cep = cepMatch[1];

  const cidadeEstado = linhas.find((l) => /\b(?:SP|RJ|MG|RS|SC|PR|BA|PE|CE|GO|MT|MS|DF|ES|RN|PB|AL|SE|PI|MA|PA|AM|AC|RO|RR|AP|TO)\b/.test(l));
  if (cidadeEstado) {
    const parts = cidadeEstado.split("/");
    if (parts.length === 2) {
      dest.cidade = parts[0].trim();
      dest.estado = parts[1].trim();
    } else {
      const estadoMatch = cidadeEstado.match(/\b(SP|RJ|MG|RS|SC|PR|BA|PE|CE|GO|MT|MS|DF|ES|RN|PB|AL|SE|PI|MA|PA|AM|AC|RO|RR|AP|TO)\b/);
      if (estadoMatch) dest.estado = estadoMatch[1];
    }
  }

  return dest;
}

function extrairFinanceiro(texto: string, secoes: Secao[]): DadosDocumento["financeiro"] {
  const fin: DadosDocumento["financeiro"] = {
    valor_total: null, valor_produtos: null, valor_frete: null,
    valor_seguro: null, desconto: null, outras_despesas: null, valor_final: null,
  };

  const secaoTotais = secoes.find((s) => s.tipo === "totais");
  const textoTotais = secaoTotais ? secaoTotais.linhas.join(" ") : texto;

  const totalMatch = textoTotais.match(/(?:valor\s*total\s*(?:da\s*nota)?|vNF|total\s*(?:da\s*)?nota)\s*[:.]?\s*(?:R\$\s*)?([\d.]+,\d{2})/i)
    || texto.match(/(?:valor\s*total\s*(?:da\s*nota)?|vNF|total\s*(?:da\s*)?nota)\s*[:.]?\s*(?:R\$\s*)?([\d.]+,\d{2})/i);
  if (totalMatch) fin.valor_total = parseBRL(totalMatch[1]);

  const prodMatch = textoTotais.match(/(?:valor\s*(?:dos\s*)?produtos|vProd|total\s*prod)\s*[:.]?\s*(?:R\$\s*)?([\d.]+,\d{2})/i)
    || texto.match(/(?:valor\s*(?:dos\s*)?produtos|vProd|total\s*prod)\s*[:.]?\s*(?:R\$\s*)?([\d.]+,\d{2})/i);
  if (prodMatch) fin.valor_produtos = parseBRL(prodMatch[1]);

  const freteMatch = textoTotais.match(/(?:valor\s*do\s*frete|frete|vFrete)\s*[:.]?\s*(?:R\$\s*)?([\d.]+,\d{2})/i)
    || texto.match(/(?:valor\s*do\s*frete|frete|vFrete)\s*[:.]?\s*(?:R\$\s*)?([\d.]+,\d{2})/i);
  if (freteMatch) fin.valor_frete = parseBRL(freteMatch[1]);

  const seguroMatch = textoTotais.match(/(?:valor\s*do\s*seguro|seguro|vSeg)\s*[:.]?\s*(?:R\$\s*)?([\d.]+,\d{2})/i)
    || texto.match(/(?:valor\s*do\s*seguro|seguro|vSeg)\s*[:.]?\s*(?:R\$\s*)?([\d.]+,\d{2})/i);
  if (seguroMatch) fin.valor_seguro = parseBRL(seguroMatch[1]);

  const descMatch = textoTotais.match(/(?:desconto|vDesc)\s*[:.]?\s*(?:R\$\s*)?([\d.]+,\d{2})/i)
    || texto.match(/(?:desconto|vDesc)\s*[:.]?\s*(?:R\$\s*)?([\d.]+,\d{2})/i);
  if (descMatch) fin.desconto = parseBRL(descMatch[1]);

  if (!fin.valor_total) {
    const valores = Array.from(texto.matchAll(/(?:R\$\s*)?([\d.]+,\d{2})/g), (m) => parseBRL(m[1])).filter((v): v is number => v !== null);
    if (valores.length > 0) {
      fin.valor_total = Math.max(...valores);
    }
  }

  fin.valor_final = fin.valor_total;

  return fin;
}

function extrairPagamento(texto: string, secoes: Secao[]): DadosDocumento["pagamento"] {
  const pag: DadosDocumento["pagamento"] = {
    forma: null, quantidade_parcelas: null, valor_parcelas: null,
  };

  const secaoPag = secoes.find((s) => s.tipo === "pagamento");
  const textoPag = secaoPag ? secaoPag.linhas.join(" ") : texto;

  const formaMatch = textoPag.match(/(?:forma\s*(?:de\s*)?pagamento|pagamento)\s*[:.]?\s*(.+?)(?:\d|R\$|$)/i)
    || texto.match(/(?:forma\s*(?:de\s*)?pagamento|pagamento)\s*[:.]?\s*(.+?)(?:\d|R\$|$)/i);
  if (formaMatch) {
    pag.forma = formaMatch[1].trim().replace(/\.$/, "");
  }

  const parcelasMatch = textoPag.match(/(\d+)\s*(?:x|parcelas?|vezes)/i)
    || texto.match(/(\d+)\s*(?:x|parcelas?|vezes)/i);
  if (parcelasMatch) pag.quantidade_parcelas = parseInt(parcelasMatch[1], 10);

  const valorParcela = textoPag.match(/(?:valor\s*(?:das?\s*)?parcela|parcela)\s*[:.]?\s*(?:R\$\s*)?([\d.]+,\d{2})/i)
    || texto.match(/(?:valor\s*(?:das?\s*)?parcela|parcela)\s*[:.]?\s*(?:R\$\s*)?([\d.]+,\d{2})/i);
  if (valorParcela) pag.valor_parcelas = parseBRL(valorParcela[1]);

  if (!pag.forma && texto.toLowerCase().includes("pix")) pag.forma = "PIX";
  if (!pag.forma && texto.toLowerCase().includes("boleto")) pag.forma = "Boleto";
  if (!pag.forma && texto.toLowerCase().includes("cartão")) pag.forma = "Cartão";
  if (!pag.forma && texto.toLowerCase().includes("duplicata")) pag.forma = "Duplicata";

  return pag;
}

function extrairTransporte(texto: string, secoes: Secao[]): DadosDocumento["transporte"] {
  const transp: DadosDocumento["transporte"] = {
    transportadora: null, cnpj: null, frete: null, volume: null, peso: null,
  };

  const secaoTransp = secoes.find((s) => s.tipo === "transporte");
  const textoTransp = secaoTransp ? secaoTransp.linhas.join(" ") : texto;

  const nomeMatch = textoTransp.match(/(?:transportadora)\s*[:.]?\s*(.+?)(?:\d{2}\.|R\$|$)/i);
  if (nomeMatch) transp.transportadora = nomeMatch[1].trim();

  const cnpj = extractCNPJ(textoTransp);
  if (cnpj) transp.cnpj = cnpj;

  const freteMatch = textoTransp.match(/(?:frete|valor\s*do\s*frete)\s*[:.]?\s*(?:R\$\s*)?([\d.]+,\d{2})/i);
  if (freteMatch) transp.frete = parseBRL(freteMatch[1]);

  const volumeMatch = textoTransp.match(/(?:volume|vol)\s*[:.]?\s*([\d]+)/i);
  if (volumeMatch) transp.volume = volumeMatch[1];

  const pesoMatch = textoTransp.match(/(?:peso|peso\s*(?:bruto|líquido))\s*[:.]?\s*([\d.]+,\d{3})/i);
  if (pesoMatch) transp.peso = pesoMatch[1];

  return transp;
}

function extrairDocumento(texto: string): DadosDocumento["documento"] {
  const doc: DadosDocumento["documento"] = {
    tipo: null, numero_nota: null, serie: null, chave_acesso: null,
    data_emissao: null, data_saida: null, protocolo_autorizacao: null, situacao: null,
  };

  doc.chave_acesso = extractChaveAcesso(texto);

  const nfMatch = texto.match(/(?:n[º°]\s*\.?\s*|numero\s*(?:da\s*)?nota\s*[:.]?\s*)(\d{1,9})\b/i);
  if (nfMatch) doc.numero_nota = nfMatch[1];

  const serieMatch = texto.match(/(?:s[eé]rie)\s*[:.]?\s*(\d{1,3})/i);
  if (serieMatch) doc.serie = serieMatch[1];

  const dataEmissaoMatch = texto.match(/(?:data\s*(?:da\s*)?emiss[aã]o|emiss[aã]o)\s*[:.]?\s*(\d{2}\/\d{2}\/\d{4})/i);
  if (dataEmissaoMatch) doc.data_emissao = parseDateBR(dataEmissaoMatch[1]);

  if (!doc.data_emissao) {
    const dataMatch = texto.match(/(\d{2}\/\d{2}\/\d{4})/);
    if (dataMatch) doc.data_emissao = parseDateBR(dataMatch[1]);
  }

  const dataSaidaMatch = texto.match(/(?:data\s*(?:de\s*)?sa[ií]da|sa[ií]da)\s*[:.]?\s*(\d{2}\/\d{2}\/\d{4})/i);
  if (dataSaidaMatch) doc.data_saida = parseDateBR(dataSaidaMatch[1]);

  const protMatch = texto.match(/(?:protocolo\s*(?:de\s*)?autoriza[çc][aã]o|protocolo)\s*[:.]?\s*(\d{15})/i);
  if (protMatch) doc.protocolo_autorizacao = protMatch[1];

  if (texto.toLowerCase().includes("autorizado")) doc.situacao = "Autorizado";
  else if (texto.toLowerCase().includes("cancelado")) doc.situacao = "Cancelado";
  else if (texto.toLowerCase().includes("denegado")) doc.situacao = "Denegado";
  else if (doc.chave_acesso || doc.numero_nota) doc.situacao = "Autorizado";

  if (doc.chave_acesso || doc.numero_nota) {
    doc.tipo = "NOTA_FISCAL";
  }

  return doc;
}

function gerarInterpretacaoFinanceira(
  dados: DadosDocumento,
  texto: string
): DadosDocumento["interpretacao_financeira"] {
  const interp: DadosDocumento["interpretacao_financeira"] = {
    tipo_movimentacao: null,
    categoria_sugerida: null,
    descricao_sugerida: null,
    resumo_executivo: null,
  };

  if (dados.documento.tipo === "NOTA_FISCAL" || dados.documento.numero_nota) {
    interp.tipo_movimentacao = "DESPESA";
  } else if (texto.toLowerCase().includes("receb")) {
    interp.tipo_movimentacao = "RECEITA";
  } else {
    interp.tipo_movimentacao = "DESPESA";
  }

  if (dados.produtos.length > 0) {
    const descs = dados.produtos.slice(0, 3).map((p) => p.descricao).filter(Boolean);
    if (descs.length > 0) {
      interp.descricao_sugerida = descs.join(", ");
      if (dados.produtos.length > 3) {
        interp.descricao_sugerida += ` e mais ${dados.produtos.length - 3} item(ns)`;
      }
    }
  }

  if (!interp.descricao_sugerida) {
    if (dados.emitente.razao_social) {
      interp.descricao_sugerida = `Documento de ${dados.emitente.razao_social}`;
    } else {
      interp.descricao_sugerida = "Documento fiscal processado";
    }
  }

  const descricoes = dados.produtos.map((p) => p.descricao?.toLowerCase() || "").join(" ");
  if (/computador|notebook|servidor|monitor|mouse|teclado|impressora|hd|ssd|memória|processador|placa/i.test(descricoes)) {
    interp.categoria_sugerida = "Equipamentos / Tecnologia";
  } else if (/alimento|bebida|comida|mercearia|hortifruti/i.test(descricoes)) {
    interp.categoria_sugerida = "Mercadoria / Revenda";
  } else if (/material\s*(?:de\s*)?construção|cimento|tijolo|areia|pedra|telha/i.test(descricoes)) {
    interp.categoria_sugerida = "Mercadoria / Revenda";
  } else if (/peça|acessório|automotivo|pneu|bateria|óleo/i.test(descricoes)) {
    interp.categoria_sugerida = "Mercadoria / Revenda";
  } else if (/serviço|consultoria|assessoria|manutenção/i.test(descricoes)) {
    interp.categoria_sugerida = "Serviços";
  } else if (/marketing|publicidade|anúncio|propaganda/i.test(descricoes)) {
    interp.categoria_sugerida = "Marketing";
  } else if (/imposto|taxa|contribuição|guia|darf/i.test(descricoes)) {
    interp.categoria_sugerida = "Impostos";
  } else if (dados.produtos.length > 0) {
    interp.categoria_sugerida = "Mercadoria / Revenda";
  } else if (dados.emitente.razao_social) {
    interp.categoria_sugerida = "Fornecedores";
  }

  const partes: string[] = [];
  const valor = dados.financeiro.valor_total;
  const emitente = dados.emitente.razao_social;
  const dest = dados.destinatario.razao_social;
  const produtos = dados.produtos;

  if (produtos.length > 0 && valor && emitente) {
    const totalItens = produtos.reduce((s, p) => s + (p.quantidade || 0), 0);
    const nomes = produtos.slice(0, 3).map((p) => p.descricao).filter(Boolean).join(", ");
    const valorStr = valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const extra = produtos.length > 3 ? ` e mais ${produtos.length - 3} produto(s)` : "";
    partes.push(`Foi identificada uma compra de ${totalItens} ${nomes}${extra} no valor de ${valorStr} realizada junto à ${emitente}.`);
  } else if (valor) {
    const valorStr = valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const nome = emitente || dest || "fornecedor";
    partes.push(`Foi identificado um pagamento de ${valorStr} relacionado à ${nome}.`);
  } else if (emitente) {
    partes.push(`Documento fiscal emitido por ${emitente}.`);
  }

  if (dados.documento.numero_nota) {
    partes.push(`Nota Fiscal nº ${dados.documento.numero_nota}.`);
  }

  interp.resumo_executivo = partes.join(" ");

  return interp;
}

export function parseDanfe(texto: string, nomeArquivo: string): DadosDocumento {
  const dados = criarDadosDocumentoVazio();
  dados.dados_brutos = texto.substring(0, 5000);

  if (!texto || texto.trim().length < 20) {
    dados.confianca = 0.1;
    dados.interpretacao_financeira = {
      tipo_movimentacao: null,
      categoria_sugerida: null,
      descricao_sugerida: `Documento: ${nomeArquivo}`,
      resumo_executivo: "Não foi possível extrair dados suficientes. O documento pode estar ilegível ou corrompido.",
    };
    return dados;
  }

  const linhas = texto.split("\n").map((l) => l.trim()).filter(Boolean);
  const textoCompleto = linhas.join(" ");

  const secoes = detectarSecoes(linhas, textoCompleto);

  dados.documento = extrairDocumento(textoCompleto);

  dados.emitente = extrairEmitente(textoCompleto, secoes);
  dados.destinatario = extrairDestinatario(textoCompleto, secoes);

  const secaoProdutos = secoes.find((s) => s.tipo === "produtos");
  if (secaoProdutos) {
    dados.produtos = parseProdutosTexto(secaoProdutos.linhas);
  }
  if (dados.produtos.length === 0) {
    dados.produtos = parseProdutosTexto(linhas);
  }

  dados.financeiro = extrairFinanceiro(textoCompleto, secoes);

  if (dados.financeiro.valor_total && dados.produtos.length > 0 && !dados.financeiro.valor_produtos) {
    dados.financeiro.valor_produtos = dados.financeiro.valor_total;
  }

  dados.pagamento = extrairPagamento(textoCompleto, secoes);
  dados.transporte = extrairTransporte(textoCompleto, secoes);
  dados.tributacao = analisarTributos(textoCompleto);

  if (secoes.length > 0) {
    const secaoNaoMapeada = linhas.filter((l) => !secoes.some((s) => s.linhas.includes(l)));
    if (secaoNaoMapeada.length > 0) {
      dados.informacoes_complementares.informacoes_adicionais = secaoNaoMapeada.slice(0, 5).join("; ");
    }
  }

  dados.interpretacao_financeira = gerarInterpretacaoFinanceira(dados, textoCompleto);

  const camposPreenchidos = contarCamposPreenchidos(dados);
  const totalCampos = 65;
  let confianca = Math.min(camposPreenchidos / totalCampos, 1);

  if (dados.documento.chave_acesso) confianca = Math.max(confianca, 0.7);
  if (dados.documento.numero_nota && dados.emitente.razao_social) confianca = Math.max(confianca, 0.6);
  if (dados.financeiro.valor_total) confianca = Math.max(confianca, 0.5);
  if (dados.produtos.length > 0) confianca = Math.min(confianca + dados.produtos.length * 0.05, 0.95);

  if (texto.length < 50) confianca = Math.min(confianca, 0.2);
  if (texto.length > 500) confianca = Math.min(confianca + 0.1, 0.98);

  dados.confianca = Math.round(confianca * 100) / 100;

  return dados;
}

function contarCamposPreenchidos(dados: DadosDocumento): number {
  let count = 0;
  for (const section of Object.values(dados)) {
    if (typeof section === "object" && section !== null) {
      for (const value of Object.values(section as Record<string, unknown>)) {
        if (value !== null && value !== "" && !(Array.isArray(value) && value.length === 0)) {
          if (Array.isArray(value)) {
            if (value.length > 0) count += value.length;
          } else {
            count++;
          }
        }
      }
    }
  }
  return count;
}
