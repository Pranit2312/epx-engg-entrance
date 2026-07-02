"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutGrid,
  BookOpen,
  Sparkles,
  BarChart3,
  Bookmark,
  TrendingUp,
  UserCircle,
  Settings,
  HelpCircle,
  LogOut,
  Crown,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const mainLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/tests", label: "Mock Tests", icon: BookOpen },
  { href: "/practice", label: "Practice", icon: Sparkles },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "#", label: "Bookmarks", icon: Bookmark },
  { href: "#", label: "Performance", icon: TrendingUp, badge: "New" },
]

const accountLinks = [
  { href: "#", label: "Profile", icon: UserCircle },
  { href: "#", label: "Settings", icon: Settings },
  { href: "#", label: "Help & Support", icon: HelpCircle },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[240px] flex-col border-r border-white/[0.06] bg-[#0a0b1e]/95 backdrop-blur-xl lg:flex">
      {/* Brand */}
      <div className="border-b border-white/[0.06] px-5 py-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 text-sm font-bold text-white shadow-lg shadow-violet-600/20">
            CM
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">Competitive Master</p>
            <p className="text-[11px] text-muted-foreground">Ace Your Exams +</p>
          </div>
        </Link>
      </div>

      {/* Main Nav */}
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
                      : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-muted-foreground group-hover:text-foreground")} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Account Section */}
        <div className="mt-6">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Account
          </p>
          <ul className="space-y-1">
            {accountLinks.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-white/[0.05] hover:text-foreground"
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

      {/* Premium Promo */}
      <div className="border-t border-white/[0.06] p-4">
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
            <button className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-3 py-2 text-xs font-semibold text-white transition-all hover:shadow-lg hover:shadow-violet-600/30">
              Upgrade Now
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
