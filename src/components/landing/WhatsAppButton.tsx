'use client'

import { MessageCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

const WHATSAPP_NUMBER = '5521999999999'
const WHATSAPP_MESSAGE = 'Olá! Gostaria de falar com um consultor sobre o Lucraí.'
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

export function WhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com um consultor pelo WhatsApp"
      className={`
        fixed bottom-6 right-6 z-50 flex items-center gap-3
        rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/25
        transition-all duration-300 ease-out
        hover:bg-[#20BD5A] hover:shadow-xl hover:shadow-[#25D366]/30 hover:scale-105
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-background
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}
    >
      <div className="flex items-center justify-center w-12 h-12 shrink-0">
        <MessageCircle className="h-6 w-6 fill-white stroke-none" aria-hidden="true" />
      </div>
      <span className="hidden sm:block pr-5 text-sm font-semibold whitespace-nowrap">
        Falar com um consultor
      </span>
    </a>
  )
}
