'use client'

import { X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/cn'

const STORAGE_KEY = 'lucrai-announcement-closed'

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const closed = sessionStorage.getItem(STORAGE_KEY)
    if (!closed) setIsVisible(true)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    sessionStorage.setItem(STORAGE_KEY, 'true')
  }

  return (
    <div
      className={cn(
        'relative z-50 flex h-9 items-center justify-center bg-primary px-4 text-center text-sm font-medium tracking-tight text-primary-foreground transition-all duration-300',
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      )}
      role="banner"
      aria-label="Anúncio"
    >
      <a
        href="#produto"
        className="hidden sm:inline hover:underline"
      >
        🎯 Novo: Projeções inteligentes com IA para os próximos 6 meses →
      </a>
      <a
        href="#produto"
        className="sm:hidden hover:underline"
      >
        🎯 Projeções com IA → 
      </a>
      <button
        onClick={handleClose}
        className="absolute right-3 rounded p-0.5 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
        aria-label="Fechar anúncio"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
