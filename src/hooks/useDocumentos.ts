"use client";

import { useState, useEffect, useCallback } from "react";
import { DocumentoRepositoryApi } from "@/services/api-repositories/documents";
import type { UpdateConfigRequest } from "@/services/api-repositories/documents";
import type { DocumentoFinanceiro, DocumentoConfiguracao, DocumentoStats } from "@/types";

export function useDocumentos(empresa_id: string) {
  const [documentos, setDocumentos] = useState<DocumentoFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DocumentoStats | null>(null);

  const load = useCallback(async () => {
    if (!empresa_id) return;
    try {
      const docs = await DocumentoRepositoryApi.getAll();
      setDocumentos(docs);
      const now = new Date();
      const s = await DocumentoRepositoryApi.getStats(now.getMonth() + 1, now.getFullYear());
      setStats(s);
    } catch (err) {
      console.error("Error loading documentos:", err);
    }
  }, [empresa_id]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  return { documentos, loading, stats, refresh: load };
}

export function useAguardandoCount(empresa_id: string) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!empresa_id) return;
    let cancelled = false;
    const check = async () => {
      try {
        const stats = await DocumentoRepositoryApi.getStats(new Date().getMonth() + 1, new Date().getFullYear());
        if (!cancelled) setCount(stats.aguardando);
      } catch {
        // silently ignore
      }
    };
    check();
    const interval = setInterval(check, 15000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [empresa_id]);

  return count;
}

export function useDocumentoConfig(empresa_id: string) {
  const [config, setConfig] = useState<DocumentoConfiguracao | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!empresa_id) return;
    setLoading(true);
    try {
      const c = await DocumentoRepositoryApi.getConfig();
      setConfig(c);
    } catch (err) {
      console.error("Error loading documento config:", err);
    }
    setLoading(false);
  }, [empresa_id]);

  useEffect(() => {
    load();
  }, [load]);

  const update = useCallback(async (data: UpdateConfigRequest) => {
    const result = await DocumentoRepositoryApi.updateConfig(data);
    setConfig(result);
    return result;
  }, []);

  return { config, loading, update };
}
