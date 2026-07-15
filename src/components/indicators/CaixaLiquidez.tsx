"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "./KpiCard";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/cn";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import type { IndicadoresContext } from "@/types/dashboard";

interface CaixaLiquidezProps {
  data: IndicadoresContext;
}

export function CaixaLiquidez({ data }: CaixaLiquidezProps) {
  const { caixaLiquidez: c, capitalGiro: g } = data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Saldo Disponível" value={c.saldoDisponivel} variant="success" />
        <KpiCard label="Entradas Previstas 30d" value={c.entradasPrevistas30d} variant="info" />
        <KpiCard label="Saídas Previstas 30d" value={c.saidasPrevistas30d} variant="warning" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Saldo Projetado 30d" value={c.saldoProjetado30d} variant={c.saldoProjetado30d >= 0 ? "success" : "danger"} />
        <KpiCard label="Saldo Bloqueado" value={c.saldoBloqueado} variant="default" />
        <KpiCard label="Saldo Aplicado" value={c.saldoAplicado} variant="info" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            Índices de Liquidez
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground/60" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[250px]">
                  <p className="text-xs">Indicadores que medem a capacidade da empresa de pagar suas obrigações de curto prazo.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Liquidez Imediata", value: c.indices.liquidezImediata, desc: "Capacidade de pagamento imediato" },
              { label: "Liquidez Corrente", value: c.indices.liquidezCorrente, desc: "Capacidade de curto prazo" },
              { label: "Liquidez Seca", value: c.indices.liquidezSeca, desc: "Exclui estoques do cálculo" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-border/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <span className={cn(
                    "text-xs font-medium px-1.5 py-0.5 rounded-full",
                    item.value >= 1 ? "bg-green-500/10 text-green-500" :
                    item.value >= 0.5 ? "bg-yellow-500/10 text-yellow-500" :
                    "bg-red-500/10 text-red-500"
                  )}>
                    {item.value >= 1 ? "Saudável" : item.value >= 0.5 ? "Atenção" : "Crítico"}
                  </span>
                </div>
                <p className="text-2xl font-bold">{item.value.toFixed(2)}x</p>
                <p className="text-[10px] text-muted-foreground mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Capital de Giro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Capital de Giro</p>
              <p className="text-lg font-bold">{formatCurrency(g.valor)}</p>
              <p className={cn("text-xs", g.variacao >= 0 ? "text-emerald-400" : "text-red-400")}>
                {g.variacao >= 0 ? "+" : ""}{g.variacao.toFixed(1)}% vs. período anterior
              </p>
            </div>
            <div className="rounded-xl border border-border/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">NCG</p>
              <p className="text-lg font-bold">{formatCurrency(g.necessidadeCapitalGiro)}</p>
              <p className="text-[10px] text-muted-foreground">Necessidade de Capital de Giro</p>
            </div>
            <div className="rounded-xl border border-border/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Ciclo Financeiro</p>
              <p className="text-lg font-bold">{g.ciclos.cicloFinanceiro} dias</p>
              <p className="text-[10px] text-muted-foreground">PMR + PME - PMP</p>
            </div>
            <div className="rounded-xl border border-border/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Ciclo Operacional</p>
              <p className="text-lg font-bold">{g.ciclos.cicloOperacional} dias</p>
              <p className="text-[10px] text-muted-foreground">PMR + PME</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3 mt-4">
            {[
              { label: "PMR", value: g.ciclos.pmr, desc: "Prazo Médio de Recebimento" },
              { label: "PMP", value: g.ciclos.pmp, desc: "Prazo Médio de Pagamento" },
              { label: "PME", value: g.ciclos.pme, desc: "Prazo Médio de Estocagem" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-lg font-bold">{item.value} dias</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
