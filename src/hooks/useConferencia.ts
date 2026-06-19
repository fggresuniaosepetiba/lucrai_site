"use client";

import { useState, useCallback } from "react";
import { DocumentoService } from "@/services/documentos/documentos.service";
import type { TipoMovimentacao } from "@/types";

export function useConferencia() {
  const [confirming, setConfirming] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const confirmar = useCallback(async (
    documentoId: string,
    data: {
      valor: number;
      data_lancamento: string;
      descricao: string;
      categoria_id: string;
      tipo_movimentacao: TipoMovimentacao;
      favorecido?: string;
      emitente?: string;
      observacoes?: string;
    },
    usuario_id: string,
    usuario_nome: string,
    empresa_id: string
  ): Promise<{ lancamento_id: string; tipo: "transaction" | "forecast" }> => {
    setConfirming(true);
    try {
      const result = await DocumentoService.confirmar(
        documentoId, data, usuario_id, usuario_nome, empresa_id
      );
      return result;
    } finally {
      setConfirming(false);
    }
  }, []);

  const rejeitar = useCallback(async (
    documentoId: string,
    motivo: string,
    usuario_id: string,
    empresa_id: string
  ) => {
    setRejecting(true);
    try {
      await DocumentoService.rejeitar(documentoId, motivo, usuario_id, empresa_id);
    } finally {
      setRejecting(false);
    }
  }, []);

  return { confirmar, rejeitar, confirming, rejecting };
}
