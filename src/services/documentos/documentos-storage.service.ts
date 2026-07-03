"use client";

export const DocumentoStorageService = {
  async storeFile(
    empresa_id: string,
    file: File
  ): Promise<{ nome_arquivo_storage: string; path_storage: string; arquivo_data: ArrayBuffer }> {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const uuid = crypto.randomUUID();
    const ano = new Date().getFullYear();
    const mes = String(new Date().getMonth() + 1).padStart(2, "0");
    const nome_storage = `${uuid}.${ext}`;
    const path_storage = `empresa_${empresa_id}/documentos/${ano}/${mes}/${nome_storage}`;

    const buffer = await file.arrayBuffer();

    return { nome_arquivo_storage: nome_storage, path_storage, arquivo_data: buffer };
  },

  getFileUrl(arquivo_data: ArrayBuffer, tipo: string): string {
    const mimeTypes: Record<string, string> = {
      PDF: "application/pdf",
      XML: "application/xml",
      JPG: "image/jpeg",
      JPEG: "image/jpeg",
      PNG: "image/png",
    };
    const mime = mimeTypes[tipo] || "application/octet-stream";
    const blob = new Blob([arquivo_data], { type: mime });
    return URL.createObjectURL(blob);
  },

  revokeFileUrl(url: string): void {
    URL.revokeObjectURL(url);
  },

  async generateChecksum(buffer: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  },

  validateFileType(file: File): { valid: boolean; tipo: string | null; error?: string } {
    const allowedTypes: Record<string, string> = {
      "application/pdf": "PDF",
      "text/xml": "XML",
      "application/xml": "XML",
      "image/jpeg": "JPEG",
      "image/jpg": "JPG",
      "image/png": "PNG",
    };

    const ext = file.name.split(".").pop()?.toLowerCase();
    const validExtensions = ["pdf", "xml", "jpg", "jpeg", "png"];

    if (!ext || !validExtensions.includes(ext)) {
      return { valid: false, tipo: null, error: "Formato de arquivo não suportado. Aceitamos: PDF, XML, JPG, JPEG, PNG." };
    }

    const tipo = allowedTypes[file.type];
    if (!tipo && ext !== "xml") {
      return { valid: false, tipo: null, error: "Tipo MIME não reconhecido." };
    }

    return { valid: true, tipo: tipo || "XML" };
  },

  validateFileSize(file: File, maxSizeMB: number = 10): { valid: boolean; error?: string } {
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return { valid: false, error: `Arquivo excede o limite de ${maxSizeMB}MB.` };
    }
    if (file.size === 0) {
      return { valid: false, error: "Arquivo vazio." };
    }
    return { valid: true };
  },
};
