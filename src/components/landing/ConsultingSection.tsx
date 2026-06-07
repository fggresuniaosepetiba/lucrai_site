'use client'

import { Check, MessageCircle, Clock, DollarSign, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedSection } from './AnimatedSection'

const WHATSAPP_CONSULTING_NUMBER = '5500000000000'
const WHATSAPP_CONSULTING_MESSAGE = 'Olá! Gostaria de agendar uma conversa gratuita com um especialista sobre o Lucraí.'
const WHATSAPP_CONSULTING_URL = `https://wa.me/${WHATSAPP_CONSULTING_NUMBER}?text=${encodeURIComponent(WHATSAPP_CONSULTING_MESSAGE)}`

const benefits = [
  'Diagnóstico inicial gratuito',
  'Orientação personalizada',
  'Sem compromisso',
  'Sem pressão comercial',
  'Atendimento humano especializado',
]

const steps = [
  { number: '1', title: 'Entendemos seu negócio.' },
  { number: '2', title: 'Identificamos possíveis gargalos financeiros.' },
  { number: '3', title: 'Mostramos como o Lucraí pode ajudar.' },
  { number: '4', title: 'Indicamos a estrutura mais adequada para sua realidade.' },
]

export function ConsultingSection() {
  return (
    <>
      <section className="bg-muted/30 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
              Consultoria gratuita
            </span>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl leading-[1.15]">
              Ainda não sabe qual plano escolher?
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground max-w-3xl mx-auto">
              Converse gratuitamente com um especialista da Lucraí. Entendemos sua operação, seus desafios e
              indicamos a estrutura mais adequada para o seu negócio, sem compromisso e sem custo.
            </p>
          </AnimatedSection>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 max-w-4xl mx-auto mb-16">
            {benefits.map((benefit, i) => (
              <AnimatedSection key={benefit} delay={i * 80} className="h-full">
                <div className="rounded-xl border border-border/50 bg-card px-4 py-5 h-full flex items-center gap-3 shadow-sm">
                  <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="text-sm text-muted-foreground leading-snug">{benefit}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={200}>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 md:p-12 max-w-4xl mx-auto relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-primary/10 via-transparent to-transparent pointer-events-none" aria-hidden="true" />
              <div className="relative">
                <h3 className="text-2xl font-bold leading-snug mb-4">
                  Nem toda empresa precisa do plano mais caro.
                </h3>
                <p className="text-base leading-relaxed text-muted-foreground max-w-2xl mb-8">
                  Nosso objetivo não é empurrar uma solução. Queremos entender o momento atual da sua empresa
                  e indicar aquilo que realmente faz sentido para o seu crescimento.
                </p>
                <Button size="lg" className="gap-2" asChild>
                  <a href={WHATSAPP_CONSULTING_URL} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-5 w-5" aria-hidden="true" />
                    Falar com um especialista
                  </a>
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl leading-[1.15]">
              Diagnóstico Financeiro Gratuito
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground max-w-3xl mx-auto">
              Receba uma análise inicial da sua operação e descubra oportunidades para melhorar controle
              financeiro, previsibilidade de caixa e tomada de decisão.
            </p>
          </AnimatedSection>

          <div className="grid gap-6 md:grid-cols-4 max-w-4xl mx-auto mb-16">
            {steps.map((step, i) => (
              <AnimatedSection key={step.number} delay={i * 100} className="h-full">
                <div className="rounded-xl border border-border/50 bg-card p-6 h-full flex flex-col items-start gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary shrink-0">
                    {step.number}
                  </span>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.title}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={200}>
            <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
              <div className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-card px-5 py-3">
                <Clock className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-xs text-muted-foreground">Tempo médio</p>
                  <p className="text-sm font-semibold">15 a 20 minutos</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-card px-5 py-3">
                <DollarSign className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-xs text-muted-foreground">Investimento</p>
                  <p className="text-sm font-semibold">R$ 0,00</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-card px-5 py-3">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-xs text-muted-foreground">Compromisso</p>
                  <p className="text-sm font-semibold">Nenhum</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <a href={WHATSAPP_CONSULTING_URL} target="_blank" rel="noopener noreferrer">
                  Quero meu diagnóstico gratuito
                </a>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
