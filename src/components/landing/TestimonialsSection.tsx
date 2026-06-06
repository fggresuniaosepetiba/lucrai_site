'use client'

import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { AnimatedSection } from './AnimatedSection'

const testimonials = [
  {
    quote: 'Antes do Lucraí, eu olhava para o extrato bancário e tentava adivinhar se tinha dinheiro para contratar alguém. Agora tenho uma projeção de 90 dias que me diz exatamente o que posso fazer.',
    name: 'Mariana Costa',
    role: 'Fundadora e CEO',
    company: 'Studio MC Design',
    segment: 'Criativo/Agência',
    initials: 'MC',
  },
  {
    quote: 'O alerta de fluxo negativo chegou 3 semanas antes do problema acontecer. Consegui renegociar prazos com fornecedores e evitar uma crise que estava chegando sem eu saber.',
    name: 'João Paulo Ferreira',
    role: 'Diretor Financeiro',
    company: 'Construbase Engenharia',
    segment: 'Construção Civil',
    initials: 'JF',
  },
  {
    quote: 'Apresentei os relatórios do Lucraí para dois investidores anjos. Eles ficaram impressionados com a qualidade das projeções. Fechamos um aporte de R$ 800k em 6 semanas.',
    name: 'Beatriz Lemos',
    role: 'Co-fundadora',
    company: 'NutriAI Soluções',
    segment: 'Foodtech / SaaS',
    initials: 'BL',
  },
]

export function TestimonialsSection() {
  return (
    <section id="depoimentos" className="bg-background py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
            Depoimentos
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl leading-[1.15]">
            Empresas que transformaram suas finanças
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Não acredite apenas em nós.
          </p>
        </AnimatedSection>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <AnimatedSection key={t.name} delay={i * 150}>
              <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-sm h-full flex flex-col">
                <div className="flex gap-0.5 mb-4" aria-label="5 estrelas">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="text-base leading-relaxed flex-1 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}, {t.company}</p>
                    <Badge variant="secondary" className="mt-1 text-[10px]">{t.segment}</Badge>
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
