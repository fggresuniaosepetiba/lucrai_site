'use client'

import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedSection } from './AnimatedSection'

export function FinalCtaSection() {
  return (
    <section className="bg-primary py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <AnimatedSection>
          <h2 className="text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl">
            Comece hoje. Seu CFO Digital está pronto.
          </h2>
          <p className="mt-4 text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Empresas de todo o Brasil já estão tomando decisões financeiras com inteligência — e não com intuição.
          </p>
          <div className="mt-10">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 px-8 h-12 text-base gap-2"
              asChild
            >
              <a href="/cadastro?origem=cta_final">
                Criar minha conta grátis
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </a>
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-primary-foreground/70">
            <span>Sem cartão de crédito</span>
            <span aria-hidden="true">·</span>
            <span>14 dias grátis</span>
            <span aria-hidden="true">·</span>
            <span>Cancele quando quiser</span>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
