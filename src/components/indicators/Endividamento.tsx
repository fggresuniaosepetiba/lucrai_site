"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "./KpiCard";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/cn";
import { EmptyState } from "./EmptyState";
import { Banknote, AlertTriangle } from "lucide-react";
import type { IndicadoresContext } from "@/types/dashboard";

interface EndividamentoProps {
  data: IndicadoresContext;
}

export function Endividamento({ data }: EndividamentoProps) {
  const { endividamento: e } = data;
  const hasData = e.dividaTotal > 0 || e.alavancagem > 0;

  return (
    <div className="space-y-6">
      {!hasData ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Banknote}
              title="Nenhum endividamento registrado"
              description="Os indicadores de endividamento, alavancagem e cobertura de juros serão exibidos aqui quando você registrar suas dívidas e financiamentos no sistema."
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Dívida Total" value={e.dividaTotal} variant="danger" />
            <KpiCard label="Dívida Curto Prazo" value={e.dividaCurtoPrazo} variant="warning" />
            <KpiCard label="Dívida Longo Prazo" value={e.dividaLongoPrazo} variant="default" />
            <KpiCard label="Dívida Líquida" value={e.dividaLiquida} variant={e.dividaLiquida > 0 ? "warning" : "success"} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Alavancagem</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={cn("text-2xl font-bold", e.alavancagem > 3 ? "text-red-400" : e.alavancagem > 1 ? "text-yellow-400" : "text-emerald-400")}>
                  {e.alavancagem.toFixed(2)}x
                </p>
                <p className="text-xs text-muted-foreground mt-1">Dívida Líquida / EBITDA</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cobertura de Juros</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={cn("text-2xl font-bold", e.coberturaJuros > 3 ? "text-emerald-400" : e.coberturaJuros > 1 ? "text-yellow-400" : "text-red-400")}>
                  {e.coberturaJuros.toFixed(2)}x
                </p>
                <p className="text-xs text-muted-foreground mt-1">EBIT / Despesas Financeiras</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Comprometimento da Receita</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={cn("text-2xl font-bold", e.comprometimentoReceita > 30 ? "text-red-400" : e.comprometimentoReceita > 15 ? "text-yellow-400" : "text-emerald-400")}>
                  {e.comprometimentoReceita.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">da receita comprometida com dívidas</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardContent className="p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
          <p className="text-sm text-muted-foreground">
            O módulo de <strong>Endividamento</strong> estará disponível em breve com integração automática aos seus registros de dívidas e financiamentos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
