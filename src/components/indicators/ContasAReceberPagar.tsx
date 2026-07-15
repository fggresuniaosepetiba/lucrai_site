"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "./KpiCard";
import { formatCurrency } from "@/lib/utils";
import { EmptyState } from "./EmptyState";
import { Receipt, CreditCard, AlertTriangle } from "lucide-react";
import type { IndicadoresContext } from "@/types/dashboard";

interface ContasAReceberPagarProps {
  data: IndicadoresContext;
}

export function ContasAReceberPagar({ data }: ContasAReceberPagarProps) {
  const { contasAReceber: ar, contasAPagar: ap } = data;
  const hasARData = ar.totalAReceber > 0 || ar.vencido > 0;
  const hasAPData = ap.totalAPagar > 0 || ap.vencido > 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4 text-emerald-400" />
              Contas a Receber
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!hasARData ? (
              <EmptyState
                icon={Receipt}
                title="Nenhuma conta a receber"
                description="Os dados de contas a receber aparecerão aqui quando você registrar recebimentos a prazo. Indicadores como PMR e inadimplência serão calculados automaticamente."
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">Total a Receber</p>
                  <p className="text-lg font-bold">{formatCurrency(ar.totalAReceber)}</p>
                </div>
                <div className="rounded-lg bg-red-500/5 p-3 border border-red-500/10">
                  <p className="text-xs text-red-400">Vencido</p>
                  <p className="text-lg font-bold text-red-400">{formatCurrency(ar.vencido)}</p>
                </div>
                <div className="rounded-lg bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">A vencer 30d</p>
                  <p className="text-lg font-bold">{formatCurrency(ar.aVencer30d)}</p>
                </div>
                <div className="rounded-lg bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">PMR</p>
                  <p className="text-lg font-bold">{ar.prazoMedioRecebimento} dias</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-red-400" />
              Contas a Pagar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!hasAPData ? (
              <EmptyState
                icon={CreditCard}
                title="Nenhuma conta a pagar"
                description="Os dados de contas a pagar aparecerão aqui quando você registrar pagamentos a prazo. O PMP será calculado automaticamente com base nos seus lançamentos."
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">Total a Pagar</p>
                  <p className="text-lg font-bold">{formatCurrency(ap.totalAPagar)}</p>
                </div>
                <div className="rounded-lg bg-red-500/5 p-3 border border-red-500/10">
                  <p className="text-xs text-red-400">Vencido</p>
                  <p className="text-lg font-bold text-red-400">{formatCurrency(ap.vencido)}</p>
                </div>
                <div className="rounded-lg bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">A vencer 30d</p>
                  <p className="text-lg font-bold">{formatCurrency(ap.aVencer30d)}</p>
                </div>
                <div className="rounded-lg bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">PMP</p>
                  <p className="text-lg font-bold">{ap.prazoMedioPagamento} dias</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {!hasARData && !hasAPData && (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Os módulos de <strong>Contas a Receber</strong> e <strong>Contas a Pagar</strong> estarão disponíveis em breve.
              Enquanto isso, acompanhe seus recebimentos e pagamentos na página Financeiro.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
