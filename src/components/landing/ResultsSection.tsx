'use client'

import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { AnimatedSection } from './AnimatedSection'

function StaticMetric({ value, label }: { value: string; label: string }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.5 })

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="text-center" style={{
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
    }}>
      <p className="text-4xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

export function ResultsSection() {
  return (
    <section id="cases" className="bg-muted/30 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
            Capacidades do sistema
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl leading-[1.15]">
            O que você ganha com um CFO Digital
          </h2>
        </AnimatedSection>

        <div className="flex items-center justify-center gap-8 sm:gap-16 mb-16 flex-wrap">
          <StaticMetric value="90 dias" label="de projeção de fluxo de caixa" />
          <div className="h-12 w-px bg-border/30" aria-hidden="true" />
          <StaticMetric value="24/7" label="de monitoramento financeiro" />
          <div className="h-12 w-px bg-border/30" aria-hidden="true" />
          <StaticMetric value="100%" label="baseado em dados reais" />
        </div>

      </div>
    </section>
  )
}
