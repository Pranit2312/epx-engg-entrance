"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Loader2, Crown } from "lucide-react"
import { cn } from "@/lib/utils"

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  username: string | null
  image: string | null
  city: string | null
  college: string | null
  averageScore: number
  averageAccuracy: number
  bestScore: number
  testsTaken: number
  isCurrentUser: boolean
}

export default function LeaderboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [currentUser, setCurrentUser] = useState<LeaderboardEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("all_time")
  const [filter, setFilter] = useState("global")

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (!session?.user?.id) return
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/leaderboard?period=${period}&filter=${filter}`)
        const data = await res.json()
        setEntries(data.entries || [])
        setCurrentUser(data.currentUser)
      } catch {
        setEntries([])
      }
      setLoading(false)
    }
    load()
  }, [session?.user?.id, period, filter])

  if (status === "loading") {
    return (
      <AppShell showRightPanel={false}>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
        </div>
      </AppShell>
    )
  }

  if (!session) return null

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-amber-400" />
    if (rank === 2) return <Medal className="h-4 w-4 text-slate-300" />
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />
    return null
  }

  return (
    <AppShell showRightPanel={false}>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Leaderboard</h1>
            <p className="text-sm text-muted-foreground">Top performers across the platform</p>
          </div>
          <div className="flex gap-2">
            <Select value={period} onValueChange={(v) => setPeriod(v ?? "all_time")}>
              <SelectTrigger className="h-9 w-[120px] border-border bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="all_time">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filter} onValueChange={(v) => setFilter(v ?? "global")}>
              <SelectTrigger className="h-9 w-[130px] border-border bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Global</SelectItem>
                <SelectItem value="city">My City</SelectItem>
                <SelectItem value="college">My College</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-16 text-center">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-violet-400/50" />
            <h3 className="text-lg font-semibold">No rankings yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Complete tests to appear on the leaderboard.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.userId}
                className={cn(
                  "flex items-center gap-4 rounded-2xl border p-4 transition-all",
                  entry.isCurrentUser
                    ? "border-violet-500/30 bg-violet-500/10"
                    : "border-border bg-card hover:border-border/80"
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-lg font-bold">
                  {rankIcon(entry.rank) || <span className="text-muted-foreground">{entry.rank}</span>}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={entry.image ?? undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-violet-600 to-blue-600 text-xs text-white">
                    {entry.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.city && entry.college
                      ? `${entry.city} · ${entry.college}`
                      : entry.city || entry.college || `${entry.testsTaken} tests`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{entry.averageScore}%</p>
                  <p className="text-xs text-muted-foreground">{entry.averageAccuracy}% accuracy</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentUser && !currentUser.isCurrentUser && (
          <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4">
            <p className="text-sm text-center">
              Your rank: <strong>#{currentUser.rank}</strong> · Avg Score: <strong>{currentUser.averageScore}%</strong>
            </p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
