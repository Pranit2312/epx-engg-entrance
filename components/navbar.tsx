"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { EpxLogo } from "@/components/epx-logo"
import { UserMenu } from "@/components/user-menu"
import { Menu, X, LayoutGrid, BookOpen, Sparkles, BarChart3, UserCircle, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/tests", label: "Mock Tests", icon: BookOpen },
  { href: "/practice", label: "Practice", icon: Sparkles },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
]

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/">
          <EpxLogo size="sm" />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {active && (
                  <span className="absolute inset-0 rounded-xl border border-primary/20 bg-primary/10" />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className={cn("h-4 w-4 transition-all", active && "text-primary")} />
                  {item.label}
                </span>
                {active && (
                  <span className="absolute -bottom-[13px] left-1/2 h-[2px] w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
                )}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {session ? (
            <div className="hidden md:flex">
              <UserMenu variant="navbar" />
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-xl">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="btn-gradient rounded-xl px-4">Sign Up</Button>
              </Link>
            </div>
          )}

          <Button variant="ghost" size="icon" className="rounded-xl md:hidden" onClick={() => setMenuOpen((value) => !value)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-border bg-background/95 px-4 py-3 backdrop-blur-2xl md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                    active ? "border border-primary/20 bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon className={cn("h-4 w-4", active && "text-primary")} />
                  {item.label}
                </Link>
              )
            })}
            {session ? (
              <div className="mt-2 border-t border-border pt-2">
                <Link href="/profile" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground hover:bg-muted" onClick={() => setMenuOpen(false)}>
                  <UserCircle className="h-4 w-4" /> My Profile
                </Link>
                <Link href="/settings" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground hover:bg-muted" onClick={() => setMenuOpen(false)}>
                  Settings
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="mt-2 flex flex-col gap-2 border-t border-border pt-2">
                <Link href="/login" className="flex items-center justify-center rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link href="/register" className="flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-sm font-medium text-white" onClick={() => setMenuOpen(false)}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
