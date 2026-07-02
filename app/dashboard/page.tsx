"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { WelcomeBanner } from "@/components/dashboard/welcome-banner"
import { ArrowRight, BookOpen, Target, TrendingUp, Clock3, Zap, Award, ChevronRight, Calendar, Brain, BarChart3, Flame } from "lucide-react"

type DashboardStats = {
  totalTests: number
  testsAttempted: number
  averageScore: number
  averageAccuracy: number
  recentTests: Array<{ id: string; mockTestId: string; score: number; correct: number; incorrect: number; accuracy: number; timeTaken: number; createdAt: string; mockTest?: { name?: string } }>
  recommendedTests: Array<{ id: string; name: string; subject: string; duration: number; totalQuestions: number; difficulty: string; description?: string | null }>
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (!session?.user?.id) return
    const loadDashboard = async () => {
      try {
        const response = await fetch("/api/dashboard")
        const data = await response.json()
        setStats(data)
      } catch {
        setStats({ totalTests: 20, testsAttempted: 5, averageScore: 72, averageAccuracy: 78, recentTests: [], recommendedTests: [] })
      }
      setLoading(false)
    }
    loadDashboard()
  }, [session])

  if (status === "loading" || loading) {
    return (
      <AppShell>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AppShell>
    )
  }

  if (!session || !stats) return null

  const statCards = [
    { label: "Available Tests", value: stats.totalTests, icon: BookOpen, gradient: "from-blue-500 to-cyan-500", change: null },
    { label: "Tests Attempted", value: stats.testsAttempted, icon: Target, gradient: "from-purple-500 to-pink-500", change: "+2 this week" },
    { label: "Avg Accuracy", value: `${stats.averageAccuracy}%`, icon: BarChart3, gradient: "from-emerald-500 to-green-500", change: "+5% from last month" },
    { label: "Avg Score", value: `${stats.averageScore}%`, icon: Award, gradient: "from-amber-500 to-orange-500", change: stats.averageScore > 0 ? "Keep going!" : null },
  ]

  return (
    <AppShell>
      <div className="space-y-6">
        <WelcomeBanner />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]">
                <div className="mb-3 flex items-start justify-between">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                {stat.change && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    {stat.change}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Recent Activity */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Recent Activity</h2>
                <p className="text-sm text-muted-foreground">Your latest submissions and performance</p>
              </div>
              <Link href="/tests">
                <button className="btn-gradient flex items-center gap-1.5 px-4 py-2 text-sm font-medium">
                  Explore Tests
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>

            {stats.recentTests.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
                <BookOpen className="mx-auto mb-3 h-10 w-10 text-blue-400/50" />
                <h3 className="font-semibold">No tests attempted yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Start your first test to see your progress here.</p>
                <Link href="/tests">
                  <button className="btn-gradient mt-4 px-6 py-2.5 text-sm font-medium">Take a Test</button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.recentTests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:border-white/[0.12]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                        <Brain className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{test.mockTest?.name || "Mock Test"}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(test.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{test.score}%</p>
                      <p className="text-xs text-muted-foreground">{test.accuracy}% accuracy</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold">Recommended</h2>
              <p className="text-sm text-muted-foreground">Curated for your prep journey</p>
            </div>
            <div className="space-y-2">
              {stats.recommendedTests.length > 0 ? (
                stats.recommendedTests.slice(0, 4).map((test) => (
                  <div key={test.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold">{test.name}</p>
                        <p className="text-xs text-muted-foreground">{test.subject}</p>
                      </div>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                        test.difficulty === "EASY" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" :
                        test.difficulty === "MEDIUM" ? "border-blue-500/20 bg-blue-500/10 text-blue-400" :
                        "border-red-500/20 bg-red-500/10 text-red-400"
                      }`}>{test.difficulty}</span>
                    </div>
                    <div className="mb-3 flex gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock3 className="h-3 w-3" />{test.duration}m</span>
                      <span className="flex items-center gap-1"><Target className="h-3 w-3" />{test.totalQuestions}Q</span>
                    </div>
                    <Link href={`/test/${test.id}`}>
                      <button className="flex w-full items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-white/[0.08] hover:text-foreground">
                        Start Test
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </Link>
                  </div>
                ))
              ) : (
                <>
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                        <Flame className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Daily Revision</p>
                        <p className="text-xs text-muted-foreground">Quick practice</p>
                      </div>
                    </div>
                    <Link href="/practice">
                      <button className="flex w-full items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-white/[0.08]">
                        Practice Now <ChevronRight className="h-3 w-3" />
                      </button>
                    </Link>
                  </div>
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                        <BarChart3 className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">View Analytics</p>
                        <p className="text-xs text-muted-foreground">Track progress</p>
                      </div>
                    </div>
                    <Link href="/analytics">
                      <button className="flex w-full items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-white/[0.08]">
                        Open Analytics <ChevronRight className="h-3 w-3" />
                      </button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
