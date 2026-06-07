import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cadastro — Lucraí",
  description: "Crie sua conta gratuita e comece a transformar a gestão financeira da sua empresa.",
  robots: { index: false, follow: false },
}

export default function CadastroLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div data-theme="clean" className="min-h-screen bg-background">
      {children}
    </div>
  )
}
