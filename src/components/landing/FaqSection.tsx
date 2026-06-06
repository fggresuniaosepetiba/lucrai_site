'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { AnimatedSection } from './AnimatedSection'

const faqs = [
  {
    question: 'O Lucraí se conecta automaticamente com meu banco?',
    answer: 'Atualmente, você importa seus dados via extrato bancário (OFX/CSV) ou lança manualmente. Estamos desenvolvendo integrações bancárias abertas via Open Finance para 2026.',
  },
  {
    question: 'Preciso saber de contabilidade para usar o Lucraí?',
    answer: 'Não. O Lucraí foi desenvolvido para empreendedores, não para contadores. A linguagem é clara, os gráficos são intuitivos e a IA explica os insights em português simples.',
  },
  {
    question: 'Meus dados financeiros ficam seguros?',
    answer: 'Totalmente. Usamos criptografia AES-256 (padrão bancário), servidores no Brasil, conformidade total com a LGPD e backups automáticos. Seus dados nunca são compartilhados ou vendidos.',
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer: 'Sim, sem burocracia. Você pode cancelar seu plano a qualquer momento diretamente nas configurações da conta. Sem multa, sem ligações, sem formulários.',
  },
  {
    question: 'Como funciona o período de teste gratuito?',
    answer: 'Você tem 14 dias com acesso completo ao plano Pro, sem precisar cadastrar cartão de crédito. Ao final, você escolhe o plano ideal para seu negócio ou cancela sem custo.',
  },
  {
    question: 'Qual plano é ideal para minha empresa?',
    answer: 'Depende do volume de transações e do nível de análise que você precisa. MEIs e freelancers geralmente começam no Starter. Empresas com faturamento acima de R$ 50k/mês costumam aproveitar melhor o Pro. Entre em contato e te ajudamos a escolher.',
  },
  {
    question: 'O Lucraí substitui meu contador?',
    answer: 'Não, e nem é esse o objetivo. O Lucraí é um CFO Digital — focado em gestão, estratégia e tomada de decisão em tempo real. Seu contador continua sendo fundamental para obrigações fiscais, tributárias e contábeis.',
  },
]

export function FaqSection() {
  return (
    <section className="bg-muted/30 py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl leading-[1.15]">
            Perguntas frequentes
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Tudo que você precisa saber antes de começar.
          </p>
        </AnimatedSection>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AnimatedSection key={i} delay={i * 50}>
              <AccordionItem value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </AnimatedSection>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
