"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/cn";
import { EmptyState } from "./EmptyState";
import { FileText, BarChart3, BookOpen, ScrollText, Search, Landmark } from "lucide-react";
import type { IndicadoresContext, DREItem } from "@/types/dashboard";

interface DemonstrativosProps {
  data: IndicadoresContext;
}

export function Demonstrativos({ data }: DemonstrativosProps) {
  const { demonstrativos: d } = data;
  const [tab, setTab] = useState("dre");

  const tabs = [
    { id: "dre", label: "DRE", icon: FileText },
    { id: "dfc", label: "DFC", icon: BarChart3 },
    { id: "balanco", label: "Balanço", icon: BookOpen },
    { id: "balancete", label: "Balancete", icon: ScrollText },
    { id: "razao", label: "Razão", icon: Search },
  ];

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {tabs.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="gap-1.5">
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="dre" className="mt-4">
          {!d.dre ? (
            <Card>
              <CardContent>
                <EmptyState icon={FileText} title="DRE não disponível" description="A Demonstração do Resultado do Exercício será gerada automaticamente com base nos seus lançamentos financeiros." />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Demonstração do Resultado do Exercício</CardTitle>
                <p className="text-xs text-muted-foreground">Período: {d.dre.periodo}</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left font-medium text-muted-foreground pb-3 w-1/2">Conta</th>
                        <th className="text-right font-medium text-muted-foreground pb-3">Valor</th>
                        <th className="text-right font-medium text-muted-foreground pb-3">% Receita</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.dre.itens.map((item, i) => (
                        <tr key={i} className={cn(
                          "border-b border-border/20",
                          item.tipo === "resultado" && "font-semibold bg-muted/10"
                        )}>
                          <td className={cn("py-2.5", item.tipo === "resultado" && "font-medium")}>
                            {item.conta}
                          </td>
                          <td className={cn(
                            "py-2.5 text-right font-mono",
                            item.valor > 0 ? "text-emerald-400" : item.valor < 0 ? "text-red-400" : ""
                          )}>
                            {formatCurrency(item.valor)}
                          </td>
                          <td className="py-2.5 text-right font-mono">
                            {item.percentualReceita.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border font-bold">
                        <td className="py-3">Lucro Líquido</td>
                        <td className={cn("py-3 text-right font-mono", d.dre.lucroLiquido >= 0 ? "text-emerald-400" : "text-red-400")}>
                          {formatCurrency(d.dre.lucroLiquido)}
                        </td>
                        <td className="py-3 text-right font-mono">
                          {d.dre.receitaLiquida > 0 ? ((d.dre.lucroLiquido / d.dre.receitaLiquida) * 100).toFixed(1) : "0.0"}%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="dfc" className="mt-4">
          <Card>
            <CardContent>
              <EmptyState icon={BarChart3} title="DFC não disponível" description="A Demonstração do Fluxo de Caixa será gerada automaticamente quando os módulos de contas a pagar/receber e investimentos estiverem integrados." />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balanco" className="mt-4">
          <Card>
            <CardContent>
              <EmptyState icon={BookOpen} title="Balanço Patrimonial não disponível" description="O Balanço Patrimonial será gerado quando os módulos de contas a pagar, receber e endividamento estiverem ativos." />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balancete" className="mt-4">
          <Card>
            <CardContent>
              <EmptyState icon={ScrollText} title="Balancete não disponível" description="O Balancete de verificação estará disponível em breve com o plano contábil completo." />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="razao" className="mt-4">
          <Card>
            <CardContent>
              <EmptyState icon={Search} title="Razão Analítico não disponível" description="O Razão Analítico estará disponível em breve com o detalhamento de todas as movimentações por conta contábil." />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
