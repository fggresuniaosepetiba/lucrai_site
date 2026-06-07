import Image from "next/image"
import Link from "next/link"
import { CadastroForm } from "@/components/cadastro/CadastroForm"
import { Check, Shield, Zap, Headphones } from "lucide-react"

const benefits = [
  { icon: Zap, text: "14 dias grátis · Sem cartão de crédito" },
  { icon: Shield, text: "Dados protegidos com padrão bancário" },
  { icon: Headphones, text: "Suporte humano especializado" },
]

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ origem?: string }>
}) {
  const { origem } = await searchParams

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-2/5 bg-primary/5 border-r border-border/50 flex-col justify-between p-12">
        <div>
          <div className="flex justify-center mb-20">
            <Link href="/" className="inline-flex">
              <Image
                src="/images/light-oficial-sidebar.png"
                alt="Lucraí"
                width={200}
                height={55}
                className="h-14 w-auto"
                priority
              />
            </Link>
          </div>

          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-bold tracking-tight leading-snug text-foreground">
                CFO Digital Inteligente para sua PME
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-foreground/70">
                Em poucos minutos sua empresa terá acesso a dashboards em tempo real,
                projeções com IA e alertas inteligentes — igual um CFO de R$ 50 mil/mês,
                por R$ 29,90.
              </p>
            </div>

            <ul className="space-y-4">
              {[
                "Dashboard financeiro em tempo real",
                "Fluxo de caixa preditivo com IA",
                "Alertas inteligentes personalizados",
                "Relatórios executivos em PDF",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground/80">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <div className="space-y-3">
              {benefits.map((b) => (
                <div key={b.text} className="flex items-center gap-2.5 text-xs text-foreground/60">
                  <b.icon className="h-3.5 w-3.5 text-primary" />
                  {b.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-foreground/50 leading-relaxed">
            Ao criar sua conta, você concorda com nossos{" "}
            <Link href="/termos" className="underline text-foreground/60 hover:text-foreground/80 transition-colors">
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link href="/privacidade" className="underline text-foreground/60 hover:text-foreground/80 transition-colors">
              Política de Privacidade
            </Link>.
          </p>
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center px-6 py-12 lg:px-16">
          <div className="lg:hidden mb-12 mt-6 flex justify-center">
            <Link href="/" className="inline-flex">
              <Image
                src="/images/light-oficial-sidebar.png"
                alt="Lucraí"
                width={180}
                height={49}
                className="h-12 w-auto"
                priority
              />
            </Link>
          </div>

        <div className="w-full max-w-md mx-auto min-w-0">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Criar conta gratuita
            </h1>
            <p className="mt-2 text-sm text-foreground/60">
              Preencha os dados abaixo para começar seu teste de 14 dias.
            </p>
          </div>

          <CadastroForm origem={origem || "direto"} />

          <p className="mt-8 text-center text-sm text-foreground/60">
            Já tem uma conta?{" "}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80 underline transition-colors">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
