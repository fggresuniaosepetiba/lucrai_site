'use client'

import { FileCheck, MapPin, DatabaseBackup, Shield } from 'lucide-react'
import { AnimatedSection } from './AnimatedSection'

const items = [
  {
    icon: Shield,
    title: 'Conexão segura',
    text: 'Todo o tráfego do Lucraí usa HTTPS com criptografia de ponta, protegendo seus dados em trânsito.',
  },
  {
    icon: FileCheck,
    title: 'Conformidade LGPD',
    text: 'Total conformidade com a Lei Geral de Proteção de Dados.',
  },
  {
    icon: MapPin,
    title: 'Servidores no Brasil',
    text: 'Seus dados nunca saem do território nacional.',
  },
  {
    icon: DatabaseBackup,
    title: 'Backups automáticos',
    text: 'Seus dados são armazenados com segurança e regularmente protegidos contra perda.',
  },
]

export function SecuritySection() {
  return (
    <section className="bg-background py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <AnimatedSection>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl leading-[1.15]">
            Seus dados financeiros protegidos como um banco
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto mb-12">
            Confiamos em tecnologia de ponta para garantir que suas informações nunca corram risco.
          </p>
        </AnimatedSection>

        <div className="grid gap-6 md:grid-cols-4">
          {items.map((item, i) => (
            <AnimatedSection key={item.title} delay={i * 100} className="h-full">
              <div className="rounded-xl border border-border/50 bg-card p-6 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-1 h-full flex flex-col items-center">
                <item.icon className="h-8 w-8 mx-auto mb-4 text-primary shrink-0" aria-hidden="true" />
                <h3 className="text-sm font-semibold mb-2 shrink-0">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">{item.text}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
