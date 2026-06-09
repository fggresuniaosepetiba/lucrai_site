"use client";

import { useState, useEffect, useMemo } from "react";
import { useDadosFiltrados } from "./useDadosFiltrados";
import { calcularAlertasAtivos } from "@/services/alertasService";

export function useAlertsCount() {
  const {
    lancamentos,
    entradas,
    saidas,
    saldoAtual,
    saldoProjetado,
    margemLiquida,
    recebimentosPrevistos,
    pagamentosPrevistos,
  } = useDadosFiltrados();
  const [counts, setCounts] = useState({ criticos: 0, atencao: 0, positivos: 0 });

  const alertas = useMemo(() => {
    try {
      return calcularAlertasAtivos({
        lancamentos,
        entradas,
        saidas,
        saldoAtual,
        saldoProjetado,
        margemLiquida,
        recebimentosPrevistos,
        pagamentosPrevistos,
      });
    } catch {
      return [];
    }
  }, [lancamentos, entradas, saidas, saldoAtual, saldoProjetado, margemLiquida, recebimentosPrevistos, pagamentosPrevistos]);

  useEffect(() => {
    const criticos = alertas.filter((a) => a.tipo === "critico" && !a.dispensado).length;
    const atencao = alertas.filter((a) => a.tipo === "atencao" && !a.dispensado).length;
    const positivos = alertas.filter((a) => a.tipo === "positivo" && !a.dispensado).length;
    setCounts({ criticos, atencao, positivos });
  }, [alertas]);

  return counts;
}
