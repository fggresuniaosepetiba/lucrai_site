"use client";

import { DocumentoRepositoryApi } from "@/services/api-repositories/documents";
import { TransactionRepositoryApi } from "@/services/api-repositories/transactions";
import { CashForecastRepositoryApi } from "@/services/api-repositories/cash-forecast";
import { CategoryRepositoryApi } from "@/services/api-repositories/categories";
import { DocumentoAprendizadoService } from "./documentos-aprendizado.service";
import type { DocumentoFinanceiro, TipoMovimentacao } from "@/types";
import { todayStr } from "@/lib/utils";

export const DocumentoService = {
  async upload(
    files: File[],
    empresa_id: string,
    usuario_id: string
  ): Promise<DocumentoFinanceiro[]> {
    const apiDocs = await DocumentoRepositoryApi.upload(files);
    return apiDocs;
  },

  async confirmar(
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
  ): Promise<{ lancamento_id: string; tipo: "transaction" | "forecast" }> {
    const hoje = todayStr();

    if (data.data_lancamento > hoje) {
      const cats = await CategoryRepositoryApi.getAll();
      const cat = cats.find((c) => c.id === data.categoria_id);

      const forecast = await CashForecastRepositoryApi.create({
        type: data.tipo_movimentacao === "RECEITA" ? "income" : "expense",
        description: data.descricao,
        amount: data.valor,
        category: cat?.name || "",
        expectedDate: data.data_lancamento,
        status: "predicted",
        notes: data.observacoes || `Originado do documento`,
      });

      await DocumentoRepositoryApi.confirmar(documentoId, {
        valorExtraido: data.valor,
        dataExtraida: data.data_lancamento,
        descricaoExtraida: data.descricao,
        categoriaSugeridaId: data.categoria_id,
        tipoMovimentacaoSugerido: data.tipo_movimentacao,
        favorecidoExtraido: data.favorecido,
        emitenteExtraido: data.emitente,
      });

      return { lancamento_id: forecast.id, tipo: "forecast" };
    }

    const transaction = await TransactionRepositoryApi.create({
      type: data.tipo_movimentacao === "RECEITA" ? "income" : "expense",
      value: data.valor,
      categoryId: data.categoria_id,
      categoryName: "",
      description: data.descricao,
      date: data.data_lancamento,
      observation: data.observacoes || undefined,
    });

    const cats = await CategoryRepositoryApi.getAll();
    const cat = cats.find((c) => c.id === data.categoria_id);
    if (cat) {
      await TransactionRepositoryApi.update(transaction.id, { categoryName: cat.name });
    }

    await DocumentoRepositoryApi.confirmar(documentoId, {
      valorExtraido: data.valor,
      dataExtraida: data.data_lancamento,
      descricaoExtraida: data.descricao,
      categoriaSugeridaId: data.categoria_id,
      tipoMovimentacaoSugerido: data.tipo_movimentacao,
      favorecidoExtraido: data.favorecido,
      emitenteExtraido: data.emitente,
    });

    const nomeParaChave = data.favorecido || data.emitente;
    if (nomeParaChave) {
      const chave = DocumentoAprendizadoService.gerarChaveReconhecimento(nomeParaChave);
      if (chave) {
        await DocumentoRepositoryApi.upsertAprendizado({
          chave,
          categoriaId: data.categoria_id,
          tipoMovimentacao: data.tipo_movimentacao,
        });
      }
    }

    return { lancamento_id: transaction.id, tipo: "transaction" };
  },

  async rejeitar(
    documentoId: string,
    motivo: string,
    usuario_id: string,
    empresa_id: string
  ): Promise<void> {
    if (!motivo || !motivo.trim()) {
      throw new Error("Motivo da rejeição é obrigatório");
    }

    await DocumentoRepositoryApi.rejeitar(documentoId, motivo.trim());
  },

  async excluir(
    documentoId: string,
    empresa_id: string,
    motivo: string,
    usuario_id: string,
    usuario_nome: string,
    permanent: boolean = false
  ): Promise<void> {
    if (!motivo || !motivo.trim()) {
      throw new Error("Motivo da exclusão é obrigatório");
    }

    if (permanent) {
      await DocumentoRepositoryApi.excluirPermanente(documentoId);
    } else {
      await DocumentoRepositoryApi.excluir(documentoId, motivo.trim());
    }
  },

  async restaurarDaTrash(documentoId: string, empresa_id: string, usuario_id: string): Promise<void> {
    await DocumentoRepositoryApi.restaurar(documentoId);
  },

  async excluirPermanentemente(
    documentoId: string,
    empresa_id: string,
    motivo: string,
    usuario_id: string,
    usuario_nome: string
  ): Promise<void> {
    if (!motivo || !motivo.trim()) {
      throw new Error("Motivo da exclusão permanente é obrigatório");
    }

    await DocumentoRepositoryApi.excluirPermanente(documentoId);
  },

  async reprocessar(documentoId: string): Promise<void> {
    await DocumentoRepositoryApi.reprocessar(documentoId);
  },
};
