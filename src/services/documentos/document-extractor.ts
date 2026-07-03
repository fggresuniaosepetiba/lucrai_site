"use client";

import type { ExtracaoResult } from "./documentos-extracao.service";

export interface DocumentExtractorProvider {
  name: string;
  extract(buffer: ArrayBuffer, tipo: string, nomeArquivo: string): Promise<ExtracaoResult>;
}

class LocalOCRExtractor implements DocumentExtractorProvider {
  name = "ocr-local";

  async extract(buffer: ArrayBuffer, tipo: string, nomeArquivo: string): Promise<ExtracaoResult> {
    const { DocumentoExtracaoService } = await import("./documentos-extracao.service");
    if (tipo === "XML") {
      return DocumentoExtracaoService.extrairDeXML(buffer, nomeArquivo);
    }
    return DocumentoExtracaoService.extrairDeImagemOuPDF(buffer, tipo, nomeArquivo);
  }
}

class OpenAIExtractor implements DocumentExtractorProvider {
  name = "openai";

  async extract(buffer: ArrayBuffer, tipo: string, _nomeArquivo: string): Promise<ExtracaoResult> {
    const { DocumentoExtracaoService } = await import("./documentos-extracao.service");
    return DocumentoExtracaoService.extrairComOpenAI(buffer, tipo, "");
  }
}

class GeminiExtractor implements DocumentExtractorProvider {
  name = "gemini";

  async extract(_buffer: ArrayBuffer, _tipo: string, nomeArquivo: string): Promise<ExtracaoResult> {
    const { DocumentoExtracaoService } = await import("./documentos-extracao.service");
    return DocumentoExtracaoService.fallbackSemIA(nomeArquivo);
  }
}

class ClaudeExtractor implements DocumentExtractorProvider {
  name = "claude";

  async extract(_buffer: ArrayBuffer, _tipo: string, nomeArquivo: string): Promise<ExtracaoResult> {
    const { DocumentoExtracaoService } = await import("./documentos-extracao.service");
    return DocumentoExtracaoService.fallbackSemIA(nomeArquivo);
  }
}

const providers: Record<string, DocumentExtractorProvider> = {
  "mock": new LocalOCRExtractor(),
  "openai": new OpenAIExtractor(),
  "gemini": new GeminiExtractor(),
  "claude": new ClaudeExtractor(),
};

export const DocumentExtractorService = {
  getProvider(): DocumentExtractorProvider {
    const name = process.env.NEXT_PUBLIC_DOCUMENT_AI_PROVIDER || "mock";
    return providers[name] || providers["mock"];
  },

  getAvailableProviders(): string[] {
    return Object.keys(providers);
  },

  async extract(buffer: ArrayBuffer, tipo: string, nomeArquivo: string): Promise<ExtracaoResult> {
    return this.getProvider().extract(buffer, tipo, nomeArquivo);
  },
};
