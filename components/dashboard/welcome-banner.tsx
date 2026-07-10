"use client"

import { useEffect, useState } from "react"
import { Trophy, TrendingUp, Flame } from "lucide-react"
import { dedupFetch } from "@/lib/request-dedup"

type WelcomeStats = {
  testsAttempted: number
  averageScore: number
  bestScore: number
  bestTestName: string
  streak: number
}

type WelcomeBannerProps = {
  dashboardStats?: {
    testsAttempted: number
    averageScore: number
    averageAccuracy: number
    currentStreak?: number
    recentTests?: Array<{ score: number; mockTest?: { name?: string } }>
  } | null
}

export function WelcomeBanner({ dashboardStats }: WelcomeBannerProps) {
  const [stats, setStats] = useState<WelcomeStats>({
    testsAttempted: 0,
    averageScore: 0,
    bestScore: 0,
    bestTestName: "",
    streak: 0,
  })

  useEffect(() => {
    if (dashboardStats) {
      const best = dashboardStats.recentTests?.length
        ? dashboardStats.recentTests.reduce(
            (max, t) => (t.score > max.score ? t : max),
            dashboardStats.recentTests[0]
          )
        : null
      setStats({
        testsAttempted: dashboardStats.testsAttempted || 0,
        averageScore: dashboardStats.averageScore || 0,
        bestScore: best?.score || 0,
        bestTestName: best?.mockTest?.name || "",
        streak: dashboardStats.currentStreak ?? 0,
      })
      return
    }
    const load = async () => {
      try {
        const json = await dedupFetch("dashboard-banner", async () => {
          const response = await fetch("/api/dashboard")
          if (!response.ok) throw new Error("Failed")
          return response.json()
        })
        const data = json.success ? json.data : json
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
          bestTestName: best?.mockTest?.name || "",
          streak: data.currentStreak ?? 0,
        })
      } catch {
        // keep zeros
      }
    }
    load()
  }, [dashboardStats])

  const hasData = stats.testsAttempted > 0
  const statItems = [
    {
      label: "Tests Attempted",
      value: hasData ? String(stats.testsAttempted) : "—",
      sub: null,
      subColor: "",
    },
    {
      label: "Average Score",
      value: hasData ? `${stats.averageScore}%` : "—",
      sub: null,
      subColor: "",
    },
    {
      label: "Best Score",
      value: hasData && stats.bestScore > 0 ? `${stats.bestScore}/100` : "—",
      sub: hasData ? stats.bestTestName : null,
      subColor: "text-muted-foreground",
    },
    {
      label: "Current Streak",
      value: hasData ? `${stats.streak} ${stats.streak === 1 ? "Day" : "Days"}` : "—",
      sub: null,
      subColor: "",
      icon: hasData && stats.streak > 0 ? Flame : undefined,
    },
  ]

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-blue-900/40 via-indigo-900/30 to-violet-900/20 p-6">
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-[20%] h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back to EPX 🚀</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasData ? "Your AI-powered engineering exam preparation platform." : "Start your journey by taking a mock test."}
          </p>
        </div>
        <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 sm:flex">
          <Trophy className="h-8 w-8 text-blue-400" />
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statItems.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-muted px-4 py-3 backdrop-blur-sm"
          >
            <p className="text-[11px] text-muted-foreground">{item.label}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <p className="text-xl font-bold">{item.value}</p>
              {item.icon && <item.icon className="h-4 w-4 text-orange-400" />}
            </div>
            {item.sub && (
              <p className={`mt-0.5 flex items-center gap-0.5 text-[10px] ${item.subColor}`}>
                {item.sub}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
