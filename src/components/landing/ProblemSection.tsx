'use client'

import { FileSearch, HelpCircle, TrendingDown } from 'lucide-react'
import { AnimatedSection } from './AnimatedSection'

const problems = [
  {
    icon: FileSearch,
    headline: 'Decisões com dados atrasados',
    text: 'Você descobre que o mês foi ruim só quando o contador fecha o balanço. Nessa altura, as decisões certas já eram da semana passada.',
  },
  {
    icon: HelpCircle,
    headline: 'Sem saber quanto pode investir',
    text: 'Oportunidades surgem, mas você não sabe se o fluxo de caixa aguenta. Então espera. E perde.',
  },
  {
    icon: TrendingDown,
    headline: 'Consultores caros, resultados genéricos',
    text: 'Paga R$ 5.000 por mês por relatórios do passado que não te dizem o que fazer agora.',
  },
]

export function ProblemSection() {
  return (
    <section id="problema" className="bg-background py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
            O problema real
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl leading-[1.15]">
            Você ainda toma decisões financeiras no escuro?
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
            A maioria das PMEs brasileiras gerencia finanças com planilhas e intuição. O resultado: decisões atrasadas, crises que não vêm, oportunidades perdidas.
          </p>
        </AnimatedSection>

        <div className="grid gap-8 md:grid-cols-3">
          {problems.map((problem, i) => (
            <AnimatedSection key={problem.headline} delay={i * 150} className="h-full">
              <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 h-full flex flex-col">
                <problem.icon className="h-12 w-12 text-muted-foreground mb-6 shrink-0" aria-hidden="true" />
                <h3 className="text-xl font-semibold leading-snug mb-3">{problem.headline}</h3>
                <p className="text-base leading-relaxed text-muted-foreground flex-1">{problem.text}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={450} className="mt-12">
          <p className="text-lg font-medium text-center max-w-2xl mx-auto">
            Com o Lucraí, você vê o futuro financeiro da sua empresa — antes que ele aconteça.
          </p>
        </AnimatedSection>
      </div>
    </section>
  )
}
