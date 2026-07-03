"use client"

import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { StepIndicator } from "./StepIndicator"
import { StepDadosPessoais } from "./StepDadosPessoais"
import { StepDadosEmpresa } from "./StepDadosEmpresa"
import { formatPhone, stripPhone } from "@/utils/mascaras"
import type { PorteEmpresa } from "@/types"
import { calcularTrial } from "@/utils/trial"
import { generateId } from "@/lib/utils"
import { DESTINO_POS_CADASTRO } from "@/lib/constants"
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react"
import { db } from "@/database/dexie"

const cadastroSchema = z
  .object({
    nome: z
      .string()
      .min(3, "Informe pelo menos nome e sobrenome.")
      .regex(/^\S+\s+\S+/, "Informe pelo menos nome e sobrenome."),
    email: z.string().email("E-mail inválido"),
    telefone: z.string().min(14, "Telefone inválido"),
    senha: z
      .string()
      .min(6, "Senha deve ter pelo menos 6 caracteres")
      .regex(/[A-Z]/, "Deve conter pelo menos 1 letra maiúscula")
      .regex(/[a-z]/, "Deve conter pelo menos 1 letra minúscula")
      .regex(/[0-9]/, "Deve conter pelo menos 1 número")
      .regex(/[!@#$%&*()\-_+=?/]/, "Deve conter pelo menos 1 caractere especial (! @ # $ % & * ( ) - _ + = ? /)"),
    confirmarSenha: z.string().min(6, "Confirme sua senha"),
    empresa: z.string().min(2, "Nome da empresa é obrigatório"),
    cargo: z.string().optional(),
    porte: z.string().min(1, "Selecione o porte da empresa"),
    faturamento: z.string().min(1, "Selecione a faixa de faturamento"),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem.",
    path: ["confirmarSenha"],
  })

export type CadastroFormData = z.infer<typeof cadastroSchema>

interface CadastroFormProps {
  origem: string
}

export function CadastroForm({ origem }: CadastroFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const [step2Attempted, setStep2Attempted] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
    clearErrors,
    formState: { errors },
  } = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      senha: "",
      confirmarSenha: "",
      empresa: "",
      cargo: "",
      porte: "",
      faturamento: "",
    },
  })

  const senha = watch("senha") || ""
  const confirmarSenha = watch("confirmarSenha") || ""

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhone(e.target.value)
      setValue("telefone", formatted, { shouldValidate: false })
    },
    [setValue]
  )

  register("telefone", {
    onChange: handlePhoneChange,
  })

  const handleNext = async () => {
    const fields: (keyof CadastroFormData)[] = ["nome", "email", "telefone", "senha", "confirmarSenha"]
    const valid = await trigger(fields)
    if (valid) {
      clearErrors(["empresa", "porte", "faturamento", "confirmarSenha"])
      setStep2Attempted(false)
      setStep(2)
    }
  }

  const handleStep2Submit = async () => {
    setStep2Attempted(true)
    const fields: (keyof CadastroFormData)[] = ["empresa", "porte", "faturamento"]
    const valid = await trigger(fields)
    if (valid) {
      const data = getValues()
      await onSubmit(data)
    }
  }

  const onSubmit = async (data: CadastroFormData) => {
    setSubmitting(true)
    setSubmitError("")

    try {
      const trial = calcularTrial()
      const contaId = generateId()
      const telefoneLimpo = stripPhone(data.telefone)

      const conta = {
        id: contaId,
        nome: data.nome,
        email: data.email,
        telefone: telefoneLimpo,
        senha: data.senha,
        empresa: data.empresa,
        cargo: data.cargo || "",
        porte: data.porte as PorteEmpresa,
        faturamento: data.faturamento,
        origem,
        plano: trial.plano,
        trialInicio: trial.trialInicio,
        trialFim: trial.trialFim,
        primeiroAcesso: true,
        createdAt: new Date().toISOString(),
      }

      const usuario = {
        id: generateId(),
        name: data.nome,
        email: data.email,
        password: data.senha,
        role: "owner" as const,
        company: data.empresa,
        createdAt: new Date().toISOString(),
      }

      await db.contas.add(conta)
      await db.users.add(usuario)

      const sessao = {
        contaId: conta.id,
        userId: usuario.id,
        nome: conta.nome,
        email: conta.email,
        empresa: conta.empresa,
        plano: conta.plano,
        trialFim: conta.trialFim,
        primeiroAcesso: true,
      }
      localStorage.setItem("lucrai_sessao", JSON.stringify(sessao))

      router.push(DESTINO_POS_CADASTRO)
    } catch (err) {
      console.error("Erro ao cadastrar:", err)
      setSubmitError("Ocorreu um erro ao criar sua conta. Tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <StepIndicator currentStep={step} />

      {submitError && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 1 && (
          <div className="animate-fade-in">
            <StepDadosPessoais
              register={register}
              errors={errors}
              password={senha}
              confirmarSenha={confirmarSenha}
            />
          </div>
        )}
        {step === 2 && (
          <div className="animate-fade-in">
            <StepDadosEmpresa register={register} errors={errors} step2Attempted={step2Attempted} />
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          {step === 1 ? (
            <div />
          ) : (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
          )}

          {step === 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Próximo
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleStep2Submit}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  Criar conta
                  <Check className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
