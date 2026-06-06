'use client'

import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { useCountAnimation } from '@/hooks/useCountAnimation'
import { Badge } from '@/components/ui/badge'
import { AnimatedSection } from './AnimatedSection'

function AnimatedBigNumber({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.5 })
  const count = useCountAnimation(value, 1200, isVisible)

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="text-center">
      <p className="text-4xl font-bold">
        {count}{suffix}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

const cases = [
  {
    segment: 'Varejo',
    result: '−23% em custos operacionais',
    period: 'em 90 dias',
    quote: 'Descobrimos que estávamos pagando por três fornecedores de embalagem sem comparar preço. O Lucraí nos mostrou isso automaticamente.',
    author: 'Carlos M.',
    role: 'Diretor Comercial, Rede de Franquias SP',
    initials: 'CM',
  },
  {
    segment: 'Construção Civil',
    result: 'Crédito aprovado em 15 dias',
    period: 'com relatórios Lucraí',
    quote: 'O banco pediu DRE e fluxo de caixa projetado. Em 10 minutos eu tinha tudo pronto. Nunca tinha sido tão fácil.',
    author: 'Ana P.',
    role: 'CEO, Construtora Horizonte',
    initials: 'AP',
  },
  {
    segment: 'Tecnologia/SaaS',
    result: '2 consultores substituídos',
    period: 'com mais precisão',
    quote: 'Pagávamos R$ 8.000/mês em consultoria financeira e os relatórios chegavam atrasados. Com o Lucraí, tenho dados melhores por R$ 99,90.',
    author: 'Rafael S.',
    role: 'Fundador, TechFlow',
    initials: 'RS',
  },
]

export function ResultsSection() {
  return (
    <section id="cases" className="bg-muted/30 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
            Resultados reais
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl leading-[1.15]">
            O que acontece quando você tem um CFO Digital
          </h2>
        </AnimatedSection>

        <div className="flex items-center justify-center gap-8 sm:gap-16 mb-16 flex-wrap">
          <AnimatedBigNumber value={3200} suffix="+" label="empresas ativas" />
          <div className="h-12 w-px bg-border/30" aria-hidden="true" />
          <AnimatedBigNumber value={28} suffix=" Bi+" label="em transações analisadas" />
          <div className="h-12 w-px bg-border/30" aria-hidden="true" />
          <AnimatedBigNumber value={38} suffix="%" label="de redução média de custos" />
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {cases.map((c, i) => (
            <AnimatedSection key={c.author} delay={i * 150}>
              <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1">
                <Badge variant="secondary" className="mb-4">{c.segment}</Badge>
                <p className="text-2xl font-bold text-primary mb-1">{c.result}</p>
                <p className="text-sm text-muted-foreground mb-4">{c.period}</p>
                <blockquote className="text-sm leading-relaxed text-muted-foreground border-l-2 border-primary/30 pl-4 mb-4">
                  &ldquo;{c.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {c.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{c.author}</p>
                    <p className="text-xs text-muted-foreground">{c.role}</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
