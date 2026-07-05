"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useState } from "react"
import {
  LayoutGrid,
  BookOpen,
  Sparkles,
  BarChart3,
  Bookmark,
  UserCircle,
  Settings,
  HelpCircle,
  LogOut,
  Crown,
  ArrowRight,
  Trophy,
  Bell,
} from "lucide-react"
import { EpxLogo } from "@/components/epx-logo"
import { PremiumModal } from "@/components/premium/premium-modal"
import { cn } from "@/lib/utils"

const mainLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/tests", label: "Mock Tests", icon: BookOpen },
  { href: "/practice", label: "Practice", icon: Sparkles },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
]

const accountLinks = [
  { href: "/profile", label: "Profile", icon: UserCircle },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help & Support", icon: HelpCircle },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [showPremium, setShowPremium] = useState(false)

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[240px] flex-col border-r border-border bg-sidebar/95 backdrop-blur-xl lg:flex">
      <div className="border-b border-border px-5 py-5">
        <Link href="/dashboard">
          <EpxLogo size="md" />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {mainLinks.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-gradient-to-r from-violet-600/80 to-blue-600/60 text-white shadow-md shadow-violet-600/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-muted-foreground group-hover:text-foreground")} />
                  <span className="flex-1">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="mt-6">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Account
          </p>
          <ul className="space-y-1">
            {accountLinks.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-muted/50 text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
            <li>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <div className="border-t border-border p-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600/40 via-indigo-600/30 to-blue-600/20 p-4">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-violet-500/20 blur-2xl" />
          <div className="relative">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm font-semibold">Go Premium</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">
              Unlock unlimited tests & analytics
            </p>
            <button
              onClick={() => setShowPremium(true)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-3 py-2 text-xs font-semibold text-white transition-all hover:shadow-lg hover:shadow-violet-600/30"
            >
              Upgrade Now
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
      {showPremium && <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />}
    </aside>
  )
}
