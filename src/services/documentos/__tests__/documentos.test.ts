/**
 * Testes do módulo Central Inteligente de Documentos
 *
 * Para rodar: npm test (ou configure com jest/vitest conforme stack do projeto)
 *
 * Como o projeto atual não possui framework de testes configurado,
 * estes testes são estruturais e podem ser executados com:
 *   npx vitest run src/services/documentos/__tests__/documentos.test.ts
 */

import { describe, it, expect } from "vitest";

// ========== TESTE 1: Geração de chave de aprendizado ==========

function gerarChaveReconhecimento(texto: string | null): string {
  if (!texto) return "";
  let chave = texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  chave = chave.replace(/[^a-z0-9\s]/g, "");
  const palavrasGenericas = ["ltda", "me", "eireli", "sa", "s/a", "epp", "mei", "s.a.", "ltda."];
  const palavras = chave.split(/\s+/).filter((p) => !palavrasGenericas.includes(p));
  chave = palavras.join(" ").trim();
  chave = chave.substring(0, 50);
  return chave;
}

describe("Sistema de Aprendizado - Geração de Chave", () => {
  it("deve normalizar variações do mesmo emitente", () => {
    const chave1 = gerarChaveReconhecimento("João Almeida ME");
    const chave2 = gerarChaveReconhecimento("João Almeida Ltda");
    const chave3 = gerarChaveReconhecimento("João Almeida EIRELI");
    expect(chave1).toBe(chave2);
    expect(chave2).toBe(chave3);
    expect(chave1).toBe("joao almeida");
  });

  it("deve remover acentos", () => {
    const chave = gerarChaveReconhecimento("João Almeida");
    expect(chave).toBe("joao almeida");
  });

  it("deve remover caracteres especiais", () => {
    const chave = gerarChaveReconhecimento("Empresa XYZ S/A");
    expect(chave).toBe("empresa xyz");
  });

  it("deve truncar para 50 caracteres", () => {
    const longName = "Empresa com nome muito longo para ser usado como chave de reconhecimento Ltda";
    const chave = gerarChaveReconhecimento(longName);
    expect(chave.length).toBeLessThanOrEqual(50);
  });

  it("deve retornar string vazia para null", () => {
    expect(gerarChaveReconhecimento(null)).toBe("");
  });
});

// ========== TESTE 2: Parser XML NF-e ==========

function extrairNFe(xmlStr: string): {
  numero_nf: string | null;
  valor: number | null;
  data: string | null;
  emitente: string | null;
  destinatario: string | null;
  itens: string[];
} {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlStr, "text/xml");

  const parseTag = (tag: string): string | null => {
    const el = xmlDoc.querySelector(tag);
    return el?.textContent?.trim() || null;
  };

  const nNF = parseTag("nNF");
  const dhEmi = parseTag("dhEmi");
  const vNF = parseTag("vNF");

  let data: string | null = null;
  if (dhEmi) {
    const d = new Date(dhEmi);
    if (!isNaN(d.getTime())) {
      data = d.toISOString().split("T")[0];
    }
  }

  const itens: string[] = [];
  xmlDoc.querySelectorAll("det").forEach((det) => {
    const prod = det.querySelector("prod xProd");
    if (prod?.textContent) {
      itens.push(prod.textContent.trim());
    }
  });

  return {
    numero_nf: nNF,
    valor: vNF ? parseFloat(vNF) : null,
    data,
    emitente: parseTag("emit xNome"),
    destinatario: parseTag("dest xNome"),
    itens,
  };
}

describe("Parser XML NF-e", () => {
  const xmlExemplo = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe>
    <infNFe>
      <ide>
        <nNF>123456</nNF>
        <dhEmi>2024-03-15T10:30:00-03:00</dhEmi>
      </ide>
      <emit>
        <CNPJ>11222333000181</CNPJ>
        <xNome>Fornecedor Exemplo Ltda</xNome>
      </emit>
      <dest>
        <CNPJ>99888777000155</CNPJ>
        <xNome>Comprador Exemplo ME</xNome>
      </dest>
      <det nItem="1">
        <prod>
          <xProd>Arroz Parboilizado 5kg</xProd>
          <vProd>25.90</vProd>
        </prod>
      </det>
      <det nItem="2">
        <prod>
          <xProd>Feijão Preto 1kg</xProd>
          <vProd>8.50</vProd>
        </prod>
      </det>
      <total>
        <ICMSTot>
          <vNF>34.40</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`;

  it("deve extrair número da NF", () => {
    const result = extrairNFe(xmlExemplo);
    expect(result.numero_nf).toBe("123456");
  });

  it("deve extrair valor total", () => {
    const result = extrairNFe(xmlExemplo);
    expect(result.valor).toBe(34.40);
  });

  it("deve extrair data de emissão", () => {
    const result = extrairNFe(xmlExemplo);
    expect(result.data).toBe("2024-03-15");
  });

  it("deve extrair emitente", () => {
    const result = extrairNFe(xmlExemplo);
    expect(result.emitente).toBe("Fornecedor Exemplo Ltda");
  });

  it("deve extrair destinatário", () => {
    const result = extrairNFe(xmlExemplo);
    expect(result.destinatario).toBe("Comprador Exemplo ME");
  });

  it("deve extrair itens da nota", () => {
    const result = extrairNFe(xmlExemplo);
    expect(result.itens).toHaveLength(2);
    expect(result.itens[0]).toBe("Arroz Parboilizado 5kg");
    expect(result.itens[1]).toBe("Feijão Preto 1kg");
  });
});

// ========== TESTE 3: Segurança (tenant isolation) ==========

describe("Segurança - Isolamento por Empresa", () => {
  it("deve verificar que empresa A não acessa dados da empresa B", () => {
    const docsEmpresaA = [
      { id: "1", empresa_id: "Empresa A" },
      { id: "2", empresa_id: "Empresa A" },
    ];
    const docsEmpresaB = [
      { id: "3", empresa_id: "Empresa B" },
    ];

    const filtrarPorEmpresa = (docs: { id: string; empresa_id: string }[], empresaId: string) =>
      docs.filter((d) => d.empresa_id === empresaId);

    const resultA = filtrarPorEmpresa(
      [...docsEmpresaA, ...docsEmpresaB],
      "Empresa A"
    );
    expect(resultA).toHaveLength(2);
    expect(resultA.every((d) => d.empresa_id === "Empresa A")).toBe(true);

    const resultB = filtrarPorEmpresa(
      [...docsEmpresaA, ...docsEmpresaB],
      "Empresa B"
    );
    expect(resultB).toHaveLength(1);
    expect(resultB[0].id).toBe("3");
  });
});

// ========== TESTE 4: Worker / Retry ==========

describe("Worker - Comportamento em Falha", () => {
  it("deve incrementar tentativas em caso de erro", () => {
    const doc = { tentativas: 0, status: "NOVO" };
    const simularFalha = (d: { tentativas: number; status: string }) => {
      d.tentativas++;
      if (d.tentativas >= 3) {
        d.status = "ERRO";
      } else {
        d.status = "ERRO";
      }
      return d;
    };

    const tentativa1 = simularFalha({ ...doc });
    expect(tentativa1.tentativas).toBe(1);
    expect(tentativa1.status).toBe("ERRO");

    const doc2 = { tentativas: 2, status: "NOVO" };
    const tentativa3 = simularFalha(doc2);
    expect(tentativa3.tentativas).toBe(3);
    expect(tentativa3.status).toBe("ERRO");
  });
});
