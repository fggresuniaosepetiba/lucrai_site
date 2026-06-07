'use client'

export function AnnouncementBar() {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] flex h-9 items-center justify-center bg-primary px-4 text-center text-sm font-medium tracking-tight text-primary-foreground"
      role="banner"
      aria-label="Anúncio"
    >
      <span className="hidden sm:inline">🎯 Novo: Projeções inteligentes com IA para os próximos 6 meses</span>
      <span className="sm:hidden">🎯 Projeções com IA</span>
    </div>
  )
}

export function HeaderSpacer() {
  return null
}
