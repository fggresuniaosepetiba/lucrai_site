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
    answer: 'Atualmente, os lançamentos financeiros são realizados manualmente no sistema — o que garante total controle sobre os dados inseridos. As integrações com bancos e instituições financeiras estão em nosso roadmap e fazem parte do planejamento de evolução da plataforma. Enquanto isso, o lançamento manual é simples, rápido e garante que cada dado reflita exatamente a realidade da sua operação.',
  },
  {
    question: 'Preciso saber de contabilidade para usar o Lucraí?',
    answer: 'Não. O Lucraí foi desenvolvido para empreendedores, não para contadores. A linguagem é clara, os gráficos são intuitivos e a IA explica os insights em português simples.',
  },
  {
    question: 'Meus dados financeiros ficam seguros?',
    answer: 'Levamos a segurança dos seus dados muito a sério. O Lucraí adota boas práticas de segurança em toda a sua arquitetura, incluindo autenticação segura, tráfego criptografado (HTTPS) e controle de acesso por usuário. Sua conta é protegida por senha e, em breve, autenticação em dois fatores estará disponível. Seus dados financeiros são de uso exclusivo da sua empresa — nunca são compartilhados, vendidos ou utilizados para outros fins. Estamos em constante evolução para elevar ainda mais os padrões de proteção da plataforma.',
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
    answer: 'Honestamente? Depende muito do perfil da sua operação — e empresas com faturamentos similares podem ter necessidades completamente diferentes. O que mais importa na escolha não é o tamanho da empresa, mas a quantidade de pessoas que precisam acessar o sistema e o nível de análise que você quer ter. Nossa sugestão: agende uma conversa rápida e gratuita com nossa equipe. Em 15 minutos, te ajudamos a entender qual plano faz mais sentido para o seu momento — sem pressão de venda.',
  },
  {
    question: 'O Lucraí substitui meu contador?',
    answer: 'Não, e nem é esse o objetivo. O Lucraí é um CFO Digital — focado em gestão, estratégia e tomada de decisão em tempo real. Seu contador continua sendo fundamental para obrigações fiscais, tributárias e contábeis.',
  },
  {
    question: 'O Lucraí funciona para qualquer segmento de negócio?',
    answer: 'Sim. O Lucraí foi desenvolvido para qualquer empresa que precise de clareza financeira — independente do segmento. Já temos clientes em varejo, tecnologia, construção, gastronomia, saúde e serviços profissionais. O sistema se adapta ao seu modelo de receita e despesa, seja você uma empresa de produto, serviço ou recorrência. E se tiver alguma dúvida sobre o seu caso específico, nossa equipe está disponível para ajudar.',
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
