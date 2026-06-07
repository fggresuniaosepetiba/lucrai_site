'use client'

import { MessageCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

const WHATSAPP_NUMBER = '5500000000000'
const WHATSAPP_MESSAGE = 'Olá! Gostaria de falar com um especialista sobre o Lucraí.'
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

export function WhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com especialista pelo WhatsApp"
      className={`
        fixed bottom-6 right-6 z-40
        group
        flex items-center justify-center
        w-14 h-14 rounded-full
        bg-background/80 backdrop-blur-sm border border-border/50
        shadow-sm hover:shadow-md
        transition-all duration-300 ease-out
        hover:bg-background hover:border-border
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}
      `}
    >
      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#25D366]">
        <MessageCircle className="h-4.5 w-4.5 fill-white stroke-none" aria-hidden="true" />
      </div>
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg border border-border/50 bg-background/95 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-foreground shadow-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
        Falar com um especialista
      </span>
    </a>
  )
}
