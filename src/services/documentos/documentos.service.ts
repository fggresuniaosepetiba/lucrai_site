"use client";

import { DocumentoRepository, DocumentoLogRepository, DocumentoConfigRepository } from "@/database/repositories/documentos";
import { DocumentoRepositoryApi } from "@/services/api-repositories/documents";
import { TransactionRepository } from "@/database/repositories/transactions";
import { CashForecastRepository } from "@/database/repositories/cash-forecast";
import { DocumentoStorageService } from "./documentos-storage.service";
import { DocumentoExtracaoService } from "./documentos-extracao.service";
import { DocumentoAprendizadoService } from "./documentos-aprendizado.service";
import { DocumentExtractorService } from "./document-extractor";
import type { DocumentoFinanceiro, TipoMovimentacao } from "@/types";
import { todayStr } from "@/lib/utils";

function gerarResumoExecutivo(resultado: Awaited<ReturnType<typeof DocumentoExtracaoService.extrairDeImagemOuPDF>>): string {
  const partes: string[] = [];

  const tipo = resultado.tipo_documento?.replace(/_/g, " ").toLowerCase() || "documento";
  const valor = resultado.valor;
  const produtos = resultado.produtos || [];
  const emitente = resultado.emitente;
  const favorecido = resultado.favorecido;
  const descricao = resultado.descricao;

  if (produtos.length > 0 && valor) {
    const totalItens = produtos.reduce((s, p) => s + p.quantidade, 0);
    const nomes = produtos.slice(0, 3).map((p) => p.descricao).join(", ");
    const extra = produtos.length > 3 ? ` e mais ${produtos.length - 3} produto(s)` : "";
    const valorFormatado = valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const nome = emitente || favorecido || "fornecedor";

    partes.push(`Foi identificada uma compra de ${totalItens} ${nomes}${extra} no valor de ${valorFormatado} realizada junto à ${nome}.`);
  } else if (valor) {
    const valorFormatado = valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const nome = emitente || favorecido || "destinatário";
    const mov = resultado.tipo_movimentacao === "RECEITA" ? "recebimento" : "pagamento";
    partes.push(`Foi identificado um ${mov} de ${valorFormatado} relacionado à ${nome}.`);
  } else if (descricao) {
    partes.push(`Documento identificado como ${tipo}: ${descricao}.`);
  } else {
    partes.push(`Documento do tipo ${tipo} processado e aguardando conferência.`);
  }

  if (resultado.numero_nota) {
    partes.push(`Nota Fiscal nº ${resultado.numero_nota}.`);
  }

  return partes.join(" ");
}

