"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { LayoutGrid, BookOpen, Sparkles, BarChart3, Bell, Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/user-menu"
import { AppSidebar } from "./app-sidebar"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/tests", label: "Tests", icon: BookOpen },
  { href: "/practice", label: "Practice", icon: Sparkles },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
]

export function AppHeader() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 px-3 sm:px-6 backdrop-blur-xl">
      {/* Mobile menu toggle + Logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 top-14 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative w-[240px] bg-background border-r border-border overflow-y-auto">
            <AppSidebar />
          </aside>
        </div>
      )}

      {/* Center nav - hidden on mobile */}
      <div className="flex flex-1 items-center justify-center">
        <nav className="hidden sm:flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", active && "text-blue-400")} />
                <span className="hidden md:inline">{item.label}</span>
                {active && (
                  <span className="absolute -bottom-[13px] left-1/2 h-[2px] w-10 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                )}
              </Link>
            )
          })}
        </nav>
        {/* Mobile nav icons */}
        <nav className="flex sm:hidden items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-center rounded-xl p-2 transition-all",
                  pathname === item.href ? "text-blue-400" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <ThemeToggle />
        {session && <UserMenu variant="header" />}
      </div>
    </header>
  )
}
