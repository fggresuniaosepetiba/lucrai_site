"use client";

import { useState, useEffect, useCallback } from "react";
import { liveQuery } from "dexie";
import { db } from "@/database/dexie";
import { DocumentoRepository, DocumentoConfigRepository } from "@/database/repositories/documentos";
import type { DocumentoFinanceiro, DocumentoConfiguracao, DocumentoStats } from "@/types";

export function useDocumentos(empresa_id: string) {
  const [documentos, setDocumentos] = useState<DocumentoFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DocumentoStats | null>(null);

  const load = useCallback(async () => {
    if (!empresa_id) return;
    try {
      const docs = await DocumentoRepository.getAll(empresa_id);
      setDocumentos(docs);
      const now = new Date();
      const s = await DocumentoRepository.getStats(empresa_id, now.getMonth() + 1, now.getFullYear());
      setStats(s);
    } catch (err) {
      console.error("Error loading documentos:", err);
    }
  }, [empresa_id]);

  useEffect(() => {
    if (!empresa_id) return;
    setLoading(true);
    load().finally(() => setLoading(false));

    const observable = liveQuery(() =>
      db.documentos
        .where("empresa_id")
        .equals(empresa_id)
        .filter((d) => !d.excluido_em)
        .toArray()
    );

    const subscription = observable.subscribe({
      next: () => load(),
      error: (err) => console.error("liveQuery error:", err),
    });

    return () => subscription.unsubscribe();
  }, [empresa_id, load]);

  return { documentos, loading, stats, refresh: load };
}

export function useAguardandoCount(empresa_id: string) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!empresa_id) return;
    let cancelled = false;
    const check = async () => {
      const c = await DocumentoRepository.getAguardandoCount(empresa_id);
      if (!cancelled) setCount(c);
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

  useEffect(() => {
    if (!empresa_id) return;
    DocumentoConfigRepository.get(empresa_id).then((c) => {
      setConfig(c ?? null);
      setLoading(false);
    });
  }, [empresa_id]);

  return { config, loading };
}
