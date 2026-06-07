import { TRIAL_DIAS, TRIAL_PLANO } from "@/lib/constants"

export function calcularTrial() {
  const inicio = new Date()
  const fim = new Date(inicio)
  fim.setDate(fim.getDate() + TRIAL_DIAS)

  return {
    plano: TRIAL_PLANO,
    trialInicio: inicio.toISOString(),
    trialFim: fim.toISOString(),
  }
}

export function formatarDataExpiracao(isoString: string): string {
  const data = new Date(isoString)
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export function diasRestantes(isoString: string): number {
  const agora = new Date()
  const fim = new Date(isoString)
  const diff = fim.getTime() - agora.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
