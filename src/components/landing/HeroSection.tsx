'use client'

import { Sparkles, Play, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { DashboardPreview } from './DashboardPreview'

export function HeroSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 })

  return (
    <section id="inicio" className="relative pt-28 pb-16 lg:pt-36 lg:pb-24" ref={ref as React.RefObject<HTMLDivElement>}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.04" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid gap-12 lg:grid-cols-[55%_45%] lg:gap-20 items-center">
          <div className="space-y-8">
            <div
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(-8px)',
                transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
              }}
            >
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              CFO Digital Inteligente
            </div>

            <h1
              className="text-5xl font-bold tracking-tight leading-[1.1] md:text-6xl lg:text-7xl"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 0.6s ease-out 100ms, transform 0.6s ease-out 100ms',
              }}
            >
              Seu próximo CFO<br />
              <span className="text-primary">não é uma pessoa.</span>
            </h1>

            <p
              className="max-w-lg text-lg leading-relaxed text-muted-foreground lg:text-xl"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 0.6s ease-out 200ms, transform 0.6s ease-out 200ms',
              }}
            >
              O Lucraí usa inteligência artificial para transformar os dados financeiros
              da sua empresa em decisões estratégicas em tempo real. Tudo que um CFO de
              R$ 50 mil por mês faz — por R$ 29,90.
            </p>

            <div
              className="flex flex-wrap items-center gap-4"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 0.6s ease-out 300ms, transform 0.6s ease-out 300ms',
              }}
            >
              <Button size="lg" asChild>
                <a href="/cadastro">Começar 14 dias grátis</a>
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="lg" className="gap-2">
                    <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                    Ver o produto em ação
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <div className="aspect-video rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                    <p className="text-sm">Demonstração em vídeo em breve</p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div
              className="flex items-center gap-6 text-sm text-muted-foreground"
              style={{
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 0.6s ease-out 400ms',
              }}
            >
              <span className="flex items-center gap-1.5">
                <Check className="h-3 w-3 text-primary" aria-hidden="true" />
                Sem cartão de crédito
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3 w-3 text-primary" aria-hidden="true" />
                Cancele quando quiser
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3 w-3 text-primary" aria-hidden="true" />
                Suporte humano incluído
              </span>
            </div>
          </div>

          <div
            className="relative"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0) rotateX(0)' : 'translateY(24px) rotateX(4deg)',
              transition: 'opacity 0.7s ease-out 400ms, transform 0.7s ease-out 400ms',
            }}
          >
            <div className="relative pt-3 pr-3">
              <DashboardPreview isActive={isVisible} />
              <div className="absolute -top-0.5 -right-0.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-lg border-2 border-background">
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                  IA ativa · Análise em tempo real
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
