"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Bell, Loader2, CheckCheck, ExternalLink, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  actionUrl: string | null
  createdAt: string
}

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (!session?.user?.id) return
    const load = async () => {
      try {
        const res = await fetch("/api/notifications")
        const data = await res.json()
        if (Array.isArray(data)) setNotifications(data)
      } catch {
        setNotifications([])
      }
      setLoading(false)
    }
    load()
  }, [session?.user?.id])

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    })
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read: true }),
    })
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  if (status === "loading" || loading) {
    return (
      <AppShell showRightPanel={false}>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
        </div>
      </AppShell>
    )
  }

  if (!session) return null

  return (
    <AppShell showRightPanel={false}>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" className="rounded-xl" onClick={markAllRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-16 text-center">
            <Bell className="mx-auto mb-4 h-12 w-12 text-violet-400/50" />
            <h3 className="text-lg font-semibold">No notifications</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You will see notifications here when you complete tests or receive updates.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-4 rounded-2xl border p-4 transition-all",
                  n.read
                    ? "border-border bg-card"
                    : "border-violet-500/20 bg-violet-500/5"
                )}
                onClick={() => !n.read && markRead(n.id)}
              >
                <div className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                  n.read ? "bg-muted" : "bg-violet-500/15"
                )}>
                  <Bell className={cn("h-4 w-4", n.read ? "text-muted-foreground" : "text-violet-400")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm", !n.read && "font-semibold")}>{n.title}</p>
                  {n.message && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                  )}
                  <p className="mt-1 text-[10px] text-muted-foreground/60">{timeAgo(n.createdAt)}</p>
                </div>
                {n.actionUrl && (
                  <Link href={n.actionUrl} className="shrink-0">
                    <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
