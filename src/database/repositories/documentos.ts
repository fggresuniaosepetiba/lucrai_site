"use client";

import { db } from "../dexie";
import type {
  DocumentoFinanceiro,
  DocumentoAprendizado,
  DocumentoLog,
  DocumentoConfiguracao,
  DocumentoStats,
  DocumentoStatus,
  TipoMovimentacao,
  DocumentoLogAcao,
  DocumentoTrashItem,
} from "@/types";
import { generateId } from "@/lib/utils";

export const DocumentoRepository = {
  async getAll(empresa_id: string): Promise<DocumentoFinanceiro[]> {
    return db.documentos
      .where("empresa_id")
      .equals(empresa_id)
      .filter((d) => !d.excluido_em)
      .toArray();
  },

  async getById(id: string): Promise<DocumentoFinanceiro | undefined> {
    return db.documentos.get(id);
  },

  async getByStatus(empresa_id: string, status: DocumentoStatus): Promise<DocumentoFinanceiro[]> {
    return db.documentos
      .where("empresa_id")
      .equals(empresa_id)
      .filter((d) => d.status === status && !d.excluido_em)
      .toArray();
  },

  async getAguardandoCount(empresa_id: string): Promise<number> {
    return db.documentos
      .where("empresa_id")
      .equals(empresa_id)
      .filter((d) => d.status === "AGUARDANDO_CONFERENCIA" && !d.excluido_em)
      .count();
  },

  async create(
    data: Omit<DocumentoFinanceiro, "id" | "criado_em" | "atualizado_em">
  ): Promise<DocumentoFinanceiro> {
    const now = new Date().toISOString();
    const doc: DocumentoFinanceiro = {
      ...data,
      id: generateId(),
      criado_em: now,
      atualizado_em: now,
    };
    await db.documentos.add(doc);
    return doc;
  },

  async update(id: string, data: Partial<DocumentoFinanceiro>): Promise<void> {
    await db.documentos.update(id, {
      ...data,
      atualizado_em: new Date().toISOString(),
    });
  },

  async softDelete(id: string): Promise<void> {
    await db.documentos.update(id, {
      excluido_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    });
  },

  async getStats(empresa_id: string, mes: number, ano: number): Promise<DocumentoStats> {
    const all = await this.getAll(empresa_id);
    const total = all.length;
    const aguardando = all.filter((d) => d.status === "AGUARDANDO_CONFERENCIA").length;
    const processando = all.filter((d) => d.status === "PROCESSANDO").length;
    const mesAno = `${ano}-${String(mes).padStart(2, "0")}`;
    const convertidos_mes = all.filter(
      (d) => d.status === "CONVERTIDO" && d.criado_em.startsWith(mesAno)
    ).length;
    const rejeitados_mes = all.filter(
      (d) => d.status === "REJEITADO" && d.criado_em.startsWith(mesAno)
    ).length;
    const valor_total = all
      .filter((d) => d.status === "CONVERTIDO" && d.valor_extraido)
      .reduce((s, d) => s + (d.valor_extraido || 0), 0);
    return {
      total,
      aguardando,
      processando,
      convertidos_mes,
      rejeitados_mes,
      economia_estimada_minutos: convertidos_mes * 6,
      valor_total_automatizado: valor_total,
    };
  },

  async getAllInTrash(empresa_id: string): Promise<DocumentoTrashItem[]> {
    const now = new Date().toISOString();
    return db.documentoTrash
      .where("empresa_id")
      .equals(empresa_id)
      .filter((t) => t.restore_until > now)
      .toArray();
  },

  async getFromTrash(documento_id: string): Promise<DocumentoTrashItem | undefined> {
    return db.documentoTrash
      .where("documento_id")
      .equals(documento_id)
      .first();
  },

  async moveToTrash(
    documentoId: string,
    motivo: string,
    excluidoPor: string
  ): Promise<DocumentoTrashItem> {
    const doc = await db.documentos.get(documentoId);
    if (!doc) throw new Error("Documento não encontrado");

    const now = new Date();
    const restoreUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const trashItem: DocumentoTrashItem = {
      id: generateId(),
      documento_id: doc.id,
      empresa_id: doc.empresa_id,
      nome_arquivo_original: doc.nome_arquivo_original,
      tipo_arquivo: doc.tipo_arquivo,
      tamanho_bytes: doc.tamanho_bytes,
      status_original: doc.status,
      motivo_exclusao: motivo,
      excluido_por: excluidoPor,
      dados_documento: JSON.stringify(doc),
      criado_em: doc.criado_em,
      excluido_em: now.toISOString(),
      restore_until: restoreUntil.toISOString(),
    };

    await db.documentoTrash.add(trashItem);
    await db.documentos.delete(documentoId);

    return trashItem;
  },

  async restoreFromTrash(documentoId: string): Promise<void> {
    const trashItem = await this.getFromTrash(documentoId);
    if (!trashItem) throw new Error("Documento não encontrado na lixeira");

    const docData = JSON.parse(trashItem.dados_documento) as DocumentoFinanceiro;
    docData.id = trashItem.documento_id;
    docData.excluido_em = null;
    docData.atualizado_em = new Date().toISOString();
    await db.documentos.add(docData);
    await db.documentoTrash.delete(trashItem.id);
  },

  async permanentDelete(documentoId: string): Promise<void> {
    const trashItem = await this.getFromTrash(documentoId);
    if (trashItem) {
      await db.documentoTrash.delete(trashItem.id);
    }
    await db.documentos.delete(documentoId);
  },

  async cleanupTrash(): Promise<number> {
    const now = new Date().toISOString();
    const expired = await db.documentoTrash
      .filter((t) => t.restore_until <= now)
      .toArray();
    const ids = expired.map((t) => t.id);
    await db.documentoTrash.bulkDelete(ids);
    return ids.length;
  },
};