export const DocumentoService = {
  async upload(
    files: File[],
    empresa_id: string,
    usuario_id: string
  ): Promise<DocumentoFinanceiro[]> {
    // Try API first
    try {
      const apiDocs = await DocumentoRepositoryApi.upload(files);
      return apiDocs;
    } catch {
      // Fallback: Dexie
    }

    const config = await DocumentoConfigRepository.get(empresa_id);
    const maxSizeMB = config?.limite_tamanho_mb || 10;

    const documentos: DocumentoFinanceiro[] = [];

    for (const file of files) {
      const typeCheck = DocumentoStorageService.validateFileType(file);
      if (!typeCheck.valid) throw new Error(typeCheck.error);

      const sizeCheck = DocumentoStorageService.validateFileSize(file, maxSizeMB);
      if (!sizeCheck.valid) throw new Error(sizeCheck.error);

      const { nome_arquivo_storage, path_storage, arquivo_data } =
        await DocumentoStorageService.storeFile(empresa_id, file);

      const hash = await DocumentoStorageService.generateChecksum(arquivo_data);

      const existingDuplicates = await DocumentoRepository.getAll(empresa_id);
      const isDuplicate = existingDuplicates.some((d) => d.hash_arquivo === hash && !d.excluido_em);
      if (isDuplicate) continue;

      const tipo = typeCheck.tipo || "PDF";

      const doc = await DocumentoRepository.create({
        empresa_id,
        usuario_upload_id: usuario_id,
        nome_arquivo_original: file.name,
        nome_arquivo_storage,
        path_storage,
        tipo_arquivo: tipo as DocumentoFinanceiro["tipo_arquivo"],
        tamanho_bytes: file.size,
        hash_arquivo: hash,
        status: "NOVO",
        tipo_documento_detectado: null,
        valor_extraido: null,
        data_extraida: null,
        favorecido_extraido: null,
        emitente_extraido: null,
        descricao_extraida: null,
        tipo_movimentacao_sugerido: null,
        categoria_sugerida_id: null,
        confianca_extracao: null,
        dados_extraidos_raw: null,
        dados_estruturados: null,
        observacoes_ia: null,
        resumo_executivo: null,
        lancamento_id: null,
        usuario_conferencia_id: null,
        data_conferencia: null,
        motivo_rejeicao: null,
        motivo_exclusao: null,
        exclusao_permanente: null,
        excluido_por: null,
        data_exclusao: null,
        tentativas_processamento: 0,
        ultimo_erro: null,
        arquivo_data,
        excluido_em: null,
      });

      await DocumentoLogRepository.log(empresa_id, doc.id, "UPLOAD", usuario_id, {
        nome_arquivo: file.name,
        tamanho_bytes: file.size,
        tipo_arquivo: tipo,
      });

      documentos.push(doc);
    }

    for (const doc of documentos) {
      this.iniciarProcessamento(doc.id);
    }

    return documentos;
  },

  async iniciarProcessamento(documentoId: string): Promise<void> {
    await DocumentoRepository.update(documentoId, { status: "PROCESSANDO" });
    const doc = await DocumentoRepository.getById(documentoId);
    if (!doc) return;

    await DocumentoLogRepository.log(doc.empresa_id, documentoId, "PROCESSAMENTO_INICIADO");

    try {
      let resultado;
      if (doc.tipo_arquivo === "XML") {
        resultado = await DocumentoExtracaoService.extrairDeXML(
          doc.arquivo_data!,
          doc.nome_arquivo_original
        );
      } else {
        resultado = await DocumentExtractorService.extract(
          doc.arquivo_data!,
          doc.tipo_arquivo,
          doc.nome_arquivo_original
        );
      }

      const aprendizado = await DocumentoAprendizadoService.buscarSugestao(
        doc.empresa_id,
        resultado.emitente,
        resultado.favorecido
      );

      const categoriaFinal = aprendizado.aplicado && aprendizado.categoria_id
        ? aprendizado.categoria_id
        : null;

      const resumo = gerarResumoExecutivo(resultado);

      await DocumentoRepository.update(documentoId, {
        tipo_documento_detectado: resultado.tipo_documento,
        valor_extraido: resultado.valor,
        data_extraida: resultado.data,
        favorecido_extraido: resultado.favorecido,
        emitente_extraido: resultado.emitente,
        descricao_extraida: resultado.descricao,
        tipo_movimentacao_sugerido: resultado.tipo_movimentacao,
        categoria_sugerida_id: categoriaFinal || null,
        confianca_extracao: resultado.confianca,
        dados_extraidos_raw: JSON.stringify(resultado),
        dados_estruturados: resultado.dados_estruturados ? JSON.stringify(resultado.dados_estruturados) : null,
        observacoes_ia: resultado.observacoes,
        resumo_executivo: resumo,
        status: "AGUARDANDO_CONFERENCIA",
        tentativas_processamento: doc.tentativas_processamento + 1,
      });

      await DocumentoLogRepository.log(doc.empresa_id, documentoId, "PROCESSAMENTO_CONCLUIDO", null, {
        confianca: resultado.confianca,
        tipo_documento: resultado.tipo_documento,
        aprendizado_aplicado: aprendizado.aplicado,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro desconhecido no processamento";
      const tentativas = doc.tentativas_processamento + 1;

      await DocumentoRepository.update(documentoId, {
        status: "ERRO",
        tentativas_processamento: tentativas,
        ultimo_erro: errorMsg,
      });

      await DocumentoLogRepository.log(doc.empresa_id, documentoId, "PROCESSAMENTO_ERRO", null, {
        erro: errorMsg,
        tentativa: tentativas,
      });

      if (tentativas < 3) {
        setTimeout(() => this.iniciarProcessamento(documentoId), 5000);
      }
    }
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
    const doc = await DocumentoRepository.getById(documentoId);
    if (!doc) throw new Error("Documento não encontrado");
    if (doc.status !== "AGUARDANDO_CONFERENCIA") throw new Error("Documento não está aguardando conferência");

    const hoje = todayStr();

    if (data.data_lancamento > hoje) {
      const cats = await (await import("@/database/repositories/categories")).CategoryRepository.getAll(empresa_id);
      const cat = cats.find((c) => c.id === data.categoria_id);

      const forecast = await CashForecastRepository.create(
        {
          type: data.tipo_movimentacao === "RECEITA" ? "income" : "expense",
          description: data.descricao,
          amount: data.valor,
          category: cat?.name || "",
          expectedDate: data.data_lancamento,
          status: "predicted",
          notes: data.observacoes || `Originado do documento: ${doc.nome_arquivo_original}`,
        },
        empresa_id,
        usuario_nome
      );

      await DocumentoRepository.update(documentoId, {
        status: "CONVERTIDO",
        lancamento_id: forecast.id,
        usuario_conferencia_id: usuario_id,
        data_conferencia: new Date().toISOString(),
      });

      await DocumentoLogRepository.log(empresa_id, documentoId, "CONFIRMADO", usuario_id, {
        lancamento_id: forecast.id,
        valor: data.valor,
        tipo_movimentacao: data.tipo_movimentacao,
        destino: "previsao_caixa",
      });

      await DocumentoLogRepository.log(empresa_id, documentoId, "CRIADO_PREVISAO", usuario_id, {
        previsao_id: forecast.id,
        data_prevista: data.data_lancamento,
      });

      return { lancamento_id: forecast.id, tipo: "forecast" };
    }

    const transaction = await TransactionRepository.create(
      {
        type: data.tipo_movimentacao === "RECEITA" ? "income" : "expense",
        value: data.valor,
        categoryId: data.categoria_id,
        categoryName: "",
        description: data.descricao,
        date: data.data_lancamento,
        observation: data.observacoes || undefined,
      },
      empresa_id,
      usuario_nome
    );

    const cats = await (await import("@/database/repositories/categories")).CategoryRepository.getAll(empresa_id);
    const cat = cats.find((c) => c.id === data.categoria_id);
    if (cat) {
      await TransactionRepository.update(transaction.id, { categoryName: cat.name });
    }

    await DocumentoRepository.update(documentoId, {
      status: "CONVERTIDO",
      lancamento_id: transaction.id,
      usuario_conferencia_id: usuario_id,
      data_conferencia: new Date().toISOString(),
    });

    await DocumentoLogRepository.log(empresa_id, documentoId, "CONFIRMADO", usuario_id, {
      lancamento_id: transaction.id,
      valor: data.valor,
      tipo_movimentacao: data.tipo_movimentacao,
    });

    await DocumentoAprendizadoService.registrarAprendizado(
      empresa_id,
      data.emitente || doc.emitente_extraido,
      data.favorecido || doc.favorecido_extraido,
      data.categoria_id,
      data.tipo_movimentacao
    );

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

    const doc = await DocumentoRepository.getById(documentoId);
    if (!doc) throw new Error("Documento não encontrado");

    await DocumentoRepository.update(documentoId, {
      status: "REJEITADO",
      motivo_rejeicao: motivo.trim(),
      usuario_conferencia_id: usuario_id,
      data_conferencia: new Date().toISOString(),
    });

    await DocumentoLogRepository.log(empresa_id, documentoId, "REJEITADO", usuario_id, { motivo: motivo.trim() });
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

    const doc = await DocumentoRepository.getById(documentoId);
    if (!doc) throw new Error("Documento não encontrado");

    if (permanent) {
      await DocumentoRepository.permanentDelete(documentoId);
      await DocumentoLogRepository.log(empresa_id, documentoId, "PERMANENTLY_DELETED", usuario_id, {
        motivo: motivo.trim(),
        usuario: usuario_nome,
      });
    } else {
      const deleted = await DocumentoRepository.moveToTrash(
        documentoId,
        motivo.trim(),
        usuario_nome
      );

      await DocumentoLogRepository.log(empresa_id, documentoId, "MOVED_TO_TRASH", usuario_id, {
        motivo: motivo.trim(),
        usuario: usuario_nome,
        data_exclusao: deleted.excluido_em,
      });
    }

    if (doc.arquivo_data) {
      const mimeTypes: Record<string, string> = {
        PDF: "application/pdf", XML: "application/xml", JPG: "image/jpeg",
        JPEG: "image/jpeg", PNG: "image/png",
      };
      const blob = new Blob([doc.arquivo_data], { type: mimeTypes[doc.tipo_arquivo] || "application/octet-stream" });
      URL.revokeObjectURL(URL.createObjectURL(blob));
    }
  },

  async restaurarDaTrash(documentoId: string, empresa_id: string, usuario_id: string): Promise<void> {
    const doc = await DocumentoRepository.getFromTrash(documentoId);
    if (!doc) throw new Error("Documento não encontrado na lixeira");

    await DocumentoRepository.restoreFromTrash(documentoId);

    await DocumentoLogRepository.log(empresa_id, documentoId, "RESTAURADO", usuario_id, {
      restaurado_em: new Date().toISOString(),
    });
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

    const doc = await DocumentoRepository.getFromTrash(documentoId);
    if (!doc) throw new Error("Documento não encontrado na lixeira");

    await DocumentoRepository.permanentDelete(documentoId);

    await DocumentoLogRepository.log(empresa_id, documentoId, "PERMANENTLY_DELETED", usuario_id, {
      motivo: motivo.trim(),
      usuario: usuario_nome,
    });
  },

  async reprocessar(documentoId: string, empresa_id: string): Promise<void> {
    const doc = await DocumentoRepository.getById(documentoId);
    if (!doc) throw new Error("Documento não encontrado");
    if (doc.status !== "ERRO" && doc.status !== "AGUARDANDO_CONFERENCIA") {
      throw new Error("Só é possível reprocessar documentos com status ERRO ou AGUARDANDO_CONFERENCIA");
    }

    await DocumentoRepository.update(documentoId, {
      status: "NOVO",
      tipo_documento_detectado: null,
      valor_extraido: null,
      data_extraida: null,
      favorecido_extraido: null,
      emitente_extraido: null,
      descricao_extraida: null,
      tipo_movimentacao_sugerido: null,
      categoria_sugerida_id: null,
      confianca_extracao: null,
      dados_extraidos_raw: null,
      dados_estruturados: null,
      observacoes_ia: null,
      resumo_executivo: null,
      ultimo_erro: null,
    });

    await DocumentoLogRepository.log(empresa_id, documentoId, "REPROCESSADO", null);

    this.iniciarProcessamento(documentoId);
  },
};
