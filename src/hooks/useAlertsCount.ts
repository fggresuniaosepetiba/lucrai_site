"use client";

import { useState, useEffect, useMemo } from "react";
import { useDadosFiltrados } from "./useDadosFiltrados";
import { calcularAlertasAtivos } from "@/services/alertasService";

export function useAlertsCount() {
  const dados = useDadosFiltrados();
  const [counts, setCounts] = useState({ criticos: 0, atencao: 0, positivos: 0 });

  const alertas = useMemo(() => {
    try {
      const allTransactions = dados.lancamentos;
      return calcularAlertasAtivos({
        lancamentos: allTransactions,
        entradas: dados.entradas,
        saidas: dados.saidas,
        saldoAtual: dados.saldoAtual,
        saldoProjetado: dados.saldoProjetado,
        margemLiquida: dados.margemLiquida,
        recebimentosPrevistos: dados.recebimentosPrevistos,
        pagamentosPrevistos: dados.pagamentosPrevistos,
      });
    } catch {
      return [];
    }
  }, [dados]);

  useEffect(() => {
    const criticos = alertas.filter((a) => a.tipo === "critico" && !a.dispensado).length;
    const atencao = alertas.filter((a) => a.tipo === "atencao" && !a.dispensado).length;
    const positivos = alertas.filter((a) => a.tipo === "positivo" && !a.dispensado).length;
    setCounts({ criticos, atencao, positivos });
  }, [alertas]);

  return counts;
}
