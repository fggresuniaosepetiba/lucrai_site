import type { Metadata } from "next"
import { BemVindoScreen } from "@/components/cadastro/BemVindoScreen"

export const metadata: Metadata = {
  title: "Boas-vindas — Lucraí",
  description: "Sua conta foi criada com sucesso.",
  robots: { index: false, follow: false },
}

export default function BemVindoPage() {
  return <BemVindoScreen />
}
