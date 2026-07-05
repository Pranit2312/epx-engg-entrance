"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BookOpen, Brain, BarChart3, Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/tests", label: "Tests", icon: BookOpen },
  { href: "/practice", label: "Practice", icon: Brain },
  { href: "/analytics", label: "Stats", icon: BarChart3 },
  { href: "/bookmarks", label: "Saved", icon: Bookmark },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {links.map((link) => {
          const Icon = link.icon
          const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-all",
                active ? "text-violet-400" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-violet-400")} />
              {link.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
