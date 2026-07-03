"use client";

import { DocumentoAprendizadoRepository } from "@/database/repositories/documentos";
import type { TipoMovimentacao } from "@/types";

export const DocumentoAprendizadoService = {
  gerarChaveReconhecimento(texto: string | null): string {
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
  },

  async buscarSugestao(
    empresa_id: string,
    emitente: string | null,
    favorecido: string | null
  ): Promise<{
    categoria_id: string | null;
    tipo_movimentacao: TipoMovimentacao | null;
    frequencia: number;
    aplicado: boolean;
  }> {
    const chaveEmitente = emitente ? this.gerarChaveReconhecimento(emitente) : "";
    const chaveFavorecido = favorecido ? this.gerarChaveReconhecimento(favorecido) : "";

    const chaves = [chaveEmitente, chaveFavorecido].filter(Boolean);

    for (const chave of chaves) {
      const registro = await DocumentoAprendizadoRepository.getByChave(empresa_id, chave);
      if (registro) {
        return {
          categoria_id: registro.categoria_id,
          tipo_movimentacao: registro.tipo_movimentacao,
          frequencia: registro.frequencia,
          aplicado: registro.frequencia >= 2,
        };
      }
    }

    return { categoria_id: null, tipo_movimentacao: null, frequencia: 0, aplicado: false };
  },

  async registrarAprendizado(
    empresa_id: string,
    emitente: string | null,
    favorecido: string | null,
    categoria_id: string,
    tipo_movimentacao: TipoMovimentacao
  ): Promise<void> {
    const nomeParaChave = favorecido || emitente;
    if (!nomeParaChave) return;

    const chave = this.gerarChaveReconhecimento(nomeParaChave);
    if (!chave) return;

    await DocumentoAprendizadoRepository.upsert(
      empresa_id,
      chave,
      categoria_id,
      tipo_movimentacao
    );
  },
};
