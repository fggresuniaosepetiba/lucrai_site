import { Check, Circle } from "lucide-react"

interface PasswordRequirementsProps {
  password: string
}

const requirements = [
  { key: "length", label: "Pelo menos 6 caracteres", test: (p: string) => p.length >= 6 },
  { key: "upper", label: "Uma letra maiúscula", test: (p: string) => /[A-Z]/.test(p) },
  { key: "lower", label: "Uma letra minúscula", test: (p: string) => /[a-z]/.test(p) },
  { key: "number", label: "Um número", test: (p: string) => /[0-9]/.test(p) },
  { key: "special", label: "Um caractere especial (! @ # $ % & *)", test: (p: string) => /[!@#$%&*()\-_+=?/]/.test(p) },
]

export function PasswordStrength({ password }: PasswordRequirementsProps) {
  const allMet = requirements.every((r) => r.test(password))
  const hasContent = password.length > 0

  return (
    <div className="space-y-2 pt-1">
      <p className="text-xs font-medium text-foreground/60">
        {hasContent && allMet
          ? "Todos os requisitos atendidos"
          : "A senha deve conter:"}
      </p>
      <ul className="space-y-1">
        {requirements.map((req) => {
          const met = hasContent && req.test(password)
          return (
            <li
              key={req.key}
              className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                met ? "text-emerald-600" : "text-foreground/50"
              }`}
            >
              {met ? (
                <Check className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <Circle className="h-3.5 w-3.5 shrink-0" />
              )}
              {req.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
