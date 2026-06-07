import type { Metadata } from 'next'
import { AnnouncementBar } from '@/components/landing/AnnouncementBar'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { HeroSection } from '@/components/landing/HeroSection'
import { SocialProofBar } from '@/components/landing/SocialProofBar'
import { ProblemSection } from '@/components/landing/ProblemSection'
import { ProductSection } from '@/components/landing/ProductSection'
import { ComparisonSection } from '@/components/landing/ComparisonSection'
import { ResultsSection } from '@/components/landing/ResultsSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { SecuritySection } from '@/components/landing/SecuritySection'
import { FaqSection } from '@/components/landing/FaqSection'
import { FinalCtaSection } from '@/components/landing/FinalCtaSection'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Lucraí — CFO Digital Inteligente para PMEs Brasileiras',
  description: 'Tenha a inteligência estratégica de um CFO profissional por R$ 29,90/mês. Dashboard financeiro em tempo real, projeções com IA e alertas inteligentes.',
  keywords: 'CFO digital, gestão financeira PME, fluxo de caixa, inteligência artificial financeira',
  openGraph: {
    title: 'Lucraí — Seu CFO Digital Inteligente',
    description: 'Transforme dados financeiros em decisões lucrativas com IA.',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lucraí — CFO Digital Inteligente',
    description: 'Transforme dados financeiros em decisões lucrativas com IA.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function LandingPage() {
  return (
    <>
      <a href="#inicio" className="skip-to-content">
        Pular para o conteúdo principal
      </a>
      <AnnouncementBar />
      <LandingHeader />
      <main>
        <HeroSection />
        <SocialProofBar />
        <ProblemSection />
        <ProductSection />
        <ComparisonSection />
        <ResultsSection />
        <TestimonialsSection />
        <PricingSection />
        <SecuritySection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </>
  )
}
