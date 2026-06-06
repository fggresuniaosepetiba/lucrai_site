'use client'

import { Lock, FileCheck, MapPin, DatabaseBackup } from 'lucide-react'
import { AnimatedSection } from './AnimatedSection'

const items = [
  {
    icon: Lock,
    title: 'Criptografia AES-256',
    text: 'O mesmo padrão usado por bancos e instituições financeiras globais.',
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
    text: 'Cópias de segurança a cada hora. Seus dados nunca se perdem.',
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
            <AnimatedSection key={item.title} delay={i * 100}>
              <div className="rounded-xl border border-border/50 bg-card p-6 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-1">
                <item.icon className="h-8 w-8 mx-auto mb-4 text-primary" aria-hidden="true" />
                <h3 className="text-sm font-semibold mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
