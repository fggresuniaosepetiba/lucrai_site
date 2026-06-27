"use client";

import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, CheckCircle, HelpCircle, TrendingUp, TrendingDown } from "lucide-react";

interface DiscountResult {
  lucroLiquidoSimulado: number;
  margemSimulada: number;
  reducaoMargem: number;
  impactoFinanceiro: number;
}

interface Props {
  result: DiscountResult | null;
  simulatedPrice: number;
  onSimulatedPriceChange: (v: number) => void;
  finalMargin: number;
  healthyPrice: number | null;
}

type PriceRange =
  | "abaixo_minimo"
  | "no_minimo"
  | "entre_minimo_saudavel"
  | "no_saudavel"
  | "entre_saudavel_premium"
  | "no_premium"
  | "acima_premium";

function classifyPriceRange(
  simulatedPrice: number,
  healthyPrice: number | null,
  minPrice: number | null,
  premiumPrice: number | null
): PriceRange | null {
  if (!healthyPrice || healthyPrice <= 0) return null;
  const min = minPrice ?? 0;
  const prem = premiumPrice ?? Infinity;

  if (simulatedPrice < min) return "abaixo_minimo";
  if (simulatedPrice === min) return "no_minimo";
  if (simulatedPrice > min && simulatedPrice < healthyPrice) return "entre_minimo_saudavel";
  if (simulatedPrice === healthyPrice) return "no_saudavel";
  if (simulatedPrice > healthyPrice && simulatedPrice < prem) return "entre_saudavel_premium";
  if (simulatedPrice === prem) return "no_premium";
  if (simulatedPrice > prem) return "acima_premium";
  return null;
}

export function DiscountSimulation({ result, simulatedPrice, onSimulatedPriceChange, finalMargin, healthyPrice }: Props) {
  if (!healthyPrice || healthyPrice <= 0) return null;

  const premiumPrice = healthyPrice * 1.15;
  const range = classifyPriceRange(simulatedPrice, healthyPrice, healthyPrice * 0.9, premiumPrice);

  const getDiagnostic = () => {
    if (!result || !range) return null;

    switch (range) {
      case "abaixo_minimo":
        return {
          type: "danger" as const,
          icon: TrendingDown,
          text: result.lucroLiquidoSimulado >= 0
            ? `Este preço está abaixo do preço mínimo recomendado. Sua margem de ${result.margemSimulada.toFixed(1)}% não cobre adequadamente seus custos fixos e riscos operacionais. Não é sustentável a longo prazo.`
            : `Este preço está abaixo do custo efetivo. Sua operação geraria prejuízo de ${formatCurrency(Math.abs(result.lucroLiquidoSimulado))} por unidade. Não é sustentável.`,
        };
      case "no_minimo":
        return {
          type: "warning" as const,
          icon: AlertTriangle,
          text: `Este é exatamente o preço mínimo. Sua margem é de apenas ${result.margemSimulada.toFixed(1)}%, suficiente apenas para cobrir custos operacionais sem gerar lucro significativo.`,
        };
      case "entre_minimo_saudavel":
        return {
          type: "warning" as const,
          icon: AlertTriangle,
          text: `Este preço está acima do mínimo, porém abaixo do preço saudável. Sua margem seria de ${result.margemSimulada.toFixed(1)}%. Avalie se o volume de vendas compensa a redução de margem.`,
        };
      case "no_saudavel":
        return {
          type: "success" as const,
          icon: CheckCircle,
          text: `Preço exatamente no ponto saudável. Margem de ${result.margemSimulada.toFixed(1)}%. Sua operação mantém a rentabilidade ideal.`,
        };
      case "entre_saudavel_premium":
        return {
          type: "success" as const,
          icon: TrendingUp,
          text: `Preço acima do saudável! Sua margem aumenta para ${result.margemSimulada.toFixed(1)}% (${(result.margemSimulada - finalMargin).toFixed(1)}% acima da margem saudável). Ótimo para posicionamento.`,
        };
      case "no_premium":
        return {
          type: "success" as const,
          icon: TrendingUp,
          text: `Preço no nível premium! Margem de ${result.margemSimulada.toFixed(1)}%. Posicionamento de alto valor agregado.`,
        };
      case "acima_premium":
        return {
          type: "success" as const,
          icon: TrendingUp,
          text: `Preço acima do premium! Sua margem sobe para ${result.margemSimulada.toFixed(1)}% (${(result.margemSimulada - finalMargin).toFixed(1)}% acima da saudável). Impacto financeiro positivo de ${formatCurrency(result.impactoFinanceiro)} por unidade.`,
        };
      default:
        return null;
    }
  };

  const diagnostic = getDiagnostic();

  const impactPositive = result ? result.impactoFinanceiro >= 0 : true;
  const marginPositive = result ? result.reducaoMargem <= 0 : true;

  return (
    <div className="rounded-lg border border-border/50 bg-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <HelpCircle className="h-4 w-4 text-purple-400" />
        <p className="text-sm font-semibold">Posso vender por esse preço?</p>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          O cliente quer pagar
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={simulatedPrice > 0 ? formatCurrency(simulatedPrice) : ""}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            if (!raw) { onSimulatedPriceChange(0); return; }
            onSimulatedPriceChange(parseInt(raw) / 100);
          }}
          placeholder="Ex.: R$ 110,00"
          className="flex h-9 w-full max-w-xs rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {result && simulatedPrice > 0 && (
        <div className="animate-fade-in space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Lucro Líquido Simulado</p>
              <p className={`text-sm font-semibold ${result.lucroLiquidoSimulado >= 0 ? "text-foreground" : "text-red-400"}`}>
                {formatCurrency(result.lucroLiquidoSimulado)}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Margem Simulada</p>
              <p className="text-sm font-semibold text-foreground">
                {result.margemSimulada.toFixed(1)}%
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">
                {marginPositive ? "Aumento de Margem" : "Redução de Margem"}
              </p>
              <p className={`text-sm font-semibold ${marginPositive ? "text-emerald-400" : "text-red-400"}`}>
                {marginPositive ? "+" : ""}{(result.reducaoMargem * -1).toFixed(1)}%
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Impacto Financeiro</p>
              <p className={`text-sm font-semibold ${impactPositive ? "text-emerald-400" : "text-red-400"}`}>
                {impactPositive ? "+" : ""}{formatCurrency(result.impactoFinanceiro)}
              </p>
            </div>
          </div>

          {diagnostic && (
            <div
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                diagnostic.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20"
                  : diagnostic.type === "warning"
                  ? "bg-amber-500/10 border-amber-500/20"
                  : "bg-red-500/10 border-red-500/20"
              }`}
            >
              <diagnostic.icon className={`h-5 w-5 shrink-0 mt-0.5 ${
                diagnostic.type === "success" ? "text-emerald-400" :
                diagnostic.type === "warning" ? "text-amber-400" : "text-red-400"
              }`} />
              <p className={`text-sm ${
                diagnostic.type === "success" ? "text-emerald-400" :
                diagnostic.type === "warning" ? "text-amber-400" : "text-red-400"
              }`}>
                {diagnostic.text}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
