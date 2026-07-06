"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { WelcomeBanner } from "@/components/dashboard/welcome-banner"
import { Loader2, TrendingUp, Target, BookOpen, Award, Calendar, ArrowUp, BarChart3, Brain } from "lucide-react"
import type { AnalyticsOverview } from "@/services/analytics-service"

const subjectGradients: Record<string, string> = {
  Physics: "from-blue-500 to-cyan-500",
  Chemistry: "from-purple-500 to-pink-500",
  Mathematics: "from-amber-500 to-orange-500",
}

const defaultGradient = "from-violet-500 to-blue-500"

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hrs > 0) return `${hrs}h ${mins}m`
  return `${mins}m`
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<AnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (!session?.user?.id) return
    const load = async () => {
      try {
        const res = await fetch("/api/analytics")
        const json = await res.json()
        setData(json)
      } catch {
        setData(null)
      }
      setLoading(false)
    }
    load()
  }, [session?.user?.id])

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

  const overview = data ?? {
    totalAttempts: 0,
    averageScore: 0,
    averageAccuracy: 0,
    bestScore: 0,
    bestTestName: null,
    totalTimeSpent: 0,
    subjectPerformance: [],
    scoreHistory: [],
    weakTopics: [],
    strongTopics: [],
  }

  const statCards = [
    { label: "Overall Accuracy", value: `${overview.averageAccuracy}%`, icon: Target, gradient: "from-blue-500 to-cyan-500", change: `${overview.totalAttempts} tests taken` },
    { label: "Tests Attempted", value: String(overview.totalAttempts), icon: BookOpen, gradient: "from-purple-500 to-pink-500", change: "All time" },
    { label: "Average Score", value: `${overview.averageScore}%`, icon: Award, gradient: "from-amber-500 to-orange-500", change: overview.bestScore > 0 ? `Best: ${overview.bestScore}%` : null },
    { label: "Time Spent", value: formatTime(overview.totalTimeSpent), icon: Calendar, gradient: "from-emerald-500 to-green-500", change: overview.bestTestName ? `Best: ${overview.bestTestName}` : null },
  ]

  return (
    <AppShell showRightPanel={false}>
      <div className="space-y-6">
        <WelcomeBanner />

        {/* Overall Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="relative overflow-hidden rounded-2xl border border-border bg-card p-5">
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.gradient} opacity-60`} />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                {stat.change && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-emerald-400">
                    <ArrowUp className="h-3 w-3" />{stat.change}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {/* Subject Analysis */}
          <div>
            <h2 className="mb-4 text-lg font-bold">Subject-wise Analysis</h2>
            {overview.subjectPerformance.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                No test data yet. Complete a test to see subject analysis.
              </div>
            ) : (
              <div className="space-y-3">
                {overview.subjectPerformance.map((subject) => {
                  const gradient = subjectGradients[subject.subject] || defaultGradient
                  return (
                    <div key={subject.subject} className="rounded-2xl border border-border bg-card p-4">
                      <div className="mb-3 flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${gradient}`}>
                          <Brain className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{subject.subject}</h3>
                            <span className="font-bold">{subject.averageScore}%</span>
                          </div>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted/50">
                            <div className={`h-full rounded-full bg-gradient-to-r ${gradient}`} style={{ width: `${subject.averageScore}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-6 text-sm">
                        <span className="text-muted-foreground">Attempts: <span className="font-semibold text-foreground">{subject.attempts}</span></span>
                        <span className="flex items-center gap-1 text-emerald-400">
                          Accuracy: {subject.averageAccuracy}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Score History */}
          <div>
            <h2 className="mb-4 text-lg font-bold">Score History</h2>
            <div className="rounded-2xl border border-border bg-card p-5">
              {overview.scoreHistory.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No scores yet.
                </div>
              ) : (
                <>
                  <div className="mb-4 flex h-[180px] items-end justify-between gap-3">
                    {overview.scoreHistory.slice(0, 7).map((item, idx) => (
                      <div key={idx} className="flex flex-1 flex-col items-center gap-2">
                        <span className="text-xs font-bold">{item.score}</span>
                        <div
                          className="w-full rounded-lg bg-gradient-to-t from-blue-500/80 via-purple-500/60 to-pink-500/40"
                          style={{ height: `${(item.score / 100) * 140}px` }}
                        />
                        <span className="text-[10px] text-muted-foreground">{item.date?.slice(5) || `#${idx + 1}`}</span>
                      </div>
                    ))}
                  </div>
                  <p className="flex items-center gap-2 border-t border-border pt-3 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    {overview.scoreHistory.length > 1 ? "Track your progress over time." : "Complete more tests to see trends."}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Recent Tests */}
        <div>
          <h2 className="mb-4 text-lg font-bold">Recent Test Performance</h2>
          {overview.scoreHistory.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
              No tests attempted yet.
            </div>
          ) : (
            <div className="space-y-2">
              {overview.scoreHistory.slice(0, 10).map((test, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15">
                      <Brain className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{test.testName}</h3>
                      <p className="text-xs text-muted-foreground">{test.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Score</p>
                    <p className="text-lg font-bold">{test.score}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
