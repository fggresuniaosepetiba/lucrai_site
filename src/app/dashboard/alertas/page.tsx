"use client";

import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/shell";
import { FiltroAtivoIndicator } from "@/components/shared/FiltroAtivoIndicator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useDadosFiltrados } from "@/hooks/useDadosFiltrados";
import { calcularAlertasAtivos, getAlertasDispensados, dispensarAlerta, restaurarAlerta } from "@/services/alertasService";
import { AlertOctagon, AlertTriangle, TrendingUp, ShieldCheck, BarChart3, ChevronDown, X, ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import Link from "next/link";
import type { AlertaItem, AlertaTipo } from "@/types/dashboard";

function AlertCard({ alerta, onDismiss, onRestore, isDismissed }: {
  alerta: AlertaItem;
  onDismiss: (id: string) => void;
  onRestore: (id: string) => void;
  isDismissed: boolean;
}) {
  const [animating, setAnimating] = useState(false);

  const severityConfig: Record<AlertaTipo, { border: string; bg: string; icon: typeof AlertOctagon; badgeClass: string; badgeLabel: string }> = {
    critico: {
      border: "border-l-red-500",
      bg: "bg-red-500/5",
      icon: AlertOctagon,
      badgeClass: "bg-destructive/15 text-destructive",
      badgeLabel: "Crítico",
    },
    atencao: {
      border: "border-l-yellow-500",
      bg: "bg-yellow-500/5",
      icon: AlertTriangle,
      badgeClass: "bg-yellow-500/15 text-yellow-600",
      badgeLabel: "Atenção",
    },
    positivo: {
      border: "border-l-green-500",
      bg: "bg-green-500/5",
      icon: TrendingUp,
      badgeClass: "bg-green-500/15 text-green-600",
      badgeLabel: "Positivo",
    },
  };

  const config = severityConfig[alerta.tipo];
  const Icon = config.icon;

  if (animating) return null;

  return (
    <div
      className={cn(
        "rounded-xl p-5 border-l-4 transition-all duration-300",
        config.border,
        config.bg,
        isDismissed && "opacity-60"
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span className="font-medium text-sm">{alerta.titulo}</span>
        </div>
        <Badge variant="outline" className={cn("text-[10px] px-2 py-0", config.badgeClass)}>
          {config.badgeLabel}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
        {alerta.descricao}
      </p>

      <div className="flex flex-wrap gap-2 mt-3">
        {alerta.dadosContextuais.map((dado, idx) => (
          <span
            key={idx}
            className="bg-muted/40 rounded-md px-2 py-1 text-xs font-mono"
          >
            {dado.label}: {dado.valor}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4">
        <Link
          href={alerta.acaoHref}
          className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
        >
          <ArrowRight className="h-3 w-3" />
          {alerta.acaoLabel}
        </Link>

        {isDismissed ? (
          <button
            onClick={() => onRestore(alerta.id)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Restaurar
          </button>
        ) : (
          <button
            onClick={() => {
              setAnimating(true);
              setTimeout(() => {
                onDismiss(alerta.id);
              }, 300);
            }}
            className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            title="Dispensar alerta"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function AlertasPage() {
  const dados = useDadosFiltrados();
  const [alertas, setAlertas] = useState<AlertaItem[]>([]);
  const [dispensadosIds, setDispensadosIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("todos");
  const [historicoOpen, setHistoricoOpen] = useState(false);

  useEffect(() => {
    if (!dados || dados.isLoading) return;
    getAlertasDispensados().then((disp) => {
      setDispensadosIds(disp);
      const resultado = calcularAlertasAtivos(
        {
          lancamentos: dados.lancamentos,
          entradas: dados.entradas,
          saidas: dados.saidas,
          saldoAtual: dados.saldoAtual,
          saldoProjetado: dados.saldoProjetado,
          margemLiquida: dados.margemLiquida,
          recebimentosPrevistos: dados.recebimentosPrevistos,
          pagamentosPrevistos: dados.pagamentosPrevistos,
        },
        disp
      );
      setAlertas(resultado);
      setLoaded(true);
    });
  }, [dados]);

  const handleDismiss = async (id: string) => {
    await dispensarAlerta(id);
    setAlertas((prev) => prev.filter((a) => a.id !== id));
    setDispensadosIds((prev) => new Set([...prev, id]));
  };

  const handleRestore = async (id: string) => {
    await restaurarAlerta(id);
    setDispensadosIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    const resultado = calcularAlertasAtivos(
      {
        lancamentos: dados.lancamentos,
        entradas: dados.entradas,
        saidas: dados.saidas,
        saldoAtual: dados.saldoAtual,
        saldoProjetado: dados.saldoProjetado,
        margemLiquida: dados.margemLiquida,
        recebimentosPrevistos: dados.recebimentosPrevistos,
        pagamentosPrevistos: dados.pagamentosPrevistos,
      },
      dispensadosIds
    );
    setAlertas(resultado);
  };

  const criticos = alertas.filter((a) => a.tipo === "critico");
  const atencao = alertas.filter((a) => a.tipo === "atencao");
  const positivos = alertas.filter((a) => a.tipo === "positivo");

  const dispensadosList = [...dispensadosIds];

  const hasData = dados.lancamentos.length > 0;

  const criticoCount = criticos.length;
  const atencaoCount = atencao.length;
  const positivoCount = positivos.length;

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Alertas Inteligentes</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Alertas Inteligentes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitoramento contínuo da saúde financeira. Atualizado com base nos seus lançamentos.
          </p>
        </div>

        <FiltroAtivoIndicator />

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-destructive/5 border-destructive/10">
            <CardContent className="p-4 flex items-center gap-4">
              <AlertOctagon className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold text-destructive">{criticoCount}</p>
                <p className="text-xs text-muted-foreground">alertas críticos</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-500/5 border-yellow-500/10">
            <CardContent className="p-4 flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-500">{atencaoCount}</p>
                <p className="text-xs text-muted-foreground">requerem atenção</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-500/5 border-green-500/10">
            <CardContent className="p-4 flex items-center gap-4">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-500">{positivoCount}</p>
                <p className="text-xs text-muted-foreground">insights positivos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {!hasData && loaded ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-14 w-14 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold text-muted-foreground">Dados insuficientes</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-md text-center">
                Adicione lançamentos financeiros para que o Lucraí possa monitorar sua operação.
              </p>
              <Link
                href="/financial"
                className="mt-4 text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                Adicionar lançamentos <ChevronRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        ) : hasData && loaded && alertas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShieldCheck className="h-14 w-14 text-green-500 mb-4" />
              <p className="text-lg font-semibold text-muted-foreground">Tudo em ordem</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-md text-center">
                Nenhum alerta financeiro identificado. Continue monitorando sua operação.
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                Alertas são gerados automaticamente com base nos seus lançamentos.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="todos">Todos ({alertas.length})</TabsTrigger>
              <TabsTrigger value="criticos">Críticos ({criticoCount})</TabsTrigger>
              <TabsTrigger value="atencao">Atenção ({atencaoCount})</TabsTrigger>
              <TabsTrigger value="positivos">Positivos ({positivoCount})</TabsTrigger>
              <TabsTrigger value="dispensados">Dispensados ({dispensadosList.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="todos" className="space-y-3 mt-4">
              {alertas.map((alerta) => (
                <AlertCard
                  key={alerta.id}
                  alerta={alerta}
                  onDismiss={handleDismiss}
                  onRestore={handleRestore}
                  isDismissed={false}
                />
              ))}
            </TabsContent>

            <TabsContent value="criticos" className="space-y-3 mt-4">
              {criticos.map((alerta) => (
                <AlertCard
                  key={alerta.id}
                  alerta={alerta}
                  onDismiss={handleDismiss}
                  onRestore={handleRestore}
                  isDismissed={false}
                />
              ))}
            </TabsContent>

            <TabsContent value="atencao" className="space-y-3 mt-4">
              {atencao.map((alerta) => (
                <AlertCard
                  key={alerta.id}
                  alerta={alerta}
                  onDismiss={handleDismiss}
                  onRestore={handleRestore}
                  isDismissed={false}
                />
              ))}
            </TabsContent>

            <TabsContent value="positivos" className="space-y-3 mt-4">
              {positivos.map((alerta) => (
                <AlertCard
                  key={alerta.id}
                  alerta={alerta}
                  onDismiss={handleDismiss}
                  onRestore={handleRestore}
                  isDismissed={false}
                />
              ))}
            </TabsContent>

            <TabsContent value="dispensados" className="space-y-3 mt-4">
              {dispensadosList.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum alerta dispensado.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Alertas dispensados aparecerão aqui quando houver histórico.
                </p>
              )}
            </TabsContent>
          </Tabs>
        )}

        <Collapsible
          open={historicoOpen}
          onOpenChange={setHistoricoOpen}
          className="rounded-xl border border-border/50"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-sm font-medium hover:bg-muted/30 transition-colors rounded-xl">
            <span>Histórico dos últimos 30 dias</span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", historicoOpen && "rotate-180")} />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            <p className="text-xs text-muted-foreground text-center py-4">
              O histórico completo de alertas será exibido aqui.
            </p>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Shell>
  );
}
