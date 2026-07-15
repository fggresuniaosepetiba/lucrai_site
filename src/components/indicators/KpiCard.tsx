"use client";

import { cn } from "@/lib/cn";
import { formatCurrency, formatCompactCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SparklinePoint {
  periodo: string;
  valor: number;
}

interface KpiCardProps {
  label: string;
  value: number;
  format?: "currency" | "percent" | "number" | "days";
  variant?: "default" | "success" | "warning" | "danger" | "info";
  variation?: number;
  variationLabel?: string;
  sparkline?: SparklinePoint[];
  onClick?: () => void;
  compact?: boolean;
}

function formatValue(value: number, format: KpiCardProps["format"] = "currency"): string {
  switch (format) {
    case "percent":
      return `${value.toFixed(1)}%`;
    case "days":
      return `${Math.round(value)} dias`;
    case "number":
      return value.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
    case "currency":
    default:
      return formatCompactCurrency(value).display;
  }
}

export function KpiCard({ label, value, format = "currency", variant = "default", variation, variationLabel, sparkline, onClick, compact }: KpiCardProps) {
  const variantStyles = {
    default: "border-border/50",
    success: "border-l-emerald-500",
    warning: "border-l-yellow-500",
    danger: "border-l-red-500",
    info: "border-l-blue-500",
  };

  const VariationIcon = variation === undefined ? null : variation > 0 ? TrendingUp : variation < 0 ? TrendingDown : Minus;
  const variationColor = variation === undefined ? "" : variation > 0 ? "text-emerald-400" : variation < 0 ? "text-red-400" : "text-muted-foreground";

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-xl border bg-card p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-default border-l-4",
        variantStyles[variant],
        onClick && "cursor-pointer",
        compact && "p-3"
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-muted-foreground font-medium truncate">{label}</p>
      </div>

      <div className="flex items-baseline gap-2">
        <span className={cn(
          "font-bold tracking-tight",
          compact ? "text-lg" : "text-2xl"
        )}>
          {formatValue(value, format)}
        </span>
        {variation !== undefined && variation !== 0 && (
          <span className={cn("flex items-center gap-0.5 text-xs font-medium", variationColor)}>
            {VariationIcon && <VariationIcon className="h-3 w-3" />}
            {Math.abs(variation).toFixed(1)}%
          </span>
        )}
      </div>

      {variationLabel && variation !== undefined && (
        <p className="text-[10px] text-muted-foreground mt-0.5">{variationLabel}</p>
      )}

      {sparkline && sparkline.length > 1 && (
        <div className="absolute bottom-2 right-3 w-20 h-8 opacity-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkline}>
              <Line type="monotone" dataKey="valor" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
