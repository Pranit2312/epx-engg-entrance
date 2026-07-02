"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, X, LayoutGrid, BookOpen, Sparkles, BarChart3, UserCircle, LogOut, ChevronDown } from "lucide-react"
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
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-background/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 font-bold text-white text-sm shadow-lg shadow-blue-600/20 transition-all duration-300 group-hover:shadow-blue-600/40 group-hover:scale-105">
            <span className="relative z-10">CM</span>
            <div className="absolute inset-0 animate-gradient-shift bg-[length:200%_200%] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold">Competitive Master</p>
            <p className="text-[11px] text-muted-foreground">Premium exam prep</p>
          </div>
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
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {active && (
                  <span className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20" />
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
            <>
              <div className="hidden items-center gap-2 md:flex">
                <div className="group relative">
                  <div className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:border-white/[0.15] hover:bg-white/[0.08]">
                    <UserCircle className="h-4 w-4" />
                    <span className="max-w-[100px] truncate">{session.user.name || "Student"}</span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </div>
                  <div className="invisible absolute right-0 top-full mt-1 w-48 origin-top-right scale-95 rounded-xl border border-white/[0.08] bg-background/95 p-1 opacity-0 shadow-2xl backdrop-blur-2xl transition-all group-hover:visible group-hover:scale-100 group-hover:opacity-100">
                    <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                      <p className="text-sm font-medium">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground">{session.user.email}</p>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-xl">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="rounded-xl btn-gradient px-4">Sign Up</Button>
              </Link>
            </div>
          )}

          <Button variant="ghost" size="icon" className="md:hidden rounded-xl" onClick={() => setMenuOpen((value) => !value)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-white/[0.06] bg-background/95 px-4 py-3 backdrop-blur-2xl md:hidden">
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
                    active ? "bg-primary/10 text-foreground border border-primary/20" : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon className={cn("h-4 w-4", active && "text-primary")} />
                  {item.label}
                </Link>
              )
            })}
            {session ? (
              <div className="mt-2 border-t border-white/[0.06] pt-2">
                <div className="flex items-center gap-3 px-4 py-2 mb-2">
                  <UserCircle className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground">{session.user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="mt-2 flex flex-col gap-2 pt-2 border-t border-white/[0.06]">
                <Link href="/login" className="flex items-center justify-center rounded-xl border border-white/[0.08] px-4 py-3 text-sm font-medium text-muted-foreground" onClick={() => setMenuOpen(false)}>
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
