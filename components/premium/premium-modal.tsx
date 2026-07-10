"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, Crown, Loader2, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { PREMIUM_PLANS, PREMIUM_FEATURE_LIST } from "@/config/premium"

type Props = {
  open: boolean
  onClose: () => void
}

export function PremiumModal({ open, onClose }: Props) {
  const { data: session, update } = useSession()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleAction = async (action: string, planId?: string) => {
    setLoading(action)
    setError("")
    setSuccess("")
    try {
      const res = await fetch("/api/premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, planId }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error?.message || result.error || "Failed")
      setSuccess(result.data.plan === "trial" ? "Free trial activated! Enjoy premium for 7 days." : "Welcome to Premium!")
      await update()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    }
    setLoading(null)
  }

  const plans = [PREMIUM_PLANS.MONTHLY, PREMIUM_PLANS.YEARLY] as const

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="rounded-2xl border-border bg-popover sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">Upgrade to Premium</DialogTitle>
          <DialogDescription className="text-center">
            Unlock your full potential with EPX Premium
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="rounded-xl border-red-500/20 bg-red-500/10">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="rounded-xl border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Plans */}
        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          {plans.map((plan) => {
            const p = plan as typeof PREMIUM_PLANS.YEARLY
            return (
            <div
              key={p.id}
              className={cn(
                "relative rounded-2xl border p-6 transition-all",
                p.popular
                  ? "border-violet-500/40 bg-violet-500/10"
                  : "border-border bg-card hover:border-border/80"
              )}
            >
              {p.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-3 py-0.5 text-[10px] font-semibold text-white">
                  Popular
                </span>
              )}
              <h3 className="text-lg font-bold">{p.label}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold">₹{p.price}</span>
                <span className="text-sm text-muted-foreground">/{p.interval}</span>
              </div>
              {p.discount && (
                <span className="mt-1 inline-block rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  {p.discount}
                </span>
              )}
              <ul className="mt-4 space-y-2">
                {PREMIUM_FEATURE_LIST.map((f) => (
                  <li key={f.id} className="flex items-center gap-2 text-xs">
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    {f.label}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-5 w-full btn-gradient rounded-xl"
                onClick={() => handleAction("upgrade", p.id)}
                disabled={loading !== null}
              >
                {loading === "upgrade" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="mr-2 h-4 w-4" />
                )}
                Upgrade {p.label}
              </Button>
            </div>
            )
          })}
        </div>

        {/* Free Trial */}
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            className="rounded-xl border-border"
            onClick={() => handleAction("trial")}
            disabled={loading !== null}
          >
            {loading === "trial" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-2 h-4 w-4" />
            )}
            Start 7-Day Free Trial
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
