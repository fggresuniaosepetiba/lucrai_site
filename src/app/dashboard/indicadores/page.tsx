"use client";

import { useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/layout/shell";
import { FiltroAtivoIndicator } from "@/components/shared/FiltroAtivoIndicator";
import { FiltrosGlobais } from "@/components/indicators/FiltrosGlobais";
import { BotaoExportar } from "@/components/indicators/BotaoExportar";
import { VisaoGeral } from "@/components/indicators/VisaoGeral";
import { CaixaLiquidez } from "@/components/indicators/CaixaLiquidez";
import { Rentabilidade } from "@/components/indicators/Rentabilidade";
import { Receitas } from "@/components/indicators/Receitas";
import { Despesas } from "@/components/indicators/Despesas";
import { ContasAReceberPagar } from "@/components/indicators/ContasAReceberPagar";
import { Endividamento } from "@/components/indicators/Endividamento";
import { Projecoes } from "@/components/indicators/Projecoes";
import { Demonstrativos } from "@/components/indicators/Demonstrativos";
import { Auditoria } from "@/components/indicators/Auditoria";

import { useIndicadores } from "@/hooks/useIndicadores";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, BarChart3, LineChart } from "lucide-react";
import { cn } from "@/lib/cn";
import type { IndicadorTabId } from "@/types/dashboard";

const TABS: { id: IndicadorTabId; label: string }[] = [
  { id: "visao-geral", label: "Visão Geral" },
  { id: "caixa-liquidez", label: "Caixa & Liquidez" },
  { id: "rentabilidade", label: "Rentabilidade" },
  { id: "receitas", label: "Receitas" },
  { id: "despesas", label: "Despesas" },
  { id: "contas-receber-pagar", label: "Contas a Receber & Pagar" },
  { id: "endividamento", label: "Endividamento" },
  { id: "projecoes", label: "Projeções" },
  { id: "demonstrativos", label: "Demonstrativos" },
  { id: "auditoria", label: "Auditoria" },
];

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 animate-pulse">
      <div className="h-3 w-24 bg-muted rounded mb-3" />
      <div className="h-7 w-32 bg-muted rounded mb-2" />
      <div className="h-3 w-20 bg-muted/50 rounded" />
    </div>
  );
}

export default function IndicadoresPage() {
  const data = useIndicadores();
  const [tab, setTab] = useState<IndicadorTabId>("visao-geral");

  const renderContent = () => {
    if (data.isLoading) {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/50 bg-card p-6 animate-pulse">
                <div className="h-4 w-40 bg-muted rounded mb-4" />
                <div className="h-48 bg-muted/30 rounded" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (!data.temDados) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl" />
              <BarChart3 className="h-16 w-16 text-muted-foreground relative z-10" />
            </div>
            <p className="text-xl font-semibold text-muted-foreground">Bem-vindo ao Centro de Inteligência Financeira</p>
            <p className="text-sm text-muted-foreground/60 mt-2 max-w-lg text-center leading-relaxed">
              Cadastre seus primeiros lançamentos financeiros para desbloquear análises completas de receitas, despesas, rentabilidade, projeções e muito mais.
            </p>
            <Link
              href="/financial"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Adicionar lançamentos
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      );
    }

    switch (tab) {
      case "visao-geral":
        return <VisaoGeral data={data} />;
      case "caixa-liquidez":
        return <CaixaLiquidez data={data} />;
      case "rentabilidade":
        return <Rentabilidade data={data} />;
      case "receitas":
        return <Receitas data={data} />;
      case "despesas":
        return <Despesas data={data} />;
      case "contas-receber-pagar":
        return <ContasAReceberPagar data={data} />;
      case "endividamento":
        return <Endividamento data={data} />;
      case "projecoes":
        return <Projecoes data={data} />;
      case "demonstrativos":
        return <Demonstrativos data={data} />;
      case "auditoria":
        return <Auditoria data={data} />;
      default:
        return <VisaoGeral data={data} />;
    }
  };

  return (
    <Shell>
      <div className="space-y-6 pb-16">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Indicadores</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Centro de Inteligência Financeira</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Visão completa e integrada dos indicadores financeiros da sua empresa.
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground/40">
              <LineChart className="h-3.5 w-3.5" />
              <span>Lucraí CFO Digital</span>
            </div>
          </div>
        </div>

        <FiltroAtivoIndicator />
        <FiltrosGlobais />

        <Tabs value={tab} onValueChange={(v) => setTab(v as IndicadorTabId)}>
          <div className="overflow-x-auto -mx-1 px-1">
            <TabsList className="w-max min-w-full justify-start">
              {TABS.map((t) => (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className={cn(
                    "whitespace-nowrap text-xs sm:text-sm",
                    tab === t.id && "font-medium"
                  )}
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {TABS.map((t) => (
            <TabsContent key={t.id} value={t.id} className="mt-6">
              {tab === t.id && renderContent()}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {data.temDados && <BotaoExportar />}
    </Shell>
  );
}
