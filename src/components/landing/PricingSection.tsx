'use client'

import { useState } from 'react'
import { Check, X, ChevronDown, ShieldCheck, Zap, Lock, Headphones, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { AnimatedSection } from './AnimatedSection'

interface Plan {
  name: string
  audience: string
  monthly: number
  yearly: number
  popular?: boolean
  features: string[]
  cta: string
  ctaVariant?: 'default' | 'outline' | 'ghost'
}

const plans: Plan[] = [
  {
    name: 'Starter',
    audience: 'Para empreendedores individuais',
    monthly: 29.90,
    yearly: 22.42,
    features: [
      '1 usuário',
      'Fluxo de caixa básico',
      'Dashboard financeiro',
      'Relatório mensal',
      'Suporte por e-mail',
    ],
    cta: 'Começar grátis',
  },
  {
    name: 'Basic',
    audience: 'Para pequenas empresas',
    monthly: 59.90,
    yearly: 44.92,
    features: [
      'Até 5 usuários',
      'Tudo do Starter',
      'Fluxo de caixa preditivo',
      'Alertas inteligentes',
      'Relatórios semanais',
      'Suporte prioritário',
    ],
    cta: 'Começar grátis',
  },
  {
    name: 'Pro',
    audience: 'Para empresas em crescimento',
    monthly: 99.90,
    yearly: 74.92,
    popular: true,
    features: [
      'Até 10 usuários',
      'Tudo do Basic',
      'IA preditiva avançada',
      'Relatórios executivos em PDF',
      'Benchmark setorial',
      'API de integração',
      'Suporte humano dedicado',
    ],
    cta: 'Começar grátis',
    ctaVariant: 'default',
  },
  {
    name: 'Custom',
    audience: 'Para empresas de alto volume',
    monthly: 0,
    yearly: 0,
    features: [
      'Usuários ilimitados',
      'Tudo do Pro',
      'Integrações customizadas',
      'SLA garantido',
      'Onboarding dedicado',
      'Gerente de conta',
      'Relatórios customizados',
    ],
    cta: 'Falar com especialista',
    ctaVariant: 'outline',
  },
]

const allFeatures = [
  'Usuários',
  'Fluxo de caixa básico',
  'Dashboard financeiro',
  'Relatório mensal',
  'Relatórios semanais',
  'Relatórios executivos em PDF',
  'Fluxo de caixa preditivo',
  'IA preditiva avançada',
  'Alertas inteligentes',
  'Benchmark setorial',
  'API de integração',
  'Lançamentos financeiros',
  'Suporte por e-mail',
  'Suporte prioritário',
  'Suporte humano dedicado',
  'Integrações customizadas',
  'SLA garantido',
  'Onboarding dedicado',
  'Gerente de conta',
]

const featureMap: Record<string, (string | boolean)[]> = {
  'Usuários': ['1', 'Até 5', 'Até 10', 'Ilimitados'],
  'Fluxo de caixa básico': [true, true, true, true],
  'Dashboard financeiro': [true, true, true, true],
  'Relatório mensal': [true, false, false, false],
  'Relatórios semanais': [false, true, false, false],
  'Relatórios executivos em PDF': [false, false, true, true],
  'Fluxo de caixa preditivo': [false, true, true, true],
  'IA preditiva avançada': [false, false, true, true],
  'Alertas inteligentes': [false, true, true, true],
  'Benchmark setorial': [false, false, true, true],
  'API de integração': [false, false, true, true],
  'Lançamentos financeiros': [true, true, true, true],
  'Suporte por e-mail': [true, false, false, false],
  'Suporte prioritário': [false, true, false, false],
  'Suporte humano dedicado': [false, false, true, true],
  'Integrações customizadas': [false, false, false, true],
  'SLA garantido': [false, false, false, true],
  'Onboarding dedicado': [false, false, false, true],
  'Gerente de conta': [false, false, false, true],
}

const guarantees = [
  { icon: ShieldCheck, text: 'Dados seguros com padrão bancário' },
  { icon: Zap, text: 'Análise em tempo real' },
  { icon: Lock, text: 'Conformidade LGPD total' },
  { icon: Headphones, text: 'Suporte por pessoas reais' },
  { icon: RotateCcw, text: 'Cancele a qualquer momento' },
]

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [showComparison, setShowComparison] = useState(false)

  const formatPrice = (value: number) => {
    if (value === 0) return 'Sob consulta'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const PlanCard = ({ plan }: { plan: Plan }) => {
    const price = isAnnual ? plan.yearly : plan.monthly

    return (
      <div className={`relative rounded-2xl border border-border/50 bg-card p-8 shadow-sm transition-all duration-200 hover:shadow-md h-full flex flex-col ${
        plan.popular ? 'border-2 border-primary bg-primary/5' : ''
      }`}>
        {plan.popular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge>Mais popular</Badge>
          </div>
        )}
        <div className="mb-6">
          <p className="text-lg font-bold">{plan.name}</p>
          <p className="text-xs text-muted-foreground mt-1">{plan.audience}</p>
        </div>
        <div className="mb-6">
          {price === 0 ? (
            <p className="text-3xl font-bold">Sob consulta</p>
          ) : (
            <div className="flex items-baseline gap-1">
              <p className="text-4xl font-bold">{formatPrice(price)}</p>
              <span className="text-sm text-muted-foreground">/mês</span>
            </div>
          )}
          {isAnnual && plan.monthly > 0 && (
            <p className="text-xs text-emerald-500 mt-1">Economia de 25% no plano anual</p>
          )}
        </div>
        <ul className="space-y-3 mb-8 flex-1" role="list">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              {f}
            </li>
          ))}
        </ul>
        <Button
          variant={plan.popular ? 'default' : plan.ctaVariant || 'outline'}
          className="w-full mt-auto"
          asChild
        >
          <a href="/cadastro">{plan.cta}</a>
        </Button>
      </div>
    )
  }

  return (
    <section id="planos" className="bg-muted/30 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
            Planos
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl leading-[1.15]">
            Planos que crescem com você
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Comece grátis. Evolua conforme seu negócio cresce.
          </p>
        </AnimatedSection>

        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>Mensal</span>
          <Switch
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
            aria-label="Alternar para plano anual"
          />
          <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
            Anual
            <span className="ml-1.5 text-xs text-emerald-500">−25%</span>
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {plans.map((plan) => (
            <AnimatedSection key={plan.name} className="h-full">
              <PlanCard plan={plan} />
            </AnimatedSection>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            aria-expanded={showComparison}
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${showComparison ? 'rotate-180' : ''}`} aria-hidden="true" />
            Ver comparação completa de recursos
          </button>

          {showComparison && (
            <div className="mt-8 overflow-x-auto animate-fade-in">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 pr-4 text-muted-foreground font-medium">Recurso</th>
                    {plans.map((p) => (
                      <th key={p.name} className={`py-3 px-4 text-left font-medium ${p.popular ? 'text-primary' : ''}`}>
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allFeatures.map((feature) => {
                    const values = featureMap[feature]
                    return (
                      <tr key={feature} className="border-b border-border/20">
                        <td className="py-3 pr-4 text-muted-foreground">{feature}</td>
                        {values.map((v, i) => (
                          <td key={i} className="py-3 px-4">
                            {v === true ? (
                              <Check className="h-4 w-4 text-primary" aria-label="Incluso" />
                            ) : v === false ? (
                              <X className="h-4 w-4 text-muted-foreground/40" aria-label="Não incluso" />
                            ) : (
                              <span className="text-muted-foreground">{String(v)}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 mt-16">
          {guarantees.map((g) => (
            <div key={g.text} className="flex items-center gap-2 text-sm text-muted-foreground">
              <g.icon className="h-4 w-4 text-primary" aria-hidden="true" />
              {g.text}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
