"use client"

import { useState } from "react"
import type { UseFormRegister, FieldErrors } from "react-hook-form"
import type { CadastroFormData } from "./CadastroForm"
import { PasswordStrength } from "./PasswordStrength"
import { Eye, EyeOff } from "lucide-react"

interface StepDadosPessoaisProps {
  register: UseFormRegister<CadastroFormData>
  errors: FieldErrors<CadastroFormData>
  password: string
  confirmarSenha: string
}

export function StepDadosPessoais({ register, errors, password, confirmarSenha }: StepDadosPessoaisProps) {
  const [showSenha, setShowSenha] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)

  const senhasCoincidem = password === confirmarSenha
  const confirmarTocada = confirmarSenha.length > 0

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="nome" className="text-sm font-medium text-foreground">
          Nome completo
        </label>
        <input
          id="nome"
          type="text"
          autoComplete="name"
          {...register("nome")}
          className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Seu nome"
        />
        {errors.nome && (
          <p className="text-xs text-destructive font-medium">{errors.nome.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="seu@email.com"
        />
        {errors.email && (
          <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="telefone" className="text-sm font-medium text-foreground">
          Telefone / WhatsApp
        </label>
        <input
          id="telefone"
          type="tel"
          autoComplete="tel"
          {...register("telefone")}
          className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="(11) 99999-9999"
        />
        {errors.telefone && (
          <p className="text-xs text-destructive font-medium">{errors.telefone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="senha" className="text-sm font-medium text-foreground">
          Senha
        </label>
        <div className="relative">
          <input
            id="senha"
            type={showSenha ? "text" : "password"}
            autoComplete="new-password"
            {...register("senha")}
            className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-foreground/40 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Crie uma senha forte"
          />
          <button
            type="button"
            onClick={() => setShowSenha(!showSenha)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground/80 transition-colors"
            tabIndex={-1}
            aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}
          >
            {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <PasswordStrength password={password} />
        {errors.senha && (
          <p className="text-xs text-destructive font-medium">{errors.senha.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmarSenha" className="text-sm font-medium text-foreground">
          Confirmar senha
        </label>
        <div className="relative">
          <input
            id="confirmarSenha"
            type={showConfirmar ? "text" : "password"}
            autoComplete="new-password"
            {...register("confirmarSenha")}
            className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-foreground/40 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Repita a senha"
          />
          <button
            type="button"
            onClick={() => setShowConfirmar(!showConfirmar)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground/80 transition-colors"
            tabIndex={-1}
            aria-label={showConfirmar ? "Ocultar senha" : "Mostrar senha"}
          >
            {showConfirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmarSenha && (
          <p className="text-xs text-destructive font-medium">{errors.confirmarSenha.message}</p>
        )}
        {!errors.confirmarSenha && confirmarTocada && !senhasCoincidem && (
          <p className="text-xs text-destructive font-medium">As senhas não coincidem.</p>
        )}
        {confirmarTocada && senhasCoincidem && (
          <p className="text-xs text-emerald-600 font-medium">As senhas coincidem.</p>
        )}
      </div>
    </div>
  )
}
