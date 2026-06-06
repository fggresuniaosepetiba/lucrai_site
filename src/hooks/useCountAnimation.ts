'use client'

import { useEffect, useRef, useState } from 'react'

export function useCountAnimation(
  targetValue: number,
  duration: number = 1200,
  isActive: boolean = false
) {
  const [currentValue, setCurrentValue] = useState(0)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isActive) return

    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)

      setCurrentValue(Math.round(targetValue * eased))

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [targetValue, duration, isActive])

  return currentValue
}
