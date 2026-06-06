'use client'

import { CircleX, CircleCheck } from 'lucide-react'
import { AnimatedSection } from './AnimatedSection'

const traditional = [
  'R$ 25.000 a R$ 50.000 por mês',
  'Disponibilidade limitada ao horário comercial',
  'Análise manual — sujeita a erro humano',
  'Relatórios semanais ou mensais',
  'Sem inteligência preditiva',
  'Decisões baseadas em intuição',
  'Meses para adaptar ao negócio',
  'Limitado à capacidade de uma pessoa',
]

const lucrai = [
  'A partir de R$ 29,90 por mês',
  'Disponível 24/7, 365 dias por ano',
  'Análise automatizada com IA — sem erros',
  'Relatórios em tempo real',
  'Inteligência preditiva avançada',
  'Decisões 100% baseadas em dados',
  'Pronto em minutos após o cadastro',
  'Escala ilimitada com sua empresa',
]

export function ComparisonSection() {
  return (
    <section id="comparacao" className="bg-background py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
            Por que mudar
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl leading-[1.15]">
            CFO Humano vs. CFO Digital Lucraí
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
            A mesma inteligência estratégica. Sem o custo, a limitação e a dependência.
          </p>
        </AnimatedSection>

        <div className="grid gap-8 max-w-4xl mx-auto md:grid-cols-2">
          <AnimatedSection direction="left" className="order-2 md:order-1">
            <div className="rounded-2xl border border-border/50 bg-muted/20 p-8">
              <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-semibold tracking-wider text-muted-foreground mb-4">
                CFO TRADICIONAL
              </span>
              <h3 className="text-xl font-semibold leading-snug text-muted-foreground mb-6">
                O modelo que está ficando para trás
              </h3>
              <ul className="space-y-3">
                {traditional.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CircleX className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>

          <AnimatedSection direction="right" className="order-1 md:order-2">
            <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-primary/10 via-transparent to-transparent pointer-events-none" aria-hidden="true" />
              <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold tracking-wider text-primary mb-4">
                CFO DIGITAL LUCRAÍ
              </span>
              <h3 className="text-xl font-semibold leading-snug mb-6">
                Seu Diretor Financeiro Digital
              </h3>
              <ul className="space-y-3">
                {lucrai.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>

        <AnimatedSection delay={300} className="mt-10 max-w-4xl mx-auto">
          <div className="rounded-xl bg-primary p-6 text-center text-primary-foreground">
            <p className="text-2xl font-bold">Economize até R$ 588.000 por ano comparado a um CFO tradicional</p>
            <p className="mt-1 text-sm opacity-80">Com a mesma inteligência estratégica, sem o custo humano</p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
