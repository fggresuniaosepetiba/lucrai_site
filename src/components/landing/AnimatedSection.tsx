'use client'

import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { cn } from '@/lib/cn'
import { ReactNode } from 'react'

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'left' | 'right' | 'none'
}

export function AnimatedSection({
  children,
  className,
  delay = 0,
  direction = 'up'
}: AnimatedSectionProps) {
  const { ref, isVisible } = useScrollAnimation()

  const getTransform = () => {
    if (isVisible) return 'translate3d(0,0,0)'
    switch (direction) {
      case 'up': return 'translate3d(0,24px,0)'
      case 'left': return 'translate3d(-40px,0,0)'
      case 'right': return 'translate3d(40px,0,0)'
      default: return 'translate3d(0,0,0)'
    }
  }

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms,
                     transform 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms`,
        willChange: 'opacity, transform'
      }}
    >
      {children}
    </div>
  )
}
