"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { LayoutGrid, BookOpen, Sparkles, BarChart3, Bell } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/tests", label: "Mock Tests", icon: BookOpen },
  { href: "/practice", label: "Practice", icon: Sparkles },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
]

export function AppHeader() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userName = session?.user?.name || "Student"
  const initial = userName.charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#0a0b1e]/80 px-6 backdrop-blur-xl">
      {/* Center Nav */}
      <div className="flex flex-1 items-center justify-center">
        <nav className="flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", active && "text-blue-400")} />
                {item.label}
                {active && (
                  <span className="absolute -bottom-[13px] left-1/2 h-[2px] w-10 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-muted-foreground transition-all hover:bg-white/[0.08] hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[9px] font-bold text-white">
            3
          </span>
        </button>
        <div className="ml-1 flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-blue-600 text-sm font-bold text-white">
            {initial}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-tight">{userName}</p>
            <p className="text-[10px] text-muted-foreground">Student</p>
          </div>
        </div>
      </div>
    </header>
  )
}
