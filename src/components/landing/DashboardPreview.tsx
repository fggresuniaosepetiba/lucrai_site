'use client'

import { AlertTriangle, Lightbulb } from 'lucide-react'
import { useCountAnimation } from '@/hooks/useCountAnimation'

function AnimatedMetric({ value, label, suffix, isActive }: { value: number; label: string; suffix?: string; isActive: boolean }) {
  const count = useCountAnimation(value, 1200, isActive)
  return (
    <div className="bg-muted/30 rounded-xl border border-border/50 p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">
        {suffix ? `${count}${suffix}` : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(count)}
      </p>
    </div>
  )
}

export function DashboardPreview({ isActive, compact }: { isActive: boolean; compact?: boolean }) {
  return (
    <div className="rounded-2xl border bg-card shadow-2xl overflow-hidden">
      <div className="flex h-12 items-center justify-center bg-muted/50 gap-1.5 px-4">
        <div className="flex gap-1.5 absolute left-4">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span className="h-2 w-2 rounded-full bg-yellow-500" />
          <span className="h-2 w-2 rounded-full bg-green-500" />
        </div>
        <span className="text-xs text-muted-foreground">Lucraí — Dashboard Financeiro</span>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <AnimatedMetric value={847320} label="Receita do mês" isActive={isActive} />
          <AnimatedMetric value={523180} label="Despesas" isActive={isActive} />
          <AnimatedMetric value={382} label="Margem líquida" suffix="%" isActive={isActive} />
          <div className="bg-muted/30 rounded-xl border border-border/50 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Saldo projetado</p>
            <p className="mt-1 text-lg font-bold">R$ 2,4M</p>
            <p className="text-xs text-muted-foreground">próximo trimestre</p>
          </div>
        </div>
        {!compact && (
          <div className="space-y-2">
            <div className="flex items-start gap-3 rounded-lg bg-yellow-500/10 p-3 border border-yellow-500/20">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
              <p className="text-xs text-muted-foreground">Custos operacionais subiram 15% — Revise fornecedores este mês.</p>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-blue-500/10 p-3 border border-blue-500/20">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              <p className="text-xs text-muted-foreground">Margem líquida 8% acima da média — Top 15% do mercado.</p>
              <span className="relative ml-auto flex h-2 w-2 mt-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
