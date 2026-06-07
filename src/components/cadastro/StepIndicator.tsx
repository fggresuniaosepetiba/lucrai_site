interface StepIndicatorProps {
  currentStep: number
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { number: 1, label: "Dados pessoais" },
    { number: 2, label: "Dados da empresa" },
  ]

  return (
    <div className="flex items-center justify-center gap-0" role="navigation" aria-label="Progresso do cadastro">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors duration-250 ${
                currentStep >= step.number
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
              aria-current={currentStep === step.number ? "step" : undefined}
            >
              {currentStep > step.number ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                step.number
              )}
            </div>
            <span
              className={`hidden sm:inline text-sm font-medium ${
                currentStep >= step.number ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="mx-4 flex items-center" aria-hidden="true">
              <div className={`h-0.5 w-12 sm:w-20 transition-colors duration-250 ${
                currentStep > step.number ? "bg-primary" : "bg-muted"
              }`} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
