"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Calendar, Sparkles, CreditCard, RotateCcw, ShieldCheck, LogIn } from "lucide-react"

interface SessaoData {
  contaId: string
  userId: string
  nome: string
  email: string
  empresa: string
  plano: string
  trialFim: string
  primeiroAcesso: boolean
}

export function BemVindoScreen() {
  const router = useRouter()
  const [sessao, setSessao] = useState<SessaoData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem("lucrai_sessao")
    if (!raw) {
      router.replace("/cadastro")
      return
    }

    try {
      const data: SessaoData = JSON.parse(raw)

      if (data.primeiroAcesso === false) {
        router.replace("/dashboard")
        return
      }

      setSessao(data)
    } catch {
      router.replace("/cadastro")
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleIrParaLogin = () => {
    if (!sessao) return

    const updated = { ...sessao, primeiroAcesso: false }
    localStorage.setItem("lucrai_sessao", JSON.stringify(updated))
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1AB6FF] border-t-transparent" />
      </div>
    )
  }

  if (!sessao) return null

  const expiracao = new Date(sessao.trialFim).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="min-h-screen flex bg-[#0a0f1e]">
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-[#0d1527] via-[#0f1a30] to-[#0a1628] border-r border-white/5 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #1AB6FF 0%, transparent 50%), radial-gradient(circle at 75% 75%, #1AB6FF 0%, transparent 50%)`
        }} />

        <div className="relative">
          <div className="mb-16 flex justify-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#1AB6FF] flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-white text-2xl font-bold tracking-tight">Lucraí</span>
            </div>
          </div>

          <div className="space-y-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#1AB6FF]/10 border border-[#1AB6FF]/20 mb-6">
                <Sparkles className="h-10 w-10 text-[#1AB6FF]" />
              </div>
              <h2 className="text-2xl font-bold text-white leading-snug">
                Inteligência financeira<br />ao alcance da sua PME
              </h2>
            </div>

            <div className="space-y-6">
              {[
                { icon: "📊", title: "Organização", desc: "Todas as finanças centralizadas em um só lugar" },
                { icon: "📈", title: "Crescimento", desc: "Decisões baseadas em dados, não em achismo" },
                { icon: "⚡", title: "Produtividade", desc: "Automação que elimina planilhas e retrabalho" },
                { icon: "🤖", title: "Inteligência", desc: "IA que analisa, projeta e alerta em tempo real" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-white font-medium text-sm">{item.title}</p>
                    <p className="text-white/50 text-xs mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative">
          <p className="text-xs text-white/30 leading-relaxed text-center">
            Plataforma segura com padrão bancário de proteção de dados.
          </p>
        </div>
      </div>

      <div className="flex-1 min-w-0 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <Check className="h-8 w-8 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Seja bem-vindo ao Lucraí 🎉
            </h1>
            <p className="mt-3 text-base text-white/60 leading-relaxed max-w-md mx-auto">
              Seu acesso gratuito foi ativado com sucesso para a{" "}
              <strong className="text-white">{sessao.empresa}</strong>.
            </p>
            <p className="mt-1 text-sm text-white/50 leading-relaxed max-w-md mx-auto">
              Durante os próximos 14 dias você terá acesso aos recursos do Plano PRO
              para conhecer toda a experiência da plataforma.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-semibold text-emerald-500 uppercase tracking-wide">
                Trial ativado
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-white/[0.04] px-5 py-3.5 border border-white/5">
                <span className="text-sm text-white/50">Plano atual</span>
                <span className="text-sm font-bold text-[#1AB6FF] bg-[#1AB6FF]/10 px-3 py-1 rounded-md">
                  PRO
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/[0.04] px-5 py-3.5 border border-white/5">
                <span className="text-sm text-white/50">Validade</span>
                <span className="text-sm font-semibold text-white">14 dias</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/[0.04] px-5 py-3.5 border border-white/5">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-white/50" />
                  <span className="text-sm text-white/50">Expira em</span>
                </div>
                <span className="text-sm font-semibold text-white">{expiracao}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-white/40">
              <span className="flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" />
                Sem cartão de crédito
              </span>
              <span className="flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
                Sem cobrança automática
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Sem compromisso
              </span>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleIrParaLogin}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1AB6FF] px-8 py-3.5 text-base font-semibold text-white hover:bg-[#1AB6FF]/90 transition-colors w-full shadow-lg shadow-[#1AB6FF]/20"
            >
              Ir para o Login
              <LogIn className="h-5 w-5" />
            </button>
            <p className="mt-4 text-center text-xs text-white/30">
              Seu acesso foi ativado. Faça login para começar.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
