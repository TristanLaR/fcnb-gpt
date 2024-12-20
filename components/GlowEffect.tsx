import React from 'react'
import { cn } from "@/lib/utils"

interface GlowEffectProps {
  children: React.ReactNode
  className?: string
}

export function GlowEffect({ children, className }: GlowEffectProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-yellow-400 rounded-full opacity-80 blur-sm"></div>
      <div className="relative z-10">{children}</div>
    </div>
  )
}
