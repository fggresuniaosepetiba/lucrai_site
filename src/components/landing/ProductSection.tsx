'use client'

import { LayoutDashboard, TrendingUp, Bell, FileText, Check } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { AnimatedSection } from './AnimatedSection'

const tabs = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    badge: 'Visão em tempo real',
    headline: 'Saúde financeira da sua empresa, de um relance',
    body: 'Acompanhe receitas, despesas, margem e fluxo em um painel unificado. Sem abrir planilha. Sem esperar relatório.',
    benefits: [
      'KPIs financeiros em tempo real',
      'Comparativo com períodos anteriores',
      'Alertas de desvio automáticos',
      'Projeções baseadas em histórico',
    ],
  },
  {
    value: 'fluxo',
    label: 'Fluxo de Caixa',
    icon: TrendingUp,
    badge: 'Visão preditiva',
    headline: 'Saiba hoje o que vai acontecer amanhã',
    body: 'O Lucraí analisa seu histórico, sazonalidade e tendências para projetar seu fluxo de caixa com até 90 dias de antecedência.',
    benefits: [
      'Projeções para os próximos 30, 60 e 90 dias',
      'Alertas de saldo mínimo',
      'Simulação de cenários (otimista, realista, pessimista)',
      'Planejamento de investimentos',
    ],
  },
  {
    value: 'alertas',
    label: 'Alertas Inteligentes',
    icon: Bell,
    badge: 'IA Preditiva',
    headline: 'Sua IA financeira detecta problemas antes de você',
    body: 'O Lucraí monitora padrões, detecta anomalias e envia alertas contextualizados com recomendações de ação.',
    benefits: [
      'Detecção de gastos anômalos',
      'Alerta de inadimplência',
      'Oportunidades de redução de custo',
      'Insights de benchmark setorial',
    ],
  },
  {
    value: 'relatorios',
    label: 'Relatórios',
    icon: FileText,
    badge: 'Relatórios executivos',
    headline: 'Apresente suas finanças com confiança',
    body: 'Gere relatórios profissionais em PDF com um clique. Prontos para apresentar a sócios, bancos ou investidores.',
    benefits: [
      'DRE gerencial automático',
      'Relatório de fluxo de caixa',
      'Análise de lucratividade por produto/serviço',
      'Exportação em PDF e Excel',
    ],
  },
]

export function ProductSection() {
  return (
    <section id="produto" className="bg-muted/30 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
            O produto
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl leading-[1.15]">
            Conheça seu CFO Digital
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
            Quatro módulos integrados. Uma visão completa da saúde financeira da sua empresa.
          </p>
        </AnimatedSection>

        <Tabs defaultValue="dashboard" className="w-full">
          <div className="flex justify-center overflow-x-auto pb-6">
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="gap-2 whitespace-nowrap">
                  <tab.icon className="h-4 w-4" aria-hidden="true" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-0 animate-fade-in">
              <AnimatedSection>
                <div className="grid gap-12 lg:grid-cols-2 items-center">
                  <div className="space-y-6">
                    <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {tab.badge}
                    </span>
                    <h3 className="text-2xl font-semibold leading-snug md:text-3xl">
                      {tab.headline}
                    </h3>
                    <p className="text-lg leading-relaxed text-muted-foreground">
                      {tab.body}
                    </p>
                    <ul className="space-y-3">
                      {tab.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-3">
                          <Check className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                          <span className="text-sm text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="link" className="px-0 text-primary" asChild>
                      <a href="/cadastro">Ver demonstração completa →</a>
                    </Button>
                  </div>
                  <div className="rounded-2xl border bg-card shadow-xl overflow-hidden">
                    <div className="flex h-12 items-center justify-center bg-muted/50">
                      <span className="text-xs text-muted-foreground">Lucraí — {tab.label}</span>
                    </div>
                    <div className="p-8 flex items-center justify-center min-h-[300px] bg-muted/10">
                      <div className="text-center text-muted-foreground">
                        <tab.icon className="h-12 w-12 mx-auto mb-4 opacity-40" aria-hidden="true" />
                        <p className="text-sm">Preview do módulo {tab.label}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
