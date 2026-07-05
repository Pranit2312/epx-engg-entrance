"use client"

import { Lock } from "lucide-react"
import { useState } from "react"
import { PremiumModal } from "./premium-modal"
import { cn } from "@/lib/utils"

type FeatureGateProps = {
  isPremium: boolean
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode
  showLock?: boolean
  className?: string
}

export function FeatureGate({ isPremium, feature, children, fallback, showLock = true, className }: FeatureGateProps) {
  const [showModal, setShowModal] = useState(false)

  if (isPremium) {
    return <>{children}</>
  }

  return (
    <>
      <div className={cn("relative", className)}>
        {fallback ?? (
          <div className="pointer-events-none select-none opacity-30 blur-[1px]">
            {children}
          </div>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          {showLock && <Lock className="h-6 w-6 text-muted-foreground" />}
          <button
            onClick={() => setShowModal(true)}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:shadow-lg hover:shadow-violet-600/30"
          >
            Upgrade to {feature}
          </button>
        </div>
      </div>
      {showModal && <PremiumModal open={showModal} onClose={() => setShowModal(false)} />}
    </>
  )
}
