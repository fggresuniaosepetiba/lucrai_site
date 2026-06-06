'use client'

import { Building2, Wrench, Code2, Heart, Utensils, Briefcase } from 'lucide-react'
import { AnimatedSection } from './AnimatedSection'

const segments = [
  { icon: Building2, name: 'Varejo' },
  { icon: Wrench, name: 'Construção' },
  { icon: Code2, name: 'Tecnologia' },
  { icon: Heart, name: 'Saúde' },
  { icon: Utensils, name: 'Gastronomia' },
  { icon: Briefcase, name: 'Serviços' },
]

export function SocialProofBar() {
  return (
    <div className="border-y border-border/30 bg-muted/20">
      <AnimatedSection className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-6">
          <p className="text-sm font-medium text-muted-foreground text-center">
            Empresas de todo o Brasil estão substituindo planilhas e processos manuais pelo Lucraí.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {segments.map((segment, i) => (
              <div key={segment.name} className="flex items-center gap-2">
                <segment.icon className="h-4 w-4 text-muted-foreground/60" aria-hidden="true" />
                <span className="text-sm text-muted-foreground/60 whitespace-nowrap">{segment.name}</span>
                {i < segments.length - 1 && (
                  <div className="hidden sm:block h-4 w-px bg-border/30 ml-2" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>
    </div>
  )
}