export const DocumentoAprendizadoRepository = {
  async getByEmpresa(empresa_id: string): Promise<DocumentoAprendizado[]> {
    return db.documentoAprendizado
      .where("empresa_id")
      .equals(empresa_id)
      .toArray();
  },

  async getByChave(empresa_id: string, chave: string): Promise<DocumentoAprendizado | undefined> {
    return db.documentoAprendizado
      .where("empresa_id")
      .equals(empresa_id)
      .filter((a) => a.chave_reconhecimento === chave)
      .first();
  },

  async upsert(
    empresa_id: string,
    chave_reconhecimento: string,
    categoria_id: string,
    tipo_movimentacao: TipoMovimentacao
  ): Promise<void> {
    const existing = await this.getByChave(empresa_id, chave_reconhecimento);
    const now = new Date().toISOString();
    if (existing) {
      await db.documentoAprendizado.update(existing.id, {
        categoria_id,
        tipo_movimentacao,
        frequencia: existing.frequencia + 1,
        ultima_confirmacao: now,
        atualizado_em: now,
      });
    } else {
      await db.documentoAprendizado.add({
        id: generateId(),
        empresa_id,
        chave_reconhecimento,
        categoria_id,
        tipo_movimentacao,
        frequencia: 1,
        ultima_confirmacao: now,
        criado_em: now,
        atualizado_em: now,
      });
    }
  },

  async delete(id: string): Promise<void> {
    await db.documentoAprendizado.delete(id);
  },

  async clearByEmpresa(empresa_id: string): Promise<void> {
    const items = await this.getByEmpresa(empresa_id);
    const ids = items.map((i) => i.id);
    await db.documentoAprendizado.bulkDelete(ids);
  },
};

export const DocumentoLogRepository = {
  async log(
    empresa_id: string,
    documento_id: string,
    acao: DocumentoLogAcao,
    usuario_id: string | null = null,
    detalhes: Record<string, unknown> | null = null
  ): Promise<void> {
    await db.documentoLogs.add({
      id: generateId(),
      documento_id,
      empresa_id,
      usuario_id,
      acao,
      detalhes: detalhes ? JSON.stringify(detalhes) : null,
      ip_origem: null,
      criado_em: new Date().toISOString(),
    });
  },

  async getByDocumento(documento_id: string): Promise<DocumentoLog[]> {
    return db.documentoLogs
      .where("documento_id")
      .equals(documento_id)
      .toArray();
  },
};

export const DocumentoConfigRepository = {
  async get(empresa_id: string): Promise<DocumentoConfiguracao | undefined> {
    return db.documentoConfiguracoes
      .where("empresa_id")
      .equals(empresa_id)
      .first();
  },

  async upsert(
    empresa_id: string,
    data: Partial<Omit<DocumentoConfiguracao, "id" | "empresa_id" | "criado_em">>
  ): Promise<void> {
    const existing = await this.get(empresa_id);
    const now = new Date().toISOString();
    if (existing) {
      await db.documentoConfiguracoes.update(existing.id, {
        ...data,
        atualizado_em: now,
      });
    } else {
      await db.documentoConfiguracoes.add({
        id: generateId(),
        empresa_id,
        retencao_dias: 365,
        notificar_email: true,
        notificar_sistema: true,
        auto_sugerir_categoria: true,
        limite_tamanho_mb: 10,
        ...data,
        criado_em: now,
        atualizado_em: now,
      });
    }
  },
};
