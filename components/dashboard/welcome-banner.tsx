"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Trophy, TrendingUp, Flame } from "lucide-react"

type WelcomeStats = {
  testsAttempted: number
  averageScore: number
  bestScore: number
  bestTestName: string
  streak: number
}

export function WelcomeBanner() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<WelcomeStats>({
    testsAttempted: 12,
    averageScore: 72,
    bestScore: 92,
    bestTestName: "JEE Main Mock Test 5",
    streak: 7,
  })

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/dashboard")
        if (!response.ok) return
        const data = await response.json()
        const best = data.recentTests?.length
          ? data.recentTests.reduce(
              (max: { score: number; mockTest?: { name?: string } }, t: { score: number; mockTest?: { name?: string } }) =>
                t.score > max.score ? t : max,
              data.recentTests[0]
            )
          : null
        setStats({
          testsAttempted: data.testsAttempted || 0,
          averageScore: data.averageScore || 0,
          bestScore: best?.score || 0,
          bestTestName: best?.mockTest?.name || "No tests yet",
          streak: 7,
        })
      } catch {
        // keep defaults
      }
    }
    load()
  }, [])

  const firstName = session?.user?.name?.split(" ")[0] || "Student"

  const statItems = [
    {
      label: "Tests Attempted",
      value: String(stats.testsAttempted),
      sub: stats.testsAttempted > 0 ? "↑ 2 this week" : null,
      subColor: "text-emerald-400",
    },
    {
      label: "Average Score",
      value: `${stats.averageScore}%`,
      sub: stats.averageScore > 0 ? "↑ 8% improvement" : null,
      subColor: "text-emerald-400",
    },
    {
      label: "Best Score",
      value: stats.bestScore > 0 ? `${stats.bestScore}/100` : "—",
      sub: stats.bestTestName,
      subColor: "text-muted-foreground",
    },
    {
      label: "Current Streak",
      value: `${stats.streak} Days`,
      sub: null,
      subColor: "",
      icon: Flame,
    },
  ]

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-blue-900/40 via-indigo-900/30 to-violet-900/20 p-6">
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-[20%] h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ready to ace your next exam? Let&apos;s keep the momentum going!
          </p>
        </div>
        <div className="hidden shrink-0 sm:flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20">
          <Trophy className="h-8 w-8 text-blue-400" />
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statItems.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 backdrop-blur-sm"
          >
            <p className="text-[11px] text-muted-foreground">{item.label}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <p className="text-xl font-bold">{item.value}</p>
              {item.icon && <item.icon className="h-4 w-4 text-orange-400" />}
            </div>
            {item.sub && (
              <p className={`mt-0.5 text-[10px] flex items-center gap-0.5 ${item.subColor}`}>
                {item.subColor.includes("emerald") && <TrendingUp className="h-2.5 w-2.5" />}
                {item.sub}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
