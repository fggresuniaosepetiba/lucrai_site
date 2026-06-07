'use client'

import { LayoutDashboard, TrendingUp, Bell, FileText, Check, AlertTriangle, Lightbulb } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { DashboardPreview } from './DashboardPreview'
import { AnimatedSection } from './AnimatedSection'

function CashFlowChart() {
  const data = [
    { month: 'Jun', income: 92, expense: 58 },
    { month: 'Jul', income: 88, expense: 61 },
    { month: 'Ago', income: 105, expense: 64 },
    { month: 'Set', income: 98, expense: 55 },
  ]
  const maxValue = Math.max(...data.flatMap(d => [d.income, d.expense]))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-primary" />
          <span>Entradas</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-muted-foreground/30" />
          <span>Saídas</span>
        </div>
      </div>
      <div className="flex items-end justify-center gap-6 h-48">
        {data.map((d) => (
          <div key={d.month} className="flex flex-col items-center gap-1">
            <div className="flex items-end gap-1">
              <div
                className="w-8 rounded-t bg-primary transition-all duration-500"
                style={{ height: `${(d.income / maxValue) * 100}%` }}
                title={`Entradas: R$ ${d.income}k`}
              />
              <div
                className="w-8 rounded-t bg-muted-foreground/30 transition-all duration-500"
                style={{ height: `${(d.expense / maxValue) * 100}%` }}
                title={`Saídas: R$ ${d.expense}k`}
              />
            </div>
            <span className="text-xs text-muted-foreground">{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AlertsMockup() {
  const alerts = [
    {
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10 border-yellow-500/20',
      title: 'Alerta',
      text: 'Custos operacionais subiram 15%. Revise fornecedores.',
    },
    {
      icon: Lightbulb,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10 border-blue-500/20',
      title: 'Insight',
      text: 'Margem 8% acima da média setorial. Top 15% do mercado.',
    },
    {
      icon: Check,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      title: 'Positivo',
      text: 'Fluxo de caixa projetado positivo por 90 dias consecutivos.',
    },
  ]

  return (
    <div className="space-y-3">
      {alerts.map((a) => (
        <div key={a.title} className={`flex items-start gap-3 rounded-lg p-4 border ${a.bg}`}>
          <a.icon className={`mt-0.5 h-5 w-5 shrink-0 ${a.color}`} aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold text-foreground">{a.title}</p>
            <p className="text-sm text-muted-foreground">{a.text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function ReportMockup() {
  return (
    <div className="rounded-xl bg-card border border-border/50 shadow-lg overflow-hidden max-w-sm mx-auto">
      <div className="bg-primary/10 px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">L</div>
          <span className="text-xs font-semibold">Lucraí</span>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <p className="text-sm font-semibold">Relatório Executivo — Junho 2026</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border/20">
            <span className="text-xs text-muted-foreground">DRE Gerencial</span>
            <span className="text-xs font-medium text-emerald-500">+12,5%</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/20">
            <span className="text-xs text-muted-foreground">Fluxo de Caixa</span>
            <span className="text-xs font-medium text-emerald-500">Positivo</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/20">
            <span className="text-xs text-muted-foreground">Margem Líquida</span>
            <span className="text-xs font-medium">38,2%</span>
          </div>
        </div>
        <div className="pt-2 border-t border-border/20">
          <div className="rounded-lg bg-muted/50 px-4 py-2 text-center text-xs text-muted-foreground">
            Exportar PDF
          </div>
        </div>
      </div>
    </div>
  )
}

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
    mockup: <DashboardPreview isActive={true} compact />,
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
    mockup: <CashFlowChart />,
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
    mockup: <AlertsMockup />,
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
    mockup: <ReportMockup />,
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
                    <h3 className="text-xl font-semibold leading-snug md:text-2xl">
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
                  <div className="rounded-2xl border bg-card shadow-xl overflow-hidden p-6 min-h-[300px] flex items-center justify-center">
                    {tab.mockup}
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
