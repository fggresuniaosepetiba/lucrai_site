'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navLinks = [
  { href: '#produto', label: 'Produto' },
  { href: '#planos', label: 'Planos' },
  { href: '#cases', label: 'Cases' },
  { href: '#depoimentos', label: 'Depoimentos' },
]

export function LandingHeader() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMobileOpen])

  return (
    <>
      <header className="relative mt-9 bg-background/95 backdrop-blur-md border-b border-border/40">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Navegação principal">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2" aria-label="Lucraí - Página inicial">
              <Image
                src="/images/lucrai/logo-lucrai-sem-fundo-otimizada.png"
                alt="Lucraí"
                width={160}
                height={44}
                className="h-11 w-auto"
                priority
              />
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-foreground after:transition-transform hover:after:scale-x-100"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <a href="/login">Entrar</a>
              </Button>
              <Button size="sm" asChild>
                <a href="/cadastro?origem=menu_cta">Começar Grátis</a>
              </Button>
            </div>

            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden rounded-lg p-2 hover:bg-accent transition-colors"
              aria-label={isMobileOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        <div
          className={`fixed inset-x-0 z-40 bg-background lg:hidden transition-transform duration-300 ${
            isMobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ top: '36px', bottom: 0 }}
          aria-hidden={!isMobileOpen}
        >
          <nav className="flex flex-col p-6 gap-4" aria-label="Navegação mobile">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className="text-lg font-medium text-muted-foreground hover:text-foreground py-2 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <hr className="border-border/50 my-2" />
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="/login">Entrar</a>
            </Button>
            <Button className="w-full" asChild>
              <a href="/cadastro?origem=menu_cta">Começar Grátis</a>
            </Button>
          </nav>
        </div>
      </header>
    </>
  )
}
