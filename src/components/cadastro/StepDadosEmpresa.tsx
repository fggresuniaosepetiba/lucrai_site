import type { UseFormRegister, FieldErrors } from "react-hook-form"
import type { CadastroFormData } from "./CadastroForm"

const portes = [
  { value: "MEI", label: "MEI" },
  { value: "ME", label: "ME (Microempresa)" },
  { value: "EPP", label: "EPP (Empresa de Pequeno Porte)" },
  { value: "Médio", label: "Médio Porte" },
  { value: "Grande", label: "Grande Empresa" },
] as const

const faturamentos = [
  { value: "Até R$ 81 mil", label: "Até R$ 81 mil/ano" },
  { value: "R$ 81 mil a R$ 360 mil", label: "R$ 81 mil a R$ 360 mil/ano" },
  { value: "R$ 360 mil a R$ 4,8 milhões", label: "R$ 360 mil a R$ 4,8 milhões/ano" },
  { value: "R$ 4,8 milhões a R$ 300 milhões", label: "R$ 4,8 milhões a R$ 300 milhões/ano" },
  { value: "Acima de R$ 300 milhões", label: "Acima de R$ 300 milhões/ano" },
] as const

interface StepDadosEmpresaProps {
  register: UseFormRegister<CadastroFormData>
  errors: FieldErrors<CadastroFormData>
  step2Attempted: boolean
}

export function StepDadosEmpresa({ register, errors, step2Attempted }: StepDadosEmpresaProps) {
  return (
    <div className="w-full space-y-5">
      <div className="space-y-2">
        <label htmlFor="empresa" className="text-sm font-medium text-foreground">
          Nome da empresa
        </label>
        <input
          id="empresa"
          type="text"
          autoComplete="organization"
          {...register("empresa")}
          className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Nome da sua empresa"
        />
        {step2Attempted && errors.empresa && (
          <p className="text-xs text-destructive font-medium">{errors.empresa.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="cargo" className="text-sm font-medium text-foreground">
          Cargo do responsável
        </label>
        <input
          id="cargo"
          type="text"
          autoComplete="organization-title"
          {...register("cargo")}
          className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Ex: CEO, Diretor Financeiro, Proprietário"
        />
        {step2Attempted && errors.cargo && (
          <p className="text-xs text-destructive font-medium">{errors.cargo.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="porte" className="text-sm font-medium text-foreground">
          Porte da empresa
        </label>
        <div className="relative min-w-0">
          <select
            id="porte"
            {...register("porte")}
            className="flex h-11 w-full min-w-0 appearance-none rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" className="text-foreground/40">Selecione o porte</option>
            {portes.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50" aria-hidden="true">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>
        {step2Attempted && errors.porte && (
          <p className="text-xs text-destructive font-medium">{errors.porte.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="faturamento" className="text-sm font-medium text-foreground">
          Faturamento estimado
        </label>
        <div className="relative min-w-0">
          <select
            id="faturamento"
            {...register("faturamento")}
            className="flex h-11 w-full min-w-0 appearance-none rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" className="text-foreground/40">Selecione a faixa</option>
            {faturamentos.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50" aria-hidden="true">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>
        {step2Attempted && errors.faturamento && (
          <p className="text-xs text-destructive font-medium">{errors.faturamento.message}</p>
        )}
      </div>
    </div>
  )
}
